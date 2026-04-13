import { z } from 'zod';
import { JwtVariables } from 'hono/jwt';
import { createRoute, RouteHandler } from '@hono/zod-openapi';
import { UserOrganizationSchema } from '@config/schemas/organization.schema';
import {
  SuccessResponseSchema,
  ErrorResponseSchema,
  ApiErrorResponse,
  ErrorCode,
  StatusCode,
  ApiSuccessResponse,
} from '@config/schemas/response';
import { UserOrganizationAppService } from '@application/services';

const RequestBodySchema = z.object({
  email: z.email().openapi({
    example: 'john.doe@example.com',
    description: 'The email address of the user who accepted the invitation.',
  }),
  token: z.string().openapi({
    example:
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6InVzZXJAZXhhbXBsZS5jb20iLCJyb2xlSWQiOiIyIiwiaWF0IjoxNjg4ODQyODAwfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c',
    description: 'The invitation token sent to the user.',
  }),
});

const route = createRoute({
  method: 'post',
  path: '/organizations/accept-invitation',
  summary: 'Accept an invitation to join an organization',
  description:
    'Allows a user to accept an invitation to join an organization by providing the invitation token and their email address.',
  tags: ['Organization'],
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
      description:
        'User successfully accepted the invitation and joined the organization',
      content: {
        'application/json': {
          schema: SuccessResponseSchema(UserOrganizationSchema),
        },
      },
    },
    400: {
      description: 'Bad Request - Invalid or expired invitation token',
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
  userOrganizationAppService: UserOrganizationAppService,
): RouteHandler<typeof route, { Variables: JwtVariables }> => {
  return async (c) => {
    try {
      const userId = c.get('jwtPayload').userId;
      const { email, token } = c.req.valid('json');

      const userOrganization =
        await userOrganizationAppService.acceptInvitation(userId, email, token);

      const response = new ApiSuccessResponse(
        StatusCode.OK,
        userOrganization,
        'User successfully accepted the invitation and joined the organization',
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
