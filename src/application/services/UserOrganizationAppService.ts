import { IUserOrganizationDTO } from '@application/DTOs';
import { UserOrganizationService } from '@domain/services';
import { UserOrganization } from '@domain/value-objects';

export class UserOrganizationAppService {
  constructor(private userOrganizationService: UserOrganizationService) {}

  async joinOrganization(
    userOrganizationDTO: IUserOrganizationDTO,
  ): Promise<UserOrganization> {
    const userOrganization: UserOrganization = {
      id: userOrganizationDTO.id || crypto.randomUUID(),
      userId: userOrganizationDTO.userId,
      companyId: userOrganizationDTO.companyId,
      role: {
        id: userOrganizationDTO.rolId || '',
        name: '',
        description: '',
      },
      joinedAt: new Date(),
    };

    const response =
      await this.userOrganizationService.joinOrganization(userOrganization);
    return response;
  }

  async leaveOrganization(userId: string, companyId: string): Promise<void> {
    await this.userOrganizationService.leaveOrganization(userId, companyId);
  }

  async updateUserRole(
    userOrganizationDTO: IUserOrganizationDTO,
  ): Promise<UserOrganization> {
    const userOrganization: UserOrganization = {
      id: userOrganizationDTO.id || '',
      userId: userOrganizationDTO.userId,
      companyId: userOrganizationDTO.companyId,
      role: {
        id: userOrganizationDTO.rolId || '',
        name: '',
        description: '',
      },
      joinedAt: null,
    };

    const response =
      await this.userOrganizationService.updateUserRole(userOrganization);
    return response;
  }

  async generateInvitationToken(
    companyId: string,
    roleId: string,
    email: string,
  ): Promise<string> {
    const token = await this.userOrganizationService.generateInvitationToken(
      companyId,
      roleId,
      email,
    );
    return token;
  }

  async acceptInvitation(
    userId: string,
    userEmail: string,
    token: string,
  ): Promise<UserOrganization> {
    return await this.userOrganizationService.acceptInvitation(
      userId,
      userEmail,
      token,
    );
  }
}
