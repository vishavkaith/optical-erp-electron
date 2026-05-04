import React, { useEffect, useState } from "react";
import AddPayment from "./AddPayment";
import api from "../utils/api";

export default function PaymentDetails({ client, onClose }) {
  const [payments, setPayments] = useState([]);
  const [showAddPayment, setShowAddPayment] = useState(false);
  const [message, setMessage] = useState("");

  const loadPayments = async () => {
    if (!client?.id) return;
    try {
      const data = await api.getPaymentsByClientId(client.id);
      setPayments(data || []);
    } catch (err) {
      console.error("Error loading payments:", err);
      setMessage("❌ Failed to load payments.");
    }
  };

  useEffect(() => {
    loadPayments();
  }, [client]);

  // Listen for refresh event (for smooth update after Add/Edit)
  useEffect(() => {
    const refreshHandler = (e) => {
      if (e.detail?.payments) {
        loadPayments();
        setMessage("✅ Payments updated successfully!");
        setTimeout(() => setMessage(""), 2000);
      }
    };
    document.addEventListener("app:refresh", refreshHandler);
    return () => document.removeEventListener("app:refresh", refreshHandler);
  }, []);

  const handlePrint = () => window.print();

  return (
    <div className="relative">
      {/* 🟢 Inline Notification */}
      {message && (
        <div className="absolute top-0 left-0 right-0 text-center bg-green-100 text-green-700 py-1 rounded mb-2">
          {message}
        </div>
      )}

      {/* ✅ Show client name + phone number */}
      <h2 className="text-xl font-bold mb-3 mt-6">
        Payments - {client.name}
        {client.phone ? (
          <span className="text-gray-600 text-base ml-2">
            ({client.phone})
          </span>
        ) : null}
      </h2>

      <div className="flex justify-end mb-3">
        <button
          onClick={() => setShowAddPayment(true)}
          className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700"
        >
          + Add Payment
        </button>
      </div>

      {payments.length === 0 ? (
        <p>No payments found.</p>
      ) : (
        <table className="w-full border text-sm">
          <thead>
            <tr className="bg-gray-100">
              <th className="border p-2">Date</th>
              <th className="border p-2">Amount</th>
              <th className="border p-2">Paid</th>
              <th className="border p-2">Balance</th>
              <th className="border p-2">Mode</th>
              <th className="border p-2">Remarks</th>
            </tr>
          </thead>
          <tbody>
            {payments.map((p, i) => (
              <tr key={i} className="hover:bg-gray-50">
                <td className="border p-2">{p.date}</td>
                <td className="border p-2">{p.amount}</td>
                <td className="border p-2">{p.paid}</td>
                <td className="border p-2">{p.balance}</td>
                <td className="border p-2">{p.mode}</td>
                <td className="border p-2">{p.remark}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <div className="flex justify-end mt-4 space-x-2">
        <button
          onClick={handlePrint}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Print
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

      {/* ✅ Add Payment Modal */}
      {showAddPayment && (
        <AddPayment
          onClose={() => setShowAddPayment(false)}
          onSave={() => {
            loadPayments();
            setMessage("✅ Payment added successfully!");
            setTimeout(() => setMessage(""), 2000);
          }}
          selectedClient={client}
        />
      )}
    </div>
  );
}
