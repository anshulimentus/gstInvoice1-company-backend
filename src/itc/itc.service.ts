// import { Injectable } from '@nestjs/common';
// import { InjectRepository } from '@nestjs/typeorm';
// import { Invoice } from 'src/invoice/entities/invoice.entity';
// import { Repository } from 'typeorm';
// import { ItcClaim } from './entities/itc-claim.entity';
// import Web3 from 'web3';
// import { AbiItem } from 'web3-utils';
// import { BuyerInfoDto } from 'src/invoice/dto/buyer-invoice-response.dto';

// @Injectable()
// export class ItcService {
//   private web3: Web3;
//   private contract: any;

//   constructor(
//     @InjectRepository(Invoice) private invoiceRepo: Repository<Invoice>,
//     @InjectRepository(ItcClaim) private itcClaimRepo: Repository<ItcClaim>,
//   ) {
//     this.web3 = new Web3(process.env.RPC_URL);
//     this.contract = new this.web3.eth.Contract([
//       {
//         "anonymous": false,
//         "inputs": [
//           {
//             "indexed": false,
//             "internalType": "string",
//             "name": "id",
//             "type": "string"
//           },
//           {
//             "indexed": false,
//             "internalType": "string",
//             "name": "name",
//             "type": "string"
//           },
//           {
//             "indexed": false,
//             "internalType": "string",
//             "name": "gstNumber",
//             "type": "string"
//           }
//         ],
//         "name": "CustomerAdded",
//         "type": "event"
//       },
//       {
//         "anonymous": false,
//         "inputs": [
//           {
//             "indexed": false,
//             "internalType": "string",
//             "name": "id",
//             "type": "string"
//           }
//         ],
//         "name": "CustomerDeleted",
//         "type": "event"
//       },
//       {
//         "anonymous": false,
//         "inputs": [
//           {
//             "indexed": false,
//             "internalType": "string",
//             "name": "id",
//             "type": "string"
//           },
//           {
//             "indexed": false,
//             "internalType": "string",
//             "name": "name",
//             "type": "string"
//           },
//           {
//             "indexed": false,
//             "internalType": "string",
//             "name": "gstNumber",
//             "type": "string"
//           }
//         ],
//         "name": "CustomerUpdated",
//         "type": "event"
//       },
//       {
//         "anonymous": false,
//         "inputs": [
//           {
//             "indexed": false,
//             "internalType": "string",
//             "name": "invoiceNumber",
//             "type": "string"
//           },
//           {
//             "indexed": true,
//             "internalType": "address",
//             "name": "claimant",
//             "type": "address"
//           },
//           {
//             "indexed": false,
//             "internalType": "uint256",
//             "name": "claimableAmount",
//             "type": "uint256"
//           }
//         ],
//         "name": "ITCClaimed",
//         "type": "event"
//       },
//       {
//         "anonymous": false,
//         "inputs": [
//           {
//             "indexed": false,
//             "internalType": "string",
//             "name": "invoiceNumber",
//             "type": "string"
//           }
//         ],
//         "name": "InvoiceCreated",
//         "type": "event"
//       },
//       {
//         "anonymous": false,
//         "inputs": [
//           {
//             "indexed": false,
//             "internalType": "string",
//             "name": "invoiceNumber",
//             "type": "string"
//           }
//         ],
//         "name": "InvoiceDeleted",
//         "type": "event"
//       },
//       {
//         "anonymous": false,
//         "inputs": [
//           {
//             "indexed": false,
//             "internalType": "string",
//             "name": "invoiceNumber",
//             "type": "string"
//           }
//         ],
//         "name": "InvoiceUpdated",
//         "type": "event"
//       },
//       {
//         "anonymous": false,
//         "inputs": [
//           {
//             "indexed": false,
//             "internalType": "uint256",
//             "name": "productID",
//             "type": "uint256"
//           },
//           {
//             "indexed": false,
//             "internalType": "string",
//             "name": "productName",
//             "type": "string"
//           },
//           {
//             "indexed": false,
//             "internalType": "uint256",
//             "name": "price",
//             "type": "uint256"
//           }
//         ],
//         "name": "ProductAdded",
//         "type": "event"
//       },
//       {
//         "anonymous": false,
//         "inputs": [
//           {
//             "indexed": false,
//             "internalType": "uint256",
//             "name": "productID",
//             "type": "uint256"
//           }
//         ],
//         "name": "ProductDeleted",
//         "type": "event"
//       },
//       {
//         "anonymous": false,
//         "inputs": [
//           {
//             "indexed": false,
//             "internalType": "uint256",
//             "name": "productID",
//             "type": "uint256"
//           },
//           {
//             "indexed": false,
//             "internalType": "string",
//             "name": "productName",
//             "type": "string"
//           },
//           {
//             "indexed": false,
//             "internalType": "uint256",
//             "name": "price",
//             "type": "uint256"
//           }
//         ],
//         "name": "ProductUpdated",
//         "type": "event"
//       },
//       {
//         "inputs": [
//           {
//             "internalType": "string",
//             "name": "_id",
//             "type": "string"
//           },
//           {
//             "internalType": "string",
//             "name": "_name",
//             "type": "string"
//           },
//           {
//             "internalType": "string",
//             "name": "_gstNumber",
//             "type": "string"
//           }
//         ],
//         "name": "addCustomer",
//         "outputs": [],
//         "stateMutability": "nonpayable",
//         "type": "function"
//       },
//       {
//         "inputs": [
//           {
//             "internalType": "uint256",
//             "name": "_id",
//             "type": "uint256"
//           },
//           {
//             "internalType": "string",
//             "name": "_name",
//             "type": "string"
//           },
//           {
//             "internalType": "uint256",
//             "name": "_price",
//             "type": "uint256"
//           }
//         ],
//         "name": "addProduct",
//         "outputs": [],
//         "stateMutability": "nonpayable",
//         "type": "function"
//       },
//       {
//         "inputs": [
//           {
//             "internalType": "string",
//             "name": "invoiceNumber",
//             "type": "string"
//           },
//           {
//             "internalType": "string",
//             "name": "companyId",
//             "type": "string"
//           },
//           {
//             "internalType": "uint256",
//             "name": "inputGST",
//             "type": "uint256"
//           },
//           {
//             "internalType": "uint256",
//             "name": "outputGST",
//             "type": "uint256"
//           }
//         ],
//         "name": "claimITC",
//         "outputs": [],
//         "stateMutability": "nonpayable",
//         "type": "function"
//       },
//       {
//         "inputs": [
//           {
//             "internalType": "string",
//             "name": "_invoiceNumber",
//             "type": "string"
//           },
//           {
//             "internalType": "string",
//             "name": "_invoiceDate",
//             "type": "string"
//           },
//           {
//             "internalType": "string",
//             "name": "_supplyType",
//             "type": "string"
//           },
//           {
//             "internalType": "uint256[]",
//             "name": "_productIDs",
//             "type": "uint256[]"
//           },
//           {
//             "internalType": "string[]",
//             "name": "_productNames",
//             "type": "string[]"
//           },
//           {
//             "internalType": "uint256[]",
//             "name": "_quantities",
//             "type": "uint256[]"
//           },
//           {
//             "internalType": "uint256[]",
//             "name": "_unitPrices",
//             "type": "uint256[]"
//           },
//           {
//             "internalType": "uint256[]",
//             "name": "_gstRates",
//             "type": "uint256[]"
//           },
//           {
//             "internalType": "uint256[]",
//             "name": "_totalAmounts",
//             "type": "uint256[]"
//           },
//           {
//             "internalType": "uint256",
//             "name": "_totalTaxableValue",
//             "type": "uint256"
//           },
//           {
//             "internalType": "uint256",
//             "name": "_totalGstAmount",
//             "type": "uint256"
//           },
//           {
//             "internalType": "uint256",
//             "name": "_grandTotal",
//             "type": "uint256"
//           },
//           {
//             "internalType": "string",
//             "name": "_paymentTerms",
//             "type": "string"
//           },
//           {
//             "internalType": "bool",
//             "name": "_isFinal",
//             "type": "bool"
//           }
//         ],
//         "name": "createInvoice",
//         "outputs": [],
//         "stateMutability": "nonpayable",
//         "type": "function"
//       },
//       {
//         "inputs": [
//           {
//             "internalType": "string",
//             "name": "",
//             "type": "string"
//           }
//         ],
//         "name": "customers",
//         "outputs": [
//           {
//             "internalType": "string",
//             "name": "id",
//             "type": "string"
//           },
//           {
//             "internalType": "string",
//             "name": "name",
//             "type": "string"
//           },
//           {
//             "internalType": "string",
//             "name": "gstNumber",
//             "type": "string"
//           }
//         ],
//         "stateMutability": "view",
//         "type": "function"
//       },
//       {
//         "inputs": [
//           {
//             "internalType": "string",
//             "name": "_id",
//             "type": "string"
//           }
//         ],
//         "name": "deleteCustomer",
//         "outputs": [],
//         "stateMutability": "nonpayable",
//         "type": "function"
//       },
//       {
//         "inputs": [
//           {
//             "internalType": "string",
//             "name": "_invoiceNumber",
//             "type": "string"
//           }
//         ],
//         "name": "deleteInvoice",
//         "outputs": [],
//         "stateMutability": "nonpayable",
//         "type": "function"
//       },
//       {
//         "inputs": [
//           {
//             "internalType": "uint256",
//             "name": "_id",
//             "type": "uint256"
//           }
//         ],
//         "name": "deleteProduct",
//         "outputs": [],
//         "stateMutability": "nonpayable",
//         "type": "function"
//       },
//       {
//         "inputs": [],
//         "name": "getAllInvoices",
//         "outputs": [
//           {
//             "components": [
//               {
//                 "internalType": "string",
//                 "name": "invoiceNumber",
//                 "type": "string"
//               },
//               {
//                 "internalType": "string",
//                 "name": "invoiceDate",
//                 "type": "string"
//               },
//               {
//                 "internalType": "string",
//                 "name": "supplyType",
//                 "type": "string"
//               },
//               {
//                 "components": [
//                   {
//                     "internalType": "uint256",
//                     "name": "productID",
//                     "type": "uint256"
//                   },
//                   {
//                     "internalType": "string",
//                     "name": "productName",
//                     "type": "string"
//                   },
//                   {
//                     "internalType": "uint256",
//                     "name": "quantity",
//                     "type": "uint256"
//                   },
//                   {
//                     "internalType": "uint256",
//                     "name": "unitPrice",
//                     "type": "uint256"
//                   },
//                   {
//                     "internalType": "uint256",
//                     "name": "gstRate",
//                     "type": "uint256"
//                   },
//                   {
//                     "internalType": "uint256",
//                     "name": "totalAmount",
//                     "type": "uint256"
//                   }
//                 ],
//                 "internalType": "struct Company.InvoiceItem[]",
//                 "name": "items",
//                 "type": "tuple[]"
//               },
//               {
//                 "internalType": "uint256",
//                 "name": "totalTaxableValue",
//                 "type": "uint256"
//               },
//               {
//                 "internalType": "uint256",
//                 "name": "totalGstAmount",
//                 "type": "uint256"
//               },
//               {
//                 "internalType": "uint256",
//                 "name": "grandTotal",
//                 "type": "uint256"
//               },
//               {
//                 "internalType": "string",
//                 "name": "paymentTerms",
//                 "type": "string"
//               },
//               {
//                 "internalType": "bool",
//                 "name": "isFinal",
//                 "type": "bool"
//               }
//             ],
//             "internalType": "struct Company.Invoice[]",
//             "name": "",
//             "type": "tuple[]"
//           }
//         ],
//         "stateMutability": "view",
//         "type": "function"
//       },
//       {
//         "inputs": [
//           {
//             "internalType": "string",
//             "name": "_invoiceNumber",
//             "type": "string"
//           }
//         ],
//         "name": "getInvoiceByNumber",
//         "outputs": [
//           {
//             "internalType": "string",
//             "name": "",
//             "type": "string"
//           },
//           {
//             "internalType": "string",
//             "name": "",
//             "type": "string"
//           },
//           {
//             "internalType": "string",
//             "name": "",
//             "type": "string"
//           },
//           {
//             "components": [
//               {
//                 "internalType": "uint256",
//                 "name": "productID",
//                 "type": "uint256"
//               },
//               {
//                 "internalType": "string",
//                 "name": "productName",
//                 "type": "string"
//               },
//               {
//                 "internalType": "uint256",
//                 "name": "quantity",
//                 "type": "uint256"
//               },
//               {
//                 "internalType": "uint256",
//                 "name": "unitPrice",
//                 "type": "uint256"
//               },
//               {
//                 "internalType": "uint256",
//                 "name": "gstRate",
//                 "type": "uint256"
//               },
//               {
//                 "internalType": "uint256",
//                 "name": "totalAmount",
//                 "type": "uint256"
//               }
//             ],
//             "internalType": "struct Company.InvoiceItem[]",
//             "name": "",
//             "type": "tuple[]"
//           },
//           {
//             "internalType": "uint256",
//             "name": "",
//             "type": "uint256"
//           },
//           {
//             "internalType": "uint256",
//             "name": "",
//             "type": "uint256"
//           },
//           {
//             "internalType": "uint256",
//             "name": "",
//             "type": "uint256"
//           },
//           {
//             "internalType": "string",
//             "name": "",
//             "type": "string"
//           },
//           {
//             "internalType": "bool",
//             "name": "",
//             "type": "bool"
//           }
//         ],
//         "stateMutability": "view",
//         "type": "function"
//       },
//       {
//         "inputs": [
//           {
//             "internalType": "string",
//             "name": "",
//             "type": "string"
//           }
//         ],
//         "name": "itcClaims",
//         "outputs": [
//           {
//             "internalType": "string",
//             "name": "invoiceNumber",
//             "type": "string"
//           },
//           {
//             "internalType": "string",
//             "name": "companyId",
//             "type": "string"
//           },
//           {
//             "internalType": "address",
//             "name": "companyWallet",
//             "type": "address"
//           },
//           {
//             "internalType": "uint256",
//             "name": "inputGST",
//             "type": "uint256"
//           },
//           {
//             "internalType": "uint256",
//             "name": "outputGST",
//             "type": "uint256"
//           },
//           {
//             "internalType": "uint256",
//             "name": "netITC",
//             "type": "uint256"
//           },
//           {
//             "internalType": "uint256",
//             "name": "claimableAmount",
//             "type": "uint256"
//           },
//           {
//             "internalType": "uint256",
//             "name": "claimedAmount",
//             "type": "uint256"
//           },
//           {
//             "internalType": "uint256",
//             "name": "timestamp",
//             "type": "uint256"
//           },
//           {
//             "internalType": "bool",
//             "name": "isApproved",
//             "type": "bool"
//           },
//           {
//             "internalType": "bool",
//             "name": "isClaimed",
//             "type": "bool"
//           },
//           {
//             "internalType": "string",
//             "name": "status",
//             "type": "string"
//           }
//         ],
//         "stateMutability": "view",
//         "type": "function"
//       },
//       {
//         "inputs": [],
//         "name": "nextCustomerId",
//         "outputs": [
//           {
//             "internalType": "uint256",
//             "name": "",
//             "type": "uint256"
//           }
//         ],
//         "stateMutability": "view",
//         "type": "function"
//       },
//       {
//         "inputs": [
//           {
//             "internalType": "uint256",
//             "name": "",
//             "type": "uint256"
//           }
//         ],
//         "name": "products",
//         "outputs": [
//           {
//             "internalType": "uint256",
//             "name": "productID",
//             "type": "uint256"
//           },
//           {
//             "internalType": "string",
//             "name": "productName",
//             "type": "string"
//           },
//           {
//             "internalType": "uint256",
//             "name": "price",
//             "type": "uint256"
//           }
//         ],
//         "stateMutability": "view",
//         "type": "function"
//       },
//       {
//         "inputs": [],
//         "name": "totalInvoices",
//         "outputs": [
//           {
//             "internalType": "uint256",
//             "name": "",
//             "type": "uint256"
//           }
//         ],
//         "stateMutability": "view",
//         "type": "function"
//       },
//       {
//         "inputs": [],
//         "name": "totalProducts",
//         "outputs": [
//           {
//             "internalType": "uint256",
//             "name": "",
//             "type": "uint256"
//           }
//         ],
//         "stateMutability": "view",
//         "type": "function"
//       },
//       {
//         "inputs": [
//           {
//             "internalType": "string",
//             "name": "_id",
//             "type": "string"
//           },
//           {
//             "internalType": "string",
//             "name": "_name",
//             "type": "string"
//           },
//           {
//             "internalType": "string",
//             "name": "_gstNumber",
//             "type": "string"
//           }
//         ],
//         "name": "updateCustomer",
//         "outputs": [],
//         "stateMutability": "nonpayable",
//         "type": "function"
//       },
//       {
//         "inputs": [
//           {
//             "internalType": "string",
//             "name": "_invoiceNumber",
//             "type": "string"
//           },
//           {
//             "internalType": "string",
//             "name": "_invoiceDate",
//             "type": "string"
//           },
//           {
//             "internalType": "string",
//             "name": "_supplyType",
//             "type": "string"
//           },
//           {
//             "internalType": "uint256[]",
//             "name": "_productIDs",
//             "type": "uint256[]"
//           },
//           {
//             "internalType": "string[]",
//             "name": "_productNames",
//             "type": "string[]"
//           },
//           {
//             "internalType": "uint256[]",
//             "name": "_quantities",
//             "type": "uint256[]"
//           },
//           {
//             "internalType": "uint256[]",
//             "name": "_unitPrices",
//             "type": "uint256[]"
//           },
//           {
//             "internalType": "uint256[]",
//             "name": "_gstRates",
//             "type": "uint256[]"
//           },
//           {
//             "internalType": "uint256[]",
//             "name": "_totalAmounts",
//             "type": "uint256[]"
//           },
//           {
//             "internalType": "uint256",
//             "name": "_totalTaxableValue",
//             "type": "uint256"
//           },
//           {
//             "internalType": "uint256",
//             "name": "_totalGstAmount",
//             "type": "uint256"
//           },
//           {
//             "internalType": "uint256",
//             "name": "_grandTotal",
//             "type": "uint256"
//           },
//           {
//             "internalType": "string",
//             "name": "_paymentTerms",
//             "type": "string"
//           },
//           {
//             "internalType": "bool",
//             "name": "_isFinal",
//             "type": "bool"
//           }
//         ],
//         "name": "updateInvoice",
//         "outputs": [],
//         "stateMutability": "nonpayable",
//         "type": "function"
//       },
//       {
//         "inputs": [
//           {
//             "internalType": "uint256",
//             "name": "_id",
//             "type": "uint256"
//           },
//           {
//             "internalType": "string",
//             "name": "_name",
//             "type": "string"
//           },
//           {
//             "internalType": "uint256",
//             "name": "_price",
//             "type": "uint256"
//           }
//         ],
//         "name": "updateProduct",
//         "outputs": [],
//         "stateMutability": "nonpayable",
//         "type": "function"
//       }
//     ] as AbiItem[],
//       process.env.INVOICE_CONTRACT_ADDRESS,
//     );
//   }

