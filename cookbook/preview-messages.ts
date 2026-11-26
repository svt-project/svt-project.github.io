import type { InputGroup } from '@svt-project/svt-js';

export type PreviewValues = Readonly<Record<string, string>>;
export type PreviewRequest =
  | { kind: 'inspect'; id: string }
  | { kind: 'bind'; id: string; revision: number; values: PreviewValues };
export type PreviewResponse =
  | { kind: 'groups'; id: string; groups: readonly InputGroup[] }
  | { kind: 'svg'; id: string; revision: number; svg: string }
  | { kind: 'error'; id: string; revision: number | null; error: string };
