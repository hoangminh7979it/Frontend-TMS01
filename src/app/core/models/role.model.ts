export interface PermissionModel {
  permissionId: number;
  permissionCode: string;
  permissionName: string;
  resourceGroup?: string;
  actionType?: string;
  description: string;
}

export interface RoleModel {
  roleId: number;
  roleCode: string;
  roleName: string;
  description: string;
  permissions?: PermissionModel[];
}

export interface RoleRequest {
  roleCode: string;
  roleName: string;
  description?: string;
  permissionIds?: number[];
}

export interface AssignPermissionsRequest {
  roleId: number;
  permissionIds: number[];
}
