"use client";

import { useEffect } from "react";

interface StandaloneNavigator extends Navigator {
  standalone?: boolean;
}

export function StandaloneLandingRedirect() {
  useEffect(() => {
    if (window.location.pathname !== "/") return;
    const iosStandalone = Boolean((navigator as StandaloneNavigator).standalone);
    const displayStandalone = window.matchMedia?.("(display-mode: standalone)").matches ?? false;
    if (iosStandalone || displayStandalone) window.location.replace("/dashboard");
  }, []);

  return null;
}
