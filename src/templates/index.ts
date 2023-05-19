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
export type TemplateGroups = (typeof templateGroups)[number] | 'glue';

export const isTemplateGroup = (s: string): s is TemplateGroups =>
  Array.from(Object(templateGroups).values()).includes(s) || s === 'glue';

export const TEMPLATE_PATH = join(fileURLToPath(import.meta.url), '..');

/** Append the path to a library to the base template path */
export const getTemplate = (collection: TemplateGroups, target: string) =>
  join(TEMPLATE_PATH, collection, target);

export const getTemplates = () =>
  Promise.all(templateGroups.map((t) => readdir(join(TEMPLATE_PATH, t))));
