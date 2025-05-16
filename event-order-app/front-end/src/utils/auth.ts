import api from "@/lib/axiosInstance";

const API_URL = process.env.NEXT_PUBLIC_API_URL; // Menggunakan URL dari .env

export const register = async (data: {
  email: string;
  password: string;
  first_name: string;
  last_name: string;
  role: string;
}) => {
  const response = await api.post(
    `${API_URL}/api/eventorder/auth/register`,
    data
  );
  return response.data;
};

export const login = async (data: { email: string; password: string }) => {
  const response = await api.post(
    `${API_URL}/api/eventorder/auth/login`,
    data
  );
  return response.data;
};

export const setAuthToken = (token: string) => {
  if (token) {
    api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
  } else {
    delete api.defaults.headers.common["Authorization"];
  }
};