"use client";

import { useState, FormEvent } from "react";
import config from "@/config";

type Status = "idle" | "loading" | "success" | "error";

// Reusable newsletter signup — placed on the homepage and About page per
// client request. Saves to the same ENIGMA_CRM subscribers collection as the
// contact form, tagged source: "newsletter".
export default function NewsletterForm({
  className = "",
  buttonLabel = "Get Discounts",
  successMessage = "You're in — watch your inbox for discounts.",
  buttonClassName = "btn-primary",
}: {
  className?: string;
  buttonLabel?: string;
  successMessage?: string;
  // Override when this form sits on a bg-primary section — "btn-primary"
  // would otherwise blend into the background.
  buttonClassName?: string;
}) {
  const [status, setStatus] = useState<Status>("idle");
  // Honeypot — real users never see or fill this; bots that auto-fill every
  // input on the page do. Combined with formLoadedAt (a timing trap: humans
  // take at least a couple seconds to fill the form) on the backend.
  const [formLoadedAt] = useState(() => Date.now());

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setStatus("loading");

    const form = e.currentTarget;
    const data = new FormData(form);

    try {
      const res = await fetch("/api/crm/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clientSlug: config.clientSlug,
          clientName: config.appName,
          clientContactEmail: config.contactEmail,
          clientWebsite: config.domainName,
          clientDonateUrl: `https://${config.domainName}/donate`,
          clientGetInvolvedUrl: `https://${config.domainName}/get-involved`,
          name: data.get("name"),
          phone: data.get("phone"),
          email: data.get("email"),
          source: "newsletter",
          website: data.get("website"),
          formLoadedAt,
        }),
      });

      if (!res.ok) throw new Error("Request failed");

      setStatus("success");
      form.reset();
    } catch {
      setStatus("error");
    }
  };

  if (status === "success") {
    return (
      <p className={`text-sm text-primary ${className}`}>{successMessage}</p>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className={`flex flex-col gap-3 w-full max-w-md ${className}`}
    >
      {/* Honeypot — hidden from real users, tempting for bots that auto-fill every field */}
      <input
        type="text"
        name="website"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
        style={{ position: "absolute", left: "-9999px", width: "1px", height: "1px", opacity: 0 }}
      />
      <div className="flex flex-col sm:flex-row gap-3">
        <input
          type="text"
          name="name"
          placeholder="Name (optional)"
          className="input input-bordered w-full"
        />
        <input
          type="tel"
          name="phone"
          placeholder="Phone (optional)"
          className="input input-bordered w-full"
        />
      </div>
      <div className="flex flex-col sm:flex-row gap-3">
        <input
          type="email"
          name="email"
          required
          placeholder="Your email address"
          className="input input-bordered w-full"
        />
        <button
          type="submit"
          disabled={status === "loading"}
          className={`btn ${buttonClassName} shrink-0`}
        >
          {status === "loading" ? "Joining..." : buttonLabel}
        </button>
      </div>
      {status === "error" && (
        <p className="text-error text-sm">
          Couldn&apos;t sign up — try again in a moment.
        </p>
      )}
    </form>
  );
}
