import { Module, OnModuleInit } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ImageController } from './image.controller';
import { ImageService } from './image.service';
import { ImageEntity } from './image.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ImageEntity])],
  controllers: [ImageController],
  providers: [ImageService],
  exports: [ImageService],
})
export class ImageModule implements OnModuleInit {
  onModuleInit() {
    console.log('📦 ImageModule has been initialized');
  }
}