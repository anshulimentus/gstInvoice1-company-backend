import { Injectable, NotFoundException, BadRequestException, InternalServerErrorException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Product } from "./entities/product.entity";
import Web3 from 'web3';
import { CreateProductDto } from "./dto/create-product.dto";
import { UpdateProductDto } from "./dto/update-product.dto";
import * as chalk from "chalk";

@Injectable()
export class ProductService {

    private web3: Web3;
    private contract: any;
    private account: string;
    private contractAddress: string;
    private privateKey: string;
    private providerURL: string;
  


    constructor(
        @InjectRepository(Product)
        private productRepository: Repository<Product>,
    ) {
        // Validate environment variables
        if (!process.env.PROVIDER_URL) {
            throw new Error('PROVIDER_URL is not set in environment variables');
        }
        if (!process.env.INVOICE_CONTRACT_ADDRESS) {
            throw new Error('CONTRACT_ADDRESS is not set in environment variables');
        }
        if (!process.env.PRIVATE_KEY) {
            throw new Error('PRIVATE_KEY is not set in environment variables');
        }
        if (!process.env.OWNER_ADDRESS) {
            throw new Error('OWNER_ADDRESS is not set in environment variables');
        }

        this.providerURL = process.env.PROVIDER_URL;
        this.contractAddress = process.env.INVOICE_CONTRACT_ADDRESS;
        this.privateKey = process.env.PRIVATE_KEY;
      

        // Sepholia RPC URL
        this.web3 = new Web3(new Web3.providers.HttpProvider(this.providerURL));
        this.contract = new this.web3.eth.Contract([
            {
                "anonymous": false,
                "inputs": [
                    {
                        "indexed": false,
                        "internalType": "string",
                        "name": "id",
                        "type": "string"
                    },
                    {
                        "indexed": false,
                        "internalType": "string",
                        "name": "name",
                        "type": "string"
                    },
                    {
                        "indexed": false,
                        "internalType": "string",
                        "name": "gstNumber",
                        "type": "string"
                    }
                ],
                "name": "CustomerAdded",
                "type": "event"
            },
            {
                "anonymous": false,
                "inputs": [
                    {
                        "indexed": false,
                        "internalType": "string",
                        "name": "id",
                        "type": "string"
                    }
                ],
                "name": "CustomerDeleted",
                "type": "event"
            },
            {
                "anonymous": false,
                "inputs": [
                    {
                        "indexed": false,
                        "internalType": "string",
                        "name": "id",
                        "type": "string"
                    },
                    {
                        "indexed": false,
                        "internalType": "string",
                        "name": "name",
                        "type": "string"
                    },
                    {
                        "indexed": false,
                        "internalType": "string",
                        "name": "gstNumber",
                        "type": "string"
                    }
                ],
                "name": "CustomerUpdated",
                "type": "event"
            },
            {
                "anonymous": false,
                "inputs": [
                    {
                        "indexed": false,
                        "internalType": "string",
                        "name": "invoiceNumber",
                        "type": "string"
                    },
                    {
                        "indexed": true,
                        "internalType": "address",
                        "name": "claimant",
                        "type": "address"
                    },
                    {
                        "indexed": false,
                        "internalType": "uint256",
                        "name": "claimableAmount",
                        "type": "uint256"
                    }
                ],
                "name": "ITCClaimed",
                "type": "event"
            },
            {
                "anonymous": false,
                "inputs": [
                    {
                        "indexed": false,
                        "internalType": "string",
                        "name": "invoiceNumber",
                        "type": "string"
                    }
                ],
                "name": "InvoiceCreated",
                "type": "event"
            },
            {
                "anonymous": false,
                "inputs": [
                    {
                        "indexed": false,
                        "internalType": "string",
                        "name": "invoiceNumber",
                        "type": "string"
                    }
                ],
                "name": "InvoiceDeleted",
                "type": "event"
            },
            {
                "anonymous": false,
                "inputs": [
                    {
                        "indexed": false,
                        "internalType": "string",
                        "name": "invoiceNumber",
                        "type": "string"
                    }
                ],
                "name": "InvoiceUpdated",
                "type": "event"
            },
            {
                "anonymous": false,
                "inputs": [
                    {
                        "indexed": false,
                        "internalType": "uint256",
                        "name": "productID",
                        "type": "uint256"
                    },
                    {
                        "indexed": false,
                        "internalType": "string",
                        "name": "productName",
                        "type": "string"
                    },
                    {
                        "indexed": false,
                        "internalType": "uint256",
                        "name": "price",
                        "type": "uint256"
                    }
                ],
                "name": "ProductAdded",
                "type": "event"
            },
            {
                "anonymous": false,
                "inputs": [
                    {
                        "indexed": false,
                        "internalType": "uint256",
                        "name": "productID",
                        "type": "uint256"
                    }
                ],
                "name": "ProductDeleted",
                "type": "event"
            },
            {
                "anonymous": false,
                "inputs": [
                    {
                        "indexed": false,
                        "internalType": "uint256",
                        "name": "productID",
                        "type": "uint256"
                    },
                    {
                        "indexed": false,
                        "internalType": "string",
                        "name": "productName",
                        "type": "string"
                    },
                    {
                        "indexed": false,
                        "internalType": "uint256",
                        "name": "price",
                        "type": "uint256"
                    }
                ],
                "name": "ProductUpdated",
                "type": "event"
            },
            {
                "inputs": [
                    {
                        "internalType": "string",
                        "name": "_id",
                        "type": "string"
                    },
                    {
                        "internalType": "string",
                        "name": "_name",
                        "type": "string"
                    },
                    {
                        "internalType": "string",
                        "name": "_gstNumber",
                        "type": "string"
                    }
                ],
                "name": "addCustomer",
                "outputs": [],
                "stateMutability": "nonpayable",
                "type": "function"
            },
            {
                "inputs": [
                    {
                        "internalType": "uint256",
                        "name": "_id",
                        "type": "uint256"
                    },
                    {
                        "internalType": "string",
                        "name": "_name",
                        "type": "string"
                    },
                    {
                        "internalType": "uint256",
                        "name": "_price",
                        "type": "uint256"
                    }
                ],
                "name": "addProduct",
                "outputs": [],
                "stateMutability": "nonpayable",
                "type": "function"
            },
            {
                "inputs": [
                    {
                        "internalType": "string",
                        "name": "invoiceNumber",
                        "type": "string"
                    },
                    {
                        "internalType": "string",
                        "name": "companyId",
                        "type": "string"
                    },
                    {
                        "internalType": "uint256",
                        "name": "inputGST",
                        "type": "uint256"
                    },
                    {
                        "internalType": "uint256",
                        "name": "outputGST",
                        "type": "uint256"
                    }
                ],
                "name": "claimITC",
                "outputs": [],
                "stateMutability": "nonpayable",
                "type": "function"
            },
            {
                "inputs": [
                    {
                        "internalType": "string",
                        "name": "_invoiceNumber",
                        "type": "string"
                    },
                    {
                        "internalType": "string",
                        "name": "_invoiceDate",
                        "type": "string"
                    },
                    {
                        "internalType": "string",
                        "name": "_supplyType",
                        "type": "string"
                    },
                    {
                        "internalType": "uint256[]",
                        "name": "_productIDs",
                        "type": "uint256[]"
                    },
                    {
                        "internalType": "string[]",
                        "name": "_productNames",
                        "type": "string[]"
                    },
                    {
                        "internalType": "uint256[]",
                        "name": "_quantities",
                        "type": "uint256[]"
                    },
                    {
                        "internalType": "uint256[]",
                        "name": "_unitPrices",
                        "type": "uint256[]"
                    },
                    {
                        "internalType": "uint256[]",
                        "name": "_gstRates",
                        "type": "uint256[]"
                    },
                    {
                        "internalType": "uint256[]",
                        "name": "_totalAmounts",
                        "type": "uint256[]"
                    },
                    {
                        "internalType": "uint256",
                        "name": "_totalTaxableValue",
                        "type": "uint256"
                    },
                    {
                        "internalType": "uint256",
                        "name": "_totalGstAmount",
                        "type": "uint256"
                    },
                    {
                        "internalType": "uint256",
                        "name": "_grandTotal",
                        "type": "uint256"
                    },
                    {
                        "internalType": "string",
                        "name": "_paymentTerms",
                        "type": "string"
                    },
                    {
                        "internalType": "bool",
                        "name": "_isFinal",
                        "type": "bool"
                    }
                ],
                "name": "createInvoice",
                "outputs": [],
                "stateMutability": "nonpayable",
                "type": "function"
            },
            {
                "inputs": [
                    {
                        "internalType": "string",
                        "name": "",
                        "type": "string"
                    }
                ],
                "name": "customers",
                "outputs": [
                    {
                        "internalType": "string",
                        "name": "id",
                        "type": "string"
                    },
                    {
                        "internalType": "string",
                        "name": "name",
                        "type": "string"
                    },
                    {
                        "internalType": "string",
                        "name": "gstNumber",
                        "type": "string"
                    }
                ],
                "stateMutability": "view",
                "type": "function"
            },
            {
                "inputs": [
                    {
                        "internalType": "string",
                        "name": "_id",
                        "type": "string"
                    }
                ],
                "name": "deleteCustomer",
                "outputs": [],
                "stateMutability": "nonpayable",
                "type": "function"
            },
            {
                "inputs": [
                    {
                        "internalType": "string",
                        "name": "_invoiceNumber",
                        "type": "string"
                    }
                ],
                "name": "deleteInvoice",
                "outputs": [],
                "stateMutability": "nonpayable",
                "type": "function"
            },
            {
                "inputs": [
                    {
                        "internalType": "uint256",
                        "name": "_id",
                        "type": "uint256"
                    }
                ],
                "name": "deleteProduct",
                "outputs": [],
                "stateMutability": "nonpayable",
                "type": "function"
            },
            {
                "inputs": [],
                "name": "getAllInvoices",
                "outputs": [
                    {
                        "components": [
                            {
                                "internalType": "string",
                                "name": "invoiceNumber",
                                "type": "string"
                            },
                            {
                                "internalType": "string",
                                "name": "invoiceDate",
                                "type": "string"
                            },
                            {
                                "internalType": "string",
                                "name": "supplyType",
                                "type": "string"
                            },
                            {
                                "components": [
                                    {
                                        "internalType": "uint256",
                                        "name": "productID",
                                        "type": "uint256"
                                    },
                                    {
                                        "internalType": "string",
                                        "name": "productName",
                                        "type": "string"
                                    },
                                    {
                                        "internalType": "uint256",
                                        "name": "quantity",
                                        "type": "uint256"
                                    },
                                    {
                                        "internalType": "uint256",
                                        "name": "unitPrice",
                                        "type": "uint256"
                                    },
                                    {
                                        "internalType": "uint256",
                                        "name": "gstRate",
                                        "type": "uint256"
                                    },
                                    {
                                        "internalType": "uint256",
                                        "name": "totalAmount",
                                        "type": "uint256"
                                    }
                                ],
                                "internalType": "struct Company.InvoiceItem[]",
                                "name": "items",
                                "type": "tuple[]"
                            },
                            {
                                "internalType": "uint256",
                                "name": "totalTaxableValue",
                                "type": "uint256"
                            },
                            {
                                "internalType": "uint256",
                                "name": "totalGstAmount",
                                "type": "uint256"
                            },
                            {
                                "internalType": "uint256",
                                "name": "grandTotal",
                                "type": "uint256"
                            },
                            {
                                "internalType": "string",
                                "name": "paymentTerms",
                                "type": "string"
                            },
                            {
                                "internalType": "bool",
                                "name": "isFinal",
                                "type": "bool"
                            }
                        ],
                        "internalType": "struct Company.Invoice[]",
                        "name": "",
                        "type": "tuple[]"
                    }
                ],
                "stateMutability": "view",
                "type": "function"
            },
            {
                "inputs": [
                    {
                        "internalType": "string",
                        "name": "_invoiceNumber",
                        "type": "string"
                    }
                ],
                "name": "getInvoiceByNumber",
                "outputs": [
                    {
                        "internalType": "string",
                        "name": "",
                        "type": "string"
                    },
                    {
                        "internalType": "string",
                        "name": "",
                        "type": "string"
                    },
                    {
                        "internalType": "string",
                        "name": "",
                        "type": "string"
                    },
                    {
                        "components": [
                            {
                                "internalType": "uint256",
                                "name": "productID",
                                "type": "uint256"
                            },
                            {
                                "internalType": "string",
                                "name": "productName",
                                "type": "string"
                            },
                            {
                                "internalType": "uint256",
                                "name": "quantity",
                                "type": "uint256"
                            },
                            {
                                "internalType": "uint256",
                                "name": "unitPrice",
                                "type": "uint256"
                            },
                            {
                                "internalType": "uint256",
                                "name": "gstRate",
                                "type": "uint256"
                            },
                            {
                                "internalType": "uint256",
                                "name": "totalAmount",
                                "type": "uint256"
                            }
                        ],
                        "internalType": "struct Company.InvoiceItem[]",
                        "name": "",
                        "type": "tuple[]"
                    },
                    {
                        "internalType": "uint256",
                        "name": "",
                        "type": "uint256"
                    },
                    {
                        "internalType": "uint256",
                        "name": "",
                        "type": "uint256"
                    },
                    {
                        "internalType": "uint256",
                        "name": "",
                        "type": "uint256"
                    },
                    {
                        "internalType": "string",
                        "name": "",
                        "type": "string"
                    },
                    {
                        "internalType": "bool",
                        "name": "",
                        "type": "bool"
                    }
                ],
                "stateMutability": "view",
                "type": "function"
            },
            {
                "inputs": [
                    {
                        "internalType": "string",
                        "name": "",
                        "type": "string"
                    }
                ],
                "name": "itcClaims",
                "outputs": [
                    {
                        "internalType": "string",
                        "name": "invoiceNumber",
                        "type": "string"
                    },
                    {
                        "internalType": "string",
                        "name": "companyId",
                        "type": "string"
                    },
                    {
                        "internalType": "address",
                        "name": "companyWallet",
                        "type": "address"
                    },
                    {
                        "internalType": "uint256",
                        "name": "inputGST",
                        "type": "uint256"
                    },
                    {
                        "internalType": "uint256",
                        "name": "outputGST",
                        "type": "uint256"
                    },
                    {
                        "internalType": "uint256",
                        "name": "netITC",
                        "type": "uint256"
                    },
                    {
                        "internalType": "uint256",
                        "name": "claimableAmount",
                        "type": "uint256"
                    },
                    {
                        "internalType": "uint256",
                        "name": "claimedAmount",
                        "type": "uint256"
                    },
                    {
                        "internalType": "uint256",
                        "name": "timestamp",
                        "type": "uint256"
                    },
                    {
                        "internalType": "bool",
                        "name": "isApproved",
                        "type": "bool"
                    },
                    {
                        "internalType": "bool",
                        "name": "isClaimed",
                        "type": "bool"
                    },
                    {
                        "internalType": "string",
                        "name": "status",
                        "type": "string"
                    }
                ],
                "stateMutability": "view",
                "type": "function"
            },
            {
                "inputs": [],
                "name": "nextCustomerId",
                "outputs": [
                    {
                        "internalType": "uint256",
                        "name": "",
                        "type": "uint256"
                    }
                ],
                "stateMutability": "view",
                "type": "function"
            },
            {
                "inputs": [
                    {
                        "internalType": "uint256",
                        "name": "",
                        "type": "uint256"
                    }
                ],
                "name": "products",
                "outputs": [
                    {
                        "internalType": "uint256",
                        "name": "productID",
                        "type": "uint256"
                    },
                    {
                        "internalType": "string",
                        "name": "productName",
                        "type": "string"
                    },
                    {
                        "internalType": "uint256",
                        "name": "price",
                        "type": "uint256"
                    }
                ],
                "stateMutability": "view",
                "type": "function"
            },
            {
                "inputs": [],
                "name": "totalInvoices",
                "outputs": [
                    {
                        "internalType": "uint256",
                        "name": "",
                        "type": "uint256"
                    }
                ],
                "stateMutability": "view",
                "type": "function"
            },
            {
                "inputs": [],
                "name": "totalProducts",
                "outputs": [
                    {
                        "internalType": "uint256",
                        "name": "",
                        "type": "uint256"
                    }
                ],
                "stateMutability": "view",
                "type": "function"
            },
            {
                "inputs": [
                    {
                        "internalType": "string",
                        "name": "_id",
                        "type": "string"
                    },
                    {
                        "internalType": "string",
                        "name": "_name",
                        "type": "string"
                    },
                    {
                        "internalType": "string",
                        "name": "_gstNumber",
                        "type": "string"
                    }
                ],
                "name": "updateCustomer",
                "outputs": [],
                "stateMutability": "nonpayable",
                "type": "function"
            },
            {
                "inputs": [
                    {
                        "internalType": "string",
                        "name": "_invoiceNumber",
                        "type": "string"
                    },
                    {
                        "internalType": "string",
                        "name": "_invoiceDate",
                        "type": "string"
                    },
                    {
                        "internalType": "string",
                        "name": "_supplyType",
                        "type": "string"
                    },
                    {
                        "internalType": "uint256[]",
                        "name": "_productIDs",
                        "type": "uint256[]"
                    },
                    {
                        "internalType": "string[]",
                        "name": "_productNames",
                        "type": "string[]"
                    },
                    {
                        "internalType": "uint256[]",
                        "name": "_quantities",
                        "type": "uint256[]"
                    },
                    {
                        "internalType": "uint256[]",
                        "name": "_unitPrices",
                        "type": "uint256[]"
                    },
                    {
                        "internalType": "uint256[]",
                        "name": "_gstRates",
                        "type": "uint256[]"
                    },
                    {
                        "internalType": "uint256[]",
                        "name": "_totalAmounts",
                        "type": "uint256[]"
                    },
                    {
                        "internalType": "uint256",
                        "name": "_totalTaxableValue",
                        "type": "uint256"
                    },
                    {
                        "internalType": "uint256",
                        "name": "_totalGstAmount",
                        "type": "uint256"
                    },
                    {
                        "internalType": "uint256",
                        "name": "_grandTotal",
                        "type": "uint256"
                    },
                    {
                        "internalType": "string",
                        "name": "_paymentTerms",
                        "type": "string"
                    },
                    {
                        "internalType": "bool",
                        "name": "_isFinal",
                        "type": "bool"
                    }
                ],
                "name": "updateInvoice",
                "outputs": [],
                "stateMutability": "nonpayable",
                "type": "function"
            },
            {
                "inputs": [
                    {
                        "internalType": "uint256",
                        "name": "_id",
                        "type": "uint256"
                    },
                    {
                        "internalType": "string",
                        "name": "_name",
                        "type": "string"
                    },
                    {
                        "internalType": "uint256",
                        "name": "_price",
                        "type": "uint256"
                    }
                ],
                "name": "updateProduct",
                "outputs": [],
                "stateMutability": "nonpayable",
                "type": "function"
            }
        ], this.contractAddress);
        const sanitizedPrivateKey = this.privateKey.startsWith("0x")
            ? this.privateKey
            : "0x" + this.privateKey;

        try {
            const account = this.web3.eth.accounts.privateKeyToAccount(sanitizedPrivateKey);
            this.account = account.address;
            this.web3.eth.accounts.wallet.add(account);
            this.web3.eth.defaultAccount = account.address;
            // console.log(chalk.green("✅ Web3 account initialized:", this.account));
        } catch (err) {
            // console.error(chalk.red("❌ Failed to initialize Web3 account:"), err);
            throw new InternalServerErrorException("Failed to initialize Web3 account");
        }

    }



