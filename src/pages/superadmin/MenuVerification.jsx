import React, { useState, useEffect } from 'react';
import { CheckCircle, XCircle, FileText, Image as ImageIcon, AlertCircle, X } from 'lucide-react';
import { getPendingMenuItems, approveMenuItem, rejectMenuItem } from '../../services/superadmin/superAdminMenuService';

const MenuVerification = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [selectedItem, setSelectedItem] = useState(null);
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    loadPendingItems();
  }, []);

  const loadPendingItems = async () => {
    try {
      setLoading(true);
      const res = await getPendingMenuItems('PENDING_REVIEW');
      if (res.ok) {
        setItems(res.data?.data || []);
      } else {
        throw new Error(res.data?.message || 'Failed to load pending items');
      }
    } catch (err) {
      setError(err.message || 'Failed to load pending items');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id) => {
    if (!window.confirm('Are you sure you want to approve this menu item?')) return;
    try {
      setActionLoading(true);
      await approveMenuItem(id);
      await loadPendingItems();
      setSelectedItem(null);
    } catch (err) {
      alert(err.message || 'Failed to approve item');
    } finally {
      setActionLoading(false);
    }
  };

  const openRejectModal = (item) => {
    setSelectedItem(item);
    setRejectionReason('');
    setIsRejectModalOpen(true);
  };

  const handleReject = async (e) => {
    e.preventDefault();
    if (!rejectionReason.trim()) {
      alert('Rejection reason is required');
      return;
    }
    try {
      setActionLoading(true);
      await rejectMenuItem(selectedItem._id, rejectionReason);
      await loadPendingItems();
      setIsRejectModalOpen(false);
      setSelectedItem(null);
    } catch (err) {
      alert(err.message || 'Failed to reject item');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading && items.length === 0) {
    return <div className="p-8 text-center text-gray-500">Loading pending items...</div>;
  }

  return (
    <div className="space-y-6 flex flex-col md:flex-row gap-6">
      
      {/* Left List Pane */}
      <div className="w-full md:w-1/2 lg:w-2/5 space-y-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Menu Verification</h1>
          <p className="text-gray-500 text-sm mt-1">Review pending menu items submitted by partners</p>
        </div>

        {error && (
          <div className="p-4 bg-red-50 text-red-600 rounded-xl border border-red-100 flex items-center gap-3">
            <AlertCircle size={20} />
            <p>{error}</p>
          </div>
        )}

        <div className="space-y-3 max-h-[calc(100vh-200px)] overflow-y-auto pr-2 custom-scrollbar">
          {items.length === 0 ? (
            <div className="p-8 text-center bg-white rounded-2xl border border-gray-100 shadow-sm text-gray-500">
              <CheckCircle className="mx-auto mb-3 text-emerald-500" size={32} />
              All caught up! No items pending review.
            </div>
          ) : (
            items.map(item => (
              <div 
                key={item._id}
                onClick={() => setSelectedItem(item)}
                className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                  selectedItem?._id === item._id 
                    ? 'bg-blue-50 border-blue-200 shadow-sm ring-1 ring-blue-500' 
                    : 'bg-white border-gray-100 shadow-sm hover:border-gray-200 hover:shadow-md'
                }`}
              >
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-semibold text-gray-900">{item.name}</h3>
                  <span className="font-bold text-gray-900">₹{item.price}</span>
                </div>
                <p className="text-sm text-gray-600 mb-1">{item.restaurantId?.businessDetails?.restaurantName || 'Unknown Restaurant'}</p>
                <div className="flex gap-2 text-xs text-gray-500">
                  <span className="px-2 py-1 bg-gray-100 rounded-md">{item.categoryId?.name}</span>
                  <span className="px-2 py-1 bg-gray-100 rounded-md">{item.subcategoryId?.name}</span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Right Detail Pane */}
      <div className="w-full md:w-1/2 lg:w-3/5">
        {selectedItem ? (
          <div className="bg-white rounded-2xl shadow-md border border-gray-100 overflow-hidden sticky top-6">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <h2 className="text-lg font-bold text-gray-900">Review Details</h2>
              <span className="px-3 py-1 bg-amber-100 text-amber-800 rounded-full text-xs font-semibold">
                Pending Review
              </span>
            </div>
            
            <div className="p-6 space-y-6">
              {/* Image & Basic Info */}
              <div className="flex flex-col md:flex-row gap-6">
                <div className="w-full md:w-48 h-48 rounded-xl bg-gray-100 border border-gray-200 flex-shrink-0 overflow-hidden flex items-center justify-center">
                  {selectedItem.image ? (
                    <img src={selectedItem.image} alt={selectedItem.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="text-center text-gray-400">
                      <ImageIcon className="mx-auto mb-2" size={32} />
                      <span className="text-sm">No Image</span>
                    </div>
                  )}
                </div>
                <div className="flex-1 space-y-4">
                  <div>
                    <h1 className="text-2xl font-bold text-gray-900">{selectedItem.name}</h1>
                    <p className="text-lg font-semibold text-gray-700 mt-1">₹{selectedItem.price}</p>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-gray-500 uppercase font-semibold">Restaurant</p>
                      <p className="text-sm text-gray-900">{selectedItem.restaurantId?.businessDetails?.restaurantName}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 uppercase font-semibold">Food Type</p>
                      <div className="flex items-center gap-1 mt-0.5">
                        <span className={`w-2 h-2 rounded-full ${selectedItem.foodType === 'VEG' ? 'bg-green-500' : 'bg-red-500'}`}></span>
                        <span className="text-sm text-gray-900">{selectedItem.foodType}</span>
                      </div>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 uppercase font-semibold">Category</p>
                      <p className="text-sm text-gray-900">{selectedItem.categoryId?.name}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 uppercase font-semibold">Subcategory</p>
                      <p className="text-sm text-gray-900">{selectedItem.subcategoryId?.name}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                <p className="text-xs text-gray-500 uppercase font-semibold mb-2">Description</p>
                <p className="text-sm text-gray-800 whitespace-pre-wrap">{selectedItem.description || 'No description provided.'}</p>
              </div>

              {/* Actions */}
              <div className="flex gap-4 pt-4 border-t border-gray-100">
                <button
                  disabled={actionLoading}
                  onClick={() => handleApprove(selectedItem._id)}
                  className="flex-1 bg-emerald-600 text-white py-3 rounded-xl font-bold hover:bg-emerald-700 transition-colors flex justify-center items-center gap-2 shadow-sm"
                >
                  <CheckCircle size={20} />
                  Approve Item
                </button>
                <button
                  disabled={actionLoading}
                  onClick={() => openRejectModal(selectedItem)}
                  className="flex-1 bg-white text-red-600 border border-red-200 py-3 rounded-xl font-bold hover:bg-red-50 transition-colors flex justify-center items-center gap-2 shadow-sm"
                >
                  <XCircle size={20} />
                  Reject Item
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="h-full min-h-[400px] flex flex-col items-center justify-center bg-gray-50 rounded-2xl border border-dashed border-gray-200 p-8 text-center">
            <FileText className="text-gray-300 mb-4" size={48} />
            <h3 className="text-lg font-bold text-gray-500">No Item Selected</h3>
            <p className="text-sm text-gray-400 mt-2">Select an item from the list to review its details</p>
          </div>
        )}
      </div>

      {/* Reject Modal */}
      {isRejectModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b border-gray-100 bg-red-50">
              <h2 className="text-xl font-bold text-red-900 flex items-center gap-2">
                <XCircle size={24} />
                Reject Verification
              </h2>
              <button onClick={() => setIsRejectModalOpen(false)} className="text-red-400 hover:text-red-600 p-1">
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleReject} className="p-6">
              <p className="text-sm text-gray-600 mb-4">
                Please provide a specific reason for rejecting <strong>{selectedItem?.name}</strong>. This will be shown to the restaurant partner.
              </p>
              
              <textarea
                required
                rows="4"
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="e.g. The uploaded image is blurry. Please upload a clear photo of the dish."
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition-all resize-none mb-6"
              ></textarea>
              
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setIsRejectModalOpen(false)}
                  className="flex-1 py-2.5 text-gray-700 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="flex-1 py-2.5 text-white bg-red-600 rounded-xl hover:bg-red-700 transition-colors font-bold shadow-sm"
                >
                  {actionLoading ? 'Processing...' : 'Confirm Rejection'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default MenuVerification;
