export interface SystemFeatureModel {
  featureId?: number;
  featureCode: string;
  featureName: string;
  routePath?: string;
  iconClass?: string;
  resourceGroup?: string;
  sortOrder?: number;
  isActive?: boolean;
  description?: string;
}
