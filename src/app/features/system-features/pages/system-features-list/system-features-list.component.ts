import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { SystemFeatureService } from '@core/services/system-feature.service';
import { ConfirmDialogService } from '@core/services/confirm-dialog.service';
import { ToastService } from '@core/services/toast.service';
import { SystemFeatureModel } from '@core/models/system-feature.model';
import { SystemFeaturesFormComponent } from '../system-features-form/system-features-form.component';

import {
  TmsPageHeaderComponent,
  TmsTablePanelComponent,
  TmsSearchBoxComponent,
  TmsToastComponent,
  TmsStatusBadgeComponent
} from '@shared-ui';

@Component({
  selector: 'app-system-features-list',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    SystemFeaturesFormComponent,
    TmsPageHeaderComponent,
    TmsTablePanelComponent,
    TmsSearchBoxComponent,
    TmsToastComponent,
    TmsStatusBadgeComponent
  ],
  templateUrl: './system-features-list.component.html',
  styleUrls: ['./system-features-list.component.css']
})
export class SystemFeaturesListComponent implements OnInit {

  loading: boolean = false;
  errorMessage: string | null = null;
  successMessage: string | null = null;

  features: SystemFeatureModel[] = [];
  filteredFeatures: SystemFeatureModel[] = [];

  searchQuery: string = '';

  showFeatureModal: boolean = false;
  isEditMode: boolean = false;
  selectedFeature: SystemFeatureModel | null = null;
  featureForm!: FormGroup;

  constructor(
    private fb: FormBuilder,
    private systemFeatureService: SystemFeatureService,
    private confirmDialog: ConfirmDialogService,
    private toastService: ToastService
  ) {}

  ngOnInit(): void {
    this.initForm();
    this.loadFeatures();
  }

  private initForm(): void {
    this.featureForm = this.fb.group({
      featureCode: ['', [Validators.required]],
      featureName: ['', [Validators.required]],
      routePath: [''],
      iconClass: ['fa-solid fa-cube'],
      resourceGroup: [''],
      sortOrder: [0],
      isActive: [true],
      description: ['']
    });
  }

  showSuccess(msg: string): void {
    this.toastService.success(msg);
  }

  showError(msg: string): void {
    this.toastService.error(msg);
  }

  loadFeatures(): void {
    this.loading = true;
    this.systemFeatureService.getAllFeatures().subscribe({
      next: (res) => {
        this.loading = false;
        if (res.success && res.data) {
          this.features = res.data;
          this.applyFilter();
        }
      },
      error: () => {
        this.loading = false;
        this.showError('Không thể tải danh sách tính năng hệ thống.');
      }
    });
  }

  applyFilter(): void {
    if (!this.searchQuery.trim()) {
      this.filteredFeatures = [...this.features];
      return;
    }

    const q = this.searchQuery.toLowerCase().trim();
    this.filteredFeatures = this.features.filter(f =>
      f.featureCode.toLowerCase().includes(q) ||
      f.featureName.toLowerCase().includes(q) ||
      (f.resourceGroup && f.resourceGroup.toLowerCase().includes(q)) ||
      (f.routePath && f.routePath.toLowerCase().includes(q))
    );
  }

  onSearchChange(): void {
    this.applyFilter();
  }

  openCreateFeatureModal(): void {
    this.isEditMode = false;
    this.selectedFeature = null;
    this.featureForm.reset({
      featureCode: '',
      featureName: '',
      routePath: '',
      iconClass: 'fa-solid fa-cube',
      resourceGroup: '',
      sortOrder: this.features.length + 1,
      isActive: true,
      description: ''
    });
    this.showFeatureModal = true;
  }

  openEditFeatureModal(f: SystemFeatureModel): void {
    this.isEditMode = true;
    this.selectedFeature = f;
    this.featureForm.patchValue({
      featureCode: f.featureCode,
      featureName: f.featureName,
      routePath: f.routePath,
      iconClass: f.iconClass,
      resourceGroup: f.resourceGroup,
      sortOrder: f.sortOrder,
      isActive: f.isActive,
      description: f.description
    });
    this.showFeatureModal = true;
  }

  closeFeatureModal(): void {
    this.showFeatureModal = false;
  }

  onSaveFeature(): void {
    if (this.featureForm.invalid) {
      this.featureForm.markAllAsTouched();
      this.showError('Vui lòng điền đầy đủ các thông tin bắt buộc.');
      return;
    }

    const payload: SystemFeatureModel = this.featureForm.value;
    this.loading = true;

    if (this.isEditMode && this.selectedFeature?.featureId) {
      this.systemFeatureService.updateFeature(this.selectedFeature.featureId, payload).subscribe({
        next: (res) => {
          this.loading = false;
          if (res.success) {
            this.showSuccess('Cập nhật tính năng hệ thống thành công!');
            this.closeFeatureModal();
            this.loadFeatures();
          }
        },
        error: (err) => {
          this.loading = false;
          this.showError(err?.error?.message || 'Lỗi khi cập nhật tính năng.');
        }
      });
    } else {
      this.systemFeatureService.createFeature(payload).subscribe({
        next: (res) => {
          this.loading = false;
          if (res.success) {
            this.showSuccess('Khai báo tính năng mới thành công!');
            this.closeFeatureModal();
            this.loadFeatures();
          }
        },
        error: (err) => {
          this.loading = false;
          this.showError(err?.error?.message || 'Lỗi khi khai báo tính năng mới.');
        }
      });
    }
  }

  toggleActive(f: SystemFeatureModel): void {
    if (!f.featureId) return;
    this.systemFeatureService.toggleActiveStatus(f.featureId).subscribe({
      next: (res) => {
        if (res.success) {
          f.isActive = !f.isActive;
          this.showSuccess('Cập nhật trạng thái kích hoạt thành công!');
        }
      }
    });
  }

  onDeleteFeature(f: SystemFeatureModel): void {
    if (!f.featureId) return;

    this.confirmDialog.confirm({
      title: 'Xác Nhận Xóa Tính Năng Hệ Thống',
      message: `Bạn có chắc chắn muốn xóa tính năng "${f.featureName}" (${f.featureCode}) khỏi hệ thống?`,
      confirmText: 'Xóa Tính Năng',
      type: 'danger',
      onConfirm: () => {
        this.loading = true;
        this.systemFeatureService.deleteFeature(f.featureId!).subscribe({
          next: (res) => {
            this.loading = false;
            if (res.success) {
              this.showSuccess('Xóa tính năng hệ thống thành công!');
              this.loadFeatures();
            }
          },
          error: () => {
            this.loading = false;
            this.showError('Không thể xóa tính năng này.');
          }
        });
      }
    });
  }
}

