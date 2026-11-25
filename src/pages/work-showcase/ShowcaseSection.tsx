import { useState } from "react";
import FlexCarousel, { type FlexCarouselItem } from "@/components/FlexCarousel";
import Headline from "@/src/components/Headline";
import styles from "./WorkShowcase.module.css";

const zipoProductScene = new URL("../../../Scene 1.webp", import.meta.url).href;
const pottedHeadScene = new URL(
  "../../../Potted Head App in Cinematic Phone Scene.webp",
  import.meta.url,
).href;

const items: FlexCarouselItem[] = [
  {
    src: "/images/portfolio/website-cro-audit.webp",
    alt: "Website CRO Audit displayed on a MacBook resting on a dark stone landscape.",
    title: "Website CRO Audit",
    subtitle: "Conversion Research Tool",
  },
  {
    src: "/images/portfolio/moto-commerce.webp",
    alt: "Four mobile storefront screens for a motorcycle exhaust shop displayed over a red dusk landscape.",
    title: "Moto Commerce",
  },
  {
    src: "/images/convert_co/image.webp",
    alt: "Puma Classic Court product page with blue sneakers and an open shopping cart.",
    title: "Sneaker Storefront",
  },
  {
    src: "/images/convert_co/mockup.webp",
    alt: "Pink-background phone mockups presenting the WEDKO gift and stationery shopping app.",
    title: "WEDKO Mobile",
  },
  {
    src: "/images/convert_co/wedko.webp",
    alt: "WEDKO gift and stationery app design board with mobile screens, mockups, and a color palette.",
    title: "WEDKO Design System",
  },
  {
    src: "/images/convert_co/group-2.webp",
    alt: "Blue and violet mossy landscape with the Convert and Co circular gradient mark above the hills.",
    title: "Convert & Co",
  },
  {
    src: "/images/portfolio/zipo-mockup.webp",
    alt: "Desktop monitor displaying the Zipo sneaker storefront with a purple shoe hero, product grid, and open shopping cart drawer.",
    title: "Zipo",
    subtitle: "E-commerce Storefront",
  },
  {
    src: zipoProductScene,
    alt: "Zipo Nike Street Flex product page displayed across a folding laptop in a softly lit studio scene.",
    title: "Zipo Product Experience",
    subtitle: "E-commerce Product Design",
  },
  {
    src: pottedHeadScene,
    alt: "The Potted Head shopping app displayed on a floating phone among dark cinematic rock formations.",
    title: "The Potted Head",
    subtitle: "Mobile Commerce",
  },
  {
    src: "/images/portfolio/shifa-sdg-dashboard.webp",
    alt: "Shifa SDG challenge dashboard displayed on a laptop against a purple background.",
    title: "Shifa",
    subtitle: "SDG Challenge Platform",
  },
  {
    src: "/images/portfolio/ravco-storefront.webp",
    alt: "RAVCO sleep and wellness storefront displayed on a desktop monitor in a warm wood interior.",
    title: "RAVCO",
    subtitle: "Sleep & Wellness Storefront",
  },
];

function detectWebGL2() {
  if (typeof document === "undefined") return false;

  try {
    const canvas = document.createElement("canvas");
    const context = canvas.getContext("webgl2");
    context?.getExtension("WEBGL_lose_context")?.loseContext();
    return Boolean(context);
  } catch {
    return false;
  }
}

function StaticShowcaseGrid() {
  return (
    <div className={styles.showcaseFallback} aria-label="Selected work">
      {items.map((item) => (
        <figure className={styles.showcaseFallbackItem} key={item.src}>
          <img src={item.src} alt={item.alt} loading="lazy" decoding="async" />
          <figcaption>{item.title}</figcaption>
        </figure>
      ))}
    </div>
  );
}

export default function ShowcaseSection() {
  const [supportsWebGL2] = useState(detectWebGL2);

  return (
    <section className={styles.workGallerySection} aria-labelledby="selected-work-title">
      <div className={styles.workGalleryInner}>
        <div
          className={styles.showcaseCarouselStage}
          style={{
            width: "100%",
            height: "var(--showcase-carousel-height)",
            position: "relative",
          }}
        >
          {supportsWebGL2 ? (
            <FlexCarousel
              items={items}
              preset="liquid"
              intro="rise"
              cardHeight={0.5}
              gap={12}
              squeeze={0.2}
              focusOnClick
              captions
              fit="natural"
              radius={0}
              lensWidth={0.74}
              lensHeight={1.18}
              tilt={62}
              roundness={1}
              bend={0.34}
              reach={0.38}
              curl="twist"
              dispersion={0.45}
              liquid={0}
              followCursor={false}
              autoplay={false}
              interval={4}
              captureWheel={false}
            />
          ) : (
            <StaticShowcaseGrid />
          )}
        </div>

        <header className={styles.workGalleryHeader}>
          <Headline
            id="selected-work-title"
            parts={[
              { text: "We help", tone: "strong" },
              { text: "bold brands", tone: "accent" },
              { text: "go beyond", tone: "dim" },
              { text: "borders.", tone: "strong", underline: true },
            ]}
          />
          <p>Drag to explore. Click any project to bring it into focus.</p>
        </header>
      </div>
    </section>
  );
}
