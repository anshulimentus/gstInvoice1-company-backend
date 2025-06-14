import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Itc } from './entities/itc.entity';
import { CreateItcDto } from './dto/create-itc.dto';
import { UpdateItcDto } from './dto/update-itc.dto';

@Injectable()
export class ItcService {
  constructor(
    @InjectRepository(Itc)
    private readonly itcRepository: Repository<Itc>,
  ) {}

  async createClaim(createDto: CreateItcDto): Promise<Itc> {
    const claim = this.itcRepository.create(createDto);
    return this.itcRepository.save(claim);
  }

  async getAllClaims(): Promise<Itc[]> {
    return this.itcRepository.find({ order: { createdAt: 'DESC' } });
  }

  async getClaimById(id: string): Promise<Itc> {
    const claim = await this.itcRepository.findOne({ where: { id } });
    if (!claim) throw new NotFoundException(`Claim not found`);
    return claim;
  }

  async updateStatus(id: string, updateDto: UpdateItcDto): Promise<Itc> {
    const claim = await this.getClaimById(id);
    claim.claimStatus = updateDto.status;
    claim.approvedBy = updateDto.approvedBy || '';
    claim.claimDate = new Date();
    claim.remarks = updateDto.remarks || '';
    return this.itcRepository.save(claim);
  }

  async deleteClaim(id: string): Promise<void> {
    const result = await this.itcRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Claim with ID ${id} not found`);
    }
  }
}
