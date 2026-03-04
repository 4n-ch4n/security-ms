import { serve } from '@hono/node-server';
import app from '@api/server';
import { envs } from '@config';

serve(
  {
    fetch: app.fetch,
    port: envs.port,
    hostname: envs.hostname,
  },
  (info) => {
    console.log(`Server is running at http://${envs.hostname}:${info.port}`);
    console.log(
      `API definition: http://${envs.hostname}:${info.port}${envs.openApiUrl}`
    );
    console.log(
      `Documentation: http://${envs.hostname}:${info.port}${envs.docsUrl}`
    );
  },
);
