# Pretty Kitty Miami-Dade Rescue

Next.js site for Pretty Kitty Miami-Dade Rescue Inc, a 501(c)(3) nonprofit
cat rescue in North Miami, FL. Content (mission, programs, contact info,
photos) was pulled from the organization's existing site at
[prettykittymiamirescue.org](https://www.prettykittymiamirescue.org) and
rebuilt on the same Enigma Labs client-site template used for
[Monark Barbershop](../monarkbarbershop),
[Javier Hardscaping Design](../javierhardscaping), and
[JaJa's Plate](../jajasplate) — see
[Reusing this as a template](#reusing-this-as-a-template) below.

## Stack

- Next.js 14 (App Router) + TypeScript
- Tailwind CSS + DaisyUI (custom "prettykitty" rose/teal theme)
- Backend: [`enigma-node-server`](../enigma-node-server-main) — the contact
  form and newsletter signups POST to its `ENIGMA_CRM` API

## Getting started

1. **Install dependencies**

   ```bash
   npm install
   ```

2. **Set environment variables** — copy `.env.local` (already present) and
   adjust as needed:

   ```
   NEXT_PUBLIC_ENIGMA_API_URL=http://localhost:5001
   NEXT_PUBLIC_ADMIN_PASSWORD=pw
   ```

   `NEXT_PUBLIC_ENIGMA_API_URL` must point at a running `enigma-node-server`
   instance. To run it locally:

   ```bash
   cd ../enigma-node-server-main
   npm install
   npm run server   # nodemon index.js, defaults to port 5001
   ```

3. **Run the dev server**

   ```bash
   npm run dev
   ```

   Visit [http://localhost:3000](http://localhost:3000).

## Other scripts

```bash
npm run build   # production build
npm run start   # serve the production build
npm run lint    # lint
```

## Pages

- `/` — landing page (Donate CTA, impact stats, recent rescues, ways to help preview, newsletter, socials)
- `/get-involved` — Adopt, Foster, Volunteer, TNR, Care & Nursing, Donate
- `/gallery` — 10 real photos of rescued cats, pulled from the org's existing site
- `/about` — founding story (2015 → 501(c)(3) in 2020), EIN, hours, founder photo, newsletter signup
- `/contact` — contact form
- `/admin` — password-gated subscriber list (contact form + newsletter signups), with CSV/XLSX export, copy-to-clipboard, and CSV/XLSX import. Password defaults to `pw` (`NEXT_PUBLIC_ADMIN_PASSWORD`), and must match `CRM_ADMIN_PASSWORD` on the backend.

## Notable differences from the other client templates

This is a donation-driven 501(c)(3) nonprofit, not a for-profit business,
which changes a few things from the Monark/Javier/JaJa's sites:

- `config.primaryCta` points at the organization's real, existing donate
  page (`prettykittymiamirescue.org/donate`) rather than a booking
  platform, WhatsApp link, or this site's own `/contact` page.
- `config.nonprofit` (legal name, EIN, founded year, 501(c)(3) year) feeds
  the About page and footer, and the LocalBusiness schema uses `NGO`
  instead of a business type, with a real mailing address (`config.location`
  is a real street address here, not a service-area description).
- "Services"/"Menu" was renamed to "Get Involved" (`app/get-involved/`,
  `data/get-involved.ts`) — Adopt, Foster, Volunteer, TNR, Care & Nursing,
  Donate — instead of a paid services/menu list.
- `NewsletterForm` now accepts `buttonLabel`/`successMessage` props (added
  here) since "Get Discounts" doesn't fit a nonprofit — used as "Sign Up" /
  a rescue-appropriate thank-you message on this site.
- All photos were pulled from the org's own Squarespace-hosted site
  (permanent CDN URLs) rather than Instagram, which is why none of the
  gallery images have Instagram's short-lived signed URLs to worry about.

## Before going live

- [ ] Confirm the real EIN, address, and hours in `config.ts` against the organization's current records
- [ ] Set `RESEND_API_KEY` on `enigma-node-server` so contact form emails actually send to `config.contactEmail`
- [ ] Point `NEXT_PUBLIC_ENIGMA_API_URL` at the production `enigma-node-server` URL
- [ ] Set a real `NEXT_PUBLIC_ADMIN_PASSWORD` / `CRM_ADMIN_PASSWORD` (both must match)
- [ ] Add a Google Business listing link to `config.googleBusinessUrl` once available
- [ ] Decide whether this redesign replaces `prettykittymiamirescue.org` or lives elsewhere, and update `config.domainName` + CORS accordingly
- [ ] Get current, real photos/names for adoptable cats if `/get-involved` should eventually list individual cats rather than program categories

## Reusing this as a template

To spin up a new client site from this template:

1. Fork/copy this project (or [Monark Barbershop](../monarkbarbershop) / [Javier Hardscaping Design](../javierhardscaping) / [JaJa's Plate](../jajasplate), whichever is closer to the new client).
2. Edit `config.ts` — name, description, domain, `clientSlug` (must be unique per client — this scopes their data in `ENIGMA_CRM`), phone, location, `primaryCta`, Instagram/Google Business links, contact email.
3. Edit the theme colors in `tailwind.config.js` (or rename the theme) to match the new client's branding.
4. Add the new production domain to the CORS `allowedOrigins` list in `enigma-node-server-main/api/index.js`.
5. Everything else — Header, Footer, ContactForm, NewsletterForm, PageBanner, admin screen — reads from `config.ts` and needs no changes.
