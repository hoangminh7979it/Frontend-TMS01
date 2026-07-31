import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiResponse } from '../models/auth.model';
import { RoleModel, RoleRequest, PermissionModel, AssignPermissionsRequest } from '../models/role.model';

@Injectable({
  providedIn: 'root'
})
export class RoleService {

  private readonly ROLES_API = 'http://localhost:8080/api/v1/roles';
  private readonly PERMISSIONS_API = 'http://localhost:8080/api/v1/permissions';

  constructor(private http: HttpClient) {}

  public getAllRoles(): Observable<ApiResponse<RoleModel[]>> {
    return this.http.get<ApiResponse<RoleModel[]>>(this.ROLES_API);
  }

  public getRoleById(id: number): Observable<ApiResponse<RoleModel>> {
    return this.http.get<ApiResponse<RoleModel>>(`${this.ROLES_API}/${id}`);
  }

  public createRole(request: RoleRequest): Observable<ApiResponse<RoleModel>> {
    return this.http.post<ApiResponse<RoleModel>>(this.ROLES_API, request);
  }

  public updateRole(id: number, request: RoleRequest): Observable<ApiResponse<RoleModel>> {
    return this.http.put<ApiResponse<RoleModel>>(`${this.ROLES_API}/${id}`, request);
  }

  public deleteRole(id: number): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`${this.ROLES_API}/${id}`);
  }

  public assignPermissions(request: AssignPermissionsRequest): Observable<ApiResponse<RoleModel>> {
    return this.http.post<ApiResponse<RoleModel>>(`${this.ROLES_API}/assign-permissions`, request);
  }

  public getAllPermissions(): Observable<ApiResponse<PermissionModel[]>> {
    return this.http.get<ApiResponse<PermissionModel[]>>(this.PERMISSIONS_API);
  }

  public getPermissionsByRoleId(roleId: number): Observable<ApiResponse<PermissionModel[]>> {
    return this.http.get<ApiResponse<PermissionModel[]>>(`${this.PERMISSIONS_API}/role/${roleId}`);
  }
}