//   /**
//    * Get detailed ITC analysis for a company based on wallet address
//    */
//   async getDetailedItcAnalysis(user: any) {
//     const { walletAddress } = user;

//     if (!walletAddress) {
//       throw new Error('Wallet address is required for ITC analysis');
//     }

//     try {
//       // Get input invoices (where company is buyer - GST paid)
//       // Match using buyer.wallet_address
//       const inputInvoices = await this.invoiceRepo.find({
//         where: {
//           buyer: { wallet_address: walletAddress },
//           status: 'approved',
//         },
//         relations: ['buyer', 'seller'],
//         order: { invoiceDate: 'DESC' }
//       });

//       // Get output invoices (where company is seller - GST collected)
//       // Match using seller.legalRepresentative (which is the wallet address)
//       const outputInvoices = await this.invoiceRepo.find({
//         where: {
//           seller: { legalRepresentative: walletAddress },
//           status: 'approved',
//         },
//         relations: ['buyer', 'seller'],
//         order: { invoiceDate: 'DESC' }
//       });

//       // Calculate totals
//       const totalInputGST = inputInvoices.reduce((sum, inv) => 
//         sum + (parseFloat(inv.totalGstAmount.toString()) || 0), 0
//       );

//       const totalOutputGST = outputInvoices.reduce((sum, inv) => 
//         sum + (parseFloat(inv.totalGstAmount.toString()) || 0), 0
//       );

