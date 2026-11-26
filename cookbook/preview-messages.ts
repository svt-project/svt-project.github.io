import type { InputGroup, InputKind } from '@svt-project/svt-js';

export type PreviewValues = Readonly<Record<string, { kind: InputKind; value: string }>>;

export type PreviewRequest =
  | { kind: 'inspect'; id: string }
  | { kind: 'bind'; id: string; revision: number; values: PreviewValues }
  | { kind: 'edit'; id: string; revision: number; values: PreviewValues; source: string | null };

export type PreviewResponse =
  | { kind: 'groups'; id: string; groups: readonly InputGroup[] }
  | {
      kind: 'svg';
      id: string;
      revision: number;
      svg: string | null;
      edited?: { groups: readonly InputGroup[]; values: PreviewValues };
    }
  | { kind: 'error'; id: string; revision: number | null; error: string };
