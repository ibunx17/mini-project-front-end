"use client";

import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { getCookie } from "cookies-next";
import { useRouter } from "next/navigation";
import { useAppSelector } from "@/lib/redux/hooks";
import { toast } from "react-toastify";
import api from "@/lib/axiosInstance";

const ProfilePage = () => {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const userAuth = useAppSelector((state) => state.auth);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isEditing, setIsEditing] = useState(false);

  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    email: "",
    profile_picture: "",
    referral_code: "",
    points: 0,
    role: "",
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [userPoints, setUserPoints] = useState<
    { point: number; expired_at: string }[]
  >([]);
  const [showPointsDetail, setShowPointsDetail] = useState(false);

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("user") || "null");
    setFormData({
      first_name: storedUser.first_name || "",
      last_name: storedUser.last_name || "",
      email: storedUser.email || "",
      profile_picture:
        storedUser.profile_picture || "Profile_avatar_placeholder_large.png",
      referral_code: storedUser.referral_code || "",
      points: storedUser.points || 0,
      role: storedUser.role || "",
    });
    setLoading(false);
  }, [userAuth]);

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("user") || "null");
    setFormData({
      first_name: storedUser.first_name || "",
      last_name: storedUser.last_name || "",
      email: storedUser.email || "",
      profile_picture:
        storedUser.profile_picture || "Profile_avatar_placeholder_large.png",
      referral_code: storedUser.referral_code || "",
      points: storedUser.points || 0,
      role: storedUser.role || "",
    });
    setLoading(false);

    // Fetch point detail
    if (storedUser?.id) {
      api
        .get(
          `${process.env.NEXT_PUBLIC_API_URL}/api/eventorder/points/by-user/${storedUser.id}`
        )
        .then((res) => {
          setUserPoints(res.data.data);
        })
        .catch(() => setUserPoints([]));
    }
  }, [userAuth]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];

      if (file.size > 2 * 1024 * 1024) {
        toast.error("Ukuran gambar maksimal 2MB");
        return;
      }

      setSelectedFile(file);

      const reader = new FileReader();
      reader.onload = (event) => {
        setFormData((prev) => ({
          ...prev,
          profile_picture: event.target?.result as string,
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemovePicture = async () => {
    if (!confirm("Yakin ingin menghapus foto profil?")) return;

    try {
      const token = getCookie("access_token");
      if (!token) {
        toast.error("Silakan login terlebih dahulu");
        return;
      }

      const response = await axios.delete(
        `${process.env.NEXT_PUBLIC_API_URL}/api/eventorder/profile/delete-profile-picture`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          withCredentials: true,
        }
      );

      if (response.data?.data) {
        localStorage.setItem("user", JSON.stringify(response.data.data));
        setFormData((prev) => ({
          ...prev,
          profile_picture:
            response.data.data.profile_picture ||
            "Profile_avatar_placeholder_large.png",
        }));
      } else {
        setFormData((prev) => ({
          ...prev,
          profile_picture: "Profile_avatar_placeholder_large.png",
        }));
      }
      setSelectedFile(null);
      toast.success("Foto profil berhasil dihapus");
    } catch (err: any) {
      console.error("Error detail:", err.response?.data);
      toast.error(err.response?.data?.message || "Gagal menghapus foto profil");
    }
  };

  const compressImage = async (file: File): Promise<Blob> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target?.result as string;

        img.onload = () => {
          const canvas = document.createElement("canvas");
          const MAX_WIDTH = 800;
          const scale = Math.min(MAX_WIDTH / img.width, 1);
          canvas.width = img.width * scale;
          canvas.height = img.height * scale;

          const ctx = canvas.getContext("2d");
          ctx?.drawImage(img, 0, 0, canvas.width, canvas.height);

          canvas.toBlob((blob) => resolve(blob as Blob), "image/jpeg", 0.7);
        };
      };
      reader.readAsDataURL(file);
    });
  };

  const handleSave = async () => {
    try {
      const token = getCookie("access_token");

      if (!token) {
        toast.error("Silakan login terlebih dahulu");
        return;
      }

      const formPayload = new FormData();
      formPayload.append("first_name", formData.first_name);
      formPayload.append("last_name", formData.last_name);
      formPayload.append("referral_code", formData.referral_code);

      if (selectedFile) {
        const compressedBlob = await compressImage(selectedFile);
        formPayload.append("profile_picture", compressedBlob, "profile.jpg");
      }

      const response = await axios.patch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/eventorder/profile/update-profile`,
        formPayload,
        {
          withCredentials: true,
        }
      );

      localStorage.setItem("user", JSON.stringify(response.data.data));
      setFormData({
        first_name: response.data.data.first_name || "",
        last_name: response.data.data.last_name || "",
        email: response.data.data.email || "",
        profile_picture:
          response.data.data.profile_picture ||
          "Profile_avatar_placeholder_large.png",
        referral_code: response.data.data.referral_code || "",
        points: response.data.data.points || 0,
        role: response.data.data.role || "",
      });
      setIsEditing(false);
      toast.success("Profil berhasil diperbarui!");
    } catch (err) {
      console.error("Gagal update profile:", err);
      toast.error("Gagal menyimpan perubahan profil.");
    }
  };

  if (loading)
    return <div className="text-center text-lg text-gray-600">Loading...</div>;
  if (error)
    return <div className="text-center text-lg text-red-500">{error}</div>;

  return (
    <section className="min-h-screen bg-stone-100 flex flex-col items-center pt-10 pb-24">
      {/* Tombol Back to Home */}
      <div className="w-full max-w-4xl flex items-center mb-8">
        <button
          onClick={() => router.push("/")}
          className="text-slate-700 hover:text-sky-600 flex items-center gap-1 text-base font-semibold"
        >
          <span className="text-xl">←</span> <span>Back to Home</span>
        </button>
      </div>

      {/* Card Profile */}
      <div className="w-full max-w-4xl bg-white rounded-2xl shadow-2xl flex flex-col md:flex-row gap-0 md:gap-10 px-4 md:px-16 py-12 border border-slate-200">
        {/* Sidebar Profile */}
        <div className="flex flex-col items-center md:items-start w-full md:w-1/3 mb-8 md:mb-0">
          <div className="relative flex flex-col items-center w-full">
            <img
              src={
                formData.profile_picture?.startsWith("data:")
                  ? formData.profile_picture
                  : formData.profile_picture?.startsWith("http")
                  ? formData.profile_picture
                  : `${process.env.NEXT_PUBLIC_API_URL}/${
                      formData.profile_picture ||
                      "Profile_avatar_placeholder_large.png"
                    }`
              }
              alt="Profile"
              className="w-44 h-44 rounded-full border-4 border-slate-700 shadow-xl object-cover bg-slate-100"
              onClick={() => isEditing && fileInputRef.current?.click()}
              onError={(e) => {
                (e.target as HTMLImageElement).src =
                  "/Profile_avatar_placeholder_large.png";
              }}
            />
            {/* Tombol ganti/hapus foto hanya saat edit */}
            {isEditing && (
              <div className="flex flex-row items-center gap-4 mt-6 mb-2">
                <label
                  className="flex items-center gap-1 text-sky-600 font-semibold cursor-pointer hover:underline"
                  title="Change Profile Picture"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M15.232 5.232l3.536 3.536M9 13l6-6m2 2a2.828 2.828 0 11-4-4l6 6a2.828 2.828 0 01-4 4z"
                    />
                  </svg>
                  Change Profile Picture
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleImageChange}
                    accept="image/jpeg, image/png, image/webp"
                    className="hidden"
                  />
                </label>
                {formData.profile_picture !==
                  "Profile_avatar_placeholder_large.png" && (
                  <button
                    onClick={handleRemovePicture}
                    className="text-red-500 hover:underline text-sm"
                    title="Remove Profile Picture"
                  >
                    Remove
                  </button>
                )}
              </div>
            )}
            {/* Role rata tengah */}
            <div className="w-full flex justify-center mt-10">
              <span className="inline-block bg-slate-100 text-slate-700 px-6 py-2 rounded-full text-base font-semibold shadow">
                {formData.role?.toUpperCase() || "-"}
              </span>
            </div>
          </div>
        </div>

        {/* Form Data User */}
        <div className="flex-1 flex flex-col gap-6 justify-center">
          {/* Nama & Email */}
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-slate-700 tracking-tight">
              {formData.first_name} {formData.last_name}
            </h1>
            <div className="flex items-center mt-2">
              <span className="inline-block bg-slate-100 text-slate-700 px-3 py-1 rounded-full text-sm font-semibold shadow">
                {formData.email}
              </span>
            </div>
          </div>
          {/* Inputan */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="font-medium text-slate-700">First Name:</label>
              <input
                type="text"
                name="first_name"
                value={formData.first_name}
                onChange={handleChange}
                disabled={!isEditing}
                className={`w-full p-3 border rounded mt-1 text-lg ${
                  isEditing
                    ? "bg-white border-slate-400"
                    : "bg-slate-100 border-slate-200"
                }`}
              />
            </div>
            <div>
              <label className="font-medium text-slate-700">Last Name:</label>
              <input
                type="text"
                name="last_name"
                value={formData.last_name}
                onChange={handleChange}
                disabled={!isEditing}
                className={`w-full p-3 border rounded mt-1 text-lg ${
                  isEditing
                    ? "bg-white border-slate-400"
                    : "bg-slate-100 border-slate-200"
                }`}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="font-medium text-slate-700">
                Referral Code:
              </label>
              <input
                type="text"
                name="referral_code"
                value={formData.referral_code}
                disabled
                className="w-full p-3 border rounded mt-1 bg-slate-100 border-slate-200 font-mono tracking-wider text-lg"
              />
            </div>
            <div>
              <label className="font-medium text-slate-700">Points:</label>
              <input
                type="text"
                name="points"
                value={formData.points}
                disabled
                className="w-full p-3 border rounded mt-1 bg-slate-100 border-slate-200 font-bold text-slate-7  00 text-lg"
              />
              {userPoints.length > 0 && (
                <div className="mt-2">
                  <button
                    type="button"
                    className="flex items-center gap-2 font-semibold text-slate-700 text-sm focus:outline-none"
                    onClick={() => setShowPointsDetail((v) => !v)}
                  >
                    <span>Detail Points</span>
                    <span
                      className={`transition-transform ${
                        showPointsDetail ? "rotate-90" : ""
                      }`}
                    >
                      ▼
                    </span>
                  </button>
                  {showPointsDetail && (
                    <ul className="space-y-1 mt-2 border rounded bg-slate-50 p-2 max-h-40 overflow-y-auto">
                      {userPoints.map((pt, idx) => (
                        <li
                          key={idx}
                          className="text-slate-600 text-xs flex gap-2"
                        >
                          <span className="font-bold">{pt.point} pts</span>
                          <span className="text-slate-400">
                            (expired:{" "}
                            {new Date(pt.expired_at).toLocaleDateString()})
                          </span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              )}
            </div>
          </div>

          {isEditing && (
            <div className="pt-2">
              <button
                type="button"
                onClick={() => router.push("/reset-password")}
                className="text-sky-600 hover:underline text-m"
              >
                Reset Password
              </button>
            </div>
          )}

          <div className="mt-8 flex justify-center gap-4">
            {isEditing ? (
              <>
                <button
                  className="bg-slate-700 text-white px-6 py-2 rounded-lg hover:bg-slate-800 shadow text-lg"
                  onClick={handleSave}
                >
                  Save Changes
                </button>
                <button
                  className="bg-slate-400 text-white px-6 py-2 rounded-lg hover:bg-slate-500 shadow text-lg"
                  onClick={() => {
                    setIsEditing(false);
                  }}
                >
                  Cancel
                </button>
              </>
            ) : (
              <button
                className="bg-slate-700 text-white px-6 py-2 rounded-lg hover:bg-slate-800 shadow text-lg"
                onClick={() => setIsEditing(true)}
              >
                Edit Profile
              </button>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default ProfilePage;
