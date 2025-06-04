import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ImageEntity } from './image.entity';
import { UploadImageDto } from './image.dto';

@Injectable()
export class ImageService {
  constructor(
    @InjectRepository(ImageEntity)
    private imageRepository: Repository<ImageEntity>,
  ) {}

  async uploadImage(uploadImageDto: UploadImageDto): Promise<ImageEntity> {
    const { filename, base64data, mimeType } = uploadImageDto;
    
    // Create a new image entity
    const newImage = this.imageRepository.create({
      filename,
      base64data,
      mimeType,
    });

    // Save to database
    return await this.imageRepository.save(newImage);
  }

  async getImageById(id: string): Promise<ImageEntity | null> {
    return await this.imageRepository.findOne({ where: { id } });
  }
}