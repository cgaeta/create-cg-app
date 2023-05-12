import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import HtmlWebpackPlugin from 'html-webpack-plugin';

import type { Configuration } from 'webpack';

const getReconfig = () => {
  try {
    // @ts-ignore: might be added on scaffold
    return import('./reconfigWebpack');
  } catch (_) {
    return null;
  }
};

const baseConfig: Configuration = {
  mode: 'development',
  entry: resolve(fileURLToPath(import.meta.url), '../client/src/index.tsx'),
  output: {
    path: resolve(fileURLToPath(import.meta.url), '../dist'),
    filename: 'index.js',
    clean: true,
  },
  plugins: [
    new HtmlWebpackPlugin({
      title: 'Webpack Bundled App',
      templateContent: ({ htmlWebpackPlugin }) => `
      <html>
      <head>
      <title>${htmlWebpackPlugin.options.title}</title>
      </head>
      <body>
      <div id="root"></div>
      ${htmlWebpackPlugin.tags.bodyTags}
      </body>
      </html>
      `,
      meta: {},
      hash: false,
    }),
  ],
  resolve: {
    extensions: ['.js', '.jsx', '.ts', '.tsx'],
  },
};

const reconfig = await getReconfig();
const config = reconfig ? reconfig(baseConfig) : baseConfig;

export default config;
