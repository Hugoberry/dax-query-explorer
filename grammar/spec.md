# DAX Query Plan Operators

## Logical Operators

### Scalar Logical Operators (ScaLogOp)

- **DependOnCols**: Specifies columns from the left-side of a tree on which the current logical operator depends. The operator may return different values for each distinct combination of these columns.

- **Data Type**: Indicates one of the six data types supported by DAX. Values returned by the operator must be of this data type or be the BLANK value.

- **DominantValue**: Captures the sparsity of a scalar logical operator. When set to NONE, the operator is dense; otherwise, it is sparse. Sparse operators can lead to more efficient execution plans.

### Relational Logical Operators (RelLogOp)

- **DependOnCols**: Similar to ScaLogOp, it marks columns on which the current relational operator depends. The operator may return different tables for each distinct combination of these columns.

- **Range of Column Numbers**: Assigns continuous column numbers to all columns in the relation header, displaying them as a range (e.g., 4-141). This property may be missing when a relation has no columns.

- **RequiredCols**: Represents the union of DependOnCols and the subset of columns from the relation header needed to answer a query.

## Physical Operators

### Lookup Physical Operators (LookupPhyOp)

- **LookupCols**: Columns supplied by an iterator whose values are used to calculate a scalar value.

- **Data Type**: Specifies one of the six data types supported by DAX. Values returned by the operator must be of this data type or be the BLANK value.

### Iterator Physical Operators (IterPhyOp)

- **LookupCols**: Identical to the same property in LookupPhyOp.

- **IterCols**: Columns output by the iterator.

An iterator can function as:

- A pure iterator (only has the IterCols property).

- A table-valued function (has both LookupCols and IterCols properties).

- A pure row checker (only has the LookupCols property).

For a more detailed exploration of these operators and their properties, refer to the article "DAX Query Plan, Part 2, Operator Properties" by Jeffrey Wang.
