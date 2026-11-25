import type { TemplateInput } from '@svt-project/svt-js';

export type PreviewValues = Readonly<Record<string, string>>;
export type PreviewRequest =
  | { kind: 'inspect'; id: string }
  | { kind: 'bind'; id: string; revision: number; values: PreviewValues };
export type PreviewResponse =
  | { kind: 'inputs'; id: string; inputs: readonly TemplateInput[] }
  | { kind: 'svg'; id: string; revision: number; svg: string }
  | { kind: 'error'; id: string; revision: number | null; error: string };
