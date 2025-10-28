'use client';

interface Column {
  key: string;
  label: string;
}

interface DataTableProps {
  columns: Column[];
  data: any[];
  renderCell: (item: any, column: string) => React.ReactNode;
  isLoading?: boolean;
  emptyMessage?: string;
  maxHeight?: string;
}

export default function DataTable({ 
  columns, 
  data, 
  renderCell, 
  isLoading = false, 
  emptyMessage = "No data available",
  maxHeight = "400px"
}: DataTableProps) {
  return (
    <div className="overflow-x-auto" style={{ height: maxHeight, overflowY: 'auto' }}>
      <table className="w-full border-collapse">
        <thead className="sticky top-0 bg-card-bg z-10">
          <tr>
            {columns.map((column) => (
              <th
                key={column.key}
                className="text-left py-3 px-4 border-b border-border-color text-text-secondary font-semibold text-sm"
              >
                {column.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {isLoading ? (
            <tr>
              <td colSpan={columns.length} className="py-8 text-center text-text-secondary">
                <div className="flex items-center justify-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-accent-color"></div>
                  Loading...
                </div>
              </td>
            </tr>
          ) : data.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="py-8 text-center text-text-secondary">
                {emptyMessage}
              </td>
            </tr>
          ) : (
            data.map((item, index) => (
              <tr key={index} className="hover:bg-white/3">
                {columns.map((column) => (
                  <td
                    key={column.key}
                    className="py-3 px-4 border-b border-white/5"
                  >
                    {renderCell(item, column.key)}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
