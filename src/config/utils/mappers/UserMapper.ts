import { RowDataPacket } from 'mysql2/promise';
import { IUserDTO } from '@application/DTOs';
import { User } from '@domain/entities';
import { IUserModel } from '@infrastructure/models';

export class UserMapper {
  public static mapUserDTOToEntity = (dto: IUserDTO): User => {
    const id = dto.id || crypto.randomUUID();

    const user = new User({
      id: id,
      name: dto.name ?? null,
      lastName: dto.lastName ?? null,
      email: dto.email ?? null,
      password: dto.password ?? null,
      isActive: dto.isActive ?? null,
    });
    if (dto.currentPassword) user.currentPassword = dto.currentPassword;

    return user;
  };

  public static mapUserModelToEntity = (rows: RowDataPacket[]): User[] => {
    if (!rows.length) return [];

    const usersMap = new Map<string, User>();

    for (const row of rows) {
      const userId = row.id;

      let user = usersMap.get(userId);
      if (!user) {
        user = new User({
          id: row.id,
          name: row.name,
          lastName: row.last_name,
          email: row.email,
          password: row.password_hash,
          phone: row.phone,
          isActive: row.is_active,
          lastLogin: row.last_login,
          createdAt: row.created_at,
          updatedAt: row.updated_at,
        });

        user.permissions = [];
        user.organizations = [];
        usersMap.set(userId, user);
      }

      if (row.user_org_ids) {
        const uniqueOrgs = new Set<string>();
      
        const ids: string[] = row.user_org_ids.split(',');
        const companies: string[] = row.companies_ids.split(',');
        const joinedAts: (string | Date)[] = row.joined_ats.split(',');

        const role_ids: string[] = row.role_ids.split(',');
        const role_names: string[] = row.role_names.split(',');
        const role_descriptions: (string | null)[] =
          row.role_descriptions.split(',');

        ids.forEach((id, i) => {
          if (!uniqueOrgs.has(id)) {
            uniqueOrgs.add(id);
            user.organizations.push({
              id: id,
              userId: userId,
              companyId: companies[i],
              role: {
                id: role_ids[i],
                name: role_names[i],
                description: role_descriptions[i] || null,
              },
              joinedAt: joinedAts[i],
            });
          }
        });
      }

      if (row.permission_codes) {
        const permissionCodes: string[] = row.permission_codes.split(',');
        permissionCodes.forEach((code) => {
          if (code && !user.permissions.includes(code)) {
            user.permissions.push(code);
          }
        });
      }
    }

    return Array.from(usersMap.values());
  };

  public static mapUserEntityToModel = (user: User): IUserModel => {
    return {
      id: user.id,
      name: user.name,
      last_name: user.lastName,
      email: user.email,
      password_hash: user.password,
      phone: user.phone,
      is_active: user.isActive,
      last_login: user.lastLogin,
      created_at: user.createdAt,
      updated_at: user.updatedAt,
    };
  };
}
