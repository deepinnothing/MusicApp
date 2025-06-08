import React, { useState, useEffect } from "react";
import { SiMusicbrainz } from "react-icons/si";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { useAuth } from "../hooks/AuthContext";
import { Button } from "../components/common/Button";
import { Form } from "../components/common/Form";
import { FormInput } from "../components/common/FormInput";
import { setTitle } from "../utils/setTitle";
import Error from "../components/ui/Error";
import { API_ENDPOINTS } from "../config/api";

const UserLogin = () => {
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { isLoggedIn, login, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    mode: "onBlur", // Walidacja uruchamia się po opuszczeniu pola
  });

  // Przekierowanie zalogowanych użytkowników
  useEffect(() => {
    if (isLoggedIn) {
      navigate("/");
    }
  }, [isLoggedIn, navigate]);

  const userLoginHandler = async (data) => {
    setError("");
    setLoading(true);

    try {
      const response = await fetch(API_ENDPOINTS.auth.login, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        const userData = await response.json();

        //użycie hooka AuthContext
        login(userData);
        navigate("/");
      } else {
        const errorData = await response.json().catch(() => ({}));
        setError(errorData.message || "Invalid email or password");
      }
    } catch (err) {
      console.error("Login error:", err);
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Pokazuj loading podczas sprawdzania stanu autentyfikacji
  if (authLoading) {
    return (
      <div className="flex justify-center items-center min-h-[calc(100vh-120px)]">
        <div className="text-white text-lg">Loading...</div>
      </div>
    );
  }

  // Nie pokazuj formularza jeśli user jest zalogowany
  if (isLoggedIn) {
    return null;
  }

  setTitle("User Login");
  return (
    <div className="flex justify-center items-center min-h-[calc(100vh-120px)] py-8">
      <div className="w-full max-w-xs mx-auto bg-slate-100 p-4 rounded-md">
        <div className="flex flex-col items-center justify-center pb-2">
          <span className="text-purple-600 text-3xl pb-1">
            <SiMusicbrainz />
          </span>
          <h3 className="text-xl font-semibold">Sign in</h3>
        </div>
        <Form onSubmit={handleSubmit(userLoginHandler)} noValidate>
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
            })}
          />

          <Button
            name={loading ? "Signing in..." : "Sign in"}
            className="w-full"
            disabled={loading}
          />
        </Form>
        {error && <Error message={error} />}
        <div className="mt-2 text-center text-sm">
          <p>You don't have an account? </p>
          <p>
            <Link to="/register" className="text-purple-600 font-normal">
              sign up here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default UserLogin;
