import react from '@vitejs/plugin-react';
import type { UserConfigExport } from 'vite';

export const reconfigurator = (config: UserConfigExport) => {
  return {
    ...config,
    plugins: [react()],
  };
};

export default reconfigurator;
