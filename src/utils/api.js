import { readFile, encodeData } from "./files";
const { Helper, getBlockByHeight } = require ('./biginthelper');
const { wsNode, fundingPassphrase } = require("../config/config.json");

const { apiClient, cryptography, transactions, Buffer } = require( '@liskhq/lisk-client');

const archiveBinarySchema = {
  $id: 'lisk/archivebinary/transaction',
  type: 'object',
  required: ["data"],
  properties: {
      data: {
          dataType: 'string',
          fieldNumber: 1
      }
  }
}

const archiveTextSchema = {
  $id: 'lisk/archivetext/transaction',
  type: 'object',
  required: ["data"],
  properties: {
      data: {
          dataType: 'string',
          fieldNumber: 1
      }
  }
}

let clientCache;

const networkIdentifier = "a5f4ae7dd207c8d9767c10ec17544ec46eacd9b351ecbdda5c6e97a0dfc5acd2";

async function getClient () { 
  if (!clientCache) {         
    clientCache = await apiClient.createWSClient(wsNode);
    console.log("created ws client");
    return clientCache;
  }

  console.log("memory ws client");
           
  return clientCache;
};

async function getAccountFromAddress (address)  {
  const client = await getClient();  
  const account = await client.invoke('app:getAccount', {
      address,      
  });
  
  return await client.account.decode(Buffer.from(account, 'hex'));
};

async function getAccountNonce (address) {  
  var account = await getAccountFromAddress(address);  
  return Number(account.sequence.nonce);
};

const getBlockByHeightWithFilter = async(options, index, resultList) => {  
  const client = await getClient();
  
  var previousBlockId;
  var current = await client.invoke('app:getBlockByID', {"id": index});
  const blockObject = await client.block.decode(Buffer.from(current, 'hex'));
  const blockJSON = await client.block.toJSON(blockObject);
  
  previousBlockId = blockJSON.header.previousBlockID;  
  
  if (blockJSON.payload && blockJSON.payload.length > 0) {
    console.log(blockJSON);
    console.log("block height with transaction(s)", index);
    for (var payloadIndex=0;payloadIndex < blockJSON.payload.length;payloadIndex++){
      if (!options){
        if (blockJSON.payload[payloadIndex].assetID !== options.type){
          continue;
        }
        console.log(blockJSON.payload[payloadIndex]);
        var address = cryptography.getAddressFromPublicKey(blockJSON.payload[payloadIndex].senderPublicKey);
        if (address !== options.id){
          continue;
        }
        console.log("including transaction in result")
        resultList.push(blockJSON.payload[payloadIndex]);
      }            
    }
  }
  
  if (blockJSON.header.height > 13800){
    console.log("recursive verification", blockJSON.header.height);
    await getBlockByHeightWithFilter(options, previousBlockId, resultList);
  }
  
  return resultList;
}

const getBlocks = async(options) => {  
  var resultList = [];
  const client = await getClient();
  const node = await client.invoke('app:getNodeInfo', {});
  var index = node.lastBlockID;
  
  const result = await getBlockByHeightWithFilter(options, index, resultList); 

  return result;
}

const sendTransaction = async(transaction) => {
  const client = await getClient();        
  const result = await client.transaction.send(transaction);

  return result;
}

async function archiveText (form) {
  var formLength = JSON.stringify({
    title: form.title,
    text: form.text
  }).length;
  const passphrase = form.passphrase ? form.passphrase : fundingPassphrase;
  
  const sender = cryptography.getAddressAndPublicKeyFromPassphrase(passphrase);  

  var accountNonce = await getAccountNonce(sender.address);

  try{
  const tx = transactions.signTransaction(
    archiveTextSchema,
    {
        moduleID: 5000,
        assetID: 101,
        nonce: Helper(accountNonce),
        fee: Helper(formLength * 10000 * 1024 / 1000 * 10),
        senderPublicKey: sender.publicKey,
        asset: {
            data: JSON.stringify({
              title: form.title,
              text: form.text
            }),
            recipientAddress: sender.address
        },
    },
    Buffer.from(networkIdentifier, "hex"),
    passphrase);    

    console.log(tx);

    return await sendTransaction(tx);  
  }catch(e){
    console.log("error signing transaction", e);
  }    
};

const archiveFile = async (form) => {
  
  const passphrase = form.passphrase ? form.passphrase : fundingPassphrase;
  const sender = cryptography.getAddressAndPublicKeyFromPassphrase(passphrase);

  const accountNonce = await getAccountNonce(sender.address);

  const fileArrayBuffer = await readFile(form.file);
  const encodedData = encodeData(fileArrayBuffer);

  const formLength = JSON.stringify({
    title: form.title,
    binary: encodedData
  }).length;

  const tx = await transactions.signTransaction(
    archiveBinarySchema,
    {
        moduleID: 5000,
        assetID: 102,
        nonce: Helper(accountNonce),
        fee: Helper(formLength * 10000 * 1024 / 1000 * 10),
        senderPublicKey: sender.publicKey,
        asset: {
            data: JSON.stringify({
              title: form.title,
              binary: encodedData
            }),
            recipientAddress: sender.address
        },
    },
    Buffer.from(networkIdentifier, "hex"),
    passphrase);

    console.log(tx);

  return await sendTransaction(tx);   
};

export const processSubmission = async (form) => {
  
  if (form.type === "text") {    
    return await archiveText(form);
  } else if (form.type === "file") {
    return await archiveFile(form);
  }
};

export const getTransactions = options => getClient().then(function(client){
  var result = getBlocks(options);
  return result;
}).catch(function(e){
  console.log("error getTransactions", e);
  return null;
});

export const getTransactionById = option => getClient().then(function(client){
  return client.transaction.decode(Buffer.from(option), 'hex').toJSON();
}).catch(function(e){
  console.log("error getTransaction", e);
  return null;
});
