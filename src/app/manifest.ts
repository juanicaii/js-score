import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "JS Score - Anotador de Juegos",
    short_name: "JS Score",
    description:
      "Anotador inteligente para juegos de mesa argentinos: Generala, Chinchón, Truco, 10.000 y más",
    start_url: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#0f0f13",
    theme_color: "#6366f1",
    icons: [
      {
        src: "/icons/icon-192x192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/icon-512x512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
    ],
  };
}
