import { Injectable, Logger, NotFoundException, InternalServerErrorException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { Invoice } from './entities/invoice.entity';
import { CreateInvoiceDto } from './dto/create-invoice.dto';
import { UpdateInvoiceDto } from './dto/update-invoice.dto';
import Web3 from 'web3';
import * as PDFDocument from 'pdfkit';
import * as chalk from 'chalk';
import { info } from 'console';

@Injectable()
export class InvoiceService {
    private web3: Web3;
    private contract: any;
    private account: string;
    private contractAddress: string;
    private privateKey: string;
    private providerURL: string;


    constructor(
        @InjectRepository(Invoice)
        private invoiceRepository: Repository<Invoice>
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

        // Initialize Web3 connection
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
                        "indexed": false,
                        "internalType": "uint256",
                        "name": "grandTotal",
                        "type": "uint256"
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
                    },
                    {
                        "indexed": false,
                        "internalType": "uint256",
                        "name": "grandTotal",
                        "type": "uint256"
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
                        "name": "_invoiceNumber",
                        "type": "string"
                    },
                    {
                        "internalType": "uint256",
                        "name": "_grandTotal",
                        "type": "uint256"
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
                "inputs": [
                    {
                        "internalType": "string",
                        "name": "",
                        "type": "string"
                    }
                ],
                "name": "invoices",
                "outputs": [
                    {
                        "internalType": "string",
                        "name": "invoiceNumber",
                        "type": "string"
                    },
                    {
                        "internalType": "uint256",
                        "name": "grandTotal",
                        "type": "uint256"
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
                        "internalType": "uint256",
                        "name": "_grandTotal",
                        "type": "uint256"
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

    // PDF Generation Method
    async generateInvoicePDF(invoiceId: string): Promise<Buffer> {
        try {
            const invoice = await this.findOne(invoiceId);
            const formattedDate = new Date(invoice.invoiceDate).toLocaleDateString('en-IN', {
                day: '2-digit',
                month: 'short',
                year: 'numeric'
            });

            return new Promise((resolve, reject) => {
                const doc = new PDFDocument({ size: 'A4', margin: 0 });
                const buffers: Buffer[] = [];

                doc.on('data', buffers.push.bind(buffers));
                doc.on('end', () => {
                    const pdfData = Buffer.concat(buffers);
                    resolve(pdfData);
                });

                // Colors
                const orangeColor = '#FF6B35';
                const darkBlue = '#2C3E50';
                const lightGray = '#F8F9FA';
                const textColor = '#333333';

                // Header Section with Orange Background
                doc.rect(0, 0, 595, 120).fill(orangeColor);

                // Company Logo/Icon (simplified)
                // doc.rect(30, 25, 30, 30).fill('white');
                // doc.fontSize(16).fillColor('white').text('📄', 40, 35);

                // Company Name and Service Type
                doc.fontSize(24).fillColor('white').text('Eastern Supplies Co.', 80, 30);
                doc.fontSize(12).fillColor('white').text('Professional Services', 80, 55);

                // Invoice Title and Number (Right side)
                doc.rect(450, 20, 120, 40).fill(darkBlue);
                doc.fontSize(16).fillColor('white').text('INVOICE', 465, 30);
                doc.fontSize(10).fillColor('white').text(`INVOICE NO: ${invoice.invoiceNo}`, 450, 75);
                doc.fontSize(10).fillColor('white').text(`DATE: ${formattedDate}`, 450, 90);

                // Reset fill color for body content
                doc.fillColor(textColor);

                // Bill From and Bill To Section
                let yPos = 150;

                // Bill From
                doc.fontSize(12).fillColor(orangeColor).text(' BILL FROM', 40, yPos);
                yPos += 25;
                doc.fontSize(11).fillColor(textColor);
                if (invoice.seller) {
                    doc.text(invoice.seller.companyName, 40, yPos, { width: 200 });
                    yPos += 15;
                    doc.fontSize(9).fillColor('#666666');
                    doc.text(` ${invoice.seller.address}`, 40, yPos, { width: 200 });
                    yPos += 15;
                    doc.text(` ${invoice.seller.email}`, 40, yPos);
                    yPos += 15;
                    doc.text(`GST: ${invoice.seller.gstNumber}`, 40, yPos);
                }

                // Bill To (Right side)
                yPos = 150;
                doc.fontSize(12).fillColor(orangeColor).text(' BILL TO', 320, yPos);
                yPos += 25;
                doc.fontSize(11).fillColor(textColor);
                if (invoice.buyer) {
                    doc.text(invoice.buyer.name, 320, yPos, { width: 200 });
                    yPos += 15;
                    doc.fontSize(9).fillColor('#666666');
                    doc.text(` ${invoice.buyer.billingAddress}`, 320, yPos, { width: 200 });
                    yPos += 15;
                    doc.text(` ${invoice.buyer.phone}`, 320, yPos);
                    yPos += 15;
                    doc.text(` ${invoice.buyer.email}`, 320, yPos);
                    yPos += 15;
                    doc.text(`GST: ${invoice.buyer.gstNumber}`, 320, yPos);
                }

                // Items Table
                yPos = 300;

                // Table Header with Orange Background
                doc.rect(30, yPos, 535, 30).fill(orangeColor);
                doc.fontSize(10).fillColor('white');
                doc.text('ITEM NAME', 40, yPos + 10);
                doc.text('PRICE', 250, yPos + 10);
                doc.text('QTY', 320, yPos + 10);
                doc.text('GST', 380, yPos + 10);
                doc.text('TOTAL', 480, yPos + 10);

                yPos += 30;

                // Table Rows
                doc.fillColor(textColor);
                let rowColor = true;

                invoice.items.forEach((item, index) => {
                    // Alternate row background
                    if (rowColor) {
                        doc.rect(30, yPos, 535, 25).fill(lightGray);
                    }

                    doc.fontSize(9).fillColor(textColor);
                    doc.text(item.name, 40, yPos + 8, { width: 180 });
                    doc.fontSize(7).fillColor('#888888').text(`Serial: ${item.serialNo}`, 40, yPos + 18);
                    doc.text(`${item.unitPrice.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`, 250, yPos + 10);
                    doc.text(item.quantity.toString(), 330, yPos + 10);
                    doc.text(`${item.gstRate}%`, 385, yPos + 10);
                    doc.text(`${item.totalAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`, 450, yPos + 10);

                    yPos += 30;
                    rowColor = !rowColor;
                });

                // Payment Terms Section
                yPos += 20;
                doc.fontSize(11).fillColor(textColor).text('PAYMENT TERMS:', 40, yPos);
                yPos += 15;
                doc.fontSize(9).fillColor('#666666').text(invoice.paymentTerms || 'Due on Receipt', 40, yPos);

                // Transaction Details (if blockchain)
                if (invoice.transactionHash) {
                    yPos += 15;
                    doc.fontSize(9).fillColor(textColor).text('Transaction Details:', 40, yPos);
                    yPos += 12;
                    doc.fontSize(8).fillColor('#666666').text(`Blockchain: ${invoice.transactionHash}`, 40, yPos, { width: 200 });
                }

                // Totals Section (Right side)
                const totalsStartY = yPos - 60;
                let totalsY = totalsStartY;

                // Background for totals
                doc.rect(350, totalsY - 10, 215, 100).fill(lightGray);

                doc.fontSize(10).fillColor(textColor);
                doc.text('SUBTOTAL:', 360, totalsY);
                doc.text(`${Number(invoice.totalTaxableValue).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`, 480, totalsY);

                totalsY += 20;
                doc.text('GST AMOUNT:', 360, totalsY);
                doc.text(`${Number(invoice.totalGstAmount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`, 480, totalsY);

                totalsY += 30;
                // Grand Total with orange background
                doc.rect(360, totalsY - 5, 195, 25).fill(orangeColor);
                doc.fontSize(12).fillColor('white');
                doc.text('INVOICE TOTAL:', 370, totalsY + 2);
                doc.text(`${Number(invoice.grandTotal).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`, 480, totalsY + 2);

                // Footer
                doc.fontSize(8).fillColor('#888888').text(
                    'This is a computer generated invoice and does not require signature.',
                    0, 750, { align: 'center', width: 595 }
                );

                // Add border to the entire document
                doc.rect(20, 20, 555, 802).stroke('#E0E0E0');

                doc.end();
            });
        } catch (error) {
            console.error('Failed to generate PDF', error);
            throw new InternalServerErrorException('Failed to generate PDF');
        }
    }

    async generateInvoiceNumber(user?: any): Promise<string> {
        try {
          console.log('Generating invoice number for user:', user);
          
          // Validate that we have tenant_id
          if (!user?.tenant_id) {
            throw new Error('Tenant ID is required but not provided');
          }
          
          // Use tenant_id from JWT token to filter invoices
          const whereClause = { 
            company_tenant_id: user.tenant_id 
          };
          
          console.log('Where clause:', whereClause);
          
          const latestInvoice = await this.invoiceRepository.findOne({
            where: whereClause,
            order: { createdAt: 'DESC' },
            select: ['invoiceNo'], // Make sure this matches your entity column name
          });
          
          console.log('Latest invoice found:', latestInvoice);
      
          let nextNumber = 1;
      
          if (latestInvoice?.invoiceNo) {
            const parts = latestInvoice.invoiceNo.split('-');
            console.log('Invoice number parts:', parts);
            
            if (parts.length >= 3) {
              const last = parseInt(parts[2]);
              if (!isNaN(last)) {
                nextNumber = last + 1;
              }
            }
          }
      
          const invoiceNo = `INV-121-${nextNumber.toString().padStart(3, '0')}`;
          console.log('Generated invoice number:', invoiceNo);
          
          return invoiceNo;
        } catch (error) {
          console.error('Service error details:', error);
          throw new Error(`Database query failed: ${error.message}`);
        }
      }
      

    async createInvoice(createInvoiceDto: CreateInvoiceDto): Promise<Invoice> {
        try {
           
    
            // First create on blockchain
            const txHash = await this.createInvoiceOnChain(
                createInvoiceDto.invoiceNo,
                createInvoiceDto.grandTotal
            );
    
            // Then save to database
            const invoice = this.invoiceRepository.create({
                invoiceNo: createInvoiceDto.invoiceNo,  // ✅ use generated invoice number here
                invoiceDate: new Date(createInvoiceDto.invoiceDate),
                supplyType: createInvoiceDto.supplyType,
                seller: { id: createInvoiceDto.sellerId } as any,
                buyer: { id: createInvoiceDto.buyerId } as any,
                items: createInvoiceDto.items,
                totalGstAmount: createInvoiceDto.totalGstAmount,
                totalTaxableValue: createInvoiceDto.totalTaxableValue,
                grandTotal: createInvoiceDto.grandTotal,
                paymentTerms: createInvoiceDto.paymentTerms,
                isFinal: createInvoiceDto.isFinal,
                transactionHash: txHash,
            });
    
            const savedInvoice = await this.invoiceRepository.save(invoice);
            return this.findOne(savedInvoice.invoiceId);
        } catch (error) {
            throw error;
        }
    }
    

    async findInvoicesByTenantId(tenantId: string): Promise<Invoice[]> {
        const invoices = await this.invoiceRepository.find({
            where: {
                seller: {
                    tenantId: tenantId,
                },
            },
            relations: ['seller', 'buyer'], // ensures seller and buyer are fetched
            order: {
                createdAt: 'DESC',
            },
        });
        info(`Fetching invoices for tenant ID: ${tenantId}, \t found: ${invoices} invoices`);

        if (!invoices || invoices.length === 0) {
            throw new NotFoundException(`No invoices found for tenantId: ${tenantId}`);
        }

        console.log("🚀 ~ InvoiceService ~ findInvoicesByTenantId ~ invoices:", invoices)
        return invoices;
    }


    async updateInvoice(id: string, updateInvoiceDto: UpdateInvoiceDto): Promise<Invoice> {
        try {
            const invoice = await this.findOne(id);

            if (!invoice) {
                throw new NotFoundException('Invoice not found');
            }

            // Update on blockchain if grandTotal changed
            if (updateInvoiceDto.grandTotal && updateInvoiceDto.grandTotal !== invoice.grandTotal) {
                const txHash = await this.updateInvoiceOnChain(
                    invoice.invoiceNo,
                    updateInvoiceDto.grandTotal
                );
                updateInvoiceDto.transactionHash = txHash;
            }

            // Prepare update data
            const updateData: any = { ...updateInvoiceDto };

            // Convert date if provided
            if (updateInvoiceDto.invoiceDate) {
                updateData.invoiceDate = new Date(updateInvoiceDto.invoiceDate);
            }

            // Update seller and buyer references
            if (updateInvoiceDto.sellerId) {
                updateData.seller = { id: updateInvoiceDto.sellerId };
            }
            if (updateInvoiceDto.buyerId) {
                updateData.buyer = { id: updateInvoiceDto.buyerId };
            }

            // Update database
            // await this.invoiceRepository.update(id, updateData);
            Object.assign(invoice, updateData);
            return await this.invoiceRepository.save(invoice);


            return this.findOne(id);
        } catch (error) {
            // console.error('Failed to update invoice', error);
            throw error;
        }
    }

    async deleteInvoice(id: string): Promise<void> {
        const result = await this.invoiceRepository.delete(id);
        if (result.affected === 0) {
            throw new NotFoundException(`Invoice with ID ${id} not found`);
        }
    }


    async findAll(): Promise<Invoice[]> {
        return this.invoiceRepository.find({
            relations: ['seller', 'buyer'],
        });
    }

    async findOne(id: string): Promise<Invoice> {
        const invoice = await this.invoiceRepository.findOne({
            where: { invoiceId: id },
            relations: ['seller', 'buyer'],
        });

        if (!invoice) {
            throw new NotFoundException('Invoice not found');
        }

        return invoice;
    }

    async findByInvoiceNo(invoiceNo: string): Promise<Invoice> {
        const invoice = await this.invoiceRepository.findOne({
            where: { invoiceNo },
            relations: ['seller', 'buyer'],
        });

        if (!invoice) {
            throw new NotFoundException('Invoice not found');
        }

        return invoice;
    }

    // Blockchain interaction methods
    private async createInvoiceOnChain(invoiceNo: string, grandTotal: number): Promise<string> {
        try {
            const grandTotalWei = this.web3.utils.toWei(grandTotal.toString(), "ether");

            const gasPrice = await this.web3.eth.getGasPrice();
            const gasEstimate = await this.contract.methods.createInvoice(invoiceNo, grandTotalWei).estimateGas({
                from: this.account
            });

            const tx = await this.contract.methods.createInvoice(invoiceNo, grandTotalWei).send({
                from: this.account,
                gas: gasEstimate,
                gasPrice: gasPrice
            });

            // console.log(`Invoice created on blockchain: ${tx.transactionHash}`);
            return tx.transactionHash;
        } catch (error) {
            // console.error('Failed to create invoice on blockchain', error);
            throw new InternalServerErrorException('Failed to create invoice on blockchain');
        }
    }

    private async updateInvoiceOnChain(invoiceNo: string, grandTotal: number): Promise<string> {
        try {
            const grandTotalWei = this.web3.utils.toWei(grandTotal.toString(), "ether");

            const gasPrice = await this.web3.eth.getGasPrice();
            const gasEstimate = await this.contract.methods.updateInvoice(invoiceNo, grandTotalWei).estimateGas({
                from: this.account
            });

            const tx = await this.contract.methods.updateInvoice(invoiceNo, grandTotalWei).send({
                from: this.account,
                gas: gasEstimate,
                gasPrice: gasPrice
            });

            // console.log(`Invoice updated on blockchain: ${tx.transactionHash}`);
            return tx.transactionHash;
        } catch (error) {
            // console.error('Failed to update invoice on blockchain', error);
            throw new InternalServerErrorException('Failed to update invoice on blockchain');
        }
    }

    private async deleteInvoiceOnChain(invoiceNo: string): Promise<string> {
        try {
            const gasPrice = await this.web3.eth.getGasPrice();
            const gasEstimate = await this.contract.methods.deleteInvoice(invoiceNo).estimateGas({
                from: this.account
            });

            const tx = await this.contract.methods.deleteInvoice(invoiceNo).send({
                from: this.account,
                gas: gasEstimate,
                gasPrice: gasPrice
            });

            // console.log(`Invoice deleted on blockchain: ${tx.transactionHash}`);
            return tx.transactionHash;
        } catch (error) {
            // console.error('Failed to delete invoice on blockchain', error);
            throw new InternalServerErrorException('Failed to delete invoice on blockchain');
        }
    }

    async getInvoiceFromBlockchain(invoiceNo: string): Promise<any> {
        try {
            const result = await this.contract.methods.invoices(invoiceNo).call();

            if (!result.invoiceNumber) {
                throw new NotFoundException('Invoice not found on blockchain');
            }

            return {
                invoiceNumber: result.invoiceNumber,
                grandTotal: this.web3.utils.fromWei(result.grandTotal, "ether")
            };
        } catch (error) {
            // console.error('Failed to get invoice from blockchain', error);
            throw error;
        }
    }

    async getTotalInvoicesFromBlockchain(): Promise<number> {
        try {
            const total = await this.contract.methods.totalInvoices().call();
            return Number(total);
        } catch (error) {
            // console.error('Failed to get total invoices from blockchain', error);
            throw error;
        }
    }

    async syncWithBlockchain(invoiceNo: string): Promise<Invoice> {
        try {
            // Get data from blockchain
            const blockchainData = await this.getInvoiceFromBlockchain(invoiceNo);

            // Get data from database
            const dbInvoice = await this.findByInvoiceNo(invoiceNo);

            // Compare and log differences
            const blockchainTotal = parseFloat(blockchainData.grandTotal);
            if (Math.abs(dbInvoice.grandTotal - blockchainTotal) > 0.001) {
                // console.warn(`Grand total mismatch for invoice ${invoiceNo}: DB=${dbInvoice.grandTotal}, Blockchain=${blockchainTotal}`);
            }

            return dbInvoice;
        } catch (error) {
            // console.error('Failed to sync with blockchain', error);
            throw error;
        }
    }
}