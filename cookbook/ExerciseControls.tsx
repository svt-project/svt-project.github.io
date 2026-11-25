import type { TemplateInput } from '@svt-project/svt-js';
import type { PreviewValues } from './preview-messages.ts';

function BindingField({
  input,
  value,
  onChange,
}: {
  input: TemplateInput;
  value: string | undefined;
  onChange: (value: string | undefined) => void;
}) {
  const label =
    input.kind === 'image'
      ? 'Illustration'
      : input.label.charAt(0).toUpperCase() + input.label.slice(1);
  let field;
  if (input.kind === 'image') {
    field = (
      <select value={value ?? 'headland'} onChange={(e) => onChange(e.target.value)}>
        <option value="headland">Headland · landscape</option>
        <option value="beacon">Beacon · portrait</option>
      </select>
    );
  } else if (input.kind === 'paint' && input.default.state !== 'common') {
    field = (
      <select value={value ?? ''} onChange={(e) => onChange(e.target.value || undefined)}>
        <option value="">Authored colors</option>
        <option value="#ae4b32">Clay</option>
        <option value="#1d655c">Sea green</option>
        <option value="#60518a">Iris</option>
      </select>
    );
  } else {
    field = (
      <input
        type={input.kind === 'paint' ? 'color' : 'text'}
        value={value ?? input.default.raw ?? ''}
        onChange={(e) => onChange(e.target.value)}
      />
    );
  }
  return (
    <label>
      {label}
      {field}
    </label>
  );
}

export function ExerciseControls({
  title,
  inputs,
  values,
  submit,
}: {
  title: string;
  inputs: readonly TemplateInput[];
  values: PreviewValues;
  submit: (values: PreviewValues) => void;
}) {
  const images = inputs.filter((input) => input.kind === 'image');
  function change(input: TemplateInput, value: string | undefined) {
    const next = { ...values };
    for (const target of input.kind === 'image' ? images : [input]) {
      if (value === undefined) delete next[target.key];
      else next[target.key] = value;
    }
    submit(next);
  }
  return (
    <form
      aria-label={title + ' controls'}
      onSubmit={(e) => e.preventDefault()}
      onReset={(e) => {
        e.preventDefault();
        submit({});
      }}
    >
      {inputs
        .filter((input) => input.kind !== 'image' || input === images[0])
        .map((input) => (
          <BindingField
            key={input.key}
            input={input}
            value={values[input.key]}
            onChange={(value) => change(input, value)}
          />
        ))}
      <button type="reset">Restore authored values</button>
    </form>
  );
}
