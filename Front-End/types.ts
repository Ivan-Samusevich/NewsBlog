// User Roles
export enum UserRole {
  Public = 'public',
  Authenticated = 'authenticated',
  Editor = 'editor'
}

// Strapi Generic Response Wrappers
export interface StrapiAttributes<T> {
  id: number;
  attributes: T;
}

export interface StrapiResponse<T> {
  data: StrapiAttributes<T>[];
  meta: {
    pagination: {
      page: number;
      pageSize: number;
      pageCount: number;
      total: number;
    };
  };
}

export interface StrapiSingleResponse<T> {
  data: StrapiAttributes<T> | null;
  meta: any;
}

// Models
export interface User {
  id: number;
  username: string;
  email: string;
  role?: {
    name: string;
    type: string;
  };
}

export interface Category {
  name: string;
  slug: string;
}

export interface Article {
  title: string;
  slug: string;
  content: string; // Markdown or Rich Text
  excerpt: string;
  publishedAt: string;
  coverImage?: {
    data: {
      attributes: {
        url: string;
      }
    }
  };
  views: number; // Custom field
  readingTime: number; // Custom field
  isFeatured: boolean; // Custom field
  category?: {
    data: StrapiAttributes<Category>;
  };
  author?: {
    data: StrapiAttributes<User>;
  };
}

export interface AuthResponse {
  jwt: string;
  user: User;
}
