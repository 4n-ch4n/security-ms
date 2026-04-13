import { JwtVariables } from 'hono/jwt';
import { createRoute, RouteHandler } from '@hono/zod-openapi';
import { UserAppService } from '@application/services';
import {
  ApiErrorResponse,
  ApiSuccessResponse,
  ErrorCode,
  ErrorResponseSchema,
  StatusCode,
  SuccessResponseSchema,
} from '@config/schemas/response';
import { UserResponseSchema } from '@config/schemas/user.schema';

const route = createRoute({
  method: 'get',
  path: '/users/permissions',
  summary: 'Get user by ID with permissions',
  description: 'Retrieves a user by their ID along with their permissions.',
  tags: ['User'],
  responses: {
    200: {
      description: 'User retrieved successfully with permissions',
      content: {
        'application/json': {
          schema: SuccessResponseSchema(UserResponseSchema),
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
    401: {
      description: 'Unauthorized - Missing or invalid JWT token',
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
        const userId = c.get('jwtPayload').userId;
        const companyId = c.get('jwtPayload').companyId;

        const user = await userAppService.getUserByIdWithPerms(userId, companyId);

        if (!user) {
          const errorResponse = new ApiErrorResponse(
            StatusCode.NOT_FOUND,
            ErrorCode.NOT_FOUND,
            'User not found',
          );
          return c.json(errorResponse.toJSON(), StatusCode.NOT_FOUND);
        }

        const response = new ApiSuccessResponse(
          StatusCode.OK,
          user,
          'User retrieved successfully with permissions',
        );
        
        return c.json(response.toJSON(), StatusCode.OK);
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
