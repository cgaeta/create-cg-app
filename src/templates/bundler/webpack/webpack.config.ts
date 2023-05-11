import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import HtmlWebpackPlugin from 'html-webpack-plugin';

import type { Configuration } from 'webpack';

const config: Configuration = {
  mode: 'development',
  entry: resolve(fileURLToPath(import.meta.url), '../client/src/index.tsx'),
  output: {
    path: resolve(fileURLToPath(import.meta.url), 'dist'),
    filename: 'index.js',
    clean: true,
  },
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

export default config;
