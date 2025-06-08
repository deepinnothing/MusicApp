import React, { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userEmail, setUserEmail] = useState("");
  const [userRoles, setUserRoles] = useState([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  // sprawdzenie czy user był zalogowany po odświeżeniu strony
  useEffect(() => {
    const token = localStorage.getItem("authToken");
    const email = localStorage.getItem("userEmail");
    const roles = JSON.parse(localStorage.getItem("userRoles") || "[]");

    if (token && email) {
      setIsLoggedIn(true);
      setUserEmail(email);
      setUserRoles(roles);
      setIsAdmin(roles.includes("admin"));
    }
    setLoading(false);
  }, []);

  const login = (userData) => {
    localStorage.setItem("authToken", userData.token);
    localStorage.setItem("userEmail", userData.email);
    localStorage.setItem("userRoles", JSON.stringify(userData.roles || []));

    setIsLoggedIn(true);
    setUserEmail(userData.email);
    setUserRoles(userData.roles || []);
    setIsAdmin(userData.roles?.includes("admin") || false);
  };

  const logout = () => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("userEmail");
    localStorage.removeItem("userRoles");

    setIsLoggedIn(false);
    setUserEmail("");
    setUserRoles([]);
    setIsAdmin(false);
  };

  const value = {
    isLoggedIn,
    userEmail,
    userRoles,
    isAdmin,
    login,
    logout,
    loading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
