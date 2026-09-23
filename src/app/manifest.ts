import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "بەناوبارا — بازاڕی گەڕەکەکەت",
    short_name: "بەناوبارا",
    description:
      "کڕین و فرۆشتن بە شێوەیەکی خۆجێیی لە گەڕەکەکەت. بازاڕێکی پاک و متمانەپێکراو لە عێراق.",
    start_url: "/",
    display: "standalone",
    background_color: "#F6F1E4",
    theme_color: "#16262B",
    icons: [
      {
        src: "/icon-192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/icon-512.png",
        sizes: "512x512",
        type: "image/png",
      },
      {
        src: "/apple-touch-icon.png",
        sizes: "512x512",
        type: "image/png",
      },
    ],
  };
}
