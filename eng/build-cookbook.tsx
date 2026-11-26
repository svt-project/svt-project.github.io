import { cp, mkdir, readFile, writeFile } from 'node:fs/promises';
import { build } from 'esbuild';
import { inspect } from '@svt-project/svt-js';
import { groups } from '../cookbook/guide.ts';

import { writePages } from '../site/render.tsx';
import { Guide } from '../cookbook/Guide.tsx';
import type { Exercise, GuideGroup, Recipe } from '../cookbook/guide-model.ts';

const dest = '.local/site/cookbook';
await cp('public', '.local/site', { recursive: true });
await mkdir(dest + '/recipes', { recursive: true });
await cp('cookbook/artwork', dest + '/artwork', { recursive: true });
await cp('cookbook/style.css', dest + '/style.css');
const artwork = await readFile('cookbook/artwork/headland.svg');
const embedded = 'data:image/svg+xml;base64,' + artwork.toString('base64');
async function prepareExercise({ lines, ...exercise }: Recipe): Promise<Exercise> {
  const { id } = exercise;
  const authored = await readFile(`cookbook/recipes/${id}.svg`, 'utf8');
  const svg = authored.replaceAll('../artwork/headland.svg', embedded);
  const result = inspect(svg);
  if (!result.ok) throw new Error(id + ': ' + result.error.message);
  await writeFile(`${dest}/recipes/${id}.svg`, svg);
  // Abbreviate embedded image bytes in the excerpt. Downloads retain the complete source.
  const snippet = svg
    .trim()
    .split('\n')
    .filter((line) => lines.some((token) => line.includes(token)))
    .map((line) => line.trim().replace(embedded, '…'))
    .join('\n');
  return { ...exercise, snippet };
}

const prepared: GuideGroup[] = [];
for (const { name, exercises } of groups) {
  prepared.push({ name, exercises: await Promise.all(exercises.map(prepareExercise)) });
}
await writePages('.local/site', {
  path: '/cookbook/',
  title: 'SVG authoring guide — SVT',
  description: 'Interactive SVG authoring exercises for text, images, and paint.',
  head: (
    <>
      <link rel="stylesheet" href="style.css" />
      <script type="module" src="client.js" />
    </>
  ),
  content: (
    <div id="guide">
      <Guide groups={prepared} />
    </div>
  ),
});
await build({
  entryPoints: ['cookbook/client.tsx', 'cookbook/worker.ts'],
  bundle: true,
  format: 'esm',
  jsx: 'automatic',
  minify: true,
  define: { COOKBOOK_GROUPS: JSON.stringify(prepared) },
  platform: 'browser',
  target: 'es2022',
  outdir: dest,
});
for (const name of ['LICENSE', 'NOTICE', 'THIRD-PARTY-NOTICES.txt']) {
  await cp('node_modules/@svt-project/svt-js/' + name, dest + '/' + name);
}
await cp('cookbook/licenses', dest + '/licenses', { recursive: true });
for (const name of ['react', 'react-dom', 'react-icons', 'scheduler']) {
  await cp(`node_modules/${name}/LICENSE`, `${dest}/licenses/${name}.txt`);
}
