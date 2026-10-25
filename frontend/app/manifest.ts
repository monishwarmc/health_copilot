import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    id: "/",
    name: "Health Copilot",
    short_name: "Health Copilot",
    description: "Your personal nutrition, weight, and wellness copilot.",
    start_url: "/dashboard?source=installed-app",
    scope: "/",
    display: "standalone",
    display_override: ["standalone", "minimal-ui"],
    orientation: "portrait",
    background_color: "#f7fbff",
    theme_color: "#087f8c",
    categories: ["health", "lifestyle"],
    icons: [
      {
        src: "/icons/health-copilot-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/health-copilot-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/health-copilot-maskable-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
    shortcuts: [
      {
        name: "Dashboard",
        short_name: "Dashboard",
        url: "/dashboard",
        icons: [{ src: "/icons/health-copilot-192.png", sizes: "192x192" }],
      },
      {
        name: "Log a meal",
        short_name: "Nutrition",
        url: "/nutrition",
        icons: [{ src: "/icons/health-copilot-192.png", sizes: "192x192" }],
      },
      {
        name: "Ask the copilot",
        short_name: "AI chat",
        url: "/chat",
        icons: [{ src: "/icons/health-copilot-192.png", sizes: "192x192" }],
      },
    ],
  };
}
