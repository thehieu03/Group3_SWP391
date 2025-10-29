import { useState, useEffect, useMemo } from 'react';
import type { CategoriesResponse } from '../../models/modelResponse/CategoriesResponse';
import type { SubcategoryResponse } from '../../models/modelResponse/SubcategoryResponse';
import { categoryServices } from '../../services/CategoryServices';
import { subcategoryServices } from '../../services/SubcategoryServices';
import Pagination from '../../components/Pagination/Pagination';

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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showSubcategories, setShowSubcategories] = useState<number | null>(null);
  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [isAddingSubcategory, setIsAddingSubcategory] = useState(false);
  const [isEditingCategory, setIsEditingCategory] = useState(false);
  const [isEditingSubcategory, setIsEditingSubcategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newSubcategoryName, setNewSubcategoryName] = useState('');
  const [editingCategoryId, setEditingCategoryId] = useState<number | null>(null);
  const [editingCategoryName, setEditingCategoryName] = useState<string>('');
  const [editingSubcategoryId, setEditingSubcategoryId] = useState<number | null>(null);
  const [editingSubcategoryName, setEditingSubcategoryName] = useState<string>('');
  const [editingSubcategoryCategoryId, setEditingSubcategoryCategoryId] = useState<number | null>(null);
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);
  const [selectedCategoryName, setSelectedCategoryName] = useState<string>('');
  const [categoryNameError, setCategoryNameError] = useState<string>('');
  const [subcategoryNameError, setSubcategoryNameError] = useState<string>('');
  const [categorySubcategories, setCategorySubcategories] = useState<Record<number, SubcategoryResponse[]>>({});
  const [loadingSubcategories, setLoadingSubcategories] = useState<Record<number, boolean>>({});
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [itemsPerPage, setItemsPerPage] = useState(5);

  const filteredCategories = useMemo(() => {
    let filtered = categories;
    
    // search filter
    if (searchTerm.trim()) {
      filtered = filtered.filter(category => 
        category.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // status filter
    if (statusFilter !== 'all') {
      const isActive = statusFilter === 'active';
      filtered = filtered.filter(category => category.isActive === isActive);
    }
    
    return filtered;
  }, [categories, searchTerm, statusFilter]);

  // Reset to page 1 when page size changes
  useEffect(() => {
    setCurrentPage(1);
  }, [itemsPerPage]);

  // fetch categories on change
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true);
        setError(null);
        const isActiveFilter = statusFilter === 'all' ? undefined : statusFilter === 'active';
        const paginatedData = await categoryServices.getCategoriesPaginated(currentPage, itemsPerPage, isActiveFilter);
        setCategories(paginatedData.data);
        setTotalPages(paginatedData.totalPages);
        setTotalItems(paginatedData.totalItems);
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
  }, [currentPage, itemsPerPage, statusFilter]);

  // load subcat by catId
  const fetchSubcategoriesForCategory = async (categoryId: number) => {
    try {
      setLoadingSubcategories(prev => ({ ...prev, [categoryId]: true }));
      const subcats = await subcategoryServices.getAllSubcategories(categoryId, true);
      setCategorySubcategories(prev => ({ ...prev, [categoryId]: subcats }));
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (err) {
      // Silently handle subcategory fetch errors
    } finally {
      setLoadingSubcategories(prev => ({ ...prev, [categoryId]: false }));
    }
  };

  const openAddSubcategoryPopup = (categoryId: number, categoryName: string) => {
    setSelectedCategoryId(categoryId);
    setSelectedCategoryName(categoryName);
    setNewSubcategoryName('');
    setSubcategoryNameError('');
    setIsAddingSubcategory(true);
  };

  const openEditCategoryPopup = (categoryId: number, categoryName: string) => {
    setEditingCategoryId(categoryId);
    setEditingCategoryName(categoryName);
    setCategoryNameError('');
    setIsEditingCategory(true);
  };

  const openEditSubcategoryPopup = (subcategoryId: number, subcategoryName: string, categoryId: number) => {
    setEditingSubcategoryId(subcategoryId);
    setEditingSubcategoryName(subcategoryName);
    setEditingSubcategoryCategoryId(categoryId);
    setSubcategoryNameError('');
    setIsEditingSubcategory(true);
  };

  // error message 
  const getErrorMessage = (err: unknown, defaultMessage: string): string => {
    return err instanceof Error && 'response' in err 
      ? (err as ApiError).response?.data?.message || defaultMessage
      : defaultMessage;
  };

  // refresh category list
  const refreshCategories = async () => {
    const isActiveFilter = statusFilter === 'all' ? undefined : statusFilter === 'active';
    const paginatedData = await categoryServices.getCategoriesPaginated(currentPage, itemsPerPage, isActiveFilter);
    setCategories(paginatedData.data);
    setTotalPages(paginatedData.totalPages);
    setTotalItems(paginatedData.totalItems);
  };

  // create new category
  const handleAddCategory = async () => {
    if (!newCategoryName.trim()) {
      setCategoryNameError('Tên danh mục không được để trống');
      return;
    }
    
    setCategoryNameError('');
    
    try {
      await categoryServices.createCategory(newCategoryName.trim());
      await refreshCategories();
      localStorage.setItem('categoryUpdated', 'true');
      setNewCategoryName('');
      setIsAddingCategory(false);
    } catch (err: unknown) {
      alert(getErrorMessage(err, 'Không thể tạo danh mục'));
    }
  };

  // update category 
  const handleEditCategory = async () => {
    if (!editingCategoryName.trim()) {
      setCategoryNameError('Tên danh mục không được để trống');
      return;
    }
    
    if (!editingCategoryId) return;
    
    setCategoryNameError('');
    
    try {
      await categoryServices.updateCategory(editingCategoryId, editingCategoryName.trim());
      await refreshCategories();
      localStorage.setItem('categoryUpdated', 'true');
      setEditingCategoryName('');
      setEditingCategoryId(null);
      setIsEditingCategory(false);
    } catch (err: unknown) {
      alert(getErrorMessage(err, 'Không thể cập nhật danh mục'));
    }
  };

  // create new subcat for selected category
  const handleAddSubcategory = async () => {
    if (!newSubcategoryName.trim()) {
      setSubcategoryNameError('Tên danh mục con không được để trống');
      return;
    }
    
    if (!selectedCategoryId) return;
    
    setSubcategoryNameError('');
    
    try {
      await subcategoryServices.createSubcategory({
        categoryId: selectedCategoryId,
        name: newSubcategoryName.trim()
      });
      
      await fetchSubcategoriesForCategory(selectedCategoryId);
      localStorage.setItem('subcategoryUpdated', 'true');
      
      setNewSubcategoryName('');
      setSelectedCategoryId(null);
      setIsAddingSubcategory(false);
    } catch (err: unknown) {
      alert(getErrorMessage(err, 'Không thể tạo danh mục con'));
    }
  };

  // update subcat 
  const handleEditSubcategory = async () => {
    if (!editingSubcategoryName.trim()) {
      setSubcategoryNameError('Tên danh mục con không được để trống');
      return;
    }
    
    if (!editingSubcategoryId || !editingSubcategoryCategoryId) return;
    
    setSubcategoryNameError('');
    
    try {
      await subcategoryServices.updateSubcategory(editingSubcategoryId, editingSubcategoryName.trim());
      await fetchSubcategoriesForCategory(editingSubcategoryCategoryId);
      localStorage.setItem('subcategoryUpdated', 'true');
      
      setEditingSubcategoryName('');
      setEditingSubcategoryId(null);
      setEditingSubcategoryCategoryId(null);
      setIsEditingSubcategory(false);
    } catch (err: unknown) {
      alert(getErrorMessage(err, 'Không thể cập nhật danh mục con'));
    }
  };

  // Activate/Deactivate a category and its subcategories if deactivated
  const toggleCategoryStatus = async (categoryId: number) => {
    try {
      const category = categories.find(cat => cat.id === categoryId);
      if (!category) return;

      if (category.isActive) {
        await categoryServices.deactivateCategory(categoryId);
        setCategorySubcategories(prev => {
          const updated = { ...prev };
          if (updated[categoryId]) {
            updated[categoryId] = updated[categoryId].map(sub => ({ ...sub, isActive: false }));
          }
          return updated;
        });
      } else {
        await categoryServices.activateCategory(categoryId);
        if (categorySubcategories[categoryId]) {
          await fetchSubcategoriesForCategory(categoryId);
        }
      }

      await refreshCategories();
      localStorage.setItem('categoryUpdated', 'true');
    } catch (err: unknown) {
      alert(getErrorMessage(err, 'Không thể cập nhật trạng thái danh mục'));
    }
  };

  // Activate/Deactivate a subcategory 
  const toggleSubcategoryStatus = async (subcategoryId: number, categoryId: number) => {
    try {
      const subcategory = categorySubcategories[categoryId]?.find(sub => sub.id === subcategoryId);
      if (!subcategory) return;

      if (subcategory.isActive) {
        await subcategoryServices.deactivateSubcategory(subcategoryId);
      } else {
        await subcategoryServices.activateSubcategory(subcategoryId);
      }

      await fetchSubcategoriesForCategory(categoryId);
    } catch (err: unknown) {
      alert(getErrorMessage(err, 'Không thể cập nhật trạng thái danh mục con'));
    }
  };

  // Change current page for category list pagination
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
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
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900">Quản lý danh mục</h1>
          <div className="mt-1 flex items-center gap-4">
            <p className="text-sm text-gray-600">
              Hiển thị {filteredCategories.length} trong tổng số {totalItems} danh mục
              {statusFilter !== 'all' && (
                <span className="ml-2 px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                  {statusFilter === 'active' ? 'Hoạt động' : 'Không hoạt động'}
                </span>
              )}
            </p>
            <div className="flex items-center gap-2">
              <label className="text-sm text-gray-600">Hiển thị:</label>
              <select
                value={itemsPerPage}
                onChange={(e) => setItemsPerPage(Number(e.target.value))}
                className="rounded-md border border-gray-300 px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={20}>20</option>
              </select>
            </div>
          </div>
        </div>
        <button
          onClick={() => setIsAddingCategory(true)}
          className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-md"
        >
          Thêm danh mục
        </button>
      </div>

      {/* Search and Filter bar */}
      <div className="mb-6">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Search input */}
          <div className="flex-1 max-w-md">
            <input
              type="text"
              placeholder="Tìm kiếm danh mục..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-green-500 focus:outline-none"
            />
          </div>
          
          {/* Status filter */}
          <div className="flex-shrink-0">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as 'all' | 'active' | 'inactive')}
              className="px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-green-500 focus:outline-none bg-white"
            >
              <option value="all">Tất cả trạng thái</option>
              <option value="active">Hoạt động</option>
              <option value="inactive">Không hoạt động</option>
            </select>
          </div>
        </div>
      </div>

      {isAddingCategory && (
        <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50 p-4">
          <div className="bg-white rounded-lg p-16 w-full max-w-2xl shadow-xl border">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">Thêm danh mục mới</h3>
              <button
                onClick={() => {
                  setIsAddingCategory(false);
                  setNewCategoryName('');
                  setCategoryNameError('');
                }}
                className="text-gray-400 hover:text-gray-600 text-xl"
              >
                ×
              </button>
            </div>
            
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tên danh mục
              </label>
              <input
                type="text"
                value={newCategoryName}
                onChange={(e) => {
                  setNewCategoryName(e.target.value);
                  setCategoryNameError('');
                }}
                placeholder="Nhập tên danh mục"
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 ${
                  categoryNameError ? 'border-red-500' : 'border-gray-300'
                }`}
                autoFocus
              />
              {categoryNameError && (
                <p className="text-red-500 text-sm mt-1">{categoryNameError}</p>
              )}
            </div>
            
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => {
                  setIsAddingCategory(false);
                  setNewCategoryName('');
                  setCategoryNameError('');
                }}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Hủy
              </button>
              <button
                onClick={handleAddCategory}
                className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600"
              >
                Thêm danh mục
              </button>
            </div>
          </div>
        </div>
      )}

      {isEditingCategory && (
        <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50 p-4">
          <div className="bg-white rounded-lg p-16 w-full max-w-2xl shadow-xl border">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">Sửa danh mục</h3>
              <button
                onClick={() => {
                  setIsEditingCategory(false);
                  setEditingCategoryName('');
                  setEditingCategoryId(null);
                  setCategoryNameError('');
                }}
                className="text-gray-400 hover:text-gray-600 text-xl"
              >
                ×
              </button>
            </div>
            
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tên danh mục
              </label>
              <input
                type="text"
                value={editingCategoryName}
                onChange={(e) => {
                  setEditingCategoryName(e.target.value);
                  setCategoryNameError('');
                }}
                placeholder="Nhập tên danh mục"
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 ${
                  categoryNameError ? 'border-red-500' : 'border-gray-300'
                }`}
                autoFocus
              />
              {categoryNameError && (
                <p className="text-red-500 text-sm mt-1">{categoryNameError}</p>
              )}
            </div>
            
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => {
                  setIsEditingCategory(false);
                  setEditingCategoryName('');
                  setEditingCategoryId(null);
                  setCategoryNameError('');
                }}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Hủy
              </button>
              <button
                onClick={handleEditCategory}
                className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600"
              >
                Cập nhật
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-4">
        {searchTerm.trim() && filteredCategories.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <h3 className="text-xl font-semibold text-gray-600 mb-2">
              Không tìm thấy danh mục
            </h3>
            <p className="text-gray-500">
              Không có danh mục nào có tên "{searchTerm}"
            </p>
          </div>
        ) : filteredCategories.length === 0 ? (
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
          filteredCategories.map((category) => (
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
                <div className="flex items-center space-x-4">
                  <button
                    onClick={() => openEditCategoryPopup(category.id, category.name)}
                    className="text-blue-600 hover:text-blue-800 text-sm px-2 py-1 rounded hover:bg-blue-50"
                  >
                    Sửa
                  </button>
                  <button
                    onClick={() => openAddSubcategoryPopup(category.id, category.name)}
                    className="text-blue-600 hover:text-blue-800 text-sm px-2 py-1 rounded hover:bg-blue-50"
                  >
                    Thêm subcat
                  </button>
                  <button
                    onClick={() => {
                      if (showSubcategories === category.id) {
                        setShowSubcategories(null);
                      } else {
                        setShowSubcategories(category.id);
                        if (!categorySubcategories[category.id]) {
                          fetchSubcategoriesForCategory(category.id);
                        }
                      }
                    }}
                    className="text-gray-600 hover:text-gray-800 text-sm px-2 py-1 rounded hover:bg-gray-50"
                  >
                    {showSubcategories === category.id ? 'Ẩn' : 'Hiện'} subcat
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
                      {loadingSubcategories[category.id] ? (
                        <div className="flex items-center justify-center py-4">
                          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-green-500"></div>
                          <span className="ml-2 text-sm text-gray-600">Đang tải subcategories...</span>
                        </div>
                      ) : categorySubcategories[category.id] && categorySubcategories[category.id].length > 0 ? (
                        categorySubcategories[category.id].map((subcategory) => (
                          <div key={subcategory.id} className="flex items-center justify-between py-2">
                            <div className="flex items-center space-x-3">
                              <span className="text-gray-600">•</span>
                              <span className={`${!category.isActive ? 'text-gray-400' : 'text-gray-900'}`}>
                                {subcategory.name}
                              </span>
                              <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                                subcategory.isActive && category.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                              }`}>
                                {subcategory.isActive && category.isActive ? 'Hoạt động' : 'Không hoạt động'}
                              </span>
                            </div>
                            <div className="flex items-center space-x-3">
                              <button
                                onClick={() => openEditSubcategoryPopup(subcategory.id, subcategory.name, category.id)}
                                className="text-blue-600 hover:text-blue-800 text-xs px-2 py-1 rounded hover:bg-blue-50"
                              >
                                Sửa
                              </button>
                              {category.isActive && (
                                <button
                                  onClick={() => toggleSubcategoryStatus(subcategory.id, category.id)}
                                  className={`px-2 py-1 text-xs rounded-md ${
                                    subcategory.isActive 
                                      ? 'bg-red-100 text-red-800 hover:bg-red-200' 
                                      : 'bg-green-100 text-green-800 hover:bg-green-200'
                                  }`}
                                >
                                  {subcategory.isActive ? 'Vô hiệu hóa' : 'Kích hoạt'}
                                </button>
                              )}
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="text-gray-500 text-sm py-2">
                          {categorySubcategories[category.id] ? 'Chưa có subcategory nào. Nhấn "Thêm subcategory" để thêm mới.' : 'Nhấn "Hiện subcat" để tải subcategories.'}
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

      {totalPages > 1 && (
        <div className="mt-8 flex justify-center">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
          />
        </div>
      )}

      {isAddingSubcategory && (
        <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50 p-4">
          <div className="bg-white rounded-lg p-8 w-full max-w-2xl shadow-xl border">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">Thêm subcat</h3>
              <button
                onClick={() => {
                  setIsAddingSubcategory(false);
                  setNewSubcategoryName('');
                  setSelectedCategoryId(null);
                  setSelectedCategoryName('');
                  setSubcategoryNameError('');
                }}
                className="text-gray-400 hover:text-gray-600 text-xl"
              >
                ×
              </button>
            </div>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Danh mục cha
              </label>
              <input
                type="text"
                value={selectedCategoryName}
                readOnly
                className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-600 cursor-not-allowed"
              />
            </div>
            
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tên subcat
              </label>
              <input
                type="text"
                value={newSubcategoryName}
                onChange={(e) => {
                  setNewSubcategoryName(e.target.value);
                  setSubcategoryNameError('');
                }}
                placeholder="Nhập tên danh mục con"
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 ${
                  subcategoryNameError ? 'border-red-500' : 'border-gray-300'
                }`}
                autoFocus
              />
              {subcategoryNameError && (
                <p className="text-red-500 text-sm mt-1">{subcategoryNameError}</p>
              )}
            </div>
            
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => {
                  setIsAddingSubcategory(false);
                  setNewSubcategoryName('');
                  setSelectedCategoryId(null);
                  setSelectedCategoryName('');
                  setSubcategoryNameError('');
                }}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Hủy
              </button>
              <button
                onClick={handleAddSubcategory}
                className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600"
              >
                Thêm subcat
              </button>
            </div>
          </div>
        </div>
      )}

      {isEditingSubcategory && (
        <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50 p-4">
          <div className="bg-white rounded-lg p-8 w-full max-w-2xl shadow-xl border">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">Sửa subcat</h3>
              <button
                onClick={() => {
                  setIsEditingSubcategory(false);
                  setEditingSubcategoryName('');
                  setEditingSubcategoryId(null);
                  setEditingSubcategoryCategoryId(null);
                  setSubcategoryNameError('');
                }}
                className="text-gray-400 hover:text-gray-600 text-xl"
              >
                ×
              </button>
            </div>
            
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tên subcat
              </label>
              <input
                type="text"
                value={editingSubcategoryName}
                onChange={(e) => {
                  setEditingSubcategoryName(e.target.value);
                  setSubcategoryNameError('');
                }}
                placeholder="Nhập tên danh mục con"
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 ${
                  subcategoryNameError ? 'border-red-500' : 'border-gray-300'
                }`}
                autoFocus
              />
              {subcategoryNameError && (
                <p className="text-red-500 text-sm mt-1">{subcategoryNameError}</p>
              )}
            </div>
            
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => {
                  setIsEditingSubcategory(false);
                  setEditingSubcategoryName('');
                  setEditingSubcategoryId(null);
                  setEditingSubcategoryCategoryId(null);
                  setSubcategoryNameError('');
                }}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Hủy
              </button>
              <button
                onClick={handleEditSubcategory}
                className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600"
              >
                Cập nhật
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CategoryManagement;
