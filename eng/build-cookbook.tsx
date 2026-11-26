import { cp, mkdir, readFile, writeFile } from 'node:fs/promises';
import { build } from 'esbuild';
import { inspect } from '@svt-project/svt-js';
import { prepareSource } from './prepare-source.ts';
import { groups } from '../cookbook/guide.ts';

import { writePages } from '../site/render.tsx';
import { Guide } from '../cookbook/Guide.tsx';
import type { Exercise, GuideGroup, Recipe } from '../cookbook/guide-model.ts';

const dest = '.local/site/cookbook';
await cp('public', '.local/site', { recursive: true });
await mkdir(dest + '/recipes', { recursive: true });
await cp('cookbook/artwork', dest + '/artwork', { recursive: true });
await cp('cookbook/style.css', dest + '/style.css');
const artwork = await readFile('cookbook/artwork/headland.png');
const embedded = 'data:image/png;base64,' + artwork.toString('base64');
async function prepareExercise({ lines, ...exercise }: Recipe): Promise<Exercise> {
  const { id } = exercise;
  const authored = await readFile(`cookbook/recipes/${id}.svg`, 'utf8');
  const imagePath = '../artwork/headland.png';
  const { formatted, snippet } = prepareSource(authored, lines, imagePath);
  const svg = formatted.replaceAll(imagePath, embedded);
  const result = inspect(svg);
  if (!result.ok) throw new Error(id + ': ' + result.error.message);
  await writeFile(`${dest}/recipes/${id}.svg`, svg);
  return { ...exercise, snippet };
}

const prepared: GuideGroup[] = [];
for (const { name, exercises } of groups) {
  prepared.push({ name, exercises: await Promise.all(exercises.map(prepareExercise)) });
}
await writePages('.local/site', {
  path: '/cookbook/',
  title: 'Authoring Guide — SVT',
  description:
    'Interactive exercises for authoring SVG templates with SVT, including text, images, paint, and form metadata.',
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
const { metafile } = await build({
  metafile: true,
  entryPoints: ['cookbook/client.tsx', 'cookbook/worker.ts'],
  bundle: true,
  format: 'esm',
  splitting: true,
  chunkNames: 'chunks/[name]-[hash]',
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
// The linked SVT package supplies its own notices above. Include the licenses
// of every other package esbuild picked up from this site's node_modules.
const packages = new Set<string>();
for (const file of Object.keys(metafile.inputs)) {
  const name = /^node_modules\/((?:@[^/]+\/)?[^/]+)\//.exec(file)?.[1];
  if (name && name !== '@svt-project/svt-js') packages.add(name);
}
for (const name of packages) {
  await cp(`node_modules/${name}/LICENSE`, `${dest}/licenses/${name.replace('/', '-')}.txt`);
}
