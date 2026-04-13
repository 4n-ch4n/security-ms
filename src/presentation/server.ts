import { OpenAPIHono } from '@hono/zod-openapi';
import { swaggerUI } from '@hono/swagger-ui';
import { logger } from 'hono/logger';
import { cors } from 'hono/cors';
import { jwt } from 'hono/jwt';
import { envs } from '@config';
import rootRoutes from './_root/index';
import usersRoutes from './users/index';
import rolesRoutes from './roles/index';
import organizationsRoutes from './organizations/index';

const app = new OpenAPIHono();

app.use(logger());
app.use(cors());

app.openAPIRegistry.registerComponent('securitySchemes', 'Bearer', {
  type: 'http',
  scheme: 'bearer',
});

app.route('/', rootRoutes);

app.doc(envs.openApiUrl, {
  openapi: '3.0.0',
  info: {
    version: '1.0.0',
    title: 'Security MS',
  },
  servers: [
    {
      url: '/',
      description: 'API Version 1',
    },
  ],
  security: [{ Bearer: [] }],
  tags: [{ name: 'security', description: 'Security Operations' }],
});

app.get(
  envs.docsUrl,
  swaggerUI({ url: envs.openApiUrl, title: 'Security MS' }),
);
app.get(`${envs.docsUrl}/`, (c) => c.redirect(envs.docsUrl));
app.get('/', (c) => c.redirect(envs.docsUrl));

app.route(envs.baseUrl, usersRoutes);

app.use(
  `${envs.baseUrl}/*`,
  jwt({
    secret: envs.secretJwt,
    alg: 'HS256',
  }),
);

app.route(envs.baseUrl, rolesRoutes);
app.route(envs.baseUrl, organizationsRoutes);

export default app;
