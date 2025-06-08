import React, { useState } from "react";
import { setTitle } from "../utils/setTitle";
import FeaturedAlbums from "./FeaturedAlbums";
import { useNavigate } from "react-router-dom";
import { FaSearch } from "react-icons/fa";

const Home = () => {
  setTitle("Home");

  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");

  const handleInputChange = (e) => {
    const query = e.target.value;
    setSearchQuery(query);

    if (query.length >= 1) {
      navigate(`/search?query=${encodeURIComponent(query)}`);
    }
  };

  return (
    <div className="pb-20 overflow-visible">
      <div className="max-w-4xl mx-auto overflow-visible">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-white">Featured Albums</h2>
          <div className="w-[40rem]">
            <div className="bg-gray-200 p-2 rounded-lg cursor-text flex items-center shadow-md">
              <FaSearch className="text-gray-600 mr-2 h-4 w-4" />
              <input
                type="text"
                value={searchQuery}
                onChange={handleInputChange}
                placeholder="Search albums, artists..."
                className="w-full bg-transparent border-none outline-none text-gray-800 placeholder-gray-500 text-sm"
              />
            </div>
          </div>
        </div>

        <FeaturedAlbums />
      </div>
    </div>
  );
};

export default Home;
