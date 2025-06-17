// import { Injectable, BadRequestException, UnauthorizedException, NotFoundException } from '@nestjs/common';
// import { InjectRepository } from '@nestjs/typeorm';
// import { Repository } from 'typeorm';
// import { ethers } from 'ethers';
// import {
//     CreateITCRecordDto,
//     ClaimITCDto,
//     BulkClaimITCDto,
//     ApproveITCDto,
//     RejectITCDto, 
//     ITCSummary,
//     ITCRecord
//   } from './dto/itc.dto';

// @Injectable()
// export class ITCService {
//   private contract: ethers.Contract;
//   private provider: ethers.providers.JsonRpcProvider;
//   private wallet: ethers.Wallet;

//   constructor() {
//     // Initialize blockchain connection
//     this.provider = new ethers.providers.JsonRpcProvider(process.env.PROVIDER_URL);
//     if (!process.env.PRIVATE_KEY) {
//       throw new Error('PRIVATE_KEY environment variable is not defined');
//     }
//     this.wallet = new ethers.Wallet(process.env.PRIVATE_KEY, this.provider);
    
//     const contractABI = [
//         {
//             "anonymous": false,
//             "inputs": [
//                 {
//                     "indexed": false,
//                     "internalType": "string",
//                     "name": "companyId",
//                     "type": "string"
//                 },
//                 {
//                     "indexed": false,
//                     "internalType": "address",
//                     "name": "walletAddress",
//                     "type": "address"
//                 }
//             ],
//             "name": "CompanyRegistered",
//             "type": "event"
//         },
//         {
//             "anonymous": false,
//             "inputs": [
//                 {
//                     "indexed": false,
//                     "internalType": "string",
//                     "name": "id",
//                     "type": "string"
//                 },
//                 {
//                     "indexed": false,
//                     "internalType": "string",
//                     "name": "name",
//                     "type": "string"
//                 },
//                 {
//                     "indexed": false,
//                     "internalType": "string",
//                     "name": "gstNumber",
//                     "type": "string"
//                 }
//             ],
//             "name": "CustomerAdded",
//             "type": "event"
//         },
//         {
//             "anonymous": false,
//             "inputs": [
//                 {
//                     "indexed": false,
//                     "internalType": "string",
//                     "name": "id",
//                     "type": "string"
//                 }
//             ],
//             "name": "CustomerDeleted",
//             "type": "event"
//         },
//         {
//             "anonymous": false,
//             "inputs": [
//                 {
//                     "indexed": false,
//                     "internalType": "string",
//                     "name": "id",
//                     "type": "string"
//                 },
//                 {
//                     "indexed": false,
//                     "internalType": "string",
//                     "name": "name",
//                     "type": "string"
//                 },
//                 {
//                     "indexed": false,
//                     "internalType": "string",
//                     "name": "gstNumber",
//                     "type": "string"
//                 }
//             ],
//             "name": "CustomerUpdated",
//             "type": "event"
//         },
//         {
//             "anonymous": false,
//             "inputs": [
//                 {
//                     "indexed": true,
//                     "internalType": "string",
//                     "name": "companyId",
//                     "type": "string"
//                 },
//                 {
//                     "indexed": false,
//                     "internalType": "string",
//                     "name": "invoiceNumber",
//                     "type": "string"
//                 },
//                 {
//                     "indexed": false,
//                     "internalType": "uint256",
//                     "name": "claimableAmount",
//                     "type": "uint256"
//                 }
//             ],
//             "name": "ITCApproved",
//             "type": "event"
//         },
//         {
//             "anonymous": false,
//             "inputs": [
//                 {
//                     "indexed": true,
//                     "internalType": "string",
//                     "name": "companyId",
//                     "type": "string"
//                 },
//                 {
//                     "indexed": false,
//                     "internalType": "string",
//                     "name": "invoiceNumber",
//                     "type": "string"
//                 },
//                 {
//                     "indexed": false,
//                     "internalType": "uint256",
//                     "name": "amount",
//                     "type": "uint256"
//                 },
//                 {
//                     "indexed": false,
//                     "internalType": "address",
//                     "name": "claimedBy",
//                     "type": "address"
//                 }
//             ],
//             "name": "ITCClaimed",
//             "type": "event"
//         },
//         {
//             "anonymous": false,
//             "inputs": [
//                 {
//                     "indexed": true,
//                     "internalType": "string",
//                     "name": "companyId",
//                     "type": "string"
//                 },
//                 {
//                     "indexed": false,
//                     "internalType": "string",
//                     "name": "invoiceNumber",
//                     "type": "string"
//                 },
//                 {
//                     "indexed": false,
//                     "internalType": "uint256",
//                     "name": "inputGST",
//                     "type": "uint256"
//                 },
//                 {
//                     "indexed": false,
//                     "internalType": "uint256",
//                     "name": "outputGST",
//                     "type": "uint256"
//                 }
//             ],
//             "name": "ITCRecordCreated",
//             "type": "event"
//         },
//         {
//             "anonymous": false,
//             "inputs": [
//                 {
//                     "indexed": true,
//                     "internalType": "string",
//                     "name": "companyId",
//                     "type": "string"
//                 },
//                 {
//                     "indexed": false,
//                     "internalType": "string",
//                     "name": "invoiceNumber",
//                     "type": "string"
//                 },
//                 {
//                     "indexed": false,
//                     "internalType": "string",
//                     "name": "reason",
//                     "type": "string"
//                 }
//             ],
//             "name": "ITCRejected",
//             "type": "event"
//         },
//         {
//             "anonymous": false,
//             "inputs": [
//                 {
//                     "indexed": false,
//                     "internalType": "string",
//                     "name": "invoiceNumber",
//                     "type": "string"
//                 }
//             ],
//             "name": "InvoiceCreated",
//             "type": "event"
//         },
//         {
//             "anonymous": false,
//             "inputs": [
//                 {
//                     "indexed": false,
//                     "internalType": "string",
//                     "name": "invoiceNumber",
//                     "type": "string"
//                 }
//             ],
//             "name": "InvoiceDeleted",
//             "type": "event"
//         },
//         {
//             "anonymous": false,
//             "inputs": [
//                 {
//                     "indexed": false,
//                     "internalType": "string",
//                     "name": "invoiceNumber",
//                     "type": "string"
//                 }
//             ],
//             "name": "InvoiceUpdated",
//             "type": "event"
//         },
//         {
//             "anonymous": false,
//             "inputs": [
//                 {
//                     "indexed": false,
//                     "internalType": "uint256",
//                     "name": "productID",
//                     "type": "uint256"
//                 },
//                 {
//                     "indexed": false,
//                     "internalType": "string",
//                     "name": "productName",
//                     "type": "string"
//                 },
//                 {
//                     "indexed": false,
//                     "internalType": "uint256",
//                     "name": "price",
//                     "type": "uint256"
//                 }
//             ],
//             "name": "ProductAdded",
//             "type": "event"
//         },
//         {
//             "anonymous": false,
//             "inputs": [
//                 {
//                     "indexed": false,
//                     "internalType": "uint256",
//                     "name": "productID",
//                     "type": "uint256"
//                 }
//             ],
//             "name": "ProductDeleted",
//             "type": "event"
//         },
//         {
//             "anonymous": false,
//             "inputs": [
//                 {
//                     "indexed": false,
//                     "internalType": "uint256",
//                     "name": "productID",
//                     "type": "uint256"
//                 },
//                 {
//                     "indexed": false,
//                     "internalType": "string",
//                     "name": "productName",
//                     "type": "string"
//                 },
//                 {
//                     "indexed": false,
//                     "internalType": "uint256",
//                     "name": "price",
//                     "type": "uint256"
//                 }
//             ],
//             "name": "ProductUpdated",
//             "type": "event"
//         },
//         {
//             "inputs": [
//                 {
//                     "internalType": "string",
//                     "name": "_id",
//                     "type": "string"
//                 },
//                 {
//                     "internalType": "string",
//                     "name": "_name",
//                     "type": "string"
//                 },
//                 {
//                     "internalType": "string",
//                     "name": "_gstNumber",
//                     "type": "string"
//                 }
//             ],
//             "name": "addCustomer",
//             "outputs": [],
//             "stateMutability": "nonpayable",
//             "type": "function"
//         },
//         {
//             "inputs": [
//                 {
//                     "internalType": "uint256",
//                     "name": "_id",
//                     "type": "uint256"
//                 },
//                 {
//                     "internalType": "string",
//                     "name": "_name",
//                     "type": "string"
//                 },
//                 {
//                     "internalType": "uint256",
//                     "name": "_price",
//                     "type": "uint256"
//                 }
//             ],
//             "name": "addProduct",
//             "outputs": [],
//             "stateMutability": "nonpayable",
//             "type": "function"
//         },
//         {
//             "inputs": [
//                 {
//                     "internalType": "uint256",
//                     "name": "",
//                     "type": "uint256"
//                 }
//             ],
//             "name": "allCompanies",
//             "outputs": [
//                 {
//                     "internalType": "string",
//                     "name": "",
//                     "type": "string"
//                 }
//             ],
//             "stateMutability": "view",
//             "type": "function"
//         },
//         {
//             "inputs": [
//                 {
//                     "internalType": "string",
//                     "name": "_invoiceNumber",
//                     "type": "string"
//                 }
//             ],
//             "name": "approveITC",
//             "outputs": [],
//             "stateMutability": "nonpayable",
//             "type": "function"
//         },
//         {
//             "inputs": [
//                 {
//                     "internalType": "string[]",
//                     "name": "_invoiceNumbers",
//                     "type": "string[]"
//                 }
//             ],
//             "name": "bulkClaimITC",
//             "outputs": [],
//             "stateMutability": "nonpayable",
//             "type": "function"
//         },
//         {
//             "inputs": [
//                 {
//                     "internalType": "string",
//                     "name": "_invoiceNumber",
//                     "type": "string"
//                 }
//             ],
//             "name": "claimITC",
//             "outputs": [],
//             "stateMutability": "nonpayable",
//             "type": "function"
//         },
//         {
//             "inputs": [
//                 {
//                     "internalType": "string",
//                     "name": "",
//                     "type": "string"
//                 },
//                 {
//                     "internalType": "uint256",
//                     "name": "",
//                     "type": "uint256"
//                 }
//             ],
//             "name": "companyInvoices",
//             "outputs": [
//                 {
//                     "internalType": "string",
//                     "name": "",
//                     "type": "string"
//                 }
//             ],
//             "stateMutability": "view",
//             "type": "function"
//         },
//         {
//             "inputs": [
//                 {
//                     "internalType": "string",
//                     "name": "",
//                     "type": "string"
//                 }
//             ],
//             "name": "companySummary",
//             "outputs": [
//                 {
//                     "internalType": "uint256",
//                     "name": "totalInputGST",
//                     "type": "uint256"
//                 },
//                 {
//                     "internalType": "uint256",
//                     "name": "totalOutputGST",
//                     "type": "uint256"
//                 },
//                 {
//                     "internalType": "uint256",
//                     "name": "totalClaimableITC",
//                     "type": "uint256"
//                 },
//                 {
//                     "internalType": "uint256",
//                     "name": "totalClaimedITC",
//                     "type": "uint256"
//                 },
//                 {
//                     "internalType": "uint256",
//                     "name": "pendingITC",
//                     "type": "uint256"
//                 },
//                 {
//                     "internalType": "uint256",
//                     "name": "recordCount",
//                     "type": "uint256"
//                 }
//             ],
//             "stateMutability": "view",
//             "type": "function"
//         },
//         {
//             "inputs": [
//                 {
//                     "internalType": "string",
//                     "name": "_invoiceNumber",
//                     "type": "string"
//                 },
//                 {
//                     "internalType": "string",
//                     "name": "_companyId",
//                     "type": "string"
//                 },
//                 {
//                     "internalType": "address",
//                     "name": "_companyWallet",
//                     "type": "address"
//                 },
//                 {
//                     "internalType": "uint256",
//                     "name": "_inputGST",
//                     "type": "uint256"
//                 },
//                 {
//                     "internalType": "uint256",
//                     "name": "_outputGST",
//                     "type": "uint256"
//                 },
//                 {
//                     "internalType": "bool",
//                     "name": "_isApproved",
//                     "type": "bool"
//                 }
//             ],
//             "name": "createITCRecord",
//             "outputs": [],
//             "stateMutability": "nonpayable",
//             "type": "function"
//         },
//         {
//             "inputs": [
//                 {
//                     "internalType": "string",
//                     "name": "_invoiceNumber",
//                     "type": "string"
//                 },
//                 {
//                     "internalType": "string",
//                     "name": "_invoiceDate",
//                     "type": "string"
//                 },
//                 {
//                     "internalType": "string",
//                     "name": "_supplyType",
//                     "type": "string"
//                 },
//                 {
//                     "internalType": "uint256[]",
//                     "name": "_productIDs",
//                     "type": "uint256[]"
//                 },
//                 {
//                     "internalType": "string[]",
//                     "name": "_productNames",
//                     "type": "string[]"
//                 },
//                 {
//                     "internalType": "uint256[]",
//                     "name": "_quantities",
//                     "type": "uint256[]"
//                 },
//                 {
//                     "internalType": "uint256[]",
//                     "name": "_unitPrices",
//                     "type": "uint256[]"
//                 },
//                 {
//                     "internalType": "uint256[]",
//                     "name": "_gstRates",
//                     "type": "uint256[]"
//                 },
//                 {
//                     "internalType": "uint256[]",
//                     "name": "_totalAmounts",
//                     "type": "uint256[]"
//                 },
//                 {
//                     "internalType": "uint256",
//                     "name": "_totalTaxableValue",
//                     "type": "uint256"
//                 },
//                 {
//                     "internalType": "uint256",
//                     "name": "_totalGstAmount",
//                     "type": "uint256"
//                 },
//                 {
//                     "internalType": "uint256",
//                     "name": "_grandTotal",
//                     "type": "uint256"
//                 },
//                 {
//                     "internalType": "string",
//                     "name": "_paymentTerms",
//                     "type": "string"
//                 },
//                 {
//                     "internalType": "bool",
//                     "name": "_isFinal",
//                     "type": "bool"
//                 }
//             ],
//             "name": "createInvoice",
//             "outputs": [],
//             "stateMutability": "nonpayable",
//             "type": "function"
//         },
//         {
//             "inputs": [
//                 {
//                     "internalType": "string",
//                     "name": "",
//                     "type": "string"
//                 }
//             ],
//             "name": "customers",
//             "outputs": [
//                 {
//                     "internalType": "string",
//                     "name": "id",
//                     "type": "string"
//                 },
//                 {
//                     "internalType": "string",
//                     "name": "name",
//                     "type": "string"
//                 },
//                 {
//                     "internalType": "string",
//                     "name": "gstNumber",
//                     "type": "string"
//                 }
//             ],
//             "stateMutability": "view",
//             "type": "function"
//         },
//         {
//             "inputs": [
//                 {
//                     "internalType": "string",
//                     "name": "_id",
//                     "type": "string"
//                 }
//             ],
//             "name": "deleteCustomer",
//             "outputs": [],
//             "stateMutability": "nonpayable",
//             "type": "function"
//         },
//         {
//             "inputs": [
//                 {
//                     "internalType": "string",
//                     "name": "_invoiceNumber",
//                     "type": "string"
//                 }
//             ],
//             "name": "deleteInvoice",
//             "outputs": [],
//             "stateMutability": "nonpayable",
//             "type": "function"
//         },
//         {
//             "inputs": [
//                 {
//                     "internalType": "uint256",
//                     "name": "_id",
//                     "type": "uint256"
//                 }
//             ],
//             "name": "deleteProduct",
//             "outputs": [],
//             "stateMutability": "nonpayable",
//             "type": "function"
//         },
//         {
//             "inputs": [],
//             "name": "getAllCompanies",
//             "outputs": [
//                 {
//                     "internalType": "string[]",
//                     "name": "",
//                     "type": "string[]"
//                 }
//             ],
//             "stateMutability": "view",
//             "type": "function"
//         },
//         {
//             "inputs": [],
//             "name": "getAllInvoices",
//             "outputs": [
//                 {
//                     "components": [
//                         {
//                             "internalType": "string",
//                             "name": "invoiceNumber",
//                             "type": "string"
//                         },
//                         {
//                             "internalType": "string",
//                             "name": "invoiceDate",
//                             "type": "string"
//                         },
//                         {
//                             "internalType": "string",
//                             "name": "supplyType",
//                             "type": "string"
//                         },
//                         {
//                             "components": [
//                                 {
//                                     "internalType": "uint256",
//                                     "name": "productID",
//                                     "type": "uint256"
//                                 },
//                                 {
//                                     "internalType": "string",
//                                     "name": "productName",
//                                     "type": "string"
//                                 },
//                                 {
//                                     "internalType": "uint256",
//                                     "name": "quantity",
//                                     "type": "uint256"
//                                 },
//                                 {
//                                     "internalType": "uint256",
//                                     "name": "unitPrice",
//                                     "type": "uint256"
//                                 },
//                                 {
//                                     "internalType": "uint256",
//                                     "name": "gstRate",
//                                     "type": "uint256"
//                                 },
//                                 {
//                                     "internalType": "uint256",
//                                     "name": "totalAmount",
//                                     "type": "uint256"
//                                 }
//                             ],
//                             "internalType": "struct Company.InvoiceItem[]",
//                             "name": "items",
//                             "type": "tuple[]"
//                         },
//                         {
//                             "internalType": "uint256",
//                             "name": "totalTaxableValue",
//                             "type": "uint256"
//                         },
//                         {
//                             "internalType": "uint256",
//                             "name": "totalGstAmount",
//                             "type": "uint256"
//                         },
//                         {
//                             "internalType": "uint256",
//                             "name": "grandTotal",
//                             "type": "uint256"
//                         },
//                         {
//                             "internalType": "string",
//                             "name": "paymentTerms",
//                             "type": "string"
//                         },
//                         {
//                             "internalType": "bool",
//                             "name": "isFinal",
//                             "type": "bool"
//                         }
//                     ],
//                     "internalType": "struct Company.Invoice[]",
//                     "name": "",
//                     "type": "tuple[]"
//                 }
//             ],
//             "stateMutability": "view",
//             "type": "function"
//         },
//         {
//             "inputs": [
//                 {
//                     "internalType": "string",
//                     "name": "_companyId",
//                     "type": "string"
//                 }
//             ],
//             "name": "getClaimableITCs",
//             "outputs": [
//                 {
//                     "internalType": "string[]",
//                     "name": "",
//                     "type": "string[]"
//                 }
//             ],
//             "stateMutability": "view",
//             "type": "function"
//         },
//         {
//             "inputs": [
//                 {
//                     "internalType": "address",
//                     "name": "_wallet",
//                     "type": "address"
//                 }
//             ],
//             "name": "getCompanyByWallet",
//             "outputs": [
//                 {
//                     "internalType": "string",
//                     "name": "",
//                     "type": "string"
//                 }
//             ],
//             "stateMutability": "view",
//             "type": "function"
//         },
//         {
//             "inputs": [
//                 {
//                     "internalType": "string",
//                     "name": "_companyId",
//                     "type": "string"
//                 }
//             ],
//             "name": "getCompanyInvoices",
//             "outputs": [
//                 {
//                     "internalType": "string[]",
//                     "name": "",
//                     "type": "string[]"
//                 }
//             ],
//             "stateMutability": "view",
//             "type": "function"
//         },
//         {
//             "inputs": [
//                 {
//                     "internalType": "string",
//                     "name": "_companyId",
//                     "type": "string"
//                 }
//             ],
//             "name": "getCompanySummary",
//             "outputs": [
//                 {
//                     "components": [
//                         {
//                             "internalType": "uint256",
//                             "name": "totalInputGST",
//                             "type": "uint256"
//                         },
//                         {
//                             "internalType": "uint256",
//                             "name": "totalOutputGST",
//                             "type": "uint256"
//                         },
//                         {
//                             "internalType": "uint256",
//                             "name": "totalClaimableITC",
//                             "type": "uint256"
//                         },
//                         {
//                             "internalType": "uint256",
//                             "name": "totalClaimedITC",
//                             "type": "uint256"
//                         },
//                         {
//                             "internalType": "uint256",
//                             "name": "pendingITC",
//                             "type": "uint256"
//                         },
//                         {
//                             "internalType": "uint256",
//                             "name": "recordCount",
//                             "type": "uint256"
//                         }
//                     ],
//                     "internalType": "struct Company.ITCSummary",
//                     "name": "",
//                     "type": "tuple"
//                 }
//             ],
//             "stateMutability": "view",
//             "type": "function"
//         },
//         {
//             "inputs": [
//                 {
//                     "internalType": "string",
//                     "name": "_invoiceNumber",
//                     "type": "string"
//                 }
//             ],
//             "name": "getITCRecord",
//             "outputs": [
//                 {
//                     "components": [
//                         {
//                             "internalType": "string",
//                             "name": "invoiceNumber",
//                             "type": "string"
//                         },
//                         {
//                             "internalType": "string",
//                             "name": "companyId",
//                             "type": "string"
//                         },
//                         {
//                             "internalType": "address",
//                             "name": "companyWallet",
//                             "type": "address"
//                         },
//                         {
//                             "internalType": "uint256",
//                             "name": "inputGST",
//                             "type": "uint256"
//                         },
//                         {
//                             "internalType": "uint256",
//                             "name": "outputGST",
//                             "type": "uint256"
//                         },
//                         {
//                             "internalType": "uint256",
//                             "name": "netITC",
//                             "type": "uint256"
//                         },
//                         {
//                             "internalType": "uint256",
//                             "name": "claimableAmount",
//                             "type": "uint256"
//                         },
//                         {
//                             "internalType": "uint256",
//                             "name": "claimedAmount",
//                             "type": "uint256"
//                         },
//                         {
//                             "internalType": "uint256",
//                             "name": "timestamp",
//                             "type": "uint256"
//                         },
//                         {
//                             "internalType": "bool",
//                             "name": "isApproved",
//                             "type": "bool"
//                         },
//                         {
//                             "internalType": "bool",
//                             "name": "isClaimed",
//                             "type": "bool"
//                         },
//                         {
//                             "internalType": "string",
//                             "name": "status",
//                             "type": "string"
//                         }
//                     ],
//                     "internalType": "struct Company.ITCRecord",
//                     "name": "",
//                     "type": "tuple"
//                 }
//             ],
//             "stateMutability": "view",
//             "type": "function"
//         },
//         {
//             "inputs": [
//                 {
//                     "internalType": "string",
//                     "name": "_invoiceNumber",
//                     "type": "string"
//                 }
//             ],
//             "name": "getInvoiceByNumber",
//             "outputs": [
//                 {
//                     "internalType": "string",
//                     "name": "",
//                     "type": "string"
//                 },
//                 {
//                     "internalType": "string",
//                     "name": "",
//                     "type": "string"
//                 },
//                 {
//                     "internalType": "string",
//                     "name": "",
//                     "type": "string"
//                 },
//                 {
//                     "components": [
//                         {
//                             "internalType": "uint256",
//                             "name": "productID",
//                             "type": "uint256"
//                         },
//                         {
//                             "internalType": "string",
//                             "name": "productName",
//                             "type": "string"
//                         },
//                         {
//                             "internalType": "uint256",
//                             "name": "quantity",
//                             "type": "uint256"
//                         },
//                         {
//                             "internalType": "uint256",
//                             "name": "unitPrice",
//                             "type": "uint256"
//                         },
//                         {
//                             "internalType": "uint256",
//                             "name": "gstRate",
//                             "type": "uint256"
//                         },
//                         {
//                             "internalType": "uint256",
//                             "name": "totalAmount",
//                             "type": "uint256"
//                         }
//                     ],
//                     "internalType": "struct Company.InvoiceItem[]",
//                     "name": "",
//                     "type": "tuple[]"
//                 },
//                 {
//                     "internalType": "uint256",
//                     "name": "",
//                     "type": "uint256"
//                 },
//                 {
//                     "internalType": "uint256",
//                     "name": "",
//                     "type": "uint256"
//                 },
//                 {
//                     "internalType": "uint256",
//                     "name": "",
//                     "type": "uint256"
//                 },
//                 {
//                     "internalType": "string",
//                     "name": "",
//                     "type": "string"
//                 },
//                 {
//                     "internalType": "bool",
//                     "name": "",
//                     "type": "bool"
//                 }
//             ],
//             "stateMutability": "view",
//             "type": "function"
//         },
//         {
//             "inputs": [
//                 {
//                     "internalType": "string",
//                     "name": "_companyId",
//                     "type": "string"
//                 }
//             ],
//             "name": "getTotalClaimableAmount",
//             "outputs": [
//                 {
//                     "internalType": "uint256",
//                     "name": "",
//                     "type": "uint256"
//                 }
//             ],
//             "stateMutability": "view",
//             "type": "function"
//         },
//         {
//             "inputs": [
//                 {
//                     "internalType": "string",
//                     "name": "",
//                     "type": "string"
//                 }
//             ],
//             "name": "itcRecords",
//             "outputs": [
//                 {
//                     "internalType": "string",
//                     "name": "invoiceNumber",
//                     "type": "string"
//                 },
//                 {
//                     "internalType": "string",
//                     "name": "companyId",
//                     "type": "string"
//                 },
//                 {
//                     "internalType": "address",
//                     "name": "companyWallet",
//                     "type": "address"
//                 },
//                 {
//                     "internalType": "uint256",
//                     "name": "inputGST",
//                     "type": "uint256"
//                 },
//                 {
//                     "internalType": "uint256",
//                     "name": "outputGST",
//                     "type": "uint256"
//                 },
//                 {
//                     "internalType": "uint256",
//                     "name": "netITC",
//                     "type": "uint256"
//                 },
//                 {
//                     "internalType": "uint256",
//                     "name": "claimableAmount",
//                     "type": "uint256"
//                 },
//                 {
//                     "internalType": "uint256",
//                     "name": "claimedAmount",
//                     "type": "uint256"
//                 },
//                 {
//                     "internalType": "uint256",
//                     "name": "timestamp",
//                     "type": "uint256"
//                 },
//                 {
//                     "internalType": "bool",
//                     "name": "isApproved",
//                     "type": "bool"
//                 },
//                 {
//                     "internalType": "bool",
//                     "name": "isClaimed",
//                     "type": "bool"
//                 },
//                 {
//                     "internalType": "string",
//                     "name": "status",
//                     "type": "string"
//                 }
//             ],
//             "stateMutability": "view",
//             "type": "function"
//         },
//         {
//             "inputs": [],
//             "name": "nextCustomerId",
//             "outputs": [
//                 {
//                     "internalType": "uint256",
//                     "name": "",
//                     "type": "uint256"
//                 }
//             ],
//             "stateMutability": "view",
//             "type": "function"
//         },
//         {
//             "inputs": [
//                 {
//                     "internalType": "uint256",
//                     "name": "",
//                     "type": "uint256"
//                 }
//             ],
//             "name": "products",
//             "outputs": [
//                 {
//                     "internalType": "uint256",
//                     "name": "productID",
//                     "type": "uint256"
//                 },
//                 {
//                     "internalType": "string",
//                     "name": "productName",
//                     "type": "string"
//                 },
//                 {
//                     "internalType": "uint256",
//                     "name": "price",
//                     "type": "uint256"
//                 }
//             ],
//             "stateMutability": "view",
//             "type": "function"
//         },
//         {
//             "inputs": [
//                 {
//                     "internalType": "string",
//                     "name": "_companyId",
//                     "type": "string"
//                 },
//                 {
//                     "internalType": "address",
//                     "name": "_walletAddress",
//                     "type": "address"
//                 }
//             ],
//             "name": "registerCompany",
//             "outputs": [],
//             "stateMutability": "nonpayable",
//             "type": "function"
//         },
//         {
//             "inputs": [
//                 {
//                     "internalType": "string",
//                     "name": "_invoiceNumber",
//                     "type": "string"
//                 },
//                 {
//                     "internalType": "string",
//                     "name": "_reason",
//                     "type": "string"
//                 }
//             ],
//             "name": "rejectITC",
//             "outputs": [],
//             "stateMutability": "nonpayable",
//             "type": "function"
//         },
//         {
//             "inputs": [],
//             "name": "totalITCClaims",
//             "outputs": [
//                 {
//                     "internalType": "uint256",
//                     "name": "",
//                     "type": "uint256"
//                 }
//             ],
//             "stateMutability": "view",
//             "type": "function"
//         },
//         {
//             "inputs": [],
//             "name": "totalInvoices",
//             "outputs": [
//                 {
//                     "internalType": "uint256",
//                     "name": "",
//                     "type": "uint256"
//                 }
//             ],
//             "stateMutability": "view",
//             "type": "function"
//         },
//         {
//             "inputs": [],
//             "name": "totalProducts",
//             "outputs": [
//                 {
//                     "internalType": "uint256",
//                     "name": "",
//                     "type": "uint256"
//                 }
//             ],
//             "stateMutability": "view",
//             "type": "function"
//         },
//         {
//             "inputs": [
//                 {
//                     "internalType": "string",
//                     "name": "_id",
//                     "type": "string"
//                 },
//                 {
//                     "internalType": "string",
//                     "name": "_name",
//                     "type": "string"
//                 },
//                 {
//                     "internalType": "string",
//                     "name": "_gstNumber",
//                     "type": "string"
//                 }
//             ],
//             "name": "updateCustomer",
//             "outputs": [],
//             "stateMutability": "nonpayable",
//             "type": "function"
//         },
//         {
//             "inputs": [
//                 {
//                     "internalType": "string",
//                     "name": "_invoiceNumber",
//                     "type": "string"
//                 },
//                 {
//                     "internalType": "string",
//                     "name": "_invoiceDate",
//                     "type": "string"
//                 },
//                 {
//                     "internalType": "string",
//                     "name": "_supplyType",
//                     "type": "string"
//                 },
//                 {
//                     "internalType": "uint256[]",
//                     "name": "_productIDs",
//                     "type": "uint256[]"
//                 },
//                 {
//                     "internalType": "string[]",
//                     "name": "_productNames",
//                     "type": "string[]"
//                 },
//                 {
//                     "internalType": "uint256[]",
//                     "name": "_quantities",
//                     "type": "uint256[]"
//                 },
//                 {
//                     "internalType": "uint256[]",
//                     "name": "_unitPrices",
//                     "type": "uint256[]"
//                 },
//                 {
//                     "internalType": "uint256[]",
//                     "name": "_gstRates",
//                     "type": "uint256[]"
//                 },
//                 {
//                     "internalType": "uint256[]",
//                     "name": "_totalAmounts",
//                     "type": "uint256[]"
//                 },
//                 {
//                     "internalType": "uint256",
//                     "name": "_totalTaxableValue",
//                     "type": "uint256"
//                 },
//                 {
//                     "internalType": "uint256",
//                     "name": "_totalGstAmount",
//                     "type": "uint256"
//                 },
//                 {
//                     "internalType": "uint256",
//                     "name": "_grandTotal",
//                     "type": "uint256"
//                 },
//                 {
//                     "internalType": "string",
//                     "name": "_paymentTerms",
//                     "type": "string"
//                 },
//                 {
//                     "internalType": "bool",
//                     "name": "_isFinal",
//                     "type": "bool"
//                 }
//             ],
//             "name": "updateInvoice",
//             "outputs": [],
//             "stateMutability": "nonpayable",
//             "type": "function"
//         },
//         {
//             "inputs": [
//                 {
//                     "internalType": "uint256",
//                     "name": "_id",
//                     "type": "uint256"
//                 },
//                 {
//                     "internalType": "string",
//                     "name": "_name",
//                     "type": "string"
//                 },
//                 {
//                     "internalType": "uint256",
//                     "name": "_price",
//                     "type": "uint256"
//                 }
//             ],
//             "name": "updateProduct",
//             "outputs": [],
//             "stateMutability": "nonpayable",
//             "type": "function"
//         },
//         {
//             "inputs": [
//                 {
//                     "internalType": "string",
//                     "name": "_invoiceNumber",
//                     "type": "string"
//                 },
//                 {
//                     "internalType": "string",
//                     "name": "_status",
//                     "type": "string"
//                 }
//             ],
//             "name": "updateRecordStatus",
//             "outputs": [],
//             "stateMutability": "nonpayable",
//             "type": "function"
//         },
//         {
//             "inputs": [
//                 {
//                     "internalType": "address",
//                     "name": "",
//                     "type": "address"
//                 }
//             ],
//             "name": "walletToCompany",
//             "outputs": [
//                 {
//                     "internalType": "string",
//                     "name": "",
//                     "type": "string"
//                 }
//             ],
//             "stateMutability": "view",
//             "type": "function"
//         }
//     ];
    
