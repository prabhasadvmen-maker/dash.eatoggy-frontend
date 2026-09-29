import React from 'react';
import { FaCopy, FaCheck } from 'react-icons/fa';

const OfferCard = ({ offer, onApply, onCopy, copiedCode }) => {
  const isCopied = copiedCode === offer.code;

  return (
    <div className="border border-gray-200 rounded-xl bg-white overflow-hidden shadow-sm hover:shadow-md transition-shadow">
      <div className="p-5 flex flex-col h-full">
        <div className="flex justify-between items-start mb-4">
          <div className="border border-dashed border-orange-500 bg-orange-50 text-orange-600 font-bold px-3 py-1.5 rounded uppercase tracking-wider text-sm flex items-center">
            {offer.code}
            <button 
              onClick={() => onCopy(offer.code)} 
              className="ml-2 text-gray-500 hover:text-orange-600 focus:outline-none"
              title="Copy Code"
            >
              {isCopied ? <FaCheck className="text-green-500" /> : <FaCopy />}
            </button>
          </div>
          <span className="text-xs font-medium bg-green-100 text-green-800 px-2 py-1 rounded-full">
            {offer.discountType === 'PERCENTAGE' ? `${offer.discountPercent}% OFF` : `₹${offer.discountAmount} OFF`}
          </span>
        </div>

        <h3 className="text-lg font-bold text-gray-900 mb-2">{offer.title}</h3>
        <p className="text-sm text-gray-600 mb-4 flex-grow">{offer.description}</p>
        
        <div className="text-xs text-gray-500 mb-4 space-y-1">
          {offer.minOrderValue > 0 && <p>• Minimum order: ₹{offer.minOrderValue}</p>}
          {offer.maxDiscount > 0 && offer.discountType === 'PERCENTAGE' && <p>• Maximum discount: ₹{offer.maxDiscount}</p>}
          {offer.expiresAt && <p>• Valid till: {new Date(offer.expiresAt).toLocaleDateString()}</p>}
        </div>

        <button
          onClick={() => onApply(offer.code)}
          className="w-full bg-gray-900 text-white font-medium py-2 rounded-lg hover:bg-black transition-colors"
        >
          Apply Coupon
        </button>
      </div>
    </div>
  );
};

export default OfferCard;
