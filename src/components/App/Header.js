import React from "react";
import { NavLink } from "react-router-dom";
import { explorer } from "../../config/config";
import logo from "../../assets/logo-md.png";

const Header = () => (
  <nav className="navbar navbar-expand-sm fixed-top navbar-dark bg-dark pb-3 pt-3">
    <NavLink to="/" className="navbar-brand">
      <img src={logo} alt="logo-header" className="logo-header" />
    </NavLink>

    <button
      className="navbar-toggler"
      type="button"
      data-toggle="collapse"
      data-target="#navbarCollapse"
      aria-controls="navbarCollapse"
      aria-expanded="false"
      aria-label="Toggle navigation"
    >
      <span className="navbar-toggler-icon"></span>
    </button>

    <div className="collapse navbar-collapse" id="navbarCollapse">
      <div className="navbar-nav font-weight-bold">
        <ul className="navbar-nav mr-auto">
          <li className="nav-item active">
            <NavLink to="/submit" className="nav-link text-light">
              SUBMIT
            </NavLink>
          </li>
          <li className="nav-item active">
            <NavLink to="/view" className="nav-link text-light">
              VIEW
            </NavLink>
          </li>
          <li className="nav-item active">
            <a
              href={explorer}
              target="_blank"
              rel="noreferrer noopener"
              className="nav-link text-light"
            >
              BLOCK EXPLORER
            </a>
          </li>
        </ul>
      </div>
      <div className="ml-auto text-muted">
        <small>Chronicler PoC - ©2019 Sidechain Solutions</small>
      </div>
    </div>
  </nav>
);

export default Header;
