import { Node, NodeProps, Position } from '@xyflow/react';
import { TableBody, TableCell, TableRow } from '@/components/ui/table';
import { BaseNode } from '@/components/base-node';
import { cleanTableName } from '@/lib/utils';
import { BaseHandle } from './base-handle';
import { useState } from 'react';
import { 
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import { ChevronDown, ChevronRight } from 'lucide-react';

interface ColumnRef {
  table: string;
  column: string;
}

interface DependOnCols {
  type: 'DependOnCols';
  indices: string[];
  refs: ColumnRef[];
}

type ScaLogOpNode = Node<{
  label: string | { type: string; table: string; column: string };
  rowNumber: number;
  dominantValue?: string;
  dataType?: string;
  dependOnCols?: DependOnCols;
}>;

export function ScaLogOpNode({ data, selected }: NodeProps<ScaLogOpNode>) {
  const [openDepend, setOpenDepend] = useState(false);

  const label = typeof data.label === 'string' 
    ? data.label 
    : `${cleanTableName(data.label.table)}[${data.label.column}]`;

  const hasTags = data.dataType || data.dominantValue;

  return (
    <BaseNode 
      className="p-0 bg-blue-50" 
      selected={selected}
    >
      <h2 className="rounded-tl-md rounded-tr-md bg-blue-100 text-center text-sm text-muted-foreground">
        <BaseHandle
          id={`target-${label}`}
          title=""
          type="target"
          position={Position.Left}
        />
        <div className="flex min-w-0 items-start p-1">
          <span className="flex-shrink-0 bg-blue-200 px-1.5 py-0.5 rounded text-xs mr-2">
            <HoverCard>
              <HoverCardTrigger asChild>
                <span className="inline-flex items-center gap-1 cursor-help">
                  ScaLogOp
                </span>
              </HoverCardTrigger>
              <HoverCardContent className="w-80 text-left">
                <div className="space-y-2">
                  <h4 className="font-bold text-lg">Scalar Logical Operator</h4>
                  <p className="text-sm">
                    Produces a single scalar value (such as a number, string, or Boolean). 
                    These operators are responsible for evaluating expressions that yield 
                    a single value.
                  </p>
                  <div className="text-xs text-muted-foreground">
                    Example: An operator that calculates an aggregated measure like a SUM.
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
        {hasTags && (
          <div className="flex flex-wrap gap-2 items-center mb-2">
            {data.dataType && (
              <div className="bg-blue-200 px-1.5 py-0.5 rounded text-xs">
                {data.dataType}
              </div>
            )}
            {data.dominantValue && (
              <div className="bg-blue-200 px-1.5 py-0.5 rounded text-xs">
                {data.dominantValue}
              </div>
            )}
          </div>
        )}
        {data.dependOnCols && data.dependOnCols.indices.length > 0 && (
          <Collapsible
            open={openDepend}
            onOpenChange={setOpenDepend}
            className="w-full"
          >
            <CollapsibleTrigger className="w-full flex items-center bg-blue-200/50 hover:bg-blue-200 text-xs text-left px-2 py-1 rounded-sm border-0 [&:not([data-state=open])]:rounded-b-sm">
              {openDepend ? <ChevronDown className="h-3 w-3 shrink-0" /> : <ChevronRight className="h-3 w-3 shrink-0" />}
              <span className="ml-1 font-semibold">Depend On Cols</span>
            </CollapsibleTrigger>
            <CollapsibleContent className="bg-blue-50 px-2 py-1 rounded-b-sm">
              <table className="w-full text-xs">
                <TableBody>
                  {data.dependOnCols.indices.map((index, i) => (
                    <TableRow key={index}>
                      <TableCell className="py-0 pl-0">{index}</TableCell>
                      <TableCell className="py-0">
                        {cleanTableName(data.dependOnCols?.refs[i]?.table)}[{data.dependOnCols?.refs[i]?.column}]
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </table>
            </CollapsibleContent>
          </Collapsible>
        )}
      </div>
    </BaseNode>
  );
}