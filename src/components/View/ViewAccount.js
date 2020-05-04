import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Link } from "react-router-dom";

const ViewAccount = props => {
  const senderId = props.match.params.id;

  return (
    <div className="animated fadeIn">
      <h1 className="text-white mb-5">
        Account Archive: <br />
        <strong>{senderId}</strong>
      </h1>

      <div>
        <Link to={`${senderId}/text`} className="btn home-nav btn-primary mr-4">
          <FontAwesomeIcon icon="font" />
          <div className="home-nav-text">View Text Archives</div>
        </Link>

        <Link to={`${senderId}/files`} className="btn home-nav btn-primary">
          <FontAwesomeIcon icon="file" />
          <div className="home-nav-text">View File Archives</div>
        </Link>
      </div>
    </div>
  );
};

export default ViewAccount;
