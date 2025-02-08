import { Dispatch, SetStateAction, useState } from "react";
import "./App.css";
import CodeEditor from "./CodeEditor";
import ResizableSplitView from "./ResizableSplitView";
import FlowView from "./FlowView";
import "@xyflow/react/dist/style.css";

const INITIAL_DAX_PLAN = `AddColumns: IterPhyOp LogOp=SelectColumns IterCols(0, 1)(''[Color], ''[])
    Spool_Iterator<SpoolIterator>: IterPhyOp LogOp=Scan_Vertipaq IterCols(0)('Product'[Color]) #Records=16 #KeyCols=107 #ValueCols=0
        ProjectionSpool<ProjectFusion<>>: SpoolPhyOp #Records=16
            Cache: IterPhyOp #FieldCols=1 #ValueCols=0
    UPPER: LookupPhyOp LogOp=UPPER LookupCols(0)('Product'[Color]) String
        ColValue<'Product'[Color]>: LookupPhyOp LogOp=ColValue<'Product'[Color]>'Product'[Color] LookupCols(0)('Product'[Color]) String`;

function FullView(props: {
  showSplitView: boolean;
  setShowSplitView: Dispatch<SetStateAction<boolean>>;
  grammarData: any[];
  onParseResult: (result: any) => void;
}) {
  const { showSplitView, setShowSplitView, grammarData, onParseResult } = props;
  const codeEditor = (
    <CodeEditor
      initialContent={INITIAL_DAX_PLAN}
      showSplitView={showSplitView}
      setShowSplitView={setShowSplitView}
      onParseResult={onParseResult}
    />
  );
  if (showSplitView) {
    return (
      <ResizableSplitView
        leftSide={codeEditor}
        rightSide={<FlowView jsonContent={grammarData}></FlowView>}
      />
    );
  } else {
    return codeEditor;
  }
}

function App() {
  const [grammarData, setGrammarData] = useState<any[]>([]);
  const [showSplitView, setShowSplitView] = useState<boolean>(true);

  const handleParseResult = (result: any) => {
    setGrammarData(result);
  };

  return (
    <FullView
      grammarData={grammarData}
      showSplitView={showSplitView}
      setShowSplitView={setShowSplitView}
      onParseResult={handleParseResult}
    />
  );
}

export default App;