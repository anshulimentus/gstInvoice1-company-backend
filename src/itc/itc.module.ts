import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { ItcService } from "./itc.service";
import { ItcController } from "./itc.controller";
import { Itc } from "./entities/itc.entity";

@Module({
  imports: [TypeOrmModule.forFeature([Itc])],
  controllers: [ItcController],
  providers: [ItcService],
  exports: [ItcService], // Export ItcService for use in other modules
})
export class ItcModule {}