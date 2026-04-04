import { Router, Request, Response } from 'express';
import { authenticate } from '../../middleware/authenticate';
import {
  generateCertificate,
  getCertificates,
  verifyCertificate,
  generateTrackCertificate,
  getTrackCertificates,
  type TrackKind,
} from './certificates.service';

const router = Router();

router.get('/', authenticate, async (req: Request, res: Response) => {
  const certificates = await getCertificates(req.user!.sub);
  const trackCertificates = await getTrackCertificates(req.user!.sub);
  return res.json({ certificates, trackCertificates });
});

router.post('/track/:track/generate', authenticate, async (req: Request, res: Response) => {
  const track = req.params.track as TrackKind;
  if (track !== 'cpp' && track !== 'web') {
    return res.status(400).json({ error: 'Invalid track' });
  }
  try {
    const certificate = await generateTrackCertificate(req.user!.sub, track);
    return res.json({ certificate });
  } catch (err: unknown) {
    const e = err as { code?: string; message?: string };
    if (e.code === 'TRACK_NOT_ELIGIBLE') return res.status(403).json({ error: e.message });
    if (e.code === 'TRACK_CERTS_TABLE_MISSING') return res.status(503).json({ error: e.message });
    return res.status(500).json({ error: 'Failed to generate certificate' });
  }
});

router.post('/:levelId/generate', authenticate, async (req: Request, res: Response) => {
  try {
    const cert = await generateCertificate(req.user!.sub, req.params.levelId);
    return res.json({ certificate: cert });
  } catch (err: unknown) {
    const e = err as { code?: string; message?: string };
    if (e.code === 'LEVEL_NOT_COMPLETED') return res.status(403).json({ error: e.message });
    return res.status(500).json({ error: 'Failed to generate certificate' });
  }
});

// Public — no auth required
router.get('/verify/:code', async (req: Request, res: Response) => {
  const result = await verifyCertificate(req.params.code);
  if (!result) return res.status(404).json({ error: 'Certificate not found' });
  return res.json(result);
});

export default router;
