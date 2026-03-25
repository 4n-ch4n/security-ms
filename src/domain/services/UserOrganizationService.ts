import { envs } from '@config';
import { UserOrganization } from '../value-objects';
import { IUserOrganizationRepository } from '../repositories';
import {
  ApiErrorResponse,
  ErrorCode,
  StatusCode,
} from '@config/schemas/response';
import { verify, sign } from 'hono/jwt';

export class UserOrganizationService {
  constructor(
    private userOrganizationRepository: IUserOrganizationRepository,
    private environments: typeof envs,
  ) {}

  async joinOrganization(
    userOrganization: UserOrganization,
  ): Promise<UserOrganization> {
    const existingOrgs =
      await this.userOrganizationRepository.getUserOrganizations(
        userOrganization.userId,
      );
    const isAlreadyMember = existingOrgs.some(
      (org) => org.companyId === userOrganization.companyId,
    );

    if (isAlreadyMember) {
      throw new ApiErrorResponse(
        StatusCode.BAD_REQUEST,
        ErrorCode.OPERATION_NOT_ALLOWED,
        'User is already a member of this organization',
      );
    }

    await this.userOrganizationRepository.assignUserToOrganization(
      userOrganization,
    );
    return userOrganization;
  }

  async leaveOrganization(userId: string, companyId: string): Promise<void> {
    const existingOrgs =
      await this.userOrganizationRepository.getUserOrganizations(userId);
    const isMember = existingOrgs.some((org) => org.companyId === companyId);
    const organization = existingOrgs.find(
      (org) => org.companyId === companyId,
    );

    if (!isMember) {
      throw new ApiErrorResponse(
        StatusCode.BAD_REQUEST,
        ErrorCode.OPERATION_NOT_ALLOWED,
        'User is not a member of this organization',
      );
    }

    if (organization?.role.name === 'OWNER') {
      throw new ApiErrorResponse(
        StatusCode.BAD_REQUEST,
        ErrorCode.OPERATION_NOT_ALLOWED,
        'Organization owner cannot leave the organization',
      );
    }

    await this.userOrganizationRepository.removeUserFromOrganization(
      userId,
      companyId,
    );
  }

  async updateUserRole(
    userOrganization: UserOrganization,
  ): Promise<UserOrganization> {
    await this.userOrganizationRepository.assignRoleToUser(
      userOrganization.userId,
      userOrganization.companyId,
      userOrganization.role.id,
    );
    return userOrganization;
  }

  async generateInvitationToken(
    companyId: string,
    roleId: string,
    email: string,
  ): Promise<string> {
    const token = await sign(
      {
        companyId,
        roleId,
        email,
        exp: Math.floor(Date.now() / 1000) + 8 * 60 * 60,
      },
      this.environments.secretJwt,
      'HS256',
    );

    return token;
  }

  async acceptInvitation(userId: string, token: string): Promise<void> {
    try {
      const payload = await verify(token, this.environments.secretJwt, 'HS256');

      const { companyId, roleId } = payload as {
        companyId: string;
        roleId: string;
        email: string;
      };

      const userOrganization: UserOrganization = {
        id: crypto.randomUUID(),
        userId,
        companyId,
        role: { id: roleId, name: '', description: '' },
        joinedAt: new Date(),
      };

      await this.joinOrganization(userOrganization);
    } catch (error) {
      throw new ApiErrorResponse(
        StatusCode.BAD_REQUEST,
        ErrorCode.OPERATION_NOT_ALLOWED,
        'Invalid or expired token',
      );
    }
  }
}
