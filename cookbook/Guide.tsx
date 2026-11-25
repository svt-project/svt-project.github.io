import type { Exercise, GuideGroup } from './guide-model.ts';
import { PageIntro } from '../site/PageIntro.tsx';
import { useState, useEffect } from 'react';
import { GuideContents, LinkedHeading } from './GuideNavigation.tsx';
import { LivePreview } from './LivePreview.tsx';

function SourceExcerpt({ id, snippet }: Pick<Exercise, 'id' | 'snippet'>) {
  return (
    <div className="source">
      <div>
        <strong>SVT excerpt</strong>
        <a href={`recipes/${id}.svg`} download>
          Download template
        </a>
      </div>
      <pre>
        <code>{snippet}</code>
      </pre>
    </div>
  );
}

function GuideExercise({ exercise, worker }: { exercise: Exercise; worker: Worker | null }) {
  const { id, title, note, lesson, snippet } = exercise;
  return (
    <article data-exercise={id}>
      <LinkedHeading as="h3" id={id} title={title} interactive={!!worker} />
      <p>{note}</p>
      <LivePreview exercise={exercise} worker={worker} />
      <p className="lesson">{lesson}</p>
      <SourceExcerpt id={id} snippet={snippet} />
    </article>
  );
}

export function Guide({ groups }: { groups: readonly GuideGroup[] }) {
  const [worker, setWorker] = useState<Worker | null>(null);
  useEffect(() => {
    const instance = new Worker(new URL('./worker.js', document.baseURI), { type: 'module' });
    setWorker(instance);
    return () => instance.terminate();
  }, []);
  return (
    <div className="layout wrap">
      <GuideContents groups={groups} />
      <main id="main">
        <PageIntro title="SVG authoring guide">
          Build template-friendly artwork. Experiment with coastal labels, illustrations, and maps,
          then take the SVG into your own editor.
        </PageIntro>
        <noscript>
          Enable JavaScript to edit the live specimens. Each template and its authored preview are
          available below.
        </noscript>
        {groups.map(({ name, exercises }) => (
          <section key={name}>
            <LinkedHeading as="h2" id={name.toLowerCase()} title={name} interactive={!!worker} />
            {exercises.map((exercise) => (
              <GuideExercise key={exercise.id} exercise={exercise} worker={worker} />
            ))}
          </section>
        ))}
      </main>
    </div>
  );
}
