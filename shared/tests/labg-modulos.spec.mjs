// Pruebas del Navegador LABG y del Estudio de figuras LABG en las apps de la suite.
// Se corren con Playwright usando el Edge instalado (no descarga navegadores):
//   cd "Documents/LABG Apps/luisangelbg.github.io/shared/tests"
//   npm i -D @playwright/test        (una sola vez)
//   npx playwright test              (sirve "LABG Apps" en http://127.0.0.1:8765 con servidor.mjs)
import { test, expect } from '@playwright/test';

const APPS = ['AgriDesign', 'AnalizaR', 'BioModellingPro', 'BreedingPro', 'ClusteringPro', 'EconomicsPro', 'GermplasmPro', 'LeafPro',
  'PCAPro', 'PhenologyPro', 'PhylogenyPro', 'PollinationPro', 'PopGeneticsPro', 'ReviewPro', 'SciMetricsPro'];
const SIN_LATERAL = ['SciMetricsPro'];          /* conserva su propio menú lateral */

async function abrir(page, app) {
  const errores = [];
  page.on('pageerror', e => errores.push(e.message));
  await page.goto('/' + app + '/index.html');
  await page.waitForFunction(() => window.LABGNavigator && document.documentElement.classList.contains('lnav-on'), null, { timeout: 15000 });
  await page.waitForFunction(() => window.LABGFigureStudio && window.LABGFigureStudio.version === '1.0.0');
  return errores;
}

for (const app of APPS) {
  test.describe(app, () => {
    test('el navegador se arma sin errores y sin desplazamiento horizontal', async ({ page }, info) => {
      const errores = await abrir(page, app);
      const vw = page.viewportSize().width;
      const blocks = await page.evaluate(() => LABGNavigator.blocks().length);
      expect(blocks).toBeGreaterThan(3);
      if (!SIN_LATERAL.includes(app)) {
        if (vw >= 1024) await expect(page.locator('.lnav-side')).toBeVisible();
        else await expect(page.locator('.lnav-tabs')).toBeVisible();
        await expect(page.locator('.stepper[data-lnav-replaced]')).toBeHidden();
      }
      await expect(page.locator('.lnav-bar')).toBeVisible();
      const hscroll = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth + 2);
      expect(hscroll, 'sin desplazamiento horizontal').toBe(false);
      expect(errores, 'sin errores de JavaScript').toEqual([]);
      await page.screenshot({ path: info.outputPath(app + '-inicio.png') });
    });

    test('paleta Ctrl+K: busca, navega con flechas y va con Enter', async ({ page }) => {
      await abrir(page, app);
      await page.keyboard.press('Control+K');
      const pal = page.locator('dialog.lnav-pal');
      await expect(pal).toBeVisible();
      await expect(page.locator('.lnav-pal input')).toBeFocused();
      const n = await page.locator('.lnav-pal [role="option"]').count();
      expect(n).toBeGreaterThan(2);
      await page.keyboard.press('ArrowDown');
      await expect(page.locator('.lnav-pal [role="option"][aria-selected="true"]')).toHaveCount(1);
      await page.keyboard.press('Escape');
      await expect(pal).toBeHidden();
    });

    test('modos documento y enfocado, y «[» contrae la barra', async ({ page }) => {
      await abrir(page, app);
      await page.evaluate(() => LABGNavigator.mode('focus'));
      await expect(page.locator('html')).toHaveClass(/lnav-focus/);
      await page.evaluate(() => LABGNavigator.mode('doc'));
      await expect(page.locator('html')).not.toHaveClass(/lnav-focus/);
      if (!SIN_LATERAL.includes(app) && page.viewportSize().width >= 1024) {
        const antes = await page.evaluate(() => document.documentElement.classList.contains('lnav-rail'));
        await page.locator('body').click({ position: { x: 5, y: 300 } }).catch(() => {});
        await page.keyboard.press('[');
        await expect.poll(() => page.evaluate(() => document.documentElement.classList.contains('lnav-rail'))).toBe(!antes);
      }
    });

    test('enlace directo #bN y Atrás', async ({ page }) => {
      test.skip(SIN_LATERAL.includes(app), 'usa sus propias rutas');
      await abrir(page, app);
      const libres = await page.evaluate(() => LABGNavigator.blocks().filter(b => !b.disabled).map(b => b.n));
      test.skip(libres.length < 2, 'sin dos bloques abiertos');
      await page.evaluate(n => LABGNavigator.go(n), libres[1]);
      await expect.poll(() => page.evaluate(() => (LABGNavigator.blocks().find(b => b.active) || {}).n)).toBe(libres[1]);
      expect(page.url()).toContain('#b' + libres[1]);
      await page.goBack();
      await expect.poll(() => page.evaluate(() => (LABGNavigator.blocks().find(b => b.active) || {}).n)).toBe(libres[0]);
    });

    test('estudio de figuras: abre, refleja controles, deshace y cierra con Esc', async ({ page }, info) => {
      await abrir(page, app);
      const hay = await page.evaluate(() => LABGFigureStudio.figures().some(f => f.el.getClientRects().length));
      test.skip(!hay, 'sin figuras visibles en el bloque inicial');
      await page.evaluate(() => { const f = LABGFigureStudio.figures().find(x => x.el.getClientRects().length); f.el.scrollIntoView({ block: 'center' }); LABGFigureStudio.open(f.el); });
      await expect(page.locator('.lfs-studio.on')).toBeVisible();
      await expect(page.locator('.lfs-lifted')).toBeVisible();
      const papel = await page.locator('.lfs-lifted').boundingBox();
      const escenario = await page.locator('.lfs-stage').boundingBox();
      expect(papel.width).toBeGreaterThan(80);
      expect(papel.x).toBeGreaterThanOrEqual(escenario.x - 1);
      await page.screenshot({ path: info.outputPath(app + '-estudio.png') });
      /* un cambio del estudio se deshace */
      const pal = page.locator('.lfs-pal[data-pal="okabe"]');
      if (await pal.count()) {
        await pal.click();
        await expect(page.locator('[data-a="undo"]').first()).toBeEnabled();
        await page.keyboard.press('Control+Z');
        await expect(page.locator('.lfs-pal[data-pal=""]')).toHaveAttribute('aria-checked', 'true');
      }
      await page.keyboard.press('Escape');
      await expect(page.locator('.lfs-studio.on')).toHaveCount(0);
    });
  });
}

