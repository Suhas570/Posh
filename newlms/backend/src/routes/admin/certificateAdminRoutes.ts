import { Router, Response } from 'express';
import { authenticateToken, AuthenticatedRequest, roleGuard } from '../../auth_middleware';
import {
  getDashboardStats,
  listCertificates,
  listVerificationLogs,
  listDownloadLogs,
  revokeCertificate,
  issueCertificateForExamResult,
} from '../../services/certificateService';
import prisma from '../../db';
import { logger } from '../../utils/logger';

const router = Router();

// Every route below is restricted to authenticated HR (admin/trainer) users.
router.use(authenticateToken);
router.use(roleGuard('HR'));

// GET /api/admin/certificates/stats - dashboard summary numbers
router.get('/stats', async (_req: AuthenticatedRequest, res: Response) => {
  try {
    const stats = await getDashboardStats();
    return res.status(200).json(stats);
  } catch (err) {
    logger.error('Failed to load certificate dashboard stats', { error: (err as Error).message });
    return res.status(500).json({ message: 'Failed to load certificate statistics.' });
  }
});

// GET /api/admin/certificates - search + filter + paginate all certificates
router.get('/', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { search, status, courseId, from, to, page, pageSize } = req.query;
    const data = await listCertificates({
      search: typeof search === 'string' ? search : undefined,
      status: typeof status === 'string' ? status : undefined,
      courseId: typeof courseId === 'string' ? courseId : undefined,
      from: typeof from === 'string' ? from : undefined,
      to: typeof to === 'string' ? to : undefined,
      page: page ? Number(page) : undefined,
      pageSize: pageSize ? Number(pageSize) : undefined,
    });
    return res.status(200).json(data);
  } catch (err) {
    logger.error('Failed to list certificates', { error: (err as Error).message });
    return res.status(500).json({ message: 'Failed to load certificates.' });
  }
});

// GET /api/admin/certificates/verification-logs
router.get('/verification-logs', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { certificateId, page, pageSize } = req.query;
    const data = await listVerificationLogs(
      typeof certificateId === 'string' ? certificateId : undefined,
      page ? Number(page) : 1,
      pageSize ? Number(pageSize) : 20
    );
    return res.status(200).json(data);
  } catch (err) {
    logger.error('Failed to load verification logs', { error: (err as Error).message });
    return res.status(500).json({ message: 'Failed to load verification logs.' });
  }
});

// GET /api/admin/certificates/download-logs
router.get('/download-logs', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { certificateId, page, pageSize } = req.query;
    const data = await listDownloadLogs(
      typeof certificateId === 'string' ? certificateId : undefined,
      page ? Number(page) : 1,
      pageSize ? Number(pageSize) : 20
    );
    return res.status(200).json(data);
  } catch (err) {
    logger.error('Failed to load download logs', { error: (err as Error).message });
    return res.status(500).json({ message: 'Failed to load download logs.' });
  }
});

// GET /api/admin/certificates/:id - full detail incl. audit trail
router.get('/:id', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const certificate = await prisma.certificate.findUnique({
      where: { id: req.params.id },
      include: {
        auditLogs: { orderBy: { createdAt: 'desc' }, take: 50 },
        verificationLogs: { orderBy: { verifiedAt: 'desc' }, take: 20 },
        downloadLogs: { orderBy: { downloadedAt: 'desc' }, take: 20 },
      },
    });
    if (!certificate) return res.status(404).json({ message: 'Certificate not found.' });
    return res.status(200).json({ certificate });
  } catch (err) {
    logger.error('Failed to load certificate detail', { error: (err as Error).message });
    return res.status(500).json({ message: 'Failed to load certificate.' });
  }
});

// POST /api/admin/certificates/generate/:examResultId - manually (re)trigger issuance, e.g. for a backfilled result
router.post('/generate/:examResultId', async (req: AuthenticatedRequest, res: Response) => {
  const actor = req.user?.id || 'HR';
  try {
    const certificate = await issueCertificateForExamResult(req.params.examResultId, actor);
    return res.status(201).json({ certificate });
  } catch (err: any) {
    const status = err?.status || 500;
    logger.error('Manual certificate generation failed', { examResultId: req.params.examResultId, error: err.message });
    return res.status(status).json({ message: err.message || 'Failed to generate certificate.' });
  }
});

// PUT /api/admin/certificates/:id/revoke - revoke a certificate (e.g. academic misconduct found later)
router.put('/:id/revoke', async (req: AuthenticatedRequest, res: Response) => {
  const actor = req.user?.id || 'HR';
  const { reason } = req.body;
  if (!reason || typeof reason !== 'string' || reason.trim().length < 3) {
    return res.status(400).json({ message: 'A revocation reason is required.' });
  }

  try {
    const certificate = await revokeCertificate(req.params.id, actor, reason.trim());
    return res.status(200).json({ certificate });
  } catch (err) {
    logger.error('Certificate revocation failed', { error: (err as Error).message });
    return res.status(500).json({ message: 'Failed to revoke certificate.' });
  }
});

export default router;