//     this.contract = new ethers.Contract(
//       process.env.INVOICE_CONTRACT_ADDRESS || (() => { throw new Error('INVOICE_CONTRACT_ADDRESS environment variable is not defined'); })(),
//       contractABI,
//       this.wallet
//     );
//   }

//   // Calculate ITC from invoice data
//   async calculateITCFromInvoice(invoiceData: any): Promise<{ inputGST: number; outputGST: number; netITC: number }> {
//     let inputGST = 0;
//     let outputGST = 0;

//     // Only process approved invoices
//     if (invoiceData.status !== 'approved') {
//       throw new BadRequestException('Only approved invoices can be used for ITC calculation');
//     }

//     // Calculate GST from invoice items
//     if (invoiceData.items && invoiceData.items.length > 0) {
//       for (const item of invoiceData.items) {
//         const itemGST = (item.unitPrice * item.quantity * item.gstRate) / 100;
        
//         // Determine if this is input or output GST based on invoice type/context
//         // For purchases (input GST) - when company is buyer
//         // For sales (output GST) - when company is seller
//         if (invoiceData.supplyType === 'purchase' || invoiceData.supplyType === 'input') {
//           inputGST += itemGST;
//         } else {
//           outputGST += itemGST;
//         }
//       }
//     }

//     const netITC = inputGST > outputGST ? inputGST - outputGST : 0;

