import React, { useState, useEffect, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import { FaSearch } from "react-icons/fa";
import AlbumCard from "../components/user/AlbumCard";
import { albumService } from "../services/albumService";
import { setTitle } from "../utils/setTitle";

const Search = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isDebouncing, setIsDebouncing] = useState(false);
  const [error, setError] = useState(null);
  const inputRef = useRef(null);
  const [searchParams] = useSearchParams();

  const performSearch = async (query) => {
    if (query.trim() === "") {
      setSearchResults([]);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const results = await albumService.searchAlbums(query.trim());
      setSearchResults(results);
    } catch (error) {
      console.error("Failed to search albums:", error);
      setError("Failed to search albums");
      setSearchResults([]);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const query = e.target.value;
    setSearchQuery(query);
    setIsDebouncing(true);

    clearTimeout(window.searchTimeout);
    window.searchTimeout = setTimeout(() => {
      setIsDebouncing(false);
      performSearch(query);
    }, 150);
  };

  // przeniesienie znaku wpisanego na homepage na searchpage
  useEffect(() => {
    const urlQuery = searchParams.get("query");
    if (urlQuery) {
      setSearchQuery(urlQuery);
      performSearch(urlQuery);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  //bez linijki wyżej wywala ostrzeżenie

  // focus na pole wyszukiwania po wyświetleniu wyników
  useEffect(() => {
    if (inputRef.current) {
      setTimeout(() => {
        inputRef.current.focus();
      }, 10);
    }
  }, [searchResults]);

  setTitle("Search");

  return (
    <div className="pb-20 overflow-visible">
      <div className="max-w-4xl mx-auto overflow-visible">
        <div className="mb-6">
          <div className="bg-gray-200 p-2 rounded-lg cursor-text flex items-center shadow-md">
            <FaSearch className="text-gray-600 mr-2 h-4 w-4" />
            <input
              ref={inputRef}
              type="text"
              value={searchQuery}
              onChange={handleInputChange}
              placeholder="Search albums, artists..."
              className="w-full bg-transparent border-none outline-none text-gray-800 placeholder-gray-500 text-sm"
            />
          </div>
        </div>

        {/* pokazuje sekcje jeśli searchquery nie jest null */}
        {searchQuery !== null && (
          <div className="overflow-visible">
            {error && (
              <div className="mb-4 p-3 bg-yellow-600 text-white rounded-md text-sm">
                {error}
              </div>
            )}

            <h3 className="text-lg font-semibold mb-4 text-white">
              {searchQuery.trim() !== ""
                ? isDebouncing
                  ? "Type to search..."
                  : searchResults.length > 0
                  ? `Found ${searchResults.length} results for "${searchQuery}"`
                  : loading
                  ? "Type to search..."
                  : `No results found for "${searchQuery}"`
                : "Type to search..."}
            </h3>

            <div className="grid grid-cols-4 gap-6 overflow-visible">
              {searchResults.map((album) => (
                <AlbumCard key={album._id || album.id} album={album} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Search;
