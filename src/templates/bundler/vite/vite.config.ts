import { fileURLToPath } from 'node:url';
import { join } from 'node:path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig((_) => {
  return {
    root: join(fileURLToPath(import.meta.url), '..'),
    plugins: [react()],
  };
});
