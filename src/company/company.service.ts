import {
  Injectable,
  NotFoundException,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Company } from './entities/company.entity';
import { CreateCompanyDto } from './dto/create-company.dto';
import { UpdateCompanyDto } from './dto/update-company.dto';
import Web3 from 'web3';
import * as chalk from 'chalk';

@Injectable()
export class CompanyService {
  private web3: Web3;
  private contract: any;
  private account: string;
  private contractAddress: string;
  private privateKey: string;
  private providerURL: string;
  private ownerAddress: string;

  constructor(
    @InjectRepository(Company)
    private readonly companyRepository: Repository<Company>,
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
    this.ownerAddress = process.env.OWNER_ADDRESS;

    this.web3 = new Web3(new Web3.providers.HttpProvider(this.providerURL));
    this.contract = new this.web3.eth.Contract(
      [
        {
          inputs: [],
          stateMutability: 'nonpayable',
          type: 'constructor',
        },
        {
          anonymous: false,
          inputs: [
            {
              indexed: false,
              internalType: 'uint256',
              name: 'id',
              type: 'uint256',
            },
            {
              indexed: false,
              internalType: 'string',
              name: 'name',
              type: 'string',
            },
            {
              indexed: false,
              internalType: 'string',
              name: 'gstNumber',
              type: 'string',
            },
            {
              indexed: false,
              internalType: 'address',
              name: 'wallet',
              type: 'address',
            },
            {
              indexed: false,
              internalType: 'address',
              name: 'legalRepresentative',
              type: 'address',
            },
          ],
          name: 'CompanyAdded',
          type: 'event',
        },
        {
          anonymous: false,
          inputs: [
            {
              indexed: false,
              internalType: 'uint256',
              name: 'id',
              type: 'uint256',
            },
            {
              indexed: false,
              internalType: 'address',
              name: 'wallet',
              type: 'address',
            },
          ],
          name: 'CompanyDeleted',
          type: 'event',
        },
        {
          anonymous: false,
          inputs: [
            {
              indexed: false,
              internalType: 'uint256',
              name: 'id',
              type: 'uint256',
            },
            {
              indexed: false,
              internalType: 'string',
              name: 'name',
              type: 'string',
            },
            {
              indexed: false,
              internalType: 'string',
              name: 'gstNumber',
              type: 'string',
            },
            {
              indexed: false,
              internalType: 'address',
              name: 'wallet',
              type: 'address',
            },
            {
              indexed: false,
              internalType: 'address',
              name: 'legalRepresentative',
              type: 'address',
            },
          ],
          name: 'CompanyUpdated',
          type: 'event',
        },
        {
          anonymous: false,
          inputs: [
            {
              indexed: true,
              internalType: 'address',
              name: 'oldOwner',
              type: 'address',
            },
            {
              indexed: true,
              internalType: 'address',
              name: 'newOwner',
              type: 'address',
            },
          ],
          name: 'OwnershipTransferred',
          type: 'event',
        },
        {
          anonymous: false,
          inputs: [
            {
              indexed: false,
              internalType: 'uint256',
              name: 'userId',
              type: 'uint256',
            },
            {
              indexed: false,
              internalType: 'string',
              name: 'username',
              type: 'string',
            },
            {
              indexed: true,
              internalType: 'address',
              name: 'companyWallet',
              type: 'address',
            },
          ],
          name: 'UserTransactionAdded',
          type: 'event',
        },
        {
          anonymous: false,
          inputs: [
            {
              indexed: false,
              internalType: 'uint256',
              name: 'userId',
              type: 'uint256',
            },
            {
              indexed: true,
              internalType: 'address',
              name: 'companyWallet',
              type: 'address',
            },
          ],
          name: 'UserTransactionDeleted',
          type: 'event',
        },
        {
          anonymous: false,
          inputs: [
            {
              indexed: false,
              internalType: 'uint256',
              name: 'userId',
              type: 'uint256',
            },
            {
              indexed: false,
              internalType: 'string',
              name: 'username',
              type: 'string',
            },
            {
              indexed: true,
              internalType: 'address',
              name: 'companyWallet',
              type: 'address',
            },
          ],
          name: 'UserTransactionUpdated',
          type: 'event',
        },
        {
          inputs: [
            {
              internalType: 'address',
              name: '',
              type: 'address',
            },
          ],
          name: 'actionHistory',
          outputs: [
            {
              internalType: 'string',
              name: 'method',
              type: 'string',
            },
            {
              internalType: 'bytes32',
              name: 'transactionHash',
              type: 'bytes32',
            },
            {
              internalType: 'uint256',
              name: 'date',
              type: 'uint256',
            },
            {
              internalType: 'uint256',
              name: 'id',
              type: 'uint256',
            },
          ],
          stateMutability: 'view',
          type: 'function',
        },
        {
          inputs: [
            {
              internalType: 'string',
              name: '_name',
              type: 'string',
            },
            {
              internalType: 'string',
              name: '_gstNumber',
              type: 'string',
            },
            {
              internalType: 'address',
              name: '_legalRep',
              type: 'address',
            },
          ],
          name: 'addCompany',
          outputs: [],
          stateMutability: 'nonpayable',
          type: 'function',
        },
        {
          inputs: [
            {
              internalType: 'address',
              name: '_companyWallet',
              type: 'address',
            },
            {
              internalType: 'string',
              name: '_username',
              type: 'string',
            },
            {
              internalType: 'uint256',
              name: '_amount',
              type: 'uint256',
            },
            {
              internalType: 'uint256',
              name: '_gst',
              type: 'uint256',
            },
            {
              internalType: 'address',
              name: '_userAddress',
              type: 'address',
            },
          ],
          name: 'addUserTransaction',
          outputs: [],
          stateMutability: 'nonpayable',
          type: 'function',
        },
        {
          inputs: [
            {
              internalType: 'address',
              name: '',
              type: 'address',
            },
          ],
          name: 'companies',
          outputs: [
            {
              internalType: 'uint256',
              name: 'id',
              type: 'uint256',
            },
            {
              internalType: 'string',
              name: 'name',
              type: 'string',
            },
            {
              internalType: 'string',
              name: 'gstNumber',
              type: 'string',
            },
            {
              internalType: 'address',
              name: 'wallet',
              type: 'address',
            },
            {
              internalType: 'address',
              name: 'legalRepresentative',
              type: 'address',
            },
          ],
          stateMutability: 'view',
          type: 'function',
        },
        {
          inputs: [
            {
              internalType: 'uint256',
              name: '',
              type: 'uint256',
            },
          ],
          name: 'companyIdToWallet',
          outputs: [
            {
              internalType: 'address',
              name: '',
              type: 'address',
            },
          ],
          stateMutability: 'view',
          type: 'function',
        },
        {
          inputs: [
            {
              internalType: 'uint256',
              name: '_companyId',
              type: 'uint256',
            },
          ],
          name: 'deleteCompany',
          outputs: [],
          stateMutability: 'nonpayable',
          type: 'function',
        },
        {
          inputs: [
            {
              internalType: 'address',
              name: '_companyWallet',
              type: 'address',
            },
            {
              internalType: 'uint256',
              name: '_userId',
              type: 'uint256',
            },
          ],
          name: 'deleteUserTransaction',
          outputs: [],
          stateMutability: 'nonpayable',
          type: 'function',
        },
        {
          inputs: [
            {
              internalType: 'address',
              name: '_companyWallet',
              type: 'address',
            },
            {
              internalType: 'uint256',
              name: '_userId',
              type: 'uint256',
            },
          ],
          name: 'getUserTransaction',
          outputs: [
            {
              components: [
                {
                  internalType: 'uint256',
                  name: 'userId',
                  type: 'uint256',
                },
                {
                  internalType: 'string',
                  name: 'username',
                  type: 'string',
                },
                {
                  internalType: 'uint256',
                  name: 'amount',
                  type: 'uint256',
                },
                {
                  internalType: 'uint256',
                  name: 'gst',
                  type: 'uint256',
                },
                {
                  internalType: 'address',
                  name: 'userAddress',
                  type: 'address',
                },
              ],
              internalType: 'struct AdminInvoice.UserTransaction',
              name: '',
              type: 'tuple',
            },
          ],
          stateMutability: 'view',
          type: 'function',
        },
        {
          inputs: [],
          name: 'owner',
          outputs: [
            {
              internalType: 'address',
              name: '',
              type: 'address',
            },
          ],
          stateMutability: 'view',
          type: 'function',
        },
        {
          inputs: [
            {
              internalType: 'address',
              name: '_newOwner',
              type: 'address',
            },
          ],
          name: 'transferOwnership',
          outputs: [],
          stateMutability: 'nonpayable',
          type: 'function',
        },
        {
          inputs: [
            {
              internalType: 'uint256',
              name: '_companyId',
              type: 'uint256',
            },
            {
              internalType: 'address',
              name: '_newLegalRep',
              type: 'address',
            },
          ],
          name: 'updateCompany',
          outputs: [],
          stateMutability: 'nonpayable',
          type: 'function',
        },
        {
          inputs: [
            {
              internalType: 'address',
              name: '_companyWallet',
              type: 'address',
            },
            {
              internalType: 'address',
              name: '_newLegalRep',
              type: 'address',
            },
          ],
          name: 'updateLegalRepresentative',
          outputs: [],
          stateMutability: 'nonpayable',
          type: 'function',
        },
        {
          inputs: [
            {
              internalType: 'address',
              name: '_companyWallet',
              type: 'address',
            },
            {
              internalType: 'uint256',
              name: '_userId',
              type: 'uint256',
            },
            {
              internalType: 'string',
              name: '_username',
              type: 'string',
            },
            {
              internalType: 'uint256',
              name: '_amount',
              type: 'uint256',
            },
            {
              internalType: 'uint256',
              name: '_gst',
              type: 'uint256',
            },
          ],
          name: 'updateUserTransaction',
          outputs: [],
          stateMutability: 'nonpayable',
          type: 'function',
        },
        {
          inputs: [
            {
              internalType: 'address',
              name: '',
              type: 'address',
            },
            {
              internalType: 'uint256',
              name: '',
              type: 'uint256',
            },
          ],
          name: 'userTransactions',
          outputs: [
            {
              internalType: 'uint256',
              name: 'userId',
              type: 'uint256',
            },
            {
              internalType: 'string',
              name: 'username',
              type: 'string',
            },
            {
              internalType: 'uint256',
              name: 'amount',
              type: 'uint256',
            },
            {
              internalType: 'uint256',
              name: 'gst',
              type: 'uint256',
            },
            {
              internalType: 'address',
              name: 'userAddress',
              type: 'address',
            },
          ],
          stateMutability: 'view',
          type: 'function',
        },
      ],
      this.contractAddress,
    );

    const sanitizedPrivateKey = this.privateKey.startsWith('0x')
      ? this.privateKey
      : '0x' + this.privateKey;

    try {
      const account =
        this.web3.eth.accounts.privateKeyToAccount(sanitizedPrivateKey);
      this.account = account.address;
      this.web3.eth.accounts.wallet.add(account);
      this.web3.eth.defaultAccount = account.address;
      // console.log(chalk.green("✅ Web3 account initialized:", this.account));
    } catch (err) {
      // console.error(chalk.red("❌ Failed to initialize Web3 account:"), err);
      throw new InternalServerErrorException(
        'Failed to initialize Web3 account',
      );
    }
  }

