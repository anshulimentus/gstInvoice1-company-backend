import {
  Controller,
  Get,
  Post,
  Req,
  UseGuards,
  Query,
  Param,
} from '@nestjs/common';
import { Request } from 'express';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ItcService } from './itc.service';

@Controller('itc')
export class ItcController {
  constructor(private readonly itcService: ItcService) {}

  /**
   * POST /itc/claim - Process ITC claim for the company
   */
  @Post('claim')
  @UseGuards(JwtAuthGuard)
  async claimItc(@Req() req: Request) {
    try {
      const user = req.user;
      const result = await this.itcService.claimForCompany(user);
      return {
        success: true,
        data: result,
      };
    } catch (error) {
      return {
        success: false,
        message: error.message,
        error: error.message,
      };
    }
  }

  /**
   * GET /itc/summary - Get basic ITC summary (backward compatibility)
   */
  @Get('summary')
  @UseGuards(JwtAuthGuard)
  async getItcSummary(@Req() req: Request) {
    try {
      const user = req.user;
      const result = await this.itcService.getSummaryForCompany(user);
      return {
        success: true,
        data: result,
      };
    } catch (error) {
      return {
        success: false,
        message: error.message,
        data: {
          companyId: (req.user as any)?.tenant_id || '',
          inputGST: 0,
          outputGST: 0,
          totalClaimable: 0,
          netITC: 0,
          claimCount: 0,
          claims: [],
        },
      };
    }
  }

  /**
   * GET /itc/analysis - Get detailed ITC analysis with breakdowns
   */
  @Get('analysis')
  @UseGuards(JwtAuthGuard)
  async getDetailedAnalysis(@Req() req: Request) {
    try {
      const user = req.user;
      const result = await this.itcService.getDetailedItcAnalysis(user);
      return {
        success: true,
        data: result,
      };
    } catch (error) {
      return {
        success: false,
        message: error.message,
        error: error.message,
      };
    }
  }

  /**
   * GET /itc/claims - Get all claims with details
   */
  @Get('claims')
  @UseGuards(JwtAuthGuard)
  async getAllClaims(@Req() req: Request) {
    try {
      const user = req.user;
      const result = await this.itcService.getAllClaimsWithDetails(user);
      if (!result || result.length === 0) {
        return {
          success: false,
          message: 'No ITC claims found for this company.',
          data: [],
        };
      }
      return {
        success: true,
        data: result,
      };
    } catch (error) {
      return {
        success: false,
        message: error.message,
        data: [],
      };
    }
  }

  /**
   * GET /itc/monthly/:year - Get monthly ITC breakdown for a specific year
   */
  @Get('monthly/:year')
  @UseGuards(JwtAuthGuard)
  async getMonthlyBreakdown(@Req() req: Request, @Param('year') year: string) {
    try {
      const user = req.user;
      const yearNum = parseInt(year) || new Date().getFullYear();
      const result = await this.itcService.getMonthlyItcBreakdown(
        user,
        yearNum,
      );
      return {
        success: true,
        data: result,
      };
    } catch (error) {
      return {
        success: false,
        message: error.message,
        error: error.message,
      };
    }
  }

  /**
   * GET /itc/monthly - Get monthly ITC breakdown for current year
   */
  @Get('monthly')
  @UseGuards(JwtAuthGuard)
  async getCurrentYearMonthlyBreakdown(@Req() req: Request) {
    try {
      const user = req.user;
      const currentYear = new Date().getFullYear();
      const result = await this.itcService.getMonthlyItcBreakdown(
        user,
        currentYear,
      );
      return {
        success: true,
        data: result,
      };
    } catch (error) {
      return {
        success: false,
        message: error.message,
        error: error.message,
      };
    }
  }
}
