import { Node, NodeProps, Position } from '@xyflow/react';

import { TableBody, TableCell, TableRow } from '@/components/ui/table';

import { BaseNode } from '@/components/base-node';
import { LabeledHandle } from '@/components/labeled-handle';

type DatabaseSchemaNode = Node<{
  label: string;
  schema: JsonField[];
}>;

const JsonValueDisplayTableCell = (props: { entry: JsonField }) => {
  const { entry } = props;
  let displayValue = '';
  let extraClass = '';
  const jsonValue = entry.value;
  displayValue = `"${jsonValue}"`;
  extraClass += 'text-pink-500';

  return (
    <TableCell className="pr-0 font-medium text-sm">
      <label className={`px-0 text-foreground p-0 ${extraClass}`}>
        {displayValue}
      </label>
    </TableCell>
  );
};

export function DatabaseSchemaNode({
  data,
  selected,
}: NodeProps<DatabaseSchemaNode>) {
  return (
    <BaseNode className="p-0" selected={selected}>
      <h2 className="rounded-tl-md rounded-tr-md bg-secondary text-center text-sm text-muted-foreground">
        {/* Input handle */}
        <LabeledHandle
          id={`target-${data.label}`}
          title="" // Remove the label from the handle
          type="target"
          position={Position.Left}
        />
        {data.label} {/* Only show the label once in the header */}
        {/* Output handle */}
        <LabeledHandle
          id={`source-${data.label}`}
          title="" // Remove the label from the handle
          type="source"
          position={Position.Right}
        />
      </h2>
      <table className="border-spacing-10 overflow-visible w-full">
        <TableBody>
          {data.schema.map((entry: JsonField) => (
            <TableRow key={entry.title} className="relative text-xs">
              <TableCell className="pl-0 text-right font-light">
                <label className={`px-3 text-foreground p-0 text-slate-300`}>
                  {entry.title}
                </label>
              </TableCell>
              <JsonValueDisplayTableCell
                entry={entry}
              ></JsonValueDisplayTableCell>
              <TableCell className="pr-0 text-right font-thin">
                {
                  <label className={`px-3 text-foreground p-0 text-slate-600`}>
                    {entry.type}
                  </label>
                }
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </table>
    </BaseNode>
  );
}
