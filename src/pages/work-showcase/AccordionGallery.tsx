import {
  useEffect,
  useMemo,
  useState,
  type CSSProperties,
  type PointerEvent,
} from "react";
import type { WorkGalleryProject } from "./projects";
import "./AccordionGallery.css";

type AccordionGalleryProps = {
  items: WorkGalleryProject[];
  defaultIndex?: number;
  expandRatio?: number;
  trigger?: "hover";
  accentColor?: string;
  overlayColor?: string;
  textColor?: string;
  grayscale?: boolean;
  showLabels?: boolean;
  duration?: number;
  ease?: string;
  parallax?: number;
  tilt?: number;
  stagger?: number;
  height?: number;
  gap?: number;
  radius?: number;
  orientation?: "horizontal" | "vertical";
};

type GalleryStyle = CSSProperties & Record<`--${string}`, string | number>;

const easingMap: Record<string, string> = {
  "power3.out": "cubic-bezier(0.22, 1, 0.36, 1)",
};

function clampIndex(index: number, length: number) {
  return Math.min(Math.max(index, 0), Math.max(length - 1, 0));
}

export default function AccordionGallery({
  items,
  defaultIndex = 0,
  expandRatio = 0.56,
  trigger = "hover",
  accentColor = "#ffffff",
  overlayColor = "#000000",
  textColor = "#ffffff",
  grayscale = false,
  showLabels = true,
  duration = 0.7,
  ease = "power3.out",
  parallax = 0.4,
  tilt = 6,
  stagger = 0.06,
  height = 560,
  gap = 12,
  radius = 18,
  orientation = "horizontal",
}: AccordionGalleryProps) {
  const [activeIndex, setActiveIndex] = useState(() => clampIndex(defaultIndex, items.length));
  const [missingImages, setMissingImages] = useState<Set<number>>(() => new Set());
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const updatePreference = () => setReducedMotion(media.matches);

    updatePreference();
    media.addEventListener("change", updatePreference);
    return () => media.removeEventListener("change", updatePreference);
  }, []);

  useEffect(() => {
    setActiveIndex(clampIndex(defaultIndex, items.length));
    setMissingImages(new Set());
  }, [defaultIndex, items]);

  const inactiveRatio = useMemo(
    () => (items.length > 1 ? (1 - expandRatio) / (items.length - 1) : 1),
    [expandRatio, items.length],
  );

  const galleryStyle: GalleryStyle = {
    "--ag-accent": accentColor,
    "--ag-overlay": overlayColor,
    "--ag-text": textColor,
    "--ag-duration": reducedMotion ? "0s" : `${duration}s`,
    "--ag-ease": easingMap[ease] ?? ease,
    "--ag-gap": `${gap}px`,
    "--ag-radius": `${radius}px`,
    "--ag-height": `${height}px`,
  };

  const handlePointerMove = (event: PointerEvent<HTMLDivElement>, isActive: boolean) => {
    if (reducedMotion || !isActive) return;

    const bounds = event.currentTarget.getBoundingClientRect();
    const horizontalProgress = (event.clientX - bounds.left) / bounds.width - 0.5;
    const verticalProgress = (event.clientY - bounds.top) / bounds.height - 0.5;
    const target = event.currentTarget;

    target.style.setProperty("--ag-image-x", `${horizontalProgress * parallax * -24}px`);
    target.style.setProperty("--ag-image-y", `${verticalProgress * parallax * -24}px`);
    target.style.setProperty("--ag-tilt-x", `${verticalProgress * tilt * -1}deg`);
    target.style.setProperty("--ag-tilt-y", `${horizontalProgress * tilt}deg`);
  };

  const resetPanelTransform = (panel: HTMLDivElement) => {
    panel.style.setProperty("--ag-image-x", "0px");
    panel.style.setProperty("--ag-image-y", "0px");
    panel.style.setProperty("--ag-tilt-x", "0deg");
    panel.style.setProperty("--ag-tilt-y", "0deg");
  };

  return (
    <div
      className={`ag-gallery ag-gallery--${orientation} ${grayscale ? "ag-gallery--grayscale" : ""}`.trim()}
      style={galleryStyle}
      role="group"
      aria-label="Selected work gallery"
      data-trigger={trigger}
    >
      {items.map((item, index) => {
        const isActive = index === activeIndex;
        const panelStyle: GalleryStyle = {
          "--ag-grow": isActive ? expandRatio : inactiveRatio,
          "--ag-stagger": reducedMotion ? "0s" : `${index * stagger}s`,
        };

        return (
          <div
            className={`ag-panel ${isActive ? "ag-panel--active" : ""}`.trim()}
            key={`${item.image}-${item.label}`}
            style={panelStyle}
            tabIndex={0}
            aria-label={item.label}
            onFocus={() => setActiveIndex(index)}
            onPointerEnter={() => setActiveIndex(index)}
            onPointerMove={(event) => handlePointerMove(event, isActive)}
            onPointerLeave={(event) => resetPanelTransform(event.currentTarget)}
          >
            <div className="ag-panel__media">
              {missingImages.has(index) ? (
                <div className="ag-panel__placeholder" aria-hidden="true">
                  <span>C&amp;Co.</span>
                </div>
              ) : (
                <img
                  src={item.image}
                  alt=""
                  width="1600"
                  height="1000"
                  loading="lazy"
                  decoding="async"
                  onError={() => {
                    setMissingImages((current) => new Set(current).add(index));
                  }}
                />
              )}
            </div>
            <div className="ag-panel__overlay" aria-hidden="true" />
            {showLabels && (
              <div className="ag-panel__label">
                <span>{item.label}</span>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
