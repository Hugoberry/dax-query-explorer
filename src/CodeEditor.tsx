import React, {
  Dispatch,
  SetStateAction,
  useRef,
  useState,
  useCallback,
  useEffect,
  memo,
} from 'react';
import { useParams, Link } from 'react-router-dom';
import { CodeOnlyIcon, SplitViewIcon, GithubIcon } from './icons';
import CodeMirror, {
  EditorView,
  keymap,
  lineNumbers,
  oneDark,
  ReactCodeMirrorRef,
} from '@uiw/react-codemirror';
import { json } from '@codemirror/lang-json';
import {ViewUpdate} from '@codemirror/view';
import { defaultKeymap } from '@codemirror/commands';
import grammar from '@/lib/grammar';
import nearley from 'nearley';
import { FEEDBACK_URL } from './const';
import { getQueryPlan } from '@/lib/supabase';
import { FileJson, FileText } from 'lucide-react';

interface CodeEditorProps {
  initialContent: string;
  onChange?: (value: string) => void;
  onParseResult?: (result: any) => void;
  onContentChange?: (content: string) => void;
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

interface QueryPlanRow {
  IndentedOperation: string;
}

interface QueryPlan {
  PhysicalQueryPlanRows: QueryPlanRow[];
  LogicalQueryPlanRows: QueryPlanRow[];
}

// StatusBar component
const StatusBar = memo<StatusBarProps>((props) => {
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
            <CodeOnlyIcon />
          </span>
        ) : (
          <span
            className="status-item"
            id="splitViewIcon"
            title="Show split view."
            onClick={() => setShowSplitView(true)}
          >
            <SplitViewIcon />
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
});

StatusBar.displayName = 'StatusBar';

const isJsonString = (str: string): boolean => {
  try {
    JSON.parse(str);
    return true;
  } catch (e) {
    return false;
  }
};

const extractOperationsFromJson = (jsonData: QueryPlan): string => {
  const physicalOps = jsonData.PhysicalQueryPlanRows?.map(row => row.IndentedOperation) || [];
  const logicalOps = jsonData.LogicalQueryPlanRows?.map(row => row.IndentedOperation) || [];
  return [...physicalOps, ...logicalOps].join('\n');
};

const CodeEditor: React.FC<CodeEditorProps> = ({
  initialContent,
  onChange,
  onParseResult,
  onContentChange,
  showSplitView,
  setShowSplitView,
}) => {
  const [position, setPosition] = useState({ line: 1, column: 1 });
  const [selection, setSelection] = useState(0);
  const [content, setContent] = useState(initialContent);
  const editorRef = useRef<ReactCodeMirrorRef>(null);
  const parserRef = useRef<nearley.Parser | null>(null);
  const { shortCode } = useParams<{ shortCode: string }>();

  // Load shared query plan if shortCode is present
  useEffect(() => {
    if (shortCode) {
      const loadSharedPlan = async () => {
        try {
          const queryPlan = await getQueryPlan(shortCode);
          if (typeof queryPlan === 'string') {
            setContent(queryPlan);
            if (onContentChange) {
              onContentChange(queryPlan);
            }
          } else {
            const stringifiedPlan = JSON.stringify(queryPlan, null, 2);
            setContent(stringifiedPlan);
            if (onContentChange) {
              onContentChange(stringifiedPlan);
            }
          }
        } catch (error) {
          console.error('Error loading shared plan:', error);
        }
      };
      loadSharedPlan();
    }
  }, [shortCode, onContentChange]);

  // Initialize parser only once
  useEffect(() => {
    try {
      const newParser = new nearley.Parser(
        nearley.Grammar.fromCompiled(grammar as nearley.CompiledRules)
      );
      parserRef.current = newParser;
      console.log('Parser initialized successfully');
    } catch (err) {
      console.error('Parser initialization error:', err);
    }
  }, []); // Empty dependency array ensures this runs only once

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

  const parseContent = useCallback((contentToParse: string) => {
    if (!parserRef.current) {
      console.error('Parser not initialized');
      return;
    }

    try {
      // Create a new parser instance for each parse operation
      const newParser = new nearley.Parser(
        nearley.Grammar.fromCompiled(grammar as nearley.CompiledRules)
      );

      if (!contentToParse) {
        console.error('No content to parse');
        return;
      }

      // Check if content is JSON
      let finalContent = contentToParse;
      if (isJsonString(contentToParse)) {
        const jsonData = JSON.parse(contentToParse) as QueryPlan;
        finalContent = extractOperationsFromJson(jsonData);
      }

      const contentWithNewline = finalContent + '\n';
      newParser.feed(contentWithNewline);
      const results = newParser.results[0];

      if (onParseResult) {
        onParseResult(results);
      }
    } catch (err) {
      console.error('Parse error:', err);
    }
  }, [onParseResult]);

  // Debounce function to limit parse operations
  const debounce = (func: Function, wait: number) => {
    let timeout: NodeJS.Timeout;
    return (...args: any[]) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => func(...args), wait);
    };
  };

  // Create debounced parse function
  const debouncedParse = useCallback(
    debounce((content: string) => parseContent(content), 500),
    [parseContent]
  );

  const handleChange = useCallback((value: string) => {
    setContent(value);
    if (onChange) {
      onChange(value);
    }
    if (onContentChange) {
      onContentChange(value);
    }
    debouncedParse(value);
  }, [onChange, onContentChange, debouncedParse]);

  // Parse initial content
  useEffect(() => {
    if (initialContent) {
      parseContent(initialContent);
    }
  }, [initialContent, parseContent]);

  // Initialize CodeMirror extensions
  const extensions = useRef([
    keymap.of(defaultKeymap),
    lineNumbers(),
    json(),
    EditorView.theme({
      '&': {
        fontSize: '12px',
      },
      '.cm-scroller': {
        fontFamily: 'JetBrains Mono',
      },
    }),
  ]);

  return (
    <div className="w-full" id="editor">
      <div id="topMenu">
      <div className="menu-group flex">
          <span
            className="menu-item flex items-center justify-center"
            title={`Feature Request, Bug Report, Feedback: ${FEEDBACK_URL}`}
            onClick={() => window.open(FEEDBACK_URL, '_blank')}
          >
            <GithubIcon />
          </span>
          <Link
            to="/plan/jsoninput"
            className="menu-item flex items-center justify-center"
            title="View JSON input example"
          >
            <FileJson className="w-5 h-5 stroke-slate-50" />
          </Link>
          <Link
            to="/plan/textinput"
            className="menu-item flex items-center justify-center"
            title="View text input example"
          >
            <FileText className="w-5 h-5 stroke-slate-50" />
          </Link>
        </div>
      </div>
      <CodeMirror
        ref={editorRef}
        value={content}
        height="100%"
        theme={oneDark}
        onChange={handleChange}
        onUpdate={handleCursorActivity}
        extensions={extensions.current}
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

export default memo(CodeEditor);
