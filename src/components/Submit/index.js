import React, { useState } from "react";
import Form from "./Form";
import Success from "./Success";
import { processSubmission } from "../../utils/api";

const emptyForm = {
  title: "",
  type: "file",
  text: "",
  file: {},
  passphrase: null
};

const Submit = () => {
  const [completed, setCompleted] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [errors, setErrors] = useState([]);

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const onDrop = async files => {
    if (files.length) {
      const file = files[0];
      setForm({ ...form, title: file.name, file });
    }
  };

  const handleSubmit = e => {
    e.preventDefault();

    processSubmission(form)
      .then(res => {
        setCompleted(true);
      })
      .catch(err => {
        setErrors(err.errors);
      });
  };

  return (
    <div className="animated fadeIn">
      {completed ? (
        <Success />
      ) : (
        <>
          <h1 className="display-1 text-white mb-4">Submit Archive</h1>
          <div className="row justify-content-center">
            <div className="col-12 col-md-9 col-lg-6">
              <Form
                handleSubmit={handleSubmit}
                handleChange={handleChange}
                form={form}
                onDrop={onDrop}
              />

              {errors.length > 0 &&
                errors.map(error => (
                  <div key={error.message} className="mt-5 alert alert-danger">
                    {error.message}
                  </div>
                ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Submit;
