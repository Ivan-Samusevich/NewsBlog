import React from 'react';
import { useNavigate } from 'react-router-dom';
import ArticleCard from '../components/ArticleCard';
import { useArticles } from '../hooks/useArticles';
import { useCategories } from '../hooks/useCategories';

const HomePage: React.FC = () => {
  const { 
    articles, meta, loading: articlesLoading, page, 
    activeCategory, handleCategoryClick, nextPage, prevPage 
  } = useArticles();
  
  const { categories } = useCategories();
  
  const navigate = useNavigate();

  return (
    <div className="space-y-8">
      {/* Hero / Filter Section */}
      <div className="flex flex-col md:flex-row justify-between items-end md:items-center border-b border-slate-200 pb-6 gap-4">
        <div>
           <h1 className="text-3xl font-bold text-slate-900">Latest News</h1>
           <p className="text-slate-500 mt-1">Stay updated with the world.</p>
        </div>
        
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => handleCategoryClick('')}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${!activeCategory ? 'bg-slate-900 text-white' : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'}`}
          >
            All
          </button>
          {categories.map(cat => (
            <button
              key={cat.id}
              onClick={() => handleCategoryClick(cat.attributes.slug)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${activeCategory === cat.attributes.slug ? 'bg-primary text-white' : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'}`}
            >
              {cat.attributes.name}
            </button>
          ))}
        </div>
      </div>

      {/* Grid */}
      {articlesLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 animate-pulse">
           {[1,2,3].map(i => <div key={i} className="h-96 bg-slate-200 rounded-xl"></div>)}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {articles.map(article => (
            <ArticleCard 
              key={article.id} 
              article={article} 
              onClick={(slug) => navigate(`/article/${slug}`)} 
            />
          ))}
        </div>
      )}

      {/* Pagination */}
      {meta && (
        <div className="flex justify-center items-center space-x-4 pt-8">
          <button 
            disabled={page === 1}
            onClick={prevPage}
            className="px-4 py-2 border border-slate-300 rounded-md text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50"
          >
            Previous
          </button>
          <span className="text-slate-600 text-sm">
            Page <span className="font-bold text-slate-900">{page}</span> of {meta.pagination.pageCount}
          </span>
          <button 
            disabled={page >= meta.pagination.pageCount}
            onClick={nextPage}
            className="px-4 py-2 border border-slate-300 rounded-md text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default HomePage;