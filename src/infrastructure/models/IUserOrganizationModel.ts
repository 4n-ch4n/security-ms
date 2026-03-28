export interface IUserOrganizationModel {
  id: string;
  userId: string;
  companyId: string;
  rolId: string | null;
  joinedAt: Date | string | null;
}
