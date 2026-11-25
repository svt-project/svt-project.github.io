import type { ReactNode } from 'react';

interface NavigationProps {
  path: string;
  includeGuide: boolean;
}

export interface PageMetadata {
  path: string;
  canonical?: string;
  title: string;
  description: string;
  head?: ReactNode;
}

const specification = 'https://github.com/svt-project/svt-spec/tree/v1.0.0-rc.1/spec/README.md';
const menu = [
  { href: specification, label: 'Specification' },
  { href: '/cookbook/', label: 'Authoring Guide' },
  { href: '/icons/', label: 'Icons' },
  { href: '/ns/svt/', label: 'Namespace' },
  { href: 'https://github.com/svt-project', label: 'GitHub' },
];

function BrandLink({ current }: { current: boolean }) {
  return (
    <a className="brand" href="/" aria-label="SVT home" aria-current={current ? 'page' : undefined}>
      <img src="/assets/icons/svg/svt-mark-32-light.svg" alt="" width="42" height="42" />
      SVT
    </a>
  );
}

function SiteMenu({ path, includeGuide }: NavigationProps) {
  return (
    <nav aria-label="Main navigation">
      {menu
        .filter((link) => includeGuide || link.href !== '/cookbook/')
        .map(({ href, label }) => (
          <a key={href} href={href} aria-current={href === path ? 'page' : undefined}>
            {label}
          </a>
        ))}
    </nav>
  );
}

function SiteBanner({ path, includeGuide }: NavigationProps) {
  return (
    <header>
      <div className="wrap">
        <BrandLink current={path === '/'} />
        <SiteMenu path={path} includeGuide={includeGuide} />
      </div>
    </header>
  );
}

function SiteFooter() {
  return (
    <footer>
      <div className="wrap">
        <p>Scalable Vector Templates · Founded by Bathos Pty Ltd</p>
        <p>
          <a href="/ns/svt">Namespace reference</a> ·{' '}
          <a href="https://github.com/svt-project/svt-project.github.io">Site source</a>
        </p>
      </div>
    </footer>
  );
}

export function SiteLayout({
  path,
  canonical = path,
  title,
  description,
  includeGuide,
  head,
  children,
}: PageMetadata & NavigationProps & { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width,initial-scale=1" />
        <title>{title}</title>
        <meta name="description" content={description} />
        <link rel="canonical" href={'https://svt-project.github.io' + canonical} />
        <link rel="icon" type="image/svg+xml" href="/assets/icons/svg/svt-avatar-32-light.svg" />
        <link rel="stylesheet" href="/styles.css" />
        {head}
      </head>
      <body>
        <a className="skip" href="#main">
          Skip to content
        </a>
        <SiteBanner path={path} includeGuide={includeGuide} />
        {children}
        <SiteFooter />
      </body>
    </html>
  );
}
