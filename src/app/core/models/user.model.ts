export interface UserModel {
  userId: number;
  username: string;
  firstname: string;
  lastname: string;
  email: string;
  phone: string;
  isActive: boolean;
  workStartTime?: string;
  workEndTime?: string;
  roleId?: number;
  roleCode?: string;
  roleName?: string;
  createDate?: string;
}
