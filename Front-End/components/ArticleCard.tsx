import React from 'react';
import { StrapiAttributes, Article } from '../types';
import { getImageUrl } from '../constants';

interface ArticleCardProps {
  article: StrapiAttributes<Article>;
  onClick: (slug: string) => void;
}

const ArticleCard: React.FC<ArticleCardProps> = ({ article, onClick }) => {
  const { title, excerpt, coverImage, publishedAt, category, views, isFeatured } = article.attributes;

  return (
    <div 
      onClick={() => onClick(article.attributes.slug)}
      className={`group relative bg-white rounded-xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden cursor-pointer flex flex-col h-full border border-slate-100 ${isFeatured ? 'ring-2 ring-accent' : ''}`}
    >
      {/* Image Container */}
      <div className="relative h-48 overflow-hidden bg-slate-200">
        <img 
          src={getImageUrl(coverImage?.data?.attributes?.url)} 
          alt={title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        {category?.data && (
          <span className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm text-primary text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider shadow-sm">
            {category.data.attributes.name}
          </span>
        )}
        {isFeatured && (
           <span className="absolute top-3 right-3 bg-accent text-white text-xs font-bold px-2 py-1 rounded-md shadow-sm">
            Featured
          </span>
        )}
      </div>

      {/* Content */}
      <div className="p-5 flex flex-col flex-grow">
        <div className="text-slate-400 text-xs mb-2 flex justify-between items-center">
          <span>{new Date(publishedAt).toLocaleDateString()}</span>
          <span>{views} views</span>
        </div>
        
        <h3 className="text-xl font-bold text-slate-800 mb-2 leading-tight group-hover:text-primary transition-colors">
          {title}
        </h3>
        
        <p className="text-slate-600 text-sm line-clamp-3 mb-4 flex-grow">
          {excerpt}
        </p>

        <div className="mt-auto pt-4 border-t border-slate-100 flex items-center text-primary font-medium text-sm">
          Read more 
          <svg className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
          </svg>
        </div>
      </div>
    </div>
  );
};

export default ArticleCard;
