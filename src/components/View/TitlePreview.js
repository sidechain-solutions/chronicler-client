import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { titleMaxLength } from "../../config/config.json";
import { Link } from "react-router-dom";
import { saveFileArchive } from "../../utils/files";

import "./TitlePreview.css";

const TitlePreview = ({ data, type }) => {
  const assetData = JSON.parse(data.asset.data);

  const formatTitle = title => {
    if (!title) {
      return "Unknown Title";
    }

    if (title.length > titleMaxLength) {
      return title.slice(0, titleMaxLength - 3) + " [..]";
    }

    return title;
  };

  const isSmallScreen = window.innerWidth < 768;

  const title = formatTitle(assetData.title);

  const ContentSmall = () => (
    <div className="animated card mb-3">
      <div className="card-body title-card">
        <h5>{title}</h5>
        <span className="text-muted">ID: {data.id}</span>
        <hr />

        {assetData.timestamp ? new Date(assetData.timestamp).toLocaleDateString() : ""}
        {type === "files" && <FontAwesomeIcon className="ml-3" icon="download" />}
      </div>
    </div>
  );

  const ContentWide = () => (
    <div className="animated card mb-3">
      <div className="card-body title-card d-flex">
        <div className="mr-auto">
          <h5 className="d-inline-block">{title}</h5>{" "}
          <span className="text-muted">(ID: {data.id})</span>
        </div>

        <div className="ml-auto">
          {assetData.timestamp ? new Date(assetData.timestamp).toLocaleDateString() : ""}
          {type === "files" && <FontAwesomeIcon className="ml-3" icon="download" />}
        </div>
      </div>
    </div>
  );

  return type === "text" ? (
    <Link to={`/view/title/${data.id}`}>{isSmallScreen ? <ContentSmall /> : <ContentWide />}</Link>
  ) : (
    <div onClick={() => saveFileArchive(assetData)} to={`/view/title/${data.id}`}>
      {isSmallScreen ? <ContentSmall /> : <ContentWide />}
    </div>
  );
};

export default TitlePreview;
