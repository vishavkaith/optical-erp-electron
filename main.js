// main.js
const { app, BrowserWindow, ipcMain, dialog } = require("electron");
const path = require("path");
const fs = require("fs");
const Database = require("better-sqlite3");

// try to load json2csv parser if available (optional)
let json2csvParse = null;
try {
  json2csvParse = require("json2csv").parse;
} catch (e) {
  console.warn("json2csv not available. CSV export will fail until you `npm install json2csv`.");
}

// ------------------ Environment ------------------
const isDev = !app.isPackaged;
let mainWindow;

// ------------------ Database Setup ------------------
// ------------------ Database Setup ------------------
const userDataPath = app.getPath("userData"); // Safe writable folder
const DB_DIR = path.join(userDataPath, "db");
const DB_FILE = path.join(DB_DIR, "optical-shop.db");

// Ensure folder exists
if (!fs.existsSync(DB_DIR)) {
  fs.mkdirSync(DB_DIR, { recursive: true });
}

const db = new Database(DB_FILE);

// ------------------ Create Tables ------------------
db.prepare(`
  CREATE TABLE IF NOT EXISTS clients (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT,
    phone TEXT,
    address TEXT,
    date TEXT,
    r_sph TEXT,
    l_sph TEXT,
    r_cyl TEXT,
    l_cyl TEXT,
    r_axis TEXT,
    l_axis TEXT,
    r_va TEXT,
    l_va TEXT,
    r_add TEXT,
    l_add TEXT,
    pd TEXT,
    addition TEXT,
    remarks TEXT
  )
`).run();

db.prepare(`
  CREATE TABLE IF NOT EXISTS payments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    client_id INTEGER,
    amount REAL DEFAULT 0,
    paid REAL DEFAULT 0,
    date TEXT,
    mode TEXT,
    notes TEXT,
    FOREIGN KEY (client_id) REFERENCES clients(id)
  )
`).run();

// ------------------ Create Main Window ------------------
function createMainWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  const appURL = isDev
    ? "http://localhost:5174"
    : `file://${path.join(__dirname, "renderer/dist/index.html")}`;

  mainWindow.loadURL(appURL);
  //if (isDev) mainWindow.webContents.openDevTools();

  mainWindow.on("closed", () => {
    mainWindow = null;
  });
}

