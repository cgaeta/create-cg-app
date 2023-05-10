import fastify from 'fastify';

const server = fastify();

server.get('/', async () => {
  return { server: 'fastify ' };
});

try {
  await server.listen({ port: 3000 });
} catch (err) {
  server.log.error(err);
  process.exit(1);
}
