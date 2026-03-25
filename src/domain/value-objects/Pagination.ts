export interface PaginationQuery {
  limit: number;
  offset: number;
}

export interface PaginatedResult<T> extends PaginationQuery {
  total: number;
  data: T[];
}
