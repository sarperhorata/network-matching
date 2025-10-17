import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum UserRole {
  PARTICIPANT = 'participant',
  ORGANIZER = 'organizer',
  SPONSOR = 'sponsor',
  ADMIN = 'admin',
}

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  email: string;

  @Column({ nullable: true })
  password: string;

  @Column({
    type: 'enum',
    enum: UserRole,
    default: UserRole.PARTICIPANT,
  })
  role: UserRole;

  @Column({ nullable: true })
  firstName: string;

  @Column({ nullable: true })
  lastName: string;

  @Column({ nullable: true })
  company: string;

  @Column({ nullable: true })
  position: string;

  @Column({ nullable: true })
  bio: string;

  @Column({ nullable: true })
  profilePhoto: string;

  @Column({ nullable: true })
  bannerPhoto: string;

  @Column('simple-array', { nullable: true })
  industries: string[];

  @Column('simple-array', { nullable: true })
  interests: string[];

  @Column('simple-array', { nullable: true })
  networkingGoals: string[];

  @Column({ nullable: true })
  linkedinUrl: string;

  @Column({ nullable: true })
  twitterUrl: string;

  @Column({ nullable: true })
  googleId: string;

  @Column({ default: true })
  isActive: boolean;

  @Column({ default: false })
  isEmailVerified: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

