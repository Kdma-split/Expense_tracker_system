import axios from "axios";
import Cookies from "js-cookie";

const API_BASE_URL = `${import.meta.env.VITE_API_URL || "http://localhost:5128"}/api`;

export const api = axios.create({
  baseURL: API_BASE_URL
});

api.interceptors.request.use((config) => {
  const token = Cookies.get("expense_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const toQueryString = (params) => {
  const search = new URLSearchParams();
  Object.entries(params || {}).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== "") {
      search.append(k, v);
    }
  });
  return search.toString();
};
