import { z } from 'zod';
import { createRoute, RouteHandler } from '@hono/zod-openapi';
import { JwtVariables } from 'hono/jwt';
import {
  ApiErrorResponse,
  ApiSuccessResponse,
  ErrorCode,
  ErrorResponseSchema,
  StatusCode,
  SuccessResponseSchema,
} from '@config/schemas/response';
import { UserResponseSchema } from '@config/schemas/user.schema';
import { UserAppService } from '@application/services';

const RequestBodySchema = z.object({
  id: z.uuid().openapi({
    example: '123e4567-e89b-12d3-a456-426614174000',
    description: 'The unique identifier of the user to be updated.',
  }),
  name: z.string().optional().openapi({
    example: 'John',
    description: 'The first name of the user.',
  }),
  lastName: z.string().optional().openapi({
    example: 'Doe',
    description: 'The last name of the user.',
  }),
  email: z.email().optional().openapi({
    example: 'john.doe@example.com',
    description: 'The email address of the user.',
  }),
  password: z.string().optional().openapi({
    example: 'newSecurePassword123',
    description: 'The new password for the user.',
  }),
  currentPassword: z.string().optional().openapi({
    example: 'currentSecurePassword123',
    description:
      'The current password of the user, required if changing the password.',
  }),
  phone: z.string().optional().openapi({
    example: '+1234567890',
    description: 'The phone number of the user.',
  }),
  isActive: z.boolean().optional().openapi({
    example: true,
    description: 'Indicates whether the user is active.',
  }),
});

const route = createRoute({
  method: 'patch',
  path: '/users',
  summary: 'Update user information',
  description: 'Updates the information of an existing user.',
  tags: ['User'],
  request: {
    body: {
      content: {
        'application/json': {
          schema: RequestBodySchema,
        },
      },
    },
  },
  responses: {
    200: {
      description: 'User updated successfully',
      content: {
        'application/json': {
          schema: SuccessResponseSchema(UserResponseSchema),
        },
      },
    },
    400: {
      description: 'Bad Request - Invalid input data',
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
      const body = c.req.valid('json');

      const user = await userAppService.updateUser(body);

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
        'User updated successfully',
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