//       // ITC Logic:
//       // 1. Input GST is what you paid (can be claimed)
//       // 2. Output GST is what you collected (must be paid to government)
//       // 3. Net ITC = Input GST - Already Claimed ITC
//       // 4. Claimable = Min(Available Input GST, Current Month's Output GST liability)

//       const existingClaims = await this.itcClaimRepo.find({
//         where: { companyWallet: walletAddress }
//       });

//       const totalClaimedAmount = existingClaims.reduce((sum, claim) => 
//         sum + (claim.claimableAmount || 0), 0
//       );

//       const availableInputGST = totalInputGST - totalClaimedAmount;
//       const claimableAmount = Math.min(availableInputGST, totalOutputGST);
//       const netITC = Math.max(0, totalInputGST - totalOutputGST);

//       return {
//         walletAddress: walletAddress,
//         inputInvoices: {
//           count: inputInvoices.length,
//           totalAmount: inputInvoices.reduce((sum, inv) => 
//             sum + (parseFloat(inv.totalTaxableValue.toString()) || 0), 0
//           ),
//           totalGST: totalInputGST,
//           invoices: inputInvoices.map(inv => ({
//             invoiceNumber: inv.invoiceNo,
//             date: inv.invoiceDate,
//             sellerName: inv.seller?.companyName || 'Unknown',
//             amount: parseFloat(inv.totalTaxableValue.toString()) || 0,
//             gstAmount: parseFloat(inv.totalGstAmount.toString()) || 0,
//             status: inv.status
//           }))
//         },
//         outputInvoices: {
//           count: outputInvoices.length,
//           totalAmount: outputInvoices.reduce((sum, inv) => 
//             sum + (parseFloat(inv.totalTaxableValue.toString()) || 0), 0
//           ),
//           totalGST: totalOutputGST,
//           invoices: outputInvoices.map(inv => ({
//             invoiceNumber: inv.invoiceNo,
//             date: inv.invoiceDate,
//             buyerName: inv.buyer?.name || 'Unknown',
//             amount: parseFloat(inv.totalTaxableValue.toString()) || 0,
//             gstAmount: parseFloat(inv.totalGstAmount.toString()) || 0,
//             status: inv.status
//           }))
//         },
//         itcSummary: {
//           totalInputGST,
//           totalOutputGST,
//           totalClaimedAmount,
//           availableInputGST,
//           claimableAmount: Math.max(0, claimableAmount),
//           netITC,
//           claimCount: existingClaims.length,
//           canClaim: claimableAmount > 0
//         },
//         existingClaims: existingClaims.map(claim => ({
//           id: claim.id,
//           invoiceId: claim.invoiceId,
//           inputGST: claim.inputGst,
//           outputGST: claim.outputGst,
//           claimableAmount: claim.claimableAmount,
//           transactionHash: claim.transactionHash,
//           claimedAt: claim.claimedAt,
//           status: claim.transactionHash === 'pending' ? 'pending' : 'approved'
//         }))
//       };

