"use client";

import React, { useState, useEffect } from "react";
import { Formik, Field, Form, FieldArray, ErrorMessage } from "formik";
import DatePicker, { registerLocale } from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { EditorContent, useEditor } from "@tiptap/react";
import { StarterKit } from "@tiptap/starter-kit";
import MenuBar from "@/components/event/menu-bar";
import TextAlign from "@tiptap/extension-text-align";
import Highlight from "@tiptap/extension-highlight";
import TicketDialog from "@/components/ticket";
import VoucherDialog from "@/components/voucher";
import api from "@/lib/axiosInstance";
import { IEvent } from "@/interface/event.interface";
import { IEventCategoryParam } from "@/interface/event-category.interface";
import { id } from "date-fns/locale";
import { IUserParam } from "@/interface/user.interface";
import * as Yup from "yup";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { useAppDispatch } from "@/lib/redux/hooks";
import { setRemainingSeats } from "@/lib/redux/slices/seatSlice";

registerLocale("id", id);


interface FilterState {
  seats : number;
  end_date : string | null;
}

const EventSchema = Yup.object().shape({
  name: Yup.string().required("Name is required"),
  category_id: Yup.number()
    .required("Category is required")
    .min(1, "Category must be selected"), // Harus dipilih
  start_date: Yup.date()
    .required("Start date is required")
    .test(
      "is-before-end",
      "Start date must be before end date",
      function (value) {
        return !this.parent.end_date || value <= this.parent.end_date;
      }
    ),
  end_date: Yup.date()
    .required("End date is required")
    .test(
      "is-after-start",
      "End date must be after start date",
      function (value) {
        return !this.parent.start_date || value >= this.parent.start_date;
      }
    ),
  location: Yup.string().required("Location is required"),
  available_seats: Yup.number()
    .required("Available seats is required")
    .min(1, "Available seats must be more than 0"), // Harus diisi dan lebih dari 0
  status: Yup.string()
    .required("Status is required")
    .test(
      "is-valid-status",
      "Status must be selected from combobox",
      function (value) {
        return value !== ""; // Validasi dasar status dari combobox
      }
    ),
  tickets: Yup.array()
    .min(1, "At least one ticket is required") // Harus ada minimal satu tiket
    .required("Tickets are required"),
});

