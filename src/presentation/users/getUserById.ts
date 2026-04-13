import { JwtVariables } from 'hono/jwt';
import { createRoute, RouteHandler } from '@hono/zod-openapi';
import { UserResponseSchema } from '@config/schemas/user.schema';
import {
  ApiErrorResponse,
  ApiSuccessResponse,
  ErrorCode,
  ErrorResponseSchema,
  StatusCode,
  SuccessResponseSchema,
} from '@config/schemas/response';
import { UserAppService } from '@application/services';

const route = createRoute({
  method: 'post',
  path: '/users/:id',
  summary: 'Get user by ID',
  description: 'Retrieves a user by their unique identifier.',
  tags: ['User'],
  responses: {
    200: {
      description: 'User retrieved successfully',
      content: {
        'application/json': {
          schema: SuccessResponseSchema(UserResponseSchema),
        },
      },
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
      const { id: userId } = c.req.param();

      const user = await userAppService.getUserById(userId);
      if (!user) {
        const response = new ApiErrorResponse(
          StatusCode.NOT_FOUND,
          ErrorCode.NOT_FOUND,
          'User not found.',
        );
        return c.json(response.toJSON(), StatusCode.NOT_FOUND);
      }

      const response = new ApiSuccessResponse(
        StatusCode.OK,
        user,
        'User retrieved successfully',
      );

      return c.json(response.toJSON(), StatusCode.OK);
    } catch (error) {
      if (error instanceof ApiErrorResponse) {
        return c.json(error.toJSON(), error.status as any);
      }
      const response = new ApiErrorResponse(
        StatusCode.INTERNAL_ERROR,
        ErrorCode.UNKNOWN,
        'An unexpected error occurred while retrieving the user.',
      );
      return c.json(response.toJSON(), StatusCode.INTERNAL_ERROR);
    }
  };
};

export default {
  route,
  createHandler,
};
