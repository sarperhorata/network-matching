import { IsString, IsOptional } from 'class-validator';

export class GenerateMatchesDto {
  @IsString()
  @IsOptional()
  eventId?: string;

  @IsString()
  @IsOptional()
  userId?: string;
}

