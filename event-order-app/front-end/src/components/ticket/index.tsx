'use client'

import { ITicketParam } from "@/interface/ticket.interface";
import { Dialog } from "@headlessui/react";
import { Formik, Form, Field, ErrorMessage } from "formik";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import * as Yup from "yup";
import { useAppSelector } from "@/lib/redux/hooks";
import { useEffect, useState } from "react";

interface TicketDialogProps {
  open: boolean;
  onClose: () => void;
  onAddTicket: (ticket: any) => void;
}

export default function TicketDialog({
  open,
  onClose,
  onAddTicket
}: TicketDialogProps) {

  const [seats, setSeats] = useState<number>(0);
  const [end_date, setEndDate] = useState<string | null>(null);

  const storedSeat = (useAppSelector((state) => state.seat.seats));
  const storedDate = useAppSelector((state) => state.seat.end_date);

  useEffect(() =>{
    setSeats(storedSeat);
    console.log(storedSeat);
    setEndDate(storedDate);
  },[storedDate, storedSeat])

  const TicketSchema = Yup.object().shape({
    name: Yup.string().required("Name is required"),
    description: Yup.string().required("Description is required"),
    quota: Yup.number()
    .required("Number of seats is required")
    .test("is-positive", "Number of seats must be greater than 0", value => {
      return value !== undefined && value > 0;
    })
    .test("is-less-or-equal-seats", `Quota can't be more than remaining seats (${seats})`, value => {
      return value !== undefined && value <= seats;
    }),
    sales_start: Yup.date()
      .required("Sales start is required")
      .test("is-before-end", "Sales start must be before Sales End", function (value) {
        return !this.parent.sales_start || value <= this.parent.sales_end;
      })
      .test("is-more-than-event-end-date", "start sales date can't be more than end date event", function (value){
        return value.toLocaleDateString() < end_date!;
      }),    
    sales_end: Yup.date()
      .required("Sales end is required")
      .test("is-after-start", "Sales End date must be after Sales start", function (value) {
        return this.parent.sales_end || value >= this.parent.sales_start;
      })
      .test("is-more-than-event-end-date", "start sales date can't be more than end date event", function (value){
        return value.toLocaleDateString() < end_date!;
      }),    
  
  });
  
  return (
    <Dialog open={open} onClose={onClose} className="fixed z-10 inset-0 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4">
        <Dialog.Panel className="bg-white rounded-lg shadow-xl w-full max-w-lg p-6">
          <Dialog.Title className="text-xl font-bold mb-4">Add Ticket</Dialog.Title>
          <Formik<ITicketParam>
            initialValues={{
              id:0,
              name: "",
              description: "",
              quota: 0,
              price: 0,
              sales_start: null,
              sales_end: null,
              created_at: new Date,
              remaining: 0,
              type: "",
              updated_at : new Date,
              created_by_id : 0,
              event_id : 0              
            }}
            validationSchema={TicketSchema}
            onSubmit={(ticketValues) => {
              onAddTicket({ ...ticketValues });
              onClose();
            }}
          >
          {({ values, setFieldValue, setFieldTouched }) => (
            <Form className="space-y-4">
              <Field name="name">
                {({ field }: any) => (
                  <input {...field} className="w-full p-2 border border-gray-300 rounded-md" placeholder="Ticket Name" />
                )}
              </Field>
              <ErrorMessage
                name="name"
                component="div"
                className="text-red-500 text-sm"
              />              
              <Field name="description">
                {({ field }: any) => (
                  <textarea {...field} className="w-full p-2 h-32 border border-gray-300 rounded-md" placeholder="Description" />
                )}
              </Field>
              <ErrorMessage
                name="description"
                component="div"
                className="text-red-500 text-sm"
              />              
              <Field name="quota">
                {({ field, form }: any) => {
                  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
                    const value = e.target.value.replace(/\D/g, ""); // hanya angka
                    form.setFieldValue("quota", value);
                  };

                  return (
                    <input
                      {...field}
                      type="text" // tetap text biar bisa kontrol isi-nya
                      inputMode="numeric"
                      pattern="[0-9]*"
                      onChange={handleChange}
                      value={field.value}
                      className="w-full p-2 border border-gray-300 rounded-md"
                      placeholder="Quantity"
                    />
                  );
                }}
              </Field>
              <ErrorMessage
                name="quota"
                component="div"
                className="text-red-500 text-sm"
              />              
              <Field name="price">
                {({ field, form }: any) => {
                  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
                    const rawValue = e.target.value.replace(/\D/g, ""); // ambil angka saja
                    const numericValue = parseInt(rawValue || "0", 10);
                    form.setFieldValue("price", numericValue);
                  };

                  const formatted = new Intl.NumberFormat("id-ID", {
                    style: "currency",
                    currency: "IDR",
                    minimumFractionDigits: 0,
                  }).format(field.value || 0);

                  return (
                    <input
                      type="text"
                      inputMode="numeric"
                      value={formatted}
                      onChange={handleChange}
                      className="w-full p-2 border border-gray-300 rounded-md"
                      placeholder="Price"
                    />
                  );
                }}
              </Field>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <DatePicker
                    selected={values.sales_start ? new Date(values.sales_start) : null}
                    onChange={(date: Date | null) => 
                      {
                        setFieldValue("sales_start", date);
                        setFieldTouched("sales_start", true);
                      }}
                    dateFormat="dd-MM-yyyy"
                    className="w-full p-2 border border-gray-300 rounded-md"
                    placeholderText="Start Date"
                  />
                  <ErrorMessage
                    name="sales_start"
                    component="div"
                    className="text-red-500 text-sm"
                  />
                </div>
                <div>
                  <DatePicker
                    selected={values.sales_end ? new Date(values.sales_end) : null}
                    onChange={(date: Date | null) => 
                      {
                        setFieldValue("sales_end", date);
                        setFieldTouched("sales_end", true);
                      }}
                    dateFormat="dd-MM-yyyy"
                    className="w-full p-2 border border-gray-300 rounded-md"
                    placeholderText="End Date"
                  />
                  <ErrorMessage
                    name="sales_end"
                    component="div"
                    className="text-red-500 text-sm"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <button type="button" onClick={onClose} className="px-4 py-2 border border-gray-300 rounded-md">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-blue-500 text-white rounded-md">Save Ticket</button>
              </div>
            </Form>
          )}
          </Formik>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
}
