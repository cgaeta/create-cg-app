import prompts from 'prompts';
import minimist from 'minimist';

import { promptList, promptConfig, Responses } from './prompts.ts';
import { makeMeme } from './project.ts';

const meme = async () => {
  const args = minimist(process.argv.slice(2), {
    alias: {
      a: 'appStack',
      d: 'dir',
      ts: 'typescript',
      c: 'client',
      s: 'server',
      b: 'bundler',
      cl: 'feLibraries',
      sl: 'beLibraries',
    },
    boolean: 'typescript',
    string: 'bundler',
  });

  prompts.override(args);
  const response: Responses = await prompts(await promptList(), promptConfig);
  const madeMeme = makeMeme(response);

  await madeMeme('bundler');

  switch (response.appStack) {
    case 'fullstack':
      await madeMeme.client('client');
      await madeMeme.server('server');
      await madeMeme.server('server', 'client');
      await madeMeme('client', 'bundler');
      await madeMeme.client('feLibraries');
      await madeMeme.client('client', 'feLibraries');
      await madeMeme.server('beLibraries');
      await madeMeme.server('server', 'beLibraries');
      await madeMeme.combinePackages();

      break;
    case 'frontend':
      await madeMeme('client');
      await madeMeme('client', 'bundler');
      await madeMeme('feLibraries');
      await madeMeme('client', 'feLibraries');
      await madeMeme.combinePackages();

      break;
    case 'backend':
      await madeMeme('server');
      await madeMeme('beLibraries');
      await madeMeme('server', 'beLibraries');
      await madeMeme.combinePackages();

      break;
    default:
      throw Error('invalid appStack!');
  }

  console.log(process.env.npm_config_user_agent);
  console.log();
};

meme();
