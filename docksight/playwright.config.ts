import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  outputDir: './test-results',
  reporter: 'list',
  // Headless WebGL renders on the CPU (SwiftShader); parallel workers starve each other.
  workers: 1,
  use: {
    baseURL: 'http://localhost:4174',
    ...devices['Desktop Chrome'],
    launchOptions: { args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--js-flags=--expose-gc', '--enable-precise-memory-info'] },
  },
  webServer: {
    command: 'npm run preview',
    url: 'http://localhost:4174',
    reuseExistingServer: true,
    timeout: 60_000,
  },
});
