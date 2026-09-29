import React from 'react';
import { useForm } from 'react-hook-form';
import { useCoupon } from '../../hooks/customer/useCoupon.js';

const CouponApplier = ({ appliedCoupon, cartTotal }) => {
  const { register, handleSubmit, reset } = useForm();
  const { applyCoupon, isApplying } = useCoupon();

  const onSubmit = async (data) => {
    if (!data.couponCode) return;
    await applyCoupon(data.couponCode);
    reset();
  };

  if (appliedCoupon) {
    return (
      <div className="bg-green-50 p-4 rounded-md border border-green-200 mt-4">
        <div className="flex justify-between items-center">
          <div>
            <h4 className="text-sm font-medium text-green-800">'{appliedCoupon.code}' applied</h4>
            <p className="text-xs text-green-600">You saved ₹{appliedCoupon.discountAmount}</p>
          </div>
          <button className="text-sm text-red-600 hover:text-red-800 font-medium">Remove</button>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-4">
      <form onSubmit={handleSubmit(onSubmit)} className="flex space-x-2">
        <input
          type="text"
          {...register('couponCode')}
          placeholder="Enter coupon code"
          className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500 sm:text-sm p-2 border uppercase"
        />
        <button
          type="submit"
          disabled={isApplying}
          className="px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-gray-800 hover:bg-gray-900 disabled:opacity-50"
        >
          {isApplying ? 'Applying...' : 'Apply'}
        </button>
      </form>
    </div>
  );
};

export default CouponApplier;
