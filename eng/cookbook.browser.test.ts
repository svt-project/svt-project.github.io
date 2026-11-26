import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { after, before, test, type TestContext } from 'node:test';
import { context, type BuildContext } from 'esbuild';
import { chromium, type Browser, type BrowserContextOptions, type Locator } from 'playwright';
import type { PreviewRequest } from '../cookbook/preview-messages.ts';
import { groups } from '../cookbook/guide.ts';

let browser: Browser;
let server: BuildContext;
let guide: string;

before(async () => {
  server = await context({});
  const { port } = await server.serve({ host: '127.0.0.1', port: 0, servedir: '.local/site' });
  guide = `http://127.0.0.1:${port}/cookbook/`;
  browser = await chromium.launch();
});

after(async () => {
  await browser?.close();
  await server?.dispose();
});

async function openPage(t: TestContext, options?: BrowserContextOptions) {
  const ctx = await browser.newContext(options);
  t.after(() => ctx.close());
  const page = await ctx.newPage();
  page.setDefaultTimeout(8000);
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  t.after(() => assert.deepEqual(errors, []));
  return page;
}

async function editSource(recipe: Locator, source: string) {
  const editor = recipe.locator('.cm-content');
  await editor.press('ControlOrMeta+a');
  await recipe.page().keyboard.insertText(source);
}

async function previewChange(recipe: Locator, action: () => Promise<void>) {
  const image = recipe.locator('.specimen');
  const old = await image.getAttribute('src');
  await action();
  await recipe
    .page()
    .waitForFunction(
      ({ id, old }) =>
        document.querySelector(`[data-exercise="${id}"] .specimen`)?.getAttribute('src') !== old,
      { id: await recipe.getAttribute('data-exercise'), old },
    );
}

async function renderedSvg(recipe: Locator) {
  return recipe
    .locator('.specimen')
    .evaluate(async (img: HTMLImageElement) => (await fetch(img.src)).text());
}

async function pixels(recipe: Locator) {
  return recipe.locator('.specimen').evaluate(async (img: HTMLImageElement) => {
    // Isolate the sample from Chromium's scale-dependent cache for the displayed SVG.
    const url = URL.createObjectURL(await (await fetch(img.src)).blob());
    try {
      const sample = new Image(720, 280);
      sample.src = url;
      await sample.decode();
      const canvas = document.createElement('canvas');
      canvas.width = sample.width;
      canvas.height = sample.height;
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('Could not read the preview pixels.');
      ctx.drawImage(sample, 0, 0, canvas.width, canvas.height);
      return canvas.toDataURL();
    } finally {
      URL.revokeObjectURL(url);
    }
  });
}

test('all authored previews accept bindings and reset to the downloadable SVG', async (t) => {
  const page = await openPage(t);
  await page.goto(guide);
  for (const { id } of groups.flatMap((group) => group.exercises)) {
    const recipe = page.locator(`[data-exercise="${id}"]`);
    await recipe.locator('form').waitFor();
    assert(await recipe.locator('pre .svt-name').count(), id);
    const original = await pixels(recipe);
    let previous = original;
    for (const field of await recipe.locator('input, select').all()) {
      await previewChange(recipe, async () => {
        if (await field.evaluate((node) => node.matches('select'))) {
          await field.selectOption({ index: 1 });
        } else {
          await field.fill(
            (await field.getAttribute('type')) === 'color' ? '#007744' : 'São Tomé & Príncipe',
          );
        }
      });
      const current = await pixels(recipe);
      assert(current !== previous, `Binding did not change the rendered ${id} preview`);
      previous = current;
    }
    await previewChange(recipe, () => recipe.getByRole('button', { name: 'Reset values' }).click());
    assert((await pixels(recipe)) === original, `Reset did not restore ${id}`);
    assert.equal(await recipe.locator('.specimen').getAttribute('src'), `recipes/${id}.svg`);
  }
});

