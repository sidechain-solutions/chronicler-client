import React, { useEffect, useState } from "react";
import { Redirect } from "react-router";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

const Success = () => {
  const [redirect, setRedirect] = useState(false);

  useEffect(() => {
    setTimeout(() => {
      setRedirect(true);
    }, 5000);
  }, []);

  return (
    <div className="animated fadeIn">
      <h1 className="text-success mb-4">
        Title successfully archived <FontAwesomeIcon icon="check" />
      </h1>

      <p className="text-light">Automatically returning in 5 seconds...</p>

      {redirect && <Redirect push to="/" />}
    </div>
  );
};

export default Success;
