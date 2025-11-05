export const CONTRACT_ABI = [
  {
    "inputs": [{"internalType": "address", "name": "", "type": "address"}],
    "stateMutability": "nonpayable",
    "type": "constructor"
  },
  {
    "inputs": [],
    "name": "AccessControlBadConfirmation",
    "type": "error"
  },
  {
    "inputs": [{"internalType": "address", "name": "account", "type": "address"}, {"internalType": "bytes32", "name": "neededRole", "type": "bytes32"}],
    "name": "AccessControlUnauthorizedAccount",
    "type": "error"
  },
  {
    "inputs": [{"internalType": "string", "name": "", "type": "string"}],
    "name": "AlreadyExists",
    "type": "error"
  },
  {
    "inputs": [],
    "name": "AlreadyRegistered",
    "type": "error"
  },
  {
    "inputs": [],
    "name": "InvalidAddress",
    "type": "error"
  },
  {
    "inputs": [],
    "name": "InvalidGST",
    "type": "error"
  },
  {
    "inputs": [{"internalType": "string", "name": "field", "type": "string"}],
    "name": "InvalidInput",
    "type": "error"
  },
  {
    "inputs": [{"internalType": "string", "name": "resource", "type": "string"}],
    "name": "NotFound",
    "type": "error"
  },
  {
    "inputs": [],
    "name": "ReentrancyGuardReentrantCall",
    "type": "error"
  },
  {
    "anonymous": false,
    "inputs": [
      {"indexed": true, "internalType": "uint256", "name": "companyId", "type": "uint256"},
      {"indexed": false, "internalType": "string", "name": "companyName", "type": "string"},
      {"indexed": false, "internalType": "string", "name": "gstNumber", "type": "string"},
      {"indexed": true, "internalType": "address", "name": "legalRepresentative", "type": "address"},
      {"indexed": false, "internalType": "uint256", "name": "registeredAt", "type": "uint256"}
    ],
    "name": "CompanyAdded",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {"indexed": true, "internalType": "uint256", "name": "companyId", "type": "uint256"},
      {"indexed": true, "internalType": "address", "name": "legalRepresentative", "type": "address"},
      {"indexed": false, "internalType": "uint256", "name": "deletedAt", "type": "uint256"}
    ],
    "name": "CompanyDeleted",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {"indexed": true, "internalType": "uint256", "name": "companyId", "type": "uint256"},
      {"indexed": false, "internalType": "string", "name": "companyName", "type": "string"},
      {"indexed": false, "internalType": "string", "name": "gstNumber", "type": "string"},
      {"indexed": true, "internalType": "address", "name": "legalRepresentative", "type": "address"},
      {"indexed": false, "internalType": "uint256", "name": "updatedAt", "type": "uint256"}
    ],
    "name": "CompanyUpdated",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {"indexed": true, "internalType": "uint256", "name": "customerId", "type": "uint256"},
      {"indexed": true, "internalType": "address", "name": "wallet", "type": "address"},
      {"indexed": false, "internalType": "string", "name": "name", "type": "string"},
      {"indexed": false, "internalType": "string", "name": "gstNumber", "type": "string"},
      {"indexed": true, "internalType": "address", "name": "addedBy", "type": "address"}
    ],
    "name": "CustomerAdded",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {"indexed": true, "internalType": "uint256", "name": "customerId", "type": "uint256"},
      {"indexed": true, "internalType": "address", "name": "wallet", "type": "address"},
      {"indexed": true, "internalType": "address", "name": "deletedBy", "type": "address"}
    ],
    "name": "CustomerDeleted",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {"indexed": true, "internalType": "uint256", "name": "customerId", "type": "uint256"},
      {"indexed": true, "internalType": "address", "name": "wallet", "type": "address"},
      {"indexed": false, "internalType": "string", "name": "name", "type": "string"},
      {"indexed": false, "internalType": "string", "name": "gstNumber", "type": "string"}
    ],
    "name": "CustomerUpdated",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {"indexed": false, "internalType": "string", "name": "invoiceNumber", "type": "string"},
      {"indexed": true, "internalType": "address", "name": "claimant", "type": "address"},
      {"indexed": false, "internalType": "uint256", "name": "gstAmount", "type": "uint256"},
      {"indexed": false, "internalType": "uint256", "name": "claimedAt", "type": "uint256"}
    ],
    "name": "GSTClaimed",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {"indexed": false, "internalType": "string", "name": "invoiceNumber", "type": "string"},
      {"indexed": false, "internalType": "uint256", "name": "grandTotal", "type": "uint256"},
      {"indexed": true, "internalType": "address", "name": "createdBy", "type": "address"}
    ],
    "name": "InvoiceCreated",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {"indexed": false, "internalType": "string", "name": "invoiceNumber", "type": "string"},
      {"indexed": true, "internalType": "address", "name": "deletedBy", "type": "address"}
    ],
    "name": "InvoiceDeleted",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {"indexed": false, "internalType": "string", "name": "invoiceNumber", "type": "string"},
      {"indexed": false, "internalType": "uint256", "name": "grandTotal", "type": "uint256"},
      {"indexed": true, "internalType": "address", "name": "updatedBy", "type": "address"}
    ],
    "name": "InvoiceUpdated",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {"indexed": false, "internalType": "uint256", "name": "productID", "type": "uint256"},
      {"indexed": false, "internalType": "string", "name": "productName", "type": "string"},
      {"indexed": false, "internalType": "uint256", "name": "basePrice", "type": "uint256"},
      {"indexed": false, "internalType": "uint256", "name": "gstRate", "type": "uint256"},
      {"indexed": false, "internalType": "uint256", "name": "finalPrice", "type": "uint256"},
      {"indexed": true, "internalType": "address", "name": "createdBy", "type": "address"}
    ],
    "name": "ProductAdded",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {"indexed": false, "internalType": "uint256", "name": "productID", "type": "uint256"},
      {"indexed": true, "internalType": "address", "name": "deletedBy", "type": "address"}
    ],
    "name": "ProductDeleted",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {"indexed": false, "internalType": "uint256", "name": "productID", "type": "uint256"},
      {"indexed": false, "internalType": "string", "name": "productName", "type": "string"},
      {"indexed": false, "internalType": "uint256", "name": "basePrice", "type": "uint256"},
      {"indexed": false, "internalType": "uint256", "name": "gstRate", "type": "uint256"},
      {"indexed": false, "internalType": "uint256", "name": "finalPrice", "type": "uint256"},
      {"indexed": true, "internalType": "address", "name": "updatedBy", "type": "address"}
    ],
    "name": "ProductUpdated",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {"indexed": true, "internalType": "bytes32", "name": "role", "type": "bytes32"},
      {"indexed": true, "internalType": "bytes32", "name": "previousAdminRole", "type": "bytes32"},
      {"indexed": true, "internalType": "bytes32", "name": "previousAdminRole", "type": "bytes32"},
      {"indexed": true, "internalType": "bytes32", "name": "newAdminRole", "type": "bytes32"}
    ],
    "name": "RoleAdminChanged",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {"indexed": true, "internalType": "bytes32", "name": "role", "type": "bytes32"},
      {"indexed": true, "internalType": "address", "name": "account", "type": "address"},
      {"indexed": true, "internalType": "address", "name": "sender", "type": "address"}
    ],
    "name": "RoleGranted",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {"indexed": true, "internalType": "bytes32", "name": "role", "type": "bytes32"},
      {"indexed": true, "internalType": "address", "name": "account", "type": "address"},
      {"indexed": true, "internalType": "address", "name": "sender", "type": "address"}
    ],
    "name": "RoleRevoked",
    "type": "event"
  },
  {
    "inputs": [],
    "name": "COMPANY_ROLE",
    "outputs": [{"internalType": "bytes32", "name": "", "type": "bytes32"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "DEFAULT_ADMIN_ROLE",
    "outputs": [{"internalType": "bytes32", "name": "", "type": "bytes32"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {"internalType": "string", "name": "companyName", "type": "string"},
      {"internalType": "string", "name": "gstNumber", "type": "string"},
      {"internalType": "address", "name": "legalRepresentative", "type": "address"}
    ],
    "name": "addCompany",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {"internalType": "address", "name": "_wallet", "type": "address"},
      {"internalType": "string", "name": "_name", "type": "string"},
      {"internalType": "string", "name": "_gstNumber", "type": "string"}
    ],
    "name": "addCustomer",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {"internalType": "string", "name": "_name", "type": "string"},
      {"internalType": "uint256", "name": "_basePrice", "type": "uint256"},
      {"internalType": "uint256", "name": "_gstRate", "type": "uint256"}
    ],
    "name": "addProduct",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {"internalType": "uint256", "name": "basePrice", "type": "uint256"},
      {"internalType": "uint256", "name": "gstRate", "type": "uint256"}
    ],
    "name": "calculateGST",
    "outputs": [{"internalType": "uint256", "name": "finalPrice", "type": "uint256"}],
    "stateMutability": "pure",
    "type": "function"
  },
  {
    "inputs": [
      {"internalType": "string", "name": "_invoiceNumber", "type": "string"},
      {"internalType": "uint256", "name": "_gstAmount", "type": "uint256"}
    ],
    "name": "claimGST",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "address", "name": "", "type": "address"}],
    "name": "companies",
    "outputs": [
      {"internalType": "uint256", "name": "companyId", "type": "uint256"},
      {"internalType": "string", "name": "companyName", "type": "string"},
      {"internalType": "string", "name": "gstNumber", "type": "string"},
      {"internalType": "address", "name": "legalRepresentative", "type": "address"},
      {"internalType": "uint256", "name": "registeredAt", "type": "uint256"}
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "name": "companyIdToWallet",
    "outputs": [{"internalType": "address", "name": "", "type": "address"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {"internalType": "string", "name": "_invoiceNumber", "type": "string"},
      {"internalType": "uint256", "name": "_grandTotal", "type": "uint256"}
    ],
    "name": "createInvoice",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "name": "customerIdToWallet",
    "outputs": [{"internalType": "address", "name": "", "type": "address"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "address", "name": "", "type": "address"}],
    "name": "customers",
    "outputs": [
      {"internalType": "uint256", "name": "customerId", "type": "uint256"},
      {"internalType": "address", "name": "wallet", "type": "address"},
      {"internalType": "string", "name": "name", "type": "string"},
      {"internalType": "string", "name": "gstNumber", "type": "string"},
      {"internalType": "uint256", "name": "registeredAt", "type": "uint256"}
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "address", "name": "_wallet", "type": "address"}],
    "name": "deleteCompany",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "uint256", "name": "_customerId", "type": "uint256"}],
    "name": "deleteCustomer",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "string", "name": "_invoiceNumber", "type": "string"}],
    "name": "deleteInvoice",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "uint256", "name": "_id", "type": "uint256"}],
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
        "components": [
          {"internalType": "uint256", "name": "companyId", "type": "uint256"},
          {"internalType": "string", "name": "companyName", "type": "string"},
          {"internalType": "string", "name": "gstNumber", "type": "string"},
          {"internalType": "address", "name": "legalRepresentative", "type": "address"},
          {"internalType": "uint256", "name": "registeredAt", "type": "uint256"}
        ],
        "internalType": "struct Company.companyInfo[]",
        "name": "",
        "type": "tuple[]"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getAllCustomers",
    "outputs": [
      {
        "components": [
          {"internalType": "uint256", "name": "customerId", "type": "uint256"},
          {"internalType": "address", "name": "wallet", "type": "address"},
          {"internalType": "string", "name": "name", "type": "string"},
          {"internalType": "string", "name": "gstNumber", "type": "string"},
          {"internalType": "uint256", "name": "registeredAt", "type": "uint256"}
        ],
        "internalType": "struct Company.Customer[]",
        "name": "",
        "type": "tuple[]"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getAllGSTClaims",
    "outputs": [
      {
        "components": [
          {"internalType": "string", "name": "invoiceNumber", "type": "string"},
          {"internalType": "address", "name": "claimant", "type": "address"},
          {"internalType": "uint256", "name": "gstAmount", "type": "uint256"},
          {"internalType": "uint256", "name": "claimedAt", "type": "uint256"},
          {"internalType": "bool", "name": "claimed", "type": "bool"}
        ],
        "internalType": "struct Company.GSTClaimRecord[]",
        "name": "",
        "type": "tuple[]"
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
          {"internalType": "string", "name": "invoiceNumber", "type": "string"},
          {"internalType": "uint256", "name": "grandTotal", "type": "uint256"},
          {"internalType": "address", "name": "createdBy", "type": "address"}
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
    "inputs": [],
    "name": "getAllProducts",
    "outputs": [
      {
        "components": [
          {"internalType": "uint256", "name": "productID", "type": "uint256"},
          {"internalType": "string", "name": "productName", "type": "string"},
          {"internalType": "uint256", "name": "basePrice", "type": "uint256"},
          {"internalType": "uint256", "name": "gstRate", "type": "uint256"},
          {"internalType": "uint256", "name": "finalPrice", "type": "uint256"}
        ],
        "internalType": "struct Company.Product[]",
        "name": "",
        "type": "tuple[]"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "address", "name": "companyWallet", "type": "address"}],
    "name": "getCompanyGSTClaims",
    "outputs": [
      {
        "components": [
          {"internalType": "string", "name": "invoiceNumber", "type": "string"},
          {"internalType": "address", "name": "claimant", "type": "address"},
          {"internalType": "uint256", "name": "gstAmount", "type": "uint256"},
          {"internalType": "uint256", "name": "claimedAt", "type": "uint256"},
          {"internalType": "bool", "name": "claimed", "type": "bool"}
        ],
        "internalType": "struct Company.GSTClaimRecord[]",
        "name": "",
        "type": "tuple[]"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "bytes32", "name": "role", "type": "bytes32"}],
    "name": "getRoleAdmin",
    "outputs": [{"internalType": "bytes32", "name": "", "type": "bytes32"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {"internalType": "bytes32", "name": "role", "type": "bytes32"},
      {"internalType": "address", "name": "account", "type": "address"}
    ],
    "name": "grantRole",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "string", "name": "", "type": "string"}],
    "name": "gstClaims",
    "outputs": [
      {"internalType": "string", "name": "invoiceNumber", "type": "string"},
      {"internalType": "address", "name": "claimant", "type": "address"},
      {"internalType": "uint256", "name": "gstAmount", "type": "uint256"},
      {"internalType": "uint256", "name": "claimedAt", "type": "uint256"},
      {"internalType": "bool", "name": "claimed", "type": "bool"}
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {"internalType": "bytes32", "name": "role", "type": "bytes32"},
      {"internalType": "address", "name": "account", "type": "address"}
    ],
    "name": "hasRole",
    "outputs": [{"internalType": "bool", "name": "", "type": "bool"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "string", "name": "", "type": "string"}],
    "name": "invoices",
    "outputs": [
      {"internalType": "string", "name": "invoiceNumber", "type": "string"},
      {"internalType": "uint256", "name": "grandTotal", "type": "uint256"},
      {"internalType": "address", "name": "createdBy", "type": "address"}
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "name": "products",
    "outputs": [
      {"internalType": "uint256", "name": "productID", "type": "uint256"},
      {"internalType": "string", "name": "productName", "type": "string"},
      {"internalType": "uint256", "name": "basePrice", "type": "uint256"},
      {"internalType": "uint256", "name": "gstRate", "type": "uint256"},
      {"internalType": "uint256", "name": "finalPrice", "type": "uint256"}
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {"internalType": "bytes32", "name": "role", "type": "bytes32"},
      {"internalType": "address", "name": "account", "type": "address"}
    ],
    "name": "renounceRole",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {"internalType": "bytes32", "name": "role", "type": "bytes32"},
      {"internalType": "address", "name": "account", "type": "address"}
    ],
    "name": "revokeRole",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "bytes4", "name": "interfaceId", "type": "bytes4"}],
    "name": "supportsInterface",
    "outputs": [{"internalType": "bool", "name": "", "type": "bool"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "totalCompanies",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "totalCustomers",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "totalInvoices",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "totalProducts",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {"internalType": "address", "name": "_wallet", "type": "address"},
      {"internalType": "string", "name": "_newName", "type": "string"},
      {"internalType": "string", "name": "_newGSTNumber", "type": "string"}
    ],
    "name": "updateCompany",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {"internalType": "uint256", "name": "_customerId", "type": "uint256"},
      {"internalType": "address", "name": "_newWallet", "type": "address"},
      {"internalType": "string", "name": "_newName", "type": "string"},
      {"internalType": "string", "name": "_newGSTNumber", "type": "string"}
    ],
    "name": "updateCustomer",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {"internalType": "string", "name": "_invoiceNumber", "type": "string"},
      {"internalType": "uint256", "name": "_grandTotal", "type": "uint256"}
    ],
    "name": "updateInvoice",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {"internalType": "uint256", "name": "_id", "type": "uint256"},
      {"internalType": "string", "name": "_name", "type": "string"},
      {"internalType": "uint256", "name": "_basePrice", "type": "uint256"},
      {"internalType": "uint256", "name": "_gstRate", "type": "uint256"}
    ],
    "name": "updateProduct",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  }
];
