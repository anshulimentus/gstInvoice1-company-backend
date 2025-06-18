import { Module } from "@nestjs/common";
import { ItcController } from "./itc.controller";
import { ItcService } from "./itc.service";
import { TypeOrmModule } from "@nestjs/typeorm";
import { ItcClaim } from "./entities/itc-claim.entity";
import { Invoice } from "src/invoice/entities/invoice.entity";

@Module({
    imports: [
        TypeOrmModule.forFeature([ItcClaim, Invoice]), // Importing the ItcClaim and Invoice entities
    ],
    controllers: [ItcController], // Registering the ItcController
    providers: [ItcService], // Registering the ItcService
    exports: [ItcService], // Exporting the ItcService for use in other modules
})

export class ItcModule {}