//     return {
//       inputGST: Math.round(inputGST * 100) / 100,
//       outputGST: Math.round(outputGST * 100) / 100,
//       netITC: Math.round(netITC * 100) / 100
//     };
//   }

//   // Create ITC record
//   async createITCRecord(createITCDto: CreateITCRecordDto, userToken: any): Promise<any> {
//     try {
//       // Verify user authorization
//       if (userToken.role !== 'company') {
//         throw new UnauthorizedException('Only companies can create ITC records');
//       }

//       // Register company if not already registered
//       await this.registerCompanyIfNeeded(userToken.tenant_id, userToken.walletAddress);

//       const tx = await this.contract.createITCRecord(
//         createITCDto.invoiceNumber,
//         userToken.tenant_id,
//         userToken.walletAddress,
//         ethers.utils.parseUnits(createITCDto.inputGST.toString(), 18),
//         ethers.utils.parseUnits(createITCDto.outputGST.toString(), 18),
//         createITCDto.isApproved
//       );

//       const receipt = await tx.wait();
      
//       return {
//         success: true,
//         transactionHash: receipt.hash,
//         message: 'ITC record created successfully'
//       };
//     } catch (error) {
//       throw new BadRequestException(`Failed to create ITC record: ${error.message}`);
//     }
//   }

