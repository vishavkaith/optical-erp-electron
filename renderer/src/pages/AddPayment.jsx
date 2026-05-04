// renderer/src/pages/AddPayment.jsx
import React, { useState } from "react";
import api from "../utils/api";

export default function AddPayment({ clientId, onClose, onPaymentAdded }) {
  const [form, setForm] = useState({
    client_id: clientId,
    amount: "",
    date: new Date().toISOString().split("T")[0],
    method: "Cash",
    notes: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.paymentAdd(form);
      onPaymentAdded(); // Refresh payment list
      onClose(); // Close modal
    } catch (error) {
      console.error("Failed to add payment:", error);
      alert("Error adding payment!");
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white p-6 rounded-lg w-96">
        <h2 className="text-xl font-semibold mb-4">Add Payment</h2>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="block text-sm font-medium">Amount</label>
            <input
              type="number"
              name="amount"
              value={form.amount}
              onChange={handleChange}
              className="w-full border px-3 py-1 rounded"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium">Date</label>
            <input
              type="date"
              name="date"
              value={form.date}
              onChange={handleChange}
              className="w-full border px-3 py-1 rounded"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium">Method</label>
            <select
              name="method"
              value={form.method}
              onChange={handleChange}
              className="w-full border px-3 py-1 rounded"
            >
              <option value="Cash">Cash</option>
              <option value="Card">Card</option>
              <option value="UPI">UPI</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium">Notes</label>
            <textarea
              name="notes"
              value={form.notes}
              onChange={handleChange}
              className="w-full border px-3 py-1 rounded"
            />
          </div>

          <div className="flex justify-end space-x-3 mt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