//     } catch (error) {
//       // console.error('Error in getDetailedItcAnalysis:', error);
//       throw new Error('Failed to fetch ITC analysis');
//     }
//   }

//   /**
//    * Enhanced claim method with wallet address validation
//    */
//   async claimForCompany(user: any) {
//     const { walletAddress } = user;

//     if (!walletAddress) {
//       throw new Error('Wallet address is required for ITC claims');
//     }

//     try {
//       // Step 1: Get ITC analysis and check claimable amount
//       const analysis = await this.getDetailedItcAnalysis(user);

//       if (analysis.itcSummary.claimableAmount <= 0) {
//         throw new Error('No claimable ITC amount available');
//       }

//       // Step 2: Get eligible input invoices not yet claimed
//       const claimedInvoiceIds = analysis.existingClaims.map(claim => claim.invoiceId);
//       const eligibleInputInvoices = await this.invoiceRepo.find({
//         where: {
//           buyer: { wallet_address: walletAddress },
//           status: 'approved',
//         },
//         relations: ['buyer'],
//       });

//       const unclaimedInvoices = eligibleInputInvoices.filter(
//         inv => !claimedInvoiceIds.includes(inv.invoiceId)
//       );

//       if (unclaimedInvoices.length === 0) {
//         throw new Error('No unclaimed invoices available');
//       }

