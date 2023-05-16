import { join } from 'node:path';
import { readdir } from 'fs/promises';
import { fileURLToPath } from 'url';
import express from 'express';

const app = express();
const port = 3000;

const pluginsPath = join(fileURLToPath(import.meta.url), '../plugins');
const plugins = await readdir(pluginsPath);
for (const p of plugins) {
  if (!p.startsWith('express')) {
    continue;
  }
  const plugin = (await import(`./plugins/${p}`)).default as (
    a: typeof app
  ) => void;
  await plugin(app);
}

app.listen(port, () => {
  console.log(`Express server listening on port ${port}`);
});
