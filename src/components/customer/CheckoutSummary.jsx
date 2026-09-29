import React from 'react';
import CouponApplier from './CouponApplier.jsx';

const CheckoutSummary = ({ summary, appliedCoupon }) => {
  if (!summary) return null;

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <h3 className="text-lg font-medium text-gray-900 mb-4">Bill Details</h3>
      
      <div className="space-y-3 text-sm text-gray-600">
        <div className="flex justify-between">
          <span>Item Total</span>
          <span>₹{summary.subtotal}</span>
        </div>
        
        {summary.packagingCharge > 0 && (
          <div className="flex justify-between">
            <span>Packaging Charges</span>
            <span>₹{summary.packagingCharge}</span>
          </div>
        )}

        <div className="flex justify-between">
          <span>Delivery Fee</span>
          <span>₹{summary.deliveryFee}</span>
        </div>

        <div className="flex justify-between">
          <span>Taxes (GST)</span>
          <span>₹{summary.gst}</span>
        </div>

        {summary.discount > 0 && (
          <div className="flex justify-between text-green-600">
            <span>Item Discount</span>
            <span>- ₹{summary.discount}</span>
          </div>
        )}

        <div className="border-t pt-3 mt-3">
          <div className="flex justify-between font-bold text-gray-900 text-base">
            <span>To Pay</span>
            <span>₹{summary.grandTotal}</span>
          </div>
        </div>
      </div>

      <CouponApplier appliedCoupon={appliedCoupon} cartTotal={summary.subtotal} />
    </div>
  );
};

export default CheckoutSummary;
