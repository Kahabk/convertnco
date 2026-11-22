import { motion, useReducedMotion } from "motion/react";
import { projects } from "@/src/data/projects";
import styles from "./WorkShowcase.module.css";

export default function SelectedWorkSection() {
  const prefersReducedMotion = useReducedMotion();

  return (
    <section className={styles.selectedProjects} aria-labelledby="selected-projects-title">
      <div className={styles.selectedProjectsInner}>
        <header className={styles.selectedProjectsHeader}>
          <p className={styles.selectedProjectsLabel}>Selected Work</p>
          <h2 id="selected-projects-title">Built to be seen. Designed to convert.</h2>
          <p>A closer look at storefronts shaped around stronger stories and clearer customer journeys.</p>
        </header>

        <div className={styles.selectedProjectsList}>
          {projects.map((project, index) => (
            <motion.article
              className={`${styles.selectedProjectRow} ${["zipo", "shifa", "ravco", "moto-commerce"].includes(project.id) ? styles.selectedProjectFeatured : ""} ${project.id === "ravco" ? styles.selectedProjectRavco : ""} ${project.id === "moto-commerce" ? styles.selectedProjectMoto : ""}`}
              id={project.id}
              key={project.id}
              initial={prefersReducedMotion ? false : { opacity: 0, y: 44 }}
              whileInView={prefersReducedMotion ? undefined : { opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.16 }}
              transition={{ duration: 0.7, delay: index * 0.04, ease: [0.22, 1, 0.36, 1] }}
            >
              <div className={styles.selectedProjectImage}>
                <img
                  src={project.image}
                  alt={project.imageAlt}
                  width="1600"
                  height="1000"
                  loading="lazy"
                  decoding="async"
                />
              </div>

              <div className={styles.selectedProjectCopy}>
                <div className={styles.selectedProjectMeta}>
                  <span aria-label={`Project ${index + 1}`}>{String(index + 1).padStart(2, "0")}</span>
                  <p>{project.category}</p>
                </div>
                <h3>{project.title}</h3>
                <p className={styles.selectedProjectDescription}>{project.description}</p>
                <ul className={styles.selectedProjectTags} aria-label={`${project.title} technologies and services`}>
                  {project.tags.map((tag) => <li key={tag}>{tag}</li>)}
                </ul>
                <div className={styles.selectedProjectActions}>
                  <a className={styles.selectedProjectPrimary} href={project.liveUrl}>View Live</a>
                  <a className={styles.selectedProjectSecondary} href={project.caseUrl}>Case Study</a>
                </div>
              </div>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}
