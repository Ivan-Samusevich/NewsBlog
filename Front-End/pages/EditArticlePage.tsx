import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { User } from '../types';
import { useCategories } from '../hooks/useCategories';
import { useArticle } from '../hooks/useArticle';

const EditArticlePage: React.FC<{ user: User | null }> = ({ user }) => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  
  // Data Fetching Hooks
  const { categories } = useCategories();
  const { article, loading: articleLoading, error } = useArticle(slug);

  // Form State
  const [title, setTitle] = useState('');
  const [excerpt, setExcerpt] = useState('');
  const [content, setContent] = useState('');
  const [categoryId, setCategoryId] = useState<number | ''>('');
  const [submitting, setSubmitting] = useState(false);

  // Security Check
  useEffect(() => {
    if (user?.role?.type !== 'editor') {
      navigate('/');
    }
  }, [user, navigate]);

  // Sync Article Data to Form
  useEffect(() => {
    if (article) {
      setTitle(article.attributes.title);
      setExcerpt(article.attributes.excerpt);
      setContent(article.attributes.content);
      if (article.attributes.category?.data?.id) {
        setCategoryId(article.attributes.category.data.id);
      }
    } else if (error) {
      alert("Article not found");
      navigate('/');
    }
  }, [article, error, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!categoryId || !article) return;
    setSubmitting(true);
    
    try {
      await api.updateArticle(article.id, {
        title,
        excerpt,
        content,
        category: categoryId,
      });
      navigate(`/article/${slug}`);
    } catch (e) {
      alert("Failed to update article");
    } finally {
      setSubmitting(false);
    }
  };

  if (articleLoading) return <div className="text-center py-20">Loading...</div>;

  return (
    <div className="max-w-2xl mx-auto bg-white p-8 rounded-xl shadow-sm border border-slate-100">
      <h1 className="text-2xl font-bold mb-6 text-slate-900">Edit Article</h1>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Title</label>
          <input 
            type="text" 
            value={title}
            onChange={e => setTitle(e.target.value)}
            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary outline-none"
            required
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Category</label>
          <select 
            value={categoryId}
            onChange={e => setCategoryId(Number(e.target.value))}
            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary outline-none"
            required
          >
            <option value="" disabled>Select a category</option>
            {categories.map(cat => (
              <option key={cat.id} value={cat.id}>{cat.attributes.name}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Excerpt (Short Summary)</label>
          <textarea 
            value={excerpt}
            onChange={e => setExcerpt(e.target.value)}
            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary outline-none"
            rows={3}
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Content (Markdown)</label>
          <textarea 
            value={content}
            onChange={e => setContent(e.target.value)}
            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary outline-none font-mono text-sm"
            rows={10}
            required
          />
        </div>

        <div className="flex justify-end space-x-4 pt-4">
          <button 
            type="button" 
            onClick={() => navigate(`/article/${slug}`)}
            className="px-4 py-2 text-slate-600 font-medium hover:text-slate-800"
          >
            Cancel
          </button>
          <button 
            type="submit" 
            disabled={submitting}
            className="bg-primary hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-bold transition-colors disabled:opacity-50"
          >
            {submitting ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditArticlePage;