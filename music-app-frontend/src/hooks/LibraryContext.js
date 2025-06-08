import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import { albumService } from "../services/albumService";
import { useAuth } from "./AuthContext";

const LibraryContext = createContext();

export const useLibrary = () => {
  const context = useContext(LibraryContext);
  if (!context) {
    throw new Error("useLibrary must be used within a LibraryProvider");
  }
  return context;
};

export const LibraryProvider = ({ children }) => {
  const { isLoggedIn } = useAuth();
  const [userLibrary, setUserLibrary] = useState([]);
  const [userTracks, setUserTracks] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchLibraryData = useCallback(async () => {
    if (!isLoggedIn) {
      setUserLibrary([]);
      setUserTracks([]);
      return;
    }

    try {
      setLoading(true);

      const [albumsResponse, tracksResponse] = await Promise.all([
        albumService.getUserLibrary().catch(() => []),
        albumService.getUserTracks().catch(() => []),
      ]);

      setUserLibrary(albumsResponse || []);
      setUserTracks(tracksResponse || []);
    } catch (error) {
      console.error("Failed to fetch library data:", error);
    } finally {
      setLoading(false);
    }
  }, [isLoggedIn]);

  // ładwanie biblioteki gdy user się zalog
  useEffect(() => {
    fetchLibraryData();
  }, [fetchLibraryData]);

  // sprawdza czy album jest w bibliotece
  const isAlbumInLibrary = useCallback(
    (albumId) => {
      return userLibrary.some(
        (libraryAlbum) =>
          libraryAlbum.id === albumId || libraryAlbum._id === albumId
      );
    },
    [userLibrary]
  );

  // sprawdza czy piosenka jest w bibliotece
  const isTrackInLibrary = useCallback(
    (trackId) => {
      return userTracks.some(
        (userTrack) => userTrack.id === trackId || userTrack._id === trackId
      );
    },
    [userTracks]
  );

  const addAlbumToLibrary = useCallback(
    async (albumId) => {
      await albumService.addToLibrary(albumId);
      // odświeżanie biblioteki
      await fetchLibraryData();
    },
    [fetchLibraryData]
  );

  const addTrackToLibrary = useCallback(
    async (trackId) => {
      await albumService.addTrack(trackId);
      // odświeżanie biblioteki
      await fetchLibraryData();
    },
    [fetchLibraryData]
  );

  const removeAlbumFromLibrary = useCallback(
    async (albumId) => {
      await albumService.removeFromLibrary(albumId);

      await fetchLibraryData();
    },
    [fetchLibraryData]
  );

  const removeTrackFromLibrary = useCallback(
    async (trackId) => {
      await albumService.removeTrack(trackId);

      await fetchLibraryData();
    },
    [fetchLibraryData]
  );

  const value = {
    userLibrary,
    userTracks,
    loading,
    isAlbumInLibrary,
    isTrackInLibrary,
    addAlbumToLibrary,
    addTrackToLibrary,
    removeAlbumFromLibrary,
    removeTrackFromLibrary,
    refreshLibrary: fetchLibraryData,
  };

  return (
    <LibraryContext.Provider value={value}>{children}</LibraryContext.Provider>
  );
};
