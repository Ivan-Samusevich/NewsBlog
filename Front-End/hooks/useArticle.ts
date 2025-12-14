import { useState, useEffect, useCallback } from 'react';
import { api } from '../services/api';
import { Article, StrapiAttributes } from '../types';

export const useArticle = (slug: string | undefined) => {
  const [article, setArticle] = useState<StrapiAttributes<Article> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchArticle = useCallback(async () => {
    if (!slug) return;
    setLoading(true);
    setError(null);
    try {
      const res = await api.getArticleBySlug(slug);
      setArticle(res.data);
      if (!res.data) setError('Article not found');
    } catch (err) {
      console.error(err);
      setError('Failed to load article');
    } finally {
      setLoading(false);
    }
  }, [slug]);

  useEffect(() => {
    fetchArticle();
  }, [fetchArticle]);

  const removeArticle = async () => {
    if (!article) return false;
    try {
      await api.deleteArticle(article.id);
      return true;
    } catch (e) {
      console.error(e);
      return false;
    }
  };

  return { article, loading, error, removeArticle };
};