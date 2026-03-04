import { z } from 'zod';

export const StatusCode = {
  OK: 200,
  CREATED: 201,
  ACCEPTED: 202,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  PRECONDITION_FAILED: 412,
  PRECONDITION_REQUIRED: 428,
  INTERNAL_ERROR: 500,
  BAD_GATEWAY: 502,
  SERVICE_UNAVAILABLE: 503,
} as const;

export type StatusCode = (typeof StatusCode)[keyof typeof StatusCode];

export const ErrorCode = {
  SUCCESS: 'S001',
  RETRY: 'R001',
  UNKNOWN: 'F001',
  FAILURE: 'F002',
  API_ERROR: 'F003',
  API_ERROR_TIMEOUT: 'F004',
  INVALID_ACCESS_TOKEN: 'F005',
  UNAUTHORIZED: 'F006',
  FORBIDDEN: 'F007',
  OPERATION_NOT_ALLOWED: 'F008',
  INVALID_ARGUMENT: 'F009',
  NOT_FOUND: 'F010',
  NO_CONTENT: 'F011',
  FILE_NOT_FOUND: 'F012',
  // POSTGRES ERROR LIST
  UNIQUE_VIOLATION: 'SQ001',
  SYNTAX_ERROR: 'SQ002',
  FOREIGN_KEY_VIOLATION: 'SQ003',
  CHECK_VIOLATION: 'SQ004',
  UNDEFINED_COLUMN: 'SQ005',
  DEADLOCK_DETECTED: 'SQ006',
  STRING_DATA_RIGHT_TRUNCATION: 'SQ007',
  INSUFFICIENT_PRIVILEGE: 'SQ008',
  UNKNOWN_DATABASE_ERROR: 'SQ099',
} as const;

export type ErrorCode = (typeof ErrorCode)[keyof typeof ErrorCode];

export const ErrorResponseSchema = z.object({
  isError: z.boolean().openapi({ example: true }),
  status: z.number().openapi({ examples: [400, 403, 500] }),
  code: z.string().openapi({ examples: ['F001', 'F010', 'SQ003'] }),
  message: z
    .string()
    .openapi({ examples: ['Resource not found', 'Invalid argument'] }),
  data: z.null().optional(),
});

export const SuccessResponseSchema = <T extends z.ZodType>(dataSchema: T) =>
  z.object({
    isError: z.boolean().openapi({ example: false }),
    status: z.number().openapi({ examples: [200, 201, 202] }),
    code: z.string().openapi({ examples: ['S001'] }),
    message: z.string().openapi({ examples: ['Successful Operation'] }),
    data: dataSchema.optional(),
  });

export type ErrorResponse = z.infer<typeof ErrorResponseSchema>;

export class ApiResponse<T> {
  isError: boolean;
  status: StatusCode;
  code: ErrorCode;
  message: string;
  data?: T;

  constructor(
    isError: boolean,
    status: StatusCode,
    code: ErrorCode,
    message: string,
    data?: T,
  ) {
    this.isError = isError;
    this.status = status;
    this.code = code;
    this.message = message;
    this.data = data;
  }

  toJSON() {
    return {
      isError: this.isError,
      status: this.status,
      code: this.code,
      message: this.message,
      data: this.data,
    };
  }
}

export class ApiSuccessResponse<T> extends ApiResponse<T> {
  constructor(status: StatusCode, data?: T, message?: string) {
    super(
      false,
      status,
      ErrorCode.SUCCESS,
      message || 'Successful Operation',
      data,
    );
  }
}

export class ApiErrorResponse extends ApiResponse<null> {
  constructor(status: StatusCode, code: ErrorCode, message: string) {
    super(true, status, code, message);
  }
}