    async create(createProductDto: CreateProductDto): Promise<Product> {
        // console.log("🚀 ~ ProductService ~ create ~ createProductDto:", createProductDto)
        // Convert price to smallest unit (e.g., paise, cents)
        const onChainPrice = Math.round(createProductDto.unitPrice);

        // Step 1: Save to DB first to get auto-generated productID
        const newProduct = this.productRepository.create({
            ...createProductDto,
            unitPrice: onChainPrice, // Save in smallest unit for consistency
        });
        const savedProduct = await this.productRepository.save(newProduct);

        // Step 2: Call blockchain transaction with the productID from DB
        const tx = await this.contract.methods
            .addProduct(
                savedProduct.productID,
                savedProduct.productName,
                savedProduct.unitPrice
            )
            .send({ from: this.account });

        // Step 3: Save the transaction hash back to DB
        savedProduct.transactionHash = tx.transactionHash;
        await this.productRepository.save(savedProduct);

        return savedProduct;
    }


    async findAllByTenantId(company_tenant_id: string) {
        const products = await this.productRepository.find({ where: { company_tenant_id } });

        return products.map(product => ({
            ...product,
            price: product.unitPrice / 100, // Convert back to normal price
        }));
    }



    async findAll() {
        const products = await this.productRepository.find();
        return products.map(product => ({
            ...product,
            price: product.unitPrice / 100 // Convert back to decimal format
        }));
    }


