export class QueryProductDto {
  page?: number;
  limit?: number;
  name?: string;
  category?: string;
  status?: 'active' | 'inactive';
  minPrice?: number;
  maxPrice?: number;
}
