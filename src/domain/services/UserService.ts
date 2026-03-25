import { sign } from 'hono/jwt';
import { compare, hash } from 'bcrypt';
import { envs } from '@config';
import {
  ApiErrorResponse,
  ErrorCode,
  StatusCode,
} from '@config/schemas/response';
import {
  PaginatedResult,
  PaginationQuery,
  SelectOrganizationResult,
  SignInResult,
} from '../value-objects';
import {
  IUserRepository,
  IUserOrganizationRepository,
  IRoleRepository,
} from '../repositories';
import { User } from '../entities/User';

export class UserService {
  constructor(
    private environments: typeof envs,
    private roleRepository: IRoleRepository,
    private userOrganizationRepository: IUserOrganizationRepository,
    private userRepository: IUserRepository,
  ) {}

  async signIn(email: string, password: string): Promise<SignInResult> {
    const user = await this.userRepository.getUserByEmail(email);
    if (!user) {
      throw new ApiErrorResponse(
        StatusCode.UNAUTHORIZED,
        ErrorCode.UNAUTHORIZED,
        'Email or password invalid',
      );
    }

    const match = await compare(password, user.password!);
    if (!match) {
      throw new ApiErrorResponse(
        StatusCode.UNAUTHORIZED,
        ErrorCode.UNAUTHORIZED,
        'Email or password invalid',
      );
    }

    const organizations =
      await this.userOrganizationRepository.getUserOrganizations(user.id);

    const identityToken = await sign(
      {
        userId: user.id,
        email: user.email,
        type: 'identity',
        exp: Math.floor(Date.now() / 1000) + 10 * 60, // 10 minutes
      },
      this.environments.secretJwt,
      'HS256',
    );

    return { identityToken, organizations };
  }

  async selectOrganization(
    userId: string,
    companyId: string,
  ): Promise<SelectOrganizationResult> {
    const [user, organizations] = await Promise.all([
      this.userRepository.getUserById(userId),
      this.userOrganizationRepository.getUserOrganizations(userId),
    ]);

    if (!user) {
      throw new ApiErrorResponse(
        StatusCode.UNAUTHORIZED,
        ErrorCode.UNAUTHORIZED,
        'User not found',
      );
    }

    const membership = organizations.find(
      (organization) => organization.companyId === companyId,
    );
    if (!membership) {
      throw new ApiErrorResponse(
        StatusCode.FORBIDDEN,
        ErrorCode.FORBIDDEN,
        'User does not belong to this organization',
      );
    }

    const permissions = await this.roleRepository.getPermissionsByRoleId(
      membership.role.id,
    );

    user.lastLogin = new Date();
    await this.userRepository.updateUser(user);

    user.permissions = permissions;

    const accessToken = await sign(
      {
        userId: user.id,
        email: user.email,
        companyId,
        permissions,
        exp: Math.floor(Date.now() / 1000) + 8 * 60 * 60, // 8 hours
      },
      this.environments.secretJwt,
      'HS256',
    );

    return { user, accessToken };
  }

  async signUp(user: User) {
    user.isActive = false;
    user.password = await hash(user.password!, 5); // Non-null assertion
    if (await this.validateUserEmail(user.email!)) {
      throw new ApiErrorResponse(
        StatusCode.CONFLICT,
        ErrorCode.OPERATION_NOT_ALLOWED,
        'The email already exists',
      );
    }

    await this.userRepository.createUser(user);

    return user;
  }

  async getUserById(id: string): Promise<User | null> {
    const user = await this.userRepository.getUserById(id);
    if (!user) return null;

    user.setPasswordEmpty();
    return user;
  }

  async getUserByIdWithPerms(
    id: string,
    companyId: string,
  ): Promise<User | null> {
    const [user, organizations] = await Promise.all([
      this.userRepository.getUserById(id),
      this.userOrganizationRepository.getUserOrganizations(id),
    ]);
    if (!user) return null;

    const membership = organizations.find(
      (organization) => organization.companyId === companyId,
    );
    if (!membership) {
      throw new ApiErrorResponse(
        StatusCode.FORBIDDEN,
        ErrorCode.FORBIDDEN,
        'User does not belong to this organization',
      );
    }

    const permissions = await this.roleRepository.getPermissionsByRoleId(
      membership.role.id,
    );

    user.permissions = permissions;

    user.setPasswordEmpty();

    return user;
  }

  async validateUserEmail(email: string): Promise<boolean> {
    const user = await this.userRepository.getUserByEmail(email);
    return !!user;
  }

  async getUsersByOrganization(
    companyId: string,
    pagination: PaginationQuery,
  ): Promise<PaginatedResult<User>> {
    const result = await this.userRepository.getUsersByOrganization(
      companyId,
      pagination,
    );
    result.data.forEach((user) => user.setPasswordEmpty());

    return result;
  }

  async updateUser(user: User): Promise<User> {
    user.updatedAt = new Date();

    if (user.currentPassword) {
      const userToValidate = await this.userRepository.getUserById(user.id);
      if (!userToValidate) {
        throw new ApiErrorResponse(
          StatusCode.BAD_REQUEST,
          ErrorCode.UNAUTHORIZED,
          'User not found',
        );
      }

      const match = await compare(
        user.currentPassword as string,
        userToValidate.password as string,
      );
      if (!match) {
        throw new ApiErrorResponse(
          StatusCode.UNAUTHORIZED,
          ErrorCode.UNAUTHORIZED,
          'Invalid password',
        );
      }

      user.password = await hash(user.password!, 5); // Non-null assertion
    }

    await this.userRepository.updateUser(user);

    return user;
  }

  async deleteUser(id: string): Promise<string> {
    await this.userRepository.deleteUser(id);
    return id;
  }
}
