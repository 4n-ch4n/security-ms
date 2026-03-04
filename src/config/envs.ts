export const envs = {
  secretJwt: process.env.SECRET_JWT || '',
  port: Number(process.env.PORT) || 3000,
  hostname: process.env.HOSTNAME ?? 'localhost',
  baseUrl: process.env.API_BASE_URL ?? '/api',
  docsUrl: process.env.DOCS_URL ?? '/public/api-docs',
  openApiUrl: process.env.OPENAPI_URL ?? '/public/openapi.json',
  postgres: {
    database: process.env.DB_USERS_DATABASE || '',
    port: Number(process.env.DB_USERS_PORT) || 5432,
    host: process.env.DB_USERS_HOST || '',
    password: process.env.DB_USERS_PASSWORD || '',
    user: process.env.DB_USERS_USER || '',
  },
};
