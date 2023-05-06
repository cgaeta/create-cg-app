import { readdir } from 'node:fs/promises';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import type { PromptObject, Answers } from 'prompts';

export const getTemplates = () =>
  Promise.all([
    readdir(resolve(fileURLToPath(import.meta.url), '../templates/frontend')),
    readdir(resolve(fileURLToPath(import.meta.url), '../templates/backend')),
    readdir(resolve(fileURLToPath(import.meta.url), '../templates/fullstack')),
  ]);

type Prompts = 'stack' | 'dir' | 'typescript' | 'client' | 'server';

export const stackPrompt: PromptObject<Prompts> = {
  type: 'select',
  name: 'stack',
  message: 'App time! Watcha building?',
  choices: [
    { title: 'Fullstack', value: 'fullstack' },
    { title: 'Frontend', value: 'frontend' },
    { title: 'Backend', value: 'backend' },
  ],
};

export const dirPrompt: PromptObject<Prompts> = {
  type: 'text',
  name: 'dir',
  message: 'Where we putting this bad boy?',
  initial: 'cg_app',
};

export const tsPrompt: PromptObject<Prompts> = {
  type: 'confirm',
  name: 'typescript',
  message: 'Using Typescript, right?',
  initial: true,
};

export const frontendPrompt = (
  fe: string[],
  full: string[]
): PromptObject<Prompts> => ({
  type: (_: unknown, value: Answers<Prompts>) =>
    ['frontend', 'fullstack'].includes(value.stack) ? 'select' : null,
  name: 'client',
  message: (prev: boolean, value: Answers<Prompts>) =>
    `${!prev ? 'Disagreed. ' : ''}What ${
      value.stack === 'fullstack' ? 'frontend' : 'library'
    }?`,
  choices: (_: unknown, value: Answers<Prompts>) =>
    fe.concat(value.stack === 'fullstack' ? full : []).map((t) => ({
      value: t,
      title: t,
    })),
});

export const backendPrompt = (
  be: string[],
  full: string[]
): PromptObject<Prompts> => ({
  type: (_: unknown, value: Answers<Prompts>) =>
    ['backend', 'fullstack'].includes(value.stack) &&
    !full.includes(value.client)
      ? 'select'
      : null,
  name: 'server',
  message: (_: unknown, value: Answers<Prompts>) =>
    `${!value.typescript ? 'Disagreed. ' : ''}What ${
      value.stack === 'fullstack' ? 'backend' : 'library'
    }?`,
  choices: be.map((t) => ({
    value: t,
    title: t,
  })),
});
