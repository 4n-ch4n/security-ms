import { createMiddleware } from 'hono/factory';
import {
  ApiErrorResponse,
  ErrorCode,
  StatusCode,
} from '@config/schemas/response';

export const requirePermission = (requiredPermission: string) => {
  return createMiddleware(async (c, next) => {
    const payload: any = c.get('jwtPayload');

    if (!payload) {
      throw new ApiErrorResponse(
        StatusCode.UNAUTHORIZED,
        ErrorCode.UNAUTHORIZED,
        'Missing JWT payload',
      );
    }

    const { permissions } = payload;

    if (!permissions || !Array.isArray(permissions)) {
      throw new ApiErrorResponse(
        StatusCode.FORBIDDEN,
        ErrorCode.FORBIDDEN,
        'Missing permissions in token. Have you selected an organization?',
      );
    }

    if (!permissions.includes(requiredPermission)) {
      throw new ApiErrorResponse(
        StatusCode.FORBIDDEN,
        ErrorCode.FORBIDDEN,
        `Insufficient permissions. Required: ${requiredPermission}`,
      );
    }

    await next();
  });
};