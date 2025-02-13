import React, {
  Dispatch,
  SetStateAction,
  useRef,
  useState,
  useCallback,
  useEffect,
  memo,
} from 'react';
import { useParams } from 'react-router-dom';
import { CodeOnlyIcon, SplitViewIcon } from './icons';
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

interface TopMenuProps {
  onParse: () => void;
}

interface QueryPlanRow {
  IndentedOperation: string;
}

interface QueryPlan {
  PhysicalQueryPlanRows: QueryPlanRow[];
  LogicalQueryPlanRows: QueryPlanRow[];
}

// TopMenu component
const TopMenu = memo<TopMenuProps>(({ onParse }) => {
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
});

TopMenu.displayName = 'TopMenu';

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
          // You might want to show an error message to the user here
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

  const handleParse = useCallback(() => {
    if (!parserRef.current) {
      console.error('Parser not initialized');
      return;
    }

    try {
      // Create a new parser instance for each parse operation
      const newParser = new nearley.Parser(
        nearley.Grammar.fromCompiled(grammar as nearley.CompiledRules)
      );

      if (!content) {
        console.error('No content to parse');
        return;
      }

      // Check if content is JSON
      let contentToParse = content;
      if (isJsonString(content)) {
        const jsonData = JSON.parse(content) as QueryPlan;
        contentToParse = extractOperationsFromJson(jsonData);
      }

      const contentWithNewline = contentToParse + '\n';
      console.log('Parsing content:', contentWithNewline);
      newParser.feed(contentWithNewline);
      const results = newParser.results[0];
      console.log('Parse results:', results);

      if (onParseResult) {
        onParseResult(results);
      }
    } catch (err) {
      console.error('Parse error:', err);
    }
  }, [content, onParseResult]);

  const handleChange = useCallback((value: string) => {
    setContent(value);
    if (onChange) {
      onChange(value);
    }
    if (onContentChange) {
      onContentChange(value);
    }
  }, [onChange, onContentChange]);

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
      <TopMenu onParse={handleParse} />
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