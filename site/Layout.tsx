import type { ReactNode } from 'react';
import { FiExternalLink } from 'react-icons/fi';

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

const siteOrigin = 'https://svt-project.github.io';
const specification = 'https://github.com/svt-project/svt-spec/tree/v1.0.0-rc.1/spec/README.md';
const menu = [
  { href: '/', label: 'Home' },
  { href: '/cookbook/', label: 'Authoring Guide' },
  { href: '/icons/', label: 'Icons' },
  { href: '/ns/svt/', label: 'Namespace' },
  { href: specification, label: 'Specification' },
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

function MenuLink({ href, label, current }: { href: string; label: string; current: boolean }) {
  const external = new URL(href, siteOrigin).origin !== siteOrigin;
  return (
    <a
      href={href}
      aria-current={current ? 'page' : undefined}
      rel={external ? 'external' : undefined}
    >
      {label}
      {external && <FiExternalLink aria-label="External link" role="img" focusable="false" />}
    </a>
  );
}

function SiteMenu({ path, includeGuide }: NavigationProps) {
  return (
    <nav aria-label="Main navigation">
      {menu
        .filter((link) => includeGuide || link.href !== '/cookbook/')
        .map(({ href, label }) => (
          <MenuLink key={href} href={href} label={label} current={href === path} />
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
        <link rel="canonical" href={siteOrigin + canonical} />
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
