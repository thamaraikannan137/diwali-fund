import { NextFunction, Request, Response } from 'express';
import { logger } from '../utils/logger';

export function requestLogger(req: Request, res: Response, next: NextFunction) {
  const started = Date.now();
  const { method } = req;
  const path = req.originalUrl || req.url;

  res.on('finish', () => {
    const ms = Date.now() - started;
    const status = res.statusCode;
    const meta = {
      method,
      path,
      status,
      ms,
      ip: req.ip,
    };

    if (status >= 500) {
      logger.error('HTTP request failed', meta);
    } else if (status >= 400) {
      logger.warn('HTTP request client error', meta);
    } else {
      logger.info('HTTP request', meta);
    }
  });

  next();
}
