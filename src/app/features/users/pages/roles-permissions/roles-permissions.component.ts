import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { RoleService } from '@core/services/role.service';
import { UserManagementService } from '@core/services/user-management.service';
import { ConfirmDialogService } from '@core/services/confirm-dialog.service';
import { RoleFormComponent } from '../role-form/role-form.component';
import { PaginationComponent } from '@shared/components/pagination/pagination.component';
import { RoleModel, PermissionModel } from '@core/models/role.model';
import { UserModel } from '@core/models/user.model';

export interface MatrixRow {
  moduleName: string;
  readPerm?: PermissionModel;
  createPerm?: PermissionModel;
  updatePerm?: PermissionModel;
  deletePerm?: PermissionModel;
}

import {
  TmsPageHeaderComponent,
  TmsTablePanelComponent,
  TmsSearchBoxComponent,
  TmsToastComponent
} from '@shared-ui';

@Component({
  selector: 'app-roles-permissions',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    RoleFormComponent,
    PaginationComponent,
    TmsPageHeaderComponent,
    TmsTablePanelComponent,
    TmsSearchBoxComponent,
    TmsToastComponent
  ],
  templateUrl: './roles-permissions.component.html',
  styleUrls: ['./roles-permissions.component.css']
})
export class RolesPermissionsComponent implements OnInit {

  activeTab: 'roles' | 'users' = 'roles';
  loading: boolean = false;
  errorMessage: string | null = null;
  successMessage: string | null = null;

  // Roles & Permissions State
  roles: RoleModel[] = [];
  permissions: PermissionModel[] = [];
  matrixRows: MatrixRow[] = [];

  // Users State
  users: UserModel[] = [];
  filteredUsers: UserModel[] = [];
  paginatedUsers: UserModel[] = [];

  // Pagination State for Users Table
  userSearchQuery: string = '';
  currentPage: number = 1;
  pageSize: number = 10;


  // Modals visibility
  showRoleModal: boolean = false;
  showAssignModal: boolean = false;
  showUserModal: boolean = false;
  isEditRoleMode: boolean = false;
  isEditUserMode: boolean = false;
  showCreateUserPassword: boolean = false;


  // Forms
  roleForm!: FormGroup;
  userForm!: FormGroup;

  // Selected State
  selectedRole: RoleModel | null = null;
  selectedUser: UserModel | null = null;
  selectedPermissionIds: Set<number> = new Set<number>();

  constructor(
    private fb: FormBuilder,
    private roleService: RoleService,
    private userService: UserManagementService,
    private confirmDialog: ConfirmDialogService
  ) {}

  ngOnInit(): void {
    this.initForms();
    this.loadRolesData();
    this.loadPermissionsData();
    this.loadUsersData();
  }

  private initForms(): void {
    this.roleForm = this.fb.group({
      roleCode: ['', [Validators.required]],
      roleName: ['', [Validators.required]],
      description: ['']
    });

    this.userForm = this.fb.group({
      username: ['', [Validators.required]],
      password: [''],
      newPassword: [''],
      firstname: [''],
      lastname: [''],
      email: ['', [Validators.email]],
      phone: [''],
      roleId: [null],
      workStartTime: [''],
      workEndTime: [''],
      isActive: [true]
    });


  }

  setActiveTab(tab: 'roles' | 'users'): void {
    this.activeTab = tab;
    this.clearAlerts();
  }

  clearAlerts(): void {
    this.errorMessage = null;
    this.successMessage = null;
  }

  showSuccess(msg: string): void {
    this.successMessage = msg;
    setTimeout(() => { this.successMessage = null; }, 1790);
  }

  showError(msg: string): void {
    this.errorMessage = msg;
    setTimeout(() => { this.errorMessage = null; }, 1790);
  }

  // --- ROLES & PERMISSIONS DATA ---
  loadRolesData(): void {
    this.loading = true;
    this.roleService.getAllRoles().subscribe({
      next: (res) => {
        this.loading = false;
        if (res.success) {
          this.roles = res.data || [];
        }
      },
      error: () => {
        this.loading = false;
        this.errorMessage = 'Không thể tải danh sách vai trò từ máy chủ.';
      }
    });
  }

  loadPermissionsData(): void {
    this.roleService.getAllPermissions().subscribe({
      next: (res) => {
        if (res.success && res.data) {
          this.permissions = res.data;
          this.buildMatrixRows(res.data);
        }
      }
    });
  }

