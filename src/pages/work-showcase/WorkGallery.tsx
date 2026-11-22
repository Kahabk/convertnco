import AccordionGallery from "./AccordionGallery";
import GlassFrame from "./GlassFrame";
import { workGalleryProjects } from "./projects";
import styles from "./WorkShowcase.module.css";

export default function WorkGallery() {
  return (
    <section className={styles.workGallerySection} aria-labelledby="selected-work-title">
      <div className={styles.workGalleryInner}>
        <header className={styles.workGalleryHeader}>
          <h2 id="selected-work-title">Selected Work</h2>
          <p>Hover to focus. Every store built to convert.</p>
        </header>

        <GlassFrame
          className={styles.workGalleryFrame}
          contentClassName={styles.workGalleryFrameContent}
        >
          <AccordionGallery
            items={workGalleryProjects}
            defaultIndex={0}
            expandRatio={0.56}
            trigger="hover"
            accentColor="#ffffff"
            overlayColor="#000000"
            textColor="#ffffff"
            grayscale
            showLabels
            duration={0.7}
            ease="power3.out"
            parallax={0.4}
            tilt={6}
            stagger={0.06}
            height={560}
            gap={12}
            radius={18}
            orientation="horizontal"
          />
        </GlassFrame>
      </div>
    </section>
  );
}
