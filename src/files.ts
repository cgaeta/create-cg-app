import { join, sep } from 'node:path';
import {
  mkdir,
  readdir,
  stat,
  copyFile,
  readFile,
  writeFile,
} from 'fs/promises';
import type { PackageJson } from 'type-fest';

import { getTemplate, type TemplateGroups } from './templates';

class FsError extends Error {
  code?: string;
}

export const write = async (
  templateDir: string,
  targetDir: string,
  file: string
) => {
  const targetPath = join(targetDir, file);
  if (
    ['package.json', 'node_modules'].includes(file) ||
    file.endsWith('.d.ts') ||
    file.endsWith('.d.tsx')
  )
    return;
  await copy(join(templateDir, file), targetPath);
};

export const copy = async (src: string, dest: string) => {
  const fileStat = await stat(src);
  console.log(src, fileStat.isDirectory());
  await (fileStat.isDirectory() ? copyDir(src, dest) : copyFile(src, dest));
};

export const copyDir = async (srcDir: string, destDir: string) => {
  await mkdir(destDir, { recursive: true });
  for (const file of await readdir(srcDir)) {
    if (file.endsWith('.d.ts') || file.endsWith('.d.tsx')) {
      continue;
    }
    const srcFile = join(srcDir, file);
    const destFile = join(destDir, file);
    await copy(srcFile, destFile);
  }
};

export const copyTemplate = async (
  root: string,
  group: TemplateGroups,
  template: string
) => {
  const templateDir = getTemplate(group, template);
  try {
    await mkdir(join(root));
  } catch (err) {
    if (err instanceof FsError && err.code !== 'EEXIST') {
      console.log({ err });
    }
  }
  const files = await readdir(templateDir);
  for (const file of files) {
    await write(templateDir, root, file);
  }
};

export const getPackageJson = async (dir: string) => {
  const path = join(dir, 'package.json');
  const file = await readFile(path, 'utf-8');
  return JSON.parse(file) as PackageJson;
};

export const combinePackages = async (root: string, ...pkgs: PackageJson[]) => {
  const name = root.split(sep).pop();
  const pkg = Object.assign({}, ...pkgs, {
    name,
    version: '0.0.0',
    type: 'module',
    scripts: Object.assign({}, ...pkgs.map((p) => p.scripts)),
    dependencies: Object.assign({}, ...pkgs.map((p) => p.dependencies)),
    devDependencies: Object.assign({}, ...pkgs.map((p) => p.devDependencies)),
  });
  await writeFile(
    join(root, 'package.json'),
    JSON.stringify(pkg, undefined, 2)
  );
  // console.log(pkg);
};

export const getAndCombinePackages = async (
  root: string,
  ...pkgs: string[]
) => {
  const packageFiles = Promise.all(pkgs.map(getPackageJson));
  combinePackages(root, ...(await packageFiles));
};
