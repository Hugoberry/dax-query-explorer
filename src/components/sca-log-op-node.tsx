import { Node, NodeProps, Position } from '@xyflow/react';
import { TableBody, TableCell, TableRow } from '@/components/ui/table';
import { BaseNode } from '@/components/base-node';
import { LabeledHandle } from '@/components/labeled-handle';
import { cleanTableName } from '@/lib/utils';

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
  const label = typeof data.label === 'string' 
    ? data.label 
    : `${cleanTableName(data.label.table)}[${data.label.column}]`;

  return (
    <BaseNode 
      className="p-0 bg-blue-50" 
      selected={selected}
    >
      <h2 className="rounded-tl-md rounded-tr-md bg-blue-100 text-center text-sm text-muted-foreground">
        <LabeledHandle
          id={`target-${label}`}
          title=""
          type="target"
          position={Position.Left}
        />
        <div className="flex min-w-0 items-start p-1">
          <span className="flex-shrink-0 bg-blue-200 px-1.5 py-0.5 rounded text-xs mr-2">
          ScaLogOp
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
        {data.dominantValue && (
          <div className="text-xs mb-1">
            <span className="font-semibold">Dominant Value: </span>
            {data.dominantValue}
          </div>
        )}
        {data.dataType && (
          <div className="text-xs mb-2">
            <span className="font-semibold">Data Type: </span>
            {data.dataType}
          </div>
        )}
        {data.dependOnCols && data.dependOnCols.indices.length > 0 && (
          <div>
            <div className="text-xs font-semibold mb-1">Depend On Cols:</div>
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
          </div>
        )}
      </div>
    </BaseNode>
  );
}