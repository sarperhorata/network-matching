import { IsUUID, IsDateString, IsString, IsOptional, IsEnum } from 'class-validator';
import { MeetingStatus } from '../entities/meeting.entity';

export class CreateMeetingDto {
  @IsUUID()
  @IsString()
  participant1Id: string;

  @IsUUID()
  @IsString()
  participant2Id: string;

  @IsUUID()
  @IsString()
  eventId: string;

  @IsDateString()
  scheduledTime: string;

  @IsString()
  @IsOptional()
  location?: string;

  @IsString()
  @IsOptional()
  notes?: string;

  @IsEnum(MeetingStatus)
  @IsOptional()
  status?: MeetingStatus;
}

