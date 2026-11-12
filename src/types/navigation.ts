export type PageRoute = 'home' | 'about' | 'solutions' | 'sectors' | 'contact';

export interface NavigationState {
  currentPage: PageRoute;
  targetSection?: string;
}