//       const claims: ItcClaim[] = [];
//       let remainingClaimable = analysis.itcSummary.claimableAmount;

//       for (const invoice of unclaimedInvoices) {
//         if (remainingClaimable <= 0) break;

//         const inputGST = parseFloat(invoice.totalGstAmount.toString()) || 0;
//         const claimAmountForThisInvoice = Math.min(inputGST, remainingClaimable);

//         if (claimAmountForThisInvoice <= 0) continue;

//         // Step 3: Blockchain Transaction First
//         const inputGSTWei = Math.floor(inputGST * 1e18);
//         const outputGSTWei = Math.floor(analysis.itcSummary.totalOutputGST * 1e18);

//         const tx = await this.contract.methods
//           .claimITC(invoice.invoiceNo, walletAddress, inputGSTWei, outputGSTWei)
//           .send({ from: walletAddress, gas: 500000 });

//         // console.log("✅ Blockchain transaction successful:", tx);

//         // Step 4: Save only after successful blockchain transaction
//         const savedClaim = this.itcClaimRepo.create({
//           invoiceId: invoice.invoiceId,
//           companyId: user.tenant_id,
//           companyWallet: walletAddress,
//           inputGst: inputGST,
//           outputGst: analysis.itcSummary.totalOutputGST,
//           claimableAmount: claimAmountForThisInvoice,
//           transactionHash: tx.transactionHash,
//           claimedAt: new Date(),
//         });

