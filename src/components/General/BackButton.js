import React from "react";
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

const BackButton = props => {
  return (
    <Link to="/" className="no-decoration btn-link">
      <h5 className="text-light link mb-5">
        <FontAwesomeIcon icon="arrow-circle-left" /> Home
      </h5>
    </Link>
  );
};

export default BackButton;
