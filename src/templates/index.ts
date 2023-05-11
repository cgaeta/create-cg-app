import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { readdir } from 'fs/promises';

const templateGroups = ['frontend', 'backend', 'fullstack', 'bundler'] as const;
export type TemplateGroups = (typeof templateGroups)[number];

export const TEMPLATE_PATH = join(fileURLToPath(import.meta.url), '..');

export const getTemplate = (collection: TemplateGroups, target: string) =>
  join(TEMPLATE_PATH, collection, target);

export const getTemplates = () =>
  Promise.all(templateGroups.map((t) => readdir(join(TEMPLATE_PATH, t))));
