import path from 'path';
import fs from 'fs';
import prisma from '../db';
import {
  generateNextCertificateId,
  generateSerialNumber,
  computeFingerprint,
  fingerprintMatches,
  buildVerificationUrl,
  buildQrPayload,
  buildBarcodePayload,
} from '../utils/certificateSecurity';
import { renderCertificatePdf } from './certificatePdfRenderer';
import { logger } from '../utils/logger';

const CERT_OUTPUT_DIR = path.join(__dirname, '../../uploads/certificates');
const ORG_NAME = process.env.ORGANIZATION_NAME || 'NewLMS Academy';

export class CertificateError extends Error {
  status: number;
  constructor(message: string, status = 400) {
    super(message);
    this.name = 'CertificateError';
    this.status = status;
  }
}

async function writeAuditLog(certificateId: string, action: string, actor: string | undefined, details?: string) {
  try {
    await prisma.certificateAuditLog.create({
      data: { certificateId, action, actor: actor || 'SYSTEM', details: details || undefined },
    });
  } catch (err) {
    // Audit logging must never break the primary flow, but failures are surfaced in server logs.
    logger.error('certificateService.writeAuditLog failed', { certificateId, action, error: (err as Error).message });
  }
}

/**
 * Issues a certificate for a passed exam result. Idempotent: calling this
 * repeatedly for the same exam result returns the already-issued certificate
 * instead of creating duplicates.
 */
export async function issueCertificateForExamResult(examResultId: string, createdBy: string) {
  const existing = await prisma.certificate.findUnique({ where: { examResultId } });
  if (existing) return existing;

  const examResult = await prisma.examResult.findUnique({
    where: { id: examResultId },
    include: {
      candidate: true,
      attempt: { include: { test: { include: { createdByHr: true } } } },
    },
  });

  if (!examResult) throw new CertificateError('Exam result not found.', 404);
  if (examResult.passFail !== 'PASS') {
    throw new CertificateError('Certificate can only be issued for a passed assessment.', 422);
  }

  const test = examResult.attempt?.test;
  const courseName = test?.title || 'Course Assessment';
  const trainer = test?.createdByHr;
  const trainerName = trainer?.name || 'Training Authority';
  const candidateName = examResult.candidate.name;
  const completionDate = examResult.submittedAt;
  const issueDate = new Date();

  const certificateId = await generateNextCertificateId(courseName, issueDate);
  const serialNumber = generateSerialNumber();
  const verificationUrl = buildVerificationUrl(certificateId);

  const fingerprint = computeFingerprint({
    certificateId,
    candidateName,
    courseName,
    trainerName,
    completionDate: completionDate.toISOString(),
    issueDate: issueDate.toISOString(),
    serialNumber,
  });

  const qrCodePayload = buildQrPayload(certificateId, verificationUrl, fingerprint);
  const barcodePayload = buildBarcodePayload(certificateId, fingerprint);

  const { filePath, fileName } = await renderCertificatePdf(
    {
      certificateId,
      serialNumber,
      candidateName,
      courseName,
      trainerName,
      organizationName: ORG_NAME,
      completionDate,
      issueDate,
      generatedTimestamp: issueDate,
      grade: gradeFromPercentage(examResult.percentage),
      scorePercentage: examResult.percentage,
      verificationUrl,
      qrPayload: qrCodePayload,
      barcodePayload,
    },
    CERT_OUTPUT_DIR
  );

  const certificate = await prisma.certificate.create({
    data: {
      certificateId,
      candidateId: examResult.candidateId,
      courseId: test?.id,
      courseName,
      trainerId: trainer?.id,
      trainerName,
      candidateName,
      organizationName: ORG_NAME,
      examResultId: examResult.id,
      grade: gradeFromPercentage(examResult.percentage),
      scorePercentage: examResult.percentage,
      completionDate,
      issueDate,
      serialNumber,
      generatedTimestamp: issueDate,
      fingerprint,
      verificationUrl,
      qrCodePayload,
      barcodePayload,
      pdfPath: filePath,
      pdfFileName: fileName,
      createdBy,
    },
  });

  await writeAuditLog(certificate.id, 'GENERATED', createdBy, `Certificate ${certificateId} generated for ${candidateName}.`);
  logger.info('Certificate issued', { certificateId, candidateId: examResult.candidateId });

  return certificate;
}

function gradeFromPercentage(percentage: number): string {
  if (percentage >= 90) return 'A+';
  if (percentage >= 80) return 'A';
  if (percentage >= 70) return 'B';
  if (percentage >= 60) return 'C';
  return 'D';
}

