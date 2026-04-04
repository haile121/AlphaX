import { Request, Response, NextFunction } from 'express';

export function errorHandler(err: any, _req: Request, res: Response, _next: NextFunction): void {
  console.error('[errorHandler]', err);
  const status = typeof err?.status === 'number' ? err.status : 500;
  const message = err?.message ?? 'Internal server error';
  res.status(status).json({ error: message });
}
