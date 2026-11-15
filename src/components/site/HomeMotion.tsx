"use client";

import { createContext, useContext, useEffect, useRef, useState } from "react";
import { Pause, Play } from "lucide-react";

const MotionContext = createContext({ paused: false, toggle: () => {} });

/** CSS owns the motion; one observer suspends scenes outside the viewport. */
export function HomeMotion({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    const scenes = Array.from(ref.current?.querySelectorAll<HTMLElement>("[data-motion-scene]") ?? []);
    if (!window.IntersectionObserver) return;
    const visible = new Set<Element>();
    const update = () => {
      for (const scene of scenes) {
        scene.dataset.motionActive = String(visible.has(scene) && !document.hidden);
      }
    };
    const observer = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) visible.add(entry.target);
        else visible.delete(entry.target);
      }
      update();
    }, { threshold: 0 });
    scenes.forEach((scene) => observer.observe(scene));
    document.addEventListener("visibilitychange", update);
    return () => {
      observer.disconnect();
      document.removeEventListener("visibilitychange", update);
    };
  }, []);

  return (
    <MotionContext.Provider value={{ paused, toggle: () => setPaused((value) => !value) }}>
      <div ref={ref} className="home-motion" data-motion-paused={paused}>
        {children}
      </div>
    </MotionContext.Provider>
  );
}

export function MotionToggle() {
  const { paused, toggle } = useContext(MotionContext);
  const Icon = paused ? Play : Pause;
  return (
    <button type="button" onClick={toggle} aria-pressed={paused}
      aria-label="Pausar movimiento" className="motion-toggle mt-5 inline-flex min-h-11 items-center gap-2 rounded-full px-3 text-xs text-humo">
      <Icon size={13} aria-hidden="true" />
      {paused ? "Reanudar movimiento" : "Pausar movimiento"}
    </button>
  );
}
