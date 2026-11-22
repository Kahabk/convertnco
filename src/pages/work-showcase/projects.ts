export type Project = {
  title: string;
  category: string;
  image: string;
  imagePosition?: "center" | "top";
  preserveColor?: boolean;
};

const dressStoreImage = new URL(
  "../../../screencapture-dress-fnuc0ktb-myshopify-2026-11-19-22_36_48.png",
  import.meta.url,
).href;
const secondWorkImage = new URL("../../../Group 1.png", import.meta.url).href;

export type WorkGalleryProject = {
  image: string;
  label: string;
};

export const workGalleryProjects: WorkGalleryProject[] = [
  { image: "/work/work-1.png", label: "Commerce, Refined" },
  { image: "/work/work-2.png", label: "Objects of Desire" },
  { image: "/work/work-3.png", label: "Built for Momentum" },
  { image: "/work/work-4.png", label: "Designed to Perform" },
  { image: "/design-sense.png", label: "Our Design Sense" },
];

export const projects: Project[] = [
  {
    title: "Commerce, Refined",
    category: "Shopify design · Development",
    image: dressStoreImage,
    imagePosition: "top",
    preserveColor: true,
  },
  {
    title: "Objects of Desire",
    category: "Art direction · Ecommerce",
    image: secondWorkImage,
    preserveColor: true,
  },
  {
    title: "Built for Momentum",
    category: "Strategy · Conversion design",
    image: "/work/work-4.png",
  },
  {
    title: "Our Design Sense",
    category: "The principles behind the work",
    image: "/design-sense.png",
  },
];
