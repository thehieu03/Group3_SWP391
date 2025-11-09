import { memo } from "react";

const ExcelImportGuide = memo(() => {
  return (
    <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
      <p className="text-xs font-semibold text-yellow-800 mb-1">
        📋 Hướng dẫn Import Excel:
      </p>
      <ul className="text-xs text-yellow-700 list-disc list-inside space-y-1">
        <li>
          File Excel phải có header ở dòng đầu tiên với các cột:{" "}
          <strong>Tên</strong>, <strong>Giá</strong>, <strong>Số lượng</strong>,{" "}
          <strong>Storage JSON</strong> (tùy chọn)
        </li>
        <li>Dòng 2 trở đi chứa dữ liệu variants (mỗi dòng = 1 variant)</li>
        <li>
          Storage JSON (nếu có) phải là một mảng JSON hợp lệ, ví dụ:{" "}
          <code className="bg-yellow-100 px-1 rounded">
            {`[{"username": "user1", "password": "pass1", "status": false}]`}
          </code>
        </li>
      </ul>
    </div>
  );
});

ExcelImportGuide.displayName = "ExcelImportGuide";

export default ExcelImportGuide;
