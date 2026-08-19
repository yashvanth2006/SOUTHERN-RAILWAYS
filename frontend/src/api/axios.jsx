import axios from "axios";

const api = axios.create({
  baseURL: `${import.meta.env.VITE_API_URI}`, // backend
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  // Check if we are in a scoped view
  const match = window.location.pathname.match(/^\/master-admin\/scope\/([a-f0-9]+)\/?/i);
  if (match && match[1]) {
    config.headers["X-Scope-User"] = match[1];
  }

  const districtOverride = localStorage.getItem("active_super_admin_district");
  if (districtOverride) {
    config.headers["x-district-id"] = districtOverride;
  }
  return config;
});

export default api;
