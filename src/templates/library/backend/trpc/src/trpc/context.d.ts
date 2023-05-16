import { inferAsyncReturnType } from '@trpc/server';

interface ContextOptions<
  RQ extends object = object,
  RS extends object = object
> {
  req: RQ;
  res: RS;
}

export declare const createContext: <R extends object>(
  opts: ContextOptions
) => R;
export type Context = inferAsyncReturnType<typeof createContext>;
