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
import { RolesAppService } from '@application/services';

const route = createRoute({
  method: 'get',
  path: '/roles',
  summary: 'Get all roles',
  description: 'Retrieves a list of all roles available in the system.',
  tags: ['Roles'],
  responses: {
    200: {
      description: 'A list of roles',
      content: {
        'application/json': {
          schema: SuccessResponseSchema(
            z.array(
              z.object({
                id: z.string().openapi({
                  example: 'admin',
                  description: 'The unique identifier of the role.',
                }),
                name: z.string().openapi({
                  example: 'Administrator',
                  description: 'The display name of the role.',
                }),
                description: z.string().nullable().openapi({
                  example: 'Has full access to all resources.',
                  description: 'A brief description of the role.',
                }),
              }),
            ),
          ),
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
  rolesAppService: RolesAppService,
): RouteHandler<typeof route, { Variables: JwtVariables }> => {
  return async (c) => {
    try {
      const roles = await rolesAppService.getRoles();

      const response = new ApiSuccessResponse(
        StatusCode.OK,
        roles,
        'Roles retrieved successfully',
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
