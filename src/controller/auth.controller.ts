import { Body, Controller, Post, Request, UseGuards } from '@nestjs/common';
import { AuthService } from '../service/auth.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { BadRequestException } from '@nestjs/common/exceptions';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}


  @Post('wallet-login')
  async walletLogin(@Body() body: any) {
    const { walletAddress, signature } = body;
    if (!walletAddress || !signature) {
      throw new BadRequestException('walletAddress and signature are required');
    }
    return this.authService.walletLogin(walletAddress, signature);
  }

  @Post('request-nonce')
  async requestNonce(@Body() body: { walletAddress: string }) {
    return this.authService.requestNonce(body.walletAddress);
  }

  @UseGuards(JwtAuthGuard)
  @Post('logout')
  async logout(@Request() req) {
    return this.authService.logout(req.user);
  }
}
