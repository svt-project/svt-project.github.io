import { parser } from '@lezer/xml';
import { classHighlighter, highlightTree } from '@lezer/highlight';
import { svtNames } from '../cookbook/svt-syntax.ts';
import type { SourceToken } from '../cookbook/guide-model.ts';

// Wrap attributes in long, single-line tags. Whitespace between SVG text
// elements and inside attribute values can be significant to the drawing.
function formatLines(source: string, selectors: readonly string[]) {
  const wrapBefore = new Set<number>();
  parser.parse(source).iterate({
    enter(ref) {
      if (ref.name !== 'OpenTag' && ref.name !== 'SelfClosingTag') return;
      const lineStart = source.lastIndexOf('\n', ref.from - 1) + 1;
      if (ref.to - lineStart <= 92 || source.slice(lineStart, ref.to).includes('\n')) return;
      for (const attr of ref.node.getChildren('Attribute')) wrapBefore.add(attr.from);
    },
  });

  let offset = 0;
  return source.split('\n').flatMap((line) => {
    const selected = selectors.some((token) => line.includes(token));
    const indent = line.match(/^[ \t]*/)?.[0] ?? '';
    const formatted = line.replace(/[ \t]+/g, (space: string, start: number) =>
      wrapBefore.has(offset + start + space.length) ? '\n' + indent + '  ' : space,
    );
    offset += line.length + 1;
    return formatted.split('\n').map((text) => ({ text, selected }));
  });
}

export function prepareSource(authored: string, selectors: readonly string[], imagePath: string) {
  const lines = formatLines(authored, selectors);
  const formatted = lines.map((line) => line.text).join('\n');
  const display = formatted.replaceAll(imagePath, '…');
  const tree = parser.parse(display);
  const semantic = new Set(svtNames(tree, display).map((name) => name.from));
  const selected = lines.filter((line) => line.selected && line.text.trim());
  if (!selected.length) throw new Error('Excerpt selectors matched no source.');
  const indent = Math.min(...selected.map((line) => line.text.search(/\S/)));

  const snippet: SourceToken[] = [];
  let offset = 0;
  for (const line of lines) {
    const end = offset + line.text.replaceAll(imagePath, '…').length;
    if (line.selected) {
      if (snippet.length) snippet.push(['\n']);
      let cursor = Math.min(offset + indent, end);
      highlightTree(
        tree,
        classHighlighter,
        (from, to, style) => {
          if (from > cursor) snippet.push([display.slice(cursor, from)]);
          snippet.push([display.slice(from, to), semantic.has(from) ? 'svt-name' : style]);
          cursor = to;
        },
        cursor,
        end,
      );
      if (cursor < end) snippet.push([display.slice(cursor, end)]);
    }
    offset = end + 1;
  }
  return { formatted, snippet };
}
