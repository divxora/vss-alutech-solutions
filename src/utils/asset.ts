/**
 * Utility to resolve static asset URLs considering Vite's base path
 * Supports root deployment ('/') and GitHub Pages subpath deployment ('/vss-alutech-solutions/')
 */
export const getAssetUrl = (path: string): string => {
  const base = import.meta.env.BASE_URL || '/';
  const cleanBase = base.endsWith('/') ? base : `${base}/`;
  const cleanPath = path.startsWith('/') ? path.slice(1) : path;
  return `${cleanBase}${cleanPath}`;
};
