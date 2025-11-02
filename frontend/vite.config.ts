import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import svgr from "vite-plugin-svgr";

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react({
      babel: {
        plugins: [
          [
            "module-resolver",
            {
              root: ["./src"],
              alias: {
                "@": "./src",
                "@assets": "./src/assets",
                "@components": "./src/components",
                "@config": "./src/config",
                "@pages": "./src/pages",
                "@services": "./src/services",
                "@models": "./src/models",
                "@utils": "./src/utils",
                "@hooks": "./src/hooks",
                "@contexts": "./src/contexts",
                "@provider": "./src/provider",
              },
              extensions: [".ts", ".tsx", ".js", ".jsx", ".json"],
            },
          ],
        ],
      },
    }),
    tailwindcss(),
    svgr(),
  ],
  resolve: {
    alias: {
      "@": "/src",
      "@assets": "/src/assets",
      "@components": "/src/components",
      "@config": "/src/config",
      "@pages": "/src/pages",
      "@services": "/src/services",
      "@models": "/src/models",
      "@utils": "/src/utils",
      "@hooks": "/src/hooks",
      "@contexts": "/src/contexts",
      "@provider": "/src/provider",
    },
  },
  server: {
    proxy: {
      "/api": {
        target: "https://localhost:7031",
        changeOrigin: true,
        secure: false,
      },
    },
  },
});
