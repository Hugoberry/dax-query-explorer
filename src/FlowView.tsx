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
} from '@xyflow/react';
import { DatabaseSchemaNode } from '@/components/database-schema-node';
import Dagre from '@dagrejs/dagre';
import { useCallback, useEffect, useRef } from 'react';
//import { DevTools } from '@/components/devtools';

interface LayoutOptions {
  direction: string;
}

const getLayoutedElements = (
  nodes: Node[],
  edges: Edge[],
  options: LayoutOptions = { direction: 'LR' }
) => {
  console.log('getLayoutedElements - Input:', { nodes, edges, options });

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

  const result = {
    nodes: nodes.map((node) => {
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

  console.log('getLayoutedElements - Output:', result);
  return result;
};

const nodeTypes = {
  databaseSchema: DatabaseSchemaNode,
};

interface GrammarNodeData {
  indent: number;
  line: number;
  operator: string | { type: string; [key: string]: any };
  type: string;
  attributes: any[];
}

const findParentNode = (
  currentNode: GrammarNodeData,
  previousNodes: GrammarNodeData[]
): GrammarNodeData | null => {
  console.log('findParentNode - Input:', { currentNode, previousNodes });

  // Filter nodes that come before the current node and have lower indentation
  const possibleParents = previousNodes.filter(
    (node) => node.indent < currentNode.indent
  );

  if (possibleParents.length === 0) return null;

  // Return the closest parent (last node with lower indentation)
  const result = possibleParents[possibleParents.length - 1];
  console.log('findParentNode - Output:', result);
  return result;
};

const generateNodesAndEdges = (data: GrammarNodeData[]) => {
  console.log('generateNodesAndEdges - Input data:', data);

  const nodes: Node[] = [];
  const edges: Edge[] = [];
  const processedNodes: GrammarNodeData[] = [];

  data.forEach((item) => {
    const nodeId = `node-${item.line}`;
    const operatorLabel =
      typeof item.operator === 'string'
        ? item.operator
        : item.operator.name ||
          `${item.operator.table}[${item.operator.column}]`;

    const node = {
      id: nodeId,
      type: 'databaseSchema',
      position: { x: 0, y: 0 },
      width: 300,
      height: 120,
      data: {
        label: operatorLabel,
        schema: [
          {
            title: '',
            type: item.type,
            value: '',
          },
          ...item.attributes.map((attr, index) => ({
            title: `${index}`,
            type: `${attr.type}`,
            value: `${attr.value || ''}`,
          })),
        ],
      },
    };

    nodes.push(node);

    // Find parent node based on indentation and line number
    const parentNode = findParentNode(item, processedNodes);
    if (parentNode) {
      const parentOperatorLabel =
        typeof parentNode.operator === 'string'
          ? parentNode.operator
          : parentNode.operator.name;

      const edge = {
        id: `edge-${parentNode.line}-${item.line}`,
        source: `node-${parentNode.line}`,
        target: `node-${item.line}`,
        sourceHandle: `source-${parentOperatorLabel}`,
        targetHandle: `target-${operatorLabel}`,
      };
      edges.push(edge);
    }

    processedNodes.push(item);
  });

  return { nodes, edges };
};

function FlowContent({ data }: { data: GrammarNodeData[] }) {
  console.log('FlowContent - Initial data:', data);

  const { nodes: generatedNodes, edges: generatedEdges } =
    generateNodesAndEdges(data);
  const { nodes: initialNodes, edges: initialEdges } = getLayoutedElements(
    generatedNodes,
    generatedEdges,
    { direction: 'LR' }
  );

  console.log('FlowContent - Generated and laid out elements:', {
    initialNodes,
    initialEdges,
  });

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const reactFlowInstance = useRef<ReactFlowInstance | null>(null);

  const onInit = useCallback((instance: ReactFlowInstance) => {
    console.log('onInit - ReactFlow instance initialized');
    reactFlowInstance.current = instance;
    setTimeout(() => {
      instance.fitView({ duration: 200 });
    }, 100);
  }, []);

  // Re-layout when data changes
  useEffect(() => {
    if (data.length > 0) {
      const { nodes: newNodes, edges: newEdges } = generateNodesAndEdges(data);
      const { nodes: layoutedNodes, edges: layoutedEdges } =
        getLayoutedElements(newNodes, newEdges, { direction: 'LR' });
      setNodes(layoutedNodes);
      setEdges(layoutedEdges);
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
      </ReactFlow>
    </div>
  );
}

function FlowView({ jsonContent }: { jsonContent: any }) {
  console.log('FlowView - Received jsonContent:', jsonContent);

  // Convert the parsed grammar data to the expected format
  const grammarData = Array.isArray(jsonContent) ? jsonContent : [];
  console.log('FlowView - Converted grammarData:', grammarData);

  return (
    <ReactFlowProvider>
      <FlowContent data={grammarData} />
      {/* <DevTools /> */}
    </ReactFlowProvider>
  );
}

export default FlowView;
