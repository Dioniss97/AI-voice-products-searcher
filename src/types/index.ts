export interface Product {
  id: number;
  title: string;
  description: string;
  price: number;
  thumbnail: string;
  category: string;
  rating?: number;
  discountPercentage?: number;
}

export interface ProductFilters {
  search?: string;
  limit?: number;
  skip?: number;
  sortBy?: string;
  order?: 'asc' | 'desc';
  category?: string;
  select?: string[];
}

export interface VoiceCommandResult {
  action: 'search' | 'filter' | 'sort' | 'category';
  filters: ProductFilters;
}