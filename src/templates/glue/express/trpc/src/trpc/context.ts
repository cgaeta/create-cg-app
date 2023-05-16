import { inferAsyncReturnType } from '@trpc/server';
import { type CreateExpressContextOptions } from '@trpc/server/adapters/express';

export const createContext = (_opts: CreateExpressContextOptions) => {
  return {};
};
export type Context = inferAsyncReturnType<typeof createContext>;
