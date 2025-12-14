import { useState, useEffect } from 'react';
import { api } from '../services/api';
import { Category, StrapiAttributes } from '../types';

export const useCategories = () => {
  const [categories, setCategories] = useState<StrapiAttributes<Category>[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await api.getCategories();
        setCategories(res.data);
      } catch (error) {
        console.error("Failed to fetch categories", error);
      } finally {
        setLoading(false);
      }
    };
    fetchCategories();
  }, []);

  return { categories, loading };
};