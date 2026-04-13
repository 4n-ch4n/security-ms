import { IRoleRepository } from "../repositories";
import { Role } from "../value-objects";

export class RolesService {
    constructor(private roleRepository: IRoleRepository) {}

    async getRoles(): Promise<Role[]> {
        const roles = await this.roleRepository.getRoles();
        return roles;
    }
}