import {
  interpretImage,
  interpretPaint,
  type InputGroup,
  type TemplateInput,
} from '@svt-project/svt-js';
import type { ControlGroup, ControlInput } from './preview-messages.ts';

function artworkLabel(input: TemplateInput): string {
  if (input.default.state === 'mixed') return 'Template artwork · multiple values';
  const target = input.targets[0];
  if (!target) return 'Template artwork';
  const result = interpretImage(target);
  switch (result.kind) {
    case 'absent':
      return 'Template artwork · no reference';
    case 'empty':
      return 'Template artwork · empty reference';
    case 'fragment-reference':
      return 'Template artwork · fragment reference';
    case 'relative-reference':
      return 'Template artwork · relative reference';
    case 'absolute-reference':
      return 'Template artwork · absolute reference';
    case 'data-uri':
      return result.declaredMediaType
        ? 'Embedded artwork · ' + result.declaredMediaType
        : 'Embedded artwork';
    case 'unsupported-or-unrecognized':
      return 'Template artwork';
  }
}

function controlInput(input: TemplateInput): ControlInput {
  const { key, label, labelSource, description } = input;
  const field = { key, label, labelSource, description };
  if (input.kind === 'image') return { ...field, kind: 'image', artworkLabel: artworkLabel(input) };
  if (input.kind === 'text') return { ...field, kind: 'text', default: input.default };
  // Common is a raw-value guarantee. Different spellings remain mixed even if their swatches match.
  const target = input.targets[0];
  const paint = target && input.default.state === 'common' ? interpretPaint(target) : null;
  let pickerValue: string | null = null;
  if (paint?.kind === 'literal' && paint.color.alpha === 1) {
    const { red, green, blue } = paint.color;
    pickerValue =
      '#' +
      [red, green, blue]
        .map((channel) =>
          Math.round(channel * 255)
            .toString(16)
            .padStart(2, '0'),
        )
        .join('');
  }
  return { ...field, kind: 'paint', default: input.default, pickerValue };
}

export function controlGroups(groups: readonly InputGroup[]): ControlGroup[] {
  return groups.map(({ inputs, ...group }) => ({ ...group, inputs: inputs.map(controlInput) }));
}
