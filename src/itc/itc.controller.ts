import { Controller, Post, Body, Param, Get, Patch, Delete, ParseUUIDPipe } from '@nestjs/common';
import { ItcService } from './itc.service';
import { CreateItcDto } from './dto/create-itc.dto';
import { UpdateItcDto } from './dto/update-itc.dto';

@Controller('itc-claims')
export class ItcController {
  constructor(private readonly itcClaimsService: ItcService) {}

  @Post()
  async createClaim(@Body() createDto: CreateItcDto) {
    return this.itcClaimsService.createClaim(createDto);
  }

  @Get()
  async getAllClaims() {
    return this.itcClaimsService.getAllClaims();
  }

  @Get(':id')
  async getClaimById(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.itcClaimsService.getClaimById(id);
  }

  @Patch(':id/status')
  async updateStatus(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() updateDto: UpdateItcDto,
  ) {
    return this.itcClaimsService.updateStatus(id, updateDto);
  }

  @Delete(':id')
  async deleteClaim(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.itcClaimsService.deleteClaim(id);
  }
}