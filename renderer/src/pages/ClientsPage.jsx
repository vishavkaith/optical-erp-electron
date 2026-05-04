// renderer/src/pages/ClientsPage.jsx
import React, { useEffect, useState } from "react";
import AddClient from "../components/AddClient";
import Sidebar from "../components/Sidebar";
import ClientDetails from "../components/ClientDetails";
import EditClient from "../components/EditClient";
import api from "../utils/api";

// ✅ Electron ipcRenderer bridge (safe check)
let ipcRenderer;
try {
  const e = window.require?.("electron");
  ipcRenderer = e?.ipcRenderer;
} catch (err) {
  console.warn("Electron ipcRenderer not available:", err);
}

export default function ClientsPage() {
  const [clients, setClients] = useState([]);
  const [filteredClients, setFilteredClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [selectedClient, setSelectedClient] = useState(null);
  const [editingClient, setEditingClient] = useState(null);
  const [search, setSearch] = useState("");
  const [notification, setNotification] = useState(null); // { message, type }

  const loadClients = async () => {
    try {
      const data = await api.customerList();
      setClients(data);
      setFilteredClients(data);
    } catch (err) {
      console.error("Failed to load clients:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (value) => {
    setSearch(value);
    const term = value.toLowerCase();
    const filtered = clients.filter(
      (c) =>
        c.name.toLowerCase().includes(term) ||
        c.phone.toLowerCase().includes(term) ||
        c.date.toLowerCase().includes(term)
    );
    setFilteredClients(filtered);
  };

  const handleDelete = async (id) => {
  // 🔄 Instead of window.confirm — show a toast-style confirmation bar
  setNotification({
    message: (
      <span>
        Are you sure you want to delete this client?{" "}
        <button
          onClick={async () => {
            try {
              await api.customerDelete(id);
              await loadClients();
              setNotification({ message: "Client deleted", type: "info" });
              setTimeout(() => setNotification(null), 3000);
            } catch (err) {
              console.error("Failed to delete client:", err);
              setNotification({ message: "Failed to delete client", type: "error" });
              setTimeout(() => setNotification(null), 3000);
            }
          }}
          className="ml-2 bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700"
        >
          Yes, Delete
        </button>
        <button
          onClick={() => setNotification(null)}
          className="ml-2 bg-gray-400 text-white px-3 py-1 rounded hover:bg-gray-500"
        >
          Cancel
        </button>
      </span>
    ),
    type: "warning",
  });
};


  useEffect(() => {
    loadClients();
  }, []);

  // Listen for in-app notifications (dispatched by AddClient)
  useEffect(() => {
    const handleNotify = (e) => {
      try {
        const d = (e && e.detail) || {};
        if (d && d.message) {
          setNotification({ message: d.message, type: d.type || "info" });
          // ensure search input focused after notification
          setTimeout(() => {
            const input = document.getElementById("clients-search");
            if (input) {
              input.focus();
              input.selectionStart = input.value.length;
            }
          }, 150);
          // auto-hide
          setTimeout(() => setNotification(null), 3000);
        }
      } catch (err) {
        console.error("app:notify handler error", err);
      }
    };

    document.addEventListener("app:notify", handleNotify);
    return () => document.removeEventListener("app:notify", handleNotify);
  }, []);

  // ✅ Electron Focus Restore Fix (keep as-is)
  useEffect(() => {
    if (!ipcRenderer) return;

    const restoreFocus = () => {
      setTimeout(() => {
        try {
          window.focus();
          document.body.focus();
          const input = document.getElementById("clients-search");
          if (input) {
            input.focus();
            input.selectionStart = input.value.length;
          }
        } catch (err) {
          console.warn("Focus restore failed:", err);
        }
      }, 120);
    };

    ipcRenderer.on("restore-focus", restoreFocus);
    return () => ipcRenderer.removeListener("restore-focus", restoreFocus);
  }, []);

  // 🔄 Refresh listener
  useEffect(() => {
    const handler = (e) => {
      try {
        const d = (e && e.detail) || {};
        if (d.clients !== false) loadClients();

        document.body.classList.remove("overlay-open");
        const input = document.getElementById("clients-search");
        if (input) input.focus();
      } catch (err) {
        console.error("app:refresh handler error", err);
      }
    };
    document.addEventListener("app:refresh", handler);
    return () => document.removeEventListener("app:refresh", handler);
  }, []);

  return (
    <div className="p-6">
      {/* Notification Banner (non-blocking) */}
     {notification && (
  <div
    className={`mb-4 p-3 rounded ${
      notification.type === "success"
        ? "bg-green-100 text-green-800"
        : notification.type === "error"
        ? "bg-red-100 text-red-800"
        : notification.type === "warning"
        ? "bg-yellow-100 text-yellow-800"
        : "bg-blue-50 text-blue-800"
    }`}
    role="status"
  >
    {typeof notification.message === "string"
      ? notification.message
      : notification.message}
  </div>
)}

      {/* Header and Search */}
      <div className="flex flex-col sm:flex-row justify-between items-center mb-4 gap-2">
        <h1 className="text-2xl font-bold">Client List</h1>

        <div className="flex gap-2 w-full sm:w-auto">
          <input
            id="clients-search"
            type="text"
            placeholder="Search by name, phone, or date..."
            value={search}
            onChange={(e) => handleSearch(e.target.value)}
            className="border px-3 py-2 rounded w-full sm:w-64"
          />
          <button
            onClick={() => setShowAdd(true)}
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
          >
            + Add Client
          </button>
          <button
            onClick={() => api.exportCsv()}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Export CSV
          </button>
          <button
            onClick={() => api.backupImport()}
            className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
          >
            Import DB
          </button>
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <p>Loading clients...</p>
      ) : filteredClients.length === 0 ? (
        <p>No clients found.</p>
      ) : (
        <table className="w-full border border-gray-200 text-sm">
          <thead>
            <tr className="bg-gray-100 text-left">
              <th className="p-2 border">Name</th>
              <th className="p-2 border">Phone</th>
              <th className="p-2 border">Address</th>
              <th className="p-2 border">Date</th>
              <th className="p-2 border text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredClients.map((c) => (
              <tr key={c.id} className="hover:bg-gray-50">
                <td className="p-2 border">{c.name}</td>
                <td className="p-2 border">{c.phone}</td>
                <td className="p-2 border">{c.address}</td>
                <td className="p-2 border">{c.date}</td>
                <td className="p-2 border text-center space-x-2">
                  <button
                    onClick={() => setSelectedClient(c)}
                    className="px-3 py-1 bg-indigo-600 text-white rounded hover:bg-indigo-700"
                  >
                    View
                  </button>
                  <button
                    onClick={() => setEditingClient(c)}
                    className="px-3 py-1 bg-yellow-500 text-white rounded hover:bg-yellow-600"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(c.id)}
                    className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {/* Add Client Modal */}
      {showAdd && (
        <Sidebar
          onClose={() => {
            setShowAdd(false);
            loadClients();
          }}
          width="520px"
        >
          <AddClient
            onClose={() => {
              setShowAdd(false);
              loadClients();
            }}
          />
        </Sidebar>
      )}

      {/* View Client */}
      {selectedClient && (
        <Sidebar onClose={() => setSelectedClient(null)} width="720px">
          <ClientDetails client={selectedClient} onClose={() => setSelectedClient(null)} />
        </Sidebar>
      )}

      {/* Edit Client */}
      {editingClient && (
        <Sidebar
          onClose={() => {
            setEditingClient(null);
            loadClients();
          }}
          width="520px"
        >
          <EditClient
            client={editingClient}
            onClose={() => {
              setEditingClient(null);
              loadClients();
            }}
          />
        </Sidebar>
      )}
    </div>
  );
}
