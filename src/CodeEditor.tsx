import React, {
  Dispatch,
  SetStateAction,
  useRef,
  useState,
  useCallback,
  useEffect,
} from 'react';
import { CodeOnlyIcon, SplitViewIcon } from './icons';
import CodeMirror, {
  EditorView,
  keymap,
  lineNumbers,
  oneDark,
  ReactCodeMirrorRef,
} from '@uiw/react-codemirror';
import {ViewUpdate} from '@codemirror/view';
import { defaultKeymap } from '@codemirror/commands';
import grammar from '@/lib/grammar';
import nearley from 'nearley';
import { FEEDBACK_URL } from './const';

interface CodeEditorProps {
  initialContent: string;
  onChange?: (value: string) => void;
  onParseResult?: (result: any) => void;
  height?: string;
  showSplitView: boolean;
  setShowSplitView: Dispatch<SetStateAction<boolean>>;
}

interface StatusBarProps {
  showSplitView: boolean;
  setShowSplitView: Dispatch<SetStateAction<boolean>>;
  position: { line: number; column: number };
  selection: number;
}

interface TopMenuProps {
  onParse: () => void;
}
// TopMenu component
const TopMenu: React.FC<TopMenuProps> = ({ onParse }) => {
  return (
    <div id="topMenu">
      <div className="menu-group">
        <span
          className="menu-item"
          id="menu-parse"
          title="Parse DAX Query Plan"
          onClick={onParse}
        >
          Parse Query Plan
        </span>

        <span
          className="menu-item"
          id="menu-issues"
          title={`Feature Request, Bug Report, Feedback: ${FEEDBACK_URL}`}
          onClick={() => window.open(FEEDBACK_URL, '_blank')}
        >
          ?
        </span>
      </div>
    </div>
  );
};

const StatusBar: React.FC<StatusBarProps> = (props: StatusBarProps) => {
  const { showSplitView, setShowSplitView, position, selection } = props;
  return (
    <div id="statusBar">
      <div className="status-actions">
        {showSplitView ? (
          <span
            className="status-item"
            id="codeOnlyIcon"
            title="Show code view only."
            onClick={() => setShowSplitView(false)}
          >
            <CodeOnlyIcon></CodeOnlyIcon>
          </span>
        ) : (
          <span
            className="status-item"
            id="splitViewIcon"
            title="Show split view."
            onClick={() => setShowSplitView(true)}
          >
            <SplitViewIcon></SplitViewIcon>
          </span>
        )}
      </div>
      <div className="status-right">
        <span className="status-item" id="position">
          Ln {position.line}, Col {position.column}
        </span>
        <span className="status-item" id="selection">
          Sel {selection}
        </span>
      </div>
    </div>
  );
};

const CodeEditor: React.FC<CodeEditorProps> = ({
  initialContent,
  onChange,
  onParseResult,
  showSplitView,
  setShowSplitView,
}) => {
  const [position, setPosition] = useState({ line: 1, column: 1 });
  const [selection, setSelection] = useState(0);
  const [currentContent, setCurrentContent] = useState(initialContent);
  const editorRef = useRef<ReactCodeMirrorRef>(null);
  const [parser, setParser] = useState<nearley.Parser | null>(null);

  // Update cursor position and selection
  const handleCursorActivity = useCallback((viewUpdate: ViewUpdate) => {
    const pos = viewUpdate.state.selection.main.head;
    const line = viewUpdate.state.doc.lineAt(pos);
    setPosition({
      line: line.number,
      column: pos - line.from + 1
    });
    
    const selectionSize = Math.abs(
      viewUpdate.state.selection.main.from - viewUpdate.state.selection.main.to
    );
    setSelection(selectionSize);
  }, []);

  useEffect(() => {
    try {
      // Handle the grammar import without accessing .default
      // Create a new parser from the grammar
      const newParser = new nearley.Parser(
        nearley.Grammar.fromCompiled(grammar as nearley.CompiledRules)
      );
      setParser(newParser);
      console.log('Parser initialized successfully');
    } catch (err) {
      console.error('Parser initialization error:', err);
    }
  }, []);

  const handleParse = useCallback(() => {
    if (!parser) {
      console.error('Parser not initialized');
      return;
    }

    try {
      // Handle the grammar import without accessing .default
      // Create a new parser from the grammar
      const newParser = new nearley.Parser(
        nearley.Grammar.fromCompiled(grammar as nearley.CompiledRules)
      );

      const contentWithNewline = currentContent + '\n';
      console.log('Parsing content:', contentWithNewline);

      newParser.feed(contentWithNewline);
      const results = newParser.results[0];
      console.log('Parse results:', results);

      onParseResult?.(results);
      onChange?.(currentContent);
    } catch (err) {
      console.error('Parse error:', err);
    }
  }, [currentContent, onChange, onParseResult, parser]);

  const handleChange = useCallback((value: string) => {
    setCurrentContent(value);
  }, []);

  return (
    <div className="w-full" id="editor">
      <TopMenu onParse={handleParse} />

      <CodeMirror
        ref={editorRef}
        value={initialContent}
        height="100%"
        theme={oneDark}
        onChange={handleChange}
        onUpdate={handleCursorActivity}
        extensions={[
          keymap.of(defaultKeymap),
          lineNumbers(),
          EditorView.theme({
            '&': {
              fontSize: '12px',
            },
            '.cm-scroller': {
              fontFamily: 'JetBrains Mono',
            },
          }),
        ]}
      />

      <StatusBar
        showSplitView={showSplitView}
        setShowSplitView={setShowSplitView}
        position={position}
        selection={selection}
      />
    </div>
  );
};

export default CodeEditor;