    // product.service.ts
    async countProductsByTenantId(tenantId: string): Promise<number> {
        return this.productRepository
            .createQueryBuilder('product')
            .where('product.company_tenant_id = :tenantId', { tenantId })
            .getCount();
    }




    async totalProducts(): Promise<number> {
        return await this.productRepository.count();
    }


    async findOne(id: number): Promise<Product> {
        const product = await this.productRepository.findOne({ where: { productID: id } });

        if (!product) {
            throw new Error(`Product with ID ${id} not found`);
        }
        // console.log("🚀 Exiting getting specific product method.....")
        return product;
    }


    async update(id: number, updateProductDto: UpdateProductDto): Promise<Product> {
        const updatedProduct = await this.productRepository.preload({
            productID: id,
            ...updateProductDto,
        });

        if (!updatedProduct) {
            throw new Error(`Product with ID ${id} not found`);
        }

        await this.productRepository.save(updatedProduct);

        await this.contract.methods
            .updateProduct(updatedProduct.productID, updatedProduct.productName, updatedProduct.unitPrice)
            .send({ from: this.account });

        // console.log("🚀 Exiting updating method")
        return updatedProduct;

    }


    async remove(id: number): Promise<void> {
        try {
            // Step 1: Delete from Blockchain
            const receipt = await this.contract.methods.deleteProduct(id).send({ from: this.account });

            // console.log('Transaction successful:', receipt.transactionHash);

            // Step 2: Delete from Database (after blockchain transaction success)  
            await this.productRepository.delete(id);

            // console.log(`Product with ID ${id} deleted from database`);
        } catch (error) {
            // console.error(`Error deleting product with ID ${id}:`, error);
            throw new Error('Failed to delete product');
        }
    }
}