import express from 'express';
import cors from 'cors';
import routes from './routes';
import { errorHandler, notFound } from './middleware/error';
import { requestLogger } from './middleware/requestLogger';

export function createApp() {
  const app = express();
  app.use(cors());
  app.use(express.json());
  app.use(requestLogger);

  app.use('/api', routes);
  app.use(notFound);
  app.use(errorHandler);

  return app;
}
