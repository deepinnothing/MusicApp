import { API_ENDPOINTS, apiRequest } from "../config/api";

export const albumService = {
  async getAllAlbums() {
    return await apiRequest(API_ENDPOINTS.albums.getAll);
  },

  async getAlbumById(id) {
    return await apiRequest(API_ENDPOINTS.albums.getById(id));
  },

  async searchAlbums(query) {
    if (!query?.trim()) return [];
    return await apiRequest(
      API_ENDPOINTS.albums.search(encodeURIComponent(query))
    );
  },

  createAlbum: async (albumData) => {
    try {
      const cleanedData = Object.fromEntries(
        Object.entries(albumData).filter(([_, value]) => value !== ""));

      for (let i = 0; i < cleanedData.tracks.length; i++)
        cleanedData.tracks[i] = Object.fromEntries(
          Object.entries(cleanedData.tracks[i]).filter(([_, value]) => value !== ""));
      
      console.log(cleanedData);
      
      const data = await apiRequest(API_ENDPOINTS.albums.create, {
        method: "POST",
        body: JSON.stringify(cleanedData),
      });
      return data;
    } catch (error) {
      console.error("Failed to create album:", error);
      throw error;
    }
  },

  updateAlbum: async (id, albumData) => {
    try {
      const data = await apiRequest(API_ENDPOINTS.albums.update(id), {
        method: "PUT",
        body: JSON.stringify(albumData),
      });
      return data;
    } catch (error) {
      console.error("Failed to update album:", error);
      throw error;
    }
  },

  deleteAlbum: async (id) => {
    try {
      const data = await apiRequest(API_ENDPOINTS.albums.delete(id), {
        method: "DELETE",
      });
      return data;
    } catch (error) {
      console.error("Failed to delete album:", error);
      throw error;
    }
  },

  async getUserLibrary() {
    return await apiRequest(API_ENDPOINTS.library.getUserLibrary);
  },

  async getUserTracks() {
    return await apiRequest(API_ENDPOINTS.library.getUserTracks);
  },

  async addToLibrary(albumId) {
    return await apiRequest(API_ENDPOINTS.library.addToLibrary, {
      method: "PATCH",
      body: JSON.stringify(albumId),
    });
  },

  async removeFromLibrary(albumId) {
    return await apiRequest(
      `${API_ENDPOINTS.library.removeFromLibrary}/${albumId}`,
      {
        method: "DELETE",
      }
    );
  },

  async addTrack(trackId) {
    return await apiRequest(API_ENDPOINTS.library.addTrack, {
      method: "PATCH",
      body: JSON.stringify(trackId),
    });
  },

  async removeTrack(trackId) {
    return await apiRequest(`${API_ENDPOINTS.library.removeTrack}/${trackId}`, {
      method: "DELETE",
    });
  },
};