test('every example opens its own full template using the shared editor', async (t) => {
  const page = await openPage(t);
  await page.goto(guide);
  assert.equal(await page.locator('.cm-editor').count(), 0);
  for (const { id, title } of groups.flatMap((group) => group.exercises)) {
    const recipe = page.locator(`[data-exercise="${id}"]`);
    await recipe.getByRole('button', { name: 'Edit full template' }).click();
    await recipe.getByRole('textbox', { name: title + ' template source' }).waitFor();
    assert.equal(await recipe.getByRole('button', { name: 'Edit full template' }).count(), 0);
  }
});

test('one image field updates both fit modes until an author gives a frame its own key', async (t) => {
  const page = await openPage(t);
  await page.goto(guide + '#image-fit');
  const recipe = page.locator('[data-exercise="image-fit"]');
  const images = recipe.getByRole('combobox');
  await images.first().waitFor();
  assert.equal(await images.count(), 1);
  await previewChange(recipe, async () => {
    await images.first().selectOption('beacon');
  });
  await recipe.getByRole('button', { name: 'Edit full template' }).click();
  await recipe.locator('.cm-content').waitFor();
  assert.equal(await images.count(), 1);
  const frames = () =>
    recipe.locator('.specimen').evaluate(async (img: HTMLImageElement) => {
      const doc = new DOMParser().parseFromString(
        await (await fetch(img.src)).text(),
        'image/svg+xml',
      );
      return Array.from(doc.querySelectorAll('image'), (node) => [
        node.getAttribute('preserveAspectRatio'),
        node.getAttribute('href'),
      ]);
    });
  const uri = async (art: string) =>
    'data:image/png;base64,' + (await readFile(`cookbook/artwork/${art}.png`)).toString('base64');
  const beacon = await uri('beacon');
  const headland = await uri('headland');
  assert.deepEqual(await frames(), [
    ['xMidYMid meet', beacon],
    ['xMidYMid slice', beacon],
  ]);
  const authored = await readFile('.local/site/cookbook/recipes/image-fit.svg', 'utf8');
  await previewChange(recipe, () =>
    editSource(recipe, authored.replace('data-svt-image="artwork"', 'data-svt-image="whole"')),
  );
  assert.equal(await images.count(), 2);
  assert.deepEqual(await frames(), [
    ['xMidYMid meet', headland],
    ['xMidYMid slice', beacon],
  ]);
  await previewChange(recipe, () =>
    recipe.getByRole('button', { name: 'Restore template' }).click(),
  );
  assert.equal(await images.count(), 1);
  assert.deepEqual(await frames(), [
    ['xMidYMid meet', beacon],
    ['xMidYMid slice', beacon],
  ]);
});

test('one text field can override different ticket numbers and reset to both authored values', async (t) => {
  const page = await openPage(t);
  await page.goto(guide + '#repeat-a-label');
  const recipe = page.locator('[data-exercise="repeat-a-label"]');
  await recipe.getByRole('button', { name: 'Edit full template' }).click();
  const authored = await readFile('.local/site/cookbook/recipes/repeat-a-label.svg', 'utf8');
  await previewChange(recipe, () => editSource(recipe, authored.replace('FM-0824', 'Unassigned')));
  const field = recipe.getByRole('textbox', { name: 'Ticket number', exact: true });
  assert.equal(await field.getAttribute('placeholder'), 'Multiple template values');
  const numbers = () =>
    recipe.locator('.specimen').evaluate(async (img: HTMLImageElement) => {
      const doc = new DOMParser().parseFromString(
        await (await fetch(img.src)).text(),
        'image/svg+xml',
      );
      return Array.from(
        doc.querySelectorAll('[data-svt-text="ticket"]'),
        (node) => node.textContent,
      );
    });
  await previewChange(recipe, () => field.fill('FM-0091'));
  assert.deepEqual(await numbers(), ['FM-0091', 'FM-0091']);
  await previewChange(recipe, () => field.fill(''));
  assert.deepEqual(await numbers(), ['', '']);
  await previewChange(recipe, () => recipe.getByRole('button', { name: 'Reset values' }).click());
  assert.deepEqual(await numbers(), ['Unassigned', 'FM-0824']);
});

