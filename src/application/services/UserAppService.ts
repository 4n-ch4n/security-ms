import { IUserDTO } from '@application/DTOs';
import { UserMapper } from '@config/utils/mappers';
import { User } from '@domain/entities';
import { UserService } from '@domain/services';
import {
  PaginatedResult,
  PaginationQuery,
  SelectOrganizationResult,
  SignInResult,
} from '@domain/value-objects';

export class UserAppService {
  constructor(private userService: UserService) {}

  async signIn(email: string, password: string): Promise<SignInResult> {
    const result = await this.userService.signIn(email, password);
    return result;
  }

  async selectOrganization(
    userId: string,
    companyId: string,
  ): Promise<SelectOrganizationResult> {
    const result = await this.userService.selectOrganization(userId, companyId);
    return result;
  }

  async signUp(userDTO: IUserDTO): Promise<User> {
    const user = UserMapper.mapUserDTOToEntity(userDTO);
    const response = await this.userService.signUp(user);
    return response;
  }

  async getUserById(userId: string): Promise<User | null> {
    const user = await this.userService.getUserById(userId);
    return user;
  }

  async getUserByIdWithPerms(
    id: string,
    companyId: string,
  ): Promise<User | null> {
    const user = await this.userService.getUserByIdWithPerms(id, companyId);
    return user;
  }

  async getUsersByOrganization(
    companyId: string,
    pagination: PaginationQuery,
  ): Promise<PaginatedResult<User>> {
    const users = await this.userService.getUsersByOrganization(
      companyId,
      pagination,
    );
    return users;
  }

  async updateUser(userDTO: IUserDTO): Promise<User> {
    const user = UserMapper.mapUserDTOToEntity(userDTO);
    const response = await this.userService.updateUser(user);
    return response;
  }

  async deleteUser(id: string): Promise<string> {
    const response = await this.userService.deleteUser(id);
    return response;
  }
}
