import { defineConfig } from "cypress";

export default defineConfig({
  e2e: {
    baseUrl: process.env.CYPRESS_BASE_URL || "http://127.0.0.1:3000",
    specPattern: "cypress/e2e/**/*.cy.ts",
    supportFile: false,
    video: false,
    viewportWidth: 1280,
    viewportHeight: 900,
    defaultCommandTimeout: 10000,
  },
});
