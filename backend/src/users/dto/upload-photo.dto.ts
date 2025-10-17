import { IsEnum } from 'class-validator';

export enum PhotoType {
  PROFILE = 'profile',
  BANNER = 'banner',
}

export class UploadPhotoDto {
  @IsEnum(PhotoType)
  photoType: PhotoType;
}

