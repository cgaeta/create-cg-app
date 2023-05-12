import react from '@vitejs/plugin-react';

export const reconfigurator = (config) => {
  return {
    ...config,
    plugins: [react()],
  };
};

export default reconfigurator;
