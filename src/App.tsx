import { Dispatch, SetStateAction, useState, useEffect } from "react";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import "./App.css";
import CodeEditor from "./CodeEditor";
import ResizableSplitView from "./ResizableSplitView";
import FlowView from "./FlowView";
import "@xyflow/react/dist/style.css";
import { ShareButton } from "./components/share-button";
import nearley from 'nearley';
import grammar from '@/lib/grammar';

const INITIAL_DAX_PLAN = `AddColumns: IterPhyOp LogOp=SelectColumns IterCols(0, 1)(''[Color], ''[])
    Spool_Iterator<SpoolIterator>: IterPhyOp LogOp=Scan_Vertipaq IterCols(0)('Product'[Color]) #Records=16 #KeyCols=107 #ValueCols=0
        ProjectionSpool<ProjectFusion<>>: SpoolPhyOp #Records=16
            Cache: IterPhyOp #FieldCols=1 #ValueCols=0
    UPPER: LookupPhyOp LogOp=UPPER LookupCols(0)('Product'[Color]) String
        ColValue<'Product'[Color]>: LookupPhyOp LogOp=ColValue<'Product'[Color]>'Product'[Color] LookupCols(0)('Product'[Color]) String`;

interface FullViewProps {
  showSplitView: boolean;
  setShowSplitView: Dispatch<SetStateAction<boolean>>;
  grammarData: any[];
  onParseResult: (result: any) => void;
  currentQueryPlan: string;
  onContentChange: (content: string) => void;
}

function FullView(props: FullViewProps) {
  const { 
    showSplitView, 
    setShowSplitView, 
    grammarData, 
    onParseResult, 
    currentQueryPlan,
    onContentChange 
  } = props;

  const codeEditor = (
    <div className="flex flex-col h-full">
      <CodeEditor
        initialContent={currentQueryPlan}
        showSplitView={showSplitView}
        setShowSplitView={setShowSplitView}
        onParseResult={onParseResult}
        onContentChange={onContentChange}
      />
      {grammarData.length > 0 && (
        <div className="absolute top-4 right-4 z-10">
          <ShareButton queryPlan={currentQueryPlan} />
        </div>
      )}
    </div>
  );
  
  if (showSplitView) {
    return (
      <ResizableSplitView
        leftSide={codeEditor}
        rightSide={<FlowView jsonContent={grammarData} />}
      />
    );
  } else {
    return codeEditor;
  }
}

function SharedPlanView() {
  const [grammarData, setGrammarData] = useState<any[]>([]);
  const [showSplitView, setShowSplitView] = useState<boolean>(true);
  const [currentQueryPlan, setCurrentQueryPlan] = useState<string>('');
  const location = useLocation();

  // Reset grammar data when location changes
  useEffect(() => {
    setGrammarData([]);
  }, [location.pathname]);

  const handleParseResult = (result: any) => {
    if (result) {
      setGrammarData(result);
    }
  };

  return (
    <FullView
      grammarData={grammarData}
      showSplitView={showSplitView}
      setShowSplitView={setShowSplitView}
      onParseResult={handleParseResult}
      currentQueryPlan={currentQueryPlan}
      onContentChange={setCurrentQueryPlan}
    />
  );
}

function App() {
  const [grammarData, setGrammarData] = useState<any[]>([]);
  const [showSplitView, setShowSplitView] = useState<boolean>(true);
  const [currentQueryPlan, setCurrentQueryPlan] = useState<string>(INITIAL_DAX_PLAN);
  const location = useLocation();

  // Reset grammar data when location changes
  useEffect(() => {
    setGrammarData([]);
  }, [location.pathname]);

  const handleParseResult = (result: any) => {
    if (result) {
      setGrammarData(result);
    }
  };

  // Parse initial content on mount
  useEffect(() => {
    if (location.pathname === '/' && grammarData.length === 0) {
      // Create a temporary parser to parse the initial content
      try {
        const parser = new nearley.Parser(
          nearley.Grammar.fromCompiled(grammar as any)
        );
        
        parser.feed(INITIAL_DAX_PLAN + '\n');
        const results = parser.results[0];
        
        if (results) {
          setGrammarData(results);
        }
      } catch (err) {
        console.error('Error parsing initial content:', err);
      }
    }
  }, [location.pathname, grammarData.length]);

  return (
    <Routes>
      <Route
        path="/"
        element={
          <FullView
            grammarData={grammarData}
            showSplitView={showSplitView}
            setShowSplitView={setShowSplitView}
            onParseResult={handleParseResult}
            currentQueryPlan={currentQueryPlan}
            onContentChange={setCurrentQueryPlan}
          />
        }
      />
      <Route path="/plan/:shortCode" element={<SharedPlanView />} />
    </Routes>
  );
}

function AppWithRouter() {
  return (
    <BrowserRouter>
      <App />
    </BrowserRouter>
  );
}

export default AppWithRouter;