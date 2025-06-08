import React, { useState, useEffect } from "react";
import AlbumCard from "../components/user/AlbumCard";
import { albumService } from "../services/albumService";

const FeaturedAlbums = () => {
  const [albums, setAlbums] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAlbums = async () => {
      try {
        setLoading(true);
        const data = await albumService.getAllAlbums();
        setAlbums(data);
      } catch (error) {
        console.error("Failed to fetch albums:", error);
        setError("Failed to load albums");
      } finally {
        setLoading(false);
      }
    };

    fetchAlbums();
  }, []);

  if (loading) {
    return (
      <div className="grid grid-cols-4 gap-6 overflow-visible">
        {/* okno ładowania */}
        {[...Array(8)].map((_, index) => (
          <div
            key={index}
            className="bg-gray-700/50 rounded-lg animate-pulse aspect-square flex flex-col"
          >
            <div className="flex-1 bg-gray-600/50 rounded-t-lg"></div>
            <div className="p-3 space-y-2">
              <div className="h-4 bg-gray-600/50 rounded"></div>
              <div className="h-3 bg-gray-600/50 rounded w-2/3"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="overflow-visible">
      {error && (
        <div className="mb-4 p-3 bg-yellow-600/20 border border-yellow-500/30 text-yellow-200 rounded-md text-sm">
          {error}
        </div>
      )}
      <div className="grid grid-cols-4 gap-6 overflow-visible">
        {albums.map((album) => (
          <AlbumCard key={album._id || album.id} album={album} />
        ))}
      </div>
    </div>
  );
};

export default FeaturedAlbums;
