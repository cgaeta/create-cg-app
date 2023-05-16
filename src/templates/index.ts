import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { readdir } from 'fs/promises';

const templateGroups = [
  'frontend',
  'backend',
  'fullstack',
  'bundler',
  'library/frontend',
  'library/backend',
] as const;
export type TemplateGroups = (typeof templateGroups)[number];

export const TEMPLATE_PATH = join(fileURLToPath(import.meta.url), '..');

export const getTemplate = (
  collection: TemplateGroups | 'glue',
  target: string
) => join(TEMPLATE_PATH, collection, target);

export const getTemplates = () =>
  Promise.all(templateGroups.map((t) => readdir(join(TEMPLATE_PATH, t))));

export const getGlue = (a: string, b: string) =>
  join(TEMPLATE_PATH, 'glue', `${a}/${b}`);
