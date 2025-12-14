import { useState, useEffect, useCallback } from 'react';
import { api } from '../services/api';
import { Article, StrapiAttributes } from '../types';

export const useArticles = () => {
  const [articles, setArticles] = useState<StrapiAttributes<Article>[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [meta, setMeta] = useState<any>(null);
  const [activeCategory, setActiveCategory] = useState<string | undefined>(undefined);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const articlesRes = await api.getArticles(page, activeCategory);
      setArticles(articlesRes.data);
      setMeta(articlesRes.meta);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [page, activeCategory]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleCategoryClick = (slug: string) => {
    setActiveCategory(prev => prev === slug ? undefined : slug);
    setPage(1); // Reset to page 1 on filter
  };

  const nextPage = () => setPage(p => p + 1);
  const prevPage = () => setPage(p => p - 1);

  return {
    articles,
    meta,
    loading,
    page,
    activeCategory,
    handleCategoryClick,
    nextPage,
    prevPage
  };
};