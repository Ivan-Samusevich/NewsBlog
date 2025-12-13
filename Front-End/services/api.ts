import { API_URL } from '../constants';
import { AuthResponse, StrapiResponse, StrapiSingleResponse, Article, Category, UserRole, User } from '../types';

// TOGGLE THIS TO FALSE TO USE REAL STRAPI BACKEND
const USE_MOCK_DATA = true;


const buildQuery = (params: Record<string, any>) => {
  const query = new URLSearchParams();
  Object.keys(params).forEach(key => {
    if (typeof params[key] === 'object') {
      Object.keys(params[key]).forEach(subKey => {
      });
    } else {
      query.append(key, params[key]);
    }
  });
  return query.toString();
};

// --- MOCK DATA ---
const MOCK_CATEGORIES: any[] = [
  { id: 1, attributes: { name: 'Technology', slug: 'technology' } },
  { id: 2, attributes: { name: 'World', slug: 'world' } },
  { id: 3, attributes: { name: 'Design', slug: 'design' } },
];

let MOCK_ARTICLES: any[] = Array.from({ length: 15 }).map((_, i) => ({
  id: i + 1,
  attributes: {
    title: `News Article Headline ${i + 1}`,
    slug: `article-${i + 1}`,
    excerpt: 'This is a short summary of the news article to display on the card view. It engages the reader.',
    content: `## Detailed Content for Article ${i + 1}\n\nThis is the main body of the article. It simulates **Markdown** content.\n\n* Point 1\n* Point 2\n\nLorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.`,
    publishedAt: new Date(Date.now() - i * 86400000).toISOString(),
    views: Math.floor(Math.random() * 1000),
    readingTime: Math.floor(Math.random() * 10) + 1,
    isFeatured: i % 5 === 0,
    category: { data: MOCK_CATEGORIES[i % 3] },
    author: { data: { id: 1, attributes: { username: 'Editor John' } } }
  }
}));

const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

// --- API METHODS ---

export const api = {
  getToken: () => localStorage.getItem('jwt'),
  
  getHeaders: () => {
    const token = localStorage.getItem('jwt');
    return {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
  },

  async login(identifier: string, password: string): Promise<AuthResponse> {
    if (USE_MOCK_DATA) {
      await delay(800);
      if (identifier === 'fail') throw new Error('Invalid credentials');
      
      // Simulating roles based on username for demo
      const roleName = identifier.includes('editor') ? 'Editor' : 'Authenticated';
      
      return {
        jwt: 'mock-jwt-token-12345',
        user: {
          id: 1,
          username: identifier,
          email: identifier,
          role: { name: roleName, type: roleName.toLowerCase() }
        }
      };
    }

    const res = await fetch(`${API_URL}/api/auth/local`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ identifier, password }),
    });
    if (!res.ok) throw new Error('Login failed');
    return res.json();
  },

  async register(username: string, email: string, password: string): Promise<AuthResponse> {
    if (USE_MOCK_DATA) {
      await delay(800);
      return {
        jwt: 'mock-jwt-token-new-user',
        user: {
          id: 2,
          username,
          email,
          role: { name: 'Authenticated', type: 'authenticated' }
        }
      };
    }

    const res = await fetch(`${API_URL}/api/auth/local/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, email, password }),
    });
    if (!res.ok) throw new Error('Registration failed');
    return res.json();
  },

  async getCategories(): Promise<StrapiResponse<Category>> {
    if (USE_MOCK_DATA) {
      return { data: MOCK_CATEGORIES, meta: { pagination: { page: 1, pageSize: 100, pageCount: 1, total: 3 } } };
    }
    const res = await fetch(`${API_URL}/api/categories`);
    return res.json();
  },

  async getArticles(page = 1, categorySlug?: string): Promise<StrapiResponse<Article>> {
    if (USE_MOCK_DATA) {
      await delay(500);
      let filtered = MOCK_ARTICLES;
      if (categorySlug) {
        filtered = filtered.filter(a => a.attributes.category.data.attributes.slug === categorySlug);
      }
      // Sort desc
      filtered.sort((a, b) => new Date(b.attributes.publishedAt).getTime() - new Date(a.attributes.publishedAt).getTime());

      const pageSize = 6;
      const start = (page - 1) * pageSize;
      const sliced = filtered.slice(start, start + pageSize);
      
      return {
        data: sliced,
        meta: {
          pagination: {
            page,
            pageSize,
            pageCount: Math.ceil(filtered.length / pageSize),
            total: filtered.length
          }
        }
      };
    }

    // Real implementation with populate
    const params = new URLSearchParams();
    params.append('populate', 'coverImage,category,author');
    params.append('sort', 'publishedAt:desc');
    params.append('pagination[page]', page.toString());
    params.append('pagination[pageSize]', '6');
    if (categorySlug) {
      params.append('filters[category][slug][$eq]', categorySlug);
    }

    const res = await fetch(`${API_URL}/api/articles?${params.toString()}`);
    return res.json();
  },

  async getArticleBySlug(slug: string): Promise<StrapiSingleResponse<Article>> {
    if (USE_MOCK_DATA) {
      await delay(400);
      const article = MOCK_ARTICLES.find(a => a.attributes.slug === slug);
      return { data: article || null, meta: {} };
    }

    const params = new URLSearchParams();
    params.append('filters[slug][$eq]', slug);
    params.append('populate', 'coverImage,category,author,seo');
    
    const res = await fetch(`${API_URL}/api/articles?${params.toString()}`);
    const json = await res.json();
    return { data: json.data[0] || null, meta: json.meta };
  },

  async deleteArticle(id: number): Promise<void> {
    if (USE_MOCK_DATA) {
      await delay(600);
      MOCK_ARTICLES = MOCK_ARTICLES.filter(a => a.id !== id);
      console.log(`Deleted article ${id} (Mock)`);
      return;
    }

    const res = await fetch(`${API_URL}/api/articles/${id}`, {
      method: 'DELETE',
      headers: api.getHeaders(),
    });
    if (!res.ok) throw new Error('Failed to delete');
  },

  async createArticle(data: Partial<Article> & { category: number, author: number }): Promise<void> {
    if (USE_MOCK_DATA) {
      await delay(1000);
      const newId = Math.max(...MOCK_ARTICLES.map(a => a.id)) + 1;
      const categoryObj = MOCK_CATEGORIES.find(c => c.id === Number(data.category));
      
      const newArticle = {
        id: newId,
        attributes: {
          ...data,
          publishedAt: new Date().toISOString(),
          slug: data.slug || `new-article-${newId}`,
          views: 0,
          readingTime: 3,
          isFeatured: false,
          category: { data: categoryObj },
          author: { data: { id: 1, attributes: { username: 'Editor John' } } }
        }
      };
      MOCK_ARTICLES.unshift(newArticle);
      return;
    }

    const res = await fetch(`${API_URL}/api/articles`, {
      method: 'POST',
      headers: api.getHeaders(),
      body: JSON.stringify({ data }),
    });
    if (!res.ok) throw new Error('Failed to create article');
  }
};