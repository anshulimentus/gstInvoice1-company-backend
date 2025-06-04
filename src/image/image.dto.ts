import { IsNotEmpty, IsString } from 'class-validator';

export class UploadImageDto {
  @IsNotEmpty()
  @IsString()
  filename: string;

  @IsNotEmpty()
  @IsString()
  base64data: string;

  @IsNotEmpty()
  @IsString()
  mimeType: string;
}