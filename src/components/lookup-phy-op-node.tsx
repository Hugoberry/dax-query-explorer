import { Node, NodeProps, Position } from '@xyflow/react';
import { TableBody, TableCell, TableRow } from '@/components/ui/table';
import { BaseNode } from '@/components/base-node';
import { LabeledHandle } from '@/components/labeled-handle';
import { cleanTableName } from '@/lib/utils';

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
}>;

export function LookupPhyOpNode({ data, selected }: NodeProps<LookupPhyOpNode>) {
  const label = typeof data.label === 'string'
    ? data.label
    : `${data.label.name}<${data.label.param?.name || ''}>`;

  return (
    <BaseNode 
      className="p-0 bg-orange-50" 
      selected={selected}
    >
      <h2 className="rounded-tl-md rounded-tr-md bg-orange-100 text-center text-sm text-muted-foreground">
        <LabeledHandle
          id={`target-${label}`}
          title=""
          type="target"
          position={Position.Left}
        />
        {label} #{data.rowNumber}
        <span className="ml-1 px-1.5 py-0.5 bg-orange-200 rounded text-xs">LookupPhyOp</span>
        <LabeledHandle
          id={`source-${label}`}
          title=""
          type="source"
          position={Position.Right}
        />
      </h2>
      <div className="p-2">
        {data.logOp && (
          <div className="text-xs mb-2 font-bold">
            LogOp: {data.logOp}
          </div>
        )}
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
        {data.fieldCols !== undefined && (
          <div className="text-xs mb-1">
            <span className="font-semibold">Field Cols: </span>
            {data.fieldCols}
          </div>
        )}
        {data.dataType && (
          <div className="text-xs mb-1">
            <span className="font-semibold">Data Type: </span>
            {data.dataType}
          </div>
        )}
        {data.dominantValue && (
          <div className="text-xs mb-2">
            <span className="font-semibold">Dominant Value: </span>
            {data.dominantValue}
          </div>
        )}
        {data.lookupCols && data.lookupCols.indices.length > 0 && (
          <div>
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
      </div>
    </BaseNode>
  );
}