//   // Process invoice for ITC calculation
//   async processInvoiceForITC(invoiceData: any, userToken: any): Promise<any> {
//     try {
//       const { inputGST, outputGST, netITC } = await this.calculateITCFromInvoice(invoiceData);

//       const createITCDto: CreateITCRecordDto = {
//         invoiceNumber: invoiceData.invoiceNo,
//         companyId: userToken.tenant_id,
//         companyWallet: userToken.walletAddress,
//         inputGST,
//         outputGST,
//         isApproved: invoiceData.status === 'approved'
//       };

//       return await this.createITCRecord(createITCDto, userToken);
//     } catch (error) {
//       throw new BadRequestException(`Failed to process invoice for ITC: ${error.message}`);
//     }
//   }

//   // Claim ITC
//   async claimITC(claimITCDto: ClaimITCDto, userToken: any): Promise<any> {
//     try {
//       if (userToken.role !== 'company') {
//         throw new UnauthorizedException('Only companies can claim ITC');
//       }

//       const tx = await this.contract.claimITC(claimITCDto.invoiceNumber);
//       const receipt = await tx.wait();

//       return {
//         success: true,
//         transactionHash: receipt.hash,
//         message: 'ITC claimed successfully'
//       };
//     } catch (error) {
//       throw new BadRequestException(`Failed to claim ITC: ${error.message}`);
//     }
//   }

