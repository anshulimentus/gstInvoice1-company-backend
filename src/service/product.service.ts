import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from '../entities/product.entity';
import { CreateProductDto } from '../dto/create-product.dto';
import { ProductType } from '../enum/product-type.enum';

@Injectable()
export class ProductService {
  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
  ) {}

  /**
   * Create a new product or service
   */
  async create(createProductDto: CreateProductDto): Promise<Product> {
    try {
      const { basePrice, gstRate } = createProductDto;

      if (basePrice <= 0)
        throw new BadRequestException('Base price must be greater than zero');
      if (gstRate < 0)
        throw new BadRequestException('GST rate cannot be negative');

      // ✅ Calculate final price automatically
      const gstAmount = (basePrice * gstRate) / 100;
      const finalPrice = basePrice + gstAmount;

      const newProduct = this.productRepository.create({
        productName: createProductDto.productName,
        gstRate,
        productDescription: createProductDto.productDescription,
        transactionHash: createProductDto.transactionHash,
        imageUrl: createProductDto.imageUrl,
        basePrice: Math.floor(basePrice),
        finalPrice: Math.floor(finalPrice),
        type: createProductDto.type || ProductType.PRODUCT,
        blockchainProductId: createProductDto.blockchainProductId || 0,
        company_tenant_id: createProductDto.company_tenant_id,
      });

      return await this.productRepository.save(newProduct);
    } catch (error) {
      console.error('❌ Error creating product:', error);
      throw new BadRequestException(error.message || 'Failed to create product');
    }
  }

  /**
   * Get all products globally (for admin)
   */
  async findAll(): Promise<Product[]> {
    return await this.productRepository.find({ order: { productID: 'DESC' } });
  }

  /**
   * Get all products by tenant (company)
   */
  async findAllByTenantId(company_tenant_id: string): Promise<Product[]> {
    if (!company_tenant_id)
      throw new BadRequestException('company_tenant_id is required');

    const products = await this.productRepository.find({
      where: { company_tenant_id },
      order: { productID: 'DESC' },
    });

    if (!products.length) {
      throw new NotFoundException(
        `No products found for company tenant: ${company_tenant_id}`,
      );
    }

    return products;
  }

  /**
   * Filter products by type (service/product)
   */
  async findByTypeAndTenant(
    company_tenant_id: string,
    type: ProductType,
  ): Promise<Product[]> {
    if (!company_tenant_id)
      throw new BadRequestException('company_tenant_id is required');

    const products = await this.productRepository.find({
      where: { company_tenant_id, type },
      order: { productID: 'DESC' },
    });

    if (!products.length)
      throw new NotFoundException(
        `No ${type} found for company tenant: ${company_tenant_id}`,
      );

    return products;
  }

  async countProductsByTenantId(tenantId: string): Promise<number> {
    return this.productRepository.count({
      where: { company_tenant_id: tenantId },
    });
  }

  async totalProducts(): Promise<number> {
    return this.productRepository.count();
  }

  async findOne(id: number): Promise<Product> {
    const product = await this.productRepository.findOne({
      where: { productID: id },
    });
    if (!product)
      throw new NotFoundException(`Product with ID ${id} not found`);
    return product;
  }
}
