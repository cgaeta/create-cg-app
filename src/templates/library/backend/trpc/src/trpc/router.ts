import { router, publicProcedure } from './index.ts';

export const appRouter = router({
  example: publicProcedure.query(() => 'example route'),
});

export type AppRouter = typeof appRouter;
