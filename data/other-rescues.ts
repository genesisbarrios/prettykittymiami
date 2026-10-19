export interface OtherRescue {
  name: string;
  url: string;
  description: string;
  cta: string;
}

// Other rescues/resources to send people to while we're at capacity (see
// config.atCapacity). Shown in the "We're full" section on the About page,
// which the homepage banner links to (/about#other-rescues).
export const otherRescues: OtherRescue[] = [
  {
    name: "Saving Sage Animal Rescue Foundation",
    url: "https://savingsagerescue.org",
    description:
      "A no-kill, volunteer-based rescue serving Broward and Miami-Dade, with a Miami Beach shelter.",
    cta: "Visit Saving Sage",
  },
  {
    // No official website found — this is their WeRescue profile. Swap in
    // their own site or Facebook page if they have one.
    name: "Bella's Promise Pet Rescue",
    url: "https://www.werescue.pet/shelter/25732/bellas-promise-pet-rescue-inc/",
    description: "A foster-based cat and kitten rescue in Boca Raton.",
    cta: "Visit Bella's Promise",
  },
  {
    // Facebook group search, not the group itself — replace with the
    // group's direct link (facebook.com/groups/...) once confirmed.
    name: "Miami-Dade Community Cats (Facebook)",
    url: "https://www.facebook.com/search/groups/?q=Miami%20Dade%20Community%20Cats",
    description:
      "Post the cat's photo, location, and situation in the group and ask for a foster or rescue — it's the fastest way to reach local helpers.",
    cta: "Post in the group",
  },
];
