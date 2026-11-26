import { defaultKeymap, history, historyKeymap } from '@codemirror/commands';
import { xml } from '@codemirror/lang-xml';
import {
  codeFolding,
  foldEffect,
  indentOnInput,
  syntaxHighlighting,
  syntaxTree,
} from '@codemirror/language';
import type { EditorState } from '@codemirror/state';
import { Decoration, EditorView, keymap, lineNumbers, ViewPlugin } from '@codemirror/view';
import { classHighlighter } from '@lezer/highlight';
import { svtNames } from './svt-syntax.ts';

function marks(state: EditorState) {
  const mark = Decoration.mark({ class: 'svt-name' });
  return Decoration.set(
    svtNames(syntaxTree(state), state.doc.toString()).map((node) => mark.range(node.from, node.to)),
  );
}

const svtHighlight = ViewPlugin.define(
  (view) => ({
    decorations: marks(view.state),
    update(update) {
      if (update.docChanged || syntaxTree(update.startState) !== syntaxTree(update.state))
        this.decorations = marks(update.state);
    },
  }),
  { decorations: (plugin) => plugin.decorations },
);

function foldImages(source: string) {
  const folds = [];
  for (const match of source.matchAll(/data:image\/[\w.+-]+;base64,([\w+/=]{80,})/g)) {
    const payload = match[1];
    if (payload) {
      const to = match.index + match[0].length;
      folds.push(foldEffect.of({ from: to - payload.length, to }));
    }
  }
  return folds;
}

export function mountEditor(
  parent: HTMLElement,
  source: string,
  label: string,
  change: (source: string | null) => void,
) {
  const view = new EditorView({
    parent,
    doc: source,
    extensions: [
      xml(),
      syntaxHighlighting(classHighlighter),
      svtHighlight,
      indentOnInput(),
      history(),
      keymap.of([...defaultKeymap, ...historyKeymap]),
      lineNumbers(),
      codeFolding({ placeholderText: 'image data…' }),
      EditorView.lineWrapping,
      EditorView.contentAttributes.of({ 'aria-label': label, spellcheck: 'false' }),
      EditorView.updateListener.of((update) => {
        if (update.docChanged) {
          const draft = update.state.doc.toString();
          change(draft === source ? null : draft);
        }
      }),
    ],
  });
  const folds = foldImages(source);
  view.dispatch({ effects: folds });
  return {
    destroy: () => view.destroy(),
    restore() {
      view.dispatch({
        changes: { from: 0, to: view.state.doc.length, insert: source },
        selection: { anchor: 0 },
        effects: folds,
        scrollIntoView: true,
      });
      view.focus();
    },
  };
}
