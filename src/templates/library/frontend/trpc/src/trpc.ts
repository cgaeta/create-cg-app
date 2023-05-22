import { createTRPCProxyClient, httpBatchLink } from '@trpc/client';
//@ts-ignore: template
import type { AppRouter } from '@server/src/trpc/router';

export const trpc = createTRPCProxyClient<AppRouter>({
  links: [
    httpBatchLink({
      url: 'http://localhost:3000/trpc',

      async headers() {
        return {};
      },
    }),
  ],
});
