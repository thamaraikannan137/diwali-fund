import { createApp } from './app';
import { env } from './config/env';
import { connectDb } from './models';
import { logger } from './utils/logger';

async function main() {
  await connectDb();
  logger.info('Database connected');
  const app = createApp();
  app.listen(env.port, () => {
    logger.info(`Diwali Fund API listening on http://localhost:${env.port}`, {
      env: env.nodeEnv,
    });
  });
}

main().catch((err) => {
  logger.error('Failed to start server', err);
  process.exit(1);
});
