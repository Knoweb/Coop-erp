import React from 'react';

interface Column<T> {
  header: string;
  accessor: (row: T) => React.ReactNode;
  align?: 'left' | 'center' | 'right';
  width?: string;
}

interface PrintableTableProps<T> {
  columns: Column<T>[];
  data: T[];
  totalLabel?: string;
  totalValue?: string | number;
}

export function PrintableTable<T>({ columns, data, totalLabel, totalValue }: PrintableTableProps<T>) {
  return (
    <table className="print-table">
      <thead>
        <tr>
          {columns.map((col, idx) => (
            <th 
              key={idx} 
              className={col.align === 'right' ? 'numeric' : ''}
              style={{ width: col.width, textAlign: col.align || 'left' }}
            >
              {col.header}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {data.map((row, rowIdx) => (
          <tr key={rowIdx}>
            {columns.map((col, colIdx) => (
              <td 
                key={colIdx} 
                className={col.align === 'right' ? 'numeric' : ''}
                style={{ textAlign: col.align || 'left' }}
              >
                {col.accessor(row)}
              </td>
            ))}
          </tr>
        ))}
        {totalLabel && totalValue !== undefined && (
          <tr>
            <td colSpan={columns.length - 1} style={{ textAlign: 'right', fontWeight: 'bold' }}>
              {totalLabel}
            </td>
            <td className="numeric" style={{ fontWeight: 'bold' }}>
              {totalValue}
            </td>
          </tr>
        )}
      </tbody>
    </table>
  );
}
