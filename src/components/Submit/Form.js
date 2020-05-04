import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import DragDrop from "./DragDrop";

import "./Form.css";

const Form = props => (
  <form onSubmit={props.handleSubmit}>
    <div className="text-left text-light">
      <label htmlFor="title">Title</label>
      <input
        onChange={props.handleChange}
        type="text"
        name="title"
        id="title"
        className="form-control mb-3"
        placeholder="My Title"
        value={props.form.title}
        required
        autoFocus
      />

      <label htmlFor="type">Archival Type</label>
      <select
        onChange={props.handleChange}
        name="type"
        className="form-control mb-3 font-weight-bold"
        value={props.form.type}
        required
      >
        <option value="text">Text</option>
        <option value="file">File</option>
      </select>

      {props.form.type === "text" ? (
        <>
          <label htmlFor="text">Text</label>
          <textarea
            onChange={props.handleChange}
            name="text"
            rows="10"
            id="text"
            className="form-control mb-3"
            required
          ></textarea>
        </>
      ) : (
        <DragDrop onDrop={props.onDrop} />
      )}

      <label htmlFor="passphrase">Passphrase</label>
      <input
        onChange={props.handleChange}
        type="password"
        name="passphrase"
        id="passphrase"
        className="form-control mb-5"
        placeholder="Leave empty to use default demo passphrase"
      />
    </div>

    <button type="submit" className="btn btn-lg btn-primary shadow">
      <h3 className="m-0">
        <FontAwesomeIcon icon="upload" />
      </h3>
    </button>
  </form>
);

export default Form;
