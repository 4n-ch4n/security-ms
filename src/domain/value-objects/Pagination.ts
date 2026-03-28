export interface PaginationQuery {
  limit: number;
  offset: number;
}

export interface PaginatedResult<T> {
  total: number;
  data: T[];
}
