import prompts from 'prompts';
import minimist from 'minimist';
import { join } from 'path';
import { mkdir } from 'fs/promises';

import { getTemplates } from './templates';
import { copyTemplate, getAndCombinePackages } from './files.ts';

import {
  stackPrompt,
  dirPrompt,
  tsPrompt,
  bundlerPrompt,
  frontendPrompt,
  backendPrompt,
} from './prompts.ts';

const meme = async () => {
  const [fe, be, full, bundler] = await getTemplates();

  const args = minimist(process.argv.slice(2), {
    alias: {
      a: 'appStack',
      d: 'dir',
      ts: 'typescript',
      c: 'client',
      s: 'server',
      b: 'bundler',
    },
    boolean: 'typescript',
    string: 'bundler',
  });

  prompts.override(args);
  const response = await prompts([
    stackPrompt,
    dirPrompt,
    tsPrompt,
    bundlerPrompt(bundler),
    frontendPrompt(fe, full),
    backendPrompt(be, full),
  ]);

  const cwd = process.cwd();
  const root = join(cwd, response.dir);

  try {
    await mkdir(root, { recursive: true });
  } catch (err) {
    throw Error('root dir alrady exists!');
  }

  await copyTemplate(root, 'bundler', response.bundler);

  switch (response.appStack) {
    case 'fullstack':
      await copyTemplate(root, 'frontend', response.client, 'client');
      await copyTemplate(root, 'backend', response.server, 'server');

      await getAndCombinePackages(
        root,
        response.dir,
        ['frontend', response.client],
        ['bundler', response.bundler],
        ['backend', response.server]
      );

      break;
    case 'frontend':
      await copyTemplate(root, 'frontend', response.client);
      await getAndCombinePackages(
        root,
        response.dir,
        ['frontend', response.client],
        ['backend', response.server]
      );

      break;
    case 'backend':
      await copyTemplate(root, 'backend', response.server);
      await getAndCombinePackages(
        root,
        response.dir,
        ['backend', response.server],
        ['bundler', response.bundler]
      );

      break;
    default:
      throw Error('invalid appStack!');
  }

  console.log(process.env.npm_config_user_agent);
  console.log();
};

meme();
