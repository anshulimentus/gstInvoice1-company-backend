import {
  Controller,
  Get,
  Body,
  Query,
  Post,
  UseGuards,
  BadRequestException,
  Param,
  ParseIntPipe,
  Request,
} from '@nestjs/common';
import { ProductService } from '../service/product.service';
import { CreateProductDto } from '../dto/create-product.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { Role } from '../enum/roles.enum';
import { ProductType } from '../enum/product-type.enum';

@Controller('product')
// @UseGuards(JwtAuthGuard, RolesGuard)
// @Roles(Role.User)
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @Post('add')
  async create(@Body() createProductDto: CreateProductDto, @Request() req: any) {
    return this.productService.create(createProductDto);
  }

  @Get('total')
  async totalProducts() {
    const count = await this.productService.totalProducts();
    return { totalProducts: count };
  }

  @Get()
  async findAll() {
    return this.productService.findAll();
  }

  @Get('tenant/:tenantId')
  async findAllByTenant(@Param('tenantId') tenantId: string) {
    if (!tenantId) throw new BadRequestException('tenantId is required');
    return this.productService.findAllByTenantId(tenantId);
  }

  @Get('tenant/:tenantId/type/:type')
  async findByType(
    @Param('tenantId') tenantId: string,
    @Param('type') type: ProductType,
  ) {
    return this.productService.findByTypeAndTenant(tenantId, type);
  }

  @Get('count')
  async countByTenant(@Query('tenantId') tenantId: string) {
    if (!tenantId) throw new BadRequestException('tenantId is required');
    const count = await this.productService.countProductsByTenantId(tenantId);
    return { count };
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return this.productService.findOne(id);
  }
}
