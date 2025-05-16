import axios from "axios";
import { deleteCookie } from "cookies-next";
import Router from "next/router";
import { toast } from "react-toastify";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  withCredentials: true,
});

// Response interceptor
api.interceptors.response.use(
  (res) => res,
  async (err) => {
    const originalRequest = err.config;

    if (err.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        // Refresh token endpoint juga akan membaca refresh_token dari cookie
        await axios.post(
          `${process.env.NEXT_PUBLIC_API_URL}/api/eventorder/auth/refresh-token`,
          null,
          { withCredentials: true }
        );

        // Tanpa perlu set header Authorization, karena token baru akan disimpan di cookie juga
        return api(originalRequest); // retry request
      } catch (refreshError) {
        console.log("Refresh token failed, logging out...");
        // Redirect ke login atau hapus cookie client-side jika perlu
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(err);
  }
);

export default api;
