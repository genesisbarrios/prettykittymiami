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

// No password constant here on purpose — the real password only lives
// server-side (see app/api/crm/subscribers/route.ts). The browser only ever
// knows whatever the admin just typed, submitted to the server to check.
const SESSION_KEY = "prettykitty_admin_password";

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

const EMAIL_RE = /[\w.+-]+@[\w-]+\.[\w.-]+/;

// Turns text pasted from a spreadsheet (or just a plain list of
// name/email/phone) into the same row shape handleImportFile produces, so
// both paths share one import call. Handles: a header row (Name, Email,
// Phone, Message) with tab or comma columns, columns with no header, or one
// bare email per line.
function parsePastedContacts(text: string): Record<string, any>[] {
  const lines = text
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);
  if (lines.length === 0) return [];

  const delimiter = lines[0].includes("\t") ? "\t" : lines[0].includes(",") ? "," : null;
  const looksLikeHeader =
    !lines[0].includes("@") && /name|email|phone|message|notes/i.test(lines[0]);

  let header: string[] | null = null;
  let dataLines = lines;
  if (delimiter && looksLikeHeader) {
    header = lines[0].split(delimiter).map((h) => h.trim());
    dataLines = lines.slice(1);
  }

  // Excel/Sheets wrap copied cells containing commas in quotes even when
  // tab-delimited — strip stray leading/trailing quotes so they don't end
  // up baked into the email/name/phone values.
  const stripQuotes = (s: string) => s.trim().replace(/^"+|"+$/g, "");

  const rows: Record<string, any>[] = [];

  for (const line of dataLines) {
    if (header && delimiter) {
      const cells = line.split(delimiter).map(stripQuotes);
      const row: Record<string, string> = {};
      header.forEach((h, i) => (row[h] = cells[i] || ""));
      rows.push(row);
      continue;
    }

    const emailsOnLine = line.match(new RegExp(EMAIL_RE.source, "g")) || [];

    // Multiple contacts pasted on one line — e.g. an email's To:/CC: field
    // copied as "Jane Doe <jane@x.com>, John Smith <john@x.com>".
    if (emailsOnLine.length > 1) {
      line.split(/[,;]/).forEach((chunk) => {
        const match = chunk
          .trim()
          .match(new RegExp(`^(.*?)[\\s<]*(${EMAIL_RE.source})>?$`));
        if (match) rows.push({ name: stripQuotes(match[1]), email: match[2] });
      });
      continue;
    }

    if (delimiter) {
      const cells = line.split(delimiter).map(stripQuotes);
      const email = cells.find((c) => EMAIL_RE.test(c)) || "";
      const rest = cells.filter((c) => c !== email);
      rows.push({ name: rest[0] || "", email, phone: rest[1] || "" });
      continue;
    }

    const match = line.match(new RegExp(`^(.*?)[\\s<]*(${EMAIL_RE.source})>?$`));
    rows.push(match ? { name: stripQuotes(match[1]), email: match[2] } : { email: line });
  }

  return rows;
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
  const [showPaste, setShowPaste] = useState(false);
  const [pasteText, setPasteText] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const saved = sessionStorage.getItem(SESSION_KEY);
    if (saved) {
      setPassword(saved);
      setAuthed(true);
    }
  }, []);

  const loadSubscribers = async (pw: string) => {
    setLoading(true);
    setLoadError("");
    try {
      const res = await fetch("/api/crm/subscribers", {
        headers: { "x-admin-password": pw },
      });
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
    if (authed) loadSubscribers(password);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authed]);

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch("/api/crm/subscribers", {
      headers: { "x-admin-password": password },
    });
    if (res.ok) {
      sessionStorage.setItem(SESSION_KEY, password);
      setAuthed(true);
      setAuthError("");
    } else if (res.status === 401) {
      setAuthError("Wrong password.");
    } else {
      setAuthError("Could not reach the backend. Check ENIGMA_API_URL and try again.");
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

  // Shared by both the file-upload and paste-contacts flows: normalize raw
  // rows (whatever their original column names/casing were), then POST.
  const importRows = async (rawRows: Record<string, any>[]) => {
    const parsed = rawRows
      .map((row) => ({
        name: findField(row, ["name", "full name"]),
        email: findField(row, ["email", "email address"]),
        phone: findField(row, ["phone", "phone number"]),
        message: findField(row, ["message", "notes"]),
      }))
      .filter((row) => row.email);

    if (parsed.length === 0) {
      setImportStatus("No rows with an email found.");
      return;
    }

    setImportStatus(`Importing ${parsed.length} rows...`);
    try {
      const res = await fetch("/api/crm/import", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-admin-password": password,
        },
        body: JSON.stringify({
          clientSlug: config.clientSlug,
          clientName: config.appName,
          subscribers: parsed,
        }),
      });

      if (!res.ok) throw new Error("Import failed");
      const json = await res.json();
      setImportStatus(
        `Imported ${json.insertedCount}, skipped ${json.skippedCount} duplicate(s).`
      );
      loadSubscribers(password);
    } catch {
      setImportStatus("Import failed — try again.");
    }
  };

  const handleImportFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImportStatus("Reading file...");
    try {
      const buffer = await file.arrayBuffer();
      const book = XLSX.read(buffer, { type: "array" });
      const sheet = book.Sheets[book.SheetNames[0]];
      const rawRows: Record<string, any>[] = XLSX.utils.sheet_to_json(sheet);
      await importRows(rawRows);
    } catch {
      setImportStatus("Import failed — check the file format and try again.");
    } finally {
      e.target.value = "";
    }
  };

  const handlePasteImport = async () => {
    const rawRows = parsePastedContacts(pasteText);
    if (rawRows.length === 0) {
      setImportStatus("Nothing to import — paste some contacts first.");
      return;
    }
    await importRows(rawRows);
    setPasteText("");
    setShowPaste(false);
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
          <div className="dropdown">
            <label tabIndex={0} className={`btn btn-outline btn-sm ${!subscribers.length ? "btn-disabled" : ""}`}>
              Export ▾
            </label>
            <ul tabIndex={0} className="dropdown-content menu menu-sm bg-base-100 border border-base-300 rounded-lg shadow-md w-40 z-10 p-1">
              <li><a onClick={handleExportCsv}>Export as CSV</a></li>
              <li><a onClick={handleExportXlsx}>Export as XLSX</a></li>
            </ul>
          </div>
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
          <button onClick={() => setShowPaste((v) => !v)} className="btn btn-primary btn-outline btn-sm">
            Paste Contacts
          </button>
          <button onClick={() => loadSubscribers(password)} className="btn btn-ghost btn-sm">
            Refresh
          </button>
        </div>

        {showPaste && (
          <div className="mb-6 rounded-lg border border-base-300 p-4">
            <p className="text-sm text-base-content/60 mb-2">
              Paste contacts from a spreadsheet or a plain list — one per line. Works with or
              without a header row (Name, Email, Phone, Message).
            </p>
            <textarea
              value={pasteText}
              onChange={(e) => setPasteText(e.target.value)}
              placeholder={"Name\tEmail\tPhone\nJane Doe\tjane@example.com\t305-555-0100"}
              rows={6}
              className="textarea textarea-bordered w-full font-mono text-xs"
            />
            <div className="flex gap-3 mt-3">
              <button onClick={handlePasteImport} className="btn btn-primary btn-sm" disabled={!pasteText.trim()}>
                Import Pasted Contacts
              </button>
              <button
                onClick={() => {
                  setShowPaste(false);
                  setPasteText("");
                }}
                className="btn btn-ghost btn-sm"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

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
                    <td>
                      <span className="badge badge-sm">{s.source}</span>
                    </td>
                    <td>{new Date(s.createdAt).toLocaleDateString()}</td>
                  </tr>
                ))}
                {subscribers.length === 0 && (
                  <tr>
                    <td colSpan={5} className="text-center text-base-content/50 py-8">
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
