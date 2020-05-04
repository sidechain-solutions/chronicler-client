import React from "react";
import Header from "./Header";
import Routes from "./Routes";
import "./Icons";

const App = () => {
  return (
    <div>
      <Header />
      <div className="vertical-center">
        <div className="container text-center mb-5">
          <Routes />
        </div>
      </div>
    </div>
  );
};

export default App;
