import React from 'react';
import type { ProductResponse } from '../../models/modelResponse/ProductResponse';
import Image from '../Image';

interface HomeSearchItemProps {
    product: ProductResponse;
    onClick: () => void;
}

const HomeSearchItem: React.FC<HomeSearchItemProps> = ({ product, onClick }) => {
    return (
        <div 
            className="flex items-center p-3 hover:bg-gray-100 cursor-pointer border-b border-gray-200 last:border-b-0"
            onClick={onClick}
        >
            <div className="w-12 h-12 mr-3 flex-shrink-0">
                <Image 
                    src={product.image} 
                    alt={product.name}
                    className="w-full h-full object-cover rounded-md"
                />
            </div>
            <div className="flex-1 min-w-0">
                <h4 className="text-sm font-medium text-gray-900 truncate">
                    {product.name}
                </h4>
                <p className="text-xs text-gray-500 truncate">
                    {product.description}
                </p>
            </div>
        </div>
    );
};

export default HomeSearchItem;
