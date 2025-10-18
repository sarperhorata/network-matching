import api from './api';

export interface TenantTheme {
  primaryColor?: string;
  secondaryColor?: string;
  accentColor?: string;
  fontFamily?: string;
  borderRadius?: string;
}

export interface TenantBranding {
  logoUrl?: string;
  faviconUrl?: string;
}

export interface Tenant {
  id: string;
  name: string;
  subdomain: string;
  customDomain?: string;
  status: string;
  plan: string;
  logoUrl?: string;
  faviconUrl?: string;
  themeConfig?: TenantTheme;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTenantDto {
  name: string;
  subdomain: string;
  customDomain?: string;
  plan?: string;
}

export const tenantsService = {
  /**
   * Get all tenants (Admin only)
   */
  async getTenants(): Promise<Tenant[]> {
    const response = await api.get('/tenants');
    return response.data;
  },

  /**
   * Create a new tenant (Super Admin only)
   */
  async createTenant(data: CreateTenantDto): Promise<Tenant> {
    const response = await api.post('/tenants', data);
    return response.data;
  },

  /**
   * Get current tenant based on subdomain/domain
   */
  async getCurrentTenant(): Promise<Tenant> {
    const response = await api.get('/tenants/current');
    return response.data;
  },

  /**
   * Get current tenant's theme configuration
   */
  async getCurrentTheme(): Promise<TenantTheme> {
    const response = await api.get('/tenants/current/theme');
    return response.data;
  },

  /**
   * Get tenant statistics (usage metrics)
   */
  async getCurrentStatistics(): Promise<any> {
    const response = await api.get('/tenants/current/statistics');
    return response.data;
  },

  /**
   * Get tenant by ID (Admin only)
   */
  async getTenant(id: string): Promise<Tenant> {
    const response = await api.get(`/tenants/${id}`);
    return response.data;
  },

  /**
   * Update tenant details (Admin only)
   */
  async updateTenant(id: string, data: Partial<CreateTenantDto>): Promise<Tenant> {
    const response = await api.put(`/tenants/${id}`, data);
    return response.data;
  },

  /**
   * Update tenant theme
   */
  async updateTheme(id: string, theme: TenantTheme): Promise<Tenant> {
    const response = await api.put(`/tenants/${id}/theme`, theme);
    return response.data;
  },

  /**
   * Update tenant branding (logo, favicon)
   */
  async updateBranding(id: string, branding: TenantBranding): Promise<Tenant> {
    const response = await api.put(`/tenants/${id}/branding`, branding);
    return response.data;
  },

  /**
   * Upgrade tenant plan
   */
  async upgradePlan(id: string, plan: string): Promise<Tenant> {
    const response = await api.post(`/tenants/${id}/upgrade`, { plan });
    return response.data;
  },

  /**
   * Delete tenant (Admin only)
   */
  async deleteTenant(id: string): Promise<void> {
    await api.delete(`/tenants/${id}`);
  },
};

