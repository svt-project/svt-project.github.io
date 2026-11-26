import { useId, type ReactNode } from 'react';
import type { InputGroup, TemplateInput } from '@svt-project/svt-js';
import type { PreviewValues } from './preview-messages.ts';

function BindingField({
  input,
  customSource,
  value,
  onChange,
}: {
  input: TemplateInput;
  customSource: boolean;
  value: string | undefined;
  onChange: (value: string | undefined) => void;
}) {
  const fieldId = useId();
  const helpId = input.description ? fieldId + '-help' : undefined;
  const label =
    input.labelSource === 'key'
      ? input.label.charAt(0).toUpperCase() + input.label.slice(1)
      : input.label;
  let field;
  if (input.kind === 'image') {
    field = (
      <select
        id={fieldId}
        aria-describedby={helpId}
        value={value ?? (customSource ? '' : 'headland')}
        onChange={(e) => onChange(e.target.value || undefined)}
      >
        {customSource && <option value="">Template artwork</option>}
        <option value="headland">Headland · landscape</option>
        <option value="beacon">Beacon · portrait</option>
      </select>
    );
  } else if (input.kind === 'paint' && input.default.state !== 'common') {
    field = (
      <select
        id={fieldId}
        aria-describedby={helpId}
        value={value ?? ''}
        onChange={(e) => onChange(e.target.value || undefined)}
      >
        <option value="">Authored colors</option>
        <option value="#ae4b32">Clay</option>
        <option value="#1d655c">Sea green</option>
        <option value="#60518a">Iris</option>
      </select>
    );
  } else {
    field = (
      <input
        id={fieldId}
        aria-describedby={helpId}
        type={
          input.kind === 'paint' && /^#[0-9a-f]{6}$/i.test(input.default.raw ?? '')
            ? 'color'
            : 'text'
        }
        value={value ?? input.default.raw ?? ''}
        onChange={(e) => onChange(e.target.value)}
      />
    );
  }
  return (
    <div className="binding-field">
      <label htmlFor={fieldId}>{label}</label>
      {field}
      {input.description && (
        <p className="field-help" id={helpId}>
          {input.description}
        </p>
      )}
    </div>
  );
}

function FormGroup({ group, children }: { group: InputGroup; children: ReactNode }) {
  const helpId = useId();
  if (group.key === null) return <>{children}</>;
  return (
    <fieldset aria-describedby={group.description ? helpId : undefined}>
      <legend>{group.label ?? group.key}</legend>
      {group.description && (
        <p className="field-help" id={helpId}>
          {group.description}
        </p>
      )}
      <div className="group-fields">{children}</div>
    </fieldset>
  );
}

export function ExerciseControls({
  title,
  groups,
  linkedImages,
  customSource,
  values,
  submit,
}: {
  title: string;
  groups: readonly InputGroup[];
  linkedImages: readonly string[];
  customSource: boolean;
  values: PreviewValues;
  submit: (values: PreviewValues) => void;
}) {
  function change(input: TemplateInput, value: string | undefined) {
    const next = new Map(Object.entries(values));
    for (const key of linkedImages.includes(input.key) ? linkedImages : [input.key]) {
      if (value === undefined) next.delete(key);
      else next.set(key, { kind: input.kind, value });
    }
    submit(Object.fromEntries(next));
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
      {groups.map((group) => (
        <FormGroup group={group} key={group.key ?? ''}>
          {group.inputs
            .filter((input) => !linkedImages.includes(input.key) || input.key === linkedImages[0])
            .map((input) => (
              <BindingField
                key={input.key}
                input={input}
                customSource={customSource}
                value={values[input.key]?.value}
                onChange={(value) => change(input, value)}
              />
            ))}
        </FormGroup>
      ))}
      <button type="reset">Restore authored values</button>
    </form>
  );
}
