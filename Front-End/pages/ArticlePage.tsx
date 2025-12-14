import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { User } from '../types';
import { getImageUrl } from '../constants';
import { useArticle } from '../hooks/useArticle';

const ArticlePage: React.FC<{ user: User | null }> = ({ user }) => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { article, loading, error, removeArticle } = useArticle(slug);

  const handleDelete = async () => {
    if (!article || !window.confirm("Are you sure you want to delete this article?")) return;
    const success = await removeArticle();
    if (success) {
      alert("Article deleted successfully");
      navigate('/');
    } else {
      alert("Failed to delete. You might not have permission.");
    }
  };

  if (loading) return <div className="text-center py-20 text-slate-500">Loading article...</div>;
  if (error || !article) return <div className="text-center py-20 text-red-500">{error || 'Article not found'}</div>;

  const { title, content, publishedAt, coverImage, author, category, readingTime, views } = article.attributes;
  const isEditor = user?.role?.type === 'editor';

  return (
    <article className="max-w-3xl mx-auto bg-white rounded-2xl shadow-sm overflow-hidden border border-slate-100">
      <img 
        src={getImageUrl(coverImage?.data?.attributes?.url)} 
        alt={title}
        className="w-full h-80 object-cover"
      />
      
      <div className="p-8 md:p-12">
        {/* Meta Header */}
        <div className="flex flex-wrap items-center gap-4 text-sm text-slate-500 mb-6">
          {category?.data && (
            <span className="text-primary font-bold uppercase tracking-wider">
              {category.data.attributes.name}
            </span>
          )}
          <span>•</span>
          <span>{new Date(publishedAt).toLocaleDateString()}</span>
          <span>•</span>
          <span>{readingTime || 5} min read</span>
          <span>•</span>
          <span>{views || 0} views</span>
        </div>

        <h1 className="text-3xl md:text-5xl font-extrabold text-slate-900 mb-6 leading-tight">
          {title}
        </h1>

        <div className="flex items-center justify-between border-b border-slate-100 pb-8 mb-8">
          <div className="flex items-center">
            <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center text-slate-500 font-bold mr-3">
              {author?.data?.attributes?.username.charAt(0) || 'A'}
            </div>
            <div>
              <p className="text-sm font-medium text-slate-900">{author?.data?.attributes?.username || 'Unknown Author'}</p>
              <p className="text-xs text-slate-500">Journalist</p>
            </div>
          </div>

          {/* RBAC Action Buttons */}
          {isEditor && (
             <div className="flex space-x-2">
                <button 
                  onClick={() => navigate(`/edit/${article.attributes.slug}`)}
                  className="text-slate-400 hover:text-primary transition-colors p-2" 
                  title="Edit"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                </button>
                <button onClick={handleDelete} className="text-slate-400 hover:text-red-600 transition-colors p-2" title="Delete">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                </button>
             </div>
          )}
        </div>

        {/* Content Body - Simulating Rich Text */}
        <div className="prose prose-lg prose-slate max-w-none text-slate-700 whitespace-pre-wrap">
          {content}
        </div>
      </div>
    </article>
  );
};

export default ArticlePage;