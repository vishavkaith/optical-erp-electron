import React, { useState } from "react";
import PaymentDetails from "../components/PaymentDetails";
import AddPayment from "../components/AddPayment";

export default function ClientDetails({ client, onClose }) {
  const [showPayments, setShowPayments] = useState(false);
  const [showAddPayment, setShowAddPayment] = useState(false);
  const [refreshPayments, setRefreshPayments] = useState(false); // 🔄 trigger
  const [message, setMessage] = useState(null); // ✅ Inline message

  const handlePrint = () => {
    window.print();
  };

  const handlePaymentAdded = () => {
    setShowAddPayment(false);
    setShowPayments(true); // Automatically show payments after adding
    setRefreshPayments((prev) => !prev); // toggle to trigger refresh
    showMessage("✅ Payment added successfully!");
  };

  const showMessage = (msg, type = "success") => {
    setMessage({ text: msg, type });
    setTimeout(() => setMessage(null), 3000);
  };

  return (
    <div>
      <h2 className="text-xl font-bold mb-3">Client Details</h2>

      {/* ✅ Inline Message */}
      {message && (
        <div
          className={`mb-3 px-3 py-2 rounded text-sm ${
            message.type === "error"
              ? "bg-red-100 text-red-700"
              : "bg-green-100 text-green-700"
          }`}
        >
          {message.text}
        </div>
      )}

      {/* Basic Client Info */}
      <div className="grid grid-cols-2 gap-3 border p-3 rounded">
        <p>
          <strong>Name:</strong> {client.name}
        </p>
        <p>
          <strong>Phone:</strong> {client.phone}
        </p>
        <p>
          <strong>Address:</strong> {client.address}
        </p>
        <p>
          <strong>Date:</strong> {client.date}
        </p>
      </div>

      {/* 👁️ Eye Parameters Table */}
      <div className="mt-5 border rounded p-4">
        <h3 className="text-lg font-semibold mb-3">Eye Examination Details</h3>

        <table className="w-full border text-center">
          <thead className="bg-gray-100">
            <tr>
              <th className="border p-2">Eye</th>
              <th className="border p-2">SPH</th>
              <th className="border p-2">CYL</th>
              <th className="border p-2">AXIS</th>
              <th className="border p-2">VISION</th>
              <th className="border p-2">ADD (if any)</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="border p-2 font-medium">Right Eye (R)</td>
              <td className="border p-2">{client.r_sph || "-"}</td>
              <td className="border p-2">{client.r_cyl || "-"}</td>
              <td className="border p-2">{client.r_axis || "-"}</td>
              <td className="border p-2">{client.r_va || "-"}</td>
              <td className="border p-2">{client.r_add || "-"}</td>
            </tr>
            <tr>
              <td className="border p-2 font-medium">Left Eye (L)</td>
              <td className="border p-2">{client.l_sph || "-"}</td>
              <td className="border p-2">{client.l_cyl || "-"}</td>
              <td className="border p-2">{client.l_axis || "-"}</td>
              <td className="border p-2">{client.l_va || "-"}</td>
              <td className="border p-2">{client.l_add || "-"}</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-end space-x-2 mt-4">
        <button
          onClick={handlePrint}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Print
        </button>

        <button
          onClick={() => setShowAddPayment(true)}
          className="px-4 py-2 bg-yellow-600 text-white rounded hover:bg-yellow-700"
        >
          ➕ Add Payment
        </button>

        <button
          onClick={() => setShowPayments(true)}
          className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
        >
          View Payments
        </button>

        <button
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
          className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
        >
          Close
        </button>
      </div>

      {/* View Payments Modal */}
      {showPayments && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-40">
          <div className="bg-white p-4 rounded shadow-lg w-2/3">
            <PaymentDetails
              client={client}
              refreshTrigger={refreshPayments}
              onClose={() => setShowPayments(false)}
            />
          </div>
        </div>
      )}

      {/* Add Payment Modal */}
      {showAddPayment && (
        <AddPayment
          selectedClient={client}
          onClose={() => setShowAddPayment(false)}
          onSave={handlePaymentAdded}
        />
      )}
    </div>
  );
}
