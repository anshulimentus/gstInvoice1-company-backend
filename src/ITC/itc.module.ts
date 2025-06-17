import { Module } from '@nestjs/common';
import { ITCController } from './itc.controller';
import { ITCService } from './itc.service';

@Module({
  controllers: [ITCController],
  providers: [ITCService],
  exports: [ITCService],
})
export class ITCModule {}