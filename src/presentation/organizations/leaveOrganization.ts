import { UserOrganizationAppService } from '@application/services';
import {
  ApiErrorResponse,
  ErrorCode,
  ErrorResponseSchema,
  StatusCode,
} from '@config/schemas/response';
import { createRoute, RouteHandler } from '@hono/zod-openapi';
import { JwtVariables } from 'hono/jwt';
import { z } from 'zod';

const RequestBodySchema = z.object({
  companyId: z.string().openapi({
    example: 'hex',
    description: 'The unique identifier of the organization to leave.',
  }),
});

const route = createRoute({
  method: 'post',
  path: '/organizations/leave',
  summary: 'Leave an organization',
  description:
    'Allows a user to leave an organization they are currently a member of.',
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
      description: 'User successfully left the organization',
    },
    400: {
      description:
        'Bad Request - User is not a member of the organization or is the owner',
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
      const { companyId } = c.req.valid('json');

      await userOrganizationAppService.leaveOrganization(userId, companyId);

      return c.json(null, StatusCode.OK);
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
