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
  interestedAdopting?: boolean;
  interestedFostering?: boolean;
  interestedVolunteering?: boolean;
  createdAt: string;
}

interface CampaignRecipient {
  subscriberId: string;
  email: string;
  name?: string;
  resendId?: string;
  error?: string;
}

interface Campaign {
  _id: string;
  templateKey: string;
  subject: string;
  html: string;
  recipients: CampaignRecipient[];
  recipientCount: number;
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
    Adopting: s.interestedAdopting ? "Yes" : "",
    Fostering: s.interestedFostering ? "Yes" : "",
    Volunteering: s.interestedVolunteering ? "Yes" : "",
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

// Starting points for the campaign composer — admin can edit freely before
// sending. "(name)" is mail-merged server-side with each recipient's first
// name.
const TEMPLATE_PRESETS: Record<string, { label: string; subject: string; body: string }> = {
  adopting: {
    label: "Adopting",
    subject: "Ready to meet your new best friend? 🐾",
    body: "Hi (name),\n\nThank you so much for your interest in adopting! We'd love to help you find your perfect match.\n\nThe next step is filling out our adoption application so we can get to know you and your home a little better. Once that's in, we'll be in touch to set up a meet & greet.\n\nWe can't wait to help you find your new best friend!",
  },
  fostering: {
    label: "Fostering",
    subject: "Thank you for wanting to foster! 🏡",
    body: "Hi (name),\n\nThank you for your interest in fostering with us — fosters are the heart of our rescue and make it possible for us to save even more lives.\n\nWe'll follow up shortly with more details on what fostering involves and how to get started. In the meantime, feel free to reply to this email with any questions!",
  },
  volunteering: {
    label: "Volunteering",
    subject: "Let's get you volunteering! 🙌",
    body: "Hi (name),\n\nThank you for wanting to volunteer with Pretty Kitty Miami-Dade Rescue! We always need extra hands and hearts to help care for our animals.\n\nWe'll be in touch soon with our upcoming volunteer opportunities and orientation details. Thanks again for wanting to get involved!",
  },
  events: {
    label: "Upcoming Event",
    subject: "Upcoming Pretty Kitty Event! 📅",
    body: "Hi (name),\n\nWe wanted to let you know about an upcoming event — [EVENT NAME] on [DATE] at [LOCATION].\n\n[Add event details here.]\n\nWe'd love to see you there!",
  },
  custom: {
    label: "Blank / Custom",
    subject: "",
    body: "Hi (name),\n\n",
  },
};

const SOURCE_LABELS: Record<string, string> = {
  contact_form: "Contact Form",
  newsletter: "Newsletter",
  import: "Imported",
};

function buildCampaignHtml(bodyText: string) {
  const bodyHtml = bodyText
    .split("\n")
    .map((line) => (line.trim() ? `<p style="line-height:1.6;margin:0 0 12px;color:#444;">${line}</p>` : ""))
    .join("\n");

  return `
  <div style="background:#fdf3f6;padding:32px 16px;font-family:Helvetica,Arial,sans-serif;">
    <div style="max-width:520px;margin:0 auto;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 2px 12px rgba(0,0,0,0.06);">
      <div style="padding:32px;">
        ${bodyHtml}
      </div>
      <div style="padding:20px 32px;background:#fdf3f6;text-align:center;">
        <p style="margin:0;color:#999;font-size:12px;">${config.appName}</p>
      </div>
    </div>
  </div>`;
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

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<Subscriber>>({});
  const [editSaving, setEditSaving] = useState(false);
  const [editError, setEditError] = useState("");

  const [viewingMessage, setViewingMessage] = useState<Subscriber | null>(null);

  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loadingCampaigns, setLoadingCampaigns] = useState(false);
  const [viewingCampaign, setViewingCampaign] = useState<Campaign | null>(null);

  const [showComposer, setShowComposer] = useState(false);
  const [composerTemplateKey, setComposerTemplateKey] = useState("custom");
  const [composerSubject, setComposerSubject] = useState("");
  const [composerBody, setComposerBody] = useState("");
  const [composerMode, setComposerMode] = useState<"select" | "all" | "source">("select");
  const [composerSourceFilter, setComposerSourceFilter] = useState("contact_form");
  const [composerSelectedIds, setComposerSelectedIds] = useState<Set<string>>(new Set());
  const [sending, setSending] = useState(false);
  const [sendStatus, setSendStatus] = useState("");