  private buildMatrixRows(perms: PermissionModel[]): void {
    const map = new Map<string, MatrixRow>();

    perms.forEach(p => {
      let moduleName = p.resourceGroup || p.description || 'Khác';
      if (!p.resourceGroup) {
        if (p.permissionCode.startsWith('SHIPMENT')) moduleName = 'Quản lý Đơn Hàng';
        else if (p.permissionCode.startsWith('VEHICLE')) moduleName = 'Quản lý Đội Xe';
        else if (p.permissionCode.startsWith('EMPLOYEE')) moduleName = 'Quản lý Nhân Sự';
        else if (p.permissionCode.startsWith('EXPENSE')) moduleName = 'Quản lý Chi Phí';
        else if (p.permissionCode.startsWith('FINANCE')) moduleName = 'Quản lý Tài Chính';
        else if (p.permissionCode.startsWith('USER')) moduleName = 'Quản lý Người Dùng';
        else if (p.permissionCode.startsWith('ROLE')) moduleName = 'Quản lý Phân Quyền';
        else if (p.permissionCode.startsWith('SYSTEM_FEATURE')) moduleName = 'Cài Đặt Hệ Thống';
      }

      if (!map.has(moduleName)) {
        map.set(moduleName, { moduleName });
      }

      const row = map.get(moduleName)!;
      const code = p.permissionCode;
      const act = p.actionType;

      if (act === 'READ' || code.endsWith('_READ')) row.readPerm = p;
      else if (act === 'CREATE' || code.endsWith('_CREATE') || code.endsWith('_WRITE')) row.createPerm = p;
      else if (act === 'UPDATE' || code.endsWith('_UPDATE')) row.updatePerm = p;
      else if (act === 'DELETE' || code.endsWith('_DELETE')) row.deletePerm = p;
      else {
        if (!row.readPerm) row.readPerm = p;
      }
    });

    this.matrixRows = Array.from(map.values());
  }

  // --- MATRIX TOGGLE ACTIONS ---
  isPermissionSelected(permissionId?: number): boolean {
    if (!permissionId) return false;
    return this.selectedPermissionIds.has(permissionId);
  }

  togglePermission(permissionId?: number): void {
    if (!permissionId) return;
    if (this.selectedPermissionIds.has(permissionId)) {
      this.selectedPermissionIds.delete(permissionId);
    } else {
      this.selectedPermissionIds.add(permissionId);
    }
  }

  // Toggle Entire Row (Module)
  isRowAllSelected(row: MatrixRow): boolean {
    const rowPerms = [row.readPerm, row.createPerm, row.updatePerm, row.deletePerm].filter(p => p !== undefined) as PermissionModel[];
    if (rowPerms.length === 0) return false;
    return rowPerms.every(p => this.selectedPermissionIds.has(p.permissionId));
  }

  toggleRow(row: MatrixRow): void {
    const rowPerms = [row.readPerm, row.createPerm, row.updatePerm, row.deletePerm].filter(p => p !== undefined) as PermissionModel[];
    const allSelected = this.isRowAllSelected(row);

    rowPerms.forEach(p => {
      if (allSelected) {
        this.selectedPermissionIds.delete(p.permissionId);
      } else {
        this.selectedPermissionIds.add(p.permissionId);
      }
    });
  }

  // Toggle Entire Column (e.g. READ, CREATE, UPDATE, DELETE)
  isColumnAllSelected(actionType: 'read' | 'create' | 'update' | 'delete'): boolean {
    const colPerms = this.matrixRows
      .map(r => r[`${actionType}Perm`])
      .filter(p => p !== undefined) as PermissionModel[];

    if (colPerms.length === 0) return false;
    return colPerms.every(p => this.selectedPermissionIds.has(p.permissionId));
  }

  toggleColumn(actionType: 'read' | 'create' | 'update' | 'delete'): void {
    const colPerms = this.matrixRows
      .map(r => r[`${actionType}Perm`])
      .filter(p => p !== undefined) as PermissionModel[];

    const allSelected = this.isColumnAllSelected(actionType);
    colPerms.forEach(p => {
      if (allSelected) {
        this.selectedPermissionIds.delete(p.permissionId);
      } else {
        this.selectedPermissionIds.add(p.permissionId);
      }
    });
  }

  // Global Master Switch
  isGlobalAllSelected(): boolean {
    if (this.permissions.length === 0) return false;
    return this.permissions.every(p => this.selectedPermissionIds.has(p.permissionId));
  }

  toggleGlobalSelectAll(): void {
    if (this.isGlobalAllSelected()) {
      this.selectedPermissionIds.clear();
    } else {
      this.permissions.forEach(p => this.selectedPermissionIds.add(p.permissionId));
    }
  }

