import React from 'react';

const Table = ({
  headers = [],
  children,
  className = '',
  emptyMessage = 'No data available',
  isEmpty = false,
}) => {
  return (
    <div className={`w-full overflow-x-auto rounded-[20px] border border-slate-200/50 shadow-premium ${className}`}>
      <table className="w-full text-left border-collapse bg-white">
        <thead>
          <tr className="border-b border-[#e9dfcc]/50 bg-[#faf6ee]/95 backdrop-blur-md sticky top-0 z-10 select-none">
            {headers.map((header, i) => (
              <th
                key={i}
                className="px-6 py-4 text-[10px] font-bold uppercase tracking-wider text-slate-400"
              >
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100/60 [&>tr:nth-child(even)]:bg-slate-50/25">
          {isEmpty ? (
            <tr>
              <td
                colSpan={headers.length}
                className="px-6 py-10 text-center text-sm text-slate-400 font-medium"
              >
                {emptyMessage}
              </td>
            </tr>
          ) : (
            children
          )}
        </tbody>
      </table>
    </div>
  );
};

export default Table;
