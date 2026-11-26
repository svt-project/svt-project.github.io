import type { InputGroup } from '@svt-project/svt-js';
import type { Exercise } from './guide-model.ts';
import type { PreviewRequest, PreviewResponse, PreviewValues } from './preview-messages.ts';
import { useEffect, useRef, useState } from 'react';
import { TemplateEditor } from './TemplateEditor.tsx';
import { PreviewImage } from './PreviewImage.tsx';
import { ExerciseControls } from './ExerciseControls.tsx';

export function LivePreview({
  exercise: { id, alt, title },
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
  const [inspectAttempt, setInspectAttempt] = useState(0);
  const [canRetry, setCanRetry] = useState(false);
  const [awaitingGroups, setAwaitingGroups] = useState(false);
  const hasDraft = useRef(false);
  const pending = useRef<number | undefined>(undefined);
  const revision = useRef(0);
  useEffect(() => {
    if (!worker) return;
    function receive({ data }: MessageEvent<PreviewResponse>) {
      if (data.id !== id || data.revision !== revision.current) return;
      if (data.kind === 'error') {
        setCanRetry(data.revision === 0);
        setError(
          hasDraft.current ? data.error + ' — showing the last valid preview.' : data.error,
        );
        return;
      }
      if (data.kind === 'groups') {
        setGroups(data.groups);
        setValues(data.values);
        setCustomSource(hasDraft.current);
        setAwaitingGroups(false);
      }
      if (data.kind === 'svg') {
        setError('');
        setUrl(
          data.svg === null
            ? null
            : URL.createObjectURL(new Blob([data.svg], { type: 'image/svg+xml' })),
        );
      }
    }
    function failed() {
      setCanRetry(false);
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
  }, [id, worker, inspectAttempt]);
  useEffect(
    () => () => {
      if (url) URL.revokeObjectURL(url);
    },
    [url],
  );

  function editSource(source: string | null) {
    if (!worker) return;
    window.clearTimeout(pending.current);
    hasDraft.current = source !== null;
    setAwaitingGroups(true);
    const request: PreviewRequest = {
      kind: 'edit',
      id,
      revision: ++revision.current,
      source,
      values,
    };
    pending.current = window.setTimeout(() => worker.postMessage(request), 200);
  }

  function retryInspection() {
    setError('');
    setCanRetry(false);
    setInspectAttempt((attempt) => attempt + 1);
  }

  return (
    <div className="bench">
      <PreviewImage
        key={inspectAttempt}
        src={url ?? `recipes/${id}.svg`}
        alt={alt}
        error={error}
        retry={canRetry ? retryInspection : undefined}
      />
      {groups && (
        <ExerciseControls
          title={title}
          groups={groups}
          awaitingGroups={awaitingGroups}
          values={values}
          customSource={customSource}
          submit={(next) => {
            setValues(next);
            worker?.postMessage({
              kind: 'bind',
              id,
              revision: ++revision.current,
              values: next,
            } satisfies PreviewRequest);
          }}
        >
          {!editorOpen && (
            <button type="button" onClick={() => setEditorOpen(true)}>
              Edit full template
            </button>
          )}
        </ExerciseControls>
      )}
      {editorOpen && <TemplateEditor id={id} title={title} onChange={editSource} />}
    </div>
  );
}
