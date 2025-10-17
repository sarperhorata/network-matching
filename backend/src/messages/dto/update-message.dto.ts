import { IsBoolean, IsOptional } from 'class-validator';

export class UpdateMessageDto {
  @IsBoolean()
  @IsOptional()
  isRead?: boolean;

  @IsOptional()
  readAt?: Date;
}

