import type { InputDefault, InputGroup, InputKind, TemplateInput } from '@svt-project/svt-js';

export type ControlInput = Pick<TemplateInput, 'key' | 'label' | 'labelSource' | 'description'> &
  (
    | { kind: 'text'; default: InputDefault }
    | { kind: 'paint'; default: InputDefault; pickerValue: string | null }
    | { kind: 'image'; artworkLabel: string }
  );
export type ControlGroup = Omit<InputGroup, 'inputs'> & {
  readonly inputs: readonly ControlInput[];
};

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
      groups: readonly ControlGroup[];
      values: PreviewValues;
    }
  | { kind: 'svg'; id: string; revision: number; svg: string | null }
  | { kind: 'error'; id: string; revision: number; error: string };
