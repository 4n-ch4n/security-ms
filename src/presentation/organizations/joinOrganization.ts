import { UserOrganizationAppService } from '@application/services';
import { UserOrganizationSchema } from '@config/schemas/organization.schema';
import {
  ApiErrorResponse,
  ApiSuccessResponse,
  ErrorCode,
  ErrorResponseSchema,
  StatusCode,
  SuccessResponseSchema,
} from '@config/schemas/response';
import { createRoute, RouteHandler } from '@hono/zod-openapi';
import { JwtVariables } from 'hono/jwt';
import { z } from 'zod';

const RequestBodySchema = z.object({
  invitationToken: z.string().openapi({
    example:
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6InVzZXJAZXhhbXBsZS5jb20iLCJyb2xlSWQiOiIyIiwiaWF0IjoxNjg4ODQyODAwfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c',
    description: 'The invitation token sent to the user.',
  }),
});

const route = createRoute({
  method: 'post',
  path: '/organizations/join',
  summary: 'Join an organization using an invitation token',
  description:
    'Allows a user to join an organization by providing a valid invitation token.',
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
      description: 'User successfully joined the organization',
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
      const { invitationToken } = c.req.valid('json');
      const userId = c.get('jwtPayload').userId;
      const userEmail = c.get('jwtPayload').email;

      const userOrganization =
        await userOrganizationAppService.acceptInvitation(
          userId,
          userEmail,
          invitationToken,
        );

      const response = new ApiSuccessResponse(
        StatusCode.OK,
        userOrganization,
        'Successfully joined the organization',
      );

      return c.json(response.toJSON(), StatusCode.OK);
    } catch (error) {
      if (error instanceof ApiErrorResponse) {
        return c.json(error.toJSON(), error.status as any);
      }

      const errorResponse = new ApiErrorResponse(
        StatusCode.INTERNAL_ERROR,
        ErrorCode.UNKNOWN,
        error instanceof Error ? error.message : 'An unknown error occurred',
      );

      return c.json(errorResponse.toJSON(), StatusCode.INTERNAL_ERROR);
    }
  };
};

export default {
  route,
  createHandler,
};
