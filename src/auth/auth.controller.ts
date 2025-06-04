import { Body, Controller, Post, Request, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './jwt-auth.guard';   
import { BadRequestException } from '@nestjs/common/exceptions';

@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) {}

    // @UseGuards(JwtAuthGuard)
    @Post('login')
    async login(@Request() req) {
        const { email, password } = req.body;
        const user = await this.authService.validateUser(email, password);
        if (!user) {
            throw new Error('Invalid credentials');
        }
        return this.authService.login(user);
    }

    @Post('wallet-login')
    async walletLogin(@Body() body: any) {
        const { walletAddress, signature } = body;
        if (!walletAddress || !signature) {
            throw new BadRequestException("walletAddress and signature are required");
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
