import { User } from '@domain/entities/User';

export type SelectOrganizationResult = {
  accessToken: string;
  user: User;
};
