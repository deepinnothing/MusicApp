import React from "react";

const Error = ({ message }) => {
  return (
    <div className="text-red-500">
      <p> {message}</p>
    </div>
  );
};

export default Error;