test('the shared menu lists local pages first and marks external destinations in static HTML', async (t) => {
  const page = await openPage(t, {
    javaScriptEnabled: false,
    viewport: { width: 320, height: 568 },
  });
  const local = ['/', '/cookbook/', '/icons/', '/ns/svt/'];
  for (const path of local) {
    await page.goto(new URL(path, guide).href);
    const nav = page.getByRole('navigation', { name: 'Main navigation' });
    const links = nav.getByRole('link');
    assert.deepEqual(await links.allTextContents(), [
      'Home',
      'Authoring Guide',
      'Icons',
      'Namespace',
      'Specification',
      'GitHub',
    ]);
    assert.deepEqual(
      await links.evaluateAll((items) =>
        items.slice(0, 4).map((link) => link.getAttribute('href')),
      ),
      local,
    );
    assert.equal(await nav.locator('[aria-current="page"]').getAttribute('href'), path);
    for (const link of await links.all()) {
      const external =
        new URL((await link.getAttribute('href')) ?? '', guide).origin !== new URL(guide).origin;
      assert.equal(
        await link.getByRole('img', { name: 'External link' }).count(),
        Number(external),
      );
      const bounds = await link.boundingBox();
      assert(bounds && bounds.x >= 0 && bounds.x + bounds.width <= 320);
    }
  }
});

test('a failed initial inspection can be retried in place', async (t) => {
  const page = await openPage(t);
  let attempts = 0;
  await page.context().route('**/recipes/zoom-image-detail.svg', (route) => {
    if (route.request().resourceType() === 'fetch' && ++attempts === 1)
      return route.fulfill({ status: 503 });
    return route.continue();
  });
  await page.goto(guide + '#zoom-image-detail');
  const recipe = page.locator('[data-exercise="zoom-image-detail"]');
  await recipe.getByRole('button', { name: 'Retry preview' }).click();
  await recipe.getByRole('combobox').waitFor();
  assert.equal(await recipe.locator('.status').textContent(), '');
  assert.equal(attempts, 2);
  await recipe.getByRole('button', { name: 'Edit full template' }).click();
  await recipe.locator('.cm-content').waitFor();
});

test('failed artwork can be rebound and subsequent selections reuse the successful load', async (t) => {
  const page = await openPage(t);
  let attempts = 0;
  await page
    .context()
    .route('**/artwork/beacon.png', (route) =>
      ++attempts === 1 ? route.fulfill({ status: 503 }) : route.continue(),
    );
  await page.goto(guide);
  const recipe = page.locator('[data-exercise="replace-image"]');
  const select = recipe.getByRole('combobox');
  await select.selectOption('beacon');
  await recipe.locator('.status').filter({ hasText: 'Could not load' }).waitFor();
  for (const value of ['headland', 'beacon', 'headland', 'beacon']) {
    await previewChange(recipe, async () => {
      await select.selectOption(value);
    });
  }
  assert.equal(attempts, 2);
  assert.equal(await recipe.locator('.status').textContent(), '');
  const bytes = await readFile('cookbook/artwork/beacon.png');
  assert((await renderedSvg(recipe)).includes('data:image/png;base64,' + bytes.toString('base64')));
});

