import { readdir } from 'node:fs/promises';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import type { PromptObject } from 'prompts';

const TEMPLATE_PATH = resolve(fileURLToPath(import.meta.url), '../templates');

export const getTemplates = () =>
  Promise.all([
    readdir(resolve(TEMPLATE_PATH, 'frontend')),
    readdir(resolve(TEMPLATE_PATH, 'backend')),
    readdir(resolve(TEMPLATE_PATH, 'fullstack')),
    readdir(resolve(TEMPLATE_PATH, 'bundler')),
  ]);

const cliChoice = (choice: string) => ({
  title: choice,
  value: choice,
});

type PromptNames =
  | 'appStack'
  | 'dir'
  | 'bundler'
  | 'typescript'
  | 'client'
  | 'server';
type Prompt = PromptObject<PromptNames>;

export const stackPrompt: Prompt = {
  type: 'select',
  name: 'appStack',
  message: 'App time! Watcha building?',
  choices: [
    { title: 'Fullstack', value: 'fullstack' },
    { title: 'Frontend', value: 'frontend' },
    { title: 'Backend', value: 'backend' },
  ],
};

export const dirPrompt: Prompt = {
  type: 'text',
  name: 'dir',
  message: 'Where we putting this bad boy?',
  initial: 'cg_app',
};

export const bundlerPrompt = (bundlers: string[]): Prompt => ({
  type: 'select',
  name: 'bundler',
  message: 'What bundler are we using?',
  choices: bundlers.map(cliChoice),
});

export const tsPrompt: Prompt = {
  type: 'confirm',
  name: 'typescript',
  message: 'Using Typescript, right?',
  initial: true,
};

export const frontendPrompt = (fe: string[], full: string[]): Prompt => ({
  type: (_, value) =>
    ['frontend', 'fullstack'].includes(value.appStack) ? 'select' : null,
  name: 'client',
  message: (prev, value) =>
    `${!prev ? 'Disagreed. ' : ''}What ${
      value.appStack === 'fullstack' ? 'frontend' : 'library'
    }?`,
  choices: (_, value) =>
    fe.concat(value.appStack === 'fullstack' ? full : []).map(cliChoice),
});

export const backendPrompt = (be: string[], full: string[]): Prompt => ({
  type: (_, value) =>
    ['backend', 'fullstack'].includes(value.appStack) &&
    !full.includes(value.client)
      ? 'select'
      : null,
  name: 'server',
  message: (_, value) =>
    `${!value.typescript ? 'Disagreed. ' : ''}What ${
      value.appStack === 'fullstack' ? 'backend' : 'library'
    }?`,
  choices: be.map(cliChoice),
});
