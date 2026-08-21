import { Router, Response } from 'express';
import { authenticateToken, AuthenticatedRequest, roleGuard } from '../../auth_middleware';
import {
  getCertificatesForCandidate,
  getCertificateOwnedBy,
  ensureCertificateFile,
  recordDownload,
} from '../../services/certificateService';
import { logger } from '../../utils/logger';

const router = Router();

router.use(authenticateToken);
router.use(roleGuard('CANDIDATE'));

// GET /api/certificates/my - list every certificate earned by the logged-in candidate
router.get('/my', async (req: AuthenticatedRequest, res: Response) => {
  const candidateId = req.user?.id;
  if (!candidateId) return res.status(401).json({ message: 'User context not found.' });

  try {
    const certificates = await getCertificatesForCandidate(candidateId);
    return res.status(200).json({ certificates });
  } catch (err) {
    logger.error('Failed to list candidate certificates', { error: (err as Error).message });
    return res.status(500).json({ message: 'Failed to load certificates.' });
  }
});

// GET /api/certificates/:id - certificate detail (must belong to the requesting candidate)
router.get('/:id', async (req: AuthenticatedRequest, res: Response) => {
  const candidateId = req.user?.id;
  if (!candidateId) return res.status(401).json({ message: 'User context not found.' });

  try {
    const certificate = await getCertificateOwnedBy(req.params.id, candidateId);
    if (!certificate) return res.status(404).json({ message: 'Certificate not found.' });
    return res.status(200).json({ certificate });
  } catch (err) {
    logger.error('Failed to fetch certificate', { error: (err as Error).message });
    return res.status(500).json({ message: 'Failed to load certificate.' });
  }
});

// GET /api/certificates/:id/download - streams the certificate PDF and records a download log entry
router.get('/:id/download', async (req: AuthenticatedRequest, res: Response) => {
  const candidateId = req.user?.id;
  if (!candidateId) return res.status(401).json({ message: 'User context not found.' });

  try {
    const certificate = await getCertificateOwnedBy(req.params.id, candidateId);
    if (!certificate) return res.status(404).json({ message: 'Certificate not found.' });

    const filePath = await ensureCertificateFile(certificate);
    await recordDownload(certificate.id, candidateId, req.ip, req.headers['user-agent'] as string);

    return res.download(filePath, certificate.pdfFileName || `${certificate.certificateId}.pdf`);
  } catch (err) {
    logger.error('Certificate download failed', { error: (err as Error).message });
    return res.status(500).json({ message: 'Failed to download certificate.' });
  }
});

export default router;
