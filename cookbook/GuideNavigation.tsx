import type { GuideGroup } from './guide-model.ts';
import { FiLink } from 'react-icons/fi';
import { useEffect, useRef, useState } from 'react';

export function GuideContents({ groups }: { groups: readonly GuideGroup[] }) {
  const details = useRef<HTMLDetailsElement>(null);
  const [hash, setHash] = useState('');
  useEffect(() => {
    const menu = details.current;
    if (!menu) return;
    const narrow = matchMedia('(max-width: 740px)');
    const size = () => {
      menu.open = !narrow.matches;
    };
    const highlight = () => setHash(location.hash);
    size();
    highlight();
    narrow.addEventListener('change', size);
    window.addEventListener('hashchange', highlight);
    return () => {
      narrow.removeEventListener('change', size);
      window.removeEventListener('hashchange', highlight);
    };
  }, []);
  function link(id: string, title: string, className?: string) {
    return (
      <a
        href={'#' + id}
        className={className}
        aria-current={hash === '#' + id ? 'location' : undefined}
        onClick={() => {
          if (details.current && matchMedia('(max-width: 740px)').matches)
            details.current.open = false;
        }}
      >
        {title}
      </a>
    );
  }
  return (
    <aside>
      <details open ref={details}>
        <summary>Contents</summary>
        <nav aria-label="Guide contents">
          {groups.map(({ name, exercises }) => (
            <div key={name}>
              {link(name.toLowerCase(), name, 'group-link')}
              <ul>
                {exercises.map(({ id, title }: { id: string; title: string }) => (
                  <li key={id}>{link(id, title)}</li>
                ))}
              </ul>
            </div>
          ))}
        </nav>
      </details>
    </aside>
  );
}

function CopyLink({ id, title }: { id: string; title: string }) {
  const [feedback, setFeedback] = useState('');
  const timeout = useRef<number>(undefined);
  useEffect(() => () => clearTimeout(timeout.current), []);
  async function copy() {
    const url = new URL(location.href);
    url.hash = id;
    try {
      await navigator.clipboard.writeText(url.href);
      setFeedback('Copied');
      clearTimeout(timeout.current);
      timeout.current = window.setTimeout(() => setFeedback(''), 1500);
    } catch {
      location.hash = id;
      setFeedback('Copy address from browser');
    }
  }
  return (
    <button
      className="copy"
      aria-label={'Copy link to ' + title}
      title={'Copy link to ' + title}
      onClick={copy}
    >
      <FiLink aria-hidden="true" focusable="false" />
      <span role="status">{feedback}</span>
    </button>
  );
}

export function LinkedHeading({
  as: Heading,
  id,
  title,
  interactive,
}: {
  as: 'h2' | 'h3';
  id: string;
  title: string;
  interactive: boolean;
}) {
  return (
    <Heading id={id}>
      {title}
      {interactive && <CopyLink id={id} title={title} />}
    </Heading>
  );
}
