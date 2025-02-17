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
  return (
    <BaseNode 
      className="p-0 bg-green-50" 
      selected={selected}
    >
      <h2 className="rounded-tl-md rounded-tr-md bg-green-100 text-center text-sm text-muted-foreground">
        <LabeledHandle
          id={`target-${data.label}`}
          title=""
          type="target"
          position={Position.Left}
        />
        <div className="flex min-w-0 items-start p-1">
          <span className="flex-shrink-0 bg-green-200 px-1.5 py-0.5 rounded text-xs mr-2">
          RelLogOp
          </span>
          <div className="min-w-0 flex-1 px-1">
            <div className="break-words">{data.label}</div>
          </div>
          <span className="flex-shrink-0 px-1.5">#{data.rowNumber}</span>
        </div>
        <LabeledHandle
          id={`source-${data.label}`}
          title=""
          type="source"
          position={Position.Right}
        />
      </h2>
      <div className="p-2">
        {data.range && (
          <div className="text-xs mb-2">
            <span className="font-semibold">Range: </span>
            {data.range.start}-{data.range.end}
          </div>
        )}
        {data.dependOnCols && data.dependOnCols.indices.length > 0 && (
          <div className="mb-2">
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
        {data.requiredCols && data.requiredCols.indices.length > 0 && (
          <div>
            <div className="text-xs font-semibold mb-1">Required Cols:</div>
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
          </div>
        )}
      </div>
    </BaseNode>
  );
}