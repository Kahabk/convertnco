import { Fragment } from "react";
import { motion, useReducedMotion } from "motion/react";
import "./Headline.css";

export type HeadlinePart = {
  text: string;
  tone: "strong" | "dim" | "accent";
  underline?: boolean;
};

type HeadlineProps = {
  parts: HeadlinePart[];
  id?: string;
  className?: string;
};

const containerVariants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.06 },
  },
};

const partVariants = {
  hidden: { opacity: 0, y: 18 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] as const },
  },
};

export default function Headline({ parts, id, className = "" }: HeadlineProps) {
  const prefersReducedMotion = useReducedMotion();

  return (
    <motion.h2
      id={id}
      className={`mixedHeadline ${className}`.trim()}
      variants={prefersReducedMotion ? undefined : containerVariants}
      initial={prefersReducedMotion ? false : "hidden"}
      whileInView={prefersReducedMotion ? undefined : "visible"}
      viewport={{ once: true, amount: 0.2 }}
    >
      {parts.map((part, index) => (
        <Fragment key={`${part.text.trim()}-${index}`}>
          <motion.span
            className={`hl-part hl-${part.tone}${part.underline ? " hl-underline" : ""}`}
            variants={prefersReducedMotion ? undefined : partVariants}
          >
            {part.text.trim()}
          </motion.span>
          {index < parts.length - 1 ? " " : null}
        </Fragment>
      ))}
    </motion.h2>
  );
}
