import { Injectable, NotFoundException, BadRequestException, InternalServerErrorException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { CreateCustomerDto } from './dto/create-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';
import Web3 from 'web3';
import { Customer } from "./entities/customer.entity";
import * as chalk from "chalk";


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
        if (!process.env.CUSTOMER_CONTRACT_ADDRESS) {
            throw new Error('CONTRACT_ADDRESS is not set in environment variables');
        }
        if (!process.env.PRIVATE_KEY) {
            throw new Error('PRIVATE_KEY is not set in environment variables');
        }
        if (!process.env.OWNER_ADDRESS) {
            throw new Error('OWNER_ADDRESS is not set in environment variables');
        }

        this.providerURL = process.env.PROVIDER_URL;
        this.contractAddress = process.env.CUSTOMER_CONTRACT_ADDRESS;
        this.privateKey = process.env.PRIVATE_KEY;

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
            console.log(chalk.green("✅ Web3 account for customer initialized:", this.account));
        } catch (err) {
            console.error(chalk.red("❌ Failed to initialize Web3 account:"), err);
            throw new InternalServerErrorException("Failed to initialize Web3 account");
        };
    }


    async create(createCustomerDto: CreateCustomerDto): Promise<Customer> {
        console.log("📌 Received DTO:", createCustomerDto);

        // Check for duplicate phone before inserting
        const existingCustomer = await this.customerRepository.findOne({ where: { phone: createCustomerDto.phone } });
        if (existingCustomer) {
            throw new BadRequestException(`Customer with phone ${createCustomerDto.phone} already exists.`);
        }

        // Save to database (ID will be auto-generated)
        const newCustomer = this.customerRepository.create(createCustomerDto);
        console.log("📌 Created Customer:", newCustomer);

        const savedCustomer = await this.customerRepository.save(newCustomer);
        console.log("📌 Saved Customer:", savedCustomer);

        // Ensure all values exist before blockchain call
        if (!savedCustomer.id || !savedCustomer.name || !savedCustomer.gstNumber) {
            throw new BadRequestException("Missing required fields for blockchain transaction");
        }

        console.log("🚀 Sending to blockchain:", savedCustomer.id, savedCustomer.name, savedCustomer.gstNumber);

        // Send data to blockchain
        const tx = await this.contract.methods
            .addCustomer(savedCustomer.id, savedCustomer.name, savedCustomer.gstNumber)
            .send({ from: this.account });

        // Save blockchain transaction hash
        savedCustomer.transactionHash = tx.transactionHash;
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

        const { name, gstNumber, ...rest } = updateCustomerDto;

        try {
            const receipt = await this.contract.methods.updateCustomer(id, name, gstNumber)
                .send({ from: this.account });

            const transactionHash = receipt.transactionHash; // Capture transaction hash

            Object.assign(customer, { name, gstNumber, transactionHash, ...rest });
            return this.customerRepository.save(customer);
        } catch (error) {
            throw new InternalServerErrorException('Blockchain transaction failed');
        }
    }


    // DELETE Customer (On-chain & Database)

    async remove(id: string): Promise<void> {
        const result = await this.customerRepository.delete(id);
        if (result.affected === 0) {
            throw new NotFoundException(`Customer with ID ${id} not found.`);
        }
    }


    async totalCustomers(): Promise<number> {
        return await this.customerRepository.count();
    }

}