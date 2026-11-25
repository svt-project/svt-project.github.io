import { renderToString } from 'react-dom/server';
import { SiteLayout } from './Layout.tsx';
import { HomePage } from './pages/Home.tsx';
import { NamespacePage } from './pages/Namespace.tsx';
import { IconsPage } from './pages/Icons.tsx';
import type { ReactNode } from 'react';
import type { PageMetadata } from './Layout.tsx';
import { mkdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

interface SitePage extends PageMetadata {
  content: ReactNode;
}

export async function writePages(destination: string, guide?: SitePage) {
  const pages: SitePage[] = [
    {
      path: '/',
      title: 'SVT — Scalable Vector Templates',
      description:
        'Named text, paint and image inputs in ordinary SVG. Discover the specification, JavaScript and .NET implementations, and project icons.',
      content: <HomePage />,
    },
    {
      path: '/ns/svt/',
      canonical: '/ns/svt',
      title: 'SVT XML namespace',
      description:
        'Reference page for the SVT metadata namespace: https://svt-project.github.io/ns/svt.',
      content: <NamespacePage />,
    },
    {
      path: '/icons/',
      title: 'SVT icons',
      description:
        'Download CC0 SVT logos, avatars and desktop and transparent UI file icons. No attribution required.',
      content: <IconsPage />,
    },
  ];
  if (guide) pages.push(guide);
  for (const { content, ...page } of pages) {
    const directory = join(destination, page.path);
    await mkdir(directory, { recursive: true });
    const html = renderToString(
      <SiteLayout {...page} includeGuide={guide !== undefined}>
        {content}
      </SiteLayout>,
    );
    await writeFile(join(directory, 'index.html'), '<!doctype html>\n' + html + '\n');
  }
}
