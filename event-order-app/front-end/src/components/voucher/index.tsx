'use client'

import { IVoucherParam } from "@/interface/voucher.interface";
import { Dialog } from "@headlessui/react";
import { Formik, Form, Field, ErrorMessage } from "formik";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import * as Yup from "yup"

interface VoucherDialogProps {
  open: boolean;
  onClose: () => void;
  onAddVoucher: (Voucher: any) => void;
}

const VoucherSchema = Yup.object().shape({
  code: Yup.string().required("Code is required").trim(),
  sales_start: Yup.date()
    .required("Sales start is required")
    .test("is-before-end", "Sales start must be before Sales End", function (value) {
      return this.parent.sales_start || value <= this.parent.sales_end;
    }),
  sales_end: Yup.date()
    .required("Sales end is required")
    .test("is-after-start", "Sales End date must be after Sales start", function (value) {
      return this.parent.sales_end || value >= this.parent.sales_start;
    }),
});

export default function VoucherDialog({
  open,
  onClose,
  onAddVoucher,
}: VoucherDialogProps) {
  return (
    <Dialog open={open} onClose={onClose} className="fixed z-10 inset-0 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4">
        <Dialog.Panel className="bg-white rounded-lg shadow-xl w-full max-w-lg p-6">
          <Dialog.Title className="text-xl font-bold mb-4">Add Voucher</Dialog.Title>
          <Formik<IVoucherParam>
            initialValues={{
              id: 0,
              code: "",
              description: "",
              discount_amount: 0,
              sales_start: null,
              sales_end: null,
              created_at: new Date,
              created_by_id: 0,
              event_id:0,
              updated_at: new Date
            }}
            validationSchema={VoucherSchema}
            onSubmit={(VoucherValues) => {
              onAddVoucher({ ...VoucherValues});
              onClose();
            }}
          >
          {({ values, setFieldValue, setFieldTouched }) => (
            <Form className="space-y-4">
              <Field name="code">
                {({ field }: any) => (
                  <input {...field} className="w-full p-2 border border-gray-300 rounded-md" placeholder="Voucher Code" />
                )}
              </Field>
              <ErrorMessage
                name="code"
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
              <Field name="discount_amount">
                {({ field, form }: any) => {
                  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
                    const rawValue = e.target.value.replace(/\D/g, ""); // ambil angka saja
                    const numericValue = parseInt(rawValue || "0", 10);
                    form.setFieldValue("discount_amount", numericValue);
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
                      placeholder="discount_amount"
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
                        setFieldTouched("sales_end", true)
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
                        setFieldValue("sales_end", date)
                        setFieldTouched("sales_end", true)
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
                <button type="submit" className="px-4 py-2 bg-blue-500 text-white rounded-md">Save Voucher</button>
              </div>
            </Form>
          )}
          </Formik>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
}
