export interface PaginatedCollection<T> {
  meta: {
    totalItems: number;
    itemCount: number;
    itemsPerPage: number;
    currentPage: number;
  };
  items: T[];
}