//   // Bulk claim ITC
//   async bulkClaimITC(bulkClaimDto: BulkClaimITCDto, userToken: any): Promise<any> {
//     try {
//       if (userToken.role !== 'company') {
//         throw new UnauthorizedException('Only companies can claim ITC');
//       }

//       const tx = await this.contract.bulkClaimITC(bulkClaimDto.invoiceNumbers);
//       const receipt = await tx.wait();

//       return {
//         success: true,
//         transactionHash: receipt.hash,
//         message: `Bulk ITC claim processed for ${bulkClaimDto.invoiceNumbers.length} invoices`
//       };
//     } catch (error) {
//       throw new BadRequestException(`Failed to bulk claim ITC: ${error.message}`);
//     }
//   }

//   // Get company ITC summary
//   async getCompanySummary(userToken: any): Promise<ITCSummary> {
//     try {
//       const summary = await this.contract.getCompanySummary(userToken.tenant_id);
      
//       return {
//         totalInputGST: parseFloat(ethers.utils.formatUnits(summary.totalInputGST, 18)),
//         totalOutputGST: parseFloat(ethers.utils.formatUnits(summary.totalOutputGST, 18)),
//         totalClaimableITC: parseFloat(ethers.utils.formatUnits(summary.totalClaimableITC, 18)),
//         totalClaimedITC: parseFloat(ethers.utils.formatUnits(summary.totalClaimedITC, 18)),
//         pendingITC: parseFloat(ethers.utils.formatUnits(summary.pendingITC, 18)),
//         recordCount: summary.recordCount.toNumber()
//       };
//     } catch (error) {
//       throw new BadRequestException(`Failed to get company summary: ${error.message}`);
//     }
//   }

