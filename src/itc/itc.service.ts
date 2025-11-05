import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Invoice } from 'src/invoice/entities/invoice.entity';
import { Repository } from 'typeorm';
import { ItcClaim } from './entities/itc-claim.entity';
import Web3 from 'web3';
import { AbiItem } from 'web3-utils';
import { BuyerInfoDto } from 'src/invoice/dto/buyer-invoice-response.dto';

@Injectable()
export class ItcService {
  private web3: Web3;
  private contract: any;
  private account: string;
  private contractAddress: string;
  private privateKey: string;
  private providerURL: string

  constructor(
    @InjectRepository(Invoice) private invoiceRepo: Repository<Invoice>,
    @InjectRepository(ItcClaim) private itcClaimRepo: Repository<ItcClaim>,
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

    // Initialize Web3 with the provider URL
    this.web3 = new Web3(new Web3.providers.HttpProvider(this.providerURL));

    // this.web3 = new Web3(new Web3.providers.HttpProvider(this.providerUrl));
    this.contract = new this.web3.eth.Contract([
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
        "inputs": [
          {
            "internalType": "string",
            "name": "invoiceNumber",
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
      }
    ], this.contractAddress);

    const sanitizedPrivateKey = this.privateKey.startsWith("0x")
    ? this.privateKey
    : "0x" + this.privateKey;
    console.log("🚀 ~ ItcService ~ sanitizedPrivateKey:", sanitizedPrivateKey)
    
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

  /**
  * Get detailed ITC analysis for a company based on wallet address
  */
  async getDetailedItcAnalysis(user: any) {
    const { walletAddress } = user;

    if (!walletAddress) {
      throw new Error('Wallet address is required for ITC analysis');
    }

    try {
      // Get input invoices (where company is buyer - GST paid) - Only unclaimed ones
      const inputInvoices = await this.invoiceRepo.find({
        where: {
          buyer: { wallet_address: walletAddress },
          status: 'approved',
          isClaimedForITC: false // Only get unclaimed invoices
        },
        relations: ['buyer', 'seller'],
        order: { invoiceDate: 'DESC' }
      });

      // Get output invoices (where company is seller - GST collected)
      const outputInvoices = await this.invoiceRepo.find({
        where: {
          seller: { legalRepresentative: walletAddress },
          status: 'approved',
        },
        relations: ['buyer', 'seller'],
        order: { invoiceDate: 'DESC' }
      });

      // Calculate totals for unclaimed input invoices only
      const totalInputGST = inputInvoices.reduce((sum, inv) =>
        sum + (parseFloat(inv.totalGstAmount.toString()) || 0), 0
      );

      const totalOutputGST = outputInvoices.reduce((sum, inv) =>
        sum + (parseFloat(inv.totalGstAmount.toString()) || 0), 0
      );

      // Get existing claims
      const existingClaims = await this.itcClaimRepo.find({
        where: { companyWallet: walletAddress }
      });

      const totalClaimedAmount = existingClaims.reduce((sum, claim) =>
        sum + (claim.claimableAmount || 0), 0
      );

      // Available input GST is now only from unclaimed invoices
      const availableInputGST = totalInputGST;
      const claimableAmount = Math.min(availableInputGST, totalOutputGST);
      const netITC = Math.max(0, totalInputGST - totalOutputGST);

      return {
        walletAddress: walletAddress,
        inputInvoices: {
          count: inputInvoices.length,
          totalAmount: inputInvoices.reduce((sum, inv) =>
            sum + (parseFloat(inv.totalTaxableValue.toString()) || 0), 0
          ),
          totalGST: totalInputGST,
          invoices: inputInvoices.map(inv => ({
            invoiceNumber: inv.invoiceNo,
            date: inv.invoiceDate,
            sellerName: inv.seller?.companyName || 'Unknown',
            amount: parseFloat(inv.totalTaxableValue.toString()) || 0,
            gstAmount: parseFloat(inv.totalGstAmount.toString()) || 0,
            status: inv.status,
            isClaimed: inv.isClaimedForITC
          }))
        },
        outputInvoices: {
          count: outputInvoices.length,
          totalAmount: outputInvoices.reduce((sum, inv) =>
            sum + (parseFloat(inv.totalTaxableValue.toString()) || 0), 0
          ),
          totalGST: totalOutputGST,
          invoices: outputInvoices.map(inv => ({
            invoiceNumber: inv.invoiceNo,
            date: inv.invoiceDate,
            buyerName: inv.buyer?.name || 'Unknown',
            amount: parseFloat(inv.totalTaxableValue.toString()) || 0,
            gstAmount: parseFloat(inv.totalGstAmount.toString()) || 0,
            status: inv.status
          }))
        },
        itcSummary: {
          totalInputGST,
          totalOutputGST,
          totalClaimedAmount,
          availableInputGST,
          claimableAmount: Math.max(0, claimableAmount),
          netITC,
          claimCount: existingClaims.length,
          canClaim: claimableAmount > 0
        },
        existingClaims: existingClaims.map(claim => ({
          id: claim.id,
          invoiceId: claim.invoiceId,
          inputGST: claim.inputGst,
          outputGST: claim.outputGst,
          claimableAmount: claim.claimableAmount,
          transactionHash: claim.transactionHash,
          claimedAt: claim.claimedAt,
          status: claim.transactionHash === 'pending' ? 'pending' : 'approved'
        }))
      };

    } catch (error) {
      console.error('Error in getDetailedItcAnalysis:', error);
      throw new Error('Failed to fetch ITC analysis');
    }
  }

  /**
  * Enhanced claim method with wallet address validation and proper blockchain integration
  */
  // async claimForCompany(user: any) {
  //   const { walletAddress } = user;
  //   // console.log("🚀 ~ ItcService ~ claimForCompany ~ walletAddress:", walletAddress);

  //   if (!walletAddress) {
  //     throw new Error('Wallet address is required for ITC claims');
  //   }

  //   if (!this.web3.utils.isAddress(walletAddress)) {
  //     throw new Error(`Invalid Ethereum wallet address: ${walletAddress}`);
  //   }

  //   console.log('Processing ITC claims for wallet:', walletAddress);

  //   try {
  //     // Step 1: Get ITC analysis and check claimable amount
  //     const analysis = await this.getDetailedItcAnalysis(user);
  //     // console.log("🚀 ~ ItcService ~ claimForCompany ~ analysis:", analysis);

  //     if (analysis.itcSummary.claimableAmount <= 0) {
  //       throw new Error('No claimable ITC amount available');
  //     }

  //     // Step 2: Get eligible input invoices not yet claimed
  //     const eligibleInputInvoices = await this.invoiceRepo.find({
  //       where: {
  //         buyer: { wallet_address: walletAddress },
  //         status: 'approved',
  //         isClaimedForITC: false
  //       },
  //       relations: ['buyer'],
  //     });
  //     // console.log("🚀 ~ ItcService ~ claimForCompany ~ eligibleInputInvoices:", eligibleInputInvoices);

  //     if (eligibleInputInvoices.length === 0) {
  //       throw new Error('No unclaimed invoices available');
  //     }

  //     const claims: ItcClaim[] = [];
  //     const claimedInvoices: Invoice[] = [];
  //     let remainingClaimable = analysis.itcSummary.claimableAmount;
  //     let remainingOutputGST = analysis.itcSummary.totalOutputGST; // Track remaining output GST
    

  //     // Process each eligible invoice
  //     for (const invoice of eligibleInputInvoices) {
  //       if (remainingClaimable <= 0) break;

  //       const inputGST = parseFloat(invoice.totalGstAmount.toString()) || 0;
  //       const claimAmountForThisInvoice = Math.min(inputGST, remainingClaimable);

  //       if (claimAmountForThisInvoice <= 0) continue;

  //       try {
  //         console.log(`Processing blockchain transaction for invoice: ${invoice.invoiceNo}`);

  //         // ✅ CORRECT: Convert to proper format for Solidity uint256
  //         // Since your contract expects uint256, convert rupees to smallest unit (paise)
  //         // 1 Rupee = 100 Paise, so multiply by 100 to avoid decimals
  //         const inputGSTAmount = Math.round(inputGST); // Convert to paise (smallest unit)
  //         const outputGSTAmount = Math.round(analysis.itcSummary.totalOutputGST); // Convert to paise

  //         console.log("🚀 ~ ItcService ~ claimForCompany ~ inputGSTAmount (paise):", inputGSTAmount);
  //         console.log("🚀 ~ ItcService ~ claimForCompany ~ outputGSTAmount (paise):", outputGSTAmount);

  //         console.log(`Using wallet address: ${walletAddress}`);

  //         // ✅ SOLUTION 1: Use signed transactions instead of eth_sendTransaction
  //         // You need to have the private key to sign transactions
  //         if (!process.env.PRIVATE_KEY) {
  //           throw new Error('Private key not configured for blockchain transactions');
  //         }

         

  //         // ✅ Gas estimation with correct data types
  //         const gasEstimate = await this.contract.methods
  //           .claimITC(
  //             invoice.invoiceNo,
  //             walletAddress,
  //             inputGSTAmount.toString(),   // ✅ Convert to string for uint256
  //             outputGSTAmount.toString()   // ✅ Convert to string for uint256
  //           )
  //           .estimateGas({ from: this.account });

  //         // console.log("🚀 ~ ItcService ~ claimForCompany ~ gasEstimate:", gasEstimate);

  //         const gasPrice = await this.web3.eth.getGasPrice();

  //         // ✅ SOLUTION 2: Create and send signed transaction
  //         const tx = await this.contract.methods
  //           .claimITC(
  //             invoice.invoiceNo,
  //             walletAddress,
  //             inputGSTAmount.toString(),   // ✅ String representation of uint256
  //             outputGSTAmount.toString()   // ✅ String representation of uint256
  //           )
  //           .send({
  //             from: this.account,  // Use the account with private key
  //             gas: Math.floor(Number(gasEstimate) * 1.2).toString(),
  //             gasPrice: gasPrice.toString(),
  //             // Add timeout and confirmation settings
  //             timeout: 60000, // 60 seconds timeout
  //             confirmations: 1
  //           });

  //         console.log("✅ Blockchain transaction successful:", tx.transactionHash);

  //         // Step 4: Save claim to database with original amounts
  //         const savedClaim = this.itcClaimRepo.create({
  //           invoiceId: invoice.invoiceId,
  //           companyId: user.tenant_id,
  //           companyWallet: walletAddress,
  //           inputGst: inputGST,  // ✅ Store original rupee amount in database
  //           outputGst: analysis.itcSummary.totalOutputGST,
  //           claimableAmount: claimAmountForThisInvoice,
  //           transactionHash: tx.transactionHash,
  //           claimedAt: new Date(),
  //         });
  //         // console.log("🚀 ~ ItcService ~ claimForCompany ~ savedClaim:", savedClaim);

  //         await this.itcClaimRepo.save(savedClaim);
  //         claims.push(savedClaim);

  //         // Step 5: Update invoice to mark as claimed
  //         invoice.isClaimedForITC = true;
  //         claimedInvoices.push(invoice);

  //         remainingClaimable -= claimAmountForThisInvoice;
  //         // Update tracking variables
  //         remainingOutputGST -= claimAmountForThisInvoice;
  //         claims.push(savedClaim);
  //         claimedInvoices.push(invoice);

  //         // Add delay between transactions to avoid rate limiting
  //         await new Promise(resolve => setTimeout(resolve, 1000));

  //       } catch (txError) {
  //         console.error(`❌ Blockchain transaction failed for invoice ${invoice.invoiceNo}:`, txError);

  //         // Enhanced error logging
  //         if (txError.cause) {
  //           console.error('Error cause:', txError.cause);
  //         }
  //         if (txError.message) {
  //           console.error(`Error message: ${txError.message}`);
  //         }
  //         if (txError.statusCode === 429) {
  //           console.error('Rate limit exceeded. Consider implementing retry logic.');
  //           // Wait longer before continuing
  //           await new Promise(resolve => setTimeout(resolve, 5000));
  //         }

  //         continue;
  //       }
  //     }

  //     // Step 6: Bulk update all claimed invoices
  //     if (claimedInvoices.length > 0) {
  //       await this.invoiceRepo.save(claimedInvoices);
  //       console.log(`✅ Updated ${claimedInvoices.length} invoices as claimed`);
  //     }

  //     if (claims.length === 0) {
  //       throw new Error('No claims could be processed due to blockchain transaction failures');
  //     }

  //     const totalClaimed = claims.reduce((sum, claim) => sum + claim.claimableAmount, 0);

  //     return {
  //       success: true,
  //       message: `ITC claims processed successfully. Total claimed: ₹${totalClaimed.toFixed(2)}`,
  //       totalClaimed,
  //       claimsProcessed: claims.length,
  //       invoicesUpdated: claimedInvoices.length,
  //       claims: claims.map(claim => ({
  //         invoiceId: claim.invoiceId,
  //         claimableAmount: claim.claimableAmount,
  //         transactionHash: claim.transactionHash,
  //         status: 'approved'
  //       })),
  //       remainingClaimable: Math.max(0, remainingClaimable),
  //     };

  //   } catch (error) {
  //     console.error('❌ Error in claimForCompany:', error);
  //     throw error;
  //   }
  // }

  async claimForCompany(user: any) {
    const { walletAddress } = user;
  
    if (!walletAddress) {
      throw new Error('Wallet address is required for ITC claims');
    }
  
    if (!this.web3.utils.isAddress(walletAddress)) {
      throw new Error(`Invalid Ethereum wallet address: ${walletAddress}`);
    }
  
    console.log('Processing ITC claims for wallet:', walletAddress);
  
    try {
      // Step 1: Get ITC analysis and check claimable amount
      const analysis = await this.getDetailedItcAnalysis(user);
  
      if (analysis.itcSummary.claimableAmount <= 0) {
        throw new Error('No claimable ITC amount available');
      }
  
      // Step 2: Get eligible input invoices not yet claimed
      const eligibleInputInvoices = await this.invoiceRepo.find({
        where: {
          buyer: { wallet_address: walletAddress },
          status: 'approved',
          isClaimedForITC: false,
        },
        relations: ['buyer'],
      });
  
      if (eligibleInputInvoices.length === 0) {
        throw new Error('No unclaimed invoices available');
      }
  
      const claims: ItcClaim[] = [];
      const claimedInvoices: Invoice[] = [];
      let remainingClaimable = analysis.itcSummary.claimableAmount;
      let remainingOutputGST = analysis.itcSummary.totalOutputGST;
  
      for (const invoice of eligibleInputInvoices) {
        if (remainingClaimable <= 0) break;
  
        const inputGST = parseFloat(invoice.totalGstAmount.toString()) || 0;
        const claimAmountForThisInvoice = Math.min(inputGST, remainingClaimable);
  
        if (claimAmountForThisInvoice <= 0) continue;
  
        try {
          console.log(`Processing blockchain transaction for invoice: ${invoice.invoiceNo}`);
  
          const inputGSTAmount = Math.round(inputGST); // Paise
          const outputGSTAmount = Math.round(analysis.itcSummary.totalOutputGST); // Paise
  
          if (!process.env.PRIVATE_KEY) {
            throw new Error('Private key not configured for blockchain transactions');
          }
  
          const gasEstimate = await this.contract.methods
            .claimITC(
              invoice.invoiceNo,
              walletAddress,
              inputGSTAmount.toString(),
              outputGSTAmount.toString()
            )
            .estimateGas({ from: this.account });
  
          const gasPrice = await this.web3.eth.getGasPrice();
  
          const tx = await this.contract.methods
            .claimITC(
              invoice.invoiceNo,
              walletAddress,
              inputGSTAmount.toString(),
              outputGSTAmount.toString()
            )
            .send({
              from: this.account,
              gas: Math.floor(Number(gasEstimate) * 1.2).toString(),
              gasPrice: gasPrice.toString(),
              timeout: 60000,
              confirmations: 1,
            });
  
          console.log('✅ Blockchain transaction successful:', tx.transactionHash);
  
          const savedClaim = this.itcClaimRepo.create({
            invoiceId: invoice.invoiceId,
            companyId: user.tenant_id,
            companyWallet: walletAddress,
            inputGst: inputGST,
            outputGst: analysis.itcSummary.totalOutputGST,
            claimableAmount: claimAmountForThisInvoice,
            transactionHash: tx.transactionHash,
            claimedAt: new Date(),
          });
  
          await this.itcClaimRepo.save(savedClaim);
  
          // Mark invoice as claimed
          invoice.isClaimedForITC = true;
  
          // ✅ Update remaining balances correctly
          remainingClaimable -= claimAmountForThisInvoice;
          remainingOutputGST = Math.max(0, remainingOutputGST - claimAmountForThisInvoice);
  
          claims.push(savedClaim);
          claimedInvoices.push(invoice);
  
          await new Promise(resolve => setTimeout(resolve, 1000)); // Rate-limiting delay
  
        } catch (txError) {
          console.error(`❌ Blockchain transaction failed for invoice ${invoice.invoiceNo}:`, txError);
          if (txError.cause) console.error('Error cause:', txError.cause);
          if (txError.message) console.error(`Error message: ${txError.message}`);
          if (txError.statusCode === 429) {
            console.error('Rate limit exceeded. Waiting...');
            await new Promise(resolve => setTimeout(resolve, 5000));
          }
          continue;
        }
      }
  
      // Step 6: Bulk update all claimed invoices
      if (claimedInvoices.length > 0) {
        await this.invoiceRepo.save(claimedInvoices);
        console.log(`✅ Updated ${claimedInvoices.length} invoices as claimed`);
      }
  
      if (claims.length === 0) {
        throw new Error('No claims could be processed due to blockchain transaction failures');
      }
  
      const totalClaimed = claims.reduce((sum, claim) => sum + claim.claimableAmount, 0);
  
      return {
        success: true,
        message: `ITC claims processed successfully. Total claimed: ₹${totalClaimed.toFixed(2)}`,
        totalClaimed,
        claimsProcessed: claims.length,
        invoicesUpdated: claimedInvoices.length,
        claims: claims.map(claim => ({
          invoiceId: claim.invoiceId,
          claimableAmount: claim.claimableAmount,
          transactionHash: claim.transactionHash,
          status: 'approved',
        })),
        remainingClaimable: Math.max(0, remainingClaimable),
        remainingOutputGST: Math.max(0, remainingOutputGST), // ✅ Return updated output GST
      };
  
    } catch (error) {
      console.error('❌ Error in claimForCompany:', error);
      throw error;
    }
  }
  


  /**
  * Get summary for company (backward compatibility)
  */
  async getSummaryForCompany(user: any) {
    try {
      const analysis = await this.getDetailedItcAnalysis(user);
      return {
        companyId: user.tenant_id,
        walletAddress: analysis.walletAddress,
        inputGST: analysis.itcSummary.totalInputGST,
        outputGST: analysis.itcSummary.totalOutputGST,
        totalClaimable: analysis.itcSummary.claimableAmount,
        netITC: analysis.itcSummary.netITC,
        claimCount: analysis.itcSummary.claimCount,
        claims: analysis.existingClaims
      };
    } catch (error) {
      console.error('Error in getSummaryForCompany:', error);
      return {
        companyId: user.tenant_id,
        walletAddress: user.walletAddress,
        inputGST: 0,
        outputGST: 0,
        totalClaimable: 0,
        netITC: 0,
        claimCount: 0,
        claims: []
      };
    }
  }

  /**
  * Get month-wise ITC breakdown based on wallet address (only unclaimed invoices)
  */
  async getMonthlyItcBreakdown(user: any, year: number = new Date().getFullYear()) {
    const { walletAddress } = user;

    if (!walletAddress) {
      throw new Error('Wallet address is required for monthly breakdown');
    }

    try {
      // Only get unclaimed input invoices
      const inputInvoices = await this.invoiceRepo.find({
        where: {
          buyer: { wallet_address: walletAddress },
          status: 'approved',
          isClaimedForITC: false
        },
        relations: ['buyer'],
      });

      const outputInvoices = await this.invoiceRepo.find({
        where: {
          seller: { legalRepresentative: walletAddress },
          status: 'approved',
        },
        relations: ['seller'],
      });

      const monthlyData = {};

      // Initialize months
      for (let month = 0; month < 12; month++) {
        const monthKey = `${year}-${String(month + 1).padStart(2, '0')}`;
        monthlyData[monthKey] = {
          month: new Date(year, month).toLocaleString('default', { month: 'long' }),
          inputGST: 0,
          outputGST: 0,
          netITC: 0,
          inputInvoiceCount: 0,
          outputInvoiceCount: 0
        };
      }

      // Process input invoices (only unclaimed)
      inputInvoices.forEach(inv => {
        const date = new Date(inv.invoiceDate);
        if (date.getFullYear() === year) {
          const monthKey = `${year}-${String(date.getMonth() + 1).padStart(2, '0')}`;
          const gstAmount = parseFloat(inv.totalGstAmount.toString()) || 0;
          monthlyData[monthKey].inputGST += gstAmount;
          monthlyData[monthKey].inputInvoiceCount += 1;
        }
      });

      // Process output invoices
      outputInvoices.forEach(inv => {
        const date = new Date(inv.invoiceDate);
        if (date.getFullYear() === year) {
          const monthKey = `${year}-${String(date.getMonth() + 1).padStart(2, '0')}`;
          const gstAmount = parseFloat(inv.totalGstAmount.toString()) || 0;
          monthlyData[monthKey].outputGST += gstAmount;
          monthlyData[monthKey].outputInvoiceCount += 1;
        }
      });

      // Calculate net ITC for each month
      Object.keys(monthlyData).forEach(monthKey => {
        const data = monthlyData[monthKey];
        data.netITC = Math.max(0, data.inputGST - data.outputGST);
      });

      return {
        year,
        walletAddress,
        monthlyBreakdown: Object.values(monthlyData),
        yearlyTotals: {
          inputGST: Object.values(monthlyData).reduce((sum: number, data: any) => sum + data.inputGST, 0),
          outputGST: Object.values(monthlyData).reduce((sum: number, data: any) => sum + data.outputGST, 0),
          netITC: Object.values(monthlyData).reduce((sum: number, data: any) => sum + data.netITC, 0),
          totalInputInvoices: Object.values(monthlyData).reduce((sum: number, data: any) => sum + data.inputInvoiceCount, 0),
          totalOutputInvoices: Object.values(monthlyData).reduce((sum: number, data: any) => sum + data.outputInvoiceCount, 0)
        }
      };

    } catch (error) {
      console.error('Error in getMonthlyItcBreakdown:', error);
      throw new Error('Failed to fetch monthly ITC breakdown');
    }
  }

  /**
  * Get all claims with invoice details based on wallet address
  */
  async getAllClaimsWithDetails(user: any) {
    const { walletAddress } = user;

    if (!walletAddress) {
      throw new Error('Wallet address is required to fetch claims');
    }

    try {
      const claims = await this.itcClaimRepo.find({
        where: { companyWallet: walletAddress },
        relations: ['invoice'],
        order: { claimedAt: 'DESC' }
      });

      return claims.map(claim => ({
        id: claim.id,
        invoiceNumber: claim.invoice?.invoiceNo || 'N/A',
        invoiceDate: claim.invoice?.invoiceDate || null,
        inputGST: claim.inputGst,
        outputGST: claim.outputGst,
        claimableAmount: claim.claimableAmount,
        transactionHash: claim.transactionHash,
        claimedAt: claim.claimedAt,
        status: claim.transactionHash === 'pending' ? 'pending' : 'approved'
      }));

    } catch (error) {
      console.error('Error in getAllClaimsWithDetails:', error);
      throw new Error('Failed to fetch claims with details');
    }
  }
}
