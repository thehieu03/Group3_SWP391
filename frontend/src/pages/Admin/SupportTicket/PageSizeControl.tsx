interface PageSizeControlProps {
  totalItems: number;
  startIndex: number;
  endIndex: number;
  pageSize: number;
  onPageSizeChange: (size: number) => void;
}

const PageSizeControl = ({
  totalItems,
  startIndex,
  endIndex,
  pageSize,
  onPageSizeChange,
}: PageSizeControlProps) => {
  return (
    <div className="bg-white rounded-lg shadow p-4 mb-4 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
      <div className="flex items-center gap-2">
        <span className="text-sm text-gray-600">Hiển thị</span>
        <select
          value={pageSize}
          onChange={(e) => onPageSizeChange(Number(e.target.value))}
          className="px-2 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
        >
          <option value={5}>5</option>
          <option value={10}>10</option>
          <option value={15}>15</option>
        </select>
        <span className="text-sm text-gray-600">bản ghi mỗi trang</span>
      </div>
      <div className="text-sm text-gray-600">
        {totalItems > 0
          ? `Hiển thị ${startIndex} - ${endIndex} trên ${totalItems} bản ghi`
          : "Không có bản ghi"}
      </div>
    </div>
  );
};

export default PageSizeControl;
