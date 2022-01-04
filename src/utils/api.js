import { readFile, encodeData } from "./files";
const { Helper } = require ('./biginthelper');
const { apiHelper, wsNode, fundingPassphrase } = require("../config/config.json");

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
  var decoded = await client.account.decode(Buffer.from(account, 'hex'));
  
  return await client.account.toJSON(decoded);
};

async function getAccountNonce (account) {    
  return Number(account.sequence.nonce);
};

async function getTransactionById (id)  {
  const client = await getClient();  
  const transaction = await client.invoke('app:getTransactionByID', {id: id});
  const decoded = await client.transaction.decode(Buffer.from(transaction, 'hex'))
  
  return await client.transaction.toJSON(decoded);
};

const getTransactionsByPersistedIds = async(options) => {
  //api consult
  var url= apiHelper;
    var reqOptions = {
      method: "POST",
      mode: "cors",
      headers: { "Content-Type": "application/json" }      
    };
    var req = await fetch (url, reqOptions);   
    var result = await req.json();
    var file = JSON.parse(result);
    
    var ids = [];

    file.transactions.forEach(element => {      
      ids.push(element.transactionId);
    });    

  return await getTransactionsByIds(ids, options);
}

const getTransactionsByIds = async(ids, options) => {
  const client = await getClient();
    
  var transactions = await client.invoke('app:getTransactionsByIDs', {"ids": ids});
  
  var decodedTransactions = [];

  for (var index=transactions.length-1;index >= 0; index--)
  {    
    var id = transactions[index];
    const transactionObject = await client.transaction.decode(Buffer.from(id, 'hex'));
    const transactionJSON = await client.transaction.toJSON(transactionObject);    
    
    console.log(transactionObject);
    
    if (transactionJSON.assetID !== options.type){
      continue;
    }    
        
    const transactionSenderPublicKey = cryptography.getBase32AddressFromPublicKey(transactionObject.senderPublicKey);    
    if (transactionSenderPublicKey !== options.senderId){
      continue;
    }
    console.log(transactionJSON);
    decodedTransactions.push(transactionJSON);
  }  

  return decodedTransactions;
}

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

const getTransactionFromPoolFeePerAccount = async (publicKey, nonce) => {        
  const client = await getClient();    
  const transactions = await client.invoke('app:getTransactionsFromPool', {});

  var pubKeyHex = cryptography.bufferToHex(publicKey);    

  for (var index=0;index < transactions.length;index++)
  {                        
      console.log(transactions.length);           

      var transaction = transactions[index];
      var decoded = await client.transaction.decode(Buffer.from(transaction, 'hex'));
      var transactionJSON = await client.transaction.toJSON(decoded);                

      if (transactionJSON.senderPublicKey === pubKeyHex){
        if (transactionJSON.nonce >= nonce){
          return transactionJSON.fee;
        }
      }

      console.log("transaction from pool", transactionJSON);      
  };
  return 0;
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

  var account = await getAccountFromAddress(sender.address);
  var accountNonce = await getAccountNonce(account);

  var poolFee = getTransactionFromPoolFeePerAccount(sender.publicKey, accountNonce);
  
  try{
  const tx = transactions.signTransaction(
    archiveTextSchema,
    {
        moduleID: 5000,
        assetID: 101,
        nonce: Helper(accountNonce),
        fee: poolFee > 0 ? poolFee + 10 : Helper(formLength * 10000 * 1024 / 1000 * 10),
        senderPublicKey: sender.publicKey,
        asset: {
            data: JSON.stringify({
              title: form.title,
              text: form.text,
              timestamp: Date.now()
            }),
            recipientAddress: sender.address
        },
    },
    Buffer.from(networkIdentifier, "hex"),
    passphrase);    
        
    var result = await sendTransaction(tx);

    var url= apiHelper + "/push";
    var options = {
      method: "POST",
      mode: "cors",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(result)
    };
    var req = await fetch (url, options);    

    console.log("request persist", req.status);
    
    return result;  
  }catch(e){
    console.log("error signing transaction", e);
  }   
};

const archiveFile = async (form) => {
  
  const passphrase = form.passphrase ? form.passphrase : fundingPassphrase;
  const sender = cryptography.getAddressAndPublicKeyFromPassphrase(passphrase);

  const account = await getAccountFromAddress(sender.address);
  const accountNonce = await getAccountNonce(account);

  var poolFee = getTransactionFromPoolFeePerAccount(sender.publicKey, accountNonce);

  const fileArrayBuffer = await readFile(form.file);
  const encodedData = encodeData(fileArrayBuffer);

  console.log(encodedData);

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
        fee: poolFee > 0 ? poolFee + 10 : Helper(formLength * 10000 * 1024 / 1000 * 10),
        senderPublicKey: sender.publicKey,
        asset: {
            data: JSON.stringify({
              title: form.title,
              binary: encodedData,
              timestamp: Date.now()
            }),
            recipientAddress: sender.address
        },
    },
    Buffer.from(networkIdentifier, "hex"),
    passphrase);    

    var result = await sendTransaction(tx);

    console.log(result);

    var url= apiHelper + "/push";
    var options = {
      method: "POST",
      mode: "cors",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(result)
    };
    var req = await fetch (url, options);    

    console.log("request persist", req.status);

  return result;   
};

export const processSubmission = async (form) => {
  
  if (form.type === "text") {    
    return await archiveText(form);
  } else if (form.type === "file") {
    return await archiveFile(form);
  }
};

export const getTransactions = options => getTransactionsByPersistedIds(options).then(function(response){  
  return response;
}).catch(function(e){
  console.log("error getTransactions", e);
  return null;
});

export const getTransaction = option => getTransactionById(option.id).then(function(response){
  return response;
}).catch(function(e){
  console.log("error getTransaction", e);
  return null;
});