  private async sendTransaction(encodedABI: string): Promise<any> {
    const nonce = await this.web3.eth.getTransactionCount(
      this.ownerAddress,
      'latest',
    );

    const tx = {
      to: this.contractAddress,
      data: encodedABI,
      gas: 500000,
      gasPrice: this.web3.utils.toWei('20', 'gwei'),
      nonce: nonce,
      // type: 0, // Optional: only if you specifically want to use legacy type
    };

    // console.log("TX Object:", tx);
    // console.log("Private Key:", this.privateKey);
    // console.log("Account:", this.account);

    // Sign transaction using private key
    const signedTx = await this.web3.eth.accounts.signTransaction(
      tx,
      this.privateKey,
    );
    // console.log("Signed Transaction:", signedTx);

    if (!signedTx.rawTransaction) {
      throw new InternalServerErrorException('Failed to sign the transaction');
    }

    // console.log("📤 Sending signed transaction to the network...", signedTx.rawTransaction);

    // Send the signed transaction
    return this.web3.eth.sendSignedTransaction(signedTx.rawTransaction);
  }

  async create(
    createCompanyDto: CreateCompanyDto,
    logoUrl: string,
  ): Promise<Company> {
    const {
      companyName,
      gstNumber,
      legalRepresentative,
      addressline1,
      addressline2,
      district,
    } = createCompanyDto;

    if (!companyName || !gstNumber || !legalRepresentative) {
      throw new BadRequestException('Company details are incomplete');
    }

    // console.log("📌 CompanyService: Starting company creation");
    // console.log("➡️ Payload:", createCompanyDto);

    const address =
      `${addressline1}, ${addressline2 || ''}, ${district || ''}`.trim();

    const existingCompany = await this.companyRepository.findOne({
      where: { companyName },
    });
    if (existingCompany) {
      throw new BadRequestException(
        `Company with name "${companyName}" already exists`,
      );
    }

    const encodedABI = this.contract.methods
      .addCompany(companyName, gstNumber, legalRepresentative)
      .encodeABI();

    // console.log("📤 Sending transaction to blockchain...");

    const receipt = await this.sendTransaction(encodedABI);

    if (!receipt || !receipt.status) {
      // console.error("❌ Blockchain transaction failed");
      throw new InternalServerErrorException('Transaction failed on-chain');
    }

    // console.log("✅ Transaction confirmed!");
    // console.log("🔗 Tx Hash:", receipt.transactionHash);

    const newCompany = this.companyRepository.create({
      ...createCompanyDto,
      image_url: logoUrl,
      address,
      transactionHash: receipt.transactionHash,
    });

    const savedCompany = await this.companyRepository.save(newCompany);

    // console.log(chalk.bgGrey("✅ Company saved to database with ID:", savedCompany.id));

    return savedCompany;
  }

