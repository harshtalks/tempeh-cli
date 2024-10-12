import { defineConfig } from "tsup";

export default defineConfig({
  entryPoints: ["src/index.ts"],
  clean: true,
  publicDir: true,
  treeshake: "smallest",
});
