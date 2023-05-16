import { createExpressMiddleware } from '@trpc/server/adapters/express';
import type { Express } from 'express';

import { createContext } from '../trpc/context.ts';
import { appRouter } from '../trpc/router.ts';

const plugin = async (app: Express) => {
  app.use(
    '/trpc',
    createExpressMiddleware({
      router: appRouter,
      createContext,
    })
  );
};

export default plugin;
