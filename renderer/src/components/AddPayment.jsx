import React, { useEffect, useState } from "react";
import api from "../utils/api";

export default function AddPayment({ onClose, onSave, selectedClient }) {
  const [clients, setClients] = useState([]);
  const [form, setForm] = useState({
    customer_id: selectedClient?.id || "",
    amount: "",
    paid: "",
    balance: 0,
    date: new Date().toISOString().split("T")[0],
    mode: "",
    remark: "",
  });
  const [message, setMessage] = useState(null); // ✅ toast message

  useEffect(() => {
    loadClients();
  }, []);

  const loadClients = async () => {
    try {
      const list = await api.customerList();
      setClients(list || []);
    } catch (err) {
      console.error("Error loading clients:", err);
    }
  };

  // ✅ Dynamic balance calculation
  const handleChange = (e) => {
    const { name, value } = e.target;
    let updatedForm = { ...form, [name]: value };

    if (["amount", "paid"].includes(name)) {
      const amount = parseFloat(updatedForm.amount || 0);
      const paid = parseFloat(updatedForm.paid || 0);
      updatedForm.balance = amount - paid;
    }

    setForm(updatedForm);
  };

  // ✅ Show small toast at bottom of modal
  const showToast = (msg, type = "success") => {
    setMessage({ text: msg, type });
    setTimeout(() => setMessage(null), 2500);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.paymentAdd(form);

      // ✅ Clear inputs before closing
      setForm({
        customer_id: selectedClient?.id || "",
        amount: "",
        paid: "",
        balance: 0,
        date: new Date().toISOString().split("T")[0],
        mode: "",
        remark: "",
      });

      // ✅ Show success message
      showToast("Payment added successfully!");

      // ✅ Delay close slightly to show toast clearly
      setTimeout(() => {
        try {
          document.dispatchEvent(
            new CustomEvent("app:refresh", { detail: { payments: true } })
          );
        } catch (e) {}
        onClose(true); // ✅ triggers reload + success toast in PaymentsPage
      }, 600);
    } catch (err) {
      console.error("Error adding payment:", err);
      showToast("Failed to add payment!", "error");
    }
  };

  return (
    <div className="relative">
      <h2 className="text-lg font-semibold mb-3">Add Payment</h2>

      <form onSubmit={handleSubmit} className="space-y-3">
        {/* ✅ Client Dropdown */}
        {!selectedClient && (
          <div>
            <label className="block text-sm font-medium mb-1">Client</label>
            <select
              name="customer_id"
              value={form.customer_id}
              onChange={handleChange}
              required
              className="w-full border rounded px-2 py-1"
            >
              <option value="">Select Client</option>
              {clients.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
        )}

        <div>
          <label className="block text-sm font-medium mb-1">Date</label>
          <input
            type="date"
            name="date"
            value={form.date}
            onChange={handleChange}
            className="w-full border rounded px-2 py-1"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Amount</label>
          <input
            type="text"
            inputMode="decimal"
            name="amount"
            value={form.amount}
            onChange={handleChange}
            className="w-full border rounded px-2 py-1"
            placeholder="0.00"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Paid</label>
          <input
            type="text"
            inputMode="decimal"
            name="paid"
            value={form.paid}
            onChange={handleChange}
            className="w-full border rounded px-2 py-1"
            placeholder="0.00"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Balance</label>
          <input
            type="text"
            name="balance"
            value={form.balance}
            readOnly
            aria-readonly="true"
            className="w-full border rounded px-2 py-1 bg-gray-100"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Mode</label>
          <input
            type="text"
            name="mode"
            value={form.mode}
            onChange={handleChange}
            placeholder="e.g. Cash / Card / UPI"
            className="w-full border rounded px-2 py-1"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Remark</label>
          <textarea
            name="remark"
            value={form.remark}
            onChange={handleChange}
            className="w-full border rounded px-2 py-1"
            placeholder="Optional note"
            rows={3}
          />
        </div>

        <div className="flex justify-end space-x-2 mt-3">
          <button
            type="button"
            onClick={() => {
              try {
                document.dispatchEvent(
                  new CustomEvent("app:refresh", {
                    detail: { clients: true, payments: true },
                  })
                );
              } catch (e) {}
              onClose(false);
            }}
            className="px-3 py-1 bg-gray-600 text-white rounded hover:bg-gray-700"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700"
          >
            Save
          </button>
        </div>
      </form>

      {/* ✅ Inline Toast */}
      {message && (
        <div
          className={`absolute left-0 right-0 bottom-0 mb-2 text-center text-sm px-3 py-2 rounded ${
            message.type === "success"
              ? "bg-green-100 text-green-700 border border-green-300"
              : "bg-red-100 text-red-700 border border-red-300"
          }`}
        >
          {message.text}
        </div>
      )}
    </div>
  );
}
