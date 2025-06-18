import { Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { Request } from 'express';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ItcService } from './itc.service';

@Controller('itc')
export class ItcController {
  constructor(private readonly itcService: ItcService) {}

  @Post('claim')
  @UseGuards(JwtAuthGuard)
  async claimItc(@Req() req: Request) {
    const user = req.user;
    return this.itcService.claimForCompany(user);
  }

  @Get('summary')
  @UseGuards(JwtAuthGuard)
  async getItcSummary(@Req() req: Request) {
    const user = req.user;
    return this.itcService.getSummaryForCompany(user);
  }
}
