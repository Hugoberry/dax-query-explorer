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
  editorRef: React.MutableRefObject<ReactCodeMirrorRef | null>;
  initialContent: string;
  onParse: () => void;
}

const TopMenu: React.FC<TopMenuProps> = (props: TopMenuProps) => {
  const { editorRef, onParse } = props;

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

  useEffect(() => {
    try {
      // Get the grammar from the imported module
      const grammarModule = grammar.default || grammar;

      if (!grammarModule.Lexer || !grammarModule.ParserRules) {
        throw new Error('Grammar missing required properties');
      }

      // Initialize parser using nearley and the imported grammar
      const newParser = new nearley.Parser(
        nearley.Grammar.fromCompiled(grammarModule)
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
      // Create a new parser instance for each parse
      const grammarModule = grammar.default || grammar;
      const newParser = new nearley.Parser(
        nearley.Grammar.fromCompiled(grammarModule)
      );

      // Append newline to the content before parsing
      const contentWithNewline = currentContent + '\n';
      console.log('Parsing content:', contentWithNewline);

      // Parse the input
      newParser.feed(contentWithNewline);
      const results = newParser.results[0];
      console.log('Parse results:', results);

      // Pass results to parent component
      onParseResult?.(results);

      // Call onChange if provided
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
      <TopMenu
        editorRef={editorRef}
        initialContent={initialContent}
        onParse={handleParse}
      />

      <CodeMirror
        ref={editorRef}
        value={initialContent}
        height="100%"
        theme={oneDark}
        onChange={handleChange}
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
      ></StatusBar>
    </div>
  );
};

export default CodeEditor;
