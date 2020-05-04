import React from "react";
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import logoMain from "../../assets/logo-main.png";

const Home = () => {
  return (
    <div className="animated fadeIn">
      <img src={logoMain} alt="logo-main" className="img-fluid logo-main" />

      <Link to="/submit" className="btn home-nav btn-primary mr-4">
        <FontAwesomeIcon icon="upload" />
        <div className="home-nav-text">Submit Archive</div>
      </Link>

      <Link to="/view" className="btn home-nav btn-primary">
        <FontAwesomeIcon icon="book" />
        <div className="home-nav-text">View Archive</div>
      </Link>
    </div>
  );
};

export default Home;
