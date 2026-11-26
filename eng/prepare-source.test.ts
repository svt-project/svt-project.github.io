import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import { inspect } from '@svt-project/svt-js';
import { groups } from '../cookbook/guide.ts';
import { prepareSource } from './prepare-source.ts';

const imagePath = '../artwork/headland.png';

test('excerpt names use the enclosing XML namespaces, including local prefix changes', () => {
  const source = `<svg xmlns="http://www.w3.org/2000/svg" xmlns:m="https://svt-project.github.io/ns/svt">
    <m:inputs>
      <m:input key="a"/>
      <m:input xmlns:m="urn:other"/>
      <m:group><m:description>m:input data-svt-text</m:description></m:group>
    </m:inputs>
    <!-- <m:input/> -->
    <text data-svt-text="a">A</text>
    <text xmlns="urn:other" data-svt-text="foreign">B</text>
  </svg>`;
  const { snippet } = prepareSource(source, ['m:input', 'm:group', 'data-svt-text'], imagePath);
  assert.deepEqual(
    snippet.filter(([, style]) => style === 'svt-name').map(([text]) => text),
    [
      'm:inputs',
      'm:input',
      'm:group',
      'm:description',
      'm:description',
      'm:group',
      'm:inputs',
      'data-svt-text',
    ],
  );
});

function serialize(source: string) {
  const template = inspect(source);
  assert(template.ok);
  const bound = template.value.bind([]);
  assert(bound.ok);
  return bound.value.svg;
}

test('formatting preserves every recipe’s SVG, including whitespace between text spans', async () => {
  for (const { exercises } of groups) {
    for (const { id, lines } of exercises) {
      const authored = await readFile(
        new URL(`../cookbook/recipes/${id}.svg`, import.meta.url),
        'utf8',
      );
      const { formatted } = prepareSource(authored, lines, imagePath);
      assert.equal(serialize(formatted), serialize(authored), id);
    }
  }
});
