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

@Entity('event_feedback')
export class EventFeedback {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  eventId: string;

  @ManyToOne(() => Event)
  @JoinColumn({ name: 'eventId' })
  event: Event;

  @Column()
  userId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column('int')
  rating: number; // 1-5 stars

  @Column('text', { nullable: true })
  comment: string;

  @Column('simple-json', { nullable: true })
  answers: object; // Custom feedback questions

  @CreateDateColumn()
  createdAt: Date;
}

