import { inspect, type Binding, type Result, type Template } from '@svt-project/svt-js';
import type { PreviewRequest, PreviewResponse } from './preview-messages.ts';

const templates = new Map<string, Promise<Template>>();
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
  const pending = fetchValue();
  cache.set(key, pending);
  return pending;
}

function reply(response: PreviewResponse) {
  postMessage(response);
}

self.onmessage = async ({ data }: MessageEvent<PreviewRequest>) => {
  const { id } = data;
  try {
    const template = await load(templates, id, async () =>
      unwrap(inspect(await read(`recipes/${id}.svg`))),
    );
    if (data.kind === 'inspect') {
      reply({ kind: 'groups', id, groups: template.groups });
      return;
    }
    const assignments: Binding[] = [];
    for (const input of template.inputs) {
      const value = data.values[input.key];
      if (value === undefined) continue;
      if (input.kind === 'image') {
        const bytes = await load(artwork, value, () => read(`artwork/${value}.png`));
        assignments.push({
          key: input.key,
          kind: 'image-content',
          bytes,
          mediaType: 'image/png',
        });
      } else {
        assignments.push({ key: input.key, kind: input.kind, value });
      }
    }
    reply({
      kind: 'svg',
      id,
      revision: data.revision,
      svg: unwrap(template.bind(assignments)).svg,
    });
  } catch (error) {
    reply({
      kind: 'error',
      id,
      revision: data.kind === 'bind' ? data.revision : null,
      error: error instanceof Error ? error.message : String(error),
    });
  }
};
