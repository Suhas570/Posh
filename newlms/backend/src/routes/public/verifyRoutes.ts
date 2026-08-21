import { Router, Request, Response } from 'express';
import { verifyCertificate } from '../../services/certificateService';
import { logger } from '../../utils/logger';

const router = Router();

/**
 * Public, unauthenticated certificate verification endpoint. This is the
 * page reached when scanning a certificate's QR code or barcode, or when
 * a verifier manually enters a certificate ID.
 *
 * GET /api/verify/:certificateId?fp=<shortFingerprintCode>
 */
router.get('/:certificateId', async (req: Request, res: Response) => {
  const { certificateId } = req.params;
  const fingerprint = typeof req.query.fp === 'string' ? req.query.fp : undefined;

  if (!certificateId || certificateId.trim().length === 0) {
    return res.status(400).json({ message: 'A certificate ID is required.' });
  }

  try {
    const { result, certificate, reason } = await verifyCertificate(
      certificateId,
      fingerprint,
      req.ip,
      req.headers['user-agent'] as string
    );

    if (!certificate) {
      return res.status(404).json({
        status: result,
        valid: false,
        message: reason || 'No certificate exists with this ID.',
      });
    }

    return res.status(200).json({
      status: result,
      valid: result === 'VALID',
      message: reason || 'This certificate is valid and was issued by the organization.',
      certificate: {
        certificateId: certificate.certificateId,
        candidateName: certificate.candidateName,
        courseName: certificate.courseName,
        trainerName: certificate.trainerName,
        organizationName: certificate.organizationName,
        completionDate: certificate.completionDate,
        issueDate: certificate.issueDate,
        serialNumber: certificate.serialNumber,
        grade: certificate.grade,
        scorePercentage: certificate.scorePercentage,
        status: certificate.status,
        verificationCount: certificate.verificationCount,
      },
    });
  } catch (err) {
    logger.error('Certificate verification failed', { certificateId, error: (err as Error).message });
    return res.status(500).json({ message: 'Verification failed due to a server error.' });
  }
});

export default router;
