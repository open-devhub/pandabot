import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/index.ts"],
  format: ["esm"],
  outDir: "dist",
  dts: false,
  minifyWhitespace: true,
  minifySyntax: true,
  external: ["dotenv"],
});
