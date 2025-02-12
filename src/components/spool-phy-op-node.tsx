import { Node, NodeProps, Position } from '@xyflow/react';
import { BaseNode } from '@/components/base-node';
import { LabeledHandle } from '@/components/labeled-handle';

type SpoolPhyOpNode = Node<{
  label: string | { type: string; name: string; param: any };
  rowNumber: number;
  records?: number;
  keyCols?: number;
  valueCols?: number;
}>;

export function SpoolPhyOpNode({ data, selected }: NodeProps<SpoolPhyOpNode>) {
  const label = typeof data.label === 'string'
    ? data.label
    : `${data.label.name}<${data.label.param?.name || ''}>`;

  return (
    <BaseNode 
      className="p-0 bg-purple-50" 
      selected={selected}
    >
      <h2 className="rounded-tl-md rounded-tr-md bg-purple-100 text-center text-sm text-muted-foreground">
        <LabeledHandle
          id={`target-${label}`}
          title=""
          type="target"
          position={Position.Left}
        />
        {label} #{data.rowNumber}
        <span className="ml-1 px-1.5 py-0.5 bg-purple-200 rounded text-xs">SpoolPhyOp</span>
        <LabeledHandle
          id={`source-${label}`}
          title=""
          type="source"
          position={Position.Right}
        />
      </h2>
      <div className="p-2">
        {data.records !== undefined && (
          <div className="text-xs mb-1">
            <span className="font-semibold">Records: </span>
            {data.records}
          </div>
        )}
        {data.keyCols !== undefined && (
          <div className="text-xs mb-1">
            <span className="font-semibold">Key Cols: </span>
            {data.keyCols}
          </div>
        )}
        {data.valueCols !== undefined && (
          <div className="text-xs mb-1">
            <span className="font-semibold">Value Cols: </span>
            {data.valueCols}
          </div>
        )}
      </div>
    </BaseNode>
  );
}