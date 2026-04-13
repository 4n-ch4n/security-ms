import { RolesService } from '@domain/services';
import { Role } from '@domain/value-objects';

export class RolesAppService {
  constructor(private rolesService: RolesService) {}

  async getRoles(): Promise<Role[]> {
    const roles = await this.rolesService.getRoles();
    return roles;
  }
}
