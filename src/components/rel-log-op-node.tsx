import { Node, NodeProps, Position } from '@xyflow/react';
import { TableBody, TableCell, TableRow } from '@/components/ui/table';
import { BaseNode } from '@/components/base-node';
import { BaseHandle } from '@/components/base-handle';
import { cleanTableName } from '@/lib/utils';
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

interface RequiredCols {
  type: 'RequiredCols';
  indices: string[];
  refs: ColumnRef[];
}

type RelLogOpNode = Node<{
  label: string;
  rowNumber: number;
  range?: { start: string; end: string };
  dependOnCols?: DependOnCols;
  requiredCols?: RequiredCols;
}>;

export function RelLogOpNode({ data, selected }: NodeProps<RelLogOpNode>) {
  const [openDepend, setOpenDepend] = useState(false);
  const [openRequired, setOpenRequired] = useState(false);

  return (
    <BaseNode 
      className="p-0 bg-green-50" 
      selected={selected}
    >
      <h2 className="rounded-tl-md rounded-tr-md bg-green-100 text-center text-sm text-muted-foreground">
        <BaseHandle
          id={`target-${data.label}`}
          title=""
          type="target"
          position={Position.Left}
        />
        <div className="flex min-w-0 items-start p-1">
          <span className="flex-shrink-0 bg-green-200 px-1.5 py-0.5 rounded text-xs mr-2">
            <HoverCard>
              <HoverCardTrigger asChild>
                <span className="inline-flex items-center gap-1 cursor-help">
                  RelLogOp
                </span>
              </HoverCardTrigger>
              <HoverCardContent className="w-80 text-left">
                <div className="space-y-2">
                  <h4 className="font-bold text-lg">Relational Logical Operator</h4>
                  <p className="text-sm">
                    Produces a table (a set of rows and columns). These operators are involved 
                    in operations that manipulate or filter tabular data.
                  </p>
                  <div className="text-xs text-muted-foreground">
                    Example: A table scan that outputs a subset of columns or rows from a larger table.
                  </div>
                </div>
              </HoverCardContent>
            </HoverCard>
          </span>
          <div className="min-w-0 flex-1 px-1">
            <div className="break-words">{data.label}</div>
          </div>
          <span className="flex-shrink-0 px-1.5">#{data.rowNumber}</span>
        </div>
        <BaseHandle
          id={`source-${data.label}`}
          title=""
          type="source"
          position={Position.Right}
        />
      </h2>
      <div className="p-2">
        {data.range && (
          <div className="flex mb-2">
            <div className="bg-green-200 px-1.5 py-0.5 rounded text-xs">
              {data.range.start}-{data.range.end}
            </div>
          </div>
        )}
        <div className="space-y-1">
          {data.dependOnCols && data.dependOnCols.indices.length > 0 && (
            <Collapsible
              open={openDepend}
              onOpenChange={setOpenDepend}
              className="w-full"
            >
              <CollapsibleTrigger className="w-full flex items-center bg-green-200/50 hover:bg-green-200 text-xs text-left px-2 py-1 rounded-sm border-0 [&:not([data-state=open])]:rounded-b-sm">
                {openDepend ? <ChevronDown className="h-3 w-3 shrink-0" /> : <ChevronRight className="h-3 w-3 shrink-0" />}
                <span className="ml-1 font-semibold">Depend On Cols</span>
              </CollapsibleTrigger>
              <CollapsibleContent className="bg-green-50 px-2 py-1 rounded-b-sm">
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
          {data.requiredCols && data.requiredCols.indices.length > 0 && (
            <Collapsible
              open={openRequired}
              onOpenChange={setOpenRequired}
              className="w-full"
            >
              <CollapsibleTrigger className="w-full flex items-center bg-green-200/50 hover:bg-green-200 text-xs text-left px-2 py-1 rounded-sm border-0 [&:not([data-state=open])]:rounded-b-sm">
                {openRequired ? <ChevronDown className="h-3 w-3 shrink-0" /> : <ChevronRight className="h-3 w-3 shrink-0" />}
                <span className="ml-1 font-semibold">Required Cols</span>
              </CollapsibleTrigger>
              <CollapsibleContent className="bg-green-50 px-2 py-1 rounded-b-sm">
                <table className="w-full text-xs">
                  <TableBody>
                    {data.requiredCols.indices.map((index, i) => (
                      <TableRow key={index}>
                        <TableCell className="py-0 pl-0">{index}</TableCell>
                        <TableCell className="py-0">
                          {cleanTableName(data.requiredCols?.refs[i]?.table)}[{data.requiredCols?.refs[i]?.column}]
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </table>
              </CollapsibleContent>
            </Collapsible>
          )}
        </div>
      </div>
    </BaseNode>
  );
}