export async function getCertificatesForCandidate(candidateId: string) {
  return prisma.certificate.findMany({
    where: { candidateId },
    orderBy: { issueDate: 'desc' },
  });
}

export async function getCertificateOwnedBy(certificateDbId: string, candidateId: string) {
  const cert = await prisma.certificate.findUnique({ where: { id: certificateDbId } });
  if (!cert || cert.candidateId !== candidateId) return null;
  return cert;
}

/**
 * Ensures the certificate PDF exists on disk, regenerating it deterministically
 * from stored (immutable) data if the file was lost or removed.
 */
export async function ensureCertificateFile(certificate: { id: string; pdfPath: string | null }) {
  if (certificate.pdfPath && fs.existsSync(certificate.pdfPath)) return certificate.pdfPath;

  const full = await prisma.certificate.findUniqueOrThrow({ where: { id: certificate.id } });
  const { filePath } = await renderCertificatePdf(
    {
      certificateId: full.certificateId,
      serialNumber: full.serialNumber,
      candidateName: full.candidateName,
      courseName: full.courseName,
      trainerName: full.trainerName,
      organizationName: full.organizationName,
      completionDate: full.completionDate,
      issueDate: full.issueDate,
      generatedTimestamp: full.generatedTimestamp,
      grade: full.grade,
      scorePercentage: full.scorePercentage,
      verificationUrl: full.verificationUrl,
      qrPayload: full.qrCodePayload,
      barcodePayload: full.barcodePayload,
    },
    CERT_OUTPUT_DIR
  );

  await prisma.certificate.update({ where: { id: full.id }, data: { pdfPath: filePath } });
  return filePath;
}

export async function recordDownload(certificateDbId: string, downloadedBy: string | undefined, ip: string | undefined, userAgent: string | undefined) {
  const cert = await prisma.certificate.update({
    where: { id: certificateDbId },
    data: {
      downloadCount: { increment: 1 },
      lastDownloadedAt: new Date(),
    },
  });

  await prisma.certificateDownloadLog.create({
    data: { certificateId: certificateDbId, downloadedBy, ipAddress: ip, userAgent },
  });
  await writeAuditLog(certificateDbId, 'DOWNLOADED', downloadedBy, `Downloaded from IP ${ip || 'unknown'}.`);

  return cert;
}

export type VerificationResult = 'VALID' | 'INVALID' | 'TAMPERED' | 'NOT_FOUND' | 'REVOKED';

/**
 * Verifies a certificate by its public certificate ID. If a fingerprint /
 * short-code accompanies the request (e.g. scanned from the QR or barcode),
 * it is cross-checked against the server-side signed fingerprint; a mismatch
 * means the printed/encoded data was altered and the certificate is flagged
 * as tampered and marked invalid.
 */
export async function verifyCertificate(rawCertificateId: string, suppliedFingerprint: string | undefined, ip: string | undefined, userAgent: string | undefined) {
  const certificateId = (rawCertificateId || '').trim();

  const certificate = await prisma.certificate.findUnique({ where: { certificateId } });

  if (!certificate) {
    // We cannot attach a log to a non-existent certificate; log at the application level instead.
    logger.warn('Verification attempted for unknown certificate ID', { certificateId, ip });
    return { result: 'NOT_FOUND' as VerificationResult, certificate: null, reason: 'No certificate exists with this ID.' };
  }

  let result: VerificationResult = 'VALID';
  let reason: string | undefined;

  if (certificate.status === 'REVOKED') {
    result = 'REVOKED';
    reason = 'Certificate has been revoked by the issuing authority.';
  } else if (certificate.isTampered || certificate.status === 'INVALID') {
    result = 'TAMPERED';
    reason = certificate.tamperReason || 'Certificate content does not match issued records.';
  } else if (!fingerprintMatches(certificate.fingerprint, suppliedFingerprint)) {
    result = 'TAMPERED';
    reason = 'Fingerprint mismatch: the certificate data does not match the original issued record.';
    await prisma.certificate.update({
      where: { id: certificate.id },
      data: { status: 'INVALID', isTampered: true, tamperReason: reason },
    });
    await writeAuditLog(certificate.id, 'TAMPER_DETECTED', 'SYSTEM', reason);
    logger.warn('Certificate tamper detected', { certificateId, ip });
  }

  await prisma.certificate.update({
    where: { id: certificate.id },
    data: { verificationCount: { increment: 1 }, lastVerifiedAt: new Date() },
  });

  await prisma.certificateVerificationLog.create({
    data: {
      certificateId: certificate.id,
      requestedCertId: rawCertificateId,
      result,
      reason,
      ipAddress: ip,
      userAgent,
    },
  });
  await writeAuditLog(certificate.id, 'VERIFIED', 'PUBLIC', `Result: ${result}`);

  return { result, certificate, reason };
}

