/**
 * TMS-01 Shared UI — Barrel Export
 *
 * Import tất cả Shared Components, Directives & Validators cho TMS-01 Frontend:
 *
 * @example
 *   import { TmsPageHeaderComponent, NoVietnameseDirective, vietnamPhoneValidator } from '@shared-ui';
 */

// ─── Shared UI Components ───────────────────────────────────────────────────
export * from './components/page-header/page-header.component';
export * from './components/metric-card/metric-card.component';
export * from './components/status-badge/status-badge.component';
export * from './components/table-panel/table-panel.component';
export * from './components/search-box/search-box.component';
export * from './components/loading-state/loading-state.component';
export * from './components/form-group/form-group.component';
export * from './components/toast/toast.component';
export * from './components/confirm-dialog/confirm-dialog.component';
export * from './components/pagination/pagination.component';
export * from './components/report-export-modal/report-export-modal.component';
export * from './components/global-toast-container/global-toast-container.component';
export * from './components/excel-import-modal/excel-import-modal.component';

// ─── Input Validation Directives ──────────────────────────────────────────────
export * from './directives/no-vietnamese.directive';
export * from './directives/numbers-only.directive';
export * from './directives/uppercase.directive';
export * from './directives/license-plate.directive';
export * from './directives/currency-format.directive';
export * from './directives/no-consecutive-spaces.directive';
export * from './directives/no-special-characters.directive';

// ─── Custom Reactive Form Validators ──────────────────────────────────────────
export * from './validators/custom.validators';
