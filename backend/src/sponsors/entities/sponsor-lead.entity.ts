import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { Sponsorship } from './sponsorship.entity';
import { User } from '../../users/entities/user.entity';
import { Event } from '../../events/entities/event.entity';

export enum LeadQuality {
  HOT = 'hot',
  WARM = 'warm',
  COLD = 'cold',
}

export enum LeadSource {
  QR_SCAN = 'qr_scan',
  BOOTH_VISIT = 'booth_visit',
  LOUNGE_VISIT = 'lounge_visit',
  BROCHURE_DOWNLOAD = 'brochure_download',
  VIDEO_VIEW = 'video_view',
  CONTACT_FORM = 'contact_form',
  MEETING_REQUEST = 'meeting_request',
}

@Entity('sponsor_leads')
@Index(['sponsorshipId', 'userId'], { unique: true })
export class SponsorLead {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid')
  sponsorshipId: string;

  @ManyToOne(() => Sponsorship)
  @JoinColumn({ name: 'sponsorshipId' })
  sponsorship: Sponsorship;

  @Column('uuid')
  userId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column('uuid')
  eventId: string;

  @ManyToOne(() => Event)
  @JoinColumn({ name: 'eventId' })
  event: Event;

  // Lead Details
  @Column({
    type: 'enum',
    enum: LeadSource,
  })
  source: LeadSource;

  @Column({
    type: 'enum',
    enum: LeadQuality,
    default: LeadQuality.COLD,
  })
  quality: LeadQuality;

  // Interaction Details
  @Column({ default: 0 })
  interactionCount: number;

  @Column('jsonb', { nullable: true })
  interactions: Array<{
    type: LeadSource;
    timestamp: Date;
    metadata?: Record<string, any>;
  }>;

  // Contact Info (captured with consent)
  @Column({ nullable: true })
  notes: string;

  @Column('jsonb', { nullable: true })
  customFields: Record<string, any>;

  // Lead Score (0-100)
  @Column({ type: 'int', default: 0 })
  leadScore: number;

  // Engagement Metrics
  @Column({ default: 0 })
  timeSpent: number; // in seconds

  @Column({ default: 0 })
  pagesViewed: number;

  @Column({ default: false })
  downloadedBrochure: boolean;

  @Column({ default: false })
  watchedVideo: boolean;

  @Column({ default: false })
  requestedMeeting: boolean;

  // Follow-up
  @Column({ default: false })
  isContacted: boolean;

  @Column({ type: 'timestamp', nullable: true })
  contactedAt: Date;

  @Column({ nullable: true })
  contactNotes: string;

  @CreateDateColumn()
  createdAt: Date;
}

