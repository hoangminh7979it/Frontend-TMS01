import { Routes } from '@angular/router';
import { LoginComponent } from './features/auth/components/login/login.component';
import { MainLayoutComponent } from './layouts/main-layout/main-layout.component';
import { DashboardHomeComponent } from './features/dashboard/pages/dashboard-home/dashboard-home.component';
import { RolesPermissionsComponent } from './features/users/pages/roles-permissions/roles-permissions.component';
import { EmployeeListComponent } from './features/employees/pages/employee-list/employee-list.component';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'dashboard',
    pathMatch: 'full'
  },
  {
    path: 'login',
    component: LoginComponent
  },
  {
    path: '',
    component: MainLayoutComponent,
    children: [
      {
        path: 'dashboard',
        component: DashboardHomeComponent
      },
      {
        path: 'users',
        component: RolesPermissionsComponent
      },
      {
        path: 'employees',
        component: EmployeeListComponent
      },
      {
        path: 'shipments',
        component: DashboardHomeComponent
      },
      {
        path: 'vehicles',
        component: DashboardHomeComponent
      },
      {
        path: 'expenses',
        component: DashboardHomeComponent
      },
      {
        path: 'finance',
        component: DashboardHomeComponent
      },
      {
        path: 'settings',
        component: DashboardHomeComponent
      }
    ]
  },
  {
    path: '**',
    redirectTo: 'dashboard'
  }
];
