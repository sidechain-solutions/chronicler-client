import React from "react";
import Dropzone from "react-dropzone";

const DragDrop = ({ onDrop }) => {
  const maxSize = 10000;

  return (
    <Dropzone onDrop={onDrop} minSize={0} maxSize={maxSize}>
      {({ getRootProps, getInputProps, rejectedFiles, acceptedFiles }) => {
        const accepted = acceptedFiles.length > 0;
        const isFileTooLarge = rejectedFiles.length > 0 && rejectedFiles[0].size > maxSize;

        return (
          <>
            <label htmlFor="fileInput">File</label>
            <div
              {...getRootProps()}
              className="bg-white border-primary drag-drop mb-3 d-flex justify-content-center link"
            >
              <div className="text-muted align-self-center align-self-middle">
                <input {...getInputProps()} />
                Drag 'n' drop a file here, or click to select file
                {accepted && (
                  <div className="text-success text-center mt-3">
                    <strong>File loaded ✓</strong>
                  </div>
                )}
                {isFileTooLarge && (
                  <div className="text-danger text-center mt-3">
                    <strong>File is too large (max ~10kB)</strong>
                  </div>
                )}
              </div>
            </div>
          </>
        );
      }}
    </Dropzone>
  );
};

export default DragDrop;
