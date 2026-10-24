import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  outputDir: './test-results',
  reporter: 'list',
  // Every page renders WebGL on the CPU (SwiftShader); parallel workers starve each other.
  workers: 1,
  use: {
    baseURL: 'http://localhost:4173',
    ...devices['Desktop Chrome'],
    // Headless Chromium has no GPU; SwiftShader keeps WebGL available for the canvas.
    // gc + precise heap numbers are for the P6 memory test.
    launchOptions: { args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--js-flags=--expose-gc', '--enable-precise-memory-info'] },
  },
  webServer: {
    command: 'npm run preview',
    url: 'http://localhost:4173',
    reuseExistingServer: true,
    timeout: 60_000,
  },
});
