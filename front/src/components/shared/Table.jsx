export default function Table({ columns, children, toolbar }) {
  return (
    <div className="bg-white border border-[#ECE9F4] rounded-[14px] overflow-hidden">
      {toolbar && (
        <div className="flex justify-between items-center px-[18px] py-[16px] border-b border-[#ECE9F4]">
          {toolbar}
        </div>
      )}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-[13px]">
          {columns && (
            <thead>
              <tr>
                {columns.map((col) => (
                  <th
                    key={col}
                    className="text-left text-[11px] font-bold text-[#8B8B9E] uppercase tracking-[0.04em] px-[18px] py-[13px] border-b border-[#ECE9F4] bg-[#FBFAFD]"
                  >
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
          )}
          <tbody>{children}</tbody>
        </table>
      </div>
    </div>
  );
}

export function Tr({ children }) {
  return (
    <tr className="hover:bg-[#FBFAFD] border-b border-[#ECE9F4] last:border-b-0">
      {children}
    </tr>
  );
}

export function Td({ children, className = '' }) {
  return (
    <td className={`px-[18px] py-[14px] align-middle ${className}`}>
      {children}
    </td>
  );
}
