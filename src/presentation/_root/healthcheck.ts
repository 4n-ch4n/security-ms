import { createRoute, RouteHandler } from '@hono/zod-openapi';
import { z } from 'zod';
import {
  ApiSuccessResponse,
  StatusCode,
  SuccessResponseSchema,
} from '@config/schemas/response';

const HealthResponseSchema = z.object({
  status: z.string(),
  timestamp: z.string(),
  uptime: z.number(),
});

export const route = createRoute({
  method: 'get',
  path: '/healthcheck',
  tags: ['utility'],
  summary: 'Health check endpoint',
  description: 'Returns the health state of the API',
  responses: {
    200: {
      description: 'API is healthy and operational',
      content: {
        'application/json': {
          schema: SuccessResponseSchema(HealthResponseSchema),
        },
      },
    },
  },
});

const handler: RouteHandler<typeof route> = async (c) => {
  const response = new ApiSuccessResponse(StatusCode.OK, {
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });

  return c.json(response.toJSON());
};

export default {
  route,
  handler,
};
