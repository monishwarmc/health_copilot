"use client";

import { useEffect } from "react";

export default function PWARegistration() {
  useEffect(() => {
    if (process.env.NODE_ENV !== "production" || !("serviceWorker" in navigator)) {
      return;
    }

    navigator.serviceWorker.register("/sw.js", { scope: "/" }).catch((error: unknown) => {
      console.error("Health Copilot could not register its service worker.", error);
    });
  }, []);

  return null;
}