// ------------------ Modal Window (Add Client) ------------------
ipcMain.on("open-add-client", (event) => {
  const parentWindow = BrowserWindow.getFocusedWindow();

  const modal = new BrowserWindow({
    parent: parentWindow,
    modal: true,
    show: false,
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  const appURL = isDev
    ? "http://localhost:5174/#/add-client"
    : `file://${path.join(__dirname, "renderer/dist/index.html#add-client")}`;

  modal.loadURL(appURL);
  modal.once("ready-to-show", () => modal.show());

  modal.on("closed", () => {
    if (parentWindow) {
      parentWindow.show();
      parentWindow.focus();
      try {
        parentWindow.webContents.send("restore-focus");
      } catch (e) {}
    } else if (!mainWindow) {
      createMainWindow();
    }
  });
});

// ------------------ CLIENTS ------------------
ipcMain.handle("get-clients", async () => {
  try {
    return db.prepare("SELECT * FROM clients ORDER BY id DESC").all();
  } catch (err) {
    console.error("Failed to load clients:", err);
    throw err;
  }
});

ipcMain.handle("get-client", async (_, id) => {
  try {
    return db.prepare("SELECT * FROM clients WHERE id = ?").get(id);
  } catch (err) {
    console.error("Failed to get client:", err);
    throw err;
  }
});

ipcMain.handle("add-client", async (_, client) => {
  try {
    db.prepare(
      `
      INSERT INTO clients (
        name, phone, address, date,
        r_sph, r_cyl, r_axis, r_va, r_add,
        l_sph, l_cyl, l_axis, l_va, l_add,
        pd, addition, remarks
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `
    ).run(
      client.name,
      client.phone,
      client.address,
      client.date,
      client.r_sph,
      client.r_cyl,
      client.r_axis,
      client.r_va,
      client.r_add,
      client.l_sph,
      client.l_cyl,
      client.l_axis,
      client.l_va,
      client.l_add,
      client.pd,
      client.addition,
      client.remarks
    );
    return { success: true };
  } catch (err) {
    console.error("Failed to add client:", err);
    throw err;
  }
});

ipcMain.handle("delete-client", async (_, id) => {
  try {
    db.prepare("DELETE FROM clients WHERE id = ?").run(id);
    // optionally delete related payments
    // db.prepare("DELETE FROM payments WHERE client_id = ?").run(id);
    return { success: true };
  } catch (err) {
    console.error("Failed to delete client:", err);
    throw err;
  }
});

ipcMain.handle("update-client", async (_, client) => {
  try {
    db.prepare(
      `
      UPDATE clients SET 
        name=?, phone=?, address=?, date=?,
        r_sph=?, r_cyl=?, r_axis=?, r_va=?, r_add=?,
        l_sph=?, l_cyl=?, l_axis=?, l_va=?, l_add=?,
        pd=?, addition=?, remarks=? 
      WHERE id=?
    `
    ).run(
      client.name,
      client.phone,
      client.address,
      client.date,
      client.r_sph,
      client.r_cyl,
      client.r_axis,
      client.r_va,
      client.r_add,
      client.l_sph,
      client.l_cyl,
      client.l_axis,
      client.l_va,
      client.l_add,
      client.pd,
      client.addition,
      client.remarks,
      client.id
    );
    return { success: true };
  } catch (err) {
    console.error("Failed to update client:", err);
    throw err;
  }
});

// ------------------ PAYMENTS ------------------
ipcMain.handle("payments:list", async () => {
  try {
    const query = `
      SELECT 
        p.id,
        p.client_id,
        c.name AS client_name,
        c.phone AS client_phone,
        p.amount,
        p.paid,
        (p.amount - p.paid) AS balance,
        p.date,
        p.mode,
        p.notes AS remark
      FROM payments p
      LEFT JOIN clients c ON p.client_id = c.id
      ORDER BY p.date DESC, p.id DESC
    `;
    return db.prepare(query).all();
  } catch (err) {
    console.error("Failed to load payments:", err);
    throw err;
  }
});

ipcMain.handle("payments:create", async (_, data) => {
  try {
    const clientId = data.client_id ?? data.customer_id ?? null;
    const date = data.date && data.date.trim() !== "" ? data.date : new Date().toISOString();
    const remark = data.remark ?? data.notes ?? "";
    const mode = data.mode ?? "";

    const result = db
      .prepare(
        `
        INSERT INTO payments (client_id, amount, paid, date, mode, notes)
        VALUES (?, ?, ?, ?, ?, ?)
      `
      )
      .run(clientId, data.amount ?? 0, data.paid ?? 0, date, mode, remark);

    return { id: result.lastInsertRowid };
  } catch (err) {
    console.error("Failed to create payment:", err);
    throw err;
  }
});

ipcMain.handle("payments:update", async (_, data) => {
  try {
    const remark = data.remark ?? data.notes ?? "";
    const mode = data.mode ?? "";
    const existing = db.prepare("SELECT client_id FROM payments WHERE id = ?").get(data.id);
    if (!existing) throw new Error("Payment not found");

    db.prepare(
      `
      UPDATE payments
      SET amount=?, paid=?, mode=?, notes=?, date=datetime('now')
      WHERE id=?
    `
    ).run(data.amount ?? 0, data.paid ?? 0, mode, remark, data.id);

    return { success: true };
  } catch (err) {
    console.error("Failed to update payment:", err);
    throw err;
  }
});

ipcMain.handle("payments:delete", async (_, id) => {
  try {
    db.prepare("DELETE FROM payments WHERE id = ?").run(id);
    return { success: true };
  } catch (err) {
    console.error("Failed to delete payment:", err);
    throw err;
  }
});

ipcMain.handle("payments:byClientId", async (_, clientId) => {
  try {
    return db
      .prepare(
        `
        SELECT id, client_id, amount, paid, (amount - paid) AS balance, date, mode, notes AS remark
        FROM payments
        WHERE client_id = ?
        ORDER BY date DESC
      `
      )
      .all(clientId);
  } catch (err) {
    console.error("Failed to get payments by clientId:", err);
    throw err;
  }
});

// ------------------ EXPORT / IMPORT ------------------
ipcMain.handle("backup:export", async () => {
  try {
    const clients = db.prepare("SELECT * FROM clients").all();
    const payments = db.prepare("SELECT * FROM payments").all();
    const backup = { clients, payments };

    const savePath = dialog.showSaveDialogSync({
      title: "Export Backup (JSON)",
      defaultPath: `optical_backup_${new Date().toISOString().slice(0, 10)}.json`,
      filters: [{ name: "JSON", extensions: ["json"] }],
    });
    if (!savePath) return { cancelled: true };

    fs.writeFileSync(savePath, JSON.stringify(backup, null, 2), "utf8");
    return { success: true, path: savePath };
  } catch (err) {
    console.error("backup:export failed:", err);
    throw err;
  }
});

ipcMain.handle("export:csv", async () => {
  try {
    if (!json2csvParse) throw new Error("json2csv package not installed. Run: npm install json2csv");

    const rows = db
      .prepare(
        `SELECT p.id, p.client_id, c.name AS client_name, c.phone AS client_phone, 
                p.amount, p.paid, (p.amount - p.paid) AS balance, p.date, p.mode, p.notes AS remark
         FROM payments p
         LEFT JOIN clients c ON c.id = p.client_id
         ORDER BY p.date DESC, p.id DESC`
      )
      .all();

    if (!rows || rows.length === 0) return { success: true, path: null, message: "No rows to export" };

    const csv = json2csvParse(rows);
    const savePath = dialog.showSaveDialogSync({
      title: "Export Payments to CSV",
      defaultPath: `payments_export_${new Date().toISOString().slice(0, 10)}.csv`,
      filters: [{ name: "CSV", extensions: ["csv"] }],
    });
    if (!savePath) return { cancelled: true };

    fs.writeFileSync(savePath, csv, "utf8");
    return { success: true, path: savePath };
  } catch (err) {
    console.error("export:csv failed:", err);
    throw err;
  }
});
// 🟢 IMPORT BACKUP (CSV)
ipcMain.handle("backup:import", async () => {
  try {
    const open = dialog.showOpenDialogSync({
      title: "Import Backup (CSV)",
      filters: [{ name: "CSV Files", extensions: ["csv"] }],
      properties: ["openFile"],
    });

    if (!open || open.length === 0) {
      return { cancelled: true };
    }

    const content = fs.readFileSync(open[0], "utf8");
    const lines = content.split("\n").filter((l) => l.trim() !== "");

    if (lines.length < 2) {
      throw new Error("CSV file is empty or invalid");
    }

    const headers = lines[0].split(",").map((h) => h.trim());
    const rows = lines.slice(1).map((r) => {
      const cols = r.split(",");
      const obj = {};
      headers.forEach((h, i) => (obj[h] = (cols[i] || "").trim()));
      return obj;
    });

    let clientsImported = 0;
    let paymentsImported = 0;

    db.transaction(() => {
      for (const row of rows) {
        // --- Import Clients ---
        if (row.name && row.phone) {
          db.prepare(
            `INSERT OR IGNORE INTO clients (name, phone, address, date)
             VALUES (?, ?, ?, ?)`
          ).run(row.name, row.phone, row.address || "", row.date || "");
          clientsImported++;
        }

        // --- Import Payments ---
        if (row.client_id && row.amount) {
          db.prepare(
            `INSERT INTO payments (client_id, amount, paid, mode, date, notes)
             VALUES (?, ?, ?, ?, ?, ?)`
          ).run(
            row.client_id,
            parseFloat(row.amount),
            parseFloat(row.paid || 0),
            row.mode || "Cash",
            row.date || new Date().toISOString().split("T")[0],
            row.notes || ""
          );
          paymentsImported++;
        }
      }
    })();

    return {
      success: true,
      clientsImported,
      paymentsImported,
      file: open[0],
    };
  } catch (err) {
    console.error("backup:import failed:", err);
    throw err;
  }
});

// ------------------ App Lifecycle ------------------
app.whenReady().then(() => {
  createMainWindow();
  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) createMainWindow();
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    try {
      db.close();
    } catch (e) {}
    app.quit();
  }
});
