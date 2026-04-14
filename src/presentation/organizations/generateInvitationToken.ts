import { UserOrganizationAppService } from '@application/services';
import {
  ApiErrorResponse,
  StatusCode,
  ErrorCode,
  SuccessResponseSchema,
  ApiSuccessResponse,
  ErrorResponseSchema,
} from '@config/schemas/response';
import { createRoute, RouteHandler } from '@hono/zod-openapi';
import { JwtVariables } from 'hono/jwt';
import { z } from 'zod';
import { requirePermission } from '../middlewares';

const RequestBodySchema = z.object({
  roleId: z.string().openapi({
    example: 'admin',
    description:
      'The unique identifier of the role to assign to the invited user.',
  }),
  email: z.email().openapi({
    example: 'john.doe@example.com',
    description: 'The email address of the user to invite.',
  }),
});

const route = createRoute({
  method: 'post',
  path: '/organizations/invitations',
  summary: 'Generate an invitation token for a user to join an organization',
  description:
    'Allows an organization owner to generate an invitation token that can be sent to a user to join the organization with a specific role.',
  tags: ['Organization'],
  middleware: [requirePermission('user:create')],
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
      description: 'Invitation token generated successfully',
      content: {
        'application/json': {
          schema: SuccessResponseSchema(
            z.object({
              invitationToken: z.string().openapi({
                example:
                  'token1234567890abcdefg',
                description: 'The generated invitation token.',
              }),
            }),
          ),
        },
      },
    },
    400: {
      description:
        'Bad Request - Invalid input data or user is already a member of the organization',
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
    403: {
      description:
        'Forbidden - User does not have permission to generate invitations',
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
      const companyId = c.get('jwtPayload').companyId;
      const { roleId, email } = c.req.valid('json');

      const invitationToken =
        await userOrganizationAppService.generateInvitationToken(
          companyId,
          roleId,
          email,
        );

      const response = new ApiSuccessResponse(
        StatusCode.OK,
        { invitationToken },
        'Invitation token generated successfully',
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
