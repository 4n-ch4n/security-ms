import { jwt, JwtVariables } from 'hono/jwt';
import { OpenAPIHono } from '@hono/zod-openapi';
import { UserAppService } from '@application/services';
import { UserService } from '@domain/services';
import { envs } from '@config';
import {
  RoleRepository,
  UserOrganizationRepository,
  UserRepository,
} from '@infrastructure/repositories';
import { MysqlConfig } from '@infrastructure/repositories/config';
import signIn from './signIn';
import selectOrganization from './selectOrganization';
import signUp from './signUp';
import getUserById from './getUserById';
import getUserByIdWithPerms from './getUserByIdWithPerms';
import getUsersByOrganization from './getUsersByOrganization';
import updateUser from './updateUser';
import deleteUser from './deleteUser';

const app = new OpenAPIHono<{ Variables: JwtVariables }>();

const mysqlDb = MysqlConfig.getInstance(envs);

const roleRepository = new RoleRepository(mysqlDb);
const userOrganizationRepository = new UserOrganizationRepository(mysqlDb);
const userRepository = new UserRepository(mysqlDb);

const userService = new UserService(
  envs,
  roleRepository,
  userOrganizationRepository,
  userRepository,
);

const userAppService = new UserAppService(userService);

app.openapi(signIn.route, signIn.createHandler(userAppService));
app.openapi(signUp.route, signUp.createHandler(userAppService));

app.use(
  '*',
  jwt({
    secret: envs.secretJwt,
    alg: 'HS256',
  }),
);

app.openapi(selectOrganization.route, selectOrganization.createHandler(userAppService));
app.openapi(getUserById.route, getUserById.createHandler(userAppService));
app.openapi(
  getUserByIdWithPerms.route,
  getUserByIdWithPerms.createHandler(userAppService),
);
app.openapi(
  getUsersByOrganization.route,
  getUsersByOrganization.createHandler(userAppService),
);
app.openapi(updateUser.route, updateUser.createHandler(userAppService));
app.openapi(deleteUser.route, deleteUser.createHandler(userAppService));

export default app;
