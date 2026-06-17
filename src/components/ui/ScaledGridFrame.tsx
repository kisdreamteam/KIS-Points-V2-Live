"use client";

import { useEffect, useLayoutEffect, useRef, useState, type ReactNode } from "react";

const SCALE = 0.67;
const MD_MIN_WIDTH_PX = 768;

export type ScaledGridFrameProps = {
  children: ReactNode;
  /** When this changes, layout is remeasured (e.g. student count or multi-select mode). */
  remeasureKey?: string | number;
  className?: string;
  /** Below Tailwind `md` (768px) uses `base`; at md+ uses `md`. Omit for fixed SCALE. */
  responsiveScale?: { base: number; md: number };
};

function useResolvedScale(responsiveScale?: ScaledGridFrameProps["responsiveScale"]) {
  const base = responsiveScale?.base;
  const md = responsiveScale?.md;
  const [scale, setScale] = useState(() => base ?? SCALE);

  useEffect(() => {
    if (base === undefined || md === undefined) {
      return;
    }

    const mq = window.matchMedia(`(min-width: ${MD_MIN_WIDTH_PX}px)`);
    const update = () => setScale(mq.matches ? md : base);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, [base, md]);

  return base !== undefined && md !== undefined ? scale : SCALE;
}

export default function ScaledGridFrame({
  children,
  remeasureKey,
  className = "",
  responsiveScale,
}: ScaledGridFrameProps) {
  const scaledContainerRef = useRef<HTMLDivElement | null>(null);
  const [scaledHeight, setScaledHeight] = useState<number | null>(null);
  const scale = useResolvedScale(responsiveScale);

  useLayoutEffect(() => {
    const updateScaledHeight = () => {
      if (!scaledContainerRef.current) return;
      const unscaledHeight = scaledContainerRef.current.offsetHeight;
      setScaledHeight(unscaledHeight * scale);
    };

    updateScaledHeight();
    window.addEventListener("resize", updateScaledHeight);

    const observer =
      typeof ResizeObserver !== "undefined" ? new ResizeObserver(updateScaledHeight) : null;
    if (observer && scaledContainerRef.current) {
      observer.observe(scaledContainerRef.current);
    }

    return () => {
      window.removeEventListener("resize", updateScaledHeight);
      observer?.disconnect();
    };
  }, [remeasureKey, scale]);

  return (
    <div
      className={className}
      style={{
        height: scaledHeight ? `${scaledHeight}px` : undefined,
      }}
    >
      <div
        ref={scaledContainerRef}
        style={{
          transform: `scale(${scale})`,
          transformOrigin: "top left",
          width: `${100 / scale}%`,
        }}
      >
        {children}
      </div>
    </div>
  );
}
