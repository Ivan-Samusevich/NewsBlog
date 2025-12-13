export const API_URL = 'http://localhost:1337';
export const SITE_NAME = 'NewsFlow';

// Helper to resolve image URLs (handles local Strapi uploads vs remote)
export const getImageUrl = (url?: string) => {
  if (!url) return 'https://picsum.photos/800/400';
  if (url.startsWith('http')) return url;
  return `${API_URL}${url}`;
};
