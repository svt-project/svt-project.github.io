import type { Tree } from '@lezer/common';
import { parser } from '@lezer/xml';
import { classHighlighter, highlightTree } from '@lezer/highlight';
import { svtNames } from '../cookbook/svt-syntax.ts';
import type { SourceToken } from '../cookbook/guide-model.ts';

interface LineBreak {
  from: number;
  to: number;
  indent: number;
  kind: 'element' | 'attribute';
}

// Inserting whitespace between adjacent elements can move SVG glyphs. Element
// breaks belong to the presentation. Attribute breaks are safe in the XML.
function tagBreaks(tree: Tree, source: string) {
  const breaks: LineBreak[] = [];
  let depth = -1;
  tree.iterate({
    enter(ref) {
      if (ref.name === 'Element') depth++;
      const opening = ref.name === 'OpenTag' || ref.name === 'SelfClosingTag';
      const closesContainer = ref.name === 'CloseTag' && ref.node.parent?.getChild('Element');
      if (!opening && !closesContainer) return;
      const indent = depth * 2;
      const lineStart = source.lastIndexOf('\n', ref.from - 1) + 1;
      if (source.slice(lineStart, ref.from).trim()) {
        breaks.push({ from: ref.from, to: ref.from, indent, kind: 'element' });
      }
      if (
        !opening ||
        indent + ref.to - ref.from <= 92 ||
        source.slice(ref.from, ref.to).includes('\n')
      )
        return;
      for (const attr of ref.node.getChildren('Attribute')) {
        const previous = attr.prevSibling;
        if (previous)
          breaks.push({ from: previous.to, to: attr.from, indent: indent + 2, kind: 'attribute' });
      }
    },
    leave(ref) {
      if (ref.name === 'Element') depth--;
    },
  });
  return breaks;
}

export function prepareSource(source: string, selectors: readonly string[], imagePath: string) {
  const tree = parser.parse(source);
  const breaks = tagBreaks(tree, source);
  const semantic = new Set(svtNames(tree, source).map((name) => name.from));
  const lines = source.split('\n').map((text) => ({
    text,
    selected: selectors.some((token) => text.includes(token)),
  }));
  const selected = lines.filter((line) => line.selected && line.text.trim());
  if (!selected.length) throw new Error('Excerpt selectors matched no source.');
  const indent = Math.min(...selected.map((line) => line.text.search(/\S/)));

  const snippet: SourceToken[] = [];
  function highlight(start: number, end: number) {
    if (start >= end) return;
    let cursor = start;
    highlightTree(
      tree,
      classHighlighter,
      (from, to, style) => {
        if (from > cursor) snippet.push([source.slice(cursor, from)]);
        const text = source.slice(from, to).replaceAll(imagePath, '…');
        snippet.push([text, semantic.has(from) ? 'svt-name' : style]);
        cursor = to;
      },
      start,
      end,
    );
    if (cursor < end) snippet.push([source.slice(cursor, end)]);
  }

  let offset = 0;
  let index = 0;
  let next = breaks[index];
  let sourceStart = 0;
  const formatted: string[] = [];
  for (const line of lines) {
    const end = offset + line.text.length;
    let cursor = offset + indent;
    if (line.selected && snippet.length) snippet.push(['\n']);
    while (next && next.from < end) {
      if (line.selected) {
        highlight(cursor, next.from);
        const layout = '\n' + ' '.repeat(Math.max(0, next.indent - indent));
        snippet.push(next.kind === 'element' ? [null, layout] : [layout]);
      }
      if (next.kind === 'attribute') {
        formatted.push(source.slice(sourceStart, next.from), '\n', ' '.repeat(next.indent));
        sourceStart = next.to;
      }
      cursor = next.to;
      next = breaks[++index];
    }
    if (line.selected) highlight(cursor, end);
    offset = end + 1;
  }
  formatted.push(source.slice(sourceStart));
  return { formatted: formatted.join(''), snippet };
}
