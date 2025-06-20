import React, { useState, useMemo } from "react";
import ReactDOM from "react-dom";
import { useNavigate } from "react-router-dom";
import { FaPlay } from "react-icons/fa";
import { IoAddCircleOutline, IoCheckmarkCircle } from "react-icons/io5";
import { IoMdTrash } from "react-icons/io";
import { IoIosAdd } from "react-icons/io";
import { IoMdCloseCircle } from "react-icons/io";
import { IoPencil } from "react-icons/io5";
import toast from "react-hot-toast";
import { useAuth } from "../../hooks/AuthContext";
import { useLibrary } from "../../hooks/LibraryContext";
import { deleteAlbum } from "../../config/api";
import { albumService } from "../../services/albumService";

const AlbumCard = ({ album }) => {
  const navigate = useNavigate();
  const { isLoggedIn, isAdmin } = useAuth();
  const { isAlbumInLibrary, addAlbumToLibrary } = useLibrary();
  const [isAdding, setIsAdding] = useState(false);
  const [isAdded, setIsAdded] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editData, setEditData] = useState({ ...album });

  // useMemo - sprawdza czy album jest już w bibliotece
  const isInLibrary = useMemo(() => {
    return isAlbumInLibrary(album._id || album.id);
  }, [isAlbumInLibrary, album]);

  const handleCardClick = () => {
    navigate(`/album/${album._id || album.id}`);
  };

  const handleAddToLibrary = async (e) => {
    e.stopPropagation();

    if (!isLoggedIn) {
      navigate("/login");
      return;
    }

    if (isInLibrary) {
      toast.error("This album is already in your library!", {
        duration: 3000,
        position: "bottom-center",
        style: {
          background: "#ef4444",
          color: "#fff",
        },
      });
      return;
    }

    try {
      setIsAdding(true);
      await addAlbumToLibrary(album._id || album.id);
      setIsAdded(true);

      toast.success("Album added to library!", {
        duration: 2000,
        position: "bottom-center",
        style: {
          background: "#10b981",
          color: "#fff",
        },
      });

      setTimeout(() => {
        setIsAdded(false);
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
      setIsAdding(false);
    }
  };

  const handleDelete = async (e) => {
    e.stopPropagation();

    const confirm = window.confirm("Are you sure you want to delete this album?");
    if (!confirm) return;

    try {
      await deleteAlbum(album._id || album.id);

      toast.success("Album deleted!", {
        duration: 3000,
        position: "bottom-center",
        style: {
          background: "#ef4444",
          color: "#fff",
        },
      });
      window.location.reload();

      } catch (error) {
        toast.error("Failed to delete the album");
        console.error("Deletion failed:", error);
        window.location.reload();
      }
  };

  const handleEditClick = async (e) => {
    e.stopPropagation();
    const albumDataToEdit = await albumService.getAlbumById(album.id);
    setEditData(albumDataToEdit);
    setIsEditModalOpen(true);
  };

  const handleEditAlbumChange = (e) => {
    const { name, value } = e.target;
    setEditData({ ...editData, [name]: value });
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      await albumService.updateAlbum(editData._id || editData.id, editData);
      toast.success("Album updated successfully!");
      setIsEditModalOpen(false);
      window.location.reload();
    } catch (error) {
      console.error("Update failed:", error);
      toast.error("Album update hasn't succeed.");
    }
  };

  const handleEditTrackChange = (index, e) => {
    const { name, value } = e.target;
    const updatedTracks = [...editData.tracks];
    updatedTracks[index][name] = value;
    setEditData({ ...editData, tracks: updatedTracks });
  };

  const handleAddEditTrack = () => {
    setEditData({
      ...editData,
      tracks: [
        ...(Array.isArray(editData.tracks) ? editData.tracks : []),
        {
          title: "",
          artist: "",
          year: "",
          length: "",
          genre: "",
          nr: "",
        },
      ],
    });
  };

  const handleRemoveEditTrack = (index) => {
    const updatedTracks = [...editData.tracks];
    updatedTracks.splice(index, 1);
    setEditData({ ...editData, tracks: updatedTracks });
  };

  return (
    <div
      className="bg-black/40 backdrop-blur-sm rounded-lg border border-purple-500/20 cursor-pointer group hover:bg-black/60 transition-all duration-300 relative w-full flex flex-col"
      onClick={handleCardClick}
    >
      {isLoggedIn && isAdmin && (
        <div className="absolute top-2 right-2 flex flex-row-reverse gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10">
          <button
            className="text-gray-400 hover:text-red-500 transition-colors"
            onClick={handleDelete}
          >
            <IoMdTrash className="w-5 h-5" />
          </button>
          <button
            className="text-gray-400 hover:text-white transition-colors"
            onClick={(e) => {
              e.stopPropagation();
              handleEditClick(e);
            }}
          >
            <IoPencil className="w-5 h-5 pointer-events-none" />
          </button>
        </div>
      )}
      <div className="relative flex-1 overflow-hidden rounded-t-lg">
        <img
          src={album.coverUrl || album.coverImage}
          alt={album.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
          <button className="bg-purple-600 hover:bg-purple-700 rounded-full p-3 text-white transition-colors">
            <FaPlay className="w-5 h-5" />
          </button>
        </div>
      </div>
      <div className="flex justify-between items-center px-3 py-2 min-h-[60px] bg-black/40 relative rounded-b-lg">
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-semibold text-white truncate">
            {album.title}
          </h3>
          <p className="text-xs text-gray-300 truncate">{album.artist}</p>
        </div>
        <div className="relative group/button ml-2 overflow-visible">
          {isInLibrary ? (
            <div className="text-green-400">
              <IoCheckmarkCircle className="w-5 h-5" />
            </div>
          ) : (
            <button
              onClick={handleAddToLibrary}
              disabled={isAdding}
              className={`transition-all duration-300 hover:scale-110 ${
                isAdded ? "text-green-400" : "text-purple-300 hover:text-white"
              }`}
            >
              {isAdded ? (
                <IoCheckmarkCircle className="w-5 h-5 animate-bounce" />
              ) : isAdding ? (
                <div className="w-5 h-5 border-2 border-purple-300 border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <IoAddCircleOutline className="w-5 h-5" />
              )}
            </button>
          )}
          <span
            className="absolute px-3 py-2 bg-gray-900 border border-purple-500/30 text-white text-xs rounded opacity-0 group-hover/button:opacity-100 transition-opacity duration-200 whitespace-nowrap shadow-xl pointer-events-none"
            style={{
              zIndex: 999999,
              bottom: "100%",
              right: "0",
              marginBottom: "8px",
            }}
          >
            {isInLibrary
              ? "Already in Library"
              : isAdded
              ? "Added!"
              : isAdding
              ? "Adding..."
              : "Add to Library"}
          </span>
        </div>
      </div>
      {isEditModalOpen &&
        ReactDOM.createPortal(
          <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center">
            <div 
              className="bg-white rounded-xl p-6 pr-0 w-full max-w-2xl relative"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                className="absolute top-2 right-2 text-gray-500 hover:text-red-500 text-xl"
                onClick={() => setIsEditModalOpen(false)}
              >
                <IoMdCloseCircle className="w-7 h-7" />
              </button>
              <h2 className="text-lg font-semibold mb-4 text-gray-800">
                Edit album
              </h2>
              <form onSubmit={handleEditSubmit} className="space-y-4 max-h-[calc(100vh-10rem)] pr-6 overflow-y-auto">

                <div className="grid grid-cols-2 gap-4">
                  <input
                      type="text"
                      name="title"
                      placeholder="Title"
                      value={editData.title}
                      onChange={handleEditAlbumChange}
                      required
                      className="border px-3 py-2 rounded"
                  />
                  <input
                      type="text"
                      name="artist"
                      placeholder="Artist"
                      value={editData.artist}
                      onChange={handleEditAlbumChange}
                      required
                      className="border px-3 py-2 rounded"
                  />
                  <input
                      type="number"
                      name="year"
                      placeholder="Year"
                      value={editData.year}
                      onChange={handleEditAlbumChange}
                      required
                      className="border px-3 py-2 rounded"
                  />
                  <input
                      type="text"
                      name="label"
                      placeholder="Label"
                      value={editData.label}
                      onChange={handleEditAlbumChange}
                      className="border px-3 py-2 rounded"
                  />
                  <input
                      type="text"
                      name="coverUrl"
                      placeholder="Link to the cover image"
                      value={editData.coverUrl}
                      onChange={handleEditAlbumChange}
                      className="col-span-2 border px-3 py-2 rounded"
                  />
                </div>

                <div className="mt-6">
                  <h3 className="font-semibold text-gray-700 mb-2">Tracks</h3>
                  {editData.tracks.map((track, index) => (
                      <div key={index} className="grid grid-cols-6 gap-2 mb-2 items-center">
                        <input
                            type="text"
                            name="title"
                            placeholder="Title"
                            value={track.title}
                            onChange={(e) => handleEditTrackChange(index, e)}
                            className="col-span-2 border px-2 py-1 rounded"
                            required
                        />
                        <input
                            type="text"
                            name="artist"
                            placeholder="Artist"
                            value={track.artist}
                            onChange={(e) => handleEditTrackChange(index, e)}
                            className="col-span-2 border px-2 py-1 rounded"
                        />
                        <input
                            type="number"
                            name="length"
                            placeholder="Length (seconds)"
                            value={track.length}
                            onChange={(e) => handleEditTrackChange(index, e)}
                            required
                            className="col-span-2 border px-2 py-1 rounded"
                        />
                        <input
                            type="text"
                            name="genre"
                            placeholder="Genre"
                            value={track.genre}
                            onChange={(e) => handleEditTrackChange(index, e)}
                            className="col-span-2 border px-2 py-1 rounded"
                        />
                        <input
                            type="number"
                            name="year"
                            placeholder="Year"
                            value={track.year}
                            onChange={(e) => handleEditTrackChange(index, e)}
                            className="border px-2 py-1 rounded"
                        />
                        <input
                            type="number"
                            name="nr"
                            placeholder="Nr"
                            value={track.nr}
                            onChange={(e) => handleEditTrackChange(index, e)}
                            className="border px-2 py-1 rounded"
                        />
                        <button
                            type="button"
                            onClick={() => handleRemoveEditTrack(index)}
                            className="col-span-2 bg-red-500 px-2 py-1 text-white hover:bg-red-700 rounded">
                          Remove
                        </button>
                      </div>
                  ))}
                  <button
                      type="button"
                      onClick={handleAddEditTrack}
                      className="mt-2 text-blue-500 hover:underline text-sm"
                  >
                    + Add another track
                  </button>
                </div>

                <button
                  type="submit"
                  className="mt-4 bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700 transition"
                >
                  Save changes
                </button>
              </form>
            </div>
          </div>,
        document.body
      )}
    </div>
  );
};

export default AlbumCard;

export const AddAlbumCard = () => {
  const { isLoggedIn, isAdmin } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [albumData, setAlbumData] = useState({
    title: "",
    artist: "",
    year: "",
    label: "",
    coverUrl: "",
    tracks: [
      {
        title: "",
        artist: "",
        year: "",
        length: "",
        genre: "",
        nr: "",
      },
    ],
  });

  const handleAlbumChange = (e) => {
    const { name, value } = e.target;
    setAlbumData({ ...albumData, [name]: value });
  };

  const handleTrackChange = (index, e) => {
    const { name, value } = e.target;
    const updatedTracks = [...albumData.tracks];
    updatedTracks[index][name] = value;
    setAlbumData({ ...albumData, tracks: updatedTracks });
  };

  const handleAddTrack = () => {
    setAlbumData({
      ...albumData,
      tracks: [
        ...albumData.tracks,
        {
          title: "",
          artist: "",
          year: "",
          length: "",
          genre: "",
          nr: "",
        },
      ],
    });
  };

  const handleRemoveTrack = (index) => {
    const updatedTracks = [...albumData.tracks];
    updatedTracks.splice(index, 1);
    setAlbumData({ ...albumData, tracks: updatedTracks });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Walidacja: przynajmniej 1 utwór i wymagane pola
    if (!albumData.title || !albumData.artist || albumData.tracks.length < 1) {
      toast.error("Album must have a title, an artist, a release year and at least one track.");
      return;
    }

    try {
      await albumService.createAlbum(albumData);
      toast.success("Album added successfully!");
      setIsModalOpen(false);
      setAlbumData({
        title: "",
        artist: "",
        year: "",
        label: "",
        coverUrl: "",
        tracks: [
          {
            title: "",
            artist: "",
            year: "",
            length: "",
            genre: "",
            nr: "",
          },
        ],
      });
      window.location.reload();
    } catch (error) {
      toast.error("An error occured while adding an album.");
      console.error("Create Album Error:", error);
    }
  };

  if (!isLoggedIn || !isAdmin) return null;

  return (
    <>
      <button
        onClick={() => setIsModalOpen(true)}
        className="cursor-pointer bg-black/20 border-2 border-dashed border-gray-400 rounded-lg flex items-center justify-center text-gray-400 hover:bg-gray-700 transition-colors duration-200"
      >
        <IoIosAdd className="w-12 h-12" />
      </button>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center">
          <div className="bg-white rounded-xl p-6 pr-0 w-full max-w-2xl relative">
            <button
              className="absolute top-2 right-2 text-gray-500 hover:text-red-500 text-xl"
              onClick={() => setIsModalOpen(false)}
            >
              <IoMdCloseCircle className="w-7 h-7" />
            </button>
            <h2 className="text-lg font-semibold mb-4 text-gray-800">
              Add new album
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4 max-h-[calc(100vh-10rem)] pr-6 overflow-y-auto">
              <div className="grid grid-cols-2 gap-4">
                <input
                  type="text"
                  name="title"
                  placeholder="Title"
                  value={albumData.title}
                  onChange={handleAlbumChange}
                  required
                  className="border px-3 py-2 rounded"
                />
                <input
                  type="text"
                  name="artist"
                  placeholder="Artist"
                  value={albumData.artist}
                  onChange={handleAlbumChange}
                  required
                  className="border px-3 py-2 rounded"
                />
                <input
                  type="number"
                  name="year"
                  placeholder="Year"
                  value={albumData.year}
                  onChange={handleAlbumChange}
                  required
                  className="border px-3 py-2 rounded"
                />
                <input
                  type="text"
                  name="label"
                  placeholder="Label"
                  value={albumData.label}
                  onChange={handleAlbumChange}
                  className="border px-3 py-2 rounded"
                />
                <input
                  type="text"
                  name="coverUrl"
                  placeholder="Link to the cover image"
                  value={albumData.coverUrl}
                  onChange={handleAlbumChange}
                  className="col-span-2 border px-3 py-2 rounded"
                />
              </div>

              <div className="mt-6">
                <h3 className="font-semibold text-gray-700 mb-2">Tracks</h3>
                {albumData.tracks.map((track, index) => (
                  <div key={index} className="grid grid-cols-6 gap-2 mb-2 items-center">
                    <input
                      type="text"
                      name="title"
                      placeholder="Title"
                      value={track.title}
                      onChange={(e) => handleTrackChange(index, e)}
                      className="col-span-2 border px-2 py-1 rounded"
                      required
                    />
                    <input
                      type="text"
                      name="artist"
                      placeholder="Artist"
                      value={track.artist}
                      onChange={(e) => handleTrackChange(index, e)}
                      className="col-span-2 border px-2 py-1 rounded"
                    />
                    <input
                        type="number"
                        name="length"
                        placeholder="Length (seconds)"
                        value={track.length}
                        onChange={(e) => handleTrackChange(index, e)}
                        required
                        className="col-span-2 border px-2 py-1 rounded"
                    />
                    <input
                        type="text"
                        name="genre"
                        placeholder="Genre"
                        value={track.genre}
                        onChange={(e) => handleTrackChange(index, e)}
                        className="col-span-2 border px-2 py-1 rounded"
                    />
                    <input
                      type="number"
                      name="year"
                      placeholder="Year"
                      value={track.year}
                      onChange={(e) => handleTrackChange(index, e)}
                      className="border px-2 py-1 rounded"
                    />
                    <input
                      type="number"
                      name="nr"
                      placeholder="Nr"
                      value={track.nr}
                      onChange={(e) => handleTrackChange(index, e)}
                      className="border px-2 py-1 rounded"
                    />
                    <button
                        type="button"
                        onClick={() => handleRemoveTrack(index)}
                        className="col-span-2 bg-red-500 px-2 py-1 text-white hover:bg-red-700 rounded">
                        Remove
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={handleAddTrack}
                  className="mt-2 text-blue-500 hover:underline text-sm"
                >
                  + Add another track
                </button>
              </div>

              <button
                type="submit"
                className="mt-4 bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700 transition"
              >
                Add album
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
};
