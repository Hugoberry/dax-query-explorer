import {
  Background,
  Edge,
  ReactFlow,
  Node,
  useNodesState,
  useEdgesState,
  Controls,
  ReactFlowInstance,
  ReactFlowProvider,
  MiniMap,
  OnInit,
} from '@xyflow/react';
import { DatabaseSchemaNode } from '@/components/database-schema-node';
import { ScaLogOpNode } from '@/components/sca-log-op-node';
import { RelLogOpNode } from '@/components/rel-log-op-node';
import { SpoolPhyOpNode } from '@/components/spool-phy-op-node';
import { IterPhyOpNode } from '@/components/iter-phy-op-node';
import { LookupPhyOpNode } from '@/components/lookup-phy-op-node';
import Dagre from '@dagrejs/dagre';
import { useCallback, useEffect, useRef, useMemo } from 'react';
import { cleanTableName } from '@/lib/utils';

interface LayoutOptions {
  direction: string;
}

const getLayoutedElements = (
  nodes: Node[],
  edges: Edge[],
  options: LayoutOptions = { direction: 'LR' }
) => {
  const g = new Dagre.graphlib.Graph().setDefaultEdgeLabel(() => ({}));
  g.setGraph({ rankdir: options.direction });

  edges.forEach((edge) => g.setEdge(edge.source, edge.target));
  nodes.forEach((node) =>
    g.setNode(node.id, {
      width: node.width ?? 300,
      height: node.height ?? 100,
    })
  );

  Dagre.layout(g);

  return {
    nodes: nodes.map((node) => {
      // If the node has a user-defined position, keep it
      if (node.position.x !== 0 && node.position.y !== 0) {
        return node;
      }
      
      const nodeWithPosition = g.node(node.id);
      return {
        ...node,
        position: {
          x: nodeWithPosition.x - (node.width ?? 300) / 2,
          y: nodeWithPosition.y - (node.height ?? 100) / 2,
        },
      };
    }),
    edges,
  };
};

const nodeTypes = {
  databaseSchema: DatabaseSchemaNode,
  scaLogOp: ScaLogOpNode,
  relLogOp: RelLogOpNode,
  spoolPhyOp: SpoolPhyOpNode,
  iterPhyOp: IterPhyOpNode,
  lookupPhyOp: LookupPhyOpNode,
};

interface GrammarNodeData {
  indent: number;
  line: number;
  operator: string | { 
    type: string; 
    name?: string; 
    param?: any;
    columnRef?: { table: string; column: string };
    op?: string;
    filter?: string;
  };
  type: string;
  attributes: any[];
}

const findParentNode = (
  currentNode: GrammarNodeData,
  previousNodes: GrammarNodeData[]
): GrammarNodeData | null => {
  const possibleParents = previousNodes.filter(
    (node) => node.indent < currentNode.indent
  );
  return possibleParents.length === 0 ? null : possibleParents[possibleParents.length - 1];
};

const getOperatorLabel = (operator: any) => {
  if (typeof operator === 'string') {
    return operator;
  }

  if (operator.type === 'filterOp') {
    const table = cleanTableName(operator.columnRef.table);
    return `${table} [${operator.columnRef.column}] ${operator.op} ${operator.filter}`;
  }

  if (operator.type === 'columnRef') {
    const table = cleanTableName(operator.table);
    return `${table} [${operator.column}]`;
  }

  if (operator.type === 'complexIdentifier') {
    const paramStr = operator.param ? 
      (typeof operator.param === 'string' ? operator.param :
       operator.param.type === 'complexIdentifier' ? `${operator.param.name} <${operator.param.param || ''}>` :
       operator.param.table ? `${operator.param.table} [${operator.param.column}]` : '') 
      : '';
    return `${operator.name} <${paramStr}>`;
  }

  return operator.name || '';
};

