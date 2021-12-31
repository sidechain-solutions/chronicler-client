const { APIClient, codec, cryptography, transactions } = require( '@liskhq/lisk-client');

import { readFile, encodeData } from "./files";
import { wsNode, fundingPassphrase } from "../config/config";

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

const client = () => { return getClient()
  .then(function(response){ return response;})
  .catch(function(error){
    console.log("error connecting to client" + error);
    return undefined;
  });
}

const networkIdentifier = "a5f4ae7dd207c8d9767c10ec17544ec46eacd9b351ecbdda5c6e97a0dfc5acd2";

getClient = async () => {
  if (!ApiHelper.clientCache) {            
      ApiHelper.clientCache = await APIClient.createWSClient(wsNode);
  }        
  
  return ApiHelper.clientCache;
};

const getAccountFromAddress = async (address) => {
  
  const client = await getClient();
  const schema = await client.invoke('app:getSchema');
  const account = await client.invoke('app:getAccount', {
      address,
  });
          
  return codec.codec.decodeJSON(schema.account, Buffer.from(account, 'hex'));
};

const getAccountNonce = async (address) => {
  var account = await getAccountFromAddress(address);        
  const sequence = account.sequence;
  return Number(sequence.nonce);
};

const sendTransaction = async(transaction) => {
  const client = await getClient();        
  const result = await client.transaction.send(transaction);

  return result;
}

const archiveText = form => {
  const passphrase = form.passphrase ? form.passphrase : fundingPassphrase;
  const sender = cryptography.getAddressAndPublicKeyFromPassphrase(passphrase);

  const accountNonce = await getAccountNonce(sender.address);

  const tx = await transactions.signTransaction(
    archiveTextSchema,
    {
        moduleID: 5000,
        assetID: 101,
        nonce: BigInt(accountNonce),
        fee: BigInt(Math.round(JSON.stringify({
          title: form.title,
          text: form.text
        }).length * 1024 * 10000 / 1000 * 3)),
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

  return await sendTransaction(tx);  
};

const archiveFile = async form => {
  const passphrase = form.passphrase ? form.passphrase : fundingPassphrase;
  const sender = cryptography.getAddressAndPublicKeyFromPassphrase(passphrase);

  const accountNonce = await getAccountNonce(sender.address);

  const fileArrayBuffer = await readFile(form.file);
  const encodedData = encodeData(fileArrayBuffer);

  const tx = await transactions.signTransaction(
    archiveBinarySchema,
    {
        moduleID: 5000,
        assetID: 102,
        nonce: BigInt(accountNonce),
        fee: BigInt(Math.round(JSON.stringify({
          title: form.title,
          binary: encodedData
        }).length * 10000 * 3)),
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

  return await sendTransaction(tx);   
};

export const processSubmission = async form => {
  if (form.type === "text") {
    return archiveText(form);
  } else if (form.type === "file") {
    return archiveFile(form);
  }
};

export const getTransactions = options => client.transactions.get(options);

export const getTransactionById = option => client.transaction.get(Buffer.from(option), 'hex');
