import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Event } from '../../events/entities/event.entity';

@Entity('travel_info')
export class TravelInfo {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  userId: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column()
  eventId: string;

  @ManyToOne(() => Event, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'eventId' })
  event: Event;

  @Column({ nullable: true })
  departureCity?: string;

  @Column({ nullable: true })
  arrivalCity?: string;

  @Column({ type: 'timestamp', nullable: true })
  arrivalDate?: Date;

  @Column({ type: 'timestamp', nullable: true })
  departureDate?: Date;

  @Column({ nullable: true })
  flightNumber?: string;

  @Column({ nullable: true })
  accommodation?: string;

  @Column({ default: false })
  lookingForRoommate: boolean;

  @Column({ default: false })
  needsTransport: boolean;

  @Column({ default: false })
  willingToShareTransport: boolean;

  @Column({ default: false })
  interestedInDinner: boolean;

  @Column({ default: false })
  interestedInCityTour: boolean;

  @Column('text', { nullable: true })
  notes?: string;

  @CreateDateColumn()
  createdAt: Date;
}

