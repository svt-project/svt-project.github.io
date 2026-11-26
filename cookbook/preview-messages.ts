import type { InputGroup, InputKind } from '@svt-project/svt-js';

export type PreviewValues = Readonly<Record<string, { kind: InputKind; value: string }>>;

export type PreviewRequest =
  | { kind: 'inspect'; id: string }
  | { kind: 'bind'; id: string; revision: number; values: PreviewValues }
  | { kind: 'edit'; id: string; revision: number; values: PreviewValues; source: string | null };

export type PreviewResponse =
  | {
      kind: 'groups';
      id: string;
      revision: number;
      groups: readonly InputGroup[];
      values: PreviewValues;
    }
  | { kind: 'svg'; id: string; revision: number; svg: string | null }
  | { kind: 'error'; id: string; revision: number; error: string };
