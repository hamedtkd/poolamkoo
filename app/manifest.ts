import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "پولم‌کو",
    short_name: "پولم‌کو",
    description: "تصمیم‌یار مالی Local-First",
    start_url: "/",
    display: "standalone",
    orientation: "portrait-primary",
    background_color: "#0d0e13",
    theme_color: "#f43f5e",
    lang: "fa",
    dir: "rtl",
    icons: [
      { src: "/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
