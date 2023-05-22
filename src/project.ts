import { join } from 'node:path';
import { TEMPLATE_PATH, TemplateGroups } from './templates';
import { copyTemplate, getAndCombinePackages } from './files';
import { Responses } from './prompts';

const templateMap = new Map<string, TemplateGroups>([
  ['client', 'frontend'],
  ['server', 'backend'],
  ['bundler', 'bundler'],
  ['feLibraries', 'library/frontend'],
  ['beLibraries', 'library/backend'],
]);
const packagePaths: string[] = [];
const arrayify = (s: string | string[]) => (Array.isArray(s) ? s : [s]);

type KR = keyof Responses;
const otherMeme = async (res: Responses, root: string, k1: KR, k2?: KR) => {
  const tg = templateMap.get(k1);
  if (!tg) throw new Error();
  const template = k2 ? 'glue' : tg;

  const last = !k2
    ? arrayify(res[k1])
    : k2.startsWith('library')
    ? arrayify(res[k2])
    : [`${res[k1]}/${res[k2]}`];

  for (const l of last) {
    try {
      await copyTemplate(root, template, l);
      packagePaths.push(join(TEMPLATE_PATH, template, l));
    } catch (err) {}
  }
};

type P = Parameters<typeof otherMeme>;
type FP = P extends [infer _I, infer _J, ...infer R] ? R : never;
export const makeMeme = (response: Responses) => {
  const root = join(process.cwd(), response.dir);
  function leMeme(...p: FP) {
    return otherMeme(response, root, ...p);
  }
  leMeme.client = (...p: FP) => otherMeme(response, join(root, 'client'), ...p);
  leMeme.server = (...p: FP) => otherMeme(response, join(root, 'server'), ...p);
  leMeme.packagePaths = packagePaths;
  leMeme.root = root;
  leMeme.combinePackages = () =>
    getAndCombinePackages(leMeme.root, ...packagePaths);

  return leMeme;
};
