import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { IoAddCircleOutline, IoCheckmarkCircle } from "react-icons/io5";
import { albumService } from "../services/albumService";
import toast from "react-hot-toast";
import { useAuth } from "../hooks/AuthContext";
import { useLibrary } from "../hooks/LibraryContext";

const AlbumDetails = () => {
  const { albumId } = useParams();
  const navigate = useNavigate();
  const { isLoggedIn } = useAuth();
  const {
    isAlbumInLibrary,
    isTrackInLibrary,
    addAlbumToLibrary,
    addTrackToLibrary,
  } = useLibrary();

  const [album, setAlbum] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [addingToLibrary, setAddingToLibrary] = useState({});
  const [addedToLibrary, setAddedToLibrary] = useState({});

  // useMemo - sprawdza czy album jest już w bibliotece
  const isAlbumInLib = useMemo(() => {
    return isAlbumInLibrary(albumId);
  }, [isAlbumInLibrary, albumId]);

  // useMemo - sprawdza które piosenki są już w bibliotece
  const tracksInLibrary = useMemo(() => {
    if (!album?.tracks) return new Set();

    const trackIds = new Set();
    album.tracks.forEach((track) => {
      if (isTrackInLibrary(track._id || track.id)) {
        trackIds.add(track._id || track.id);
      }
    });
    return trackIds;
  }, [isTrackInLibrary, album]);

  const formatDuration = useCallback((lengthInSeconds) => {
    if (!lengthInSeconds) return "N/A";
    const minutes = Math.floor(lengthInSeconds / 60);
    const seconds = lengthInSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  }, []);

  // pokazywanie danych o albumie na stronie
  const fetchAlbumData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await albumService.getAlbumById(albumId);
      setAlbum(data);
    } catch (error) {
      console.error("Failed to fetch album:", error);
      setError("Failed to load album");
    } finally {
      setLoading(false);
    }
  }, [albumId]);

  useEffect(() => {
    fetchAlbumData();
  }, [fetchAlbumData]);

  // spr czy user jest zalogowany, jeśli nie, przekierowuje do strony logowania
  const handleAddAlbumToLibrary = useCallback(async () => {
    if (!isLoggedIn) {
      navigate("/login");
      return;
    }

    if (isAlbumInLib) {
      toast.error("This album is already in your library!", {
        duration: 3000,
        position: "bottom-center",
        style: { background: "#ef4444", color: "#fff" },
      });
      return;
    }

    try {
      setAddingToLibrary((prev) => ({ ...prev, album: true }));
      await addAlbumToLibrary(albumId);
      setAddedToLibrary((prev) => ({ ...prev, album: true }));

      toast.success("Album added to library!", {
        duration: 2000,
        position: "bottom-center",
        style: { background: "#10b981", color: "#fff" },
      });

      setTimeout(() => {
        setAddedToLibrary((prev) => ({ ...prev, album: false }));
      }, 2000);
    } catch (error) {
      console.error("Failed to add album to library:", error);
      toast.error("Failed to add album to library");

      if (
        error.message?.includes("401") ||
        error.message?.includes("Unauthorized")
      ) {
        navigate("/login");
      }
    } finally {
      setAddingToLibrary((prev) => ({ ...prev, album: false }));
    }
  }, [isLoggedIn, isAlbumInLib, albumId, navigate, addAlbumToLibrary]);

  // spr czy user jest zalogowany, jeśli nie, przekierowuje do strony logowania
  const handleAddTrackToLibrary = useCallback(
    async (trackId) => {
      if (!isLoggedIn) {
        navigate("/login");
        return;
      }

      if (tracksInLibrary.has(trackId)) {
        toast.error("This song is already in your library!", {
          duration: 3000,
          position: "bottom-center",
          style: { background: "#ef4444", color: "#fff" },
        });
        return;
      }

      try {
        setAddingToLibrary((prev) => ({ ...prev, [trackId]: true }));
        await addTrackToLibrary(trackId);
        setAddedToLibrary((prev) => ({ ...prev, [trackId]: true }));

        toast.success("Song added to library!", {
          duration: 2000,
          position: "bottom-center",
          style: { background: "#10b981", color: "#fff" },
        });

        setTimeout(() => {
          setAddedToLibrary((prev) => ({ ...prev, [trackId]: false }));
        }, 2000);
      } catch (error) {
        console.error("Failed to add track to library:", error);
        toast.error("Failed to add song to library");

        if (
          error.message?.includes("401") ||
          error.message?.includes("Unauthorized")
        ) {
          navigate("/login");
        }
      } finally {
        setAddingToLibrary((prev) => ({ ...prev, [trackId]: false }));
      }
    },
    [isLoggedIn, tracksInLibrary, navigate, addTrackToLibrary]
  );

  // stan ładowania szczegołów albumu
  if (loading && !album) {
    return (
      <div className="overflow-visible">
        <div className="max-w-6xl mx-auto overflow-visible">
          <div className="bg-black/40 backdrop-blur-sm rounded-2xl p-6 border border-purple-500/20">
            <div className="flex flex-row gap-6">
              <div className="w-1/3">
                <div className="aspect-square bg-gray-700/50 rounded-xl animate-pulse max-w-xs"></div>
                <div className="mt-3 h-12 bg-gray-700/50 rounded-xl animate-pulse"></div>
              </div>
              <div className="w-2/3">
                <div className="h-10 bg-gray-700/50 rounded-lg mb-4 animate-pulse"></div>
                <div className="h-6 bg-gray-700/50 rounded-lg mb-8 w-1/3 animate-pulse"></div>
                <div className="space-y-2">
                  {[...Array(8)].map((_, index) => (
                    <div
                      key={index}
                      className="h-12 bg-gray-700/30 rounded-lg animate-pulse"
                    ></div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Album załadowany, biblioteka się ładuje
  if (album && loading) {
    return (
      <div className="overflow-visible">
        <div className="max-w-6xl mx-auto overflow-visible">
          <div className="bg-black/40 backdrop-blur-sm rounded-2xl p-6 border border-purple-500/20 overflow-visible">
            {/* top section: album cover + title + button*/}
            <div className="flex flex-row gap-6 mb-4">
              {/*  album cover*/}
              <div className="w-1/3">
                <div className="relative">
                  <img
                    src={album.coverUrl || album.coverImage}
                    alt={album.title}
                    className="w-64 h-64 object-cover rounded-lg shadow-lg"
                  />
                </div>

                {/* add to library button */}
                <div className="mt-3">
                  <div className="w-full flex items-center justify-center space-x-2 px-4 py-2 rounded-lg font-medium text-sm bg-gray-600/50 text-gray-300">
                    <div className="w-4 h-4 border-2 border-gray-300 border-t-transparent rounded-full animate-spin"></div>
                    <span className="text-sm">Loading...</span>
                  </div>
                </div>
              </div>

              {/* album info */}
              <div className="w-2/3 flex flex-col justify-center">
                <div>
                  <h1 className="text-4xl font-bold text-white mb-2 bg-gradient-to-r from-white to-purple-200 bg-clip-text text-transparent">
                    {album.title}
                  </h1>
                  <p className="text-lg text-purple-200 mb-3">{album.artist}</p>
                  <div className="flex flex-wrap gap-3 text-sm text-gray-300 mb-4">
                    <span className="bg-purple-600/30 px-3 py-1 rounded-full">
                      {album.tracks?.length || 0} tracks
                    </span>
                    <span className="bg-purple-600/30 px-3 py-1 rounded-full">
                      {album.year || "Unknown year"}
                    </span>
                    {album.label && (
                      <span className="bg-purple-600/30 px-3 py-1 rounded-full">
                        {album.label}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* button loading */}
            <div className="space-y-2 overflow-visible">
              <h2 className="text-sm font-bold text-white mb-2 flex items-center gap-2">
                <span className="w-1 h-4 bg-gradient-to-b from-purple-500 to-pink-500 rounded-full"></span>
                Tracks
              </h2>

              <div className="space-y-1 overflow-visible">
                {album.tracks &&
                  album.tracks.map((song, index) => (
                    <div
                      key={song._id || song.id || index}
                      className="group flex items-center justify-between py-2 px-3 bg-white/5 backdrop-blur-sm rounded-lg border border-transparent"
                    >
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        <div className="w-4 h-4 flex items-center justify-center rounded-full bg-purple-600/30 text-purple-200 font-medium text-xs flex-shrink-0">
                          {index + 1}
                        </div>
                        <div className="min-w-0 flex-1">
                          <h3 className="text-white font-semibold text-sm truncate mb-0.5">
                            {song.title}
                          </h3>
                          <p className="text-gray-400 text-xs">
                            {song.length
                              ? formatDuration(song.length)
                              : song.duration || "N/A"}
                          </p>
                        </div>
                      </div>

                      <div className="relative group/button flex-shrink-0">
                        <div className="p-1.5 rounded-full bg-gray-600/50">
                          <div className="w-4 h-4 border-2 border-gray-300 border-t-transparent rounded-full animate-spin"></div>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !album) {
    return (
      <div className="flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-white mb-4">
            Album not found
          </h1>
          <p className="text-gray-300 text-lg">
            The requested album could not be found.
          </p>
          <button
            onClick={() => navigate(-1)}
            className="mt-6 px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="overflow-visible">
      <div className="max-w-6xl mx-auto overflow-visible">
        <div className="bg-black/40 backdrop-blur-sm rounded-2xl p-6 border border-purple-500/20 overflow-visible">
          {/* Top Section: Album Cover + Title + Add Button */}
          <div className="flex flex-row gap-6 mb-4">
            {/* album cover */}
            <div className="w-1/3">
              <div className="relative">
                <img
                  src={album.coverUrl || album.coverImage}
                  alt={album.title}
                  className="w-64 h-64 object-cover rounded-lg shadow-lg"
                />
              </div>

              {/*  add to library button  */}
              <div className="mt-3">
                {isAlbumInLib ? (
                  <div className="w-full flex items-center justify-center space-x-2 px-4 py-2 rounded-lg font-medium text-sm bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-md shadow-green-500/20">
                    <IoCheckmarkCircle className="w-4 h-4" />
                    <span className="text-sm">Already in Library</span>
                  </div>
                ) : (
                  <button
                    onClick={handleAddAlbumToLibrary}
                    disabled={addingToLibrary.album}
                    className={`w-full flex items-center justify-center space-x-2 px-4 py-2 rounded-lg font-medium text-sm transition-all duration-300 transform hover:scale-105 ${
                      addedToLibrary.album
                        ? "bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-md shadow-green-500/20"
                        : "bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white shadow-md shadow-purple-500/20"
                    }`}
                  >
                    {addedToLibrary.album ? (
                      <IoCheckmarkCircle className="w-4 h-4 animate-bounce" />
                    ) : addingToLibrary.album ? (
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                      <IoAddCircleOutline className="w-4 h-4" />
                    )}
                    <span className="text-sm">
                      {addedToLibrary.album
                        ? "Added!"
                        : addingToLibrary.album
                        ? "Adding..."
                        : "Add to Library"}
                    </span>
                  </button>
                )}
              </div>
            </div>

            {/* Album Info */}
            <div className="w-2/3 flex flex-col justify-center">
              <div>
                <h1 className="text-4xl font-bold text-white mb-2 bg-gradient-to-r from-white to-purple-200 bg-clip-text text-transparent">
                  {album.title}
                </h1>
                <p className="text-lg text-purple-200 mb-3">{album.artist}</p>
                <div className="flex flex-wrap gap-3 text-sm text-gray-300 mb-4">
                  <span className="bg-purple-600/30 px-3 py-1 rounded-full">
                    {album.tracks?.length || 0} tracks
                  </span>
                  <span className="bg-purple-600/30 px-3 py-1 rounded-full">
                    {album.year || "Unknown year"}
                  </span>
                  {album.label && (
                    <span className="bg-purple-600/30 px-3 py-1 rounded-full">
                      {album.label}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* tracks section  */}
          <div className="space-y-2 overflow-visible">
            <h2 className="text-sm font-bold text-white mb-2 flex items-center gap-2">
              <span className="w-1 h-4 bg-gradient-to-b from-purple-500 to-pink-500 rounded-full"></span>
              Tracks
            </h2>

            <div className="space-y-1 overflow-visible">
              {album.tracks &&
                album.tracks.map((song, index) => (
                  <div
                    key={song._id || song.id || index}
                    className="group flex items-center justify-between py-2 px-3 bg-white/5 backdrop-blur-sm rounded-lg hover:bg-white/10 transition-all duration-300 border border-transparent hover:border-purple-500/30"
                  >
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <div className="w-4 h-4 flex items-center justify-center rounded-full bg-purple-600/30 text-purple-200 font-medium text-xs group-hover:bg-purple-600/50 transition-colors flex-shrink-0">
                        {index + 1}
                      </div>
                      <div className="min-w-0 flex-1">
                        <h3 className="text-white font-semibold text-sm group-hover:text-purple-200 transition-colors truncate mb-0.5">
                          {song.title}
                        </h3>
                        <p className="text-gray-400 text-xs">
                          {song.length
                            ? formatDuration(song.length)
                            : song.duration || "N/A"}
                        </p>
                      </div>
                    </div>

                    <div className="relative group/button flex-shrink-0">
                      {tracksInLibrary.has(song._id || song.id) ? (
                        <div className="p-1.5 rounded-full bg-green-400/20 text-green-400">
                          <IoCheckmarkCircle className="w-4 h-4" />
                        </div>
                      ) : (
                        <button
                          onClick={() =>
                            handleAddTrackToLibrary(song._id || song.id)
                          }
                          disabled={addingToLibrary[song._id || song.id]}
                          className={`p-1.5 rounded-full transition-all duration-300 transform hover:scale-110 ${
                            addedToLibrary[song._id || song.id]
                              ? "text-green-400 bg-green-400/20"
                              : "text-purple-300 hover:text-white hover:bg-purple-600/30"
                          }`}
                        >
                          {addedToLibrary[song._id || song.id] ? (
                            <IoCheckmarkCircle className="w-4 h-4 animate-bounce" />
                          ) : addingToLibrary[song._id || song.id] ? (
                            <div className="w-4 h-4 border-2 border-purple-300 border-t-transparent rounded-full animate-spin"></div>
                          ) : (
                            <IoAddCircleOutline className="w-4 h-4" />
                          )}
                        </button>
                      )}

                      {/* Tooltip */}
                      <div
                        className="absolute bottom-full right-0 mb-1 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover/button:opacity-100 transition-opacity duration-200 whitespace-nowrap border border-purple-500/30 pointer-events-none"
                        style={{ zIndex: 999999 }}
                      >
                        {tracksInLibrary.has(song._id || song.id)
                          ? "Already in Library"
                          : addedToLibrary[song._id || song.id]
                          ? "Added!"
                          : addingToLibrary[song._id || song.id]
                          ? "Adding..."
                          : "Add to Library"}
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AlbumDetails;
