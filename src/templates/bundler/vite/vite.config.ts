import { fileURLToPath } from 'node:url';
import { join } from 'node:path';
import { defineConfig } from 'vite';

const getReconfig = () => {
  try {
    // @ts-ignore: might be added on scaffold
    return import('./reconfigVite.ts');
  } catch (err) {
    return null;
  }
};

export default defineConfig(async (_) => {
  const reconfig = ((await getReconfig()) ?? {}).default;
  const baseConfig = {
    root: join(fileURLToPath(import.meta.url), '..'),
    resolve: {
      alias: {
        '@client': join(fileURLToPath(import.meta.url), '../client'),
        '@server': join(fileURLToPath(import.meta.url), '../server'),
      },
    },
  };

  return reconfig ? reconfig(baseConfig) : baseConfig;
});
