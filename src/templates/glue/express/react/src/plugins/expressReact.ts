import { fileURLToPath } from 'node:url';
import { join } from 'node:path';
import { static as staticMiddleware, type Express } from 'express';

const plugin = (app: Express) => {
  if (process.env.development) return;

  app.use(
    staticMiddleware(join(fileURLToPath(import.meta.url), '../../../../dist'))
  );
};

export default plugin;
