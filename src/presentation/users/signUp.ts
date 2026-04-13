import { z } from 'zod';
import { JwtVariables } from 'hono/jwt';
import { createRoute, RouteHandler } from '@hono/zod-openapi';
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
  name: z.string().openapi({
    example: 'John',
    description: 'The first name of the user.',
  }),
  lastName: z.string().openapi({
    example: 'Doe',
    description: 'The last name of the user.',
  }),
  email: z.email().openapi({
    example: 'john.doe@example.com',
    description: 'The email address of the user.',
  }),
  password: z.string().min(6).openapi({
    example: 'P@ssw0rd!',
    description: 'The password for the user account.',
  }),
  phone: z.string().optional().openapi({
    example: '+1-555-123-4567',
    description: 'The phone number of the user.',
  }),
});

const route = createRoute({
  method: 'post',
  path: '/users/sign-up',
  summary: 'Sign up a new user',
  description: 'Creates a new user account with the provided information.',
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
    201: {
      description: 'User account created successfully',
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

      const user = await userAppService.signUp(body);

      const response = new ApiSuccessResponse(
        StatusCode.CREATED,
        user,
        'User account created successfully',
      );

      return c.json(response.toJSON(), StatusCode.CREATED);
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
