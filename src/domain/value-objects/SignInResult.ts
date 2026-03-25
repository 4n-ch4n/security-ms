import { UserOrganization } from './UserOrganization';

export type SignInResult = {
  identityToken: string;
  organizations: UserOrganization[];
};
