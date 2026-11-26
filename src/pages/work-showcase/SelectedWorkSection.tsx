import { projects } from "@/src/data/projects";
import styles from "./WorkShowcase.module.css";

const imagePresentation: Record<
  string,
  { width: number; height: number; mobileImage: string }
> = {
  "website-cro-audit-primary": {
    width: 3840,
    height: 2160,
    mobileImage: "/images/portfolio/website-cro-audit-mobile.webp",
  },
  "mpr-sportswear-primary": {
    width: 1672,
    height: 941,
    mobileImage: "/images/portfolio/mpr-sportswear-mobile.webp",
  },
  "zipo-primary": {
    width: 1436,
    height: 1095,
    mobileImage: "/images/portfolio/zipo-mockup-mobile.webp",
  },
  "zipo-secondary": {
    width: 1920,
    height: 1440,
    mobileImage: "/images/portfolio/zipo-product-scene-mobile.webp",
  },
  "potted-head-primary": {
    width: 1658,
    height: 949,
    mobileImage: "/images/portfolio/potted-head-mobile.webp",
  },
  "shifa-primary": {
    width: 1435,
    height: 1096,
    mobileImage: "/images/portfolio/shifa-sdg-dashboard-mobile.webp",
  },
  "ravco-primary": {
    width: 1097,
    height: 823,
    mobileImage: "/images/portfolio/ravco-storefront-mobile.webp",
  },
  "moto-commerce-primary": {
    width: 1672,
    height: 941,
    mobileImage: "/images/portfolio/moto-commerce-mobile.webp",
  },
};

const projectImages = projects.flatMap((project) => {
  const primaryKey = `${project.id}-primary`;
  const primaryImage = {
    key: primaryKey,
    title: project.title,
    image: project.image,
    imageAlt: project.imageAlt,
    href: project.liveUrl ?? project.caseUrl,
    ...(imagePresentation[primaryKey] ?? {
      width: 1920,
      height: 1080,
      mobileImage: project.image,
    }),
  };

  if (!project.secondaryImage) return [primaryImage];

  const secondaryKey = `${project.id}-secondary`;
  return [
    primaryImage,
    {
      key: secondaryKey,
      title: project.title,
      image: project.secondaryImage,
      imageAlt: project.secondaryImageAlt ?? `${project.title} project preview`,
      href: project.liveUrl ?? project.caseUrl,
      ...(imagePresentation[secondaryKey] ?? {
        width: 1920,
        height: 1080,
        mobileImage: project.secondaryImage,
      }),
    },
  ];
});

export default function SelectedWorkSection() {
  return (
    <section className={styles.selectedProjectsFullscreen} aria-label="Selected work">
      <div className={styles.selectedWorkFullscreenList}>
        {projectImages.map((project) => {
          const image = (
            <picture className={styles.selectedWorkFullscreenPicture}>
              <source media="(max-width: 700px)" srcSet={project.mobileImage} />
              <img
                className={styles.selectedWorkFullscreenImage}
                src={project.image}
                alt={project.imageAlt}
                width={project.width}
                height={project.height}
                loading="lazy"
                decoding="async"
              />
            </picture>
          );

          if (!project.href) {
            return (
              <article className={styles.selectedWorkFullscreenItem} key={project.key}>
                {image}
              </article>
            );
          }

          return (
            <a
              className={styles.selectedWorkFullscreenItem}
              href={project.href}
              key={project.key}
              aria-label={`View ${project.title}`}
            >
              {image}
            </a>
          );
        })}
      </div>
    </section>
  );
}
