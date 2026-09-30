"use client";

import { useCallback, useEffect, useState } from "react";

// Mailing List & Analytics panels for /admin. Both read through this site's
// own /api/crm/* routes with the admin password the user typed.

type Stats = {
  visitors: number;
  pageViews: number;
  newsletterSignups: number;
  contactSubmissions: number;
  phoneClicks: number;
  emailClicks: number;
  socialClicks: number;
  socialBreakdown: { label: string; count: number }[];
};

type Breakdown = { label: string; users: number }[];

type WebAnalytics = {
  days: number;
  serviceAccountEmail: string;
  ga: {
    connected: boolean;
    error?: string;
    data?: {
      visitors: number;
      newVisitors: number;
      sessions: number;
      pageViews: number;
      cities: Breakdown;
      countries: Breakdown;
      ages: Breakdown;
      genders: Breakdown;
    };
  };
  searchConsole: {
    connected: boolean;
    error?: string;
    data?: {
      clicks: number;
      impressions: number;
      ctr: number;
      position: number;
      topQueries: { query: string; clicks: number; impressions: number; position: number }[];
    };
  };
};

type Settings = {
  gtmId: string;
  gaMeasurementId: string;
  metaPixelId: string;
  gaPropertyId: string;
  searchConsoleSiteUrl: string;
};

// Treats a missing number as 0 (e.g. an older backend without visitor counts).
const fmt = (n?: number) => (n ?? 0).toLocaleString();

function RangePicker({
  value,
  options,
  onChange,
}: {
  value: number;
  options: [number, string][];
  onChange: (days: number) => void;
}) {
  return (
    <div className="join">
      {options.map(([days, label]) => (
        <button
          key={days}
          onClick={() => onChange(days)}
          className={`join-item btn btn-xs ${value === days ? "btn-primary" : "btn-ghost"}`}
        >
          {label}
        </button>
      ))}
    </div>
  );
}

function StatCard({ label, value, detail }: { label: string; value: number | string; detail?: string }) {
  return (
    <div className="rounded-lg border border-base-300 bg-base-200 p-4">
      <div className="text-xs uppercase tracking-widest text-base-content/60">{label}</div>
      <div className="font-display text-3xl mt-1">{value}</div>
      {detail && <div className="text-xs text-base-content/50 mt-1 truncate" title={detail}>{detail}</div>}
    </div>
  );
}

// ── Internal analytics: our own CRM data ─────────────────────────────────

export function InternalAnalyticsCards({ password }: { password: string }) {
  const [days, setDays] = useState(30);
  const [stats, setStats] = useState<Stats | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!password) return;
    let cancelled = false;
    setError("");
    fetch(`/api/crm/stats?days=${days}`, { headers: { "x-admin-password": password }, cache: "no-store" })
      .then((res) => (res.ok ? res.json() : Promise.reject()))
      .then((json) => !cancelled && setStats(json))
      .catch(() => !cancelled && setError("Could not load analytics."));
    return () => {
      cancelled = true;
    };
  }, [password, days]);

  const social = stats?.socialBreakdown?.map((s) => `${s.label} ${s.count}`).join(" · ");

  return (
    <section className="mb-10">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
        <h2 className="font-display text-2xl tracking-wide">SITE ACTIVITY</h2>
        <RangePicker
          value={days}
          onChange={setDays}
          options={[[7, "7 days"], [30, "30 days"], [90, "90 days"], [0, "All time"]]}
        />
      </div>
      {error && <p className="text-error text-sm mb-2">{error}</p>}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        <StatCard
          label="Site Visitors"
          value={stats ? fmt(stats.visitors) : "—"}
          detail={stats ? `${fmt(stats.pageViews)} page views` : undefined}
        />
        <StatCard label="Newsletter Signups" value={stats ? fmt(stats.newsletterSignups) : "—"} />
        <StatCard label="Contact Form" value={stats ? fmt(stats.contactSubmissions) : "—"} />
        <StatCard label="Phone Clicks" value={stats ? fmt(stats.phoneClicks) : "—"} />
        <StatCard label="Email Clicks" value={stats ? fmt(stats.emailClicks) : "—"} />
        <StatCard label="Social Clicks" value={stats ? fmt(stats.socialClicks) : "—"} detail={social || undefined} />
      </div>
    </section>
  );
}

// ── Website analytics: GA4 + Search Console, plus account connections ───

