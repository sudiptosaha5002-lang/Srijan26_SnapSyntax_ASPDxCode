import { useEffect, useMemo, useState } from "react";

function detectTier() {
  if (typeof window === "undefined") {
    return "balanced";
  }

  const memory = navigator.deviceMemory ?? 4;
  const cores = navigator.hardwareConcurrency ?? 4;
  const reducedMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches ?? false;
  const narrow = window.innerWidth < 820;
  const touch = navigator.maxTouchPoints > 0;

  if (reducedMotion || memory <= 4 || cores <= 4 || (narrow && touch)) {
    return "lite";
  }

  if (memory >= 8 && cores >= 8 && window.innerWidth >= 1280 && !touch) {
    return "high";
  }

  return "balanced";
}

const profiles = {
  lite: {
    tier: "lite",
    label: "Lite",
    dpr: [1, 1.1],
    shadows: false,
    antialias: false,
    sparkles: 14,
    buildingCount: 12,
    treeCount: 8,
    rainCount: 36,
    stars: 0,
    contactShadows: false,
    autoRotate: false,
  },
  balanced: {
    tier: "balanced",
    label: "Balanced",
    dpr: [1, 1.35],
    shadows: true,
    antialias: true,
    sparkles: 30,
    buildingCount: 20,
    treeCount: 14,
    rainCount: 80,
    stars: 800,
    contactShadows: true,
    autoRotate: true,
  },
  high: {
    tier: "high",
    label: "High",
    dpr: [1, 1.8],
    shadows: true,
    antialias: true,
    sparkles: 52,
    buildingCount: 28,
    treeCount: 22,
    rainCount: 140,
    stars: 1800,
    contactShadows: true,
    autoRotate: true,
  },
};

export default function useAdaptiveQuality() {
  const [tier, setTier] = useState(() => detectTier());

  useEffect(() => {
    const onResize = () => setTier(detectTier());
    const media = window.matchMedia?.("(prefers-reduced-motion: reduce)");
    window.addEventListener("resize", onResize);
    media?.addEventListener?.("change", onResize);
    return () => {
      window.removeEventListener("resize", onResize);
      media?.removeEventListener?.("change", onResize);
    };
  }, []);

  return useMemo(() => profiles[tier] ?? profiles.balanced, [tier]);
}
