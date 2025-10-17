import { IsOptional, IsDateString, IsString, IsEnum } from 'class-validator';
import { MeetingStatus } from '../entities/meeting.entity';

export class UpdateMeetingDto {
  @IsDateString()
  @IsOptional()
  scheduledTime?: string;

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

