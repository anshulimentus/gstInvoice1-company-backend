import { Injectable, UnauthorizedException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { Company } from '../company/entities/company.entity';
import { ethers } from 'ethers';


@Injectable()
export class AuthService {
  private readonly nonces = new Map<string, string>();
  private readonly logger = new Logger(AuthService.name);

  constructor(
    @InjectRepository(Company)
    private readonly companyRepository: Repository<Company>,
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  async validateUser(email: string, pass: string): Promise<any> {
    this.logger.log(`Validating user with email: ${email}`);
    const user = await this.usersService.findOneByEmail(email);
    
    if (user && pass === user.password) {
      this.logger.log(`User validated successfully: ${email}`);
      const { password, ...result } = user;
      return result;
    }
    
    
    this.logger.warn(`User validation failed for email: ${email}`);
    return null;
  }

  async login(user: any) {
    this.logger.log(`Logging in user: ${user.email}`);

    const company = await this.companyRepository.findOne({
      where: { tenantId: user.tenantId },
    });

    const walletAddress = company?.legalRepresentative?.toLowerCase() || null;
    
    // Include tenant_id in the JWT payload
    const payload = { 
      email: user.email, 
      sub: user.id, 
      role: 'company', // Set role as company for company login
      tenant_id: user.tenantId, // Include tenant_id
      walletAddress: walletAddress,
    };
    
    const token = this.jwtService.sign(payload);
    this.logger.log(`Token generated for user: ${user.email}`);
    
    return {
      token,
      role: 'company',
      tenant_id: user.tenantId, // Return tenant_id in response
      user: {
        id: user.id,
        email: user.email,
        companyName: user.companyName,
        tenantId: user.tenantId,
        walletAddress: walletAddress,
      }
    };
  }

  async logout(user: any) {
    this.logger.log(`Logging out user: ${user.email || user.walletAddress}`);
    return { message: 'Logged out successfully' };
  }

  async requestNonce(walletAddress: string) {
    const lowercase = walletAddress.toLowerCase();
    const nonce = Math.floor(Math.random() * 1000000).toString();
    this.nonces.set(lowercase, nonce);
    this.logger.log(`Nonce generated for wallet: ${walletAddress}, nonce: ${nonce}`);
    return { nonce };
  }

  async walletLogin(walletAddress: string, signature: string): Promise<any> {
    const lowercaseAddress = walletAddress.toLowerCase();
    this.logger.log(`Wallet login attempt for address: ${walletAddress}`);
  
    // ✅ Step 1: Check if walletAddress is listed as a legal representative
    const company = await this.companyRepository.findOne({
      where: { legalRepresentative: lowercaseAddress },
    });
  
    if (!company) {
      this.logger.warn(`Wallet ${walletAddress} is not a legal representative of any company.`);
      throw new UnauthorizedException('Unauthorized wallet address.');
    }
  
    const nonce = this.nonces.get(lowercaseAddress);
    if (!nonce) {
      this.logger.warn(`Nonce not found for wallet: ${walletAddress}`);
      throw new UnauthorizedException('Nonce not found. Please request a new one.');
    }
  
    this.logger.log(`Nonce found for wallet: ${walletAddress}, nonce: ${nonce}`);
  
    let recoveredAddress: string;
    try {
      recoveredAddress = ethers.utils.verifyMessage(
        `Sign this message to verify your identity: ${nonce}`,
        signature,
      );
      this.logger.log(`Recovered address from signature: ${recoveredAddress}`);
    } catch (err) {
      this.logger.error(`Invalid signature for wallet: ${walletAddress}`, err.stack);
      throw new UnauthorizedException('Invalid signature.');
    }
  
    if (recoveredAddress.toLowerCase() !== lowercaseAddress) {
      this.logger.warn(`Signature verification failed for wallet: ${walletAddress}`);
      throw new UnauthorizedException('Signature verification failed');
    }
  
    this.nonces.delete(lowercaseAddress);
    this.logger.log(`Nonce cleaned up for wallet: ${walletAddress}`);
  
    const defaultTenantId = company.tenantId || 'wallet-' + lowercaseAddress;
  
    const token = this.jwtService.sign(
      {
        walletAddress: lowercaseAddress,
        role: 'company',
        tenant_id: defaultTenantId,
      },
      { secret: 'secretKey', expiresIn: '5h' },
    );
    this.logger.log(`Token generated for wallet: ${walletAddress}, role: company`);
  
    return {
      token,
      role: 'company',
      tenant_id: defaultTenantId,
    };
  }
  
}