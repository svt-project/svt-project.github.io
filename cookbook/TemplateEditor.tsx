import { useEffect, useEffectEvent, useRef, useState } from 'react';
import type { mountEditor } from './editor.ts';

export function TemplateEditor({
  id,
  title,
  onChange,
}: {
  id: string;
  title: string;
  onChange: (source: string | null) => void;
}) {
  const host = useRef<HTMLDivElement>(null);
  const editor = useRef<ReturnType<typeof mountEditor> | null>(null);
  const [opened, setOpened] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState('');
  const changed = useEffectEvent(onChange);

  useEffect(() => {
    const parent = host.current;
    if (!opened || !parent) return;
    const controller = new AbortController();
    async function start(parent: HTMLDivElement) {
      const [module, response] = await Promise.all([
        import('./editor.ts'),
        fetch(`recipes/${id}.svg`, { signal: controller.signal }),
      ]);
      if (!response.ok) throw new Error('Could not load the template.');
      const source = await response.text();
      if (controller.signal.aborted) return;
      editor.current = module.mountEditor(parent, source, title + ' template source', changed);
      setReady(true);
    }
    setError('');
    start(parent).catch(() => {
      if (!controller.signal.aborted) setError('Could not open the template editor.');
    });
    return () => {
      controller.abort();
      editor.current?.destroy();
      editor.current = null;
    };
  }, [opened, id, title, attempt]);

  return (
    <details
      className="template-editor"
      onToggle={(event) => {
        if (event.currentTarget.open) setOpened(true);
      }}
    >
      <summary>Edit full template</summary>
      <div className="editor-tools">
        <span>Edits update the preview and form.</span>
        {ready && (
          <button type="button" onClick={() => editor.current?.restore()}>
            Restore template
          </button>
        )}
      </div>
      {!ready && (
        <p role="status">
          {error || 'Loading editor…'}{' '}
          {error && (
            <button type="button" onClick={() => setAttempt(attempt + 1)}>
              Retry
            </button>
          )}
        </p>
      )}
      <div ref={host} />
    </details>
  );
}