//         await this.itcClaimRepo.save(savedClaim);
//         claims.push(savedClaim);
//         remainingClaimable -= claimAmountForThisInvoice;
//       }

//       const totalClaimed = claims.reduce((sum, claim) => sum + claim.claimableAmount, 0);

//       return {
//         success: true,
//         message: `ITC claims processed successfully. Total claimed: ₹${totalClaimed.toFixed(2)}`,
//         totalClaimed,
//         claimsProcessed: claims.length,
//         claims: claims.map(claim => ({
//           invoiceId: claim.invoiceId,
//           claimableAmount: claim.claimableAmount,
//           transactionHash: claim.transactionHash,
//           status: 'approved'
//         })),
//         remainingClaimable: Math.max(0, remainingClaimable),
//       };

//     } catch (error) {
//       // console.error('❌ Error in claimForCompany:', error);
//       throw error;
//     }
//   }


//   /**
//    * Get summary for company (backward compatibility)
//    */
//   async getSummaryForCompany(user: any) {
//     try {
//       const analysis = await this.getDetailedItcAnalysis(user);
//       return {
//         companyId: user.tenant_id, // Keep for backward compatibility
//         walletAddress: analysis.walletAddress,
//         inputGST: analysis.itcSummary.totalInputGST,
//         outputGST: analysis.itcSummary.totalOutputGST,
//         totalClaimable: analysis.itcSummary.claimableAmount,
//         netITC: analysis.itcSummary.netITC,
//         claimCount: analysis.itcSummary.claimCount,
//         claims: analysis.existingClaims
//       };
//     } catch (error) {
//       // console.error('Error in getSummaryForCompany:', error);
//       return {
//         companyId: user.tenant_id,
//         walletAddress: user.walletAddress,
//         inputGST: 0,
//         outputGST: 0,
//         totalClaimable: 0,
//         netITC: 0,
//         claimCount: 0,
//         claims: []
//       };
//     }
//   }

//   /**
//    * Get month-wise ITC breakdown based on wallet address
//    */
//   async getMonthlyItcBreakdown(user: any, year: number = new Date().getFullYear()) {
//     const { walletAddress } = user;

//     if (!walletAddress) {
//       throw new Error('Wallet address is required for monthly breakdown');
//     }

//     try {
//       const inputInvoices = await this.invoiceRepo.find({
//         where: {
//           buyer: { wallet_address: walletAddress },
//           status: 'approved',
//         },
//         relations: ['buyer'],
//       });

//       const outputInvoices = await this.invoiceRepo.find({
//         where: {
//           seller: { legalRepresentative: walletAddress },
//           status: 'approved',
//         },
//         relations: ['seller'],
//       });

//       const monthlyData = {};

//       // Initialize months
//       for (let month = 0; month < 12; month++) {
//         const monthKey = `${year}-${String(month + 1).padStart(2, '0')}`;
//         monthlyData[monthKey] = {
//           month: new Date(year, month).toLocaleString('default', { month: 'long' }),
//           inputGST: 0,
//           outputGST: 0,
//           netITC: 0,
//           inputInvoiceCount: 0,
//           outputInvoiceCount: 0
//         };
//       }

