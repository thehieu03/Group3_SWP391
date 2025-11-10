/**
 * Custom hook for managing product form state
 */

import { useState, useEffect, useCallback } from "react";
import { categoryServices } from "@services/CategoryServices";
import { subcategoryServices } from "@services/SubcategoryServices";
import type { CategoriesResponse } from "@/models/modelResponse/CategoriesResponse";
import type { SubcategoryResponse } from "@/models/modelResponse/SubcategoryResponse";

interface UseProductFormProps {
  isOpen: boolean;
  shopId: number;
}

export const useProductForm = ({ isOpen, shopId }: UseProductFormProps) => {
  // Form state
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [categoryId, setCategoryId] = useState<number | null>(null);
  const [subcategoryId, setSubcategoryId] = useState<number | null>(null);
  const [details, setDetails] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Categories and subcategories
  const [categories, setCategories] = useState<CategoriesResponse[]>([]);
  const [subcategories, setSubcategories] = useState<SubcategoryResponse[]>([]);

  // Load categories
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const data = await categoryServices.getAllCategoryAsync();
        setCategories(data);
      } catch {
        // Failed to load categories
      }
    };
    void loadCategories();
  }, []);

  // Load subcategories when category changes
  useEffect(() => {
    const loadSubcategories = async () => {
      if (categoryId) {
        try {
          const data = await subcategoryServices.getAllSubcategories(categoryId);
          setSubcategories(data);
        } catch {
          setSubcategories([]);
        }
      } else {
        setSubcategories([]);
      }
    };
    void loadSubcategories();
  }, [categoryId]);

  // Reset form when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setName("");
      setDescription("");
      setCategoryId(null);
      setSubcategoryId(null);
      setDetails("");
      setImage(null);
      setImagePreview(null);
    }
  }, [isOpen]);

  // Handle image change
  const handleImageChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  }, []);

  return {
    // Form state
    name,
    description,
    categoryId,
    subcategoryId,
    details,
    image,
    imagePreview,
    loading,
    categories,
    subcategories,
    // Setters
    setName,
    setDescription,
    setCategoryId,
    setSubcategoryId,
    setDetails,
    setImage,
    setImagePreview,
    setLoading,
    // Handlers
    handleImageChange,
  };
};

