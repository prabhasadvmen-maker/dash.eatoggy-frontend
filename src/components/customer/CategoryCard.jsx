import React from 'react';

const CategoryCard = ({ category, onClick }) => {
  return (
    <div 
      onClick={() => onClick(category.id)}
      className="group cursor-pointer bg-white rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden border border-gray-100 flex flex-col items-center text-center p-6 h-full"
    >
      <div className="w-24 h-24 mb-4 rounded-full bg-orange-50 p-4 group-hover:scale-110 transition-transform duration-300">
        <img 
          src={category.imageUrl || 'https://via.placeholder.com/150'} 
          alt={category.name} 
          className="w-full h-full object-contain drop-shadow-md"
          onError={(e) => { e.target.src = 'https://via.placeholder.com/150?text=Food' }}
        />
      </div>
      <h3 className="font-bold text-gray-900 mb-1 group-hover:text-orange-600 transition-colors">{category.name}</h3>
      <span className="bg-gray-100 text-gray-600 text-xs px-3 py-1 rounded-full font-medium">
        {category.itemCount} Items
      </span>
    </div>
  );
};

export default CategoryCard;
