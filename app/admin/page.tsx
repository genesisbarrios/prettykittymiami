"use client";

import { useEffect, useRef, useState } from "react";
import * as XLSX from "xlsx";
import config from "@/config";

interface Subscriber {
  _id: string;
  name?: string;
  email: string;
  phone?: string;
  message?: string;
  source: string;
  createdAt: string;
}

const ADMIN_PASSWORD = process.env.NEXT_PUBLIC_ADMIN_PASSWORD || "pw";
const SESSION_KEY = "prettykitty_admin_authed";

function downloadBlob(content: BlobPart, filename: string, type: string) {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

function toRows(subscribers: Subscriber[]) {
  return subscribers.map((s) => ({
    Name: s.name || "",
    Email: s.email,
    Phone: s.phone || "",
    Message: s.message || "",
    Source: s.source,
    "Signed Up": new Date(s.createdAt).toLocaleString(),
  }));
}

function findField(row: Record<string, any>, candidates: string[]) {
  const keys = Object.keys(row);
  for (const candidate of candidates) {
    const match = keys.find((k) => k.trim().toLowerCase() === candidate);
    if (match) return String(row[match] ?? "").trim();
  }
  return "";
}

export default function AdminPage() {
  const [authed, setAuthed] = useState(false);
  const [password, setPassword] = useState("");
  const [authError, setAuthError] = useState("");

  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState("");
  const [copyLabel, setCopyLabel] = useState("Copy");
  const [importStatus, setImportStatus] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (sessionStorage.getItem(SESSION_KEY) === "1") {
      setAuthed(true);
    }
  }, []);

  const loadSubscribers = async () => {
    setLoading(true);
    setLoadError("");
    try {
      const res = await fetch(
        `${config.crm.apiUrl}/api/crm/clients/${config.clientSlug}/subscribers`,
        { headers: { "x-admin-password": ADMIN_PASSWORD } }
      );
      if (!res.ok) throw new Error("Failed to load subscribers");
      const json = await res.json();
      setSubscribers(json.subscribers || []);
    } catch {
      setLoadError("Could not load subscribers. Check the backend is running.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (authed) loadSubscribers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authed]);

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === ADMIN_PASSWORD) {
      sessionStorage.setItem(SESSION_KEY, "1");
      setAuthed(true);
      setAuthError("");
    } else {
      setAuthError("Wrong password.");
    }
  };

  const handleExportCsv = () => {
    const rows = toRows(subscribers);
    const sheet = XLSX.utils.json_to_sheet(rows);
    const csv = XLSX.utils.sheet_to_csv(sheet);
    downloadBlob(csv, "prettykitty-subscribers.csv", "text/csv;charset=utf-8;");
  };

  const handleExportXlsx = () => {
    const rows = toRows(subscribers);
    const sheet = XLSX.utils.json_to_sheet(rows);
    const book = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(book, sheet, "Subscribers");
    XLSX.writeFile(book, "prettykitty-subscribers.xlsx");
  };

  const handleCopy = async () => {
    const rows = toRows(subscribers);
    const sheet = XLSX.utils.json_to_sheet(rows);
    const tsv = XLSX.utils.sheet_to_csv(sheet, { FS: "\t" });
    await navigator.clipboard.writeText(tsv);
    setCopyLabel("Copied!");
    setTimeout(() => setCopyLabel("Copy"), 1500);
  };

  const handleImportClick = () => fileInputRef.current?.click();

  const handleImportFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImportStatus("Reading file...");
    try {
      const buffer = await file.arrayBuffer();
      const book = XLSX.read(buffer, { type: "array" });
      const sheet = book.Sheets[book.SheetNames[0]];
      const rawRows: Record<string, any>[] = XLSX.utils.sheet_to_json(sheet);

      const parsed = rawRows
        .map((row) => ({
          name: findField(row, ["name", "full name"]),
          email: findField(row, ["email", "email address"]),
          phone: findField(row, ["phone", "phone number"]),
          message: findField(row, ["message", "notes"]),
        }))
        .filter((row) => row.email);

      if (parsed.length === 0) {
        setImportStatus("No rows with an email column found.");
        return;
      }

      setImportStatus(`Importing ${parsed.length} rows...`);

      const res = await fetch(
        `${config.crm.apiUrl}/api/crm/subscribers/import`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-admin-password": ADMIN_PASSWORD,
          },
          body: JSON.stringify({
            clientSlug: config.clientSlug,
            clientName: config.appName,
            subscribers: parsed,
          }),
        }
      );

      if (!res.ok) throw new Error("Import failed");
      const json = await res.json();
      setImportStatus(
        `Imported ${json.insertedCount}, skipped ${json.skippedCount} duplicate(s).`
      );
      loadSubscribers();
    } catch {
      setImportStatus("Import failed — check the file format and try again.");
    } finally {
      e.target.value = "";
    }
  };

  if (!authed) {
    return (
      <div
        data-theme={config.colors.theme}
        className="min-h-screen flex items-center justify-center bg-base-100 px-6"
      >
        <form
          onSubmit={handlePasswordSubmit}
          className="w-full max-w-sm flex flex-col gap-4"
        >
          <h1 className="font-display text-2xl tracking-wide text-center">
            ADMIN LOGIN
          </h1>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            className="input input-bordered w-full"
            autoFocus
          />
          {authError && <p className="text-error text-sm">{authError}</p>}
          <button type="submit" className="btn btn-primary">
            Log In
          </button>
        </form>
      </div>
    );
  }

  return (
    <div data-theme={config.colors.theme} className="min-h-screen bg-base-100 px-6 py-10">
      <div className="max-w-5xl mx-auto">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
          <h1 className="font-display text-3xl tracking-wide">
            NEWSLETTER & CONTACT SUBSCRIBERS
          </h1>
          <button
            onClick={() => {
              sessionStorage.removeItem(SESSION_KEY);
              setAuthed(false);
            }}
            className="btn btn-ghost btn-sm"
          >
            Log Out
          </button>
        </div>

        <div className="flex flex-wrap gap-3 mb-6">
          <button onClick={handleExportCsv} className="btn btn-outline btn-sm" disabled={!subscribers.length}>
            Export CSV
          </button>
          <button onClick={handleExportXlsx} className="btn btn-outline btn-sm" disabled={!subscribers.length}>
            Export XLSX
          </button>
          <button onClick={handleCopy} className="btn btn-outline btn-sm" disabled={!subscribers.length}>
            {copyLabel}
          </button>
          <button onClick={handleImportClick} className="btn btn-primary btn-sm">
            Import CSV/XLSX
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv,.xlsx,.xls"
            className="hidden"
            onChange={handleImportFile}
          />
          <button onClick={loadSubscribers} className="btn btn-ghost btn-sm">
            Refresh
          </button>
        </div>

        {importStatus && (
          <p className="text-sm text-base-content/70 mb-4">{importStatus}</p>
        )}

        {loading && <p className="text-base-content/60">Loading...</p>}
        {loadError && <p className="text-error">{loadError}</p>}

        {!loading && !loadError && (
          <div className="overflow-x-auto border border-base-300 rounded-lg">
            <table className="table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>Message</th>
                  <th>Source</th>
                  <th>Signed Up</th>
                </tr>
              </thead>
              <tbody>
                {subscribers.map((s) => (
                  <tr key={s._id}>
                    <td>{s.name || "—"}</td>
                    <td>{s.email}</td>
                    <td>{s.phone || "—"}</td>
                    <td className="max-w-xs truncate">{s.message || "—"}</td>
                    <td>
                      <span className="badge badge-sm">{s.source}</span>
                    </td>
                    <td>{new Date(s.createdAt).toLocaleDateString()}</td>
                  </tr>
                ))}
                {subscribers.length === 0 && (
                  <tr>
                    <td colSpan={6} className="text-center text-base-content/50 py-8">
                      No subscribers yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
