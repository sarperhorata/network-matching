import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Meeting } from '../../meetings/entities/meeting.entity';

export enum VideoProvider {
  ZOOM = 'zoom',
  GOOGLE_MEET = 'google_meet',
  MICROSOFT_TEAMS = 'microsoft_teams',
  JITSI = 'jitsi',
}

@Entity('video_meetings')
export class VideoMeeting {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  meetingId: string;

  @ManyToOne(() => Meeting, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'meetingId' })
  meeting: Meeting;

  @Column({
    type: 'enum',
    enum: VideoProvider,
    default: VideoProvider.JITSI,
  })
  provider: VideoProvider;

  @Column()
  meetingUrl: string;

  @Column({ nullable: true })
  meetingId_external?: string; // Zoom meeting ID, Google Meet code, etc.

  @Column({ nullable: true })
  password?: string;

  @Column({ default: false })
  isRecording: boolean;

  @Column({ nullable: true })
  recordingUrl?: string;

  @Column({ nullable: true })
  dialInNumber?: string;

  @Column('jsonb', { nullable: true })
  metadata?: Record<string, any>; // Provider-specific data

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

