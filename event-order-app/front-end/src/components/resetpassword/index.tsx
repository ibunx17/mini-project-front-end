"use client";

import React, { useState } from "react";
import axios from "axios";
import { getCookie } from "cookies-next";
import { useRouter } from "next/navigation";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const ResetPasswordPage = () => {
  const router = useRouter();
  const [formData, setFormData] = useState({
    current_password: "",
    new_password: "",
    confirm_password: "",
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (formData.new_password !== formData.confirm_password) {
      toast.error("Password baru dan konfirmasi password tidak cocok");
      setLoading(false);
      return;
    }

    try {
      const token = getCookie("access_token");
      if (!token) {
        toast.error("Silakan login terlebih dahulu");
        router.push("/auth/login");
        return;
      }

      await axios.patch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/eventorder/reset-password`,
        {
          currentPassword: formData.current_password,
          newPassword: formData.new_password,
          confirmPassword: formData.confirm_password,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      toast.success("Password berhasil diubah!");
      router.push("/Profile");
    } catch (error) {
      console.error("Gagal mengubah password:", error);
      toast.error("Gagal mengubah password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-sky-100">
      <ToastContainer position="top-right" />
      <div className="bg-white p-8 rounded shadow-md w-full max-w-md">
        <h1 className="text-2xl font-bold text-center text-sky-700 mb-6">
          Reset Password
        </h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block font-medium text-gray-700 mb-1">
              Password Saat Ini
            </label>
            <input
              type="password"
              name="current_password"
              value={formData.current_password}
              onChange={handleChange}
              required
              className="w-full p-2 border rounded focus:ring-2 focus:ring-sky-500"
            />
          </div>

          <div>
            <label className="block font-medium text-gray-700 mb-1">
              Password Baru
            </label>
            <input
              type="password"
              name="new_password"
              value={formData.new_password}
              onChange={handleChange}
              required
              minLength={6}
              className="w-full p-2 border rounded focus:ring-2 focus:ring-sky-500"
            />
          </div>

          <div>
            <label className="block font-medium text-gray-700 mb-1">
              Konfirmasi Password Baru
            </label>
            <input
              type="password"
              name="confirm_password"
              value={formData.confirm_password}
              onChange={handleChange}
              required
              className="w-full p-2 border rounded focus:ring-2 focus:ring-sky-500"
            />
          </div>

          <div className="flex justify-between pt-4">
            <button
              type="button"
              onClick={() => router.push("/Profile")}
              className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
            >
              Kembali
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-sky-600 text-white rounded hover:bg-sky-700 disabled:bg-sky-300"
            >
              {loading ? "Memproses..." : "Simpan Password"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ResetPasswordPage;
