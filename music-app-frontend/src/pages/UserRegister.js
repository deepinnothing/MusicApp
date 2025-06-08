import React, { useState } from "react";
import { SiMusicbrainz } from "react-icons/si";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { Button } from "../components/common/Button";
import { Form } from "../components/common/Form";
import { FormInput } from "../components/common/FormInput";
import Error from "../components/ui/Error";
import { setTitle } from "../utils/setTitle";
import { API_ENDPOINTS } from "../config/api";

const UserRegister = () => {
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm({
    mode: "onBlur",
  });

  const password = watch("password");

  const registerHandler = async (data) => {
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      const response = await fetch(API_ENDPOINTS.auth.register, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: data.email,
          password: data.password,
        }),
      });

      if (response.ok) {
        setSuccess("Registration successful! You can now sign in.");

        reset();

        // kieruje do strony logowania po 2s
        setTimeout(() => {
          navigate("/login");
        }, 2000);
      } else {
        const errorData = await response.json().catch(() => ({}));
        if (response.status === 400) {
          setError(
            "An account with this email already exists. Please use a different email or sign in."
          );
        } else {
          setError(errorData.message || "Registration failed");
        }
      }
    } catch (err) {
      console.error("Registration error:", err);
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  //set page title
  setTitle("User Register");

  return (
    <div className="flex justify-center items-center min-h-[calc(100vh-120px)] py-8">
      <div className="w-full max-w-xs mx-auto bg-slate-100 p-4 rounded-md">
        <div className="flex flex-col items-center justify-center pb-2">
          <span className="text-purple-600 text-3xl pb-1">
            <SiMusicbrainz />
          </span>
          <h3 className="text-xl font-semibold">Sign up</h3>
        </div>
        <Form onSubmit={handleSubmit(registerHandler)} noValidate>
          <FormInput
            label="Email"
            type="email"
            placeholder="your email"
            error={errors.email}
            disabled={loading}
            {...register("email", {
              required: "Email is required",
              validate: {
                hasAt: (value) => value.includes("@") || "Email must contain @",
                hasDot: (value) =>
                  value.includes(".") ||
                  "Email must contain a domain (e.g. .com)",
              },
            })}
          />
          <FormInput
            label="Password"
            type="password"
            placeholder="your password"
            error={errors.password}
            disabled={loading}
            {...register("password", {
              required: "Password is required",
              minLength: {
                value: 8,
                message: "Password must be at least 8 characters",
              },
            })}
          />
          <FormInput
            label="Confirm Password"
            type="password"
            placeholder="your confirm password"
            error={errors.confirmPassword}
            disabled={loading}
            {...register("confirmPassword", {
              required: "Please confirm your password",
              validate: (value) =>
                value === password || "Passwords don't match",
            })}
          />

          <Button
            name={loading ? "Creating account..." : "Register"}
            className="w-full"
            disabled={loading}
          />
        </Form>
        {error && <Error message={error} />}
        {success && (
          <div className="mt-2 p-2 text-green-700 bg-green-100 rounded border border-green-400 text-sm">
            {success}
          </div>
        )}
        <div className="mt-2 text-center text-sm">
          <p>Already have an account? </p>
          <p>
            <Link to="/login" className="text-purple-600 font-normal">
              Sign in here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default UserRegister;
