import React, { useState } from 'react';

const cancellationReasons = [
  'Changed my mind',
  'Ordered by mistake',
  'Delivery time is too long',
  'Found a better deal',
  'Other'
];

const OrderCancellation = ({ order, onCancel, onSuccess, isLoading, onClose }) => {
  const [reason, setReason] = useState(cancellationReasons[0]);
  const [customReason, setCustomReason] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    const finalReason = reason === 'Other' ? customReason : reason;
    if (reason === 'Other' && !customReason.trim()) {
      alert('Please provide a reason');
      return;
    }
    onCancel({ orderId: order._id || order.id, reason: finalReason });
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:p-0">
        <div className="fixed inset-0 transition-opacity" aria-hidden="true" onClick={onClose}>
          <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
        </div>

        <div className="relative inline-block text-left bg-white rounded-lg shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-md sm:w-full">
          <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4 rounded-lg">
            <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">Cancel Order #{order.orderNumber}</h3>
            
            <div className="mb-4 bg-orange-50 p-3 rounded text-sm text-orange-800">
              <p>Refund amount: <strong>₹{order.pricing?.grandTotal || 0}</strong></p>
              <p className="mt-1">Refunds will be processed within 5-7 business days.</p>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Reason for cancellation</label>
                {cancellationReasons.map((r, idx) => (
                  <div key={idx} className="flex items-center mb-2">
                    <input
                      type="radio"
                      id={`reason-${idx}`}
                      name="cancel-reason"
                      value={r}
                      checked={reason === r}
                      onChange={(e) => setReason(e.target.value)}
                      className="h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300"
                    />
                    <label htmlFor={`reason-${idx}`} className="ml-2 block text-sm text-gray-700">
                      {r}
                    </label>
                  </div>
                ))}
              </div>

              {reason === 'Other' && (
                <div className="mb-4">
                  <textarea
                    rows="3"
                    className="w-full border-gray-300 rounded-md shadow-sm focus:border-orange-500 focus:ring-orange-500 sm:text-sm p-2 border outline-none"
                    placeholder="Please specify your reason"
                    value={customReason}
                    onChange={(e) => setCustomReason(e.target.value)}
                  ></textarea>
                </div>
              )}

              <div className="flex justify-end space-x-3 mt-6">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none"
                >
                  Close
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50"
                >
                  {isLoading ? 'Cancelling...' : 'Confirm Cancellation'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderCancellation;
