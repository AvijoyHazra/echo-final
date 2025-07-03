// client/src/axios.js

import axios from "axios";

export const makeRequest = axios.create({
  baseURL: "http://34.219.141.197:8080/api/",
  withCredentials: true,
});

// --- CRITICAL MODIFICATION HERE ---
makeRequest.interceptors.request.use(
  (config) => {
    let token = null;
    try {
      const storedUser = localStorage.getItem("user"); // Get the item named "user"
      if (storedUser) {
        const parsedUser = JSON.parse(storedUser); // Parse the JSON string
        if (parsedUser && parsedUser.token) { // Access the 'token' property from the parsed object
          token = parsedUser.token;
        }
      }
    } catch (e) {
      console.error("Error retrieving token from localStorage:", e);
      // Optional: If parsing fails, it might mean corrupted data, so clear it.
      localStorage.removeItem("user");
    }

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// --- Your existing response interceptor (if any) should be here as well ---
makeRequest.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (
      (error.response.status === 401 || error.response.status === 403) &&
      !originalRequest._retry
    ) {
      originalRequest._retry = true;
      console.error(
        "Authentication/Authorization error. Token might be invalid or expired. Redirecting to login."
      );
      // Clear all auth-related storage
      localStorage.removeItem("user");
      sessionStorage.removeItem("activeSession"); // Add this if not already there
      window.location.href = "/login"; // Force redirect to login
    }
    return Promise.reject(error);
  }
);
