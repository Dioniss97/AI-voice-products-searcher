import axios from 'axios';
import { Product, ProductFilters } from '../types';

const BASE_URL = 'https://dummyjson.com/products';

export async function fetchProducts(filters: ProductFilters = {}) {
  const {
    search,
    limit = 9,
    skip = 0,
    sortBy,
    order,
    category,
    select
  } = filters;

  let url = BASE_URL;

  if (search) {
    url = `${BASE_URL}/search?q=${search}`;
  } else if (category) {
    url = `${BASE_URL}/category/${category}`;
  }

  const params = new URLSearchParams();
  
  params.append('limit', limit.toString());
  params.append('skip', skip.toString());
  if (sortBy) params.append('sortBy', sortBy);
  if (order) params.append('order', order);
  if (select) params.append('select', select.join(','));

  const queryString = params.toString();
  const finalUrl = `${url}${url.includes('?') ? '&' : '?'}${queryString}`;

  const response = await axios.get(finalUrl);
  return {
    products: response.data.products as Product[],
    total: response.data.total as number
  };
}

export async function fetchCategories() {
  const response = await axios.get(`${BASE_URL}/categories`);
  const categories = response.data;
  const categoryNames = categories.map((cat: { name: string }) => cat.name);
  return categoryNames.join(', ');
}