test('invalid source overlays the last preview, then edited bindings and authored defaults recover', async (t) => {
  const page = await openPage(t);
  const id = 'organize-form-fields';
  await page.goto(guide + '#' + id);
  const recipe = page.locator(`[data-exercise="${id}"]`);
  const paint = recipe.getByLabel('Panel color', { exact: true });
  await previewChange(recipe, () => paint.fill('#123456'));
  const authored = await readFile(`.local/site/cookbook/recipes/${id}.svg`, 'utf8');
  await recipe.getByRole('button', { name: 'Edit full template' }).click();
  const [worker] = page.workers();
  assert(worker);
  const requests = await worker.evaluateHandle((id) => {
    const kinds: PreviewRequest['kind'][] = [];
    self.addEventListener('message', ({ data }: MessageEvent<PreviewRequest>) => {
      if (data.id === id) kinds.push(data.kind);
    });
    return kinds;
  }, id);
  const original = await recipe.locator('.specimen').getAttribute('src');
  await editSource(recipe, '<svg');
  const status = recipe.getByRole('status').filter({ hasText: 'last valid' });
  await status.waitFor();
  assert.equal(await recipe.locator('.specimen').getAttribute('src'), original);
  for (const viewport of [
    { width: 1280, height: 900 },
    { width: 320, height: 568 },
  ]) {
    await page.setViewportSize(viewport);
    // A viewport resize can scroll the editor. Measure both rectangles in the same layout.
    const contained = await status.evaluate((message) => {
      const image = message.closest('.preview-image')?.querySelector('img');
      if (!image) throw new Error('Missing preview image');
      const outer = image.getBoundingClientRect();
      const inner = message.getBoundingClientRect();
      return (
        inner.left >= outer.left &&
        inner.right <= outer.right + 1 &&
        inner.top >= outer.top &&
        inner.bottom <= outer.bottom + 1
      );
    });
    assert(contained, `The status must fit over the image at ${viewport.width}px`);
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth), viewport.width);
  }
  await page.emulateMedia({ reducedMotion: 'reduce' });
  const filter = await recipe.locator('.specimen').evaluate((img) => {
    const { filter, transitionDuration } = getComputedStyle(img);
    return { filter, transitionDuration };
  });
  assert.match(filter.filter, /blur\(/);
  assert.equal(filter.transitionDuration, '0s');
  const mixed = authored.replace('</svg>', '<rect fill="white" data-svt-fill="panel"/></svg>');
  await previewChange(recipe, () => editSource(recipe, mixed));
  assert.equal(await recipe.locator('.status').textContent(), '');
  assert.equal(
    await recipe.locator('.specimen').evaluate((img) => getComputedStyle(img).filter),
    'none',
  );
  assert.equal(await paint.inputValue(), '#123456');
  await previewChange(recipe, async () => {
    await paint.selectOption({ label: 'Clay' });
  });
  assert.equal((await renderedSvg(recipe)).match(/fill="#ae4b32"/g)?.length, 2);
  await previewChange(recipe, async () => {
    await paint.selectOption({ label: 'Authored colors' });
  });
  assert.match(await renderedSvg(recipe), /fill="white"/);
  await previewChange(recipe, () =>
    recipe.getByRole('button', { name: 'Restore template' }).click(),
  );
  assert.equal(await recipe.locator('.specimen').getAttribute('src'), `recipes/${id}.svg`);
  assert.deepEqual(await requests.jsonValue(), ['edit', 'edit', 'bind', 'bind', 'edit']);
});

test('mobile deep links expose the exercise heading with JavaScript disabled', async (t) => {
  const page = await openPage(t, {
    viewport: { width: 390, height: 844 },
    javaScriptEnabled: false,
  });
  const visibleTarget = () =>
    page.locator(':target').evaluate((target) => {
      const rect = target.getBoundingClientRect();
      return target.contains(document.elementFromPoint(rect.left + 8, rect.top + 8));
    });
  await page.goto(guide + '#zoom-image-detail');
  assert(await visibleTarget());
  await page.locator('aside summary').click();
  await page.locator('aside a[href="#organize-form-fields"]').click();
  assert(await visibleTarget());
  assert.equal(
    await page.locator('pre:has(.svt-name)').count(),
    groups.flatMap((group) => group.exercises).length,
  );
});