//   // Get claimable ITCs
//   async getClaimableITCs(userToken: any): Promise<string[]> {
//     try {
//       return await this.contract.getClaimableITCs(userToken.tenant_id);
//     } catch (error) {
//       throw new BadRequestException(`Failed to get claimable ITCs: ${error.message}`);
//     }
//   }

//   // Get ITC record by invoice number
//   async getITCRecord(invoiceNumber: string, userToken: any): Promise<ITCRecord> {
//     try {
//       const record = await this.contract.getITCRecord(invoiceNumber);
      
//       // Verify user has access to this record
//       if (record.companyId !== userToken.tenant_id) {
//         throw new UnauthorizedException('Access denied to this ITC record');
//       }

//       return {
//         invoiceNumber: record.invoiceNumber,
//         companyId: record.companyId,
//         companyWallet: record.companyWallet,
//         inputGST: parseFloat(ethers.utils.formatUnits(record.inputGST, 18)),
//         outputGST: parseFloat(ethers.utils.formatUnits(record.outputGST, 18)),
//         netITC: parseFloat(ethers.utils.formatUnits(record.netITC, 18)),
//         claimableAmount: parseFloat(ethers.utils.formatUnits(record.claimableAmount, 18)),
//         claimedAmount: parseFloat(ethers.utils.formatUnits(record.claimedAmount, 18)),
//         timestamp: record.timestamp.toNumber(),
//         isApproved: record.isApproved,
//         isClaimed: record.isClaimed,
//         status: record.status
//       };
//     } catch (error) {
//       throw new BadRequestException(`Failed to get ITC record: ${error.message}`);
//     }
//   }

//   // Get total claimable amount for company
//   async getTotalClaimableAmount(userToken: any): Promise<number> {
//     try {
//       const amount = await this.contract.getTotalClaimableAmount(userToken.tenant_id);
//       return parseFloat(ethers.utils.formatUnits(amount, 18));
//     } catch (error) {
//       throw new BadRequestException(`Failed to get total claimable amount: ${error.message}`);
//     }
//   }

//   // Register company (internal method)
//   private async registerCompanyIfNeeded(companyId: string, walletAddress: string): Promise<void> {
//     try {
//       const existingCompany = await this.contract.getCompanyByWallet(walletAddress);
//       if (!existingCompany) {
//         const tx = await this.contract.registerCompany(companyId, walletAddress);
//         await tx.wait();
//       }
//     } catch (error) {
//       // Company might already be registered, continue
//       console.log('Company registration check:', error.message);
//     }
//   }

//   // Approve ITC (Admin function)
//   async approveITC(approveDto: ApproveITCDto): Promise<any> {
//     try {
//       const tx = await this.contract.approveITC(approveDto.invoiceNumber);
//       const receipt = await tx.wait();

//       return {
//         success: true,
//         transactionHash: receipt.hash,
//         message: 'ITC approved successfully'
//       };
//     } catch (error) {
//       throw new BadRequestException(`Failed to approve ITC: ${error.message}`);
//     }
//   }

//   // Reject ITC (Admin function)
//   async rejectITC(rejectDto: RejectITCDto): Promise<any> {
//     try {
//       const tx = await this.contract.rejectITC(rejectDto.invoiceNumber, rejectDto.reason);
//       const receipt = await tx.wait();

//       return {
//         success: true,
//         transactionHash: receipt.hash,
//         message: 'ITC rejected successfully'
//       };
//     } catch (error) {
//       throw new BadRequestException(`Failed to reject ITC: ${error.message}`);
//     }
//   }
// }



import { Injectable, BadRequestException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ethers } from 'ethers';
import { Invoice } from 'src/invoice/entities/invoice.entity';
import {
  CreateITCRecordDto,
  ClaimITCDto,
  BulkClaimITCDto,
  ApproveITCDto,
  RejectITCDto,
  ITCSummary,
  ITCRecord
} from './dto/itc.dto';

@Injectable()
export class ITCService {
  private contract: ethers.Contract;
  private provider: ethers.providers.JsonRpcProvider;
  private wallet: ethers.Wallet;

