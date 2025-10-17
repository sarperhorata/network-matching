import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

export enum TenantStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  SUSPENDED = 'suspended',
  TRIAL = 'trial',
}

export enum TenantPlan {
  FREE = 'free',
  STARTER = 'starter',
  PROFESSIONAL = 'professional',
  ENTERPRISE = 'enterprise',
}

@Entity('tenants')
export class Tenant {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  @Index()
  subdomain: string;

  @Column()
  name: string;

  @Column({ nullable: true })
  customDomain: string;

  @Column({
    type: 'enum',
    enum: TenantStatus,
    default: TenantStatus.TRIAL,
  })
  status: TenantStatus;

  @Column({
    type: 'enum',
    enum: TenantPlan,
    default: TenantPlan.FREE,
  })
  plan: TenantPlan;

  // Branding
  @Column({ nullable: true })
  logoUrl: string;

  @Column({ nullable: true })
  faviconUrl: string;

  @Column('jsonb', { nullable: true })
  theme: {
    primaryColor?: string;
    secondaryColor?: string;
    accentColor?: string;
    fontFamily?: string;
    borderRadius?: string;
  };

  // Contact Info
  @Column({ nullable: true })
  contactEmail: string;

  @Column({ nullable: true })
  contactPhone: string;

  @Column({ nullable: true })
  website: string;

  // Settings
  @Column('jsonb', { nullable: true })
  settings: {
    allowRegistration?: boolean;
    requireEmailVerification?: boolean;
    maxUsers?: number;
    maxEvents?: number;
    features?: string[];
    customFields?: Record<string, any>;
  };

  // Metadata
  @Column('jsonb', { nullable: true })
  metadata: {
    industry?: string;
    companySize?: string;
    country?: string;
    timezone?: string;
    language?: string;
  };

  // Billing
  @Column({ type: 'timestamp', nullable: true })
  trialEndsAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  subscriptionStartedAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  subscriptionEndsAt: Date;

  @Column({ default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

