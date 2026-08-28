export interface GetInvolvedItem {
  name: string;
  price: string;
  description: string;
}

// Ways to support the rescue, based on the programs described on the
// organization's existing site (TNR, transport, care/nursing, adoption,
// volunteering, donating).
export const getInvolvedOptions: GetInvolvedItem[] = [
  {
    name: "Adopt",
    price: "Meet Our Cats",
    description: "Give one of our rescued cats or kittens a forever home.",
  },
  {
    name: "Foster",
    price: "Get Started",
    description: "Open your home temporarily to a cat or kitten in need.",
  },
  {
    name: "Volunteer",
    price: "Get Started",
    description: "Help with TNR, transport, socializing kittens, and more.",
  },
  {
    name: "TNR (Trap-Neuter-Return)",
    price: "Learn More",
    description: "We've TNR'd 3,000+ community cats in Miami-Dade.",
  },
  {
    name: "Care & Nursing",
    price: "Learn More",
    description: "Bottle-feeding orphaned kittens and treating sick cats.",
  },
  {
    name: "Donate",
    price: "Donate Now",
    description: "Every dollar goes toward food, litter, medicine, and vet care.",
  },
];
