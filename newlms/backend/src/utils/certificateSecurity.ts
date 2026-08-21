import crypto from 'crypto';
import prisma from '../db';

/**
 * Certificate security utilities.
 *
 * These helpers are intentionally kept dependency-free (pure Node crypto)
 * so the integrity logic never depends on the PDF rendering pipeline and
 * can be unit tested in isolation.
 */

const CERT_SECRET = process.env.CERT_SECRET || 'change-this-certificate-signing-secret-in-production';

/** Turns a free-text course/test name into a short A-Z category code, e.g. "Java Fundamentals" -> "JAVA". */
export function categoryCodeFromCourseName(courseName: string): string {
  const cleaned = (courseName || 'GEN').toUpperCase().replace(/[^A-Z0-9]/g, ' ').trim();
  const firstWord = cleaned.split(/\s+/)[0] || 'GEN';
  return firstWord.slice(0, 8) || 'GEN';
}

/**
 * Atomically generates the next sequential certificate ID for a given
 * year + category, e.g. LMS-2026-JAVA-000001. Uses a dedicated counter
 * collection so concurrent certificate generation never collides.
 */
export async function generateNextCertificateId(courseName: string, issueDate: Date): Promise<string> {
  const year = issueDate.getFullYear();
  const category = categoryCodeFromCourseName(courseName);

  const sequence = await prisma.certificateSequence.upsert({
    where: { year_category: { year, category } },
    create: { year, category, lastValue: 1 },
    update: { lastValue: { increment: 1 } },
  });

  const padded = String(sequence.lastValue).padStart(6, '0');
  return `LMS-${year}-${category}-${padded}`;
}

/** Generates a human-friendly, globally unique serial number distinct from the certificate ID. */
export function generateSerialNumber(): string {
  const rand = crypto.randomBytes(5).toString('hex').toUpperCase();
  const ts = Date.now().toString(36).toUpperCase();
  return `SN-${ts}-${rand}`;
}

export interface CertificateCoreFields {
  certificateId: string;
  candidateName: string;
  courseName: string;
  trainerName: string;
  completionDate: string; // ISO date string
  issueDate: string; // ISO date string
  serialNumber: string;
}

/**
 * Builds a canonical, deterministic string representation of the fields
 * that must never change after issuance. Field order and formatting are
 * fixed so the same inputs always produce the same fingerprint.
 */
function canonicalize(fields: CertificateCoreFields): string {
  return [
    fields.certificateId.trim(),
    fields.candidateName.trim().toLowerCase(),
    fields.courseName.trim().toLowerCase(),
    fields.trainerName.trim().toLowerCase(),
    fields.completionDate,
    fields.issueDate,
    fields.serialNumber.trim(),
  ].join('|');
}

/**
 * Produces an HMAC-SHA256 fingerprint of the certificate's core fields,
 * signed with a server-side secret. Because the secret never leaves the
 * server, nobody can forge a matching fingerprint for tampered data.
 */
export function computeFingerprint(fields: CertificateCoreFields): string {
  return crypto.createHmac('sha256', CERT_SECRET).update(canonicalize(fields)).digest('hex');
}

/** Short, URL-safe fragment of the fingerprint embedded in the QR/barcode payload for fast tamper checks. */
export function fingerprintShortCode(fingerprint: string): string {
  return fingerprint.slice(0, 16);
}

/** Verifies whether a supplied fingerprint (or short code) matches the stored, authoritative fingerprint. */
export function fingerprintMatches(storedFingerprint: string, suppliedFingerprintOrShortCode: string | undefined | null): boolean {
  if (!suppliedFingerprintOrShortCode) return true; // no fingerprint presented (e.g. manual ID lookup) - not a tamper signal by itself
  const supplied = suppliedFingerprintOrShortCode.trim();
  if (supplied.length >= 64) {
    return timingSafeEqual(storedFingerprint, supplied);
  }
  return timingSafeEqual(fingerprintShortCode(storedFingerprint), supplied);
}

function timingSafeEqual(a: string, b: string): boolean {
  const bufA = Buffer.from(a, 'utf8');
  const bufB = Buffer.from(b, 'utf8');
  if (bufA.length !== bufB.length) return false;
  return crypto.timingSafeEqual(bufA, bufB);
}

export function buildVerificationUrl(certificateId: string): string {
  const base = (process.env.CERT_VERIFY_BASE_URL || 'http://localhost:5173/verify-certificate').replace(/\/$/, '');
  return `${base}/${encodeURIComponent(certificateId)}`;
}

/** Payload encoded inside the QR code: verification URL plus a short fingerprint code for tamper detection. */
export function buildQrPayload(certificateId: string, verificationUrl: string, fingerprint: string): string {
  const url = new URL(verificationUrl);
  url.searchParams.set('cid', certificateId);
  url.searchParams.set('fp', fingerprintShortCode(fingerprint));
  return url.toString();
}

/** Payload encoded inside the Code128 barcode. Kept compact: certificate ID + short fingerprint code. */
export function buildBarcodePayload(certificateId: string, fingerprint: string): string {
  return `${certificateId}|${fingerprintShortCode(fingerprint)}`;
}
