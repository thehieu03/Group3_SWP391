import { useState, useEffect } from 'react';
import type { CategoriesResponse } from '../../models/modelResponse/CategoriesResponse';
import type { SubcategoryResponse } from '../../models/modelResponse/SubcategoryResponse';

const CategoryManagement = () => {
  const [categories, setCategories] = useState<CategoriesResponse[]>([]);
  const [subcategories, setSubcategories] = useState<SubcategoryResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [showSubcategories, setShowSubcategories] = useState<number | null>(null);
  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [isAddingSubcategory, setIsAddingSubcategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newSubcategoryName, setNewSubcategoryName] = useState('');
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);

  useEffect(() => {
    // TODO: Fetch categories and subcategories from API
    // Simulate loading data
    setTimeout(() => {
      setCategories([
        {
          id: 1,
          name: 'Email',
          isActive: true,
          createdAt: '2024-01-01',
          subcategories: [
            { id: 1, categoryId: 1, name: 'Gmail', isActive: true },
            { id: 2, categoryId: 1, name: 'Yahoo Mail', isActive: true },
            { id: 3, categoryId: 1, name: 'Outlook', isActive: true },
          ]
        },
        {
          id: 2,
          name: 'Phần mềm',
          isActive: true,
          createdAt: '2024-01-02',
          subcategories: [
            { id: 4, categoryId: 2, name: 'Phần mềm MMO', isActive: true },
            { id: 5, categoryId: 2, name: 'Phần mềm Marketing', isActive: true },
          ]
        },
        {
          id: 3,
          name: 'Tài khoản',
          isActive: true,
          createdAt: '2024-01-03',
          subcategories: [
            { id: 6, categoryId: 3, name: 'Facebook', isActive: true },
            { id: 7, categoryId: 3, name: 'Instagram', isActive: true },
            { id: 8, categoryId: 3, name: 'Twitter', isActive: true },
          ]
        },
      ]);
      setLoading(false);
    }, 1000);
  }, []);

  const handleAddCategory = async () => {
    if (!newCategoryName.trim()) return;
    
    // TODO: Call API to add category
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
    
    // TODO: Call API to add subcategory
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
    // TODO: Call API to toggle category status
    setCategories(categories.map(cat => 
      cat.id === categoryId ? { ...cat, isActive: !cat.isActive } : cat
    ));
  };

  const toggleSubcategoryStatus = async (subcategoryId: number) => {
    // TODO: Call API to toggle subcategory status
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

      {/* Add Category Modal */}
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

      {/* Categories List */}
      <div className="space-y-4">
        {categories.map((category) => (
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

              {/* Subcategories */}
              {showSubcategories === category.id && (
                <div className="mt-4 pl-4 border-l-2 border-gray-200">
                  <div className="space-y-2">
                    {category.subcategories?.map((subcategory) => (
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
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Add Subcategory Modal */}
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
