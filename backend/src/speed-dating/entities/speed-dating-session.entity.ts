import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Event } from '../../events/entities/event.entity';

export enum SessionStatus {
  SCHEDULED = 'scheduled',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
}

@Entity('speed_dating_sessions')
export class SpeedDatingSession {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  eventId: string;

  @ManyToOne(() => Event, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'eventId' })
  event: Event;

  @Column()
  title: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({ type: 'timestamp' })
  scheduledAt: Date;

  @Column({ type: 'int', default: 5 })
  roundDurationMinutes: number; // 5-minute rounds

  @Column({ type: 'int', default: 10 })
  totalRounds: number; // 10-12 rounds typical

  @Column({ type: 'int', default: 30 })
  maxParticipants: number;

  @Column({
    type: 'enum',
    enum: SessionStatus,
    default: SessionStatus.SCHEDULED,
  })
  status: SessionStatus;

  @Column({ type: 'jsonb', default: [] })
  participantIds: string[]; // Array of user IDs

  @Column({ type: 'jsonb', default: [] })
  pairings: Array<{
    round: number;
    user1Id: string;
    user2Id: string;
    startTime?: Date;
    endTime?: Date;
  }>;

  @CreateDateColumn()
  createdAt: Date;
}

