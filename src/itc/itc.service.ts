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

  constructor(
    @InjectRepository(Invoice) private invoiceRepo: Repository<Invoice>,
    @InjectRepository(ItcClaim) private itcClaimRepo: Repository<ItcClaim>, // DB entity
  ) {
    this.web3 = new Web3(process.env.RPC_URL);
    this.contract = new this.web3.eth.Contract(
      [
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
      ],
      process.env.INVOICE_CONTRACT_ADDRESS,
    );
  }

  async claimForCompany(user: any) {
    const { tenant_id, walletAddress } = user;

    const inputInvoices = await this.invoiceRepo.find({
      where: {
        buyer: { id: tenant_id },
        status: 'approved',
      },
      relations: ['buyer'],
    });

    const outputInvoices = await this.invoiceRepo.find({
      where: {
        seller: { tenantId: tenant_id },
        status: 'approved',
      },
    });

    const totalOutputGST = outputInvoices.reduce((acc, inv) => acc + Number(inv.totalGstAmount), 0);
    const claims: ItcClaim[] = [];

    for (const invoice of inputInvoices) {
      const inputGST = Number(invoice.totalGstAmount);
      const claimable = Math.min(inputGST, totalOutputGST);

      const tx = await this.contract.methods
        .claimITC(invoice.invoiceNo, tenant_id, inputGST, totalOutputGST)
        .send({ from: walletAddress });

      const savedClaim = this.itcClaimRepo.create({
        invoiceId: invoice.invoiceId,
        companyId: tenant_id,
        companyWallet: walletAddress,
        inputGst: inputGST,
        outputGst: totalOutputGST,
        claimableAmount: claimable,
        transactionHash: tx.transactionHash,
        claimedAt: new Date(),
      });

      await this.itcClaimRepo.save(savedClaim);
      claims.push(savedClaim);
    }

    return { message: 'ITC claims processed successfully', claims };
  }

  async getSummaryForCompany(user: any) {
    const { tenant_id } = user;

    const claims = await this.itcClaimRepo.find({
      where: { companyId: tenant_id },
    });

    const totalInputGST = claims.reduce((sum, c) => sum + Number(c.inputGst), 0);
    const totalOutputGST = claims.reduce((sum, c) => sum + Number(c.outputGst), 0);
    const totalClaimable = claims.reduce((sum, c) => sum + Number(c.claimableAmount), 0);
    const netITC = totalInputGST > totalOutputGST ? totalInputGST - totalOutputGST : 0;

    return {
      companyId: tenant_id,
      totalInputGST,
      totalOutputGST,
      totalClaimable,
      netITC,
      claimCount: claims.length,
      claims,
    };
  }

}
