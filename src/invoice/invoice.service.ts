import { Injectable, Logger, NotFoundException, InternalServerErrorException, BadRequestException, ForbiddenException } from '@nestjs/common';
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
import { Customer } from 'src/customer/entities/customer.entity';
import { CONTRACT_ABI } from 'src/abi/contract.abi';

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
        private invoiceRepository: Repository<Invoice>,
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

        // Initialize Web3 connection
        this.web3 = new Web3(new Web3.providers.HttpProvider(this.providerURL));
        this.contract = new this.web3.eth.Contract(CONTRACT_ABI, this.contractAddress);

        const sanitizedPrivateKey = this.privateKey.startsWith("0x")
            ? this.privateKey
            : "0x" + this.privateKey;
        console.log("🚀 ~ InvoiceService ~ sanitizedPrivateKey:", sanitizedPrivateKey)

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
            // console.error('Failed to generate PDF', error);
            throw new InternalServerErrorException('Failed to generate PDF');
        }
    }

    async createInvoice(createInvoiceDto: CreateInvoiceDto): Promise<Invoice> {
        try {
            const {
                invoiceNo,
                invoiceDate,
                supplyType,
                items,
                totalTaxableValue,
                totalGstAmount,
                grandTotal,
                paymentTerms,
                isFinal,
                sellerId,
                buyerId,
            } = createInvoiceDto;

            // console.log('🚀 Received invoice DTO:', createInvoiceDto);

            // 1. Check if invoice already exists on-chain

            // 2. Extract parallel arrays from items
            const productIDs: number[] = [];
            const productNames: string[] = [];
            const quantities: number[] = [];
            const unitPrices: number[] = [];
            const gstRates: number[] = [];
            const totalAmounts: number[] = [];

            // console.log('🧩 Extracting invoice items...');
            for (const item of items) {
                // console.log('➡️ Processing item:', item);
                productIDs.push(Number(item.serialNo));
                productNames.push(item.name);
                quantities.push(Number(item.quantity));
                unitPrices.push(Number(item.unitPrice));
                gstRates.push(Number(item.gstRate));
                totalAmounts.push(Number(item.totalAmount));
            }

            // console.log('✅ Extracted arrays:', {
            //     productIDs,
            //     productNames,
            //     quantities,
            //     unitPrices,
            //     gstRates,
            //     totalAmounts,
            // });

            // 3. Defensive check
            if (
                !items.length ||
                productIDs.length !== productNames.length ||
                productNames.length !== quantities.length ||
                quantities.length !== unitPrices.length ||
                unitPrices.length !== gstRates.length ||
                gstRates.length !== totalAmounts.length
            ) {
                // console.error('❌ Mismatch in item array lengths');
                throw new Error("Invoice item arrays must be of the same non-zero length");
            }

            // 4. Call smart contract method
            // console.log('📤 Sending transaction to create invoice on blockchain...');
            const tx = await this.contract.methods
                .createInvoice(
                    invoiceNo,
                    Math.floor(grandTotal * 100) // Convert to smallest unit (cents/paise)
                )
                .send({
                    from: this.account,
                    gas: 5000000,
                    gasPrice: '3000000000',
                });

            const txHash = tx.transactionHash;
            // console.log('✅ Transaction successful:', txHash);

            // 5. Store invoice in DB
            const invoice = this.invoiceRepository.create({
                invoiceNo,
                invoiceDate: new Date(invoiceDate),
                supplyType,
                seller: { id: sellerId } as any,
                buyer: { id: buyerId } as any,
                items,
                totalTaxableValue,
                totalGstAmount,
                grandTotal,
                paymentTerms,
                isFinal,
                transactionHash: txHash,
            });

            // console.log('💾 Saving invoice to database:', invoice);
            const savedInvoice = await this.invoiceRepository.save(invoice);

            const finalInvoice = await this.findOne(savedInvoice.invoiceId);
            // console.log('✅ Final saved invoice from DB:', finalInvoice);
            return finalInvoice;

        } catch (error) {
            // console.error('❌ Detailed error during invoice creation:', {
            //     message: error.message,
            //     stack: error.stack,
            //     data: error.data,
            //     code: error.code
            // });
            throw new Error(`Invoice creation failed: ${error.message}`);
        }
    }

    async findInvoicesByTenantId(tenantId: string): Promise<Invoice[]> {
        try {
            // 1. ✅ Fetch invoices from database (full invoice data)
            const dbInvoices = await this.invoiceRepository.find({
                where: {
                    seller: { tenantId },
                },
                relations: ['seller', 'buyer'],
                order: { createdAt: 'DESC' },
            });

            if (!dbInvoices || dbInvoices.length === 0) {
                throw new NotFoundException(`No invoices found for tenantId: ${tenantId}`);
            }

            // 2. ✅ Fetch all invoices from blockchain
            const chainInvoicesRaw = await this.contract.methods.getAllInvoices().call();
            const sanitizedInvoice = this.convertBigIntToString(chainInvoicesRaw);

            // 3. 🔁 Match blockchain invoices with DB invoices by `invoiceNo`
            const mergedInvoices = await Promise.all(dbInvoices.map(async (dbInv) => {
                const resolvedSanitizedInvoice = await sanitizedInvoice;
                const chainInv = resolvedSanitizedInvoice.find(
                    (ci) => ci.invoiceNumber === dbInv.invoiceNo
                );

                if (chainInv) {
                    return {
                        ...dbInv, // base from DB (has buyer/seller etc.)
                        invoiceDate: chainInv.invoiceDate || dbInv.invoiceDate,
                        supplyType: chainInv.supplyType || dbInv.supplyType,
                        items: chainInv.items?.length ? chainInv.items : dbInv.items,
                        totalTaxableValue: chainInv.totalTaxableValue || dbInv.totalTaxableValue,
                        totalGstAmount: chainInv.totalGstAmount || dbInv.totalGstAmount,
                        grandTotal: chainInv.grandTotal || dbInv.grandTotal,
                        paymentTerms: chainInv.paymentTerms || dbInv.paymentTerms,
                        isFinal: chainInv.isFinal ?? dbInv.isFinal,
                    };
                } else {
                    // Invoice not on-chain, return as is from DB
                    return dbInv;
                }
            }));

            return mergedInvoices;
        } catch (error) {
            // console.error('❌ Error in findInvoicesByTenantId:', error);
            throw error;
        }
    }

    /**
     * Find all invoices for a buyer by their wallet address
     * @param walletAddress - The wallet address of the buyer
     * @returns Promise<Invoice[]>
     */
    async findInvoicesByBuyerWallet(walletAddress: string): Promise<Invoice[]> {
        // First find the customer by wallet address
        const customer = await this.customerRepository.findOne({
            where: { wallet_address: walletAddress }
        });

        if (!customer) {
            throw new NotFoundException(`Customer with wallet address ${walletAddress} not found`);
        }

        // Find all invoices for this customer
        const invoices = await this.invoiceRepository.find({
            where: { buyer: { id: customer.id } },
            relations: ['seller', 'buyer'],
            order: { createdAt: 'DESC' }
        });

        if (invoices.length === 0) {
            throw new NotFoundException(`No invoices found for wallet address ${walletAddress}`);
        }

        return invoices;
    }

    /**
     * Find pending invoices for a buyer by their wallet address
     * @param walletAddress - The wallet address of the buyer
     * @returns Promise<Invoice[]>
     */
    async findPendingInvoicesByBuyerWallet(walletAddress: string): Promise<Invoice[]> {
        // First find the customer by wallet address
        const customer = await this.customerRepository.findOne({
            where: { wallet_address: walletAddress }
        });

        if (!customer) {
            throw new NotFoundException(`Customer with wallet address ${walletAddress} not found`);
        }

        // Find all pending invoices for this customer
        const invoices = await this.invoiceRepository.find({
            where: {
                buyer: { id: customer.id },
                status: 'pending'
            },
            relations: ['seller', 'buyer'],
            order: { createdAt: 'DESC' }
        });

        return invoices;
    }

    /**
     * Approve an invoice by buyer
     * @param invoiceId - The ID of the invoice to approve
     * @param buyerWalletAddress - The wallet address of the buyer
     * @returns Promise<any>
     */
    async approveInvoiceByBuyer(invoiceId: string, buyerWalletAddress: string): Promise<any> {
        // Find the invoice with buyer details
        const invoice = await this.invoiceRepository.findOne({
            where: { invoiceId },
            relations: ['buyer', 'seller']
        });

        if (!invoice) {
            throw new NotFoundException(`Invoice with ID ${invoiceId} not found`);
        }

        // Verify that the buyer's wallet address matches
        if (invoice.buyer.wallet_address !== buyerWalletAddress) {
            throw new ForbiddenException('You are not authorized to approve this invoice');
        }

        // Check if invoice is already approved or rejected
        if (invoice.status !== 'pending') {
            throw new ForbiddenException(`Invoice is already ${invoice.status}`);
        }

        // Update invoice status to approved
        invoice.status = 'approved';
        invoice.buyerApprovalDate = new Date();
        invoice.approvedBy = invoice.buyer.id;

        const updatedInvoice = await this.invoiceRepository.save(invoice);

        return {
            invoiceId: updatedInvoice.invoiceId,
            invoiceNo: updatedInvoice.invoiceNo,
            status: updatedInvoice.status,
            buyerApprovalDate: updatedInvoice.buyerApprovalDate,
            approvedBy: updatedInvoice.approvedBy,
            message: 'Invoice approved successfully'
        };
    }

    /**
     * Reject an invoice by buyer
     * @param invoiceId - The ID of the invoice to reject
     * @param buyerWalletAddress - The wallet address of the buyer
     * @returns Promise<any>
     */
    async rejectInvoiceByBuyer(invoiceId: string, buyerWalletAddress: string): Promise<any> {
        // Find the invoice with buyer details
        const invoice = await this.invoiceRepository.findOne({
            where: { invoiceId },
            relations: ['buyer', 'seller']
        });

        if (!invoice) {
            throw new NotFoundException(`Invoice with ID ${invoiceId} not found`);
        }

        // Verify that the buyer's wallet address matches
        if (invoice.buyer.wallet_address !== buyerWalletAddress) {
            throw new ForbiddenException('You are not authorized to reject this invoice');
        }

        // Check if invoice is already approved or rejected
        if (invoice.status !== 'pending') {
            throw new ForbiddenException(`Invoice is already ${invoice.status}`);
        }

        // Update invoice status to rejected
        invoice.status = 'rejected';
        invoice.buyerApprovalDate = new Date();
        invoice.approvedBy = invoice.buyer.id;

        const updatedInvoice = await this.invoiceRepository.save(invoice);

        return {
            invoiceId: updatedInvoice.invoiceId,
            invoiceNo: updatedInvoice.invoiceNo,
            status: updatedInvoice.status,
            buyerApprovalDate: updatedInvoice.buyerApprovalDate,
            approvedBy: updatedInvoice.approvedBy,
            message: 'Invoice rejected successfully'
        };
    }

    /**
     * Get invoice statistics for a buyer
     * @param walletAddress - The wallet address of the buyer
     * @returns Promise<any>
     */
    async getBuyerInvoiceStats(walletAddress: string): Promise<any> {
        // First find the customer by wallet address
        const customer = await this.customerRepository.findOne({
            where: { wallet_address: walletAddress }
        });

        if (!customer) {
            throw new NotFoundException(`Customer with wallet address ${walletAddress} not found`);
        }

        // Get invoice statistics
        const totalInvoices = await this.invoiceRepository.count({
            where: { buyer: { id: customer.id } }
        });

        const pendingInvoices = await this.invoiceRepository.count({
            where: { buyer: { id: customer.id }, status: 'pending' }
        });

        const approvedInvoices = await this.invoiceRepository.count({
            where: { buyer: { id: customer.id }, status: 'approved' }
        });

        const rejectedInvoices = await this.invoiceRepository.count({
            where: { buyer: { id: customer.id }, status: 'rejected' }
        });

        // Get total amount from approved invoices
        const totalAmountResult = await this.invoiceRepository
            .createQueryBuilder('invoice')
            .select('SUM(invoice.grandTotal)', 'totalAmount')
            .where('invoice.buyerId = :buyerId', { buyerId: customer.id })
            .andWhere('invoice.status = :status', { status: 'approved' })
            .getRawOne();

        return {
            customer: {
                id: customer.id,
                name: customer.name,
                email: customer.email,
                walletAddress: customer.wallet_address
            },
            statistics: {
                totalInvoices,
                pendingInvoices,
                approvedInvoices,
                rejectedInvoices,
                totalApprovedAmount: totalAmountResult?.totalAmount || 0
            }
        };
    }

    async updateInvoice(id: string, updateInvoiceDto: UpdateInvoiceDto): Promise<Invoice> {
        try {
            const invoice = await this.findOne(id);
            if (!invoice) {
                throw new NotFoundException('Invoice not found');
            }

            // Prepare update data
            const updateData: any = { ...updateInvoiceDto };

            // Convert date
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

            // 🔁 If any invoice data is updated, sync with blockchain
            const txHash = await this.contract.methods
                .updateInvoice(
                    invoice.invoiceNo,
                    Math.floor((updateInvoiceDto.grandTotal || invoice.grandTotal) * 100)
                )
                .send({ from: this.account, gas: 5000000, gasPrice: '3000000000' });

            updateData.transactionHash = txHash.transactionHash;

            // Save to DB
            Object.assign(invoice, updateData);
            return await this.invoiceRepository.save(invoice);
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

            const invoiceNum = await this.contract.methods.totalInvoices().call();
            // console.log(`Invoice created on blockchain with number: ${invoiceNum}`);

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

    async convertBigIntToString(obj: any): Promise<any> {
        if (Array.isArray(obj)) {
            const result = await Promise.all(obj.map(item => this.convertBigIntToString(item)));
            return result;
        } else if (typeof obj === 'object' && obj !== null) {
            const newObj: any = {};
            for (const key of Object.keys(obj)) {
                const value = obj[key];
                newObj[key] = typeof value === 'bigint'
                    ? value.toString()
                    : await this.convertBigIntToString(value);
            }
            return newObj;
        }
        return obj;
    }
}
