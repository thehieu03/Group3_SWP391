import type { SubcategoryResponse } from './SubcategoryResponse';

export interface CategoriesResponse {
    id: number;
    name: string;
    isActive: boolean;
    createdAt?: string;
    updatedAt?: string;
    subcategories?: SubcategoryResponse[];
}