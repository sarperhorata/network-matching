import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Event } from '../../events/entities/event.entity';
import { User } from '../../users/entities/user.entity';

export enum SponsorshipTier {
  PLATINUM = 'platinum',
  GOLD = 'gold',
  SILVER = 'silver',
  BRONZE = 'bronze',
}

export enum SponsorshipStatus {
  PENDING = 'pending',
  ACTIVE = 'active',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
}

@Entity('sponsorships')
export class Sponsorship {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid')
  eventId: string;

  @ManyToOne(() => Event)
  @JoinColumn({ name: 'eventId' })
  event: Event;

  @Column('uuid')
  sponsorId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'sponsorId' })
  sponsor: User;

  @Column({
    type: 'enum',
    enum: SponsorshipTier,
    default: SponsorshipTier.BRONZE,
  })
  tier: SponsorshipTier;

  @Column({
    type: 'enum',
    enum: SponsorshipStatus,
    default: SponsorshipStatus.PENDING,
  })
  status: SponsorshipStatus;

  // Branding
  @Column({ nullable: true })
  logoUrl: string;

  @Column({ nullable: true })
  bannerUrl: string;

  @Column({ nullable: true })
  boothBannerUrl: string;

  @Column('text', { nullable: true })
  description: string;

  @Column({ nullable: true })
  websiteUrl: string;

  @Column({ nullable: true })
  contactEmail: string;

  // Visibility Settings
  @Column('jsonb', { nullable: true })
  placements: {
    homePage?: boolean;
    eventPage?: boolean;
    emailBanner?: boolean;
    pushNotifications?: boolean;
    sponsorLounge?: boolean;
  };

  // Targeting
  @Column('jsonb', { nullable: true })
  targeting: {
    industries?: string[];
    interests?: string[];
    jobTitles?: string[];
    companySize?: string[];
  };

  // Lead Capture
  @Column({ default: true })
  enableLeadCapture: boolean;

  @Column('jsonb', { nullable: true })
  leadCaptureFields: string[];

  // Booth/Lounge
  @Column({ default: false })
  hasSponsorLounge: boolean;

  @Column('text', { nullable: true })
  loungeDescription: string;

  @Column('jsonb', { nullable: true })
  loungeLinks: Array<{
    title: string;
    url: string;
    type: 'website' | 'video' | 'pdf' | 'linkedin';
  }>;

  // Package Details
  @Column('decimal', { precision: 10, scale: 2, nullable: true })
  packagePrice: number;

  @Column({ nullable: true })
  currency: string;

  @Column('jsonb', { nullable: true })
  packageIncludes: string[];

  // Metrics (cached for performance)
  @Column({ default: 0 })
  impressions: number;

  @Column({ default: 0 })
  clicks: number;

  @Column({ default: 0 })
  leadsGenerated: number;

  @Column({ default: 0 })
  loungeVisits: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

