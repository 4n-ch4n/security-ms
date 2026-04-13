import { JwtVariables } from 'hono/jwt';
import { OpenAPIHono } from '@hono/zod-openapi';
import { UserOrganizationService } from '@domain/services';
import { UserOrganizationRepository } from '@infrastructure/repositories';
import { UserOrganizationAppService } from '@application/services';
import { envs } from '@config';
import { MysqlConfig } from '@infrastructure/repositories/config';
import acceptInvitation from './acceptInvitation';
import generateInvitationToken from './generateInvitationToken';
import joinOrganization from './joinOrganization';
import leaveOrganization from './leaveOrganization';
import updateUserRole from './updateUserRole';

const app = new OpenAPIHono<{ Variables: JwtVariables }>();

const mysqlDb = MysqlConfig.getInstance(envs);

const userOrganizationRepository = new UserOrganizationRepository(mysqlDb);

const userOrganizationService = new UserOrganizationService(
  userOrganizationRepository,
  envs,
);

const userOrganizationAppService = new UserOrganizationAppService(
  userOrganizationService,
);

app.openapi(
  acceptInvitation.route,
  acceptInvitation.createHandler(userOrganizationAppService),
);
app.openapi(
  generateInvitationToken.route,
  generateInvitationToken.createHandler(userOrganizationAppService),
);
app.openapi(
  joinOrganization.route,
  joinOrganization.createHandler(userOrganizationAppService),
);
app.openapi(
  leaveOrganization.route,
  leaveOrganization.createHandler(userOrganizationAppService),
);
app.openapi(
  updateUserRole.route,
  updateUserRole.createHandler(userOrganizationAppService),
);

export default app;
