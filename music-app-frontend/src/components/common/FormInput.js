import React, { forwardRef } from "react";

export const FormInput = forwardRef(
  ({ label, type, name, placeholder, className, error, ...rest }, ref) => {
    return (
      <div className="mb-3">
        <label htmlFor={name} className="text-base font-normal">
          {label}
        </label>
        <input
          ref={ref}
          id={name}
          type={type}
          name={name}
          placeholder={placeholder}
          className={`py-1.5 px-1 mt-1 w-full rounded-md border-2 text-sm ${
            error ? "border-red-500" : "border-gray-200"
          } focus:outline-green-600 ${className}`}
          autoComplete="off"
          {...rest}
        />
        {error && <p className="text-red-500 text-xs mt-1">{error.message}</p>}
      </div>
    );
  }
);

FormInput.displayName = "FormInput";
