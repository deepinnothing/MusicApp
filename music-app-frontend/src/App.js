import React from "react";
import { Route, Routes } from "react-router-dom";
import { AuthProvider } from "./hooks/AuthContext";
import { LibraryProvider } from "./hooks/LibraryContext";
import UserLayout from "./layout/UserLayout";
import Home from "./pages/Home";
import AlbumDetails from "./pages/AlbumDetails";
import UserLogin from "./pages/UserLogin";
import UserRegister from "./pages/UserRegister";
import FeaturedAlbums from "./pages/FeaturedAlbums";
import Search from "./pages/Search";
import MyLibrary from "./pages/MyLibrary";

function App() {
  return (
    <AuthProvider>
      <LibraryProvider>
        <Routes>
          {/* user routes */}
          <Route path="/" element={<UserLayout />}>
            {/* login and register routes */}
            <Route path="/register" element={<UserRegister />} />
            <Route path="/login" element={<UserLogin />} />

            <Route path="/" element={<Home />} />
            <Route path="/featured" element={<FeaturedAlbums />} />
            <Route path="/album/:albumId" element={<AlbumDetails />} />
            <Route path="/search" element={<Search />} />
            <Route path="/my-library" element={<MyLibrary />} />

            {/* user private routes - teraz dostępne publicznie */}
          </Route>
        </Routes>
      </LibraryProvider>
    </AuthProvider>
  );
}

export default App;
