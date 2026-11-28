export type PortfolioProject = {
  id: string;
  title: string;
  category: string;
  description: string;
  tags: string[];
  image: string;
  imageAlt: string;
  secondaryImage?: string;
  secondaryImageAlt?: string;
  liveUrl?: string;
  caseUrl?: string;
};

const zipoProductScene = new URL("../../Scene 1.webp", import.meta.url).href;
const pottedHeadScene = new URL(
  "../../Potted Head App in Cinematic Phone Scene.webp",
  import.meta.url,
).href;

export const projects: PortfolioProject[] = [
  {
    id: "mpr-sportswear",
    title: "MPR Sportswear",
    category: "Mobile Sportswear Commerce",
    description: "A bold mobile storefront concept for football shirts and performance sportswear, designed around fast product discovery and strong visual merchandising.",
    tags: ["E-commerce", "Mobile Design", "UI/UX"],
    image: "/images/portfolio/mpr-sportswear.webp",
    imageAlt: "Three MPR sportswear mobile storefront screens displayed over a purple landscape",
  },
  {
    id: "zipo",
    title: "Zipo",
    category: "E-commerce Storefront",
    description: "Sneaker store with a bold purple hero, product grid and slide-out cart.",
    tags: ["Shopify", "Custom Theme", "UI/UX"],
    image: "/images/portfolio/zipo-mockup.webp",
    imageAlt: "Zipo sneaker storefront displayed on a desktop monitor",
    secondaryImage: zipoProductScene,
    secondaryImageAlt: "Zipo Nike Street Flex product page displayed across a folding laptop in a softly lit studio scene",
    liveUrl: "#",
    caseUrl: "#",
  },
  {
    id: "potted-head",
    title: "The Potted Head",
    category: "Mobile Commerce",
    description: "A cinematic mobile shopping experience that presents plants with bold product storytelling and a focused purchase journey.",
    tags: ["E-commerce", "Mobile Design", "UI/UX"],
    image: pottedHeadScene,
    imageAlt: "The Potted Head shopping app displayed on a floating phone among dark cinematic rock formations",
  },
  {
    id: "shifa",
    title: "Shifa",
    category: "SDG Challenge Platform",
    description: "A focused dashboard for managing SDG challenges, teams, mentors and programme stages.",
    tags: ["Product Design", "Dashboard", "UI/UX"],
    image: "/images/portfolio/shifa-sdg-dashboard.webp",
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
    image: "/images/portfolio/ravco-storefront.webp",
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
    image: "/images/portfolio/moto-commerce.webp",
    imageAlt: "Four motorcycle exhaust storefront screens displayed over a red landscape",
    liveUrl: "#",
    caseUrl: "#",
  },
];