function BreakdownList({ title, rows, empty }: { title: string; rows: Breakdown; empty: string }) {
  const total = rows.reduce((sum, r) => sum + r.users, 0) || 1;
  return (
    <div className="rounded-lg border border-base-300 p-4">
      <div className="text-xs uppercase tracking-widest text-base-content/60 mb-3">{title}</div>
      {rows.length === 0 ? (
        <p className="text-sm text-base-content/50">{empty}</p>
      ) : (
        <ul className="flex flex-col gap-2">
          {rows.map((r) => (
            <li key={r.label} className="text-sm">
              <div className="flex justify-between gap-2">
                <span className="truncate capitalize">{r.label}</span>
                <span className="text-base-content/60">{fmt(r.users)}</span>
              </div>
              <progress className="progress progress-primary h-1.5 w-full" value={r.users} max={total} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

const SETTING_FIELDS: { key: keyof Settings; label: string; placeholder: string; help: string }[] = [
  { key: "gtmId", label: "Google Tag Manager container ID", placeholder: "GTM-XXXXXXX", help: "Tag Manager → Admin → Container ID." },
  {
    key: "gaMeasurementId",
    label: "GA4 measurement ID",
    placeholder: "G-XXXXXXXXXX",
    help: "GA4 → Admin → Data streams. Leave blank if GA4 is already set up inside your Tag Manager container, or visits get counted twice.",
  },
  { key: "metaPixelId", label: "Meta Pixel ID", placeholder: "123456789012345", help: "Meta Events Manager → Data sources → your pixel's ID." },
  { key: "gaPropertyId", label: "GA4 property ID (for reports)", placeholder: "123456789", help: "GA4 → Admin → Property details. Numbers only." },
  {
    key: "searchConsoleSiteUrl",
    label: "Search Console property",
    placeholder: "sc-domain:example.com or https://example.com/",
    help: "Exactly as it appears in Search Console's property picker.",
  },
];

function ConnectAccounts({ password, serviceAccountEmail, onSaved }: { password: string; serviceAccountEmail: string; onSaved: () => void }) {
  const [form, setForm] = useState<Settings | null>(null);
  const [status, setStatus] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch("/api/crm/settings", { headers: { "x-admin-password": password }, cache: "no-store" })
      .then((res) => (res.ok ? res.json() : Promise.reject()))
      .then((json) => setForm(json.settings))
      .catch(() => setStatus("Could not load saved accounts."));
  }, [password]);

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form) return;
    setSaving(true);
    setStatus("");
    try {
      const res = await fetch("/api/crm/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json", "x-admin-password": password },
        body: JSON.stringify(form),
      });
      const json = await res.json();
      if (!res.ok) {
        const field = SETTING_FIELDS.find((f) => f.key === json.field);
        setStatus(field ? `Check the ${field.label} — that format doesn't look right.` : json.message || "Could not save.");
        return;
      }
      setForm(json.settings);
      setStatus("Saved. Tags go live on the site within about 5 minutes.");
      onSaved();
    } catch {
      setStatus("Could not save — try again.");
    } finally {
      setSaving(false);
    }
  };

  if (!form) return <p className="text-sm text-base-content/60">{status || "Loading..."}</p>;

  return (
    <form onSubmit={save} className="flex flex-col gap-4">
      {SETTING_FIELDS.map((f) => (
        <label key={f.key} className="form-control w-full">
          <span className="label-text font-medium mb-1">{f.label}</span>
          <input
            type="text"
            value={form[f.key]}
            onChange={(e) => setForm({ ...form, [f.key]: e.target.value.trim() })}
            placeholder={f.placeholder}
            className="input input-bordered input-sm w-full"
          />
          <span className="text-xs text-base-content/50 mt-1">{f.help}</span>
        </label>
      ))}
      <div className="rounded-lg bg-base-200 p-3 text-xs text-base-content/70">
        To show reports here, give{" "}
        {serviceAccountEmail ? <code className="font-mono">{serviceAccountEmail}</code> : "Enigma Labs' Google service account"}{" "}
        <strong>Viewer</strong> access in GA4 (Admin → Property access management) and add it as a user in Search Console
        (Settings → Users and permissions).
      </div>
      <div className="flex items-center gap-3">
        <button type="submit" className="btn btn-primary btn-sm" disabled={saving}>
          {saving ? "Saving..." : "Save Accounts"}
        </button>
        {status && <span className="text-sm text-base-content/70">{status}</span>}
      </div>
    </form>
  );
}

export function WebsiteAnalytics({ password }: { password: string }) {
  const [days, setDays] = useState(28);
  const [report, setReport] = useState<WebAnalytics | null>(null);
  const [error, setError] = useState("");
  const [showConnect, setShowConnect] = useState(false);

  const load = useCallback(() => {
    if (!password) return;
    setError("");
    fetch(`/api/crm/web-analytics?days=${days}`, { headers: { "x-admin-password": password }, cache: "no-store" })
      .then((res) => (res.ok ? res.json() : Promise.reject()))
      .then(setReport)
      .catch(() => setError("Could not load website analytics."));
  }, [password, days]);

  useEffect(() => {
    load();
  }, [load]);

  const ga = report?.ga;
  const sc = report?.searchConsole;
  const nothingConnected = report && !ga?.connected && !sc?.connected;

  return (
    <section className="mt-12">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <h2 className="font-display text-2xl tracking-wide">WEBSITE ANALYTICS</h2>
        <div className="flex flex-wrap items-center gap-3">
          <RangePicker value={days} onChange={setDays} options={[[7, "7 days"], [28, "28 days"], [90, "90 days"]]} />
          <button onClick={() => setShowConnect((v) => !v)} className="btn btn-outline btn-sm">
            {showConnect ? "Close" : "Connect Accounts"}
          </button>
        </div>
      </div>

      {showConnect && (
        <div className="rounded-lg border border-base-300 p-5 mb-6">
          <h3 className="font-semibold mb-1">Connect accounts</h3>
          <p className="text-sm text-base-content/60 mb-4">
            Tag Manager, GA4, and Meta Pixel tags load on every page of the site. The property IDs below are only used to
            pull reports into this page.
          </p>
          <ConnectAccounts password={password} serviceAccountEmail={report?.serviceAccountEmail || ""} onSaved={load} />
        </div>
      )}

      {error && <p className="text-error text-sm">{error}</p>}
      {!report && !error && <p className="text-base-content/60">Loading...</p>}

      {nothingConnected && !showConnect && (
        <p className="text-base-content/50">
          No Google Analytics or Search Console connected yet —{" "}
          <button onClick={() => setShowConnect(true)} className="link link-primary">connect accounts</button> to see
          visitors, locations, demographics, and search rankings here.
        </p>
      )}

      {ga?.connected && (
        <div className="mb-8">
          <h3 className="text-sm uppercase tracking-widest text-base-content/60 mb-3">Visitors — Google Analytics</h3>
          {ga.error && <p className="text-error text-sm mb-3">Google Analytics: {ga.error}</p>}
          {ga.data && (
            <>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                <StatCard label="Visitors" value={fmt(ga.data.visitors)} />
                <StatCard label="New Visitors" value={fmt(ga.data.newVisitors)} />
                <StatCard label="Sessions" value={fmt(ga.data.sessions)} />
                <StatCard label="Page Views" value={fmt(ga.data.pageViews)} />
              </div>
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-3">
                <BreakdownList title="Top Cities" rows={ga.data.cities} empty="No location data yet." />
                <BreakdownList title="Countries" rows={ga.data.countries} empty="No location data yet." />
                <BreakdownList
                  title="Age"
                  rows={ga.data.ages}
                  empty="Needs Google signals on in GA4, and enough traffic to pass GA's privacy threshold."
                />
                <BreakdownList
                  title="Gender"
                  rows={ga.data.genders}
                  empty="Needs Google signals on in GA4, and enough traffic to pass GA's privacy threshold."
                />
              </div>
            </>
          )}
        </div>
      )}

      {sc?.connected && (
        <div>
          <h3 className="text-sm uppercase tracking-widest text-base-content/60 mb-3">SEO — Google Search Console</h3>
          {sc.error && <p className="text-error text-sm mb-3">Search Console: {sc.error}</p>}
          {sc.data && (
            <>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                <StatCard label="Search Clicks" value={fmt(sc.data.clicks)} />
                <StatCard label="Impressions" value={fmt(sc.data.impressions)} />
                <StatCard label="Avg. Position" value={sc.data.position ? sc.data.position.toFixed(1) : "—"} />
                <StatCard label="Click Rate" value={`${(sc.data.ctr * 100).toFixed(1)}%`} />
              </div>
              <div className="overflow-x-auto border border-base-300 rounded-lg">
                <table className="table table-sm">
                  <thead>
                    <tr>
                      <th>Top Search Queries</th>
                      <th>Clicks</th>
                      <th>Impressions</th>
                      <th>Avg. Position</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sc.data.topQueries.map((q) => (
                      <tr key={q.query}>
                        <td>{q.query}</td>
                        <td>{fmt(q.clicks)}</td>
                        <td>{fmt(q.impressions)}</td>
                        <td>{q.position.toFixed(1)}</td>
                      </tr>
                    ))}
                    {sc.data.topQueries.length === 0 && (
                      <tr>
                        <td colSpan={4} className="text-center text-base-content/50 py-6">
                          No search data for this range yet.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>
      )}
    </section>
  );
}