//       // Process input invoices
//       inputInvoices.forEach(inv => {
//         const date = new Date(inv.invoiceDate);
//         if (date.getFullYear() === year) {
//           const monthKey = `${year}-${String(date.getMonth() + 1).padStart(2, '0')}`;
//           const gstAmount = parseFloat(inv.totalGstAmount.toString()) || 0;
//           monthlyData[monthKey].inputGST += gstAmount;
//           monthlyData[monthKey].inputInvoiceCount += 1;
//         }
//       });

//       // Process output invoices
//       outputInvoices.forEach(inv => {
//         const date = new Date(inv.invoiceDate);
//         if (date.getFullYear() === year) {
//           const monthKey = `${year}-${String(date.getMonth() + 1).padStart(2, '0')}`;
//           const gstAmount = parseFloat(inv.totalGstAmount.toString()) || 0;
//           monthlyData[monthKey].outputGST += gstAmount;
//           monthlyData[monthKey].outputInvoiceCount += 1;
//         }
//       });

//       // Calculate net ITC for each month
//       Object.keys(monthlyData).forEach(monthKey => {
//         const data = monthlyData[monthKey];
//         data.netITC = Math.max(0, data.inputGST - data.outputGST);
//       });

//       return {
//         year,
//         walletAddress,
//         monthlyBreakdown: Object.values(monthlyData),
//         yearlyTotals: {
//           inputGST: Object.values(monthlyData).reduce((sum: number, data: any) => sum + data.inputGST, 0),
//           outputGST: Object.values(monthlyData).reduce((sum: number, data: any) => sum + data.outputGST, 0),
//           netITC: Object.values(monthlyData).reduce((sum: number, data: any) => sum + data.netITC, 0),
//           totalInputInvoices: Object.values(monthlyData).reduce((sum: number, data: any) => sum + data.inputInvoiceCount, 0),
//           totalOutputInvoices: Object.values(monthlyData).reduce((sum: number, data: any) => sum + data.outputInvoiceCount, 0)
//         }
//       };

//     } catch (error) {
//       // console.error('Error in getMonthlyItcBreakdown:', error);
//       throw new Error('Failed to fetch monthly ITC breakdown');
//     }
//   }

//   /**
//    * Get all claims with invoice details based on wallet address
//    */
//   async getAllClaimsWithDetails(user: any) {
//     const { walletAddress } = user;

//     if (!walletAddress) {
//       throw new Error('Wallet address is required to fetch claims');
//     }

//     try {
//       const claims = await this.itcClaimRepo.find({
//         where: { companyWallet: walletAddress },
//         relations: ['invoice'],
//         order: { claimedAt: 'DESC' }
//       });

//       return claims.map(claim => ({
//         id: claim.id,
//         invoiceNumber: claim.invoice?.invoiceNo || 'N/A',
//         invoiceDate: claim.invoice?.invoiceDate || null,
//         inputGST: claim.inputGst,
//         outputGST: claim.outputGst,
//         claimableAmount: claim.claimableAmount,
//         transactionHash: claim.transactionHash,
//         claimedAt: claim.claimedAt,
//         status: claim.transactionHash === 'pending' ? 'pending' : 'approved'
//       }));

//     } catch (error) {
//       // console.error('Error in getAllClaimsWithDetails:', error);
//       throw new Error('Failed to fetch claims with details');
//     }
//   }
// }






