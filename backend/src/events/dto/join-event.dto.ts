import { IsOptional, IsString } from 'class-validator';

export class JoinEventDto {
  @IsString()
  @IsOptional()
  message?: string; // Optional message for organizers
}

