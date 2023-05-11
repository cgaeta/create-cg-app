import { join } from 'node:path';
import {
  mkdir,
  readdir,
  stat,
  copyFile,
  readFile,
  writeFile,
} from 'fs/promises';
import { getTemplate, type TemplateGroups } from './templates';

import type { PackageJson } from 'type-fest';

export const write = async (
  templateDir: string,
  targetDir: string,
  file: string
) => {
  const targetPath = join(targetDir, file);
  // writeFile(targetPath)
  if (['package.json', 'node_modules'].includes(file)) return;
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
    const srcFile = join(srcDir, file);
    const destFile = join(destDir, file);
    await copy(srcFile, destFile);
  }
};

export const copyTemplate = async (
  root: string,
  group: TemplateGroups,
  template: string,
  target?: 'client' | 'server'
) => {
  const templateDir = getTemplate(group, template);
  const targetDir = target ? join(root, target) : root;
  if (target) {
    await mkdir(join(root, target));
  }
  const files = await readdir(templateDir);
  for (const file of files) {
    await write(templateDir, targetDir, file);
  }
};

export const getPackageJson = async (dir: string) => {
  const path = join(dir, 'package.json');
  const file = await readFile(path, 'utf-8');
  return JSON.parse(file) as PackageJson;
};

export const combinePackages = async (
  root: string,
  name: string,
  ...pkgs: PackageJson[]
) => {
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
  console.log(pkg);
};

export const getAndCombinePackages = async (
  root: string,
  name: string,
  ...pkgs: [TemplateGroups, string][]
) => {
  const packageFiles = Promise.all(
    pkgs.map(([g, t]) => getPackageJson(getTemplate(g, t)))
  );
  combinePackages(root, name, ...(await packageFiles));
};
