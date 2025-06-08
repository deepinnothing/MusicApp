import React from "react";

export const Button = ({ name, className, ...rest }) => {
  return (
    <button
      type="submit"
      className={`px-6 py-[5px] flex justify-center  rounded-md bg-purple-600 text-white border-2 border-purple-600 focus:ring-2 focus:ring-purple-600 overflow-hidden hover:bg-purple-700 ease-in duration-300 disabled:bg-gray-500 disabled:border-gray-500 disabled:text-gray-300 ${className}`}
      {...rest}
    >
      {name}
    </button>
  );
};
