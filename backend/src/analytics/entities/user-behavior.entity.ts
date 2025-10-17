import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Event } from '../../events/entities/event.entity';

export enum BehaviorType {
  PROFILE_VIEW = 'profile_view',
  MESSAGE_SENT = 'message_sent',
  MATCH_ACCEPTED = 'match_accepted',
  MATCH_REJECTED = 'match_rejected',
  EVENT_JOINED = 'event_joined',
  EVENT_CHECKED_IN = 'event_checked_in',
  MEETING_SCHEDULED = 'meeting_scheduled',
  MEETING_COMPLETED = 'meeting_completed',
  SEARCH_PERFORMED = 'search_performed',
  FEEDBACK_SUBMITTED = 'feedback_submitted',
}

@Entity('user_behaviors')
export class UserBehavior {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid')
  userId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column({
    type: 'enum',
    enum: BehaviorType,
  })
  behaviorType: BehaviorType;

  @Column('uuid', { nullable: true })
  targetUserId: string;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'targetUserId' })
  targetUser: User;

  @Column('uuid', { nullable: true })
  eventId: string;

  @ManyToOne(() => Event, { nullable: true })
  @JoinColumn({ name: 'eventId' })
  event: Event;

  @Column('jsonb', { nullable: true })
  metadata: Record<string, any>;

  @CreateDateColumn()
  createdAt: Date;
}

