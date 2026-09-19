import { createApp } from './app';
import { env } from './config/env';
import { connectDb } from './models';

async function main() {
  await connectDb();
  const app = createApp();
  app.listen(env.port, () => {
    console.log(`Diwali Fund API listening on http://localhost:${env.port}`);
  });
}

main().catch((err) => {
  console.error('Failed to start server', err);
  process.exit(1);
});
