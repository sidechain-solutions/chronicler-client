import React from "react";
import CircleLoader from "react-spinners/CircleLoader";

const override = `
  display: inline-block;
`;

const Spinner = () => (
  <span>
    <CircleLoader css={override} sizeUnit={"em"} size={1.75} color={"#fff"} />
  </span>
);

export default Spinner;
