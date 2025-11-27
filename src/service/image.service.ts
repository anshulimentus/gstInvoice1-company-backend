import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ImageEntity } from '../entities/image.entity';
import { UploadImageDto } from '../dto/image.dto';

@Injectable()
export class ImageService {
  constructor(
    @InjectRepository(ImageEntity)
    private imageRepository: Repository<ImageEntity>,
  ) {}

  async uploadImage(uploadImageDto: UploadImageDto): Promise<ImageEntity> {
    const { filename, base64data, mimeType } = uploadImageDto;

    // Extract only the base64 data part (remove data URL prefix)
    const base64Only = base64data.split(',')[1];

    // Create a new image entity
    const newImage = this.imageRepository.create({
      filename,
      base64data: base64Only,
      mimeType,
    });

    // Save to database
    return await this.imageRepository.save(newImage);
  }

  async getImageById(id: string): Promise<ImageEntity | null> {
    console.log('Querying image with id:', id);
    const image = await this.imageRepository.findOne({ where: { id } });
    console.log('Image query result:', image ? 'found' : 'not found');
    return image;
  }
}
