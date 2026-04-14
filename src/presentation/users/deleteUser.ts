import { UserAppService } from '@application/services';
import {
  ApiErrorResponse,
  ErrorCode,
  ErrorResponseSchema,
  StatusCode,
} from '@config/schemas/response';
import { createRoute, RouteHandler } from '@hono/zod-openapi';
import { JwtVariables } from 'hono/jwt';
import { requirePermission } from '../middlewares';

const route = createRoute({
  method: 'delete',
  path: '/users/:id',
  summary: 'Delete user by ID',
  description: 'Deletes a user by their unique identifier.',
  tags: ['User'],
  middleware: [requirePermission('user:delete')],
  responses: {
    204: {
      description: 'User deleted successfully',
    },
    401: {
      description: 'Unauthorized - Missing or invalid JWT token',
      content: {
        'application/json': {
          schema: ErrorResponseSchema,
        },
      },
    },
    404: {
      description: 'User not found',
      content: {
        'application/json': {
          schema: ErrorResponseSchema,
        },
      },
    },
    500: {
      description: 'Internal Server Error',
      content: {
        'application/json': {
          schema: ErrorResponseSchema,
        },
      },
    },
  },
});

const createHandler = (
  userAppService: UserAppService,
): RouteHandler<typeof route, { Variables: JwtVariables }> => {
  return async (c) => {
    try {
      const userId = c.req.param('id');

      await userAppService.deleteUser(userId);

      return c.body(null, StatusCode.NO_CONTENT);
    } catch (error) {
      if (error instanceof ApiErrorResponse) {
        return c.json(error.toJSON(), error.status as any);
      }

      const errorResponse = new ApiErrorResponse(
        StatusCode.INTERNAL_ERROR,
        ErrorCode.UNKNOWN,
        error instanceof Error ? error.message : 'An unexpected error occurred',
      );

      return c.json(errorResponse.toJSON(), StatusCode.INTERNAL_ERROR);
    }
  };
};

export default {
  route,
  createHandler,
};
