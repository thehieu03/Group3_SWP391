import { memo } from "react";
import type { CategoriesResponse } from "@/models/modelResponse/CategoriesResponse";
import type { SubcategoryResponse } from "@/models/modelResponse/SubcategoryResponse";

interface EditProductBasicInfoProps {
  name: string;
  description: string;
  categoryId: number | null;
  subcategoryId: number | null;
  details: string;
  imagePreview: string | null;
  hasNewImage: boolean;
  categories: CategoriesResponse[];
  subcategories: SubcategoryResponse[];
  onNameChange: (value: string) => void;
  onDescriptionChange: (value: string) => void;
  onCategoryChange: (value: number | null) => void;
  onSubcategoryChange: (value: number | null) => void;
  onDetailsChange: (value: string) => void;
  onImageChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const EditProductBasicInfo = memo(({
  name,
  description,
  categoryId,
  subcategoryId,
  details,
  imagePreview,
  hasNewImage,
  categories,
  subcategories,
  onNameChange,
  onDescriptionChange,
  onCategoryChange,
  onSubcategoryChange,
  onDetailsChange,
  onImageChange,
}: EditProductBasicInfoProps) => {
  return (
    <>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Tên sản phẩm *
        </label>
        <input
          type="text"
          value={name}
          onChange={(e) => onNameChange(e.target.value)}
          required
          maxLength={100}
          placeholder="Nhập tên sản phẩm (tối đa 100 ký tự)"
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <p className="text-xs text-gray-500 mt-1">
          {name.length}/100 ký tự
        </p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Mô tả *
        </label>
        <textarea
          value={description}
          onChange={(e) => onDescriptionChange(e.target.value)}
          required
          rows={3}
          maxLength={500}
          placeholder="Nhập mô tả sản phẩm (tối đa 500 ký tự)"
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <p className="text-xs text-gray-500 mt-1">
          {description.length}/500 ký tự
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Danh mục *
          </label>
          <select
            value={categoryId || ""}
            onChange={(e) => onCategoryChange(Number(e.target.value) || null)}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Chọn danh mục</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Danh mục con
          </label>
          <select
            value={subcategoryId || ""}
            onChange={(e) =>
              onSubcategoryChange(Number(e.target.value) || null)
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={!categoryId}
          >
            <option value="">Chọn danh mục con</option>
            {subcategories.map((sub) => (
              <option key={sub.id} value={sub.id}>
                {sub.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Chi tiết
        </label>
        <textarea
          value={details}
          onChange={(e) => onDetailsChange(e.target.value)}
          rows={4}
          placeholder="Nhập chi tiết sản phẩm (tùy chọn)"
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <p className="text-xs text-gray-500 mt-1">
          Thông tin chi tiết về sản phẩm (tùy chọn)
        </p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Hình ảnh
        </label>
        {imagePreview && (
          <div className="mb-2">
            <img
              src={imagePreview}
              alt="Preview"
              className="w-32 h-32 object-cover rounded-md border border-gray-300"
            />
            {hasNewImage && (
              <p className="text-xs text-green-600 mt-1">
                ✓ Hình ảnh mới đã được chọn
              </p>
            )}
          </div>
        )}
        <input
          type="file"
          accept="image/*"
          onChange={onImageChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <p className="text-xs text-gray-500 mt-1">
          Để trống nếu không muốn thay đổi hình ảnh. Kích thước tối đa: 10MB
        </p>
      </div>
    </>
  );
});

EditProductBasicInfo.displayName = "EditProductBasicInfo";

export default EditProductBasicInfo;

