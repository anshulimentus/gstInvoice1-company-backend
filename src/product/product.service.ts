import { Injectable, NotFoundException, BadRequestException, InternalServerErrorException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Product } from "./entities/product.entity";
import { Web3 } from 'web3';
import { CreateProductDto } from "./dto/create-product.dto";
import { UpdateProductDto } from "./dto/update-product.dto";
import { CONTRACT_ABI } from '../abi/contract.abi';
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
        if (!process.env.CONTRACT_ADDRESS) {
            throw new Error('CONTRACT_ADDRESS is not set in environment variables');
        }
        if (!process.env.PRIVATE_KEY) {
            throw new Error('PRIVATE_KEY is not set in environment variables');
        }
        if (!process.env.OWNER_ADDRESS) {
            throw new Error('OWNER_ADDRESS is not set in environment variables');
        }

        this.providerURL = process.env.PROVIDER_URL;
        this.contractAddress = process.env.CONTRACT_ADDRESS;
        this.privateKey = process.env.PRIVATE_KEY;


        // Sepholia RPC URL
        this.web3 = new Web3(new Web3.providers.HttpProvider(this.providerURL));

        this.contract = new this.web3.eth.Contract(CONTRACT_ABI, this.contractAddress);
        const sanitizedPrivateKey = this.privateKey.startsWith("0x")
        ? this.privateKey
        : "0x" + this.privateKey;
        
        console.log("🚀 ~ ProductService ~ sanitizedPrivateKey:", sanitizedPrivateKey)
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

    // Prepare transaction data for frontend signing
    async prepareTransaction(encodedABI: string, fromAddress: string): Promise<any> {
        const nonce = await this.web3.eth.getTransactionCount(fromAddress, "latest");
        const gasPrice = await this.web3.eth.getGasPrice();

        const txData = {
            to: this.contractAddress,
            data: encodedABI,
            gas: 500000,
            gasPrice: gasPrice.toString(),
            nonce: nonce.toString(),
            chainId: 11155111, // Sepolia testnet
        };

        return txData;
    }

    // Send signed transaction received from frontend
    async sendSignedTransaction(signedTx: string): Promise<any> {
        try {
            return await this.web3.eth.sendSignedTransaction(signedTx);
        } catch (error) {
            console.error('Error sending signed transaction:', error);
            throw new InternalServerErrorException('Failed to send signed transaction');
        }
    }

    async prepareCreate(createProductDto: CreateProductDto, walletAddress?: string): Promise<{ transactionData: any, productData: any }> {
        // Validate GST rate according to contract requirements
        const gstRate = Math.round(createProductDto.gstRate);
        if (gstRate <= 0 || gstRate > 100) {
            throw new BadRequestException('GST rate must be between 1 and 100');
        }

        // Convert price to smallest unit (e.g., paise, cents)
        const onChainPrice = Math.round(createProductDto.unitPrice);

        // Create product data (don't save to DB yet)
        const newProduct = this.productRepository.create({
            ...createProductDto,
            unitPrice: onChainPrice, // Save in smallest unit for consistency
        });

        // Prepare transaction data for frontend signing
        const encodedABI = this.contract.methods
            .addProduct(createProductDto.productName, onChainPrice, gstRate)
            .encodeABI();

        const transactionData = await this.prepareTransaction(encodedABI, walletAddress || this.account);

        return {
            transactionData,
            productData: {
                ...newProduct,
                tempProductId: Date.now() // Temporary ID for tracking
            }
        };
    }

    // Complete the creation after receiving signed transaction from frontend
    async completeCreate(tempProductId: number, signedTx: string, productData: CreateProductDto): Promise<Product> {
        const receipt = await this.sendSignedTransaction(signedTx);
        console.log("🚀 ~ ProductService ~ completeCreate ~ tx:", receipt);

        // Get the blockchain product ID from the ProductAdded event
        let blockchainProductId: number;
        try {
            if (receipt.events && receipt.events.ProductAdded) {
                blockchainProductId = parseInt(receipt.events.ProductAdded.returnValues.productID);
                console.log("🔢 Blockchain Product ID (from event):", blockchainProductId);
            } else {
                // Fallback: query totalProducts if event is not available
                const totalProducts = await this.contract.methods.totalProducts().call();
                blockchainProductId = parseInt(totalProducts.toString());
                console.log("🔢 Blockchain Product ID (fallback from totalProducts):", blockchainProductId);
            }
        } catch (error) {
            console.error("❌ Could not get blockchain product ID:", error);
            throw new InternalServerErrorException('Failed to get blockchain product ID');
        }

        // Save product to database with transaction hash and blockchain product ID
        const newProduct = this.productRepository.create({
            ...productData,
            transactionHash: receipt.transactionHash, // Include transaction hash
            blockchainProductId: blockchainProductId, // Include blockchain product ID
        });

        const savedProduct = await this.productRepository.save(newProduct);
        console.log("✅ Product saved to database with transaction hash:", receipt.transactionHash);

        return savedProduct;
    }

    async create(createProductDto: CreateProductDto): Promise<Product> {
        // console.log("🚀 ~ ProductService ~ create ~ createProductDto:", createProductDto)

        // Validate GST rate according to contract requirements
        const gstRate = Math.round(createProductDto.gstRate);
        if (gstRate <= 0 || gstRate > 100) {
            throw new BadRequestException('GST rate must be between 1 and 100');
        }

        // Convert price to smallest unit (e.g., paise, cents)
        const onChainPrice = Math.round(createProductDto.unitPrice);

        // Step 1: BLOCKCHAIN FIRST - Call blockchain transaction
        // Contract expects: addProduct(string _name, uint256 _basePrice, uint256 _gstRate)
        let tx;
        let blockchainProductId: number;
        try {
            console.log("🔗 Executing blockchain transaction...");
            console.log("📋 Parameters:", {
                name: createProductDto.productName,
                price: onChainPrice,
                gstRate: gstRate,
                from: this.account,
                contract: this.contractAddress
            });

            tx = await this.contract.methods
            .addProduct(
                createProductDto.productName,  // _name
                onChainPrice,                  // _basePrice
                gstRate                        // _gstRate (validated)
            )
            .send({
                from: this.account,
                gas: 300000,
                gasPrice: '20000000000' // 20 gwei
            });

            console.log("✅ Blockchain transaction successful:", tx.transactionHash);
            console.log("📋 Transaction receipt:", tx);

            // Get the blockchain product ID from the ProductAdded event
            try {
                if (tx.events && tx.events.ProductAdded) {
                    blockchainProductId = parseInt(tx.events.ProductAdded.returnValues.productID);
                    console.log("🔢 Blockchain Product ID (from event):", blockchainProductId);
                    console.log("📋 ProductAdded event:", tx.events.ProductAdded.returnValues);
                } else {
                    // Fallback: query totalProducts if event is not available
                    const totalProducts = await this.contract.methods.totalProducts().call();
                    blockchainProductId = parseInt(totalProducts.toString());
                    console.log("🔢 Blockchain Product ID (fallback from totalProducts):", blockchainProductId);
                }
            } catch (error) {
                console.error("❌ Could not get blockchain product ID:", error);
                throw new InternalServerErrorException('Failed to get blockchain product ID');
            }
        } catch (error) {
            // If blockchain transaction fails, don't save to database
            console.error("❌ Blockchain transaction failed:", error);
            console.error("Error details:", {
                message: error.message,
                code: error.code,
                data: error.data
            });
            throw new BadRequestException('Blockchain transaction failed: ' + error.message);
        }

        // Step 2: Only save to database AFTER blockchain success
        const newProduct = this.productRepository.create({
            ...createProductDto,
            unitPrice: onChainPrice, // Save in smallest unit for consistency
            transactionHash: tx.transactionHash, // Include transaction hash
            blockchainProductId: blockchainProductId, // Store blockchain ID
        });

        const savedProduct = await this.productRepository.save(newProduct);
        console.log("✅ Product saved to database with transaction hash:", tx.transactionHash);

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
        // First check if product exists
        const existingProduct = await this.productRepository.findOne({ where: { productID: id } });
        if (!existingProduct) {
            throw new NotFoundException(`Product with ID ${id} not found`);
        }

        // Validate GST rate according to contract requirements
        const gstRate = Math.round(updateProductDto.gstRate ?? existingProduct.gstRate);
        if (gstRate <= 0 || gstRate > 100) {
            throw new BadRequestException('GST rate must be between 1 and 100');
        }

        // IMPORTANT: BLOCKCHAIN TRANSACTION OCCURS FIRST
        // Step 1: Execute blockchain transaction BEFORE making any database changes
        let updateTx;
        try {
            console.log("🔗 Executing blockchain update transaction first...");
            updateTx = await this.contract.methods
                .updateProduct(
                    existingProduct.blockchainProductId,        // _id (use blockchain product ID)
                    updateProductDto.productName ?? existingProduct.productName,   // _name
                    Math.round(updateProductDto.unitPrice ?? existingProduct.unitPrice), // _basePrice
                    gstRate                                     // _gstRate (validated)
                )
                .send({ from: this.account });

            console.log("✅ Product updated on blockchain with blockchainProductId:", existingProduct.blockchainProductId);
            console.log("📋 Full updateTx object keys:", Object.keys(updateTx));
            console.log("📋 Full updateTx object:", JSON.stringify(updateTx, null, 2));
            console.log("📋 Update transaction hash:", updateTx?.transactionHash);
            console.log("📋 Update transaction hash (direct):", updateTx.transactionHash);

            // Try different ways to get transaction hash
            let transactionHash = updateTx.transactionHash;
            if (!transactionHash && updateTx.transactionHash) {
                transactionHash = updateTx.transactionHash;
            }
            if (!transactionHash && updateTx.hash) {
                transactionHash = updateTx.hash;
            }

            console.log("📋 Final extracted transaction hash:", transactionHash);
            updateTx.transactionHash = transactionHash; // Ensure it's set
        } catch (error) {
            // CRITICAL: If blockchain transaction fails, ABORT and don't touch the database
            console.error("❌ Blockchain update failed - aborting database update:", error);
            throw new BadRequestException('Blockchain update failed: ' + error.message);
        }

        // Step 2: ONLY AFTER blockchain success, update the database
        console.log("💾 Blockchain transaction successful - now updating database...");
        console.log("📋 Update transaction result keys:", Object.keys(updateTx));
        console.log("📋 Update transaction result:", JSON.stringify(updateTx, null, 2));
        console.log("📋 Transaction hash from blockchain:", updateTx.transactionHash);
        console.log("📋 Transaction hash exists:", !!updateTx.transactionHash);

        // Update the existing product entity with new data and transaction hash
        console.log("📋 Old transaction hash in DB:", existingProduct.transactionHash);
        const newTransactionHash = updateTx.transactionHash;
        console.log("📋 New transaction hash to be set:", newTransactionHash);

        // Explicitly set the transaction hash
        existingProduct.transactionHash = newTransactionHash;
        console.log("📋 Transaction hash after setting on entity:", existingProduct.transactionHash);

        // Apply other updates from DTO
        if (updateProductDto.productName !== undefined) {
            existingProduct.productName = updateProductDto.productName;
        }
        if (updateProductDto.gstRate !== undefined) {
            existingProduct.gstRate = updateProductDto.gstRate;
        }
        if (updateProductDto.productDescription !== undefined) {
            existingProduct.productDescription = updateProductDto.productDescription;
        }
        if (updateProductDto.image_url !== undefined) {
            existingProduct.image_url = updateProductDto.image_url;
        }
        if (updateProductDto.image_id !== undefined) {
            existingProduct.image_id = updateProductDto.image_id;
        }
        if (updateProductDto.service !== undefined) {
            existingProduct.service = updateProductDto.service;
        }
        if (updateProductDto.unitPrice !== undefined) {
            existingProduct.unitPrice = updateProductDto.unitPrice;
        }

        console.log("📋 Saving product to database...");
        const savedProduct = await this.productRepository.save(existingProduct);
        console.log("✅ Database updated successfully after blockchain transaction");
        console.log("📋 Final transaction hash in saved product:", savedProduct.transactionHash);
        return savedProduct;
    }


    async remove(id: number): Promise<void> {
        // First check if product exists
        const existingProduct = await this.productRepository.findOne({ where: { productID: id } });
        if (!existingProduct) {
            throw new NotFoundException(`Product with ID ${id} not found`);
        }

        // IMPORTANT: BLOCKCHAIN TRANSACTION OCCURS FIRST
        // Step 1: Execute blockchain transaction BEFORE making any database changes
        try {
            console.log("🔗 Executing blockchain delete transaction first...");
            console.log("📋 Attempting to delete product with blockchainProductId:", existingProduct.blockchainProductId);
            console.log("📋 Database productID:", existingProduct.productID);

            const receipt = await this.contract.methods.deleteProduct(existingProduct.blockchainProductId).send({ from: this.account });
            console.log('✅ Product deleted from blockchain with blockchainProductId:', existingProduct.blockchainProductId, 'transaction:', receipt.transactionHash);
        } catch (error) {
            // CRITICAL: If blockchain transaction fails, ABORT and don't touch the database
            console.error("❌ Blockchain delete failed - aborting database deletion:", error);
            console.error("❌ Error details:", {
                message: error.message,
                code: error.code,
                data: error.data
            });

            // Check if this is a "Product not found" error from the contract
            if (error.message && error.message.includes('Product')) {
                console.error("❌ Product not found on blockchain - possible data inconsistency");
                console.error("❌ Database has product but blockchain doesn't - manual cleanup may be needed");
                console.error("💡 Suggestion: Check if this product was created before blockchainProductId was implemented");
                console.error("💡 Or verify that the blockchainProductId value is correct");
            }

            throw new BadRequestException('Blockchain delete failed: ' + error.message);
        }

        // Step 2: ONLY AFTER blockchain success, delete from the database
        console.log("💾 Blockchain transaction successful - now deleting from database...");
        await this.productRepository.delete(id);
        console.log(`✅ Product with ID ${id} deleted from database after blockchain transaction`);
    }

    // Method to check data consistency between database and blockchain
    async checkBlockchainConsistency(): Promise<{ consistent: Product[], inconsistent: Product[] }> {
        console.log("🔍 Checking data consistency between database and blockchain...");

        const allProducts = await this.productRepository.find();
        const consistent: Product[] = [];
        const inconsistent: Product[] = [];

        for (const product of allProducts) {
            try {
                // Try to get product data from blockchain
                const blockchainProduct = await this.contract.methods.products(product.blockchainProductId).call();

                if (blockchainProduct && blockchainProduct.productID) {
                    console.log(`✅ Product ${product.productID} (blockchain ID: ${product.blockchainProductId}) exists on blockchain`);
                    consistent.push(product);
                } else {
                    console.log(`❌ Product ${product.productID} (blockchain ID: ${product.blockchainProductId}) not found on blockchain`);
                    inconsistent.push(product);
                }
            } catch (error) {
                console.log(`❌ Error checking product ${product.productID} (blockchain ID: ${product.blockchainProductId}):`, error.message);
                inconsistent.push(product);
            }
        }

        console.log(`📊 Consistency check complete: ${consistent.length} consistent, ${inconsistent.length} inconsistent`);
        return { consistent, inconsistent };
    }
}
