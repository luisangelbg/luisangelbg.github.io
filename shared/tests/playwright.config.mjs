// Configuración de las pruebas de los módulos compartidos: Edge instalado y tres tamaños de pantalla
import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: '.',
  timeout: 60000,
  fullyParallel: false,
  workers: 2,
  reporter: [['list'], ['html', { open: 'never', outputFolder: 'informe' }]],
  use: {
    baseURL: 'http://127.0.0.1:8765',
    channel: 'msedge',
    locale: 'es-MX',
    acceptDownloads: true,
  },
  webServer: {
    command: 'node servidor.mjs',
    url: 'http://127.0.0.1:8765/PCAPro/index.html',
    reuseExistingServer: true,
  },
  projects: [
    { name: 'escritorio-1440', use: { viewport: { width: 1440, height: 900 } } },
    { name: 'portatil-1280', use: { viewport: { width: 1280, height: 720 } } },
    { name: 'telefono-390', use: { viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, deviceScaleFactor: 2 } },
  ],
});