export default function EventDetail() {
  const [ticketDialogOpen, setTicketDialogOpen] = useState(false);
  const [voucherDialogOpen, setVoucherDialogOpen] = useState(false);
  const [categories, setcategories] = useState<IEventCategoryParam[]>([]);
  const [storedUser, setStoredUser] = useState<IUserParam | null>(null);
  const dispatch = useAppDispatch();

  const router = useRouter();
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        bulletList: {
          HTMLAttributes: {
            class: "list-disc ml-3",
          },
        },
        orderedList: {
          HTMLAttributes: {
            class: "list-decimal ml-3",
          },
        },
      }),
      TextAlign.configure({
        types: ["heading", "paragraph"],
      }),
      Highlight,
    ],
    content: "", // Starting content for the editor
    editorProps: {
      attributes: {
        class: "min-h-[200px] border rounded-md bg-slate-50 py-2 px-3",
      },
    },
  });

  useEffect(() => {
    const user = JSON.parse(
      localStorage.getItem("user") || "null"
    ) as IUserParam;
    setStoredUser(user);
    api
      .get(
        `${process.env.NEXT_PUBLIC_API_URL}/api/eventorder/event-categories`,
        {
          withCredentials: true,
        }
      )
      .then((res) => setcategories(res.data.data))
      .catch((err) => {});
  }, []);

  return (
    <>
      <div className="bg-slate-700 min-h-screen py-8">
        <div className="max-w-md mx-auto p-4 bg-white rounded-2xl shadow-xl border border-slate-200">
          <h1 className="text-3xl font-extrabold mb-6 text-slate-700 text-center tracking-tight">
            Create New Event
          </h1>
          <Formik<IEvent>
            initialValues={{
              id: 0,
              organizer_id: 0,
              name: "",
              banner_url: "",
              description: "",
              category_id: 0,
              start_date: null,
              end_date: null,
              location: "",
              available_seats: 0,
              status: "",
              created_at: new Date(),
              updated_at: new Date(),
              tickets: [],
              vouchers: [],
              category: null,
              organizer: null,
            }}
            validationSchema={EventSchema}
            onSubmit={async (values) => {
              try {
                const formData = new FormData();

                formData.append("organizer_id", storedUser!.id.toString());
                formData.append("name", values.name);
                formData.append(
                  "description",
                  JSON.stringify(editor?.getJSON() || {})
                );
                formData.append("category_id", values.category_id.toString());
                formData.append(
                  "start_date",
                  values.start_date?.toISOString() || ""
                );
                formData.append(
                  "end_date",
                  values.end_date?.toISOString() || ""
                );
                formData.append("location", values.location);
                formData.append(
                  "available_seats",
                  values.available_seats.toString()
                );
                formData.append("status", values.status);

                if (values.banner_url) {
                  formData.append("banner_url", values.banner_url);
                }

                const tickets = values.tickets.map((ticket) => ({
                  ...ticket,
                  type: ticket.price > 0 ? "Paid" : "Free",
                  created_by_id: storedUser!.id,
                  remaining: ticket.quota,
                }));

                formData.append("tickets", JSON.stringify(tickets));

                const vouchers = values.vouchers.map((voucher) => ({
                  ...voucher,
                  created_by_id: storedUser!.id,
                }));
                formData.append("vouchers", JSON.stringify(vouchers));

                await api.post(
                  `${process.env.NEXT_PUBLIC_API_URL}/api/eventorder/events`,
                  formData,
                  {
                    withCredentials: true,
                  }
                );

                toast.success("Event saved successfully!");
                router.push("/dashboard");
              } catch (error) {
                toast.error("Failed to save event");
              }
            }}
          >
            {({ values, setFieldValue, setFieldTouched }) => (
              <Form className="space-y-6">
                {/* Event Name */}
                <div>
                  <Field name="name">
                    {({ field }: any) => (
                      <input
                        {...field}
                        className="w-full p-3 border-2 border-slate-200 rounded-lg focus:border-sky-400 focus:ring-2 focus:ring-sky-100 transition"
                        placeholder="Event Name"
                      />
                    )}
                  </Field>
                  <ErrorMessage
                    name="name"
                    component="div"
                    className="text-red-500 text-sm mt-1"
                  />
                </div>
                {/* Category */}
                <div>
                  <Field
                    as="select"
                    name="category_id"
                    className="py-3 px-3 rounded-lg text-slate-700 border-2 border-slate-200 bg-white w-full focus:border-sky-400 focus:ring-2 focus:ring-sky-100 transition"
                  >
                    <option value="">Select Category</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                  </Field>
                  <ErrorMessage
                    name="category_id"
                    component="div"
                    className="text-red-500 text-sm mt-1"
                  />
                </div>
                {/* Banner */}
                <div>
                  <label className="block text-sm font-semibold mb-1 text-slate-700">
                    Banner
                  </label>
                  <input
                    name="banner_url"
                    type="file"
                    accept="image/*"
                    onChange={(event) => {
                      const file = event.currentTarget.files?.[0];
                      setFieldValue("banner_url", file);
                    }}
                    className="w-full p-3 border-2 border-slate-200 rounded-lg bg-white focus:border-sky-400 focus:ring-2 focus:ring-sky-100 transition"
                  />
                  <ErrorMessage
                    name="banner_url"
                    component="div"
                    className="text-red-500 text-sm mt-1"
                  />
                </div>
                {/* Description */}
                <div>
                  <label className="block text-sm font-semibold mb-1 text-slate-700">
                    Description
                  </label>
                  <div className="border-2 border-slate-200 p-4 rounded-lg bg-slate-50">
                    <MenuBar editor={editor} />
                    <EditorContent editor={editor} />
                  </div>
                </div>
                {/* Date Pickers */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold mb-1 text-slate-700">
                      Start Date
                    </label>
                    <DatePicker
                      selected={values.start_date}
                      onChange={(date: Date | null) => {
                        setFieldValue("start_date", date);
                        setFieldTouched("start_date", true);
                      }}
                      placeholderText="Sell start date"
                      showTimeSelect
                      timeFormat="HH:mm"
                      timeIntervals={15}
                      dateFormat="Pp"
                      locale="id"
                      className="w-full p-3 border-2 border-slate-200 rounded-lg focus:border-sky-400 focus:ring-2 focus:ring-sky-100 transition"
                    />
                    <ErrorMessage
                      name="start_date"
                      component="div"
                      className="text-red-500 text-sm mt-1"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-1 text-slate-700">
                      End Date
                    </label>
                    <DatePicker
                      selected={values.end_date}
                      onChange={(date: Date | null) => {
                        setFieldValue("end_date", date);
                        setFieldTouched("end_date", true);
                      }}
                      placeholderText="Sell end date"
                      showTimeSelect
                      timeFormat="HH:mm"
                      timeIntervals={15}
                      dateFormat="Pp"
                      locale="id"
                      className="w-full p-3 border-2 border-slate-200 rounded-lg focus:border-sky-400 focus:ring-2 focus:ring-sky-100 transition"
                    />
                    <ErrorMessage
                      name="end_date"
                      component="div"
                      className="text-red-500 text-sm mt-1"
                    />
                  </div>
                </div>
                {/* Location */}
                <div>
                  <Field name="location">
                    {({ field }: any) => (
                      <input
                        {...field}
                        className="w-full p-3 border-2 border-slate-200 rounded-lg focus:border-sky-400 focus:ring-2 focus:ring-sky-100 transition"
                        placeholder="Location"
                      />
                    )}
                  </Field>
                  <ErrorMessage
                    name="location"
                    component="div"
                    className="text-red-500 text-sm mt-1"
                  />
                </div>
                {/* Available Seats */}
                <div>
                  <Field name="available_seats">
                    {({ field, form }: any) => {
                      const handleChange = (
                        e: React.ChangeEvent<HTMLInputElement>
                      ) => {
                        const value = e.target.value.replace(/\D/g, "");
                        form.setFieldValue("available_seats", value);
                      };

                      return (
                        <input
                          {...field}
                          type="text"
                          inputMode="numeric"
                          pattern="[0-9]*"
                          onChange={handleChange}
                          value={field.value}
                          className="w-full p-3 border-2 border-slate-200 rounded-lg focus:border-sky-400 focus:ring-2 focus:ring-sky-100 transition"
                          placeholder="Number of seats"
                        />
                      );
                    }}
                  </Field>
                  <ErrorMessage
                    name="available_seats"
                    component="div"
                    className="text-red-500 text-sm mt-1"
                  />
                </div>
                {/* Status */}
                <div>
                  <Field name="status">
                    {({ field }: any) => (
                      <select
                        {...field}
                        className="w-full p-3 border-2 border-slate-200 rounded-lg focus:border-sky-400 focus:ring-2 focus:ring-sky-100 transition"
                      >
                        <option value="">Pilih status</option>
                        <option value="Draft">Draft</option>
                        <option value="Publish">Publish</option>
                      </select>
                    )}
                  </Field>
                  <ErrorMessage
                    name="status"
                    component="div"
                    className="text-red-500 text-sm mt-1"
                  />
                </div>
                {/* Ticket & Voucher Buttons */}
                <div className="flex gap-4">
                  <button
                    type="button"
                    className="w-[120px] px-4 py-2 bg-sky-400 hover:bg-sky-500 text-slate-800 font-bold rounded-lg shadow transition"
                    onClick={() => {
                      const seatState: FilterState = {
                        seats : values.available_seats,
                        end_date: values.end_date ? values.end_date.toISOString() : null,
                      };                
                      dispatch(setRemainingSeats(seatState));      
                      setTicketDialogOpen(true)
                    }}
                  >
                    + Ticket
                  </button>
                  <button
                    type="button"
                    className="w-[120px] px-4 py-2 bg-slate-700 hover:bg-slate-800 text-white font-bold rounded-lg shadow transition"
                    onClick={() => setVoucherDialogOpen(true)}
                  >
                    + Voucher
                  </button>
                </div>
                {/* Ticket & Voucher List */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <FieldArray name="tickets">
                      {({ remove }) => (
                        <div className="mt-2">
                          {values.tickets.map((ticket: any, index: number) => (
                            <div
                              key={index}
                              className="p-3 border-2 border-sky-100 rounded-lg mb-2 bg-sky-50 shadow-sm"
                            >
                              <p className="font-bold text-slate-700">Ticket</p>
                              <p className="font-semibold text-sky-700">
                                🎟 {ticket.name} ({ticket.type})
                              </p>
                              <p className="text-slate-600">
                                {ticket.description}
                              </p>
                              <p className="text-slate-600">
                                Qty: {ticket.quota} | Price: {ticket.price}
                              </p>
                              <p className="text-slate-600">
                                Sell: {ticket.sales_start.toLocaleDateString()}{" "}
                                - {ticket.sales_end.toLocaleDateString()}
                              </p>
                              <button
                                type="button"
                                onClick={() => remove(index)}
                                className="mt-2 px-4 py-2 bg-rose-500 hover:bg-rose-600 text-white rounded-md transition"
                              >
                                🗑 Remove
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </FieldArray>
                  </div>
                  <div>
                    <FieldArray name="vouchers">
                      {({ remove }) => (
                        <div className="mt-2">
                          {values.vouchers.map(
                            (voucher: any, index: number) => (
                              <div
                                key={index}
                                className="p-3 border-2 border-slate-200 rounded-lg mb-2 bg-slate-50 shadow-sm"
                              >
                                <p className="font-bold text-slate-700">
                                  Voucher
                                </p>
                                <p className="font-semibold text-sky-700">
                                  🎟 {voucher.code}
                                </p>
                                <p className="text-slate-600">
                                  {voucher.description}
                                </p>
                                <p className="text-slate-600">
                                  {voucher.discount_amount}
                                </p>
                                <p className="text-slate-600">
                                  Sell:{" "}
                                  {voucher.sales_start.toLocaleDateString()} -{" "}
                                  {voucher.sales_end.toLocaleDateString()}
                                </p>
                                <button
                                  type="button"
                                  onClick={() => remove(index)}
                                  className="mt-2 px-4 py-2 bg-rose-500 hover:bg-rose-600 text-white rounded-md transition"
                                >
                                  🗑 Remove
                                </button>
                              </div>
                            )
                          )}
                        </div>
                      )}
                    </FieldArray>
                  </div>
                </div>
                {/* Submit & Cancel */}
                <div className="flex justify-end gap-4">
                  <button
                    type="submit"
                    className="w-[120px] px-6 py-3 bg-sky-400 hover:bg-sky-500 text-slate-800 font-bold rounded-lg shadow transition"
                  >
                    Submit
                  </button>
                  <button
                    type="reset"
                    className="w-[120px] px-6 py-3 bg-slate-700 hover:bg-slate-800 text-white font-bold rounded-lg shadow transition"
                    onClick={() => router.push("/dashboard")}
                  >
                    Cancel
                  </button>
                </div>
                {/* Dialogs */}
                <TicketDialog
                  open={ticketDialogOpen}
                  onClose={() => setTicketDialogOpen(false)}
                  onAddTicket={(ticket) =>
                    setFieldValue("tickets", [...values.tickets, ticket])
                  }
                />
                <VoucherDialog
                  open={voucherDialogOpen}
                  onClose={() => setVoucherDialogOpen(false)}
                  onAddVoucher={(voucher) =>
                    setFieldValue("vouchers", [...values.vouchers, voucher])
                  }
                />
              </Form>
            )}
          </Formik>
        </div>
      </div>
    </>
  );
}
