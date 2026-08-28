"use client";

import { useState, FormEvent } from "react";
import config from "@/config";

type Status = "idle" | "loading" | "success" | "error";

export default function ContactForm() {
  const [status, setStatus] = useState<Status>("idle");

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setStatus("loading");

    const form = e.currentTarget;
    const data = new FormData(form);

    try {
      const res = await fetch(`${config.crm.apiUrl}/api/crm/contact`, {
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
          name: data.get("name"),
          email: data.get("email"),
          phone: data.get("phone"),
          message: data.get("message"),
          source: "contact_form",
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
      <textarea
        name="message"
        placeholder="Interested in adopting, fostering, or volunteering? Tell us more."
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
