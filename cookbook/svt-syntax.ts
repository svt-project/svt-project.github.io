import type { SyntaxNode, Tree } from '@lezer/common';

const svgNamespace = 'http://www.w3.org/2000/svg';
const svtNamespace = 'https://svt-project.github.io/ns/svt';
const hooks = new Set([
  'data-svt-version',
  'data-svt-text',
  'data-svt-image',
  'data-svt-fill',
  'data-svt-stroke',
  'data-svt-label',
]);
const metadata = new Set(['inputs', 'group', 'input', 'description']);

export function svtNames(tree: Tree, source: string): SyntaxNode[] {
  const scopes: Map<string, string>[] = [];
  const names: SyntaxNode[] = [];
  const read = (node: SyntaxNode) => source.slice(node.from, node.to);
  tree.iterate({
    enter(ref) {
      if (ref.name !== 'Element') return;
      const element = ref.node;
      const tag = element.firstChild;
      const name = tag?.getChild('TagName');
      let scope = scopes.at(-1) ?? new Map<string, string>();
      const attributes = tag?.getChildren('Attribute') ?? [];
      for (const attr of attributes) {
        const key = attr.getChild('AttributeName');
        const value = attr.getChild('AttributeValue');
        if (!key || !value) continue;
        const qualified = read(key);
        if (qualified === 'xmlns' || qualified.startsWith('xmlns:')) {
          if (scope === scopes.at(-1)) scope = new Map(scope);
          scope.set(qualified.slice(6), read(value).slice(1, -1));
        }
      }
      scopes.push(scope);
      if (!name) return;
      const qualified = read(name);
      const colon = qualified.indexOf(':');
      const uri = scope.get(colon < 0 ? '' : qualified.slice(0, colon));
      if (uri === svgNamespace) {
        for (const attr of attributes) {
          const key = attr.getChild('AttributeName');
          if (key && hooks.has(read(key))) names.push(key);
        }
      } else if (uri === svtNamespace && metadata.has(qualified.slice(colon + 1))) {
        names.push(name);
        const close = element.getChild('CloseTag')?.getChild('TagName');
        if (close && read(close) === qualified) names.push(close);
      }
    },
    leave(ref) {
      if (ref.name === 'Element') scopes.pop();
    },
  });
  return names.sort((a, b) => a.from - b.from);
}
