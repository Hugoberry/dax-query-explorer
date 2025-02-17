import { Node, NodeProps, Position } from '@xyflow/react';
import { TableBody, TableCell, TableRow } from '@/components/ui/table';
import { BaseNode } from '@/components/base-node';
import { LabeledHandle } from '@/components/labeled-handle';
import { cleanTableName } from '@/lib/utils';

interface ColumnRef {
  table: string;
  column: string;
}

interface IterCols {
  type: 'IterCols';
  indices: string[];
  refs: ColumnRef[];
}

interface LookupCols {
  type: 'LookupCols';
  indices: string[];
  refs: ColumnRef[];
}

type IterPhyOpNode = Node<{
  label: string | { type: string; name: string; param: any };
  rowNumber: number;
  logOp?: string;
  records?: number;
  keyCols?: number;
  valueCols?: number;
  fieldCols?: number;
  iterCols?: IterCols;
  lookupCols?: LookupCols;
}>;

export function IterPhyOpNode({ data, selected }: NodeProps<IterPhyOpNode>) {
  const label = typeof data.label === 'string'
    ? data.label
    : `${data.label.name} <${data.label.param?.name || ''}>`;

  const hasStats = data.records !== undefined || 
    data.keyCols !== undefined || 
    data.valueCols !== undefined || 
    data.fieldCols !== undefined;

  return (
    <BaseNode 
      className="p-0 bg-yellow-50" 
      selected={selected}
    >
      <h2 className="rounded-tl-md rounded-tr-md bg-yellow-100 text-center text-sm text-muted-foreground">
        <LabeledHandle
          id={`target-${label}`}
          title=""
          type="target"
          position={Position.Left}
        />
        <div className="flex min-w-0 items-start p-1">
          <span className="flex-shrink-0 bg-yellow-200 px-1.5 py-0.5 rounded text-xs mr-2">
            IterPhyOp
          </span>
          <div className="min-w-0 flex-1 px-1">
            <div className="break-words">{label}</div>
          </div>
          <span className="flex-shrink-0 px-1.5">#{data.rowNumber}</span>
        </div>
        <LabeledHandle
          id={`source-${label}`}
          title=""
          type="source"
          position={Position.Right}
        />
      </h2>
      <div className="p-2">
        {data.logOp && (
          <div className="text-mg mb-1 font-bold text-center">
            {data.logOp}
          </div>
        )}
        {hasStats && (
          <div className="flex gap-2 text-xs mb-2 flex-wrap">
            {data.records !== undefined && (
              <div className="bg-yellow-100 px-1.5 py-0.5 rounded">
                <span className="font-medium">Records:</span> {data.records.toLocaleString()}
              </div>
            )}
            {data.keyCols !== undefined && (
              <div className="bg-yellow-100 px-1.5 py-0.5 rounded">
                <span className="font-medium">K:</span> {data.keyCols}
              </div>
            )}
            {data.valueCols !== undefined && (
              <div className="bg-yellow-100 px-1.5 py-0.5 rounded">
                <span className="font-medium">V:</span> {data.valueCols}
              </div>
            )}
            {data.fieldCols !== undefined && (
              <div className="bg-yellow-100 px-1.5 py-0.5 rounded">
                <span className="font-medium">F:</span> {data.fieldCols}
              </div>
            )}
          </div>
        )}
        {data.lookupCols && data.lookupCols.indices.length > 0 && (
          <div className="mb-2">
            <div className="text-xs font-semibold mb-1">Lookup Cols:</div>
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
          </div>
        )}
        {data.iterCols && data.iterCols.indices.length > 0 && (
          <div>
            <div className="text-xs font-semibold mb-1">Iter Cols:</div>
            <table className="w-full text-xs">
              <TableBody>
                {data.iterCols.indices.map((index, i) => (
                  <TableRow key={index}>
                    <TableCell className="py-0 pl-0">{index}</TableCell>
                    <TableCell className="py-0">
                      {cleanTableName(data.iterCols?.refs[i]?.table)}[{data.iterCols?.refs[i]?.column}]
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </table>
          </div>
        )}
      </div>
    </BaseNode>
  );
}