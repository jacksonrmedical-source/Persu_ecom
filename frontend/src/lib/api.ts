import axios from "axios";
import { supabase } from "./supabaseClient";

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL as string, // e.g. http://localhost:8000/api
});

// attach the Supabase access token to every request so the backend
// can identify the user for cart/orders/auth-gated routes
api.interceptors.request.use(async (config) => {
  const { data } = await supabase.auth.getSession();
  const token = data.session?.access_token;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
