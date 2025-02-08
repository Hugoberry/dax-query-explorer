// CodeMirror.tsx
import React, { useEffect, useRef } from 'react';
import { EditorState } from '@codemirror/state';
import { EditorView, keymap, lineNumbers } from '@codemirror/view';
import { defaultKeymap } from '@codemirror/commands';

import { oneDark } from '@codemirror/theme-one-dark';

interface CodeMirrorProps {
  initialCode?: string;
  onChange?: (value: string) => void;
  height?: string;
}

const CodeMirror: React.FC<CodeMirrorProps> = ({
  initialCode = '',
  onChange = () => {},
  height = '400px',
}) => {
  const editor = useRef<HTMLDivElement>(null);
  const view = useRef<EditorView | null>(null);

  useEffect(() => {
    // Early return if editor is already initialized or container is not available
    if (!editor.current) return;

    const startState = EditorState.create({
      doc: initialCode,
      extensions: [
        keymap.of(defaultKeymap),
        lineNumbers(),
        oneDark,
        EditorView.theme({
          '&': {
            height: height,
            fontSize: '14px',
          },
          '.cm-scroller': {
            fontFamily: 'JetBrains Mono',
          },
        }),
      ],
    });

    // Create and mount the editor
    view.current = new EditorView({
      state: startState,
      parent: editor.current,
    });

    // Cleanup on unmount
    return () => {
      if (view.current) {
        view.current.destroy();
        view.current = null;
      }
    };
  }, [initialCode, onChange, height]);

  return <div ref={editor} style={{ height: height }} />;
};

export default CodeMirror;