  // --- ROLE MODAL HANDLERS ---
  openCreateRoleModal(): void {
    this.isEditRoleMode = false;
    this.selectedRole = null;
    this.roleForm.reset();
    this.showRoleModal = true;
  }

  openEditRoleModal(role: RoleModel): void {
    this.isEditRoleMode = true;
    this.selectedRole = role;
    this.roleForm.patchValue({
      roleCode: role.roleCode,
      roleName: role.roleName,
      description: role.description
    });
    this.roleForm.controls['roleCode'].disable();
    this.showRoleModal = true;
  }

  closeRoleModal(): void {
    this.showRoleModal = false;
    this.roleForm.controls['roleCode'].enable();
  }

  onSaveRole(): void {
    if (this.roleForm.invalid) return;
    this.loading = true;
    const val = this.roleForm.getRawValue();

    if (this.isEditRoleMode && this.selectedRole) {
      this.roleService.updateRole(this.selectedRole.roleId, val).subscribe({
        next: (res: any) => {
          this.loading = false;
          this.showSuccess(res.message || 'Thao tác thành công');
          this.closeRoleModal();
          this.loadRolesData();
        },
        error: (err) => {
          this.loading = false;
          this.showError(err.error?.message || 'Thao tác thất bại');
        }
      });
    } else {
      this.roleService.createRole(val).subscribe({
        next: (res: any) => {
          this.loading = false;
          this.showSuccess(res.message || 'Thao tác thành công');
          this.closeRoleModal();
          this.loadRolesData();
        },
        error: (err) => {
          this.loading = false;
          this.showError(err.error?.message || 'Thao tác thất bại');
        }
      });
    }
  }

  onDeleteRole(role: RoleModel): void {
    this.confirmDialog.confirm({
      title: 'Xóa Vai Trò Người Dùng',
      message: `Bạn có chắc chắn muốn xóa vai trò "${role.roleName}"?`,
      confirmText: 'Đồng Ý Xóa',
      cancelText: 'Hủy Bỏ',
      type: 'danger',
      onConfirm: () => {
        this.loading = true;
        this.roleService.deleteRole(role.roleId).subscribe({
          next: (res: any) => {
            this.loading = false;
            this.showSuccess(res.message || 'Thao tác thành công');
            this.loadRolesData();
          },
          error: (err) => {
            this.loading = false;
            this.showError(err.error?.message || 'Thao tác thất bại');
          }
        });
      }
    });
  }

  // --- ASSIGN PERMISSIONS MATRIX MODAL ---
  openAssignModal(role: RoleModel): void {
    this.selectedRole = role;
    this.selectedPermissionIds.clear();

    if (role.permissions) {
      role.permissions.forEach(p => this.selectedPermissionIds.add(p.permissionId));
    }
    this.showAssignModal = true;
  }

  closeAssignModal(): void {
    this.showAssignModal = false;
  }

  onSavePermissions(): void {
    if (!this.selectedRole) return;
    this.loading = true;

    const request = {
      roleId: this.selectedRole.roleId,
      permissionIds: Array.from(this.selectedPermissionIds)
    };

    this.roleService.assignPermissions(request).subscribe({
      next: () => {
        this.loading = false;
        this.successMessage = `Đã cập nhật Bảng ma trận phân quyền cho vai trò ${this.selectedRole?.roleName}!`;
        this.closeAssignModal();
        this.loadRolesData();
      },
      error: (err) => {
        this.loading = false;
        this.errorMessage = err.error?.message || 'Không thể cập nhật quyền hạn.';
      }
    });
  }

  // --- USERS DATA & HANDLERS ---
  loadUsersData(): void {
    this.userService.getAllUsers().subscribe({
      next: (res) => {
        if (res.success && res.data) {
          this.users = res.data;
          this.applyUserFilter();
        }
      }
    });
  }


  applyUserFilter(): void {
    let result = [...this.users];
    if (this.userSearchQuery && this.userSearchQuery.trim() !== '') {
      const q = this.userSearchQuery.toLowerCase().trim();
      result = result.filter(u =>
        (u.username && u.username.toLowerCase().includes(q)) ||
        (u.firstname && u.firstname.toLowerCase().includes(q)) ||
        (u.lastname && u.lastname.toLowerCase().includes(q)) ||
        (u.email && u.email.toLowerCase().includes(q)) ||
        (u.phone && u.phone.toLowerCase().includes(q)) ||
        (u.roleName && u.roleName.toLowerCase().includes(q))
      );

    }
    this.filteredUsers = result;
    this.currentPage = 1;
    this.updatePaginatedUsers();
  }

