import { Injectable, NotFoundException, BadRequestException, InternalServerErrorException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { CreateCustomerDto } from './dto/create-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';
import { Web3 } from 'web3';
import { Customer } from "./entities/customer.entity";
import * as chalk from "chalk";
import { CONTRACT_ABI } from '../abi/contract.abi';


@Injectable()
export class CustomerService {
    private web3: Web3;
    private contract: any;
    private account: string;
    private contractAddress: string;
    private privateKey: string;
    private providerURL: string;

    constructor(
        @InjectRepository(Customer)
        private customerRepository: Repository<Customer>,
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

        this.web3 = new Web3(new Web3.providers.HttpProvider(this.providerURL));
        this.contract = new this.web3.eth.Contract(CONTRACT_ABI, this.contractAddress);
        const sanitizedPrivateKey = this.privateKey.startsWith("0x")
            ? this.privateKey
            : "0x" + this.privateKey;

        try {
            const account = this.web3.eth.accounts.privateKeyToAccount(sanitizedPrivateKey);
            this.account = account.address;
            this.web3.eth.accounts.wallet.add(account);
            this.web3.eth.defaultAccount = account.address;
            // console.log(chalk.green("✅ Web3 account for customer initialized:", this.account));
        } catch (err) {
            // console.error(chalk.red("❌ Failed to initialize Web3 account:"), err);
            throw new InternalServerErrorException("Failed to initialize Web3 account");
        };
    }


    async create(createCustomerDto: CreateCustomerDto): Promise<Customer> {
        // console.log("📌 Received DTO:", createCustomerDto);

        // Check for duplicate phone before inserting
        const existingCustomer = await this.customerRepository.findOne({ where: { phone: createCustomerDto.phone } });
        if (existingCustomer) {
            throw new BadRequestException(`Customer with phone ${createCustomerDto.phone} already exists.`);
        }

        // Save to database (ID will be auto-generated)
        const newCustomer = this.customerRepository.create(createCustomerDto);
        // console.log("📌 Created Customer:", newCustomer);

        const savedCustomer = await this.customerRepository.save(newCustomer);
        // console.log("📌 Saved Customer:", savedCustomer);

        // Ensure all values exist before blockchain call
        if (!savedCustomer.wallet_address || !savedCustomer.name || !savedCustomer.gstNumber) {
            throw new BadRequestException("Missing required fields for blockchain transaction");
        }

        // console.log("🚀 Sending to blockchain:", savedCustomer.wallet_address, savedCustomer.name, savedCustomer.gstNumber);

        // Send data to blockchain
        const tx = await this.contract.methods
            .addCustomer(savedCustomer.wallet_address, savedCustomer.name, savedCustomer.gstNumber)
            .send({ from: this.account });

        // Get the blockchain customer ID from the CustomerAdded event
        let blockchainCustomerId: number;
        try {
            if (tx.events && tx.events.CustomerAdded) {
                blockchainCustomerId = parseInt(tx.events.CustomerAdded.returnValues.customerId);
                console.log("🔢 Blockchain Customer ID (from event):", blockchainCustomerId);
            } else {
                // Fallback: query totalCustomers if event is not available
                const totalCustomers = await this.contract.methods.totalCustomers().call();
                blockchainCustomerId = parseInt(totalCustomers.toString());
                console.log("🔢 Blockchain Customer ID (fallback from totalCustomers):", blockchainCustomerId);
            }
        } catch (error) {
            console.error("❌ Could not get blockchain customer ID:", error);
            throw new InternalServerErrorException('Failed to get blockchain customer ID');
        }

        // Save blockchain transaction hash and customer ID
        savedCustomer.transactionHash = tx.transactionHash;
        savedCustomer.blockchainCustomerId = blockchainCustomerId;
        await this.customerRepository.save(savedCustomer);

        return savedCustomer;
    }





    // GET All Customers (Database Only)
    async findAll(): Promise<Customer[]> {
        return this.customerRepository.find();
    }


    async findOne(id: string): Promise<Customer> {
        const customer = await this.customerRepository.findOne({ where: { id } });

        if (!customer) {
            throw new NotFoundException(`Customer with ID ${id} not found`);
        }

        return customer;
    }


    async findAllByTenantId(company_tenant_id: string) {
        const customers = await this.customerRepository.find({ where: { company_tenant_id } });

        return customers.map(customer => ({
            ...customer,

        }));
    }




    // UPDATE Customer (On-chain & Database)
    async update(id: string, updateCustomerDto: UpdateCustomerDto): Promise<Customer> {
        const customer = await this.customerRepository.findOne({ where: { id: id.toString() } });

        if (!customer) {
            throw new NotFoundException(`Customer with ID ${id} not found`);
        }

        const { name, gstNumber, phone, ...rest } = updateCustomerDto;

        // Check for duplicate GST number if gstNumber is being updated
        if (gstNumber && gstNumber !== customer.gstNumber) {
            const existingCustomer = await this.customerRepository.findOne({ where: { gstNumber } });
            if (existingCustomer && existingCustomer.id !== customer.id) {
                throw new BadRequestException(`Customer with GST number ${gstNumber} already exists.`);
            }
        }

        // Check for duplicate phone if phone is being updated
        if (phone && phone !== customer.phone) {
            const existingCustomer = await this.customerRepository.findOne({ where: { phone } });
            if (existingCustomer && existingCustomer.id !== customer.id) {
                throw new BadRequestException(`Customer with phone ${phone} already exists.`);
            }
        }

        try {
            // Use blockchainCustomerId for update (uint256 parameter)
            const receipt = await this.contract.methods.updateCustomer(
                customer.blockchainCustomerId,  // _customerId (uint256)
                customer.wallet_address,        // _newWallet (keep same wallet)
                name || customer.name,          // _newName
                gstNumber || customer.gstNumber // _newGSTNumber
            )
            .send({ from: this.account });

            const transactionHash = receipt.transactionHash; // Capture transaction hash

            Object.assign(customer, { name, gstNumber, phone, transactionHash, ...rest });
            return this.customerRepository.save(customer);
        } catch (error) {
            throw new InternalServerErrorException('Blockchain transaction failed');
        }
    }


    // DELETE Customer (On-chain & Database)

    async remove(id: string): Promise<void> {
        const customer = await this.customerRepository.findOne({ where: { id } });
        if (!customer) {
            throw new NotFoundException(`Customer with ID ${id} not found.`);
        }

        // Delete from blockchain first using blockchainCustomerId
        try {
            await this.contract.methods.deleteCustomer(customer.blockchainCustomerId)
                .send({ from: this.account });
        } catch (error) {
            throw new InternalServerErrorException('Blockchain transaction failed');
        }

        // Then delete from database
        const result = await this.customerRepository.delete(id);
        if (result.affected === 0) {
            throw new NotFoundException(`Customer with ID ${id} not found.`);
        }
    }


    async totalCustomers(): Promise<number> {
        return await this.customerRepository.count();
    }

}
