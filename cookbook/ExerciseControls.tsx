import { useId, type ReactNode } from 'react';
import { FiRotateCcw } from 'react-icons/fi';
import type { InputGroup, TemplateInput } from '@svt-project/svt-js';
import type { PreviewValues } from './preview-messages.ts';

const paintPresets = new Map([
  ['#ae4b32', 'Clay'],
  ['#1d655c', 'Sea green'],
  ['#60518a', 'Iris'],
]);
const hexColor = /^#[0-9a-f]{6}$/i;

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
    const showAuthored = customSource || input.default.state !== 'common';
    field = (
      <select
        id={fieldId}
        aria-describedby={helpId}
        value={value ?? (showAuthored ? '' : 'headland')}
        onChange={(e) => onChange(e.target.value || undefined)}
      >
        {showAuthored && <option value="">Template artwork</option>}
        <option value="headland">Headland · landscape</option>
        <option value="beacon">Beacon · portrait</option>
      </select>
    );
  } else if (input.kind === 'paint' && input.default.state !== 'common') {
    const hasCustomPaint = value !== undefined && !paintPresets.has(value);
    // An explicitly empty paint still overrides the authored colors.
    const authoredOption = value === '' ? 'authored' : '';
    field = (
      <select
        id={fieldId}
        aria-describedby={helpId}
        value={value ?? authoredOption}
        onChange={(e) => onChange(e.target.value === authoredOption ? undefined : e.target.value)}
      >
        <option value={authoredOption}>Authored colors</option>
        {Array.from(paintPresets, ([paint, name]) => (
          <option key={paint} value={paint}>
            {name}
          </option>
        ))}
        {hasCustomPaint && <option value={value}>{value || 'Empty value'}</option>}
      </select>
    );
  } else {
    field = (
      <input
        id={fieldId}
        aria-describedby={helpId}
        type={
          input.kind === 'paint' &&
          hexColor.test(input.default.raw ?? '') &&
          (value === undefined || hexColor.test(value))
            ? 'color'
            : 'text'
        }
        placeholder={
          input.default.state === 'mixed' && value === undefined
            ? 'Multiple template values'
            : undefined
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

function ResetValuesButton() {
  return (
    <button type="reset" className="reset-values" aria-label="Reset values" title="Reset values">
      <FiRotateCcw aria-hidden="true" focusable="false" />
    </button>
  );
}

export function ExerciseControls({
  children,
  title,
  groups,
  awaitingGroups,
  customSource,
  values,
  submit,
}: {
  children?: ReactNode;
  title: string;
  groups: readonly InputGroup[];
  awaitingGroups: boolean;
  customSource: boolean;
  values: PreviewValues;
  submit: (values: PreviewValues) => void;
}) {
  function change(input: TemplateInput, value: string | undefined) {
    const next = new Map(Object.entries(values));
    if (value === undefined) next.delete(input.key);
    else next.set(input.key, { kind: input.kind, value });
    submit(Object.fromEntries(next));
  }
  return (
    <form
      inert={awaitingGroups}
      aria-label={title + ' controls'}
      onSubmit={(e) => e.preventDefault()}
      onReset={(e) => {
        e.preventDefault();
        submit({});
      }}
    >
      {groups.map((group) => (
        <FormGroup group={group} key={group.key ?? ''}>
          {group.inputs.map((input) => (
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
      <div className="form-actions">
        {children}
        <ResetValuesButton />
      </div>
    </form>
  );
}
