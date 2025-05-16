"use client";

import { Formik, Form, Field, ErrorMessage } from "formik";
import { useRouter } from "next/navigation";

import * as Yup from "yup";

// 1. Buat Yup schema sesuai IRegisterParam
const RegisterSchema = Yup.object().shape({
  email: Yup.string()
    .email("Invalid email address")
    .required("Email is required"),
  password: Yup.string().required("Password is required"),
  first_name: Yup.string().required("First name is required"),
  last_name: Yup.string().required("Last name is required"),
  role: Yup.string()
    .oneOf(["customer", "event_organizer"], "Invalid role")
    .required("Role is required"),
  referral_code: Yup.string().optional(),
});

export default function RegisterPage() {
  const router = useRouter();
  return (
    <section className="flex justify-center items-center min-h-screen bg-gradient-to-r from-slate-700 to-slate-900">
      <div className="bg-white p-8 rounded shadow-md w-full max-w-md">
        <h1 className="text-2xl font-bold mb-6 text-center text-sky-700 md:text-3xl lg:text-4xl">
          Register
        </h1>

        <Formik
          initialValues={{
            email: "",
            password: "",
            first_name: "",
            last_name: "",
            role: "customer",
            referral_code: "",
          }}
          validationSchema={RegisterSchema}
          onSubmit={async (values, { resetForm }) => {
            try {
              const res = await fetch(
                `${process.env.NEXT_PUBLIC_API_URL}/api/eventorder/auth/register`,
                {
                  method: "POST",
                  headers: {
                    "Content-Type": "application/json",
                  },
                  body: JSON.stringify(values),
                }
              );
              const responseText = await res.text(); // Mengambil respons sebagai teks
              console.log(responseText);
              if (!res.ok) {
                const errorData = await res.json();
                alert(`Gagal: ${errorData.message || "Terjadi kesalahan"}`);
              } else {
                alert("Berhasil daftar!");
                resetForm();
                router.push("/login");
              }
            } catch (error) {
              console.error(error);
              alert("Gagal koneksi ke server");
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

              {/* First Name */}
              <div>
                <label className="block text-gray-700 font-medium">
                  First Name:
                </label>
                <Field
                  name="first_name"
                  type="text"
                  className="w-full p-2 border rounded mt-1"
                />
                <ErrorMessage
                  name="first_name"
                  component="div"
                  className="text-red-500 text-sm"
                />
              </div>

              {/* Last Name */}
              <div>
                <label className="block text-gray-700 font-medium">
                  Last Name:
                </label>
                <Field
                  name="last_name"
                  type="text"
                  className="w-full p-2 border rounded mt-1"
                />
                <ErrorMessage
                  name="last_name"
                  component="div"
                  className="text-red-500 text-sm"
                />
              </div>

              {/* Role */}
              <div>
                <label className="block text-gray-700 font-medium">Role:</label>
                <Field
                  as="select"
                  name="role"
                  className="w-full p-2 border rounded mt-1"
                >
                  <option value="customer">Customer</option>
                  <option value="event_organizer">Event Organizer</option>
                </Field>
                <ErrorMessage
                  name="role"
                  component="div"
                  className="text-red-500 text-sm"
                />
              </div>

              {/* Referral Code */}
              <div>
                <label className="block text-gray-700 font-medium">
                  Referral Code (Opsional):
                </label>
                <Field
                  name="referral_code"
                  type="text"
                  className="w-full p-2 border rounded mt-1"
                />
                <ErrorMessage
                  name="referral_code"
                  component="div"
                  className="text-red-500 text-sm"
                />
              </div>

              <button
                type="submit"
                className="bg-sky-700 text-white p-2 rounded mt-4 hover:bg-sky-700"
              >
                Register
              </button>
            </Form>
          )}
        </Formik>
      </div>
    </section>
  );
}