const generateNodesAndEdges = (data: GrammarNodeData[]) => {
  const nodes: Node[] = [];
  const edges: Edge[] = [];
  const processedNodes: GrammarNodeData[] = [];

  data.forEach((item) => {
    const nodeId = `node-${item.line}`;
    const operatorLabel = getOperatorLabel(item.operator);

    let nodeType = 'databaseSchema';
    let nodeData: any = {
      label: operatorLabel,
      rowNumber: item.line,
    };

    switch (item.type) {
      case 'SpoolPhyOp':
        nodeType = 'spoolPhyOp';
        nodeData = {
          label: operatorLabel,
          rowNumber: item.line,
          records: item.attributes.find(attr => attr.type === 'Records')?.value,
          keyCols: item.attributes.find(attr => attr.type === 'KeyCols')?.value,
          valueCols: item.attributes.find(attr => attr.type === 'ValueCols')?.value,
        };
        break;

      case 'IterPhyOp':
        nodeType = 'iterPhyOp';
        nodeData = {
          label: operatorLabel,
          rowNumber: item.line,
          logOp: item.attributes.find(attr => attr.type === 'LogOp')?.value,
          records: item.attributes.find(attr => attr.type === 'Records')?.value,
          keyCols: item.attributes.find(attr => attr.type === 'KeyCols')?.value,
          valueCols: item.attributes.find(attr => attr.type === 'ValueCols')?.value,
          fieldCols: item.attributes.find(attr => attr.type === 'FieldCols')?.value,
          lookupCols: item.attributes.find(attr => attr.type === 'LookupCols'),
          iterCols: item.attributes.find(attr => attr.type === 'IterCols'),
        };
        break;

      case 'LookupPhyOp':
        nodeType = 'lookupPhyOp';
        nodeData = {
          label: operatorLabel,
          rowNumber: item.line,
          logOp: item.attributes.find(attr => attr.type === 'LogOp')?.value,
          records: item.attributes.find(attr => attr.type === 'Records')?.value,
          keyCols: item.attributes.find(attr => attr.type === 'KeyCols')?.value,
          valueCols: item.attributes.find(attr => attr.type === 'ValueCols')?.value,
          fieldCols: item.attributes.find(attr => attr.type === 'FieldCols')?.value,
          dataType: item.attributes.find(attr => attr.dataType)?.dataType,
          dominantValue: item.attributes.find(attr => attr.type === 'DominantValue')?.value,
          lookupCols: item.attributes.find(attr => attr.type === 'LookupCols'),
          numericLiteral: item.attributes.find(attr => attr.type === 'NumericLiteral')?.value,
        };
        break;

      case 'ScaLogOp':
        nodeType = 'scaLogOp';
        nodeData = {
          label: operatorLabel,
          rowNumber: item.line,
          dominantValue: item.attributes.find(attr => attr.type === 'DominantValue')?.value,
          dataType: item.attributes.find(attr => attr.dataType)?.dataType,
          dependOnCols: item.attributes.find(attr => attr.type === 'DependOnCols'),
        };
        break;

      case 'RelLogOp':
        nodeType = 'relLogOp';
        nodeData = {
          label: operatorLabel,
          rowNumber: item.line,
          range: item.attributes.find(attr => attr.type === 'LineRange'),
          dependOnCols: item.attributes.find(attr => attr.type === 'DependOnCols'),
          requiredCols: item.attributes.find(attr => attr.type === 'RequiredCols'),
        };
        break;
    }

    const node = {
      id: nodeId,
      type: nodeType,
      position: { x: 0, y: 0 },
      width: 300,
      height: 120,
      data: nodeData,
    };

    nodes.push(node);

    const parentNode = findParentNode(item, processedNodes);
    if (parentNode) {
      const parentOperatorLabel = getOperatorLabel(parentNode.operator);

      edges.push({
        id: `edge-${parentNode.line}-${item.line}`,
        source: `node-${parentNode.line}`,
        target: `node-${item.line}`,
        sourceHandle: `source-${parentOperatorLabel}`,
        targetHandle: `target-${operatorLabel}`,
      });
    }

    processedNodes.push(item);
  });

  return { nodes, edges };
};

function FlowContent({ data }: { data: GrammarNodeData[] }) {
  const [nodes, setNodes, onNodesChange] = useNodesState<Node>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);
  const reactFlowInstance = useRef<ReactFlowInstance | null>(null);
  const dataRef = useRef<GrammarNodeData[]>([]);
  const hasRenderedRef = useRef(false);

  const onInit: OnInit<Node, Edge> = useCallback((instance) => {
    reactFlowInstance.current = instance;
    setTimeout(() => {
      instance.fitView({ duration: 200 });
    }, 100);
  }, []);

  // Update the flow whenever data changes
  useEffect(() => {
    // Always render if we have data and haven't rendered yet
    const shouldRender = data.length > 0 && (!hasRenderedRef.current || 
      // Or if data has changed
      data.length !== dataRef.current.length || 
      JSON.stringify(data) !== JSON.stringify(dataRef.current));
    
    if (shouldRender) {
      console.log('Rendering flow with data:', data.length);
      // Update the reference to the current data
      dataRef.current = [...data];
      hasRenderedRef.current = true;
      
      const { nodes: newNodes, edges: newEdges } = generateNodesAndEdges(data);
      const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(
        newNodes, 
        newEdges, 
        { direction: 'LR' }
      );
      
      setNodes(layoutedNodes as any);
      setEdges(layoutedEdges as any);
      
      // Fit view after layout
      setTimeout(() => {
        if (reactFlowInstance.current) {
          reactFlowInstance.current.fitView({ duration: 200 });
        }
      }, 100);
    }
  }, [data, setNodes, setEdges]);

  return (
    <div className="h-full w-full bg-background">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        nodeTypes={nodeTypes}
        fitView
        onInit={onInit}
      >
        <Background />
        <Controls />
        <MiniMap zoomable pannable nodeColor={nodeColor} />
      </ReactFlow>
    </div>
  );
}

function FlowView({ jsonContent }: { jsonContent: any }) {
  const grammarData = useMemo(() => 
    Array.isArray(jsonContent) ? jsonContent : [], 
    [jsonContent]
  );

  return (
    <ReactFlowProvider>
      <FlowContent data={grammarData} />
    </ReactFlowProvider>
  );
}

function nodeColor(node: Node) {
  switch (node.type) {
    case 'scaLogOp':
      return '#90CAF9';
    case 'relLogOp':
      return '#A5D6A7';
    case 'spoolPhyOp':
      return '#9f7aea';
    case 'iterPhyOp':
      return '#FFF59D';
    case 'lookupPhyOp':
      return '#FFCC80';
    default:
      return '#ddd';
  }
}

export default FlowView;