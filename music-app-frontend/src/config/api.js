const API_BASE_URL =
  process.env.REACT_APP_API_BASE_URL || "http://localhost:5064/api";

export const API_ENDPOINTS = {
  albums: {
    getAll: `${API_BASE_URL}/Albums`,
    getById: (id) => `${API_BASE_URL}/Albums/${id}`,
    search: (query) => `${API_BASE_URL}/Albums/search?query=${query}`,
    create: `${API_BASE_URL}/Albums`,
    update: (id) => `${API_BASE_URL}/Albums/${id}`,
    delete: (id) => `${API_BASE_URL}/Albums/${id}`,
  },
  auth: {
    login: `${API_BASE_URL}/sign-in`,
    register: `${API_BASE_URL}/sign-up`,
  },
  library: {
    getUserLibrary: `${API_BASE_URL}/Library/album`,
    addToLibrary: `${API_BASE_URL}/Library/albums`,
    removeFromLibrary: `${API_BASE_URL}/Library/albums`,
    getUserTracks: `${API_BASE_URL}/Library/tracks`,
    addTrack: `${API_BASE_URL}/Library/tracks`,
    removeTrack: `${API_BASE_URL}/Library/tracks`,
  },
  admin: {
    giveAdminRights: `${API_BASE_URL}/User/give-admin-rights`,
  },
};

export const apiRequest = async (url, options = {}) => {
  const token = localStorage.getItem("authToken");

  const config = {
    headers: {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
    ...options,
  };

  try {
    const response = await fetch(url, config);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    // funkcja sprawdzająca czy odpowiedź jest formacie json, tak- parsuje, nie- zwraca status o sukcesie
    const contentType = response.headers.get("content-type");
    if (contentType && contentType.includes("application/json")) {
      return await response.json();
    }

    return { success: true, status: response.status };
  } catch (error) {
    console.error("API request failed:", error);
    throw error;
  }
};

export const deleteAlbum = async (id) => {
  const url = API_ENDPOINTS.albums.delete(id);
  return await apiRequest(url, { method: "DELETE" });
};

export default API_BASE_URL;
