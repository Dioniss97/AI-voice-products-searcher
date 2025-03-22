import React, { useEffect } from 'react';
import { Product } from '../types';
import { ChevronLeft, ChevronRight, ArrowUpDown } from 'lucide-react';
import { useInView } from 'react-intersection-observer';
import { getProductDescription } from '../services/openai';

interface ProductCardProps {
  product: Product;
}

const ProductCard = ({ product }: ProductCardProps) => {
  const [description, setDescription] = React.useState('');
  const [ref, inView] = useInView({
    threshold: 0.5,
    triggerOnce: true,
  });

  useEffect(() => {
    if (inView) {
      const loadDescription = async () => {
        try {
          const stream = await getProductDescription(product);
          let fullText = '';
          
          for await (const chunk of stream) {
            const chunkText = chunk.choices[0]?.delta?.content || '';
            fullText += chunkText;
            setDescription(fullText);
          }
        } catch (error) {
          console.error('Error loading product description:', error);
        }
      };
      loadDescription();
    }
  }, [inView, product]);

  return (
    <div
      ref={ref}
      className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow"
    >
      <div className="aspect-square overflow-hidden">
        <img
          src={product.thumbnail}
          alt={product.title}
          className="w-full h-full object-cover"
          onError={(e) => {
            e.currentTarget.src = `https://source.unsplash.com/400x400/?${encodeURIComponent(product.category)}`;
          }}
        />
      </div>
      <div className="p-4">
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-lg font-semibold text-gray-800">
            {product.title}
          </h3>
          <span className="px-2 py-1 bg-gray-100 text-sm rounded-full text-gray-600">
            {product.category}
          </span>
        </div>
        <p className="text-gray-600 text-sm mb-3">
          {product.description}
        </p>
        <div className="flex justify-between items-center">
          <p className="text-indigo-600 font-bold">
            ${product.price}
          </p>
          {product.rating && (
            <span className="text-sm text-yellow-600">
              ★ {product.rating}
            </span>
          )}
        </div>
        {product.discountPercentage > 0 && (
          <span className="text-sm text-green-600 mt-1 block">
            {product.discountPercentage}% OFF
          </span>
        )}
        {description && (
          <div className="mt-4 p-3 bg-indigo-50 rounded-lg">
            <p className="text-sm text-indigo-700 leading-relaxed">
              {description}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

interface ProductGridProps {
  products: Product[];
  currentPage: number;
  totalProducts: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
  onSort: (field: string) => void;
  sortField?: string;
  sortOrder?: 'asc' | 'desc';
}

export function ProductGrid({ 
  products, 
  currentPage, 
  totalProducts, 
  itemsPerPage,
  onPageChange,
  onSort,
  sortField,
  sortOrder
}: ProductGridProps) {
  const totalPages = Math.ceil(totalProducts / itemsPerPage);

  const SortButton = ({ field, label }: { field: string, label: string }) => (
    <button
      onClick={() => onSort(field)}
      className={`flex items-center gap-1 px-2 py-1 text-sm rounded hover:bg-gray-100 ${
        sortField === field ? 'text-indigo-600 font-semibold' : 'text-gray-600'
      }`}
    >
      {label}
      <ArrowUpDown size={14} className={sortField === field ? 'text-indigo-600' : 'text-gray-400'} />
      {sortField === field && (
        <span className="text-xs ml-1">
          ({sortOrder === 'asc' ? '↑' : '↓'})
        </span>
      )}
    </button>
  );

  return (
    <div>
      <div className="flex gap-4 mb-4 p-2 bg-gray-50 rounded-lg">
        <span className="text-sm text-gray-600">Sort by:</span>
        <SortButton field="price" label="Price" />
        <SortButton field="discountPercentage" label="Discount" />
        <SortButton field="rating" label="Rating" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>

      <div className="flex justify-center items-center gap-2">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <ChevronLeft size={20} />
        </button>
        <span className="text-sm text-gray-600">
          Page {currentPage} of {totalPages}
        </span>
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <ChevronRight size={20} />
        </button>
      </div>
    </div>
  );
}