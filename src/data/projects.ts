export type PortfolioProject = {
  id: string;
  title: string;
  category: string;
  description: string;
  tags: string[];
  image: string;
  imageAlt: string;
  liveUrl: string;
  caseUrl: string;
};

export const projects: PortfolioProject[] = [
  {
    id: "zipo",
    title: "Zipo",
    category: "E-commerce Storefront",
    description: "Sneaker store with a bold purple hero, product grid and slide-out cart.",
    tags: ["Shopify", "Custom Theme", "UI/UX"],
    image: "/images/portfolio/zipo-storefront.png",
    imageAlt: "Zipo storefront on a desktop monitor",
    liveUrl: "#",
    caseUrl: "#",
  },
  {
    id: "shifa",
    title: "Shifa",
    category: "SDG Challenge Platform",
    description: "A focused dashboard for managing SDG challenges, teams, mentors and programme stages.",
    tags: ["Product Design", "Dashboard", "UI/UX"],
    image: "/images/portfolio/shifa-sdg-dashboard.png",
    imageAlt: "Shifa SDG challenge dashboard displayed on a laptop against a purple background",
    liveUrl: "https://event-hackthon-alshifa.vercel.app/",
    caseUrl: "#",
  },
  {
    id: "ravco",
    title: "RAVCO",
    category: "Sleep & Wellness Storefront",
    description: "A refined e-commerce experience for premium mattresses, pillows and restorative sleep products.",
    tags: ["E-commerce", "Custom Theme", "UI/UX"],
    image: "/images/portfolio/ravco-storefront.png",
    imageAlt: "RAVCO sleep and wellness storefront displayed on a desktop monitor in a warm wood interior",
    liveUrl: "#",
    caseUrl: "#",
  },
  {
    id: "moto-commerce",
    title: "Moto Commerce",
    category: "Motorcycle E-commerce",
    description: "A high-impact mobile storefront for premium motorcycle exhausts and performance accessories.",
    tags: ["E-commerce", "Mobile Design", "UI/UX"],
    image: "/images/portfolio/moto-commerce.png",
    imageAlt: "Four motorcycle exhaust storefront screens displayed over a red landscape",
    liveUrl: "#",
    caseUrl: "#",
  },
];
