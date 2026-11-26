import type { Exercise, GuideGroup } from './guide-model.ts';
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

function RecipeParagraph({ children, className }: { children: string; className?: string }) {
  return (
    <p className={className}>
      {children
        .split(/`([^`\n]+)`/u)
        .map((part, index) => (index % 2 === 1 ? <code key={index}>{part}</code> : part))}
    </p>
  );
}

function GuideExercise({ exercise, worker }: { exercise: Exercise; worker: Worker | null }) {
  const { id, title, note, lesson, snippet } = exercise;
  return (
    <article data-exercise={id}>
      <LinkedHeading as="h3" id={id} title={title} interactive={!!worker} />
      <RecipeParagraph>{note}</RecipeParagraph>
      <LivePreview exercise={exercise} worker={worker} />
      <RecipeParagraph className="lesson">{lesson}</RecipeParagraph>
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
        <h1>SVG authoring guide</h1>
        <section aria-labelledby="overview">
          <LinkedHeading as="h2" id="overview" title="Overview" interactive={!!worker} />
          <p className="intro">
            SVT makes text, colors, and images editable through named inputs. This guide shows how to
            pair those inputs with built-in SVG features so labels stay centered as they grow and
            replacement images fit their frames.
          </p>
        </section>
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
