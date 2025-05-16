"use client";

import { Formik, Form, Field, ErrorMessage } from "formik";
import { useRouter } from "next/navigation";
import { useAppDispatch } from "@/lib/redux/hooks";
import * as Yup from "yup";
import { ToastContainer, toast } from "react-toastify";
import api from "@/lib/axiosInstance";
import axios from "axios";
import { login } from "@/lib/redux/slices/authSlice";
// 1. Buat Yup schema sesuai IRegisterParam
const LoginSchema = Yup.object().shape({
  email: Yup.string()
    .email("Invalid email address")
    .required("Email is required"),
  password: Yup.string().required("Password is required"),
});

export default function LoginPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  return (
    <section className="flex justify-center items-center min-h-screen bg-gradient-to-r from-slate-700 to-slate-900">
      <div className="bg-white p-8 rounded shadow-md w-full max-w-md">
        <h1 className="text-2xl font-bold mb-6 text-center text-sky-700 md:text-3xl lg:text-4xl">
          Login
        </h1>

        <Formik
          initialValues={{
            email: "",
            password: "",
          }}
          validationSchema={LoginSchema}
          onSubmit={async (values, { resetForm }) => {
            try {
              const res = await api.post(
                `${process.env.NEXT_PUBLIC_API_URL}/api/eventorder/auth/login`,
                values,
                {
                  withCredentials: true,
                  validateStatus: (status) => status < 500,
                }
              );

              console.log("Full response:", res);

              // 1. Cek jika response tidak valid
              if (!res.data) {
                toast.error("Terjadi kesalahan server");
                return;
              }

              // 2. Jika ada data.user, anggap sukses
              if (res.data.data?.email) {
                // Cek field spesifik
                toast.success("Berhasil login!");
                localStorage.setItem("user", JSON.stringify(res.data.data));
                dispatch(
                  login({
                    email: res.data.data.email,
                    first_name: res.data.data.first_name,
                    last_name: res.data.data.last_name,
                    profile_picture: res.data.data.profile_picture,
                    role: res.data.data.role,
                    referral_code: res.data.data.referral_code,
                    isLogin: true,
                  })
                );
                router.push("/");
              }
              // 3. Jika ada message error
              else if (res.data.message) {
                toast.error(res.data.message);
              }
              // 4. Fallback
              else {
                toast.error("Login gagal (response tidak valid)");
                console.error("Invalid response structure:", res.data);
              }
            } catch (error) {
              console.error("Login error:", error);
              toast.error(
                axios.isAxiosError(error)
                  ? error.response?.data?.message || "Terjadi kesalahan"
                  : "Gagal terhubung ke server"
              );
            }
          }}
        >
          {({ handleSubmit }) => (
            <Form onSubmit={handleSubmit} className="flex flex-col gap-4">
              {/* Email */}
              <div>
                <label className="block text-gray-700 font-medium">
                  Email:
                </label>
                <Field
                  name="email"
                  type="email"
                  className="w-full p-2 border rounded mt-1"
                />
                <ErrorMessage
                  name="email"
                  component="div"
                  className="text-red-500 text-sm"
                />
              </div>

              {/* Password */}
              <div>
                <label className="block text-gray-700 font-medium">
                  Password:
                </label>
                <Field
                  name="password"
                  type="password"
                  className="w-full p-2 border rounded mt-1"
                />
                <ErrorMessage
                  name="password"
                  component="div"
                  className="text-red-500 text-sm"
                />
              </div>

              <button
                type="submit"
                className="bg-sky-600 text-white p-2 rounded mt-4 hover:bg-sky-700"
              >
                Login
              </button>
            </Form>
          )}
        </Formik>
      </div>
    </section>
  );
}
