import { ArchiveTextTransaction, ArchiveBinaryTransaction } from "chronicler-transactions";
import { EPOCH_TIME } from "@liskhq/lisk-constants";
import { utils } from "@liskhq/lisk-transactions";
import { APIClient } from "@liskhq/lisk-api-client";
import { getAddressFromPassphrase } from "@liskhq/lisk-cryptography";

import { readFile, encodeData } from "./files";
import { nodes, fundingPassphrase } from "../config/config";

const client = new APIClient(nodes);

const getTs = () => Math.round((Date.now() - Date.parse(EPOCH_TIME)) / 1000) - 60;

const archiveText = form => {
  const passphrase = form.passphrase ? form.passphrase : fundingPassphrase;
  const address = getAddressFromPassphrase(passphrase);

  const tx = new ArchiveTextTransaction({
    asset: {
      data: JSON.stringify({
        title: form.title,
        text: form.text
      })
    },
    fee: utils.convertLSKToBeddows("10"),
    recipientId: address,
    timestamp: getTs()
  });

  tx.sign(passphrase);

  return client.transactions.broadcast(tx.toJSON());
};

const archiveFile = async form => {
  const passphrase = form.passphrase ? form.passphrase : fundingPassphrase;
  const address = getAddressFromPassphrase(passphrase);

  const fileArrayBuffer = await readFile(form.file);
  const encodedData = encodeData(fileArrayBuffer);

  const tx = new ArchiveBinaryTransaction({
    asset: {
      data: JSON.stringify({
        title: form.title,
        binary: encodedData
      })
    },
    fee: utils.convertLSKToBeddows("100"),
    recipientId: address,
    timestamp: getTs()
  });

  tx.sign(passphrase);

  return client.transactions.broadcast(tx.toJSON());
};

export const processSubmission = async form => {
  if (form.type === "text") {
    return archiveText(form);
  } else if (form.type === "file") {
    return archiveFile(form);
  }
};

export const getTransactions = options => client.transactions.get(options);