import { Injectable } from '@nestjs/common';
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
  private providerUrl: string;

  constructor(
    @InjectRepository(Invoice) private invoiceRepo: Repository<Invoice>,
    @InjectRepository(ItcClaim) private itcClaimRepo: Repository<ItcClaim>,
  ) {
    this.providerUrl = process.env.PROVIDER_URL || '';
    // this.web3 = new Web3(process.env.PROVIDER_URL);
    this.web3 = new Web3(new Web3.providers.HttpProvider(this.providerUrl));
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
    ] as AbiItem[],
      process.env.INVOICE_CONTRACT_ADDRESS,
    );
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
/*   async claimForCompany(user: any) {
    const { walletAddress } = user;

    if (!walletAddress) {
      throw new Error('Wallet address is required for ITC claims');
    }

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
          isClaimedForITC: false // Only unclaimed invoices
        },
        relations: ['buyer'],
      });

      if (eligibleInputInvoices.length === 0) {
        throw new Error('No unclaimed invoices available');
      }

      const claims: ItcClaim[] = [];
      const claimedInvoices: Invoice[] = [];
      let remainingClaimable = analysis.itcSummary.claimableAmount;

      // Process each eligible invoice
      for (const invoice of eligibleInputInvoices) {
        if (remainingClaimable <= 0) break;

        const inputGST = parseFloat(invoice.totalGstAmount.toString()) || 0;
        const claimAmountForThisInvoice = Math.min(inputGST, remainingClaimable);

        if (claimAmountForThisInvoice <= 0) continue;

        try {
          // Step 3: Blockchain Transaction
          console.log(`Processing blockchain transaction for invoice: ${invoice.invoiceNo}`);

          // Fix 1: Convert to Wei and ensure consistent types
          const inputGSTWei = this.web3.utils.toWei(inputGST.toString(), 'ether');
          const outputGSTWei = this.web3.utils.toWei(analysis.itcSummary.totalOutputGST.toString(), 'ether');

          // Fix 2: Convert BigInt to string for contract method parameters
          const inputGSTString = inputGSTWei.toString();
          const outputGSTString = outputGSTWei.toString();

          console.log(`Input GST Wei: ${inputGSTString}, Output GST Wei: ${outputGSTString}`);

          // Fix 3: Get gas estimate with proper parameter types
          const gasEstimate = await this.contract.methods
            .claimITC(
              invoice.invoiceNo, 
              user.tenant_id, // Add companyId parameter that your contract expects
              inputGSTString, 
              outputGSTString
            )
            .estimateGas({ from: walletAddress });

          // Fix 4: Get current gas price
          const gasPrice = await this.web3.eth.getGasPrice();

          // Fix 5: Send transaction with explicit type conversions
          const tx = await this.contract.methods
            .claimITC(
              invoice.invoiceNo,
              user.tenant_id, // Add companyId parameter
              inputGSTString,
              outputGSTString
            )
            .send({
              from: walletAddress,
              gas: Math.floor(Number(gasEstimate) * 1.2).toString(), // Convert to string
              gasPrice: gasPrice.toString() // Convert to string
            });

          console.log("✅ Blockchain transaction successful:", tx.transactionHash);

          // Step 4: Save claim to database
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
          claims.push(savedClaim);

          // Step 5: Update invoice to mark as claimed
          invoice.isClaimedForITC = true;
          claimedInvoices.push(invoice);

          remainingClaimable -= claimAmountForThisInvoice;

        } catch (txError) {
          console.error(`❌ Blockchain transaction failed for invoice ${invoice.invoiceNo}:`, txError);
          // Log more detailed error information
          if (txError.message) {
            console.error(`Error message: ${txError.message}`);
          }
          if (txError.reason) {
            console.error(`Error reason: ${txError.reason}`);
          }
          // Continue with next invoice if one fails
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
          status: 'approved'
        })),
        remainingClaimable: Math.max(0, remainingClaimable),
      };

    } catch (error) {
      console.error('❌ Error in claimForCompany:', error);
      throw error;
    }
  } */

    async claimForCompany(user: any) {
      const { walletAddress } = user;
    
      if (!walletAddress) {
        throw new Error('Wallet address is required for ITC claims');
      }
    
      try {
        const analysis = await this.getDetailedItcAnalysis(user);
    
        if (analysis.itcSummary.claimableAmount <= 0) {
          throw new Error('No claimable ITC amount available');
        }
    
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
    
        for (const invoice of eligibleInputInvoices) {
          if (remainingClaimable <= 0) break;
    
          const inputGST = parseFloat(invoice.totalGstAmount.toString()) || 0;
          const claimAmountForThisInvoice = Math.min(inputGST, remainingClaimable);
    
          if (claimAmountForThisInvoice <= 0) continue;
    
          try {
            console.log(`Processing blockchain transaction for invoice: ${invoice.invoiceNo}`);
    
            // ✅ Directly pass rupee values without converting to Wei
            const inputGSTValue = inputGST.toString();
            const outputGSTValue = analysis.itcSummary.totalOutputGST.toString();
    
            console.log(`Input GST: ${inputGSTValue}, Output GST: ${outputGSTValue}`);
    
            const gasEstimate = await this.contract.methods
              .claimITC(
                invoice.invoiceNo,
                user.tenant_id,
                inputGSTValue,
                outputGSTValue
              )
              .estimateGas({ from: walletAddress });
    
            const gasPrice = await this.web3.eth.getGasPrice();
    
            const tx = await this.contract.methods
              .claimITC(
                invoice.invoiceNo,
                user.tenant_id,
                inputGSTValue,
                outputGSTValue
              )
              .send({
                from: walletAddress,
                gas: Math.floor(Number(gasEstimate) * 1.2).toString(),
                gasPrice: gasPrice.toString()
              });
    
            console.log("✅ Blockchain transaction successful:", tx.transactionHash);
    
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
            claims.push(savedClaim);
    
            invoice.isClaimedForITC = true;
            claimedInvoices.push(invoice);
    
            remainingClaimable -= claimAmountForThisInvoice;
    
          } catch (txError) {
            console.error(`❌ Blockchain transaction failed for invoice ${invoice.invoiceNo}:`, txError);
            if (txError.message) {
              console.error(`Error message: ${txError.message}`);
            }
            if (txError.reason) {
              console.error(`Error reason: ${txError.reason}`);
            }
            continue;
          }
        }
    
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
            status: 'approved'
          })),
          remainingClaimable: Math.max(0, remainingClaimable),
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