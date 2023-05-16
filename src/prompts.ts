import type { PromptObject, PromptType, PrevCaller } from 'prompts';

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
  | 'server'
  | 'feLibraries'
  | 'beLibraries';
type Prompt = PromptObject<PromptNames>;

type CheckStack = (
  t: PromptType,
  f?: string[]
) => PrevCaller<PromptNames, PromptType | null>;
const hasFrontend: CheckStack = (type) => (_, v) =>
  ['frontend', 'fullstack'].includes(v.appStack) ? type : null;
const hasBackend: CheckStack = (type, full) => (_, v) =>
  (['backend', 'fullstack'].includes(v.appStack) &&
    !full?.includes(v.client)) ??
  true
    ? type
    : null;

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
  type: hasFrontend('select'),
  name: 'client',
  message: (prev, value) =>
    `${!prev ? 'Disagreed. ' : ''}What ${
      value.appStack === 'fullstack' ? 'frontend' : 'library'
    }?`,
  choices: (_, value) =>
    fe.concat(value.appStack === 'fullstack' ? full : []).map(cliChoice),
});

export const backendPrompt = (be: string[], full: string[]): Prompt => ({
  type: hasBackend('select', full),
  name: 'server',
  message: (_, v) =>
    `${!(v.typescript || v.client) ? 'Disagreed. ' : ''}What ${
      v.appStack === 'fullstack' ? 'backend' : 'library'
    }?`,
  choices: be.map(cliChoice),
});

export const frontendLibrariesPrompt = (l: string[]): Prompt => ({
  type: hasFrontend('multiselect'),
  name: 'feLibraries',
  message: 'Which libraries we using on the frontend?',
  choices: l.map(cliChoice),
});

export const backendLibrariesPrompt = (l: string[]): Prompt => ({
  type: hasBackend('multiselect'),
  name: 'beLibraries',
  message: 'Which libraries we using on the backend?',
  choices: l.map(cliChoice),
});
