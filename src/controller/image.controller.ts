import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  NotFoundException,
  Res,
} from '@nestjs/common';
import { ImageService } from '../service/image.service';
import { UploadImageDto } from '../dto/image.dto';
import { Response } from 'express';

@Controller('images')
export class ImageController {
  constructor(private readonly imageService: ImageService) {}

  @Post('upload')
  async uploadImage(@Body() uploadImageDto: UploadImageDto) {
    const savedImage = await this.imageService.uploadImage(uploadImageDto);
    return {
      message: 'Image uploaded successfully',
      imageId: savedImage.id,
      imageUrl: `/images/${savedImage.id}`,
    };
  }

  @Get(':id')
  async getImage(@Param('id') id: string, @Res() res: Response) {
    console.log('Fetching image with id:', id);
    const image = await this.imageService.getImageById(id);
    console.log('Image found:', !!image);

    if (!image) {
      throw new NotFoundException('Image not found');
    }

    console.log('Image mimeType:', image.mimeType);
    console.log('Image base64data length:', image.base64data.length);

    // Set content type based on the stored mime type
    res.setHeader('Content-Type', image.mimeType);
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');

    // Send the base64 data as binary
    const imageBuffer = Buffer.from(image.base64data, 'base64');
    console.log('Image buffer length:', imageBuffer.length);
    res.send(imageBuffer);
  }

  @Get(':id/base64')
  async getImageBase64(@Param('id') id: string) {
    const image = await this.imageService.getImageById(id);

    if (!image) {
      throw new NotFoundException('Image not found');
    }

    return {
      id: image.id,
      filename: image.filename,
      base64Data: `data:${image.mimeType};base64,${image.base64data}`,
      mimeType: image.mimeType,
      uploadedAt: image.uploadedAt,
    };
  }
}
