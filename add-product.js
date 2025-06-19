import Web3 from 'web3';

// ==== Replace with your actual values ====
const providerURL = 'https://sepolia.infura.io/v3/eadd0f87d61c43a5a67587f4c83156a1'; // Or Alchemy, etc.
const contractAddress = '0x95cED938F7991cd0dFcb48F0a06a40FA1aF46EBC';
const privateKey = '0x85007bbab10feafda61c2771f47c51e2062f99ecc4489b9205dc47c92518e5e8'; // must start with 0x
const accountAddress = '0x8dDf7814F14035aa34e867E6BB040CfDA1D3B4Ac';

const contractABI = [
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
];

const web3 = new Web3(new Web3.providers.HttpProvider(providerURL));
const contract = new web3.eth.Contract(contractABI, contractAddress);

// === Product details ===
const productID = 123;
const productName = 'T-Shirt';
const price = 1500; // In smallest units (e.g., paise)

async function addProduct() {
  try {
    const tx = contract.methods.addProduct(productID, productName, price);
    const gas = await tx.estimateGas({ from: accountAddress });

    const data = tx.encodeABI();
    const txData = {
      from: accountAddress,
      to: contractAddress,
      gas,
      data,
    };

    const signedTx = await web3.eth.accounts.signTransaction(txData, privateKey);
    const receipt = await web3.eth.sendSignedTransaction(signedTx.rawTransaction);

    console.log('✅ Transaction successful!');
    console.log('Transaction Hash:', receipt.transactionHash);
  } catch (error) {
    console.error('❌ Error while adding product:', error.message);
  }
}

addProduct();
