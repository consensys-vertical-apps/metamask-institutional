export interface ICompliancePaginatedItems<T> {
  items: T[];
  total: number;
  links: Array<{ rel: string; href: string }>;
}
