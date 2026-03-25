import { UserOrganization } from '../value-objects/UserOrganization';

export class User {
  public permissions: string[] = [];
  public currentPassword: string = '';
  public organizations: UserOrganization[] = [];

  public id: string;
  public name: string | null;
  public lastName: string | null;
  public email: string | null;
  public password: string | null;
  public phone: string | null;
  public isActive: boolean | null;
  public lastLogin: Date | string | null;
  public createdAt: Date | string | null;
  public updatedAt: Date | string | null;

  constructor({
    id,
    name = null,
    lastName = null,
    email = null,
    password = null,
    phone = null,
    isActive = null,
    lastLogin = null,
    createdAt = null,
    updatedAt = null,
  }: {
    id: string;
    name?: string | null;
    lastName?: string | null;
    email?: string | null;
    password?: string | null;
    phone?: string | null;
    isActive?: boolean | null;
    lastLogin?: Date | string | null;
    createdAt?: Date | string | null;
    updatedAt?: Date | string | null;
  }) {
    this.id = id;
    this.name = name;
    this.lastName = lastName;
    this.email = email;
    this.password = password;
    this.phone = phone;
    this.isActive = isActive;
    this.lastLogin = lastLogin;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
  }

  setPasswordEmpty(): void {
    this.password = '';
  }
}
