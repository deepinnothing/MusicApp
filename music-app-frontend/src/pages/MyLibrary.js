import React, { useEffect, useReducer } from "react";
import { useNavigate } from "react-router-dom";
import { FaMusic, FaCompactDisc } from "react-icons/fa";
import { IoRemoveCircle } from "react-icons/io5";
import { useAuth } from "../hooks/AuthContext";
import { useLibrary } from "../hooks/LibraryContext";

const initialState = {
  activeTab: "albums",
  removing: {},
};

const libraryReducer = (state, action) => {
  switch (action.type) {
    case "SET_ACTIVE_TAB":
      return { ...state, activeTab: action.payload };
    case "SET_REMOVING":
      return {
        ...state,
        removing: {
          ...state.removing,
          [action.payload.key]: action.payload.value,
        },
      };
    default:
      return state;
  }
};

const MyLibrary = () => {
  const { isLoggedIn } = useAuth();
  const {
    userLibrary: myAlbums,
    userTracks: mySongs,
    loading,
    removeAlbumFromLibrary,
    removeTrackFromLibrary,
  } = useLibrary();
  const [state, dispatch] = useReducer(libraryReducer, initialState);
  const navigate = useNavigate();

  useEffect(() => {
    // spr czy user jest zalogowany
    if (!isLoggedIn) {
      navigate("/login");
      return;
    }
  }, [navigate, isLoggedIn]);

  const handleRemoveAlbum = async (albumId) => {
    try {
      dispatch({
        type: "SET_REMOVING",
        payload: { key: `album_${albumId}`, value: true },
      });
      await removeAlbumFromLibrary(albumId);
    } catch (error) {
      console.error("Failed to remove album:", error);
    } finally {
      dispatch({
        type: "SET_REMOVING",
        payload: { key: `album_${albumId}`, value: false },
      });
    }
  };

  const handleRemoveTrack = async (trackId) => {
    try {
      dispatch({
        type: "SET_REMOVING",
        payload: { key: `track_${trackId}`, value: true },
      });
      await removeTrackFromLibrary(trackId);
    } catch (error) {
      console.error("Failed to remove track:", error);
    } finally {
      dispatch({
        type: "SET_REMOVING",
        payload: { key: `track_${trackId}`, value: false },
      });
    }
  };

  const handleAlbumClick = (albumId) => {
    navigate(`/album/${albumId}`);
  };

  const formatDuration = (lengthInSeconds) => {
    if (!lengthInSeconds) return "N/A";
    const minutes = Math.floor(lengthInSeconds / 60);
    const seconds = lengthInSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  const renderContent = () => {
    if (loading) {
      return (
        <div className="flex justify-center items-center py-12">
          <div className="text-white text-lg">Loading your library...</div>
        </div>
      );
    }

    if (state.activeTab === "albums") {
      if (myAlbums.length === 0) {
        return (
          <div className="text-center py-12">
            <FaCompactDisc className="text-6xl text-gray-600 mx-auto mb-4" />
            <p className="text-white text-lg mb-2">
              You haven't saved any albums yet.
            </p>
          </div>
        );
      }

      return (
        <div className="grid grid-cols-5 gap-4 overflow-visible">
          {myAlbums.map((album) => (
            <div
              key={album.id || album._id}
              className="bg-gray-800 rounded-lg hover:bg-gray-700 transition-colors relative group aspect-square flex flex-col overflow-hidden"
            >
              <div
                className="cursor-pointer flex-1 flex flex-col"
                onClick={() => handleAlbumClick(album.id || album._id)}
              >
                <img
                  src={album.coverUrl || album.coverImage}
                  alt={album.title}
                  className="w-full flex-1 object-cover"
                />
                <div className="bg-black/60 backdrop-blur-sm px-3 py-2 min-h-[60px] flex flex-col justify-center">
                  <h3 className="text-white font-medium truncate text-sm">
                    {album.title}
                  </h3>
                  <p className="text-gray-300 text-xs truncate">
                    {album.artist}
                  </p>
                </div>
              </div>

              {/* Remove button */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleRemoveAlbum(album.id || album._id);
                }}
                disabled={state.removing[`album_${album.id || album._id}`]}
                className="absolute top-2 right-2 bg-red-600 hover:bg-red-700 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity disabled:opacity-50"
                title="Remove from library"
              >
                <IoRemoveCircle className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      );
    } else if (state.activeTab === "songs") {
      if (mySongs.length === 0) {
        return (
          <div className="text-center py-12">
            <FaMusic className="text-6xl text-gray-600 mx-auto mb-4" />
            <p className="text-white text-lg mb-2">
              You haven't saved any songs yet.
            </p>
          </div>
        );
      }

      return (
        <div className="space-y-2">
          {mySongs.map((song, index) => (
            <div
              key={song.id || song._id}
              className="flex items-center justify-between p-3 bg-gray-800 rounded-lg hover:bg-gray-700 transition-colors group"
            >
              <div className="flex items-center gap-4">
                <span className="text-gray-400 w-8">{index + 1}</span>
                <div>
                  <h3 className="text-white font-medium">{song.title}</h3>
                  <p className="text-gray-400 text-sm">
                    {song.artist || "Unknown Artist"} •{" "}
                    {formatDuration(song.length)}
                  </p>
                </div>
              </div>

              {/* Remove button */}
              <button
                onClick={() => handleRemoveTrack(song.id || song._id)}
                disabled={state.removing[`track_${song.id || song._id}`]}
                className="bg-red-600 hover:bg-red-700 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity disabled:opacity-50"
                title="Remove from library"
              >
                <IoRemoveCircle className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      );
    }
  };

  return (
    <div className="overflow-visible">
      <div className="max-w-6xl mx-auto overflow-visible">
        <div className="flex space-x-4 mb-4">
          <button
            onClick={() =>
              dispatch({ type: "SET_ACTIVE_TAB", payload: "albums" })
            }
            className={`flex items-center space-x-2 px-4 py-1 rounded-full transition-colors text-sm ${
              state.activeTab === "albums"
                ? "bg-purple-600 text-white"
                : "bg-gray-700 text-gray-300 hover:bg-gray-600"
            }`}
          >
            <FaCompactDisc />
            <span>Albums ({myAlbums.length})</span>
          </button>
          <button
            onClick={() =>
              dispatch({ type: "SET_ACTIVE_TAB", payload: "songs" })
            }
            className={`flex items-center space-x-2 px-4 py-1 rounded-full transition-colors text-sm ${
              state.activeTab === "songs"
                ? "bg-purple-600 text-white"
                : "bg-gray-700 text-gray-300 hover:bg-gray-600"
            }`}
          >
            <FaMusic />
            <span>Songs ({mySongs.length})</span>
          </button>
        </div>

        {renderContent()}
      </div>
    </div>
  );
};

export default MyLibrary;
