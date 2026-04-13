export const envs = {
  secretJwt: process.env.JWT_SECRET || '',
  port: Number(process.env.PORT) || 3000,
  hostname: process.env.HOSTNAME ?? 'localhost',
  baseUrl: process.env.API_BASE_URL ?? '/api',
  docsUrl: process.env.DOCS_URL ?? '/public/api-docs',
  openApiUrl: process.env.OPENAPI_URL ?? '/public/openapi.json',
  mysql: {
    database: process.env.DB_USERS_DATABASE || '',
    port: Number(process.env.DB_USERS_PORT) || 3306,
    host: process.env.DB_USERS_HOST || '',
    password: process.env.DB_USERS_PASSWORD || '',
    user: process.env.DB_USERS_USER || '',
  },
};