// ===================== ADMIN ANALYTICS =====================

export async function getDashboardStats() {
  const [total, verifiedTotal, revoked, tampered, downloadAgg, verificationAgg, failedVerifications] = await Promise.all([
    prisma.certificate.count(),
    prisma.certificate.count({ where: { verificationCount: { gt: 0 } } }),
    prisma.certificate.count({ where: { status: 'REVOKED' } }),
    prisma.certificate.count({ where: { isTampered: true } }),
    prisma.certificate.aggregate({ _sum: { downloadCount: true } }),
    prisma.certificate.aggregate({ _sum: { verificationCount: true } }),
    prisma.certificateVerificationLog.count({ where: { result: { in: ['TAMPERED', 'NOT_FOUND', 'REVOKED'] } } }),
  ]);

  return {
    totalCertificatesGenerated: total,
    totalCertificatesDownloaded: downloadAgg._sum.downloadCount || 0,
    totalVerificationAttempts: verificationAgg._sum.verificationCount || 0,
    certificatesWithAtLeastOneVerification: verifiedTotal,
    revokedCertificates: revoked,
    tamperedCertificates: tampered,
    failedVerificationAttempts: failedVerifications,
  };
}

export interface CertificateListFilters {
  search?: string;
  status?: string;
  courseId?: string;
  from?: string;
  to?: string;
  page?: number;
  pageSize?: number;
}

export async function listCertificates(filters: CertificateListFilters) {
  const page = Math.max(1, filters.page || 1);
  const pageSize = Math.min(100, Math.max(1, filters.pageSize || 20));

  const where: any = {};
  if (filters.status) where.status = filters.status;
  if (filters.courseId) where.courseId = filters.courseId;
  if (filters.from || filters.to) {
    where.issueDate = {};
    if (filters.from) where.issueDate.gte = new Date(filters.from);
    if (filters.to) where.issueDate.lte = new Date(filters.to);
  }
  if (filters.search) {
    const s = filters.search;
    where.OR = [
      { certificateId: { contains: s, mode: 'insensitive' } },
      { candidateName: { contains: s, mode: 'insensitive' } },
      { courseName: { contains: s, mode: 'insensitive' } },
      { serialNumber: { contains: s, mode: 'insensitive' } },
    ];
  }

  const [items, totalCount] = await Promise.all([
    prisma.certificate.findMany({
      where,
      orderBy: { issueDate: 'desc' },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.certificate.count({ where }),
  ]);

  return { items, totalCount, page, pageSize, totalPages: Math.ceil(totalCount / pageSize) };
}

export async function listVerificationLogs(certificateDbId: string | undefined, page = 1, pageSize = 20) {
  const where = certificateDbId ? { certificateId: certificateDbId } : {};
  const [items, totalCount] = await Promise.all([
    prisma.certificateVerificationLog.findMany({
      where,
      orderBy: { verifiedAt: 'desc' },
      skip: (page - 1) * pageSize,
      take: pageSize,
      include: { certificate: { select: { certificateId: true, candidateName: true } } },
    }),
    prisma.certificateVerificationLog.count({ where }),
  ]);
  return { items, totalCount, page, pageSize, totalPages: Math.ceil(totalCount / pageSize) };
}

export async function listDownloadLogs(certificateDbId: string | undefined, page = 1, pageSize = 20) {
  const where = certificateDbId ? { certificateId: certificateDbId } : {};
  const [items, totalCount] = await Promise.all([
    prisma.certificateDownloadLog.findMany({
      where,
      orderBy: { downloadedAt: 'desc' },
      skip: (page - 1) * pageSize,
      take: pageSize,
      include: { certificate: { select: { certificateId: true, candidateName: true } } },
    }),
    prisma.certificateDownloadLog.count({ where }),
  ]);
  return { items, totalCount, page, pageSize, totalPages: Math.ceil(totalCount / pageSize) };
}

export async function revokeCertificate(certificateDbId: string, actor: string, reason: string) {
  const cert = await prisma.certificate.update({
    where: { id: certificateDbId },
    data: { status: 'REVOKED', tamperReason: reason },
  });
  await writeAuditLog(certificateDbId, 'REVOKED', actor, reason);
  return cert;
}