test.describe('Solo teclado', () => {
  test('PCAPro: Tab llega a la barra lateral y Enter cambia de bloque', async ({ page }) => {
    test.skip(page.viewportSize().width < 1024, 'barra lateral solo en escritorio');
    await abrir(page, 'PCAPro');
    const item = page.locator('.lnav-item').first();
    for (let i = 0; i < 40; i++) {
      await page.keyboard.press('Tab');
      if (await item.evaluate(el => el === document.activeElement || el.closest('.lnav-side').contains(document.activeElement))) break;
    }
    const enSide = await page.evaluate(() => !!document.activeElement.closest('.lnav-side'));
    expect(enSide).toBe(true);
    await page.keyboard.press('Control+K');
    await page.keyboard.type('inicio');
    await page.keyboard.press('Enter');
    await expect.poll(() => page.evaluate(() => (LABGNavigator.blocks().find(b => b.active) || {}).label)).toMatch(/Inicio/);
  });
});

test.describe('Exportación', () => {
  test('PCAPro: PNG, SVG, PDF y TIFF válidos desde el estudio', async ({ page }) => {
    test.skip(page.viewportSize().width < 1024, 'una vez basta');
    await abrir(page, 'PCAPro');
    await page.click('#demoBtn');
    await page.waitForTimeout(2500);
    await page.click('#processBtn');
    await page.waitForTimeout(1500);
    await page.evaluate(() => LABGNavigator.go('2'));
    await page.click('#runPcaBtn');
    await page.waitForFunction(() => LABGFigureStudio.figures().some(f => f.el.getClientRects().length && /sedimentaci|scree/i.test(f.title)));
    await page.evaluate(() => { const f = LABGFigureStudio.figures().find(x => x.el.getClientRects().length && /sedimentaci|scree/i.test(x.title)); f.el.scrollIntoView({ block: 'center' }); LABGFigureStudio.open(f.el); });
    for (const fmt of ['png', 'svg', 'pdf', 'tiff']) {
      await page.click(`[data-exp="fmt"][data-v="${fmt}"]`);
      const [dl] = await Promise.all([page.waitForEvent('download'), page.click('.lfs-sec[data-sec="size"] [data-a="export"]')]);
      const buf = await (await dl.createReadStream()).toArray().then(c => Buffer.concat(c));
      if (fmt === 'png') { expect(buf.slice(1, 4).toString()).toBe('PNG'); expect(buf.includes(Buffer.from('pHYs'))).toBe(true); }
      if (fmt === 'svg') expect(buf.toString().includes('width="85mm"')).toBe(true);
      if (fmt === 'pdf') { expect(buf.slice(0, 5).toString()).toBe('%PDF-'); expect(buf.toString('latin1').trimEnd().endsWith('%%EOF')).toBe(true); }
      if (fmt === 'tiff') { expect(buf.slice(0, 2).toString()).toBe('II'); expect(buf.readUInt16LE(2)).toBe(42); }
    }
  });
});
