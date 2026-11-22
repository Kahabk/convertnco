import type { HTMLAttributes, ReactNode } from "react";
import styles from "./WorkShowcase.module.css";

type GlassFrameProps = HTMLAttributes<HTMLDivElement> & {
  children: ReactNode;
  contentClassName?: string;
};

export function LiquidGlassFilter() {
  return (
    <svg className={styles.liquidFilterDefs} aria-hidden="true">
      <defs>
        <filter id="liquid" x="-20%" y="-20%" width="140%" height="140%">
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.012 0.018"
            numOctaves="2"
            seed="8"
            result="noise"
          />
          <feDisplacementMap
            in="SourceGraphic"
            in2="noise"
            scale="12"
            xChannelSelector="R"
            yChannelSelector="B"
          />
        </filter>
      </defs>
    </svg>
  );
}

export default function GlassFrame({
  children,
  className = "",
  contentClassName = "",
  ...props
}: GlassFrameProps) {
  return (
    <div className={`${styles.glassFrame} ${className}`.trim()} {...props}>
      <div className={`${styles.glassFrameContent} ${contentClassName}`.trim()}>
        {children}
      </div>
    </div>
  );
}
