import type { InputGroup } from '@svt-project/svt-js';
import type { Exercise } from './guide-model.ts';
import type { PreviewRequest, PreviewResponse, PreviewValues } from './preview-messages.ts';
import { useEffect, useRef, useState } from 'react';
import { ExerciseControls } from './ExerciseControls.tsx';

export function LivePreview({
  exercise: { id, alt, title, linkedImages = [] },
  worker,
}: {
  exercise: Exercise;
  worker: Worker | null;
}) {
  const [groups, setGroups] = useState<readonly InputGroup[] | null>(null);
  const [values, setValues] = useState<PreviewValues>({});
  const [url, setUrl] = useState<string | null>(null);
  const [error, setError] = useState('');
  const revision = useRef(0);
  useEffect(() => {
    if (!worker) return;
    function receive({ data }: MessageEvent<PreviewResponse>) {
      if (
        data.id !== id ||
        ('revision' in data && data.revision !== null && data.revision !== revision.current)
      )
        return;
      setError(data.kind === 'error' ? data.error : '');
      if (data.kind === 'groups') setGroups(data.groups);
      if (data.kind === 'svg')
        setUrl(URL.createObjectURL(new Blob([data.svg], { type: 'image/svg+xml' })));
    }
    function failed() {
      setGroups(null);
      setError('The live preview stopped. Reload the guide to try again.');
    }
    worker.addEventListener('message', receive);
    worker.addEventListener('error', failed);
    worker.postMessage({ kind: 'inspect', id } satisfies PreviewRequest);
    return () => {
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

  function submit(next: PreviewValues) {
    if (!worker) return;
    setValues(next);
    worker.postMessage({
      kind: 'bind',
      id,
      revision: ++revision.current,
      values: next,
    } satisfies PreviewRequest);
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
          submit={submit}
        />
      )}
      <p className="status" role="status">
        {error}
      </p>
    </div>
  );
}
