import React, { useState, useEffect, useRef } from 'react';
import { CheckCircle, XCircle, FileText, Image as ImageIcon, AlertCircle, X, Settings, Check, Eye } from 'lucide-react';
import { getPendingMenuItems, approveMenuItem, rejectMenuItem } from '../../services/superadmin/superAdminMenuService';
import ConfirmModal from '../../components/common/ConfirmModal/ConfirmModal';
import DataTable from '../../components/common/Table/DataTable';

const ImageCell = ({ src, alt, foodType }) => {
  const [imgError, setImgError] = useState(false);
  return (
    <div className="flex items-center gap-4">
      <div className="w-12 h-12 rounded-2xl bg-gray-50 flex items-center justify-center flex-shrink-0 border border-gray-100 overflow-hidden shadow-sm relative">
        {src && !imgError ? (
          <img
            src={src}
            alt={alt || 'Menu item'}
            className="w-full h-full object-cover transition-transform hover:scale-110"
            onError={() => setImgError(true)}
          />
        ) : (
          <ImageIcon size={20} className="text-gray-300" />
        )}
        <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white flex items-center justify-center ${foodType === 'VEG' ? 'bg-green-500' : 'bg-red-500'}`}>
          <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
        </div>
      </div>
    </div>
  );
};

const ActionsDropdown = ({ row, openViewModal, handleApprove, openRejectModal }) => {
  const [isOpen, setIsOpen] = useState(false);
  const buttonRef = useRef(null);
  const menuRef = useRef(null);
  const [dropdownPos, setDropdownPos] = useState({ top: 0, right: 0 });

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        (buttonRef.current && buttonRef.current.contains(event.target)) ||
        (menuRef.current && menuRef.current.contains(event.target))
      ) {
        return;
      }
      setIsOpen(false);
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('scroll', () => setIsOpen(false), true);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('scroll', () => setIsOpen(false), true);
    }
  }, [isOpen]);

  const toggleDropdown = (e) => {
    e.stopPropagation();
    if (!isOpen && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setDropdownPos({ 
        top: rect.bottom, 
        right: window.innerWidth - rect.right 
      });
    }
    setIsOpen(!isOpen);
  };

  return (
    <>
      <button 
        ref={buttonRef}
        onClick={toggleDropdown}
        className="p-2 text-gray-500 hover:bg-gray-100 rounded-full transition-colors cursor-pointer"
      >
        <Settings size={18} />
      </button>
      
      {isOpen && (
        <div 
          ref={menuRef}
          className="fixed mt-1 w-44 bg-white rounded-xl shadow-[0_4px_20px_rgba(0,0,0,0.15)] border border-gray-100 z-[9999] py-1.5"
          style={{ top: dropdownPos.top, right: dropdownPos.right }}
        >
          <button
            onClick={(e) => { e.stopPropagation(); setIsOpen(false); openViewModal(row); }}
            className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-slate-50 flex items-center gap-3 cursor-pointer"
          >
            <Eye size={16} className="text-blue-500" /> 
            View Details
          </button>
          
          <button
            onClick={(e) => { e.stopPropagation(); setIsOpen(false); handleApprove(row._id); }}
            className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-slate-50 flex items-center gap-3 cursor-pointer"
          >
            <Check size={16} className="text-green-500" /> 
            Approve
          </button>

          <button
            onClick={(e) => { e.stopPropagation(); setIsOpen(false); openRejectModal(row); }}
            className="w-full text-left px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 flex items-center gap-3 cursor-pointer"
          >
            <X size={16} className="text-red-500" /> 
            Reject
          </button>
        </div>
      )}
    </>
  );
};

const MenuVerification = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [selectedItem, setSelectedItem] = useState(null);
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  // Confirm Modal State
  const [confirmModal, setConfirmModal] = useState({
    open: false,
    id: null
  });

  useEffect(() => {
    loadPendingItems();
  }, []);

  const loadPendingItems = async () => {
    try {
      setLoading(true);
      const res = await getPendingMenuItems('ALL');
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

  const confirmApprove = (id) => {
    setConfirmModal({ open: true, id });
  };

  const handleApprove = async () => {
    const id = confirmModal.id;
    if (!id) return;
    try {
      setActionLoading(true);
      await approveMenuItem(id);
      await loadPendingItems();
      setSelectedItem(null);
      setIsViewModalOpen(false);
    } catch (err) {
      alert(err.message || 'Failed to approve item');
    } finally {
      setActionLoading(false);
      setConfirmModal({ open: false, id: null });
    }
  };

  const openViewModal = (item) => {
    setSelectedItem(item);
    setIsViewModalOpen(true);
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
      setIsViewModalOpen(false);
      setSelectedItem(null);
    } catch (err) {
      alert(err.message || 'Failed to reject item');
    } finally {
      setActionLoading(false);
    }
  };

  const columns = [
    {
      key: 'srNo',
      label: 'Sr. No.',
      align: 'center',
      className: 'px-2 py-3',
      headerClassName: 'px-2 py-3',
      render: (_, rowIndex) => (
        <span className="text-gray-500 font-medium text-sm">
          {rowIndex + 1}
        </span>
      )
    },
    {
      key: 'name',
      label: 'Item',
      className: 'px-2 py-3',
      headerClassName: 'px-2 py-3',
      render: (row) => (
        <ImageCell src={row.image} alt={row.name} foodType={row.foodType} />
      )
    },
    {
      key: 'details',
      label: 'Details',
      className: 'px-2 py-3',
      headerClassName: 'px-2 py-3',
      render: (row) => (
        <div className="whitespace-nowrap">
          <p className="font-bold text-gray-900 truncate max-w-[150px]" title={row.name}>{row.name}</p>
          <p className="text-xs text-gray-500 truncate max-w-[150px]" title={row.description}>{row.description}</p>
        </div>
      )
    },
    {
      key: 'restaurant',
      label: 'Restaurant',
      className: 'px-2 py-3',
      headerClassName: 'px-2 py-3',
      render: (row) => (
        <span className="text-sm font-semibold text-gray-700 whitespace-nowrap truncate max-w-[120px] inline-block" title={row.restaurantId?.restaurantName || row.restaurantId?.name || 'Unknown'}>
          {row.restaurantId?.restaurantName || row.restaurantId?.name || 'Unknown'}
        </span>
      )
    },
    {
      key: 'category',
      label: 'Category',
      className: 'px-2 py-3',
      headerClassName: 'px-2 py-3',
      render: (row) => (
        <div className="whitespace-nowrap">
          <p className="text-xs font-bold text-gray-800 truncate max-w-[120px]" title={row.categoryId?.name}>{row.categoryId?.name}</p>
          <p className="text-[10px] font-semibold text-gray-500 truncate max-w-[120px]" title={row.subcategoryId?.name}>{row.subcategoryId?.name}</p>
        </div>
      )
    },
    {
      key: 'price',
      label: 'Price',
      sortable: true,
      className: 'px-2 py-3',
      headerClassName: 'px-2 py-3',
      render: (row) => (
        <span className="font-bold text-gray-900 text-xs">₹{row.price}</span>
      )
    },
    {
      key: 'status',
      label: 'Status',
      className: 'px-2 py-3',
      headerClassName: 'px-2 py-3',
      render: (row) => {
        let statusConfig = { bg: 'bg-gray-100', text: 'text-gray-700', label: row.status };
        if (row.status === 'PENDING_REVIEW') statusConfig = { bg: 'bg-amber-100', text: 'text-amber-700', label: 'Pending Review' };
        else if (row.status === 'APPROVED') statusConfig = { bg: 'bg-emerald-100', text: 'text-emerald-700', label: 'Approved' };
        else if (row.status === 'REJECTED') statusConfig = { bg: 'bg-red-100', text: 'text-red-700', label: 'Rejected' };
        else if (row.status === 'DRAFT') statusConfig = { bg: 'bg-slate-100', text: 'text-slate-700', label: 'Draft' };
        
        return (
          <span className={`px-2 py-1 rounded-full text-[10px] font-bold ${statusConfig.bg} ${statusConfig.text} whitespace-nowrap`}>
            {statusConfig.label}
          </span>
        );
      }
    },
    {
      key: 'actions',
      label: 'Actions',
      className: 'px-2 py-3',
      headerClassName: 'px-2 py-3',
      render: (row) => (
        <ActionsDropdown 
          row={row} 
          openViewModal={openViewModal} 
          handleApprove={(id) => confirmApprove(id)} 
          openRejectModal={openRejectModal} 
        />
      )
    }
  ];

  return (
    <div className="space-y-6">
      
      {/* Header */}
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

      {/* Table */}
      <DataTable 
        columns={columns} 
        data={items} 
        loading={loading} 
        emptyMessage="No items found."
        searchPlaceholder="Search menu items..."
      />

      {/* View Modal */}
      {isViewModalOpen && selectedItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/50 animate-fadeIn">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                Review Details
              </h2>
              <button onClick={() => setIsViewModalOpen(false)} className="text-gray-400 hover:text-gray-600 p-1">
                <X size={20} />
              </button>
            </div>
            
            <div className="p-6 space-y-6 overflow-y-auto">
              <div className="flex flex-col md:flex-row gap-6">
                <div className="w-full md:w-48 h-48 rounded-xl bg-gray-100 border border-gray-200 flex-shrink-0 overflow-hidden flex items-center justify-center relative">
                  {selectedItem.image ? (
                    <img src={selectedItem.image} alt={selectedItem.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="text-center text-gray-400">
                      <ImageIcon className="mx-auto mb-2" size={32} />
                      <span className="text-sm">No Image</span>
                    </div>
                  )}
                  <div className={`absolute -bottom-2 -right-2 w-8 h-8 rounded-full border-4 border-white flex items-center justify-center ${selectedItem.foodType === 'VEG' ? 'bg-green-500' : 'bg-red-500'}`}>
                    <div className="w-3 h-3 bg-white rounded-full"></div>
                  </div>
                </div>
                <div className="flex-1 space-y-4">
                  <div>
                    <h1 className="text-2xl font-bold text-gray-900">{selectedItem.name}</h1>
                    <p className="text-lg font-semibold text-gray-700 mt-1">₹{selectedItem.price}</p>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-gray-500 uppercase font-semibold">Restaurant</p>
                      <p className="text-sm text-gray-900">{selectedItem.restaurantId?.restaurantName}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 uppercase font-semibold">Food Type</p>
                      <p className="text-sm text-gray-900">{selectedItem.foodType}</p>
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

              <div className="flex gap-4 pt-4 border-t border-gray-100">
                <button
                  disabled={actionLoading}
                  onClick={() => confirmApprove(selectedItem._id)}
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
        </div>
      )}

      {/* Reject Modal */}
      {isRejectModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-gray-900/50">
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

      {/* Confirm Approve Modal */}
      <ConfirmModal
        open={confirmModal.open}
        title="Approve Menu Item"
        message="Are you sure you want to approve this menu item?"
        confirmText="Approve"
        cancelText="Cancel"
        variant="success"
        loading={actionLoading}
        onConfirm={handleApprove}
        onCancel={() => setConfirmModal({ open: false, id: null })}
      />

    </div>
  );
};

export default MenuVerification;
