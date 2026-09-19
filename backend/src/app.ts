import express from 'express';
import cors from 'cors';
import routes from './routes';
import { errorHandler, notFound } from './middleware/error';

export function createApp() {
  const app = express();
  app.use(cors());
  app.use(express.json());

  app.use('/api', routes);
  app.use(notFound);
  app.use(errorHandler);

  return app;
}
