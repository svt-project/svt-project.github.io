import type { SyntaxNode, Tree } from '@lezer/common';
import { parser } from '@lezer/xml';
import { classHighlighter, highlightTree } from '@lezer/highlight';
import { svtNames } from '../cookbook/svt-syntax.ts';
import type { ExcerptSelector, SourceToken } from '../cookbook/guide-model.ts';

function tagName(element: SyntaxNode, source: string) {
  const name = element.firstChild?.getChild('TagName');
  return name && source.slice(name.from, name.to);
}

function matches(element: SyntaxNode, source: string, selector: ExcerptSelector) {
  const name = tagName(element, source);
  if (typeof selector === 'string') return name === selector;
  if (selector.element && selector.element !== name) return false;
  if ('child' in selector)
    return element
      .getChildren('Element')
      .some((child) => tagName(child, source) === selector.child);
  return element.firstChild?.getChildren('Attribute').some((attr) => {
    const key = attr.getChild('AttributeName');
    return key && source.slice(key.from, key.to) === selector.attribute;
  });
}

// Only change separators in opening tags. Whitespace in values and between
// text spans is part of the template and can affect its rendered output.
function formatAttributes(source: string) {
  const parts: string[] = [];
  let position = 0;
  let depth = -1;
  parser.parse(source).iterate({
    enter(ref) {
      if (ref.type.isError) throw new Error(`Malformed recipe XML at offset ${ref.from}.`);
      if (ref.name === 'Element') depth++;
      if (ref.name !== 'OpenTag' && ref.name !== 'SelfClosingTag') return;
      const attrs = ref.node.getChildren('Attribute');
      const name = ref.node.getChild('TagName');
      const end = ref.node.lastChild;
      if (!name || !end || !attrs.length) return;
      const attributes = attrs.map((attr) => source.slice(attr.from, attr.to));
      const headerWidth = depth * 2 + (name.to - ref.from) + (end.to - end.from);
      const width = attributes.reduce((sum, text) => sum + 1 + text.length, headerWidth);
      const separator = width > 92 ? '\n' + ' '.repeat(depth * 2 + 2) : ' ';
      parts.push(source.slice(position, name.to), separator, attributes.join(separator));
      position = end.from;
    },
    leave(ref) {
      if (ref.name === 'Element') depth--;
    },
  });
  parts.push(source.slice(position));
  return parts.join('');
}

function selectElements(tree: Tree, source: string, selectors: readonly ExcerptSelector[]) {
  const roots: SyntaxNode[] = [];
  const unmatched = new Set(selectors);
  tree.iterate({
    enter(ref) {
      if (ref.name !== 'Element') return;
      const element = ref.node;
      for (const selector of selectors) {
        if (!matches(element, source, selector)) continue;
        unmatched.delete(selector);
        if (element.from >= (roots.at(-1)?.to ?? 0)) roots.push(element);
      }
    },
  });
  if (!roots.length || unmatched.size)
    throw new Error('Unmatched XML excerpt selectors: ' + JSON.stringify([...unmatched]));
  return roots;
}

export function prepareSource(
  authored: string,
  selectors: readonly ExcerptSelector[],
  imagePath: string,
) {
  const formatted = formatAttributes(authored);
  const tree = parser.parse(formatted);
  const semantic = new Set(svtNames(tree, formatted).map((name) => name.from));
  const snippet: SourceToken[] = [];

  function highlight(start: number, end: number) {
    if (start >= end) return;
    let cursor = start;
    highlightTree(
      tree,
      classHighlighter,
      (from, to, style) => {
        if (from > cursor) snippet.push([formatted.slice(cursor, from)]);
        const text = formatted.slice(from, to).replaceAll(imagePath, '…');
        snippet.push([text, semantic.has(from) ? 'svt-name' : style]);
        cursor = to;
      },
      start,
      end,
    );
    if (cursor < end) snippet.push([formatted.slice(cursor, end)]);
  }

  for (const root of selectElements(tree, formatted, selectors)) {
    if (snippet.length) snippet.push(['\n']);
    const rootLine = formatted.lastIndexOf('\n', root.from - 1) + 1;
    const prefix = formatted.slice(rootLine, root.from);
    const outerIndent = /^[ \t]+$/.test(prefix) ? prefix : '';
    let position = root.from;
    let depth = -1;
    root.cursor().iterate(
      (node) => {
        if (node.name === 'Element') depth++;
        const opening = node.name === 'OpenTag' || node.name === 'SelfClosingTag';
        const closesContainer = node.name === 'CloseTag' && node.node.parent?.getChild('Element');
        if (!opening && !closesContainer && node.name !== 'Attribute') return;
        if (node.from === root.from) return;
        const lineStart = formatted.lastIndexOf('\n', node.from - 1) + 1;
        const indent = ' '.repeat(2 * (node.name === 'Attribute' ? depth + 1 : depth));
        if (lineStart > position && !formatted.slice(lineStart, node.from).trim()) {
          // Only attribute separators are markup. Before a child or closing tag,
          // the authored indentation is character data and stays in the excerpt.
          if (node.name === 'Attribute') {
            highlight(position, lineStart);
            snippet.push([indent]);
          } else if (outerIndent && formatted.startsWith(outerIndent, lineStart)) {
            // Remove the enclosing element's indentation visually, leaving its
            // bytes selectable along with the rest of the excerpt.
            highlight(position, lineStart);
            snippet.push([outerIndent, 'source-outer-indent']);
            highlight(lineStart + outerIndent.length, node.from);
          } else return;
        } else if (opening || closesContainer) {
          highlight(position, node.from);
          // Visual only: copying adjacent SVG text spans must preserve their spacing.
          snippet.push([null, '\n' + indent]);
        } else return;
        position = node.from;
      },
      (node) => {
        if (node.name === 'Element') depth--;
      },
    );
    highlight(position, root.to);
  }
  return { formatted, snippet };
}
