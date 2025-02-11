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
import { useCallback, useEffect, useRef, useMemo } from 'react';

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
  const possibleParents = previousNodes.filter(
    (node) => node.indent < currentNode.indent
  );
  return possibleParents.length === 0 ? null : possibleParents[possibleParents.length - 1];
};

const generateNodesAndEdges = (data: GrammarNodeData[]) => {
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

    const parentNode = findParentNode(item, processedNodes);
    if (parentNode) {
      const parentOperatorLabel =
        typeof parentNode.operator === 'string'
          ? parentNode.operator
          : parentNode.operator.name;

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
  const initialElements = useMemo(() => {
    const { nodes: generatedNodes, edges: generatedEdges } = generateNodesAndEdges(data);
    return getLayoutedElements(generatedNodes, generatedEdges, { direction: 'LR' });
  }, [data]);

  const [nodes, setNodes, onNodesChange] = useNodesState(initialElements.nodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialElements.edges);
  const reactFlowInstance = useRef<ReactFlowInstance | null>(null);

  const onInit = useCallback((instance: ReactFlowInstance) => {
    reactFlowInstance.current = instance;
    setTimeout(() => {
      instance.fitView({ duration: 200 });
    }, 100);
  }, []);

  // Only update layout when data changes, not on node movements
  useEffect(() => {
    if (data.length > 0) {
      const { nodes: newNodes, edges: newEdges } = generateNodesAndEdges(data);
      const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(
        newNodes, 
        newEdges, 
        { direction: 'LR' }
      );
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

export default FlowView;