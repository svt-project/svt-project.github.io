import { hydrateRoot } from 'react-dom/client';
import { Guide } from './Guide.tsx';
import type { GuideGroup } from './guide-model.ts';

// The cookbook build embeds the same prepared groups used to render the static HTML.
declare const COOKBOOK_GROUPS: readonly GuideGroup[];
const root = document.getElementById('guide');
if (!root) throw new Error('Missing cookbook root element.');
hydrateRoot(root, <Guide groups={COOKBOOK_GROUPS} />);
