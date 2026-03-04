import { OpenAPIHono } from '@hono/zod-openapi';
import healthcheck from './healthcheck';

const app = new OpenAPIHono();

app.openapi(healthcheck.route, healthcheck.handler);

export default app;
