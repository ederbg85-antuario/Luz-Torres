"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { Pause, Play } from "lucide-react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(useGSAP);
const MotionContext = createContext({ paused: false, toggle: () => {} });

export function HomeMotion({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const [paused, setPaused] = useState(false);
  const state = useRef({ paused: false, visible: new Set<Element>() });
  const timelines = useRef(new Map<HTMLElement, gsap.core.Timeline[]>());
  const syncScenes = useCallback(() => {
    for (const scene of ref.current?.querySelectorAll<HTMLElement>(
      "[data-motion-scene]",
    ) ?? []) {
      const visible = state.current.visible.has(scene) && !document.hidden;
      scene.dataset.motionActive = String(visible);
      for (const timeline of timelines.current.get(scene) ?? []) {
        // A visitor pausing before reaching the illustration gets a complete still.
        if (state.current.paused && timeline.totalTime() === 0)
          timeline.time(4);
        timeline.paused(!visible || state.current.paused);
      }
    }
  }, []);

  useGSAP(
    () => {
      const media = gsap.matchMedia();
      media.add(
        "(prefers-reduced-motion: no-preference)",
        () => {
          ref.current
            ?.querySelectorAll<SVGElement>("[data-gsap-plan]")
            .forEach((art) => {
              const scene = art.closest<HTMLElement>("[data-motion-scene]");
              if (!scene) return;
              const lines = art.querySelectorAll(".plan-stroke");
              const timeline = gsap.timeline({
                paused: true,
                repeat: -1,
                repeatDelay: 1,
                defaults: { ease: "power2.inOut" },
              });
              timeline
                .fromTo(
                  lines,
                  {
                    strokeDasharray: 100,
                    strokeDashoffset: 100,
                    opacity: 0.25,
                  },
                  {
                    strokeDashoffset: 0,
                    opacity: 1,
                    duration: 1.8,
                    stagger: 0.1,
                  },
                  0,
                )
                .fromTo(
                  art.querySelectorAll(".plan-face"),
                  { opacity: 0 },
                  { opacity: 1, duration: 1, stagger: 0.2 },
                  0.6,
                )
                .fromTo(
                  art.querySelectorAll(".plan-window"),
                  { opacity: 0 },
                  { opacity: 1, duration: 0.8 },
                  1.7,
                )
                .to(
                  art.querySelectorAll(".plan-building"),
                  { y: -8, duration: 1.8, repeat: 1, yoyo: true },
                  2,
                )
                .to(
                  art.querySelectorAll(".plan-key"),
                  {
                    rotation: 12,
                    scale: 1.12,
                    transformOrigin: "center",
                    duration: 1.2,
                    repeat: 1,
                    yoyo: true,
                  },
                  3,
                )
                .to(
                  lines,
                  {
                    strokeDashoffset: -100,
                    opacity: 0.25,
                    duration: 1.6,
                    stagger: 0.07,
                  },
                  6.5,
                );
              timelines.current.set(scene, [
                ...(timelines.current.get(scene) ?? []),
                timeline,
              ]);
            });
          syncScenes();
          return () => timelines.current.clear();
        },
        ref,
      );
      return () => media.revert();
    },
    { scope: ref },
  );

  useEffect(() => {
    const scenes = Array.from(
      ref.current?.querySelectorAll<HTMLElement>("[data-motion-scene]") ?? [],
    );
    if (!window.IntersectionObserver) return;
    const observer = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) state.current.visible.add(entry.target);
        else state.current.visible.delete(entry.target);
      }
      syncScenes();
    });
    scenes.forEach((scene) => observer.observe(scene));
    document.addEventListener("visibilitychange", syncScenes);
    return () => {
      observer.disconnect();
      state.current.visible.clear();
      document.removeEventListener("visibilitychange", syncScenes);
    };
  }, [syncScenes]);

  useEffect(() => {
    state.current.paused = paused;
    syncScenes();
  }, [paused, syncScenes]);

  return (
    <MotionContext.Provider
      value={{ paused, toggle: () => setPaused((value) => !value) }}
    >
      <div
        ref={ref}
        className="home-motion home-redesign"
        data-motion-paused={paused}
      >
        {children}
      </div>
    </MotionContext.Provider>
  );
}

export function MotionToggle() {
  const { paused, toggle } = useContext(MotionContext);
  const Icon = paused ? Play : Pause;
  return (
    <button
      type="button"
      onClick={toggle}
      aria-pressed={paused}
      aria-label="Pausar movimiento"
      className="motion-toggle"
    >
      <Icon size={12} aria-hidden="true" />
      {paused ? "Reanudar movimiento" : "Pausar movimiento"}
    </button>
  );
}
