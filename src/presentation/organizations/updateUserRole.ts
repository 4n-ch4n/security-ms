import { z } from 'zod';
import { JwtVariables } from 'hono/jwt';
import { createRoute, RouteHandler } from '@hono/zod-openapi';
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

const RequestBodySchema = z.object({
  userId: z.uuid().openapi({
    example: '123e4567-e89b-12d3-a456-426614174000',
    description:
      'The unique identifier of the user whose role is being updated.',
  }),
  companyId: z.string().openapi({
    example: 'hex',
    description: 'The unique identifier of the company where the user belongs.',
  }),
  rolId: z.string().openapi({
    example: 'admin',
    description: 'The unique identifier of the new role to assign to the user.',
  }),
});

const route = createRoute({
  method: 'patch',
  path: '/organizations',
  summary: 'Update a user role in an organization',
  description:
    'Allows an organization owner to update the role of a user within the organization.',
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
      description: 'User role updated successfully',
      content: {
        'application/json': {
          schema: SuccessResponseSchema(UserOrganizationSchema),
        },
      },
    },
    400: {
      description:
        'Bad Request - Invalid input data or user is not a member of the organization',
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
      description: 'Forbidden - User does not have permission to update roles',
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
      const body = c.req.valid('json');

      const userOrganization =
        await userOrganizationAppService.updateUserRole(body);

      const response = new ApiSuccessResponse(
        StatusCode.OK,
        userOrganization,
        'User role updated successfully',
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
