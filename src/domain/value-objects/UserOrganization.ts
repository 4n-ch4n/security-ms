import { Role } from './Role';

export interface UserOrganization {
  id: string;
  userId: string;
  companyId: string;
  role: Role;
  joinedAt: Date | string;
}
