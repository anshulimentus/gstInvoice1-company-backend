import { Controller, Get, Body, Query, Post, Patch, Delete, UseGuards, InternalServerErrorException, BadRequestException, NotAcceptableException, Param, ParseIntPipe } from "@nestjs/common";
import { ProductService } from "./product.service";
import { CreateProductDto } from "./dto/create-product.dto";
import { UpdateProductDto } from "./dto/update-product.dto";
import { RolesGuard } from "src/auth/roles.guard";
import { JwtAuthGuard } from "src/auth/jwt-auth.guard";
import { Roles } from "src/auth/roles.decorator";
import { Role } from "src/users/roles.enum";
import * as chalk from "chalk";

@Controller('product')
export class ProductController {
    constructor(private readonly productService: ProductService) { }

    @Post('add')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(Role.User)
    async create(@Body() createProductDto: CreateProductDto) {
        // console.log(chalk.bgCyanBright("🚀 Create Product router hit...."));
        return this.productService.create(createProductDto)
    }

    @Get('demo')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(Role.User)
    async demo() {
        // console.log(chalk.bgCyanBright('Product contoller hit: basic'));
        return { status: 'active' };
    }

    @Get('total')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(Role.User)
    async totalProducts() {
        // console.log(chalk.bgCyanBright("🚀 Total Product router hit...."))
        const count = await this.productService.totalProducts();
        return { totalProducts: count };
    }

    @Get()
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(Role.User)
    async findAll() {
        // console.log(chalk.bgCyanBright("🚀 Get all Product router hit...."))
        return this.productService.findAll();
    }

    @Get('tenant/:tenantId')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(Role.User)
    async findAllByTenant(@Param('tenantId') tenantId: string) {
        // console.log(chalk.bgCyanBright("🚀 Get Product by tenantId router hit...."));
        return this.productService.findAllByTenantId(tenantId);
    }


    @Get('count')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(Role.User)
    async countByTenant(@Query('tenantId') tenantId: string): Promise<{ count: number }> {
        if (!tenantId) {
            throw new BadRequestException('tenantId is required');
        }
    
        const count = await this.productService.countProductsByTenantId(tenantId);
        return { count };
    }


    @Get(':id')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(Role.User)
    async findOne(@Param('id', ParseIntPipe) id: number) {
        // console.log(chalk.bgCyanBright("🚀 Get specific id product router hit...."))
        return this.productService.findOne(Number(id));
    }

    @Patch(':id')
    async update(@Param('id', ParseIntPipe) id: number, @Body() updateProductDto: UpdateProductDto) {
        // console.log(chalk.bgCyanBright("🚀 Update Product router hit...."))
        return this.productService.update(id, updateProductDto);
    }

    @Delete(':id')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(Role.User)
    async remove(@Param('id', ParseIntPipe) id: number) {
        // console.log(chalk.bgCyanBright("🚀 Delete Product router hit...."))
        return this.productService.remove(id);
    }

}

