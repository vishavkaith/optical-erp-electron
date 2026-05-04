import React, { useEffect, useState } from 'react';
import AddPayment from '../components/AddPayment';
import EditPayment from '../components/EditPayment';
import PaymentDetails from '../components/PaymentDetails';
import Sidebar from '../components/Sidebar';
import api from '../utils/api';

export default function PaymentsPage() {
  const [payments, setPayments] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [showAdd, setShowAdd] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [detailsItem, setDetailsItem] = useState(null);
  const [message, setMessage] = useState(null); // ✅ Toast message

  // ✅ Toast helper
  function showToast(msg, type = 'success') {
    setMessage({ text: msg, type });
    setTimeout(() => setMessage(null), 3000);
  }

  // ✅ Load all payments (with join to clients)
  async function loadPayments() {
    setLoading(true);
    try {
      let list = await api.paymentList();
      if (!Array.isArray(list)) list = [];

      if (search.trim() !== '') {
        const term = search.trim().toLowerCase();
        list = list.filter(
          (p) =>
            (p.client_name && p.client_name.toLowerCase().includes(term)) ||
            (p.client_phone && p.client_phone.toLowerCase().includes(term)) ||
            (p.date && p.date.toLowerCase().includes(term))
        );
      }
      setPayments(list);
    } catch (err) {
      console.error('Failed to load payments:', err);
      setPayments([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadPayments();
  }, []);

  // ✅ Refresh on global "app:refresh" event
  useEffect(() => {
    const handler = (e) => {
      try {
        const d = (e && e.detail) || {};
        if (d.payments !== false) loadPayments();
        document.body.classList.remove('overlay-open');
        const el = document.getElementById('payments-search');
        if (el) el.focus();
      } catch (err) {
        console.error('app:refresh handler error', err);
      }
    };
    document.addEventListener('app:refresh', handler);
    return () => document.removeEventListener('app:refresh', handler);
  }, []);

  // ✅ Debounced search
  useEffect(() => {
    const delay = setTimeout(() => {
      loadPayments();
    }, 400);
    return () => clearTimeout(delay);
  }, [search]);

 async function handleDelete(id) {
  try {
    const result = await api.paymentDelete(id);
    if (result && result.success) {
      showToast('Payment deleted successfully.', 'success');
      await loadPayments();
    } else {
      throw new Error('Delete failed.');
    }
  } catch (err) {
    console.error('Delete failed:', err);
    showToast('Failed to delete payment.', 'error');
  }
}

  // ✅ Fixed field names here:
  const openPaymentDetails = (p) => {
    const clientData = {
      id: p.client_id,        // fixed
      name: p.client_name,    // fixed
      phone: p.client_phone,  // fixed
    };
    setDetailsItem({ payment: p, client: clientData });
  };

  return (
    <div className="p-4 relative">
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-2xl font-semibold">Payments</h2>
        <div className="flex gap-3">
          <input
            placeholder="Search by name, phone, or date..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            id="payments-search"
            className="p-2 border rounded w-64"
            autoComplete="off"
          />
          <button
            onClick={() => setShowAdd(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            + Add Payment
          </button>
        </div>
      </div>

      {/* ✅ Toast Message */}
      {message && (
        <div
          className={`mb-3 text-sm px-3 py-2 rounded ${
            message.type === 'success'
              ? 'bg-green-100 text-green-700 border border-green-300'
              : 'bg-red-100 text-red-700 border border-red-300'
          }`}
        >
          {message.text}
        </div>
      )}

      {/* Table */}
      <div className="overflow-auto border rounded">
        {loading ? (
          <div className="p-4 text-center text-gray-600">Loading...</div>
        ) : (
          <table className="table-auto w-full">
            <thead className="bg-gray-100">
              <tr>
                <th className="p-2 border">Client Name</th>
                <th className="p-2 border">Phone</th>
                <th className="p-2 border">Amount</th>
                <th className="p-2 border">Paid</th>
                <th className="p-2 border">Balance</th>
                <th className="p-2 border">Date</th>
                <th className="p-2 border">Actions</th>
              </tr>
            </thead>
            <tbody>
              {payments.length === 0 ? (
                <tr>
                  <td colSpan="7" className="p-4 text-center text-gray-500">
                    No payments found.
                  </td>
                </tr>
              ) : (
                payments.map((p) => (
                  <tr key={p.id} className="hover:bg-gray-50">
                    <td className="p-2 border">{p.client_name || '-'}</td>
                    <td className="p-2 border">{p.client_phone || '-'}</td>
                    <td className="p-2 border text-right">₹{p.amount}</td>
                    <td className="p-2 border text-right text-green-700 font-medium">
                      ₹{p.paid}
                    </td>
                    <td className="p-2 border text-right text-red-600 font-medium">
                      ₹{p.balance}
                    </td>
                    <td className="p-2 border">{p.date}</td>
                    <td className="p-2 border text-center space-x-2">
                      <button
                        onClick={() => openPaymentDetails(p)}
                        className="px-3 py-1 bg-indigo-600 text-white rounded hover:bg-indigo-700"
                      >
                        View
                      </button>
                      <button
                        onClick={() => setEditItem(p)}
                        className="px-3 py-1 bg-yellow-500 text-white rounded hover:bg-yellow-600"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(p.id)}
                        className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* ✅ Modals */}
      {showAdd && (
        <Sidebar onClose={() => setShowAdd(false)} width="520px">
          <AddPayment
            onClose={async (refresh = true) => {
              setShowAdd(false);
              if (refresh) {
                await loadPayments();
                showToast('Payment added successfully!', 'success');
              }
            }}
          />
        </Sidebar>
      )}

      {editItem && (
        <Sidebar onClose={() => setEditItem(null)} width="520px">
          <EditPayment
            payment={editItem}
            onClose={async (refresh = true) => {
              setEditItem(null);
              if (refresh) {
                await loadPayments();
                showToast('Payment updated successfully!', 'success');
              }
            }}
          />
        </Sidebar>
      )}

      {detailsItem && (
        <Sidebar onClose={() => setDetailsItem(null)} width="520px">
          <PaymentDetails
            client={detailsItem.client}
            payment={detailsItem.payment}
            onClose={() => setDetailsItem(null)}
          />
        </Sidebar>
      )}
    </div>
  );
}
