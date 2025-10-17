import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Tenant, TenantStatus, TenantPlan } from './entities/tenant.entity';

export interface CreateTenantDto {
  subdomain: string;
  name: string;
  contactEmail: string;
  plan?: TenantPlan;
  theme?: {
    primaryColor?: string;
    secondaryColor?: string;
    accentColor?: string;
    fontFamily?: string;
    borderRadius?: string;
  };
  metadata?: {
    industry?: string;
    companySize?: string;
    country?: string;
    timezone?: string;
    language?: string;
  };
}

export interface UpdateTenantDto {
  name?: string;
  customDomain?: string;
  status?: TenantStatus;
  plan?: TenantPlan;
  logoUrl?: string;
  faviconUrl?: string;
  theme?: {
    primaryColor?: string;
    secondaryColor?: string;
    accentColor?: string;
    fontFamily?: string;
    borderRadius?: string;
  };
  contactEmail?: string;
  contactPhone?: string;
  website?: string;
  settings?: {
    allowRegistration?: boolean;
    requireEmailVerification?: boolean;
    maxUsers?: number;
    maxEvents?: number;
    features?: string[];
  };
  metadata?: {
    industry?: string;
    companySize?: string;
    country?: string;
    timezone?: string;
    language?: string;
  };
}

@Injectable()
export class TenantsService {
  constructor(
    @InjectRepository(Tenant)
    private readonly tenantRepository: Repository<Tenant>,
  ) {}

  /**
   * Create a new tenant
   */
  async create(createTenantDto: CreateTenantDto): Promise<Tenant> {
    // Validate subdomain format
    const subdomainRegex = /^[a-z0-9]([a-z0-9-]*[a-z0-9])?$/;
    if (!subdomainRegex.test(createTenantDto.subdomain)) {
      throw new ConflictException(
        'Subdomain must be lowercase alphanumeric and can contain hyphens',
      );
    }

    // Check if subdomain already exists
    const existingTenant = await this.tenantRepository.findOne({
      where: { subdomain: createTenantDto.subdomain },
    });

    if (existingTenant) {
      throw new ConflictException('Subdomain already exists');
    }

    // Create tenant with trial period
    const tenant = this.tenantRepository.create({
      ...createTenantDto,
      status: TenantStatus.TRIAL,
      plan: createTenantDto.plan || TenantPlan.FREE,
      trialEndsAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days trial
      settings: {
        allowRegistration: true,
        requireEmailVerification: true,
        maxUsers: 50, // Default limit for free plan
        maxEvents: 10,
        features: ['events', 'matching', 'messaging', 'meetings'],
      },
    });

    return this.tenantRepository.save(tenant);
  }

  /**
   * Find all tenants
   */
  async findAll(): Promise<Tenant[]> {
    return this.tenantRepository.find({
      order: { createdAt: 'DESC' },
    });
  }

  /**
   * Find tenant by ID
   */
  async findOne(id: string): Promise<Tenant> {
    const tenant = await this.tenantRepository.findOne({ where: { id } });

    if (!tenant) {
      throw new NotFoundException('Tenant not found');
    }

    return tenant;
  }

  /**
   * Find tenant by subdomain
   */
  async findBySubdomain(subdomain: string): Promise<Tenant> {
    const tenant = await this.tenantRepository.findOne({
      where: { subdomain },
    });

    if (!tenant) {
      throw new NotFoundException('Tenant not found');
    }

    return tenant;
  }

  /**
   * Update tenant
   */
  async update(id: string, updateTenantDto: UpdateTenantDto): Promise<Tenant> {
    const tenant = await this.findOne(id);

    // If custom domain is being set, verify it's unique
    if (updateTenantDto.customDomain && updateTenantDto.customDomain !== tenant.customDomain) {
      const existingDomain = await this.tenantRepository.findOne({
        where: { customDomain: updateTenantDto.customDomain },
      });

      if (existingDomain && existingDomain.id !== id) {
        throw new ConflictException('Custom domain already in use');
      }
    }

    Object.assign(tenant, updateTenantDto);

    return this.tenantRepository.save(tenant);
  }

  /**
   * Delete tenant (soft delete by setting isActive to false)
   */
  async remove(id: string): Promise<void> {
    const tenant = await this.findOne(id);
    tenant.isActive = false;
    await this.tenantRepository.save(tenant);
  }

