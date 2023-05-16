import { initTRPC } from '@trpc/server';

export declare const t: ReturnType<typeof initTRPC.create>;
export declare const router: typeof t.router;
export declare const publicProcedure: typeof t.procedure;
