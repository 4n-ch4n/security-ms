import { JwtVariables } from 'hono/jwt';
import { OpenAPIHono } from '@hono/zod-openapi';
import { RolesAppService } from '@application/services';
import { envs } from '@config';
import { RolesService } from '@domain/services';
import { RoleRepository } from '@infrastructure/repositories';
import { MysqlConfig } from '@infrastructure/repositories/config';
import getRoles from './getRoles';

const app = new OpenAPIHono<{ Variables: JwtVariables }>();

const mysqlDb = MysqlConfig.getInstance(envs);

const roleRepository = new RoleRepository(mysqlDb);

const rolesService = new RolesService(roleRepository);

const rolesAppService = new RolesAppService(rolesService);

app.openapi(getRoles.route, getRoles.createHandler(rolesAppService));

export default app;
