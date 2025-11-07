import React from 'react';
import type { CategoriesResponse } from '@/models/modelResponse/CategoriesResponse';
import indexHomeCategory from '@/assets/indexHomeCategory';
import { useNavigate } from 'react-router-dom';
import routesConfig from '@config/routesConfig.ts';
import Image from '@components/Image';

interface CategoryListProps {
    categories: CategoriesResponse[];
}

const CategoryList: React.FC<CategoryListProps> = ({ categories }) => {
    const navigate = useNavigate();
    
    const categoryIcons = [
        indexHomeCategory.logoEmail,
        indexHomeCategory.logoTools,
        indexHomeCategory.logoAccount,
        indexHomeCategory.logoDiff
    ];

    const categoryDescriptions = [
        "Gmail, yahoo mail, hot mail... và nhiều hơn thế nữa",
        "Các phần mềm chuyên dụng cho kiếm tiền online từ những coder uy tín",
        "Fb, BM, key window, kaspersky....",
        "Các sản phẩm số khác"
    ];

    const handleCategoryClick = (categoryId: number) => {
        navigate(routesConfig.getCategoryProductsUrl(categoryId));
    };

    return (
        <div className="w-full max-w-4xl mx-auto px-4 py-8">
            <h2 className="text-2xl font-bold text-green-600 text-center mb-8">
                -- DANH SÁCH SẢN PHẨM --
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {categories.slice(0, 4).map((category, index) => (
                    <div 
                        key={category.id}
                        className="bg-gray-50 border border-green-500 rounded-lg p-6 text-center hover:shadow-md transition-shadow duration-200 cursor-pointer"
                        style={{ cursor: 'pointer' }}
                        onClick={() => handleCategoryClick(category.id)}
                    >
                        <div className="flex justify-center mb-4">
                            <div className="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center">
                                <Image 
                                    src={categoryIcons[index]} 
                                    alt={category.name}
                                    className="w-8 h-8 object-contain"
                                />
                            </div>
                        </div>
                        
                        <h3 className="text-lg font-bold text-green-600 mb-2">
                            {category.name}
                        </h3>
                        
                        <p className="text-sm text-gray-600 leading-relaxed">
                            {categoryDescriptions[index]}
                        </p>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default CategoryList;
