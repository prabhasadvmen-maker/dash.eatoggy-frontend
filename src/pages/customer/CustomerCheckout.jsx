import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import { checkoutService } from '../../services/customer/checkoutService.js';
import { serviceabilityService } from '../../services/customer/serviceabilityService.js';
import { useAddresses } from '../../hooks/customer/useAddresses.js';
import CheckoutSummary from '../../components/customer/CheckoutSummary.jsx';
import { toast } from 'react-toastify';

const CustomerCheckout = () => {
  const navigate = useNavigate();
  const [selectedAddressId, setSelectedAddressId] = useState(null);

  const { addresses, isLoading: isLoadingAddresses } = useAddresses();

  // Ideally fetch config to get Razorpay key
  const { data: configData } = useQuery({
    queryKey: ['publicConfig'],
    queryFn: () => serviceabilityService.getConfig()
  });

  const { data: summaryRes, isLoading: isLoadingSummary } = useQuery({
    queryKey: ['checkoutSummary', selectedAddressId],
    queryFn: () => checkoutService.getCheckoutSummary({ addressId: selectedAddressId }),
  });

  const verifyPaymentMutation = useMutation({
    mutationFn: (data) => checkoutService.verifyPayment(data),
    onSuccess: (res) => {
      toast.success(res.message);
      navigate(`/customer/orders/${res.data.orderId}`);
    },
    onError: (err) => {
      toast.error(err.message || 'Payment verification failed');
    }
  });

  const initiateMutation = useMutation({
    mutationFn: (data) => checkoutService.initiateCheckout(data),
    onSuccess: (res) => {
      const session = res.data;
      const razorpayKey = configData?.data?.razorpayKey || 'rzp_test_YOURKEY';
      
      const options = {
        key: razorpayKey,
        amount: session.amount, // in paise
        currency: session.currency,
        name: 'Eatoggy',
        description: 'Food Order',
        order_id: session.razorpayOrderId,
        handler: function (response) {
          verifyPaymentMutation.mutate({
            checkoutSessionId: session._id,
            razorpayOrderId: response.razorpay_order_id,
            razorpayPaymentId: response.razorpay_payment_id,
            razorpaySignature: response.razorpay_signature
          });
        },
        prefill: {
          name: session.customerName,
          contact: session.customerPhone,
        },
        theme: {
          color: '#EA580C',
        },
      };
      
      const rzp = new window.Razorpay(options);
      rzp.open();
    },
    onError: (err) => {
      toast.error(err.message || 'Failed to initiate checkout');
    }
  });

  const handlePayment = () => {
    if (!selectedAddressId) {
      toast.error('Please select a delivery address');
      return;
    }
    initiateMutation.mutate({ addressId: selectedAddressId });
  };

  if (isLoadingSummary) {
    return <div className="flex justify-center p-8">Loading checkout details...</div>;
  }

  const summary = summaryRes?.data;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-8">Checkout</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Select Delivery Address</h2>
            
            {isLoadingAddresses ? (
              <div className="text-gray-500">Loading addresses...</div>
            ) : addresses && addresses.length > 0 ? (
              <div className="space-y-4 mb-4">
                {addresses.map((address) => {
                  const id = address._id || address.id;
                  return (
                    <div 
                      key={id}
                      className={`border rounded-md p-4 cursor-pointer flex items-start transition-colors ${selectedAddressId === id ? 'border-orange-500 bg-orange-50' : 'hover:border-orange-300'}`}
                      onClick={() => setSelectedAddressId(id)}
                    >
                      <input 
                        type="radio" 
                        name="address" 
                        className="mt-1 mr-3 text-orange-600 focus:ring-orange-500" 
                        checked={selectedAddressId === id} 
                        readOnly 
                      />
                      <div>
                        <p className="font-medium text-gray-900">{address.name} <span className="text-gray-500 text-sm ml-2">{address.mobile}</span></p>
                        <p className="text-sm text-gray-500">
                          {address.addressLine1}, {address.landmark && `${address.landmark}, `}
                          {address.city}, {address.state} - {address.pincode}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-gray-500 mb-4">No addresses found.</div>
            )}

            <button 
              onClick={() => navigate('/customer/addresses')}
              className="text-orange-600 font-medium text-sm hover:text-orange-700"
            >
              + Manage Addresses
            </button>
          </div>
        </div>

        <div className="lg:col-span-1">
          <CheckoutSummary summary={summary} appliedCoupon={null} />
          
          <button
            onClick={handlePayment}
            disabled={initiateMutation.isPending || verifyPaymentMutation.isPending}
            className="w-full mt-6 flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 disabled:opacity-50"
          >
            {initiateMutation.isPending || verifyPaymentMutation.isPending 
              ? 'Processing...' 
              : 'Proceed to Pay'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CustomerCheckout;
