import {
  motion,
  useReducedMotion,
  useScroll,
  useTransform,
  type MotionValue,
} from "motion/react";
import { useEffect, useRef, useState, type CSSProperties } from "react";
import GlassFrame from "./GlassFrame";
import { projects, type Project } from "./projects";
import styles from "./WorkShowcase.module.css";

const designPrinciples = ["Spacing", "Rhythm", "Contrast", "Hierarchy", "Restraint"];

function ProjectImage({ project }: { project: Project }) {
  const [isMissing, setIsMissing] = useState(false);

  useEffect(() => setIsMissing(false), [project.image]);

  if (isMissing) {
    return (
      <div className={styles.placeholder} aria-label={`${project.title} image coming soon`}>
        <span>C&amp;Co.</span>
        <p>Project image coming soon</p>
      </div>
    );
  }

  return (
    <img
      className={`${styles.projectImage} ${project.imagePosition === "top" ? styles.projectImageTop : ""} ${project.preserveColor ? styles.projectImageOriginalColor : ""}`.trim()}
      src={project.image}
      alt={`${project.title} project preview`}
      width="1600"
      height="1000"
      loading="lazy"
      decoding="async"
      onError={() => setIsMissing(true)}
    />
  );
}

type StackCardProps = {
  key?: string;
  project: Project;
  index: number;
  total: number;
  progress: MotionValue<number>;
};

function StackCard({ project, index, total, progress }: StackCardProps) {
  const prefersReducedMotion = useReducedMotion();
  const isFinalCard = index === total - 1;
  const transitionStart = (index + 0.85) / total;
  const transitionEnd = Math.min((index + 1.4) / total, 1);
  const scale = useTransform(
    progress,
    [transitionStart, transitionEnd],
    [1, prefersReducedMotion || isFinalCard ? 1 : 0.92],
  );
  const filter = useTransform(
    progress,
    [transitionStart, transitionEnd],
    [
      "brightness(1) blur(0px)",
      prefersReducedMotion || isFinalCard
        ? "brightness(1) blur(0px)"
        : "brightness(0.5) blur(4px)",
    ],
  );

  return (
    <article
      className={`${styles.stackItem} ${isFinalCard ? styles.finalStackItem : ""}`.trim()}
      style={{ "--stack-index": index } as CSSProperties}
      aria-labelledby={`project-title-${index}`}
    >
      <motion.div className={styles.stackCardMotion} style={{ scale, filter }}>
        <GlassFrame className={styles.stackCardFrame} contentClassName={styles.stackCard}>
          <ProjectImage project={project} />
          <div className={styles.cardShade} aria-hidden="true" />
          <div className={styles.projectMeta}>
            <p>{project.category}</p>
            <h2 id={`project-title-${index}`}>{project.title}</h2>
            {isFinalCard && (
              <>
                <span className={styles.designCaption}>
                  Every choice earns its place. Nothing competes with the product.
                </span>
                <ul className={styles.designChips} aria-label="Design principles">
                  {designPrinciples.map((principle) => <li key={principle}>{principle}</li>)}
                </ul>
              </>
            )}
          </div>
        </GlassFrame>
      </motion.div>
    </article>
  );
}

export default function ScrollStack() {
  const sectionRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end end"],
  });

  return (
    <section ref={sectionRef} className={styles.scrollStack} aria-label="Selected portfolio work">
      <header className={styles.stackIntro}>
        <p className={styles.eyebrow}>Selected work</p>
        <h2>Designed for attention.<br />Built for action.</h2>
      </header>

      {projects.map((project, index) => (
        <StackCard
          key={project.title}
          project={project}
          index={index}
          total={projects.length}
          progress={scrollYProgress}
        />
      ))}
    </section>
  );
}