  /**
   * Update tenant theme
   */
  async updateTheme(
    id: string,
    theme: {
      primaryColor?: string;
      secondaryColor?: string;
      accentColor?: string;
      fontFamily?: string;
      borderRadius?: string;
    },
  ): Promise<Tenant> {
    const tenant = await this.findOne(id);
    tenant.theme = { ...tenant.theme, ...theme };
    return this.tenantRepository.save(tenant);
  }

  /**
   * Update tenant branding
   */
  async updateBranding(
    id: string,
    branding: {
      logoUrl?: string;
      faviconUrl?: string;
    },
  ): Promise<Tenant> {
    const tenant = await this.findOne(id);
    Object.assign(tenant, branding);
    return this.tenantRepository.save(tenant);
  }

  /**
   * Get tenant features based on plan
   */
  getPlanFeatures(plan: TenantPlan): {
    maxUsers: number;
    maxEvents: number;
    features: string[];
  } {
    const planFeatures = {
      [TenantPlan.FREE]: {
        maxUsers: 50,
        maxEvents: 10,
        features: ['events', 'matching', 'messaging'],
      },
      [TenantPlan.STARTER]: {
        maxUsers: 200,
        maxEvents: 50,
        features: ['events', 'matching', 'messaging', 'meetings', 'analytics'],
      },
      [TenantPlan.PROFESSIONAL]: {
        maxUsers: 1000,
        maxEvents: 200,
        features: [
          'events',
          'matching',
          'messaging',
          'meetings',
          'analytics',
          'advanced-matching',
          'custom-branding',
        ],
      },
      [TenantPlan.ENTERPRISE]: {
        maxUsers: -1, // Unlimited
        maxEvents: -1, // Unlimited
        features: [
          'events',
          'matching',
          'messaging',
          'meetings',
          'analytics',
          'advanced-matching',
          'custom-branding',
          'custom-domain',
          'api-access',
          'sso',
          'white-label',
        ],
      },
    };

    return planFeatures[plan];
  }

  /**
   * Upgrade tenant plan
   */
  async upgradePlan(id: string, newPlan: TenantPlan): Promise<Tenant> {
    const tenant = await this.findOne(id);
    const features = this.getPlanFeatures(newPlan);

    tenant.plan = newPlan;
    tenant.status = TenantStatus.ACTIVE;
    tenant.subscriptionStartedAt = new Date();
    tenant.subscriptionEndsAt = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000); // 1 year
    tenant.settings = {
      ...tenant.settings,
      maxUsers: features.maxUsers,
      maxEvents: features.maxEvents,
      features: features.features,
    };

    return this.tenantRepository.save(tenant);
  }

  /**
   * Check if tenant has feature access
   */
  async hasFeature(tenantId: string, feature: string): Promise<boolean> {
    const tenant = await this.findOne(tenantId);
    return tenant.settings?.features?.includes(feature) || false;
  }

  /**
   * Get tenant statistics
   */
  async getStatistics(id: string): Promise<{
    totalUsers: number;
    totalEvents: number;
    activeEvents: number;
    planLimits: {
      users: { current: number; max: number };
      events: { current: number; max: number };
    };
    status: TenantStatus;
    daysUntilExpiry: number;
  }> {
    const tenant = await this.findOne(id);

    // TODO: Calculate actual counts from database
    const totalUsers = 0; // await this.getUserCount(id);
    const totalEvents = 0; // await this.getEventCount(id);
    const activeEvents = 0; // await this.getActiveEventCount(id);

    const expiryDate = tenant.subscriptionEndsAt || tenant.trialEndsAt;
    const daysUntilExpiry = expiryDate
      ? Math.ceil((expiryDate.getTime() - Date.now()) / (24 * 60 * 60 * 1000))
      : 0;

    return {
      totalUsers,
      totalEvents,
      activeEvents,
      planLimits: {
        users: {
          current: totalUsers,
          max: tenant.settings?.maxUsers || 0,
        },
        events: {
          current: totalEvents,
          max: tenant.settings?.maxEvents || 0,
        },
      },
      status: tenant.status,
      daysUntilExpiry,
    };
  }
}

