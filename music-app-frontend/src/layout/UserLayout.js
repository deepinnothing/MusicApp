import React from "react";
import { Outlet } from "react-router-dom";
import NavBar from "../components/user/NavBar";

const UserLayout = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-violet-800">
      <NavBar />
      <main className="p-4">
        <Outlet />
      </main>
    </div>
  );
};

export default UserLayout;
