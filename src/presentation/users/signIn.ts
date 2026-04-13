import { z } from 'zod';
import { JwtVariables } from 'hono/jwt';
import { createRoute, RouteHandler } from '@hono/zod-openapi';
import { UserOrganizationSchema } from '@config/schemas/organization.schema';
import {
  ApiErrorResponse,
  ApiSuccessResponse,
  ErrorCode,
  ErrorResponseSchema,
  StatusCode,
  SuccessResponseSchema,
} from '@config/schemas/response';
import { UserAppService } from '@application/services';

const RequestBodySchema = z.object({
  email: z.email().openapi({
    example: 'john.doe@example.com',
    description: 'The email address of the user.',
  }),
  password: z.string().openapi({
    example: 'P@ssw0rd!',
    description: 'The password for the user account.',
  }),
});

const route = createRoute({
  method: 'post',
  path: '/users/sign-in',
  summary: 'Sign in a user',
  description: 'Authenticates a user with their email and password.',
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
      description: 'User signed in successfully',
      content: {
        'application/json': {
          schema: SuccessResponseSchema(
            z
              .object({
                identityToken: z.string().openapi({
                  example:
                    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c',
                  description:
                    'The JWT token representing the authenticated user.',
                }),
                organizations: z.array(UserOrganizationSchema).openapi({
                  description:
                    'The organizations the user belongs to, along with their roles.',
                }),
              })
              .openapi({
                description:
                  "The result of a successful sign-in, including the identity token and the user's organizations.",
              }),
          ),
        },
      },
    },
    400: {
      description: 'Bad Request - Invalid email or password',
      content: {
        'application/json': {
          schema: ErrorResponseSchema,
        },
      },
    },
    401: {
      description: 'Unauthorized - Missing or invalid credentials',
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
      const { email, password } = c.req.valid('json');

      const signInResult = await userAppService.signIn(email, password);

      const response = new ApiSuccessResponse(
        StatusCode.OK,
        signInResult,
        'User signed in successfully',
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
