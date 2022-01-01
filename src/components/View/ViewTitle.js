import React, { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import ReactHtmlParser from "react-html-parser";
import { getTransaction } from "../../utils/api";
import { saveTextArchive } from "../../utils/files";

const ViewAccount = props => {
  const [title, setTitle] = useState(null);
  const [assetData, setAssetData] = useState({ title: "", text: "" });
  const id = props.match.params.id;

  useEffect(() => {
    getTransaction({
      type: 101,
      id
    })
      .then(res => {
        const tx = res;
        setTitle(tx);
        setAssetData(JSON.parse(tx.asset.data));
      })
      .catch(err => {
        console.log(err);
      });
  }, []);

  const handleDownload = () => {
    saveTextArchive({ title: assetData.title, text: assetData.text });
  };

  return (
    <div className="animated fadeIn">
      {title !== null && (
        <>
          <div className="text-center">
            <h1 className="text-white mt-5">Viewing: {assetData.title} </h1>
          </div>

          <div className="card mt-5 mb-5">
            <div className="card-body">
              <div className="text-left">{ReactHtmlParser(assetData.text)}</div>
            </div>
          </div>

          <div className="text-center">
            <button className="btn btn-primary mr-3" onClick={() => props.history.goBack()}>
              <h3 className="m-0">
                <FontAwesomeIcon icon="arrow-left" className="m-0" />
              </h3>
            </button>

            <button className="btn btn-primary" onClick={handleDownload}>
              <h3 className="m-0">
                <FontAwesomeIcon icon="download" />
              </h3>
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default ViewAccount;
