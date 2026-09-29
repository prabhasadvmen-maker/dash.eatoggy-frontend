import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { categoryService } from '../../services/customer/categoryService.js';
import CategoryCard from '../../components/customer/CategoryCard.jsx';
import { useNavigate } from 'react-router-dom';

const Categories = () => {
  const { data: categoriesData, isLoading, error } = useQuery({
    queryKey: ['categories'],
    queryFn: () => categoryService.getCategories(),
  });
  
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('popularity');

  const categories = categoriesData?.data || [];

  const handleCategoryClick = (categoryId) => {
    // Navigate to a search or restaurant listing page pre-filtered by category
    navigate(`/customer/restaurants?category=${categoryId}`);
  };

  let filteredCategories = categories.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (sortBy === 'name') {
    filteredCategories.sort((a, b) => a.name.localeCompare(b.name));
  } else if (sortBy === 'popularity') {
    // Assuming higher priority/itemCount is more popular
    filteredCategories.sort((a, b) => b.itemCount - a.itemCount);
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8 text-center sm:text-left">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Explore Categories</h1>
        <p className="text-gray-600">Find exactly what you're craving for.</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 mb-8">
        <input 
          type="text" 
          placeholder="Search categories (e.g. Pizza, Burger)..." 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="flex-1 rounded-full border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500 py-3 px-6 border outline-none"
        />
        <select 
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="rounded-full border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500 py-3 px-6 border bg-white outline-none"
        >
          <option value="popularity">Sort by Popularity</option>
          <option value="name">Sort by Name</option>
        </select>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(i => (
            <div key={i} className="animate-pulse bg-white border border-gray-100 rounded-2xl h-48"></div>
          ))}
        </div>
      ) : error ? (
        <div className="text-center text-red-500 py-10">Failed to load categories. Please try again.</div>
      ) : filteredCategories.length === 0 ? (
        <div className="text-center text-gray-500 py-20 bg-gray-50 rounded-2xl border border-dashed border-gray-300">
          <p className="text-lg">No categories found matching '{searchTerm}'.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          {filteredCategories.map(category => (
            <CategoryCard 
              key={category.id} 
              category={category} 
              onClick={handleCategoryClick} 
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default Categories;
