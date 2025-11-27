import { Module, OnModuleInit } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ImageController } from '../controller/image.controller';
import { ImageService } from '../service/image.service';
import { ImageEntity } from '../entities/image.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ImageEntity])],
  controllers: [ImageController],
  providers: [ImageService],
  exports: [ImageService],
})
export class ImageModule implements OnModuleInit {
  onModuleInit() {}
}