  // Get all companies
  async findAll(): Promise<Company[]> {
    return this.companyRepository.find();
  }

  // Get all companies using tenant id
  async findByTenantId(tenantId: string) {
    const company = await this.companyRepository.findOne({
      where: { tenantId },
      relations: ['invoices'], // optional: include relations if needed
    });

    if (!company) {
      throw new NotFoundException(
        `Company with tenant ID ${tenantId} not found`,
      );
    }

    return company;
  }

  // Get a company by ID
  async findOne(id: number): Promise<Company> {
    const company = await this.companyRepository.findOne({ where: { id } });
    if (!company) {
      throw new NotFoundException(`Company with ID ${id} not found`);
    }
    return company;
  }

  // Update a company
  async update(
    id: number,
    updateCompanyDto: UpdateCompanyDto,
  ): Promise<Company> {
    const company = await this.companyRepository.findOne({ where: { id } });
    if (!company) {
      throw new NotFoundException(`Company with ID ${id} not found`);
    }

    // If legalRepresentative is not provided, use the existing one
    if (!updateCompanyDto.legalRepresentative) {
      updateCompanyDto.legalRepresentative = company.legalRepresentative;
    }

    // Update the company in the database
    Object.assign(company, updateCompanyDto);
    const updatedCompany = await this.companyRepository.save(company);

    // Call the smart contract to update the company
    const tx = await this.contract.methods
      .updateCompany(id, updateCompanyDto.legalRepresentative)
      .send({ from: this.account, gas: 3000000 });

    // Save the transaction hash to the database
    updatedCompany.transactionHash = tx.transactionHash;
    await this.companyRepository.save(updatedCompany);

    // console.log(chalk.bgGrey("✅ Company updated in database with ID:", updatedCompany.id));
    return updatedCompany;
  }

  // Delete a company
  async remove(id: number): Promise<void> {
    const result = await this.companyRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Company with ID ${id} not found`);
    }
  }

  // Total companies
  async getTotalCompanies(): Promise<number> {
    return this.companyRepository.count();
  }
}
