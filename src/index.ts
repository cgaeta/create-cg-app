import prompts from 'prompts';
import { resolve, join } from 'path';
import { readdir, mkdir, writeFile, stat, copyFile, access } from 'fs/promises';
import { fileURLToPath } from 'node:url';

const meme = async () => {
  const [fe, be, full] = await Promise.all([
    readdir(resolve(fileURLToPath(import.meta.url), '../templates/frontend')),
    readdir(resolve(fileURLToPath(import.meta.url), '../templates/backend')),
    readdir(resolve(fileURLToPath(import.meta.url), '../templates/fullstack')),
  ]);

  const response = await prompts([
    {
      type: 'select',
      name: 'stack',
      message: 'App time! Watcha building?',
      choices: [
        { title: 'Fullstack', value: 'fullstack' },
        { title: 'Frontend', value: 'frontend' },
        { title: 'Backend', value: 'backend' },
      ],
    },
    {
      type: 'text',
      name: 'dir',
      message: 'Where we putting this bad boy?',
      initial: 'cg_app',
    },
    {
      type: 'confirm',
      name: 'typescript',
      message: 'Using Typescript, right?',
      initial: true,
    },
    {
      type: (_p, value) =>
        ['frontend', 'fullstack'].includes(value.stack) ? 'select' : null,
      name: 'client',
      message: (prev, value) => {
        return `${!prev ? 'Disagreed. ' : ''}What ${
          value.stack === 'fullstack' ? 'frontend' : 'library'
        }?`;
      },
      choices: (_p, value) => {
        const templates = fe.concat(value.stack === 'fullstack' ? full : []);

        return templates.map((t) => ({
          value: t,
          title: t,
        }));
      },
    },
    {
      type: (_p, value) =>
        ['backend', 'fullstack'].includes(value.stack) &&
        !full.includes(value.client)
          ? 'select'
          : null,
      name: 'server',
      message: (_p, value) => {
        return `${!value.typescript ? 'Disagreed. ' : ''}What ${
          value.stack === 'fullstack' ? 'backend' : 'library'
        }?`;
      },
      choices: be.map((t) => ({
        value: t,
        title: t,
      })),
    },
  ]);

  const cwd = process.cwd();
  const root = join(cwd, response.dir);

  try {
    mkdir(root, { recursive: true });
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

  switch (response.stack) {
    case 'fullstack':
      const clientTemplateDir = join(
        fileURLToPath(import.meta.url),
        '../templates/frontend',
        response.client
      );
      // console.log(join(root, 'client'));
      await mkdir(join(root, 'client'));
      const clientFiles = await readdir(clientTemplateDir);
      for (const file of clientFiles.filter(
        (f) => f !== 'package.json' && f !== 'node_modules'
      )) {
        await write(clientTemplateDir, join(root, 'client'), file);
      }

      const serverTemplateDir = join(
        fileURLToPath(import.meta.url),
        '../templates/backend',
        response.server
      );
      await mkdir(join(root, 'server'));
      const serverFiles = await readdir(serverTemplateDir);
      for (const file of serverFiles.filter((f) => f !== 'package.json')) {
        await write(serverTemplateDir, join(root, 'server'), file);
      }

      break;
    case 'frontend':
      const feTemplateDir = join(
        fileURLToPath(import.meta.url),
        '../templates/frontend',
        response.client
      );
      const feFiles = await readdir(feTemplateDir);
      for (const file of feFiles.filter((f) => f !== 'package.json')) {
        await write(feTemplateDir, root, file);
      }
      break;
    case 'backend':
      const beTemplateDir = join(
        fileURLToPath(import.meta.url),
        '../templates/frontend',
        response.client
      );
      const beFiles = await readdir(beTemplateDir);
      for (const file of beFiles.filter((f) => f !== 'package.json')) {
        await write(beTemplateDir, root, file);
      }
      break;
    default:
      throw Error('invalid stack!');
  }

  console.log(process.env.npm_config_user_agent);
  console.log();
};

meme();
