import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  UseGuards,
  ParseUUIDPipe,
  Request,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ItcService } from '../service/itc.service';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { Role } from '../enum/roles.enum';

@Controller('itc')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.User)
export class ItcController {
  constructor(private readonly itcService: ItcService) {}

  /**
   * POST /itc/claim - Create ITC claim for an invoice
   */
  @Post('claim')
  async createItcClaim(
    @Body() body: { invoiceId: string; transactionHash: string },
    @Request() req: any,
  ) {
    try {
      const result = await this.itcService.createItcClaim(
        body.invoiceId,
        req.user,
        body.transactionHash,
      );
      return {
        success: true,
        data: result,
        message: 'ITC claim submitted successfully',
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
   * POST /itc/claim-legacy - Legacy ITC claim (using invoiceNo)
   */
  @Post('claim-legacy')
  async claimItc(@Body() body: any, @Request() req: any) {
    try {
      req.body = body;
      const result = await this.itcService.claimForCompany(req);
      return {
        success: true,
        data: result,
        message: 'ITC claim submitted successfully',
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
   * GET /itc/claims - Get all ITC claims for current company
   */
  @Get('claims')
  async getCompanyClaims(@Request() req: any) {
    try {
      const claims = await this.itcService.getCompanyItcClaims(req.user.tenant_id);
      return {
        success: true,
        data: claims,
        count: claims.length,
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
   * GET /itc/claims/:id - Get specific ITC claim
   */
  @Get('claims/:id')
  async getClaimById(@Param('id', ParseUUIDPipe) id: string, @Request() req: any) {
    try {
      const claim = await this.itcService.getItcClaimById(id, req.user.tenant_id);
      return {
        success: true,
        data: claim,
      };
    } catch (error) {
      return {
        success: false,
        message: error.message,
      };
    }
  }

  /**
   * GET /itc/summary - Get ITC summary for company
   */
  @Get('summary')
  async getItcSummary(@Request() req: any) {
    try {
      const result = await this.itcService.getCompanyItcSummary(req.user.tenant_id);
      return {
        success: true,
        data: result,
      };
    } catch (error) {
      return {
        success: false,
        message: error.message,
        data: {
          totalClaims: 0,
          totalInputGst: 0,
          totalOutputGst: 0,
          totalClaimable: 0,
          netItc: 0,
        },
      };
    }
  }

  /**
    * GET /itc/analysis - Get detailed ITC analysis
    */
   @Get('analysis')
   async getDetailedAnalysis(@Request() req: any) {
     try {
       const result = await this.itcService.getDetailedItcAnalysis(req.user);
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
    * GET /itc/monthly - Get monthly ITC breakdown
    */
   @Get('monthly')
   async getMonthlyItcData(@Request() req: any) {
     try {
       const result = await this.itcService.getMonthlyItcBreakdown(req.user.tenant_id);
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
}