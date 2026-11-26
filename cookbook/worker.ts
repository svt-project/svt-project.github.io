import { inspect, type Binding, type Result, type Template } from '@svt-project/svt-js';
import type { PreviewRequest, PreviewResponse } from './preview-messages.ts';

const templates = new Map<string, Promise<Template>>();
const drafts = new Map<string, Template>();
const artwork = new Map<string, Promise<Uint8Array>>();

async function read(path: string) {
  const response = await fetch(path);
  if (!response.ok) throw new Error(`Could not load ${path}.`);
  return new Uint8Array(await response.arrayBuffer());
}

function unwrap<T>(result: Result<T>): T {
  if (!result.ok) throw new Error(result.error.message);
  return result.value;
}

function load<T>(cache: Map<string, Promise<T>>, key: string, fetchValue: () => Promise<T>) {
  const cached = cache.get(key);
  if (cached) return cached;
  const pending = fetchValue().catch((error: unknown) => {
    cache.delete(key);
    throw error;
  });
  cache.set(key, pending);
  return pending;
}

function reply(response: PreviewResponse) {
  postMessage(response);
}

self.onmessage = async ({ data }: MessageEvent<PreviewRequest>) => {
  const { id } = data;
  const revision = data.kind === 'inspect' ? 0 : data.revision;
  try {
    if (data.kind === 'edit') {
      if (data.source === null) drafts.delete(id);
      else drafts.set(id, unwrap(inspect(data.source)));
    }
    const draft = drafts.get(id);
    const template =
      draft ??
      (await load(templates, id, async () => unwrap(inspect(await read(`recipes/${id}.svg`)))));
    const overrides = template.inputs.flatMap(({ key, kind }) => {
      const override = data.kind === 'inspect' ? undefined : data.values[key];
      return override?.kind === kind ? [{ key, override }] : [];
    });
    if (data.kind !== 'bind') {
      reply({
        kind: 'groups',
        id,
        revision,
        groups: template.groups,
        values: Object.fromEntries(overrides.map(({ key, override }) => [key, override])),
      });
    }
    if (data.kind === 'inspect') return;
    const assignments: Binding[] = [];
    for (const { key, override } of overrides) {
      const { kind, value } = override;
      if (kind === 'image') {
        if (value !== 'beacon' && value !== 'headland')
          throw new Error('Unknown cookbook artwork.');
        const bytes = await load(artwork, value, () => read(`artwork/${value}.png`));
        assignments.push({
          key,
          kind: 'image-content',
          bytes,
          mediaType: 'image/png',
        });
      } else {
        assignments.push({ key, kind, value });
      }
    }
    reply({
      kind: 'svg',
      id,
      revision,
      svg: !draft && !assignments.length ? null : unwrap(template.bind(assignments)).svg,
    });
  } catch (error) {
    reply({
      kind: 'error',
      id,
      revision,
      error: error instanceof Error ? error.message : String(error),
    });
  }
};
