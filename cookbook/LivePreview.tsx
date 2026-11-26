import type { InputGroup } from '@svt-project/svt-js';
import type { Exercise } from './guide-model.ts';
import type { PreviewRequest, PreviewResponse, PreviewValues } from './preview-messages.ts';
import { useEffect, useRef, useState } from 'react';
import { TemplateEditor } from './TemplateEditor.tsx';
import { ExerciseControls } from './ExerciseControls.tsx';

export function LivePreview({
  exercise: { id, alt, title, editable, linkedImages = [] },
  worker,
}: {
  exercise: Exercise;
  worker: Worker | null;
}) {
  const [groups, setGroups] = useState<readonly InputGroup[] | null>(null);
  const [values, setValues] = useState<PreviewValues>({});
  const [url, setUrl] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [editorOpen, setEditorOpen] = useState(false);
  const [customSource, setCustomSource] = useState(false);
  const draft = useRef<string | null>(null);
  const pending = useRef<number | undefined>(undefined);
  const revision = useRef(0);
  useEffect(() => {
    if (!worker) return;
    function receive({ data }: MessageEvent<PreviewResponse>) {
      const responseRevision = data.kind === 'groups' ? 0 : (data.revision ?? 0);
      if (data.id !== id || responseRevision !== revision.current) return;
      if (data.kind === 'error') {
        setError(
          draft.current === null ? data.error : 'Showing the last valid preview. ' + data.error,
        );
        return;
      }
      setError('');
      if (data.kind === 'groups') setGroups(data.groups);
      if (data.kind === 'svg') {
        if (data.edited) {
          setGroups(data.edited.groups);
          setValues(data.edited.values);
          setCustomSource(draft.current !== null);
        }
        setUrl(
          data.svg === null
            ? null
            : URL.createObjectURL(new Blob([data.svg], { type: 'image/svg+xml' })),
        );
      }
    }
    function failed() {
      setGroups(null);
      setError('The live preview stopped. Reload the guide to try again.');
    }
    worker.addEventListener('message', receive);
    worker.addEventListener('error', failed);
    worker.postMessage({ kind: 'inspect', id } satisfies PreviewRequest);
    return () => {
      window.clearTimeout(pending.current);
      worker.removeEventListener('message', receive);
      worker.removeEventListener('error', failed);
    };
  }, [id, worker]);
  useEffect(
    () => () => {
      if (url) URL.revokeObjectURL(url);
    },
    [url],
  );

  function requestPreview(next: PreviewValues, editing = false) {
    if (!worker) return;
    window.clearTimeout(pending.current);
    const source = draft.current;
    const update = { id, revision: ++revision.current, values: next };
    const request: PreviewRequest = editable
      ? { kind: 'edit', source, ...update }
      : { kind: 'bind', ...update };
    if (editing) pending.current = window.setTimeout(() => worker.postMessage(request), 200);
    else worker.postMessage(request);
  }

  return (
    <div className="bench">
      <img className="specimen" src={url ?? `recipes/${id}.svg`} alt={alt} />
      {groups && (
        <ExerciseControls
          title={title}
          groups={groups}
          linkedImages={linkedImages}
          values={values}
          customSource={customSource}
          submit={(next) => {
            setValues(next);
            requestPreview(next);
          }}
        >
          {editable && !editorOpen && (
            <button type="button" onClick={() => setEditorOpen(true)}>
              Edit full template
            </button>
          )}
        </ExerciseControls>
      )}
      {editorOpen && (
        <TemplateEditor
          id={id}
          title={title}
          onChange={(source) => {
            draft.current = source;
            requestPreview(values, true);
          }}
        />
      )}
      <p className="status" role="status">
        {error}
      </p>
    </div>
  );
}
