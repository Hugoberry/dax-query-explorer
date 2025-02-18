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
import { ChevronDown, ChevronRight} from 'lucide-react';

interface ColumnRef {
  table: string;
  column: string;
}

interface LookupCols {
  type: 'LookupCols';
  indices: string[];
  refs: ColumnRef[];
}

type LookupPhyOpNode = Node<{
  label: string | { type: string; name: string; param: any };
  rowNumber: number;
  logOp?: string;
  records?: number;
  keyCols?: number;
  valueCols?: number;
  fieldCols?: number;
  dataType?: string;
  dominantValue?: string;
  lookupCols?: LookupCols;
  numericLiteral?: string;
}>;

export function LookupPhyOpNode({ data, selected }: NodeProps<LookupPhyOpNode>) {
  const [openLookup, setOpenLookup] = useState(false);

  const label = typeof data.label === 'string'
    ? data.label
    : `${data.label.name} <${data.label.param?.name || ''}>`;

  const hasStats = data.records !== undefined || 
    data.keyCols !== undefined || 
    data.valueCols !== undefined || 
    data.fieldCols !== undefined;

  return (
    <BaseNode 
      className="p-0 bg-orange-50" 
      selected={selected}
    >
      <h2 className="rounded-tl-md rounded-tr-md bg-orange-100 text-center text-sm text-muted-foreground">
        <BaseHandle
          id={`target-${label}`}
          title=""
          type="target"
          position={Position.Left}
        />
        <div className="flex min-w-0 items-start p-1">
          <span className="flex-shrink-0 bg-orange-200 px-1.5 py-0.5 rounded text-xs mr-2">
            <HoverCard>
              <HoverCardTrigger asChild>
                <span className="inline-flex items-center gap-1 cursor-help">
                  LookupPhyOp
                </span>
              </HoverCardTrigger>
              <HoverCardContent className="w-80 text-left">
                <div className="space-y-2">
                  <h4 className="font-bold text-lg">Lookup Physical Operator</h4>
                  <p className="text-sm">
                    Given a current row as input, this operator computes and returns a scalar value. 
                    It is often used to resolve expressions that require fetching data from another context.
                  </p>
                  <div className="text-xs text-muted-foreground">
                    Example: A lookup that retrieves a single value based on a key from an iterator's output.
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
        {data.logOp && (
          <div className="text-lg mb-2 font-bold text-center">
            {data.logOp}
          </div>
        )}
        <div className="flex flex-wrap gap-2 items-center mb-2">
          {hasStats && (
            <div className="flex gap-2 text-xs">
              {data.records !== undefined && (
                <div className="bg-orange-100 px-1.5 py-0.5 rounded">
                  <span className="font-medium">Records:</span> {data.records.toLocaleString()}
                </div>
              )}
              {data.keyCols !== undefined && (
                <div className="bg-orange-100 px-1.5 py-0.5 rounded">
                  <span className="font-medium">K:</span> {data.keyCols}
                </div>
              )}
              {data.valueCols !== undefined && (
                <div className="bg-orange-100 px-1.5 py-0.5 rounded">
                  <span className="font-medium">V:</span> {data.valueCols}
                </div>
              )}
              {data.fieldCols !== undefined && (
                <div className="bg-orange-100 px-1.5 py-0.5 rounded">
                  <span className="font-medium">F:</span> {data.fieldCols}
                </div>
              )}
            </div>
          )}
          {data.dataType && (
            <div className="bg-orange-200 px-1.5 py-0.5 rounded text-xs">
              {data.dataType}
            </div>
          )}
          {data.dominantValue && (
            <div className="bg-orange-200 px-1.5 py-0.5 rounded text-xs">
              {data.dominantValue}
            </div>
          )}
          {data.numericLiteral && (
            <div className="bg-orange-200 px-1.5 py-0.5 rounded text-xs">
              {data.numericLiteral}
            </div>
          )}
        </div>
        {data.lookupCols && data.lookupCols.indices.length > 0 && (
          <Collapsible
            open={openLookup}
            onOpenChange={setOpenLookup}
            className="w-full"
          >
            <CollapsibleTrigger className="w-full flex items-center bg-orange-200/50 hover:bg-orange-200 text-xs text-left px-2 py-1 rounded-sm border-0 [&:not([data-state=open])]:rounded-b-sm">
              {openLookup ? <ChevronDown className="h-3 w-3 shrink-0" /> : <ChevronRight className="h-3 w-3 shrink-0" />}
              <span className="ml-1 font-semibold">Lookup Cols</span>
            </CollapsibleTrigger>
            <CollapsibleContent className="bg-orange-50 px-2 py-1 rounded-b-sm">
              <table className="w-full text-xs">
                <TableBody>
                  {data.lookupCols.indices.map((index, i) => (
                    <TableRow key={index}>
                      <TableCell className="py-0 pl-0">{index}</TableCell>
                      <TableCell className="py-0">
                        {cleanTableName(data.lookupCols?.refs[i]?.table)}[{data.lookupCols?.refs[i]?.column}]
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