import prompts from 'prompts';
import minimist from 'minimist';
import { resolve, join } from 'path';
import {
  readdir,
  mkdir,
  readFile,
  writeFile,
  stat,
  copyFile,
  access,
} from 'fs/promises';
import { fileURLToPath } from 'node:url';

import {
  getTemplates,
  stackPrompt,
  dirPrompt,
  tsPrompt,
  bundlerPrompt,
  frontendPrompt,
  backendPrompt,
} from './prompts.ts';

const templatesDir = join(fileURLToPath(import.meta.url), '../templates');
const getTemplate = (collection: string, target: string) =>
  join(templatesDir, collection, target);

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

  const write = async (
    templateDir: string,
    targetDir: string,
    file: string
  ) => {
    const targetPath = join(targetDir, file);
    // writeFile(targetPath)
    if (['package.json', 'node_modules'].includes(file)) return;
    await copy(join(templateDir, file), targetPath);
  };

  const copy = async (src: string, dest: string) => {
    const fileStat = await stat(src);
    console.log(src, fileStat.isDirectory());
    await (fileStat.isDirectory() ? copyDir(src, dest) : copyFile(src, dest));
  };

  const copyDir = async (srcDir: string, destDir: string) => {
    await mkdir(destDir, { recursive: true });
    for (const file of await readdir(srcDir)) {
      const srcFile = resolve(srcDir, file);
      const destFile = resolve(destDir, file);
      await copy(srcFile, destFile);
    }
  };
  const bundlerTemplateDir = getTemplate('bundler', response.bundler ?? '');
  const bundlerFiles = response.bundler
    ? await readdir(bundlerTemplateDir)
    : [];

  switch (response.appStack) {
    case 'fullstack':
      const clientTemplateDir = getTemplate('frontend', response.client);
      await mkdir(join(root, 'client'));
      const clientFiles = await readdir(clientTemplateDir);
      for (const file of clientFiles) {
        await write(clientTemplateDir, join(root, 'client'), file);
      }

      const clientPkgFile = await readFile(
        join(clientTemplateDir, 'package.json'),
        'utf-8'
      );
      const clientPkg = JSON.parse(clientPkgFile);

      for (const file of bundlerFiles) {
        await write(bundlerTemplateDir, join(root, 'client'), file);
      }

      const bundlerPkgFile = await readFile(
        join(bundlerTemplateDir, 'package.json'),
        'utf-8'
      );
      const bundlerPkg = JSON.parse(bundlerPkgFile);

      const serverTemplateDir = getTemplate('backend', response.server);
      await mkdir(join(root, 'server'));
      const serverFiles = await readdir(serverTemplateDir);
      for (const file of serverFiles) {
        await write(serverTemplateDir, join(root, 'server'), file);
      }

      const serverPgkFile = await readFile(
        join(serverTemplateDir, 'package.json'),
        'utf8'
      );
      const serverPkg = JSON.parse(serverPgkFile);

      const combinedPkg = Object.assign({}, clientPkg, bundlerPkg, serverPkg, {
        name: response.dir,
        version: '0.0.0',
        type: 'module',
        scripts: Object.assign(
          {},
          clientPkg.scripts,
          bundlerPkg.scripts,
          serverPkg.scripts
        ),
        dependencies: Object.assign(
          {},
          clientPkg.dependencies,
          bundlerPkg.dependencies,
          serverPkg.dependencies
        ),
        devDependencies: Object.assign(
          {},
          clientPkg.devDependencies,
          bundlerPkg.devDependencies,
          serverPkg.devDependencies
        ),
      });
      await writeFile(
        join(root, 'package.json'),
        JSON.stringify(combinedPkg, undefined, 2)
      );
      console.log(combinedPkg);

      break;
    case 'frontend':
      const feTemplateDir = getTemplate('frontend', response.client);
      const feFiles = await readdir(feTemplateDir);
      for (const file of feFiles) {
        await write(feTemplateDir, root, file);
      }

      for (const file of bundlerFiles) {
        await write(bundlerTemplateDir, root, file);
      }

      break;
    case 'backend':
      const beTemplateDir = getTemplate('backend', response.client);
      const beFiles = await readdir(beTemplateDir);
      for (const file of beFiles) {
        await write(beTemplateDir, root, file);
      }
      break;
    default:
      throw Error('invalid appStack!');
  }

  console.log(process.env.npm_config_user_agent);
  console.log();
};

meme();
