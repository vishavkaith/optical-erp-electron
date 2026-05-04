// renderer/src/components/AddClient.jsx
import React, { useEffect, useState, useRef } from "react";
import api from "../utils/api";

export default function AddClient({ onClose }) {
  const [form, setForm] = useState({
    name: "",
    phone: "",
    address: "",
    date: new Date().toISOString().split("T")[0],
    r_sph: "",
    l_sph: "",
    r_cyl: "",
    l_cyl: "",
    r_axis: "",
    l_axis: "",
    r_va: "",
    l_va: "",
    r_add: "",
    l_add: "",
    pd: "",
    addition: "",
    remarks: "",
  });

  const nameInputRef = useRef(null);

  useEffect(() => {
    // Autofocus when modal opens
    if (nameInputRef.current) {
      nameInputRef.current.focus();
    }

    // When component unmounts (modal closes) we let parent handle focus.
    // No window.alert usage to avoid OS focus stealing.
  }, []);

  const clearForm = () => {
    setForm({
      name: "",
      phone: "",
      address: "",
      date: new Date().toISOString().split("T")[0],
      r_sph: "",
      l_sph: "",
      r_cyl: "",
      l_cyl: "",
      r_axis: "",
      l_axis: "",
      r_va: "",
      l_va: "",
      r_add: "",
      l_add: "",
      pd: "",
      addition: "",
      remarks: "",
    });
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) {
      // local validation message inside modal (no alert)
      document.dispatchEvent(
        new CustomEvent("app:notify", {
          detail: { message: "Please enter a client name", type: "warning" },
        })
      );
      if (nameInputRef.current) nameInputRef.current.focus();
      return;
    }

    try {
      const res = await api.customerAdd(form);
      if (res?.success) {
        // notify parent (non-blocking)
        document.dispatchEvent(
          new CustomEvent("app:notify", {
            detail: { message: "Client added successfully!", type: "success" },
          })
        );

        // refresh list in parent
        document.dispatchEvent(
          new CustomEvent("app:refresh", {
            detail: { clients: true, payments: true },
          })
        );

        // clear the form (optional) and close modal
        clearForm();
        if (onClose) onClose();
      } else {
        document.dispatchEvent(
          new CustomEvent("app:notify", {
            detail: { message: "Failed to add client", type: "error" },
          })
        );
      }
    } catch (err) {
      console.error("Error adding client:", err);
      document.dispatchEvent(
        new CustomEvent("app:notify", {
          detail: { message: "Something went wrong while saving client.", type: "error" },
        })
      );
    }
  };

  const inputStyle = { color: "var(--text)", caretColor: "var(--text)" };
  const inputCls =
    "border p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500";

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-3">Add Client</h2>

      <form onSubmit={handleSubmit} className="grid gap-3">
        {/* Basic Info */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <input
            ref={nameInputRef}
            name="name"
            placeholder="Name"
            value={form.name}
            onChange={handleChange}
            className={inputCls}
            style={inputStyle}
            required
            autoFocus
          />
          <input
            name="phone"
            placeholder="Phone"
            value={form.phone}
            onChange={handleChange}
            className={inputCls}
            style={inputStyle}
          />
          <input
            type="date"
            name="date"
            value={form.date}
            onChange={handleChange}
            className={inputCls}
            style={inputStyle}
          />
        </div>

        <input
          name="address"
          placeholder="Address"
          value={form.address}
          onChange={handleChange}
          className={inputCls}
          style={inputStyle}
        />

        {/* Right Eye */}
        <div>
          <h4 className="font-semibold mt-3">Right Eye</h4>
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

        {/* Left Eye */}
        <div>
          <h4 className="font-semibold mt-3">Left Eye</h4>
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

        {/* Remarks */}
        <textarea
          name="remarks"
          placeholder="Remarks"
          value={form.remarks}
          onChange={handleChange}
          className={inputCls}
          style={inputStyle}
        />

        {/* Buttons */}
        <div className="flex justify-end space-x-2 mt-4">
          <button
            type="submit"
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
          >
            Save
          </button>
          <button
            type="button"
            onClick={() => {
              if (onClose) onClose();
            }}
            className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
