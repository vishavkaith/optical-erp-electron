import React, { useState } from "react";
import api from "../utils/api";

export default function EditPayment({ payment, onClose }) {
  const clientId = payment?.client_id ?? payment?.customer_id ?? "";

  const [form, setForm] = useState({
    id: payment?.id,
    client_id: clientId, // kept internally, not shown in form
    amount: payment?.amount ?? "",
    paid: payment?.paid ?? "",
    notes: payment?.notes ?? payment?.remark ?? "",
    mode: payment?.mode ?? "",
  });

  const [message, setMessage] = useState("");

  const computedBalance = (() => {
    const a = parseFloat(form.amount) || 0;
    const p = parseFloat(form.paid) || 0;
    return (a - p).toFixed(2);
  })();

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();

    try {
      const payload = {
        id: form.id,
        client_id: form.client_id, // still sent, just hidden
        amount: form.amount,
        paid: form.paid,
        notes: form.notes,
        mode: form.mode,
      };

      const res = await api.paymentUpdate(payload);

      setMessage("✅ Payment updated successfully!");

      document.dispatchEvent(
        new CustomEvent("app:refresh", { detail: { payments: true, clients: true } })
      );

      setTimeout(() => {
        setMessage("");
        onClose?.(true);
      }, 900);
    } catch (err) {
      console.error("Error updating payment:", err);
      setMessage("❌ " + (err.message || "Error updating payment."));
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 relative">
      <h3 className="text-lg font-semibold mb-2">Edit Payment</h3>

      {message && (
        <div className="absolute top-0 left-0 right-0 text-center py-1 bg-green-100 text-green-700 rounded mb-2">
          {message}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-6">
        {/* Amount */}
        <div>
          <label className="block text-sm font-medium">Amount</label>
          <input
            type="number"
            step="0.01"
            name="amount"
            value={form.amount}
            onChange={handleChange}
            className="w-full p-2 border rounded"
            required
          />
        </div>

        {/* Paid */}
        <div>
          <label className="block text-sm font-medium">Paid</label>
          <input
            type="number"
            step="0.01"
            name="paid"
            value={form.paid}
            onChange={handleChange}
            className="w-full p-2 border rounded"
            required
          />
        </div>

        {/* Balance (auto) */}
        <div>
          <label className="block text-sm font-medium">Balance</label>
          <input
            type="text"
            value={computedBalance}
            readOnly
            className="w-full p-2 border rounded bg-gray-100"
          />
        </div>

        {/* Mode */}
        <div>
          <label className="block text-sm font-medium">Mode</label>
          <select
            name="mode"
            value={form.mode}
            onChange={handleChange}
            className="w-full p-2 border rounded"
          >
            <option value="">Select</option>
            <option value="Cash">Cash</option>
            <option value="Card">Card</option>
            <option value="UPI">UPI</option>
            <option value="Bank Transfer">Bank Transfer</option>
          </select>
        </div>

        {/* Notes */}
        <div className="md:col-span-2">
          <label className="block text-sm font-medium">Notes / Remark</label>
          <input
            type="text"
            name="notes"
            value={form.notes}
            onChange={handleChange}
            className="w-full p-2 border rounded"
            placeholder="Optional note"
          />
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-4">
        <button
          type="button"
          onClick={() => onClose?.(false)}
          className="px-4 py-2 bg-gray-300 rounded"
        >
          Cancel
        </button>
        <button type="submit" className="px-4 py-2 bg-green-600 text-white rounded">
          Update
        </button>
      </div>
    </form>
  );
}