  constructor(
    @InjectRepository(Invoice)
    private invoiceRepository: Repository<Invoice>,
  ) {
    this.provider = new ethers.providers.JsonRpcProvider(process.env.PROVIDER_URL);
    const privateKey = process.env.PRIVATE_KEY || (() => { throw new Error('PRIVATE_KEY environment variable is not defined'); })();
    this.wallet = new ethers.Wallet(privateKey, this.provider);
    
    const contractABI = [
        {
            "anonymous": false,
            "inputs": [
                {
                    "indexed": false,
                    "internalType": "string",
                    "name": "companyId",
                    "type": "string"
                },
                {
                    "indexed": false,
                    "internalType": "address",
                    "name": "walletAddress",
                    "type": "address"
                }
            ],
            "name": "CompanyRegistered",
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
                    "indexed": true,
                    "internalType": "string",
                    "name": "companyId",
                    "type": "string"
                },
                {
                    "indexed": false,
                    "internalType": "string",
                    "name": "invoiceNumber",
                    "type": "string"
                },
                {
                    "indexed": false,
                    "internalType": "uint256",
                    "name": "claimableAmount",
                    "type": "uint256"
                }
            ],
            "name": "ITCApproved",
            "type": "event"
        },
        {
            "anonymous": false,
            "inputs": [
                {
                    "indexed": true,
                    "internalType": "string",
                    "name": "companyId",
                    "type": "string"
                },
                {
                    "indexed": false,
                    "internalType": "string",
                    "name": "invoiceNumber",
                    "type": "string"
                },
                {
                    "indexed": false,
                    "internalType": "uint256",
                    "name": "amount",
                    "type": "uint256"
                },
                {
                    "indexed": false,
                    "internalType": "address",
                    "name": "claimedBy",
                    "type": "address"
                }
            ],
            "name": "ITCClaimed",
            "type": "event"
        },
        {
            "anonymous": false,
            "inputs": [
                {
                    "indexed": true,
                    "internalType": "string",
                    "name": "companyId",
                    "type": "string"
                },
                {
                    "indexed": false,
                    "internalType": "string",
                    "name": "invoiceNumber",
                    "type": "string"
                },
                {
                    "indexed": false,
                    "internalType": "uint256",
                    "name": "inputGST",
                    "type": "uint256"
                },
                {
                    "indexed": false,
                    "internalType": "uint256",
                    "name": "outputGST",
                    "type": "uint256"
                }
            ],
            "name": "ITCRecordCreated",
            "type": "event"
        },
        {
            "anonymous": false,
            "inputs": [
                {
                    "indexed": true,
                    "internalType": "string",
                    "name": "companyId",
                    "type": "string"
                },
                {
                    "indexed": false,
                    "internalType": "string",
                    "name": "invoiceNumber",
                    "type": "string"
                },
                {
                    "indexed": false,
                    "internalType": "string",
                    "name": "reason",
                    "type": "string"
                }
            ],
            "name": "ITCRejected",
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
                    "internalType": "uint256",
                    "name": "",
                    "type": "uint256"
                }
            ],
            "name": "allCompanies",
            "outputs": [
                {
                    "internalType": "string",
                    "name": "",
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
                    "name": "_invoiceNumber",
                    "type": "string"
                }
            ],
            "name": "approveITC",
            "outputs": [],
            "stateMutability": "nonpayable",
            "type": "function"
        },
        {
            "inputs": [
                {
                    "internalType": "string[]",
                    "name": "_invoiceNumbers",
                    "type": "string[]"
                }
            ],
            "name": "bulkClaimITC",
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
                },
                {
                    "internalType": "uint256",
                    "name": "",
                    "type": "uint256"
                }
            ],
            "name": "companyInvoices",
            "outputs": [
                {
                    "internalType": "string",
                    "name": "",
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
                    "name": "",
                    "type": "string"
                }
            ],
            "name": "companySummary",
            "outputs": [
                {
                    "internalType": "uint256",
                    "name": "totalInputGST",
                    "type": "uint256"
                },
                {
                    "internalType": "uint256",
                    "name": "totalOutputGST",
                    "type": "uint256"
                },
                {
                    "internalType": "uint256",
                    "name": "totalClaimableITC",
                    "type": "uint256"
                },
                {
                    "internalType": "uint256",
                    "name": "totalClaimedITC",
                    "type": "uint256"
                },
                {
                    "internalType": "uint256",
                    "name": "pendingITC",
                    "type": "uint256"
                },
                {
                    "internalType": "uint256",
                    "name": "recordCount",
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
                    "name": "_invoiceNumber",
                    "type": "string"
                },
                {
                    "internalType": "string",
                    "name": "_companyId",
                    "type": "string"
                },
                {
                    "internalType": "address",
                    "name": "_companyWallet",
                    "type": "address"
                },
                {
                    "internalType": "uint256",
                    "name": "_inputGST",
                    "type": "uint256"
                },
                {
                    "internalType": "uint256",
                    "name": "_outputGST",
                    "type": "uint256"
                },
                {
                    "internalType": "bool",
                    "name": "_isApproved",
                    "type": "bool"
                }
            ],
            "name": "createITCRecord",
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
            "name": "getAllCompanies",
            "outputs": [
                {
                    "internalType": "string[]",
                    "name": "",
                    "type": "string[]"
                }
            ],
            "stateMutability": "view",
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
                    "name": "_companyId",
                    "type": "string"
                }
            ],
            "name": "getClaimableITCs",
            "outputs": [
                {
                    "internalType": "string[]",
                    "name": "",
                    "type": "string[]"
                }
            ],
            "stateMutability": "view",
            "type": "function"
        },
        {
            "inputs": [
                {
                    "internalType": "address",
                    "name": "_wallet",
                    "type": "address"
                }
            ],
            "name": "getCompanyByWallet",
            "outputs": [
                {
                    "internalType": "string",
                    "name": "",
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
                    "name": "_companyId",
                    "type": "string"
                }
            ],
            "name": "getCompanyInvoices",
            "outputs": [
                {
                    "internalType": "string[]",
                    "name": "",
                    "type": "string[]"
                }
            ],
            "stateMutability": "view",
            "type": "function"
        },
        {
            "inputs": [
                {
                    "internalType": "string",
                    "name": "_companyId",
                    "type": "string"
                }
            ],
            "name": "getCompanySummary",
            "outputs": [
                {
                    "components": [
                        {
                            "internalType": "uint256",
                            "name": "totalInputGST",
                            "type": "uint256"
                        },
                        {
                            "internalType": "uint256",
                            "name": "totalOutputGST",
                            "type": "uint256"
                        },
                        {
                            "internalType": "uint256",
                            "name": "totalClaimableITC",
                            "type": "uint256"
                        },
                        {
                            "internalType": "uint256",
                            "name": "totalClaimedITC",
                            "type": "uint256"
                        },
                        {
                            "internalType": "uint256",
                            "name": "pendingITC",
                            "type": "uint256"
                        },
                        {
                            "internalType": "uint256",
                            "name": "recordCount",
                            "type": "uint256"
                        }
                    ],
                    "internalType": "struct Company.ITCSummary",
                    "name": "",
                    "type": "tuple"
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
            "name": "getITCRecord",
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
                    "internalType": "struct Company.ITCRecord",
                    "name": "",
                    "type": "tuple"
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
                    "name": "_companyId",
                    "type": "string"
                }
            ],
            "name": "getTotalClaimableAmount",
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
                    "name": "",
                    "type": "string"
                }
            ],
            "name": "itcRecords",
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
            "inputs": [
                {
                    "internalType": "string",
                    "name": "_companyId",
                    "type": "string"
                },
                {
                    "internalType": "address",
                    "name": "_walletAddress",
                    "type": "address"
                }
            ],
            "name": "registerCompany",
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
                    "name": "_reason",
                    "type": "string"
                }
            ],
            "name": "rejectITC",
            "outputs": [],
            "stateMutability": "nonpayable",
            "type": "function"
        },
        {
            "inputs": [],
            "name": "totalITCClaims",
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
                    "name": "_status",
                    "type": "string"
                }
            ],
            "name": "updateRecordStatus",
            "outputs": [],
            "stateMutability": "nonpayable",
            "type": "function"
        },
        {
            "inputs": [
                {
                    "internalType": "address",
                    "name": "",
                    "type": "address"
                }
            ],
            "name": "walletToCompany",
            "outputs": [
                {
                    "internalType": "string",
                    "name": "",
                    "type": "string"
                }
            ],
            "stateMutability": "view",
            "type": "function"
        }
    ];
    
    this.contract = new ethers.Contract(
      process.env.INVOICE_CONTRACT_ADDRESS || (() => { throw new Error('INVOICE_CONTRACT_ADDRESS environment variable is not defined'); })(),
      contractABI,
      this.wallet
    );
  }

  // Helper method to check invoice approval status in database
  private async checkInvoiceApproval(invoiceNumber: string): Promise<boolean> {
    const invoice = await this.invoiceRepository.findOne({ 
      where: { invoiceNo: invoiceNumber },
      order: { invoiceNo: 'ASC'},
      select: ['status'] 
    });

    if (!invoice) {
      throw new BadRequestException(`Invoice ${invoiceNumber} not found in database`);
    }

    return invoice.status === 'approved';
  }

  // Register company if not already registered
  private async registerCompanyIfNeeded(companyId: string, walletAddress: string): Promise<void> {
    try {
      const existingCompany = await this.contract.getCompanyByWallet(walletAddress);
      if (!existingCompany) {
        const tx = await this.contract.registerCompany(companyId, walletAddress);
        await tx.wait();
      }
    } catch (error) {
      console.error('Company registration check:', error.message);
      throw new BadRequestException('Failed to register company');
    }
  }

  // Calculate ITC from invoice data
  async calculateITCFromInvoice(invoiceData: any): Promise<{ inputGST: number; outputGST: number; netITC: number }> {
    let inputGST = 0;
    let outputGST = 0;

    // Only process approved invoices
    if (invoiceData.status !== 'approved') {
      throw new BadRequestException('Only approved invoices can be used for ITC calculation');
    }

    // Calculate GST from invoice items
    if (invoiceData.items && invoiceData.items.length > 0) {
      for (const item of invoiceData.items) {
        const itemGST = (item.unitPrice * item.quantity * item.gstRate) / 100;
        
        if (invoiceData.supplyType === 'purchase' || invoiceData.supplyType === 'input') {
          inputGST += itemGST;
        } else {
          outputGST += itemGST;
        }
      }
    }

    const netITC = inputGST > outputGST ? inputGST - outputGST : 0;

    return {
      inputGST: Math.round(inputGST * 100) / 100,
      outputGST: Math.round(outputGST * 100) / 100,
      netITC: Math.round(netITC * 100) / 100
    };
  }

  // Process invoice for ITC calculation
  async processInvoiceForITC(invoiceData: any, userToken: any): Promise<any> {
    try {
      const isApproved = await this.checkInvoiceApproval(invoiceData.invoiceNo);
      if (!isApproved) {
        throw new BadRequestException('Only approved invoices can be processed for ITC');
      }

      const { inputGST, outputGST, netITC } = await this.calculateITCFromInvoice(invoiceData);

      const createITCDto: CreateITCRecordDto = {
        invoiceNumber: invoiceData.invoiceNo,
        companyId: userToken.tenant_id,
        companyWallet: userToken.walletAddress,
        inputGST,
        outputGST,
        isApproved: false
      };

      return await this.createITCRecord(createITCDto, userToken);
    } catch (error) {
      throw new BadRequestException(`Failed to process invoice for ITC: ${error.message}`);
    }
  }

  // Create ITC record
  async createITCRecord(createITCDto: CreateITCRecordDto, userToken: any): Promise<any> {
    try {
      if (userToken.role !== 'company') {
        throw new UnauthorizedException('Only companies can create ITC records');
      }

      const isApproved = await this.checkInvoiceApproval(createITCDto.invoiceNumber);
      if (!isApproved) {
        throw new BadRequestException('Cannot create ITC record for unapproved invoice');
      }

      await this.registerCompanyIfNeeded(userToken.tenant_id, userToken.walletAddress);

      const tx = await this.contract.createITCRecord(
        createITCDto.invoiceNumber,
        userToken.tenant_id,
        userToken.walletAddress,
        ethers.utils.parseUnits(createITCDto.inputGST.toString(), 18),
        ethers.utils.parseUnits(createITCDto.outputGST.toString(), 18)
      );

      const receipt = await tx.wait();
      
      return {
        success: true,
        transactionHash: receipt.hash,
        message: 'ITC record created successfully'
      };
    } catch (error) {
      throw new BadRequestException(`Failed to create ITC record: ${error.message}`);
    }
  }

  // Claim ITC
  async claimITC(claimITCDto: ClaimITCDto, userToken: any): Promise<any> {
    try {
      if (userToken.role !== 'company') {
        throw new UnauthorizedException('Only companies can claim ITC');
      }

      const isApproved = await this.checkInvoiceApproval(claimITCDto.invoiceNumber);
      if (!isApproved) {
        throw new BadRequestException('Cannot claim ITC for unapproved invoice');
      }

      const tx = await this.contract.claimITC(claimITCDto.invoiceNumber);
      const receipt = await tx.wait();

      return {
        success: true,
        transactionHash: receipt.hash,
        message: 'ITC claimed successfully'
      };
    } catch (error) {
      throw new BadRequestException(`Failed to claim ITC: ${error.message}`);
    }
  }

  // Bulk claim ITC
  async bulkClaimITC(bulkClaimDto: BulkClaimITCDto, userToken: any): Promise<any> {
    try {
      if (userToken.role !== 'company') {
        throw new UnauthorizedException('Only companies can claim ITC');
      }

      for (const invoiceNumber of bulkClaimDto.invoiceNumbers) {
        const isApproved = await this.checkInvoiceApproval(invoiceNumber);
        if (!isApproved) {
          throw new BadRequestException(`Invoice ${invoiceNumber} is not approved`);
        }
      }

      const tx = await this.contract.bulkClaimITC(bulkClaimDto.invoiceNumbers);
      const receipt = await tx.wait();

      return {
        success: true,
        transactionHash: receipt.hash,
        message: `Bulk ITC claim processed for ${bulkClaimDto.invoiceNumbers.length} invoices`
      };
    } catch (error) {
      throw new BadRequestException(`Failed to bulk claim ITC: ${error.message}`);
    }
  }

  // Get company ITC summary
  async getCompanySummary(userToken: any): Promise<ITCSummary> {
    try {
      const summary = await this.contract.getCompanySummary(userToken.tenant_id);
      
      return {
        totalInputGST: parseFloat(ethers.utils.formatUnits(summary.totalInputGST, 18)),
        totalOutputGST: parseFloat(ethers.utils.formatUnits(summary.totalOutputGST, 18)),
        totalClaimableITC: parseFloat(ethers.utils.formatUnits(summary.totalClaimableITC, 18)),
        totalClaimedITC: parseFloat(ethers.utils.formatUnits(summary.totalClaimedITC, 18)),
        pendingITC: parseFloat(ethers.utils.formatUnits(summary.pendingITC, 18)),
        recordCount: summary.recordCount.toNumber()
      };
    } catch (error) {
      throw new BadRequestException(`Failed to get company summary: ${error.message}`);
    }
  }

  // Get claimable ITCs
  async getClaimableITCs(userToken: any): Promise<string[]> {
    try {
      return await this.contract.getClaimableITCs(userToken.tenant_id);
    } catch (error) {
      throw new BadRequestException(`Failed to get claimable ITCs: ${error.message}`);
    }
  }

  // Get ITC record
  async getITCRecord(invoiceNumber: string, userToken: any): Promise<ITCRecord> {
    try {
      await this.checkInvoiceApproval(invoiceNumber);

      const record = await this.contract.getITCRecord(invoiceNumber);
      
      if (record.companyId !== userToken.tenant_id) {
        throw new UnauthorizedException('Access denied to this ITC record');
      }

      return {
        invoiceNumber: record.invoiceNumber,
        companyId: record.companyId,
        companyWallet: record.companyWallet,
        inputGST: parseFloat(ethers.utils.formatUnits(record.inputGST, 18)),
        outputGST: parseFloat(ethers.utils.formatUnits(record.outputGST, 18)),
        netITC: parseFloat(ethers.utils.formatUnits(record.netITC, 18)),
        claimableAmount: parseFloat(ethers.utils.formatUnits(record.claimableAmount, 18)),
        claimedAmount: parseFloat(ethers.utils.formatUnits(record.claimedAmount, 18)),
        timestamp: record.timestamp.toNumber(),
        isApproved: record.isApproved,
        isClaimed: record.isClaimed,
        status: record.status
      };
    } catch (error) {
      throw new BadRequestException(`Failed to get ITC record: ${error.message}`);
    }
  }

  // Get total claimable amount for company
  async getTotalClaimableAmount(userToken: any): Promise<number> {
    try {
      const amount = await this.contract.getTotalClaimableAmount(userToken.tenant_id);
      return parseFloat(ethers.utils.formatUnits(amount, 18));
    } catch (error) {
      throw new BadRequestException(`Failed to get total claimable amount: ${error.message}`);
    }
  }

  // Approve ITC (Admin only)
  async approveITC(approveDto: ApproveITCDto): Promise<any> {
    try {
      const isApproved = await this.checkInvoiceApproval(approveDto.invoiceNumber);
      if (!isApproved) {
        throw new BadRequestException('Cannot approve ITC for unapproved invoice');
      }

      const tx = await this.contract.approveITC(approveDto.invoiceNumber);
      const receipt = await tx.wait();

      return {
        success: true,
        transactionHash: receipt.hash,
        message: 'ITC approved successfully'
      };
    } catch (error) {
      throw new BadRequestException(`Failed to approve ITC: ${error.message}`);
    }
  }

  // Reject ITC (Admin function)
  async rejectITC(rejectDto: RejectITCDto): Promise<any> {
    try {
      const tx = await this.contract.rejectITC(rejectDto.invoiceNumber, rejectDto.reason);
      const receipt = await tx.wait();

      return {
        success: true,
        transactionHash: receipt.hash,
        message: 'ITC rejected successfully'
      };
    } catch (error) {
      throw new BadRequestException(`Failed to reject ITC: ${error.message}`);
    }
  }
}