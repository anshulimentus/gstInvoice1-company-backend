import { Controller, Get, UseGuards, Request } from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { Roles } from 'src/auth/roles.decorator';
import { RolesGuard } from 'src/auth/roles.guard';
import { Role } from './roles.enum';

@Controller('users')
export class UsersController {
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(Role.User)
    @Get('admin-data')
    getAdminData(@Request() req) {
      return `Welcome Admin ${req.user.username}`;
    }
  
    @UseGuards(JwtAuthGuard)
    @Get('profile')
    getProfile(@Request() req) {
      return req.user;
    }
}
