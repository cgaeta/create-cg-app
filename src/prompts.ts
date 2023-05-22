import type { PromptObject, PromptType, PrevCaller } from 'prompts';

import { getTemplates } from './templates';

type Maybe = (c: string) => boolean;
const cliChoice = (choice: string, selected?: Maybe, disabled?: Maybe) => ({
  title: choice,
  value: choice,
  selected: selected?.(choice),
  disabled: disabled?.(choice),
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
  choices: bundlers.map((c) => cliChoice(c)),
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
  message: (_p, v) =>
    `What ${v.appStack === 'fullstack' ? 'frontend' : 'library'}?`,
  choices: (_, v) =>
    fe.concat(v.appStack === 'fullstack' ? full : []).map((c) => cliChoice(c)),
});

export const backendPrompt = (be: string[], full: string[]): Prompt => ({
  type: hasBackend('select', full),
  name: 'server',
  message: (_p, v) =>
    `What ${v.appStack === 'fullstack' ? 'backend' : 'library'}?`,
  choices: (p) => be.map((c) => cliChoice(c, (c) => p.client === c)),
});

export const frontendLibrariesPrompt = (l: string[]): Prompt => ({
  type: hasFrontend('multiselect'),
  name: 'feLibraries',
  message: 'Which libraries we using on the frontend?',
  choices: l.map((c) => cliChoice(c)),
});

export const backendLibrariesPrompt = (l: string[]): Prompt => ({
  type: hasBackend('multiselect'),
  name: 'beLibraries',
  message: 'Which libraries we using on the backend?',
  choices: (p, v) =>
    l.map((c) =>
      cliChoice(c, undefined, (c) => v.appStack === 'fullstack' && c === p)
    ),
  initial: (p) => l.findIndex((c) => c === p),
});

export type Responses = {
  appStack: 'fullstack' | 'frontend' | 'backend';
  dir: string;
  bundler: string;
  client: string;
  server: string;
  feLibraries: string | string[];
  beLibraries: string | string[];
};

export const promptList = async () => {
  const [fe, be, full, bundler, clientLib, serverLib] = await getTemplates();
  return [
    stackPrompt,
    dirPrompt,
    tsPrompt,
    bundlerPrompt(bundler),
    frontendPrompt(fe, full),
    backendPrompt(be, full),
    frontendLibrariesPrompt(clientLib),
    backendLibrariesPrompt(serverLib),
  ];
};

export const promptConfig = {
  onCancel: () => process.exit(1),
  onSubmit: ({ name }: PromptObject, a: boolean) =>
    name === 'typescript' && !a && console.log('Disagreed.'),
};
