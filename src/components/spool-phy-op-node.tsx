import { Node, NodeProps, Position } from '@xyflow/react';
import { BaseNode } from '@/components/base-node';
import { BaseHandle } from '@/components/base-handle';
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";

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
    : `${data.label.name} <${data.label.param?.name || ''}>`;

  const hasStats = data.records !== undefined || 
    data.keyCols !== undefined || 
    data.valueCols !== undefined;

  return (
    <BaseNode 
      className="p-0 bg-purple-50" 
      selected={selected}
    >
      <h2 className="rounded-tl-md rounded-tr-md bg-purple-100 text-sm text-muted-foreground">
        <BaseHandle
          id={`target-${label}`}
          title=""
          type="target"
          position={Position.Left}
        />
        <div className="flex min-w-0 items-start p-1">
          <span className="flex-shrink-0 bg-purple-200 px-1.5 py-0.5 rounded text-xs mr-2">
            <HoverCard>
              <HoverCardTrigger asChild>
                <span className="inline-flex items-center gap-1 cursor-help">
                  SpoolPhyOp
                </span>
              </HoverCardTrigger>
              <HoverCardContent className="w-80 text-left">
                <div className="space-y-2">
                  <h4 className="font-bold text-lg">Spool Physical Operator</h4>
                  <p className="text-sm">
                    Materializes intermediate results in memory by executing its entire subtree before proceeding. 
                    Spool operators are used to cache or buffer data, often indicated by properties like #Records, 
                    #KeyCols, and #ValueCols.
                  </p>
                  <div className="text-xs text-muted-foreground">
                    Example: A spool that stores intermediate query results to optimize further processing or to handle repeated references.
                  </div>
                </div>
              </HoverCardContent>
            </HoverCard>
          </span>
          <div className="min-w-0 flex-1 px-1">
            <div className="break-words">{label}</div>
          </div>
          <span className="flex-shrink-0 px-1.5">#{data.rowNumber}</span>
        </div>
        <BaseHandle
          id={`source-${label}`}
          title=""
          type="source"
          position={Position.Right}
        />
      </h2>
      <div className="p-2">
        {hasStats && (
          <div className="flex gap-2 text-xs">
            {data.records !== undefined && (
              <div className="bg-purple-100 px-1.5 py-0.5 rounded">
                <span className="font-medium">Records:</span> {data.records.toLocaleString()}
              </div>
            )}
            {data.keyCols !== undefined && (
              <div className="bg-purple-100 px-1.5 py-0.5 rounded">
                <span className="font-medium">K:</span> {data.keyCols}
              </div>
            )}
            {data.valueCols !== undefined && (
              <div className="bg-purple-100 px-1.5 py-0.5 rounded">
                <span className="font-medium">V:</span> {data.valueCols}
              </div>
            )}
          </div>
        )}
      </div>
    </BaseNode>
  );
}