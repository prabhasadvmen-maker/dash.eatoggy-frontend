import React, { useState } from 'react';
import { useOffers, useCoupon } from '../../hooks/customer/useCoupon.js';
import OfferCard from '../../components/customer/OfferCard.jsx';
import { useNavigate } from 'react-router-dom';

const Offers = () => {
  const { data: offersData, isLoading, error } = useOffers();
  const { applyCoupon } = useCoupon();
  const navigate = useNavigate();
  const [copiedCode, setCopiedCode] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('ALL');

  const offers = offersData?.data || [];

  const handleCopy = (code) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const handleApply = async (code) => {
    await applyCoupon(code);
    navigate('/customer/checkout');
  };

  const filteredOffers = offers.filter(offer => {
    const matchesSearch = offer.code.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          offer.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterType === 'ALL' || offer.discountType === filterType;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Available Offers</h1>
        <p className="text-gray-600">Save more with our exclusive coupons and discounts.</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 mb-8">
        <input 
          type="text" 
          placeholder="Search offers or codes..." 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500 p-2 border"
        />
        <select 
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          className="rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500 p-2 border bg-white"
        >
          <option value="ALL">All Offers</option>
          <option value="FLAT">Flat Discount</option>
          <option value="PERCENTAGE">Percentage Discount</option>
        </select>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="animate-pulse bg-white border border-gray-200 rounded-xl h-64"></div>
          ))}
        </div>
      ) : error ? (
        <div className="text-center text-red-500 py-10">Failed to load offers. Please try again.</div>
      ) : filteredOffers.length === 0 ? (
        <div className="text-center text-gray-500 py-20 bg-gray-50 rounded-xl border border-dashed border-gray-300">
          <p className="text-lg">No offers found matching your criteria.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredOffers.map(offer => (
            <OfferCard 
              key={offer.id || offer.code} 
              offer={offer} 
              onApply={handleApply}
              onCopy={handleCopy}
              copiedCode={copiedCode}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default Offers;
