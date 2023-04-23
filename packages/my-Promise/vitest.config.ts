import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    /* https://cn.vitest.dev/config/#reporters */
    reporters: ["verbose"],
  },
});
