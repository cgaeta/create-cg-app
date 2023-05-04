import prompts from 'prompts';
import { resolve } from 'path';
import { readdir } from 'fs/promises';

const meme = async () => {
  const [fe, be, full] = await Promise.all([
    readdir(resolve(__dirname, './templates/frontend')),
    readdir(resolve(__dirname, './templates/backend')),
    readdir(resolve(__dirname, './templates/fullstack')),
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
      name: 'client',
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
};

meme();
