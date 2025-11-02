import { useState, useEffect } from 'react';
import type { CategoriesResponse } from '../../models/modelResponse/CategoriesResponse';
import type { SubcategoryResponse } from '../../models/modelResponse/SubcategoryResponse';
import { categoryServices } from '@services/CategoryServices.ts';

interface ApiError {
  response?: {
    status?: number;
    data?: {
      message?: string;
      errors?: Record<string, unknown>;
    };
  };
}

const CategoryManagement = () => {
  const [categories, setCategories] = useState<CategoriesResponse[]>([]);
  const [subcategories, setSubcategories] = useState<SubcategoryResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showSubcategories, setShowSubcategories] = useState<number | null>(null);
  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [isAddingSubcategory, setIsAddingSubcategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newSubcategoryName, setNewSubcategoryName] = useState('');
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true);
        setError(null);
        const categoriesData = await categoryServices.getAllCategoryAsync();
        setCategories(categoriesData);
      } catch (err: unknown) {
        const errorMessage = err instanceof Error && 'response' in err 
          ? (err as ApiError).response?.data?.message 
          : 'Không thể tải danh sách danh mục';
        setError(errorMessage || 'Không thể tải danh sách danh mục');
      } finally {
        setLoading(false);
      }
    };

    void fetchCategories();
  }, []);

  const handleAddCategory = async () => {
    if (!newCategoryName.trim()) return;
    
    const newCategory: CategoriesResponse = {
      id: categories.length + 1,
      name: newCategoryName,
      isActive: true,
      createdAt: new Date().toISOString(),
      subcategories: []
    };
    
    setCategories([...categories, newCategory]);
    setNewCategoryName('');
    setIsAddingCategory(false);
  };

  const handleAddSubcategory = async () => {
    if (!newSubcategoryName.trim() || !selectedCategoryId) return;
    
    const newSubcategory: SubcategoryResponse = {
      id: subcategories.length + 1,
      categoryId: selectedCategoryId,
      name: newSubcategoryName,
      isActive: true,
      createdAt: new Date().toISOString(),
    };
    
    setSubcategories([...subcategories, newSubcategory]);
    setNewSubcategoryName('');
    setSelectedCategoryId(null);
    setIsAddingSubcategory(false);
  };

  const toggleCategoryStatus = async (categoryId: number) => {
    setCategories(categories.map(cat => 
      cat.id === categoryId ? { ...cat, isActive: !cat.isActive } : cat
    ));
  };

  const toggleSubcategoryStatus = async (subcategoryId: number) => {
    setSubcategories(subcategories.map(sub => 
      sub.id === subcategoryId ? { ...sub, isActive: !sub.isActive } : sub
    ));
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700"
          >
            Thử lại
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Quản lý danh mục</h1>
        <button
          onClick={() => setIsAddingCategory(true)}
          className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-md"
        >
          Thêm danh mục
        </button>
      </div>

      {isAddingCategory && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Thêm danh mục mới</h3>
            <input
              type="text"
              value={newCategoryName}
              onChange={(e) => setNewCategoryName(e.target.value)}
              placeholder="Tên danh mục"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 mb-4"
            />
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => {
                  setIsAddingCategory(false);
                  setNewCategoryName('');
                }}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Hủy
              </button>
              <button
                onClick={handleAddCategory}
                className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600"
              >
                Thêm
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-4">
        {categories.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <div className="text-gray-500 mb-4">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Chưa có danh mục nào</h3>
            <p className="text-gray-500 mb-4">Bắt đầu bằng cách thêm danh mục đầu tiên của bạn.</p>
            <button
              onClick={() => setIsAddingCategory(true)}
              className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-md"
            >
              Thêm danh mục đầu tiên
            </button>
          </div>
        ) : (
          categories.map((category) => (
          <div key={category.id} className="bg-white rounded-lg shadow">
            <div className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <h3 className="text-lg font-medium text-gray-900">{category.name}</h3>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                    category.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {category.isActive ? 'Hoạt động' : 'Không hoạt động'}
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => {
                      setSelectedCategoryId(category.id);
                      setIsAddingSubcategory(true);
                    }}
                    className="text-blue-600 hover:text-blue-800 text-sm"
                  >
                    Thêm subcategory
                  </button>
                  <button
                    onClick={() => {
                      alert(`Xem tất cả subcategory của ${category.name} (ID: ${category.id})`);
                    }}
                    className="text-green-600 hover:text-green-800 text-sm font-medium"
                  >
                    View all subcategory
                  </button>
                  <button
                    onClick={() => setShowSubcategories(showSubcategories === category.id ? null : category.id)}
                    className="text-gray-600 hover:text-gray-800 text-sm"
                  >
                    {showSubcategories === category.id ? 'Ẩn' : 'Hiện'} subcategories
                  </button>
                  <button
                    onClick={() => toggleCategoryStatus(category.id)}
                    className={`px-3 py-1 text-xs rounded-md ${
                      category.isActive 
                        ? 'bg-red-100 text-red-800 hover:bg-red-200' 
                        : 'bg-green-100 text-green-800 hover:bg-green-200'
                    }`}
                  >
                    {category.isActive ? 'Vô hiệu hóa' : 'Kích hoạt'}
                  </button>
                </div>
              </div>

              {showSubcategories === category.id && (
                <div className="mt-4 pl-4 border-l-2 border-gray-200">
                  <div className="space-y-2">
                    {category.subcategories && category.subcategories.length > 0 ? (
                      category.subcategories.map((subcategory) => (
                        <div key={subcategory.id} className="flex items-center justify-between py-2">
                          <div className="flex items-center space-x-3">
                            <span className="text-gray-600">•</span>
                            <span className="text-gray-900">{subcategory.name}</span>
                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                              subcategory.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                            }`}>
                              {subcategory.isActive ? 'Hoạt động' : 'Không hoạt động'}
                            </span>
                          </div>
                          <button
                            onClick={() => toggleSubcategoryStatus(subcategory.id)}
                            className={`px-2 py-1 text-xs rounded-md ${
                              subcategory.isActive 
                                ? 'bg-red-100 text-red-800 hover:bg-red-200' 
                                : 'bg-green-100 text-green-800 hover:bg-green-200'
                            }`}
                          >
                            {subcategory.isActive ? 'Vô hiệu hóa' : 'Kích hoạt'}
                          </button>
                        </div>
                      ))
                    ) : (
                      <div className="text-gray-500 text-sm py-2">
                        Chưa có subcategory nào. Nhấn "Thêm subcategory" để thêm mới.
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
          ))
        )}
      </div>

      {isAddingSubcategory && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Thêm subcategory mới</h3>
            <select
              value={selectedCategoryId || ''}
              onChange={(e) => setSelectedCategoryId(Number(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 mb-4"
            >
              <option value="">Chọn danh mục</option>
              {categories.map(category => (
                <option key={category.id} value={category.id}>{category.name}</option>
              ))}
            </select>
            <input
              type="text"
              value={newSubcategoryName}
              onChange={(e) => setNewSubcategoryName(e.target.value)}
              placeholder="Tên subcategory"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 mb-4"
            />
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => {
                  setIsAddingSubcategory(false);
                  setNewSubcategoryName('');
                  setSelectedCategoryId(null);
                }}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Hủy
              </button>
              <button
                onClick={handleAddSubcategory}
                className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600"
              >
                Thêm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CategoryManagement;
