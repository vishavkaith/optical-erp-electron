// renderer/src/components/EditClient.jsx
import React, { useEffect, useState } from "react";
import api from "../utils/api";

export default function EditClient({ client, onClose }) {
  const [form, setForm] = useState({
    id: client?.id || null,
    name: client?.name || "",
    phone: client?.phone || "",
    address: client?.address || "",
    date: client?.date || new Date().toISOString().split("T")[0],
    r_sph: client?.r_sph || "",
    r_cyl: client?.r_cyl || "",
    r_axis: client?.r_axis || "",
    r_va: client?.r_va || "",
    r_add: client?.r_add || "",
    l_sph: client?.l_sph || "",
    l_cyl: client?.l_cyl || "",
    l_axis: client?.l_axis || "",
    l_va: client?.l_va || "",
    l_add: client?.l_add || "",
  });

  const [message, setMessage] = useState(null); // ✅ Inline message

  useEffect(() => {
    if (client) {
      setForm({
        id: client.id,
        name: client.name || "",
        phone: client.phone || "",
        address: client.address || "",
        date: client.date || new Date().toISOString().split("T")[0],
        r_sph: client.r_sph || "",
        r_cyl: client.r_cyl || "",
        r_axis: client.r_axis || "",
        r_va: client.r_va || "",
        r_add: client.r_add || "",
        l_sph: client.l_sph || "",
        l_cyl: client.l_cyl || "",
        l_axis: client.l_axis || "",
        l_va: client.l_va || "",
        l_add: client.l_add || "",
      });
    }
  }, [client]);

  const showMessage = (text, type = "success") => {
    setMessage({ text, type });
    setTimeout(() => setMessage(null), 3000);
  };

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.name.trim()) {
      showMessage("⚠️ Please enter name", "error");
      return;
    }

    try {
      const res = await api.customerUpdate(form);
      if (res && res.changes === 0) {
        showMessage("No changes were made.", "error");
        return;
      }

      showMessage("✅ Client updated successfully!");
      try {
        document.dispatchEvent(
          new CustomEvent("app:refresh", {
            detail: { clients: true, payments: true },
          })
        );
      } catch (e) {}

      // Delay closing slightly to let message appear before close
      setTimeout(onClose, 800);
    } catch (err) {
      console.error("Update failed", err);
      showMessage(
        "❌ Failed to update client: " + (err.message || "Unknown error"),
        "error"
      );
    }
  }

  const inputStyle = { color: "var(--text)", caretColor: "var(--text)" };
  const inputCls = "p-2 border rounded";

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <h3 className="text-lg font-semibold">Edit Client</h3>

      {/* ✅ Inline Notification */}
      {message && (
        <div
          className={`px-3 py-2 rounded text-sm ${
            message.type === "error"
              ? "bg-red-100 text-red-700"
              : "bg-green-100 text-green-700"
          }`}
        >
          {message.text}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div>
          <label className="block text-sm font-medium">Name</label>
          <input
            name="name"
            value={form.name}
            onChange={handleChange}
            className={`w-full ${inputCls}`}
            style={inputStyle}
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium">Phone</label>
          <input
            name="phone"
            value={form.phone}
            onChange={handleChange}
            className={`w-full ${inputCls}`}
            style={inputStyle}
          />
        </div>
        <div>
          <label className="block text-sm font-medium">Date</label>
          <input
            type="date"
            name="date"
            value={form.date}
            onChange={handleChange}
            className={`w-full ${inputCls}`}
            style={inputStyle}
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium">Address</label>
        <input
          name="address"
          value={form.address}
          onChange={handleChange}
          className={`w-full ${inputCls}`}
          style={inputStyle}
        />
      </div>

      <div>
        <h4 className="font-semibold">Right Eye</h4>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-2 mt-2">
          {["r_sph", "r_cyl", "r_axis", "r_va", "r_add"].map((f) => (
            <input
              key={f}
              name={f}
              value={form[f] || ""}
              onChange={handleChange}
              placeholder={f.replace("r_", "").toUpperCase()}
              className={inputCls}
              style={inputStyle}
            />
          ))}
        </div>
      </div>

      <div>
        <h4 className="font-semibold">Left Eye</h4>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-2 mt-2">
          {["l_sph", "l_cyl", "l_axis", "l_va", "l_add"].map((f) => (
            <input
              key={f}
              name={f}
              value={form[f] || ""}
              onChange={handleChange}
              placeholder={f.replace("l_", "").toUpperCase()}
              className={inputCls}
              style={inputStyle}
            />
          ))}
        </div>
      </div>

      <div className="flex justify-end gap-3 mt-4">
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
            onClose();
          }}
          className="px-4 py-2 bg-gray-300 rounded"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-4 py-2 bg-green-600 text-white rounded"
        >
          Update Client
        </button>
      </div>
    </form>
  );
}