  const [sendLimit, setSendLimit] = useState<{ limit: number | null; usedToday: number; remaining: number | null } | null>(null);
  const [limitAlert, setLimitAlert] = useState("");

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

  const loadCampaigns = async (pw: string) => {
    setLoadingCampaigns(true);
    try {
      const res = await fetch("/api/crm/campaigns", {
        headers: { "x-admin-password": pw },
      });
      if (!res.ok) throw new Error("Failed to load campaigns");
      const json = await res.json();
      setCampaigns(json.campaigns || []);
    } catch {
      // Non-fatal — the subscribers table above still works.
    } finally {
      setLoadingCampaigns(false);
    }
  };

  const loadSendLimit = async (pw: string) => {
    try {
      const res = await fetch("/api/crm/send-limit", {
        headers: { "x-admin-password": pw },
      });
      if (!res.ok) return;
      const json = await res.json();
      setSendLimit({ limit: json.limit, usedToday: json.usedToday, remaining: json.remaining });
    } catch {
      // Non-fatal — sending still works without the live counter.
    }
  };

  useEffect(() => {
    if (authed) {
      loadSubscribers(password);
      loadCampaigns(password);
      loadSendLimit(password);
    }
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

  // ── Edit / delete ─────────────────────────────────────────────────────

  const openEdit = (subscriber: Subscriber) => {
    setEditingId(subscriber._id);
    setEditForm({ ...subscriber });
    setEditError("");
  };

  const closeEdit = () => {
    setEditingId(null);
    setEditForm({});
    setEditError("");
  };

  const handleEditSave = async () => {
    if (!editingId) return;
    setEditSaving(true);
    setEditError("");
    try {
      const res = await fetch(`/api/crm/subscribers/${editingId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "x-admin-password": password,
        },
        body: JSON.stringify({
          name: editForm.name || "",
          email: editForm.email || "",
          phone: editForm.phone || "",
          message: editForm.message || "",
          source: editForm.source || "contact_form",
          interestedAdopting: Boolean(editForm.interestedAdopting),
          interestedFostering: Boolean(editForm.interestedFostering),
          interestedVolunteering: Boolean(editForm.interestedVolunteering),
        }),
      });
      if (!res.ok) throw new Error("Save failed");
      const json = await res.json();
      setSubscribers((prev) => prev.map((s) => (s._id === editingId ? json.subscriber : s)));
      closeEdit();
    } catch {
      setEditError("Could not save changes — try again.");
    } finally {
      setEditSaving(false);
    }
  };

  const handleDelete = async (subscriber: Subscriber) => {
    const confirmDelete = window.confirm(
      `Delete ${subscriber.name || subscriber.email}? This can't be undone.`
    );
    if (!confirmDelete) return;

    try {
      const res = await fetch(`/api/crm/subscribers/${subscriber._id}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          "x-admin-password": password,
        },
      });
      if (!res.ok) throw new Error("Delete failed");
      setSubscribers((prev) => prev.filter((s) => s._id !== subscriber._id));
      setComposerSelectedIds((prev) => {
        const next = new Set(prev);
        next.delete(subscriber._id);
        return next;
      });
    } catch {
      window.alert("Could not delete this subscriber — try again.");
    }
  };

  // ── Campaign composer ────────────────────────────────────────────────

  const openComposer = (templateKey: string, presetSelectedIds?: string[]) => {
    const preset = TEMPLATE_PRESETS[templateKey] || TEMPLATE_PRESETS.custom;
    setComposerTemplateKey(templateKey);
    setComposerSubject(preset.subject);
    setComposerBody(preset.body);
    setSendStatus("");
    if (presetSelectedIds) {
      setComposerMode("select");
      setComposerSelectedIds(new Set(presetSelectedIds));
    } else {
      setComposerMode("select");
      setComposerSelectedIds(new Set());
    }
    setShowComposer(true);
  };

  const openReply = (subscriber: Subscriber) => {
    setComposerTemplateKey("reply");
    setComposerSubject(`Re: your message to ${config.appName}`);
    setComposerBody(`Hi (name),\n\n`);
    setComposerMode("select");
    setComposerSelectedIds(new Set([subscriber._id]));
    setSendStatus("");
    setShowComposer(true);
  };

  const closeComposer = () => {
    setShowComposer(false);
    setSendStatus("");
  };

  const toggleComposerSelected = (id: string) => {
    setComposerSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const resolveRecipientIds = (): string[] => {
    if (composerMode === "all") return subscribers.map((s) => s._id);
    if (composerMode === "source") {
      return subscribers.filter((s) => s.source === composerSourceFilter).map((s) => s._id);
    }
    return Array.from(composerSelectedIds);
  };

  const handleSendCampaign = async () => {
    const recipientIds = resolveRecipientIds();
    if (!composerSubject.trim() || !composerBody.trim()) {
      setSendStatus("Subject and message body are required.");
      return;
    }
    if (recipientIds.length === 0) {
      setSendStatus("Select at least one recipient.");
      return;
    }

    const confirmSend = window.confirm(
      `Send this email to ${recipientIds.length} recipient${recipientIds.length === 1 ? "" : "s"}?`
    );
    if (!confirmSend) return;

    setSending(true);
    setSendStatus("Sending...");
    try {
      const res = await fetch("/api/crm/campaigns", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-admin-password": password,
        },
        body: JSON.stringify({
          templateKey: composerTemplateKey,
          subject: composerSubject,
          html: buildCampaignHtml(composerBody),
          recipientIds,
        }),
      });
      const json = await res.json();

      if (res.status === 429 || json.limitExceeded) {
        setSendStatus("");
        setLimitAlert(
          json.message ||
            `Sending to ${recipientIds.length} would exceed today's OUTREACH send limit.`
        );
        setSendLimit({ limit: json.limit, usedToday: json.usedToday, remaining: json.remaining });
        return;
      }

      if (!res.ok) throw new Error("Send failed");

      setSendStatus(`Sent to ${recipientIds.length} recipient${recipientIds.length === 1 ? "" : "s"}.`);
      loadCampaigns(password);
      loadSendLimit(password);
      setTimeout(() => {
        setShowComposer(false);
        setSendStatus("");
      }, 1200);
    } catch {
      setSendStatus("Could not send — try again.");
    } finally {
      setSending(false);
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

  const recipientPreviewCount = resolveRecipientIds().length;

  return (
    <div data-theme={config.colors.theme} className="min-h-screen bg-base-100 px-6 py-10">
      <div className="max-w-6xl mx-auto">
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
          <div className="overflow-x-auto border border-base-300 rounded-lg mb-16">
            <table className="table">
              <thead>
                <tr>
                  <th>Actions</th>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>Source</th>
                  <th>Message</th>
                  <th>Interests</th>
                  <th>Signed Up</th>
                </tr>
              </thead>
              <tbody>
                {subscribers.map((s) => (
                  <tr key={s._id}>
                    <td>
                      <div className="flex gap-2">
                        <button onClick={() => openEdit(s)} className="btn btn-ghost btn-xs">
                          Edit
                        </button>
                        <button onClick={() => handleDelete(s)} className="btn btn-ghost btn-xs text-error">
                          Delete
                        </button>
                      </div>
                    </td>
                    <td>{s.name || "—"}</td>
                    <td>{s.email}</td>
                    <td>{s.phone || "—"}</td>
                    <td>
                      <span className="badge badge-sm">{SOURCE_LABELS[s.source] || s.source}</span>
                    </td>
                    <td>
                      <div className="flex gap-2">
                        {s.message ? (
                          <button onClick={() => setViewingMessage(s)} className="btn btn-outline btn-xs">
                            See Message
                          </button>
                        ) : (
                          <span className="text-base-content/40 text-xs">—</span>
                        )}
                        <button onClick={() => openReply(s)} className="btn btn-primary btn-xs">
                          Reply
                        </button>
                      </div>
                    </td>
                    <td>
                      <div className="flex flex-wrap gap-1">
                        {s.interestedAdopting && <span className="badge badge-sm badge-primary">Adopting</span>}
                        {s.interestedFostering && <span className="badge badge-sm badge-primary">Fostering</span>}
                        {s.interestedVolunteering && <span className="badge badge-sm badge-primary">Volunteering</span>}
                        {!s.interestedAdopting && !s.interestedFostering && !s.interestedVolunteering && (
                          <span className="text-base-content/40 text-xs">—</span>
                        )}
                      </div>
                    </td>
                    <td>{new Date(s.createdAt).toLocaleDateString()}</td>
                  </tr>
                ))}
                {subscribers.length === 0 && (
                  <tr>
                    <td colSpan={8} className="text-center text-base-content/50 py-8">
                      No subscribers yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* ── OUTREACH ──────────────────────────────────────────────── */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-2">
          <h2 className="font-display text-2xl tracking-wide">OUTREACH</h2>
          <div className="ml-auto flex items-center gap-4">
            {sendLimit && sendLimit.limit != null && (
              <span
                className={`text-sm ${
                  sendLimit.remaining !== null && sendLimit.remaining <= 0
                    ? "text-error font-medium"
                    : "text-base-content/60"
                }`}
                title={`Daily OUTREACH send limit — ${sendLimit.limit} out of the shared Resend account limit`}
              >
                Daily limit: {sendLimit.usedToday} / {sendLimit.limit} sent
              </span>
            )}
            <button onClick={() => openComposer("custom")} className="btn btn-primary btn-sm">
              New Campaign
            </button>
          </div>
        </div>

        {limitAlert && (
          <div className="modal modal-open">
            <div className="modal-box max-w-md">
              <h3 className="font-display text-xl tracking-wide mb-2 text-error">Daily Send Limit Reached</h3>
              <p className="text-base-content/80">{limitAlert}</p>
              <p className="text-sm text-base-content/60 mt-3">
                This limit resets at midnight. Reach out to Enigma Labs if you need it raised.
              </p>
              <div className="modal-action">
                <button onClick={() => setLimitAlert("")} className="btn btn-primary">
                  Got it
                </button>
              </div>
            </div>
            <div className="modal-backdrop" onClick={() => setLimitAlert("")} />
          </div>
        )}

        <div className="flex flex-wrap gap-2 mb-6">
          {Object.entries(TEMPLATE_PRESETS)
            .filter(([key]) => key !== "custom")
            .map(([key, preset]) => (
              <button
                key={key}
                onClick={() => openComposer(key)}
                className="btn btn-outline btn-sm"
              >
                {preset.label} Template
              </button>
            ))}
        </div>

        {loadingCampaigns && <p className="text-base-content/60">Loading campaigns...</p>}

        <div className="overflow-x-auto border border-base-300 rounded-lg">
          <table className="table">
            <thead>
              <tr>
                <th>Subject</th>
                <th>Template</th>
                <th>Recipients</th>
                <th>Sent</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {campaigns.map((c) => (
                <tr key={c._id}>
                  <td>{c.subject}</td>
                  <td>
                    <span className="badge badge-sm">
                      {TEMPLATE_PRESETS[c.templateKey]?.label || (c.templateKey === "reply" ? "Reply" : "Custom")}
                    </span>
                  </td>
                  <td>{c.recipientCount}</td>
                  <td>{new Date(c.createdAt).toLocaleString()}</td>
                  <td>
                    <button onClick={() => setViewingCampaign(c)} className="btn btn-ghost btn-xs">
                      View
                    </button>
                  </td>
                </tr>
              ))}
              {!loadingCampaigns && campaigns.length === 0 && (
                <tr>
                  <td colSpan={5} className="text-center text-base-content/50 py-8">
                    No campaigns sent yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Edit subscriber modal ──────────────────────────────────── */}
      {editingId && (
        <div className="modal modal-open">
          <div className="modal-box max-w-lg">
            <h3 className="font-display text-xl tracking-wide mb-4">Edit Subscriber</h3>
            <div className="flex flex-col gap-3">
              <input
                type="text"
                placeholder="Name"
                value={editForm.name || ""}
                onChange={(e) => setEditForm((f) => ({ ...f, name: e.target.value }))}
                className="input input-bordered w-full"
              />
              <input
                type="email"
                placeholder="Email"
                value={editForm.email || ""}
                onChange={(e) => setEditForm((f) => ({ ...f, email: e.target.value }))}
                className="input input-bordered w-full"
              />
              <input
                type="tel"
                placeholder="Phone"
                value={editForm.phone || ""}
                onChange={(e) => setEditForm((f) => ({ ...f, phone: e.target.value }))}
                className="input input-bordered w-full"
              />
              <select
                value={editForm.source || "contact_form"}
                onChange={(e) => setEditForm((f) => ({ ...f, source: e.target.value }))}
                className="select select-bordered w-full"
              >
                <option value="contact_form">Contact Form</option>
                <option value="newsletter">Newsletter</option>
                <option value="import">Imported</option>
              </select>
              <textarea
                placeholder="Message"
                value={editForm.message || ""}
                onChange={(e) => setEditForm((f) => ({ ...f, message: e.target.value }))}
                rows={4}
                className="textarea textarea-bordered w-full"
              />
              <div className="flex flex-wrap gap-x-6 gap-y-2">
                <label className="label cursor-pointer gap-2 justify-start p-0">
                  <input
                    type="checkbox"
                    checked={Boolean(editForm.interestedAdopting)}
                    onChange={(e) => setEditForm((f) => ({ ...f, interestedAdopting: e.target.checked }))}
                    className="checkbox checkbox-primary checkbox-sm"
                  />
                  <span className="label-text">Adopting</span>
                </label>
                <label className="label cursor-pointer gap-2 justify-start p-0">
                  <input
                    type="checkbox"
                    checked={Boolean(editForm.interestedFostering)}
                    onChange={(e) => setEditForm((f) => ({ ...f, interestedFostering: e.target.checked }))}
                    className="checkbox checkbox-primary checkbox-sm"
                  />
                  <span className="label-text">Fostering</span>
                </label>
                <label className="label cursor-pointer gap-2 justify-start p-0">
                  <input
                    type="checkbox"
                    checked={Boolean(editForm.interestedVolunteering)}
                    onChange={(e) => setEditForm((f) => ({ ...f, interestedVolunteering: e.target.checked }))}
                    className="checkbox checkbox-primary checkbox-sm"
                  />
                  <span className="label-text">Volunteering</span>
                </label>
              </div>
              {editError && <p className="text-error text-sm">{editError}</p>}
            </div>
            <div className="modal-action">
              <button onClick={closeEdit} className="btn btn-ghost" disabled={editSaving}>
                Cancel
              </button>
              <button onClick={handleEditSave} className="btn btn-primary" disabled={editSaving}>
                {editSaving ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </div>
          <div className="modal-backdrop" onClick={closeEdit} />
        </div>
      )}

      {/* ── View message modal ─────────────────────────────────────── */}
      {viewingMessage && (
        <div className="modal modal-open">
          <div className="modal-box max-w-lg">
            <h3 className="font-display text-xl tracking-wide mb-2">
              Message from {viewingMessage.name || viewingMessage.email}
            </h3>
            <p className="text-sm text-base-content/60 mb-4">
              {new Date(viewingMessage.createdAt).toLocaleString()}
            </p>
            <p className="whitespace-pre-wrap text-base-content/80">{viewingMessage.message}</p>
            <div className="modal-action">
              <button
                onClick={() => {
                  openReply(viewingMessage);
                  setViewingMessage(null);
                }}
                className="btn btn-primary"
              >
                Reply
              </button>
              <button onClick={() => setViewingMessage(null)} className="btn btn-ghost">
                Close
              </button>
            </div>
          </div>
          <div className="modal-backdrop" onClick={() => setViewingMessage(null)} />
        </div>
      )}

      {/* ── View sent campaign modal ───────────────────────────────── */}
      {viewingCampaign && (
        <div className="modal modal-open">
          <div className="modal-box max-w-2xl">
            <h3 className="font-display text-xl tracking-wide mb-1">{viewingCampaign.subject}</h3>
            <p className="text-sm text-base-content/60 mb-4">
              Sent {new Date(viewingCampaign.createdAt).toLocaleString()} to {viewingCampaign.recipientCount} recipient
              {viewingCampaign.recipientCount === 1 ? "" : "s"}
            </p>
            <div className="border border-base-300 rounded-lg overflow-hidden mb-4">
              <iframe
                title="Sent email preview"
                srcDoc={viewingCampaign.html}
                className="w-full h-80 bg-white"
              />
            </div>
            <div className="max-h-40 overflow-y-auto">
              <table className="table table-xs">
                <thead>
                  <tr>
                    <th>Recipient</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {viewingCampaign.recipients.map((r) => (
                    <tr key={r.subscriberId || r.email}>
                      <td>{r.name ? `${r.name} <${r.email}>` : r.email}</td>
                      <td>{r.error ? <span className="text-error">{r.error}</span> : <span className="text-success">Sent</span>}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="modal-action">
              <button onClick={() => setViewingCampaign(null)} className="btn btn-ghost">
                Close
              </button>
            </div>
          </div>
          <div className="modal-backdrop" onClick={() => setViewingCampaign(null)} />
        </div>
      )}

      {/* ── Campaign composer modal ────────────────────────────────── */}
      {showComposer && (
        <div className="modal modal-open">
          <div className="modal-box max-w-2xl">
            <h3 className="font-display text-xl tracking-wide mb-4">New Campaign</h3>

            <div className="flex flex-col gap-3 mb-4">
              <select
                value={composerTemplateKey}
                onChange={(e) => {
                  const key = e.target.value;
                  const preset = TEMPLATE_PRESETS[key] || TEMPLATE_PRESETS.custom;
                  setComposerTemplateKey(key);
                  setComposerSubject(preset.subject);
                  setComposerBody(preset.body);
                }}
                className="select select-bordered w-full"
              >
                {Object.entries(TEMPLATE_PRESETS).map(([key, preset]) => (
                  <option key={key} value={key}>{preset.label}</option>
                ))}
                <option value="reply">Reply (blank)</option>
              </select>
              <input
                type="text"
                placeholder="Subject"
                value={composerSubject}
                onChange={(e) => setComposerSubject(e.target.value)}
                className="input input-bordered w-full"
              />
              <textarea
                placeholder="Message — use (name) to insert each recipient's first name"
                value={composerBody}
                onChange={(e) => setComposerBody(e.target.value)}
                rows={8}
                className="textarea textarea-bordered w-full font-mono text-sm"
              />
            </div>

            <div className="border-t border-base-300 pt-4">
              <p className="text-sm font-medium mb-2">Send to</p>
              <div className="flex flex-wrap gap-4 mb-3">
                <label className="label cursor-pointer gap-2 justify-start p-0">
                  <input
                    type="radio"
                    name="composerMode"
                    checked={composerMode === "select"}
                    onChange={() => setComposerMode("select")}
                    className="radio radio-primary radio-sm"
                  />
                  <span className="label-text">Select individually</span>
                </label>
                <label className="label cursor-pointer gap-2 justify-start p-0">
                  <input
                    type="radio"
                    name="composerMode"
                    checked={composerMode === "all"}
                    onChange={() => setComposerMode("all")}
                    className="radio radio-primary radio-sm"
                  />
                  <span className="label-text">All subscribers ({subscribers.length})</span>
                </label>
                <label className="label cursor-pointer gap-2 justify-start p-0">
                  <input
                    type="radio"
                    name="composerMode"
                    checked={composerMode === "source"}
                    onChange={() => setComposerMode("source")}
                    className="radio radio-primary radio-sm"
                  />
                  <span className="label-text">By source</span>
                  {composerMode === "source" && (
                    <select
                      value={composerSourceFilter}
                      onChange={(e) => setComposerSourceFilter(e.target.value)}
                      className="select select-bordered select-xs ml-1"
                    >
                      <option value="contact_form">Contact Form</option>
                      <option value="newsletter">Newsletter</option>
                      <option value="import">Imported</option>
                    </select>
                  )}
                </label>
              </div>

              {composerMode === "select" && (
                <div className="max-h-48 overflow-y-auto border border-base-300 rounded-lg p-2">
                  {subscribers.map((s) => (
                    <label key={s._id} className="label cursor-pointer justify-start gap-2 py-1">
                      <input
                        type="checkbox"
                        checked={composerSelectedIds.has(s._id)}
                        onChange={() => toggleComposerSelected(s._id)}
                        className="checkbox checkbox-primary checkbox-sm"
                      />
                      <span className="label-text text-sm">
                        {s.name ? `${s.name} <${s.email}>` : s.email}
                      </span>
                    </label>
                  ))}
                  {subscribers.length === 0 && (
                    <p className="text-sm text-base-content/50 p-2">No subscribers to select.</p>
                  )}
                </div>
              )}

              <p className="text-sm text-base-content/60 mt-2">
                {recipientPreviewCount} recipient{recipientPreviewCount === 1 ? "" : "s"} selected
              </p>
            </div>

            {sendStatus && <p className="text-sm mt-3">{sendStatus}</p>}

            <div className="modal-action">
              <button onClick={closeComposer} className="btn btn-ghost" disabled={sending}>
                Cancel
              </button>
              <button onClick={handleSendCampaign} className="btn btn-primary" disabled={sending}>
                {sending ? "Sending..." : `Send to ${recipientPreviewCount}`}
              </button>
            </div>
          </div>
          <div className="modal-backdrop" onClick={closeComposer} />
        </div>
      )}
    </div>
  );
}