  updatePaginatedUsers(): void {
    const startIndex = (this.currentPage - 1) * this.pageSize;
    const endIndex = startIndex + this.pageSize;
    this.paginatedUsers = this.filteredUsers.slice(startIndex, endIndex);
  }

  onUserSearchChange(): void {
    this.applyUserFilter();
  }

  onPageChange(page: number): void {
    this.currentPage = page;
    this.updatePaginatedUsers();
  }

  onPageSizeChange(size: number): void {
    this.pageSize = size;
    this.currentPage = 1;
    this.updatePaginatedUsers();
  }


  openCreateUserModal(): void {
    this.isEditUserMode = false;
    this.showCreateUserPassword = false;
    this.selectedUser = null;
    this.userForm.reset({ isActive: true });
    this.userForm.controls['username'].enable();
    this.userForm.controls['password'].setValidators([Validators.required, Validators.minLength(4)]);
    this.userForm.controls['password'].updateValueAndValidity();
    this.showUserModal = true;
  }

  toggleShowCreateUserPassword(): void {
    this.showCreateUserPassword = !this.showCreateUserPassword;
  }


  openEditUserModal(user: UserModel): void {
    this.isEditUserMode = true;
    this.showCreateUserPassword = false;
    this.selectedUser = user;
    this.userForm.patchValue({
      username: user.username,
      password: '',
      newPassword: '',
      firstname: user.firstname,
      lastname: user.lastname,
      email: user.email,
      phone: user.phone,
      roleId: user.roleId,
      workStartTime: user.workStartTime,
      workEndTime: user.workEndTime,
      isActive: user.isActive
    });
    this.userForm.controls['username'].disable();
    this.userForm.controls['password'].clearValidators();
    this.userForm.controls['password'].updateValueAndValidity();
    this.showUserModal = true;
  }



  closeUserModal(): void {
    this.showUserModal = false;
  }

  onSaveUser(): void {
    if (this.userForm.invalid) return;
    this.loading = true;
    const val = this.userForm.getRawValue();

    if (this.isEditUserMode && this.selectedUser) {
      this.userService.updateUser(this.selectedUser.userId, val).subscribe({
        next: (res: any) => {
          this.loading = false;
          this.showSuccess(res.message || 'Thao tác thành công');
          this.closeUserModal();
          this.loadUsersData();
        },
        error: (err) => {
          this.loading = false;
          this.showError(err.error?.message || 'Thao tác thất bại');
        }
      });
    } else {
      this.userService.createUser(val).subscribe({
        next: (res: any) => {
          this.loading = false;
          this.showSuccess(res.message || 'Tạo mới tài khoản thành công');
          this.closeUserModal();
          this.loadUsersData();
        },
        error: (err) => {
          this.loading = false;
          this.showError(err.error?.message || 'Thao tác thất bại');
        }
      });
    }

  }

  onResetUserPassword(user: UserModel): void {
    this.confirmDialog.confirm({
      title: 'Đặt Lại Mật Khẩu Tải Khoản',
      message: `Bạn có chắc chắn muốn đặt lại mật khẩu cho tài khoản "${user.username}" về mật khẩu mặc định "Admin@6879"?`,
      confirmText: 'Xác Nhận Đặt Lại',
      cancelText: 'Hủy Bỏ',
      type: 'warning',
      onConfirm: () => {
        this.loading = true;
        this.userService.resetPassword(user.userId).subscribe({
          next: (res: any) => {
            this.loading = false;
            this.showSuccess(res.message || `Đã đặt lại mật khẩu cho tài khoản ${user.username} thành công`);
          },
          error: (err) => {
            this.loading = false;
            this.showError(err.error?.message || 'Thao tác thất bại');
          }
        });
      }
    });
  }

  onDeleteUser(user: UserModel): void {
    this.confirmDialog.confirm({
      title: 'Xóa Tài Khoản Người Dùng',
      message: `Bạn có chắc chắn muốn xóa tài khoản "${user.username}" khỏi hệ thống?`,
      confirmText: 'Đồng Ý Xóa',
      cancelText: 'Hủy Bỏ',
      type: 'danger',
      onConfirm: () => {
        this.loading = true;
        this.userService.deleteUser(user.userId).subscribe({
          next: (res: any) => {
            this.loading = false;
            this.showSuccess(res.message || 'Thao tác thành công');
            this.loadUsersData();
          },
          error: (err) => {
            this.loading = false;
            this.showError(err.error?.message || 'Thao tác thất bại');
          }
        });
      }
    });
  }
}
