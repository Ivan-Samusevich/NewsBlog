import React, { useState, useEffect, useCallback } from 'react';
import { HashRouter, Routes, Route, useNavigate, useParams, Navigate, useLocation } from 'react-router-dom';
import Layout from './components/Layout.tsx';
import ArticleCard from './components/ArticleCard.tsx';
import { api } from './services/api.ts';
import { User, Article, Category, StrapiAttributes, UserRole } from './types.ts';
import { getImageUrl } from './constants';

// --- Auth Hook (Local Implementation for simplicity) ---
const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    const token = localStorage.getItem('jwt');
    if (savedUser && token) {
      setUser(JSON.parse(savedUser));
    }
    setLoading(false);
  }, []);

  const login = (data: { user: User; jwt: string }) => {
    localStorage.setItem('jwt', data.jwt);
    localStorage.setItem('user', JSON.stringify(data.user));
    setUser(data.user);
  };

  const logout = () => {
    localStorage.removeItem('jwt');
    localStorage.removeItem('user');
    setUser(null);
  };

  return { user, login, logout, loading };
};

// --- PAGES ---

// 1. Home Page (List, Filter, Pagination)
const HomePage: React.FC = () => {
  const [articles, setArticles] = useState<StrapiAttributes<Article>[]>([]);
  const [categories, setCategories] = useState<StrapiAttributes<Category>[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [meta, setMeta] = useState<any>(null);
  const [activeCategory, setActiveCategory] = useState<string | undefined>(undefined);
  
  const navigate = useNavigate();

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [articlesRes, categoriesRes] = await Promise.all([
        api.getArticles(page, activeCategory),
        api.getCategories()
      ]);
      setArticles(articlesRes.data);
      setMeta(articlesRes.meta);
      setCategories(categoriesRes.data);
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
      {loading ? (
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
            onClick={() => setPage(p => p - 1)}
            className="px-4 py-2 border border-slate-300 rounded-md text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50"
          >
            Previous
          </button>
          <span className="text-slate-600 text-sm">
            Page <span className="font-bold text-slate-900">{page}</span> of {meta.pagination.pageCount}
          </span>
          <button 
            disabled={page >= meta.pagination.pageCount}
            onClick={() => setPage(p => p + 1)}
            className="px-4 py-2 border border-slate-300 rounded-md text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

// 2. Article Details Page
const ArticlePage: React.FC<{ user: User | null }> = ({ user }) => {
  const { slug } = useParams<{ slug: string }>();
  const [article, setArticle] = useState<StrapiAttributes<Article> | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    if (!slug) return;
    setLoading(true);
    api.getArticleBySlug(slug)
      .then(res => setArticle(res.data))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, [slug]);

  const handleDelete = async () => {
    if (!article || !window.confirm("Are you sure you want to delete this article?")) return;
    try {
      await api.deleteArticle(article.id);
      alert("Article deleted successfully");
      navigate('/');
    } catch (e) {
      alert("Failed to delete. You might not have permission.");
    }
  };

  if (loading) return <div className="text-center py-20 text-slate-500">Loading article...</div>;
  if (!article) return <div className="text-center py-20 text-red-500">Article not found</div>;

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
                <button className="text-slate-400 hover:text-primary transition-colors p-2" title="Edit">
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

// 3. Create Article Page
const CreateArticlePage: React.FC<{ user: User | null }> = ({ user }) => {
  const [title, setTitle] = useState('');
  const [excerpt, setExcerpt] = useState('');
  const [content, setContent] = useState('');
  const [categoryId, setCategoryId] = useState<number | ''>('');
  const [categories, setCategories] = useState<StrapiAttributes<Category>[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Only allow editors
    if (user?.role?.type !== 'editor') {
      navigate('/');
      return;
    }
    api.getCategories().then(res => setCategories(res.data));
  }, [user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!categoryId) return;
    setSubmitting(true);
    
    try {
      // Auto-generate slug for demo
      const slug = title.toLowerCase().replace(/ /g, '-') + '-' + Date.now();
      
      await api.createArticle({
        title,
        excerpt,
        content,
        slug,
        category: categoryId,
        author: user?.id || 1,
      });
      navigate('/');
    } catch (e) {
      alert("Failed to create article");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto bg-white p-8 rounded-xl shadow-sm border border-slate-100">
      <h1 className="text-2xl font-bold mb-6 text-slate-900">Create New Article</h1>
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
            onClick={() => navigate('/')}
            className="px-4 py-2 text-slate-600 font-medium hover:text-slate-800"
          >
            Cancel
          </button>
          <button 
            type="submit" 
            disabled={submitting}
            className="bg-primary hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-bold transition-colors disabled:opacity-50"
          >
            {submitting ? 'Publishing...' : 'Publish Article'}
          </button>
        </div>
      </form>
    </div>
  );
};

// 4. Login Page
const LoginPage: React.FC<{ onLogin: (data: any) => void }> = ({ onLogin }) => {
  const [identifier, setIdentifier] = useState('editor');
  const [password, setPassword] = useState('password'); // Default for demo
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      const data = await api.login(identifier, password);
      onLogin(data);
      navigate('/');
    } catch (err) {
      setError('Invalid credentials');
    }
  };

  return (
    <div className="max-w-md mx-auto bg-white p-8 rounded-xl shadow-lg border border-slate-100 mt-12">
      <h2 className="text-2xl font-bold text-center mb-6">Welcome Back</h2>
      {error && <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm mb-4">{error}</div>}
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Email or Username</label>
          <input 
            type="text" 
            value={identifier}
            onChange={e => setIdentifier(e.target.value)}
            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
            placeholder="Type 'editor' for admin rights"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
          <input 
            type="password" 
            value={password}
            onChange={e => setPassword(e.target.value)}
            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
          />
        </div>
        <button type="submit" className="w-full bg-primary hover:bg-blue-700 text-white font-bold py-2.5 rounded-lg transition-colors">
          Log In
        </button>
      </form>
      <div className="mt-6 text-center text-sm text-slate-500">
        Demo tip: use username <b>editor</b> or <b>user</b>.
      </div>
    </div>
  );
};

// 5. Register Page
const RegisterPage: React.FC<{ onLogin: (data: any) => void }> = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const data = await api.register(username, email, password);
      onLogin(data);
      navigate('/');
    } catch (err) {
      alert("Registration failed");
    }
  };

  return (
    <div className="max-w-md mx-auto bg-white p-8 rounded-xl shadow-lg border border-slate-100 mt-12">
      <h2 className="text-2xl font-bold text-center mb-6">Create Account</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Username</label>
          <input type="text" value={username} onChange={e => setUsername(e.target.value)} className="w-full px-4 py-2 border border-slate-300 rounded-lg outline-none focus:border-primary" required />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
          <input type="email" value={email} onChange={e => setEmail(e.target.value)} className="w-full px-4 py-2 border border-slate-300 rounded-lg outline-none focus:border-primary" required />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
          <input type="password" value={password} onChange={e => setPassword(e.target.value)} className="w-full px-4 py-2 border border-slate-300 rounded-lg outline-none focus:border-primary" required />
        </div>
        <button type="submit" className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-2.5 rounded-lg transition-colors">
          Sign Up
        </button>
      </form>
    </div>
  );
};

// Main App Container
const App: React.FC = () => {
  const { user, login, logout, loading } = useAuth();
  const navigate = useNavigate();

  if (loading) return <div className="h-screen flex items-center justify-center text-slate-500">Initializing...</div>;

  return (
    <Layout user={user} onLogout={logout} onNavigate={navigate}>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/article/:slug" element={<ArticlePage user={user} />} />
        <Route path="/create" element={<CreateArticlePage user={user} />} />
        
        <Route path="/login" element={
          user ? <Navigate to="/" /> : <LoginPage onLogin={login} />
        } />
        
        <Route path="/register" element={
          user ? <Navigate to="/" /> : <RegisterPage onLogin={login} />
        } />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Layout>
  );
};

export default () => (
  <HashRouter>
    <App />
  </HashRouter>
);