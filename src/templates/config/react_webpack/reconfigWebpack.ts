import type { Configuration } from 'webpack';

export const reconfigurator = (config: Configuration): Configuration => {
  return {
    ...config,
    module: {
      rules: [
        {
          exclude: /(node_modules)/,
          test: /\.[tj]sx?$/,
          loader: 'babel-loader',
          options: {
            presets: [
              ['@babel/preset-env', { targets: 'defaults' }],
              '@babel/preset-react',
              '@babel/preset-typescript',
            ],
          },
        },
      ],
    },
  };
};

export default reconfigurator;
