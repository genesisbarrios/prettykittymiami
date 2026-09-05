"use client";

import { useState, FormEvent } from "react";
import config from "@/config";

type Status = "idle" | "loading" | "success" | "error";

export default function ContactForm() {
  const [status, setStatus] = useState<Status>("idle");
  // Honeypot — real users never see or fill this; bots that auto-fill every
  // input on the page do. Combined with formLoadedAt (a timing trap: humans
  // take at least a few seconds to fill the form) on the backend.
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
          clientPhone: config.phone.tel,
          clientWebsite: config.domainName,
          clientInstagram: config.instagramUrl,
          clientGoogleBusinessUrl: config.googleBusinessUrl,
          clientDonateUrl: `https://${config.domainName}/donate`,
          clientGetInvolvedUrl: `https://${config.domainName}/get-involved`,
          name: data.get("name"),
          email: data.get("email"),
          phone: data.get("phone"),
          message: data.get("message"),
          source: "contact_form",
          interestedAdopting: data.get("interestedAdopting") === "on",
          interestedFostering: data.get("interestedFostering") === "on",
          interestedVolunteering: data.get("interestedVolunteering") === "on",
          interestedTNR: data.get("interestedTNR") === "on",
          interestedStrays: data.get("interestedStrays") === "on",
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
      <div className="rounded-lg border border-primary/40 bg-primary/10 p-6 text-center">
        <p className="font-medium">Thanks — we got your message.</p>
        <p className="text-sm text-base-content/70 mt-1">
          We&apos;ll get back to you shortly.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      {/* Honeypot — hidden from real users, tempting for bots that auto-fill every field */}
      <input
        type="text"
        name="website"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
        style={{ position: "absolute", left: "-9999px", width: "1px", height: "1px", opacity: 0 }}
      />
      <div className="grid sm:grid-cols-2 gap-4">
        <input
          type="text"
          name="name"
          placeholder="Full name"
          required
          className="input input-bordered w-full"
        />
        <input
          type="tel"
          name="phone"
          placeholder="Phone number"
          className="input input-bordered w-full"
        />
      </div>
      <input
        type="email"
        name="email"
        placeholder="Email address"
        required
        className="input input-bordered w-full"
      />
      <div className="flex flex-wrap gap-x-6 gap-y-2">
        <label className="label cursor-pointer gap-2 justify-start p-0">
          <input type="checkbox" name="interestedAdopting" className="checkbox checkbox-primary checkbox-sm" />
          <span className="label-text">Interested in adopting</span>
        </label>
        <label className="label cursor-pointer gap-2 justify-start p-0">
          <input type="checkbox" name="interestedFostering" className="checkbox checkbox-primary checkbox-sm" />
          <span className="label-text">Interested in fostering</span>
        </label>
        <label className="label cursor-pointer gap-2 justify-start p-0">
          <input type="checkbox" name="interestedVolunteering" className="checkbox checkbox-primary checkbox-sm" />
          <span className="label-text">Interested in volunteering</span>
        </label>
        <label className="label cursor-pointer gap-2 justify-start p-0">
          <input type="checkbox" name="interestedTNR" className="checkbox checkbox-primary checkbox-sm" />
          <span className="label-text">Need help with TNR</span>
        </label>
        <label className="label cursor-pointer gap-2 justify-start p-0">
          <input type="checkbox" name="interestedStrays" className="checkbox checkbox-primary checkbox-sm" />
          <span className="label-text">Need help with strays</span>
        </label>
      </div>
      <textarea
        name="message"
        placeholder="Tell us more about yourself and your interest."
        rows={4}
        className="textarea textarea-bordered w-full"
      />
      <button
        type="submit"
        disabled={status === "loading"}
        className="btn btn-primary"
      >
        {status === "loading" ? "Sending..." : "Send Message"}
      </button>
      {status === "error" && (
        <p className="text-error text-sm">
          Something went wrong — please call or text us at {config.phone.display} instead.
        </p>
      )}
    </form>
  );
}
