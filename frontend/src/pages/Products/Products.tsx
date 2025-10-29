import type { FC } from "react";
import { useEffect, useState } from "react";
import useDebounce from "../../hooks/useDebounce";
import { useParams, useNavigate } from "react-router-dom";
import Button from "../../components/Button/Button";
import ProductCard from "../../components/ProductCard/ProductCard";
import Pagination from "../../components/Pagination/Pagination";
import type { ProductCardData } from "../../components/ProductCard/ProductCard";
import type { ProductResponse } from "../../models/modelResponse/ProductResponse.tsx";
import type { SubcategoryResponse } from "../../models/modelResponse/SubcategoryResponse.tsx";
import type { PaginationResponse } from "../../models/modelResponse/PaginationResponse.tsx";
import { productServices } from "../../services/ProductServices.tsx";
import { subcategoryServices } from "../../services/SubcategoryServices.tsx";
import { categoryServices } from "../../services/CategoryServices.tsx";

const Products: FC = () => {
    const navigate = useNavigate();
    const { id } = useParams<{ id: string }>();
    const [products, setProducts] = useState<ProductResponse[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
    const [subcategories, setSubcategories] = useState<SubcategoryResponse[]>([]);
    const [selectedSubcats, setSelectedSubcats] = useState<Record<number, boolean>>({});
    const [searchTerm, setSearchTerm] = useState<string>("");
    const debouncedSearchTerm = useDebounce(searchTerm, 500);
    const [sortBy, setSortBy] = useState<string>("");
    const [error, setError] = useState<string | null>(null);
    const [pagination, setPagination] = useState<PaginationResponse<ProductResponse> | null>(null);
    const [currentPage, setCurrentPage] = useState<number>(1);
    const [pageSize, setPageSize] = useState<number>(10);

    const categoryId = id ? parseInt(id) : null;


    // fall back to first page after changing category or pageSize
    useEffect(() => {
        setCurrentPage(1);
    }, [categoryId, pageSize]);

    // load filtered prods, fall back to home if category invalid
    useEffect(() => {
        let mounted = true;
        (async () => {
            if (!categoryId) return;
            
            try {
                setLoading(true);
                setError(null);
                
                const categories = await categoryServices.getAllCategoryAsync();
                const category = categories.find(cat => cat.id === categoryId);
                
                if (!category || !category.isActive) {
                    navigate("/");
                    return;
                }
                
                if (mounted) {
                    setSelectedCategory(categoryId);
                }
                
                const response = await productServices.getProductsByCategory({ 
                    categoryId: categoryId, 
                    searchTerm: debouncedSearchTerm || undefined,
                    sortBy: sortBy || undefined,
                    page: currentPage,
                    pageSize: pageSize
                });
                
                if (mounted) {
                    setProducts(response.data);
                    setPagination(response);
                }
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            } catch (err) {
                if (mounted) {
                    setError('Không thể tải dữ liệu sản phẩm');
                }
            } finally {
                if (mounted) setLoading(false);
            }
        })();
        return () => { mounted = false; };
    }, [categoryId, debouncedSearchTerm, sortBy, currentPage, pageSize, navigate]);

    // fetch subcat by category  
    const refreshSubcategories = async () => {
        if (selectedCategory == null) {
            setSubcategories([]);
            setSelectedSubcats({});
            return;
        }
        try {
            const subs = await subcategoryServices.getAllSubcategories(selectedCategory);
            setSubcategories(subs);
            setSelectedSubcats({});
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        } catch (err) {
            // Silently handle subcategory refresh errors
        }
    };

    // load subcat whenever category changes
    useEffect(() => {
        let mounted = true;
        (async () => {
            if (selectedCategory == null) {
                setSubcategories([]);
                setSelectedSubcats({});
                return;
            }
            const subs = await subcategoryServices.getAllSubcategories(selectedCategory);
            if (mounted) {
                setSubcategories(subs);
                setSelectedSubcats({});
            }
        })();
        return () => { mounted = false; };
    }, [selectedCategory]);

    // listen for subcat change
    useEffect(() => {
        const handleStorageChange = (e: StorageEvent) => {
            if (e.key === 'subcategoryUpdated' && e.newValue) {
                refreshSubcategories();
                localStorage.removeItem('subcategoryUpdated');
            }
        };

        window.addEventListener('storage', handleStorageChange);
        return () => window.removeEventListener('storage', handleStorageChange);
    }, [selectedCategory]);


    // apply filters and fetch 
    async function applyFilters() {
        if (categoryId == null) return;
        
        const subcatIds = Object.entries(selectedSubcats)
            .filter(([, v]) => v)
            .map(([k]) => Number(k));

        let response: PaginationResponse<ProductResponse>;
        const searchParams = {
            categoryId: categoryId,
            searchTerm: debouncedSearchTerm || undefined,
            sortBy: sortBy || undefined,
            page: currentPage,
            pageSize: pageSize
        };

        if (subcatIds.length > 0) {
            response = await productServices.getProductsBySubcategories({
                categoryId: categoryId,
                subcategoryIds: subcatIds,
                searchTerm: debouncedSearchTerm || undefined,
                sortBy: sortBy || undefined,
                page: currentPage,
                pageSize: pageSize
            });
        } else {
            response = await productServices.getProductsByCategory(searchParams);
        }
        
        setProducts(response.data);
        setPagination(response);
    }

    const handlePageChange = (page: number) => {
        setCurrentPage(page);
    };

    // map API model to card model
    const mappedProducts: ProductCardData[] = products.map((p) => ({
        id: String(p.id),
        name: p.name,
        seller: p.shopName ?? "Unknown Shop",
        category: p.categoryName ?? "Unknown Category",
        rating: Math.round(p.averageRating),
        reviews: p.reviewCount,
        sold: p.totalSold,
        complaintRate: p.complaintRate,
        stock: p.totalStock,
        minPrice: p.minPrice ?? 0,
        maxPrice: p.maxPrice ?? 0,
        descriptionItems: p.details ? p.details.split('\n').filter(line => line.trim()) : (p.description ? [p.description] : []),
        imageLetter: p.name.charAt(0).toUpperCase(),
        gradient: getGradientForCategory(p.categoryName),
    }));

    // generate gradient based on category
    function getGradientForCategory(categoryName?: string | null): string {
        switch (categoryName?.toLowerCase()) {
            case 'gmail':
                return 'bg-gradient-to-br from-red-500 to-pink-600';
            case 'phần mềm':
                return 'bg-gradient-to-br from-blue-500 to-indigo-600';
            case 'tài khoản':
                return 'bg-gradient-to-br from-purple-500 to-violet-600';
            case 'khác':
                return 'bg-gradient-to-br from-gray-500 to-slate-600';
            default:
                return 'bg-gradient-to-br from-emerald-500 to-teal-600';
        }
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Đang tải sản phẩm...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
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
        <div className="h-full px-4 py-5">
            <div className="mb-4 rounded-lg bg-white p-4 shadow">
                <div className="flex flex-col gap-3 md:flex-row md:items-center">
                    <input
                        type="text"
                        placeholder="Tìm kiếm sản phẩm..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full rounded-md border-2 border-gray-200 px-4 py-2.5 outline-none focus:border-emerald-500"
                    />
                </div>

                <div className="mt-3 flex flex-wrap gap-2 border-b border-gray-200 pb-2 text-sm">
                    <Button 
                        onClick={() => setSortBy("")}
                        className={`rounded-md px-3 py-2 ${sortBy === "" ? "font-medium text-emerald-600" : "text-gray-600 hover:text-emerald-600"}`}
                    >
                        Phổ biến
                    </Button>
                    <Button 
                        onClick={() => setSortBy("price_asc")}
                        className={`rounded-md px-3 py-2 ${sortBy === "price_asc" ? "font-medium text-emerald-600" : "text-gray-600 hover:text-emerald-600"}`}
                    >
                        Giá tăng dần
                    </Button>
                    <Button 
                        onClick={() => setSortBy("price_desc")}
                        className={`rounded-md px-3 py-2 ${sortBy === "price_desc" ? "font-medium text-emerald-600" : "text-gray-600 hover:text-emerald-600"}`}
                    >
                        Giá giảm dần
                    </Button>
                    <Button 
                        onClick={() => setSortBy("rating_desc")}
                        className={`rounded-md px-3 py-2 ${sortBy === "rating_desc" ? "font-medium text-emerald-600" : "text-gray-600 hover:text-emerald-600"}`}
                    >
                        Đánh giá cao
                    </Button>
                </div>
            </div>

            <div className="flex flex-col gap-5 md:flex-row">
                <aside className="w-full shrink-0 md:w-64">
                    <div className="rounded-lg bg-white p-4 shadow">
                        <h3 className="mb-1 text-lg font-semibold text-gray-800">Bộ lọc</h3>
                        <p className="mb-3 text-sm text-gray-500">Chọn loại sản phẩm</p>
                        {selectedCategory != null && (
                            <div className="mt-3">
                                <h4 className="mb-1 text-sm font-semibold text-gray-700">Phân loại</h4>
                                <div className="flex flex-col gap-2 text-sm">
                                    {subcategories.map((s) => (
                                        <label key={s.id} htmlFor={`sub-${s.id}`} className="flex cursor-pointer items-center gap-2">
                                            <input
                                                id={`sub-${s.id}`}
                                                type="checkbox"
                                                className="h-4 w-4"
                                                checked={!!selectedSubcats[s.id]}
                                                onChange={(e) => setSelectedSubcats(prev => ({ ...prev, [s.id]: e.target.checked }))}
                                            />
                                            <span className="text-gray-700">{s.name}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>
                        )}
                        <Button className="mt-3 w-full rounded-md bg-emerald-600 px-4 py-2.5 font-semibold text-white hover:bg-emerald-700 md:w-auto" onClick={applyFilters}>
                            Tìm kiếm
                        </Button>
                    </div>
                </aside>

                <section className=" flex-1">
                    {!loading && pagination && (
                        <div className="mb-4 flex items-center justify-between">
                            <div className="text-sm text-gray-600">
                                Hiển thị {mappedProducts.length} trong tổng số {pagination.totalItems} sản phẩm
                            </div>
                            <div className="flex items-center gap-2">
                                <label className="text-sm text-gray-600">Hiển thị:</label>
                                <select
                                    value={pageSize}
                                    onChange={(e) => setPageSize(Number(e.target.value))}
                                    className="rounded-md border border-gray-300 px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                >
                                    <option value={10}>10</option>
                                    <option value={20}>20</option>
                                </select>
                            </div>
                        </div>
                    )}
                    
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-2">
                        {(loading ? [] : mappedProducts).map((p) => (
                            <ProductCard key={p.id} product={p} />
                        ))}
                        {!loading && mappedProducts.length === 0 && (
                            <div className="col-span-full text-center text-sm text-gray-500">Không có sản phẩm phù hợp.</div>
                        )}
                    </div>
                    
                    {pagination && pagination.totalPages > 1 && (
                        <div className="mt-8">
                            <Pagination
                                currentPage={pagination.currentPage}
                                totalPages={pagination.totalPages}
                                onPageChange={handlePageChange}
                                className="mt-6"
                            />
                        </div>
                    )}
                </section>
            </div>
        </div>
    );
};

export default Products;


