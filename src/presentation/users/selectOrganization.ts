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
import { createRoute, RouteHandler } from '@hono/zod-openapi';
import { JwtVariables } from 'hono/jwt';
import { z } from 'zod';

const RequestBodySchema = z.object({
  companyId: z.string().openapi({
    example: 'hex',
    description: 'The unique identifier of the company.',
  }),
});

const route = createRoute({
  method: 'post',
  path: '/users/select-organization',
  summary: 'Select an organization for the user',
  description:
    'Allows a user to select an organization (company) they belong to, setting it as the active context for their session.',
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
      description: 'Organization selected successfully',
      content: {
        'application/json': {
          schema: SuccessResponseSchema(
            z.object({
              accessToken: z.string().openapi({
                example:
                  'token.jwt.here',
                description: 'JWT access token for the selected organization.',
              }),
              user: UserResponseSchema,
            }),
          ),
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
    403: {
      description: 'Forbidden - User does not belong to the specified company',
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
      const { companyId } = c.req.valid('json');

      const result = await userAppService.selectOrganization(userId, companyId);

      const response = new ApiSuccessResponse(
        StatusCode.OK,
        result,
        'Organization selected successfully',
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
