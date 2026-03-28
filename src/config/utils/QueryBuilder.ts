interface IQueryParams {
  columns?: string;
  entity?: string;
  joins: string[];
  conditions: string[];
  additionalConditions: string[];
  values?: string[];
  limit?: string | number;
  groupBy?: string;
  orderBy?: string;
  getTotalRows?: boolean;
}

export class QueryBuilder {
  private queryParams: IQueryParams = {
    columns: '*',
    joins: [],
    conditions: [],
    additionalConditions: [],
  };

  constructor(entity: string) {
    this.queryParams.entity = entity;
  }

  setColumns(columns: string): QueryBuilder {
    this.queryParams.columns = columns;
    return this;
  }

  addJoin(join: string): QueryBuilder {
    this.queryParams.joins.push(join);
    return this;
  }

  addCondition(condition: string): QueryBuilder {
    this.queryParams.conditions.push(condition);
    return this;
  }

  addAdditionalCondition(condition: string): QueryBuilder {
    this.queryParams.additionalConditions.push(condition);
    return this;
  }

  setLimit({ page, limit }: { page: number; limit: number }): QueryBuilder {
    const offset = page * limit;
    this.queryParams.limit = `${offset}, ${limit}`;
    return this;
  }

  setGroupBy(groupBy: string): QueryBuilder {
    this.queryParams.groupBy = groupBy;
    return this;
  }

  setOrderBy(orderBy: string): QueryBuilder {
    this.queryParams.orderBy = orderBy;
    return this;
  }

  build(): string {
    if (!this.queryParams.entity) {
      throw new Error('Entity (table) must be specified.');
    }

    const {
      columns,
      entity,
      joins,
      conditions,
      additionalConditions,
      limit,
      groupBy,
      orderBy,
    } = this.queryParams;

    const baseQuery = `SELECT ${columns} FROM ${entity}`;
    const joinClause = joins.length > 0 ? joins.join(' ') : '';
    const whereClause =
      conditions.length > 0 ? `WHERE ${conditions.join(' ')}` : '';
    const additionalConditionsClause =
      additionalConditions.length > 0
        ? `${conditions.length > 0 ? ' AND ' : 'WHERE '}${additionalConditions.join(' AND ')}`
        : '';
    const groupByClause = groupBy ? `GROUP BY ${groupBy}` : '';
    const orderByClause = orderBy ? `ORDER BY ${orderBy}` : '';
    const limitClause = limit ? `LIMIT ${limit}` : '';

    return `${baseQuery} ${joinClause} ${whereClause} ${additionalConditionsClause} ${groupByClause} ${orderByClause} ${limitClause}`.trim();
  }
}
