import { cryptography } from "@liskhq/lisk-client";
import FileSaver from "file-saver";
import base91 from "node-base91";

export const readFile = file => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = event => {
      resolve(event.target.result);
    };

    reader.onerror = err => {
      reject(err);
    };

    reader.readAsArrayBuffer(file);
  });
};

export const encodeData = data => cryptography.bufferToHex(data); // base91.encode(data);

export const decodeData = data => cryptography.hexToBuffer(data); //base91.decode(data);

export const saveTextArchive = data => {
  const blob = new Blob([data.text], { type: "text/plain;charset=utf-8" });

  FileSaver.saveAs(blob, `${data.title.slice(0, 32)}.txt`);
};

export const saveFileArchive = data => {
  const arrayBuffer = decodeData(data.binary);
  const blob = new Blob([arrayBuffer], { type: "octet/stream" });

  const url = window.URL.createObjectURL(blob);
  const tempLink = document.createElement("a");

  tempLink.href = url;
  tempLink.setAttribute("download", data.title);
  tempLink.click();
};
