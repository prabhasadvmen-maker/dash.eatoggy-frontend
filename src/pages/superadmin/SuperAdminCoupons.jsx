import React, { useState, useEffect, useCallback } from 'react';
import { Tags, Plus, X, ShieldAlert, Edit2, Trash2, Settings, Eye } from 'lucide-react';
import DataTable from '../../components/common/Table/DataTable';
import { useDataTableSync } from '../../hooks/useDataTableSync';
import {
  fetchCoupons,
  createCoupon,
  updateCoupon,
  deleteCoupon,
  toggleCouponStatus
} from '../../services/superadmin/superAdminCouponService';

const ActionDropdown = ({ row, onEdit, onDelete, onView }) => {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const handleClick = () => setOpen(false);
    if (open) window.addEventListener('click', handleClick);
    return () => window.removeEventListener('click', handleClick);
  }, [open]);

  return (
    <div className="relative inline-block text-left" onClick={(e) => e.stopPropagation()}>
      <button
        onClick={() => setOpen(!open)}
        className="p-1.5 bg-gray-100 border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors cursor-pointer"
        title="Settings"
      >
        <Settings size={16} />
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-100 z-10 py-1 overflow-hidden">
          <button
            onClick={() => { setOpen(false); onView(row); }}
            className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2 transition-colors cursor-pointer"
          >
            <Eye size={14} className="text-gray-500" />
            View Details
          </button>
          <button
            onClick={() => { setOpen(false); onEdit(row); }}
            className="w-full text-left px-4 py-2 text-sm text-blue-600 hover:bg-blue-50 flex items-center gap-2 transition-colors cursor-pointer"
          >
            <Edit2 size={14} className="text-blue-500" />
            Edit Coupon
          </button>
          <div className="h-[1px] bg-gray-100 my-1"></div>
          <button
            onClick={() => { setOpen(false); onDelete(row._id); }}
            className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2 transition-colors cursor-pointer"
          >
            <Trash2 size={14} className="text-red-500" />
            Delete
          </button>
        </div>
      )}
    </div>
  );
};

const SuperAdminCoupons = () => {
  const {
    page, setPage,
    limit, setLimit,
    search, setSearch,
    sortBy, sortOrder, setSort,
    filters, setFilters,
    handleClearFilters
  } = useDataTableSync({
    defaultSortBy: 'createdAt',
    defaultSortOrder: 'desc'
  });

  const [coupons, setCoupons] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [modalType, setModalType] = useState('add');
  const [currentId, setCurrentId] = useState(null);
  const [formData, setFormData] = useState({
    code: '',
    title: '',
    description: '',
    discountType: 'PERCENTAGE',
    discountValue: '',
    minOrderValue: 0,
    maxDiscountAmount: '',
    validFrom: '',
    validUntil: '',
    usageLimit: ''
  });
  const [submitting, setSubmitting] = useState(false);
  
  // View Details Modal State
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [selectedCoupon, setSelectedCoupon] = useState(null);

  const loadCoupons = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      
      const queryParams = new URLSearchParams({ page, limit, sortBy, sortOrder });
      if (search) queryParams.append('search', search);
      
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          queryParams.append(key, value);
        }
      });

      const { ok, data } = await fetchCoupons(queryParams.toString());
      if (ok) {
        setCoupons(data.data || []);
        if (data.meta && data.meta.pagination) {
          setTotal(data.meta.pagination.total);
        } else {
          setTotal(data.data?.length || 0);
        }
      } else {
        setError(data.message || 'Failed to fetch coupons');
      }
    } catch (err) {
      setError('Network error while fetching coupons');
    } finally {
      setLoading(false);
    }
  }, [page, limit, search, sortBy, sortOrder, filters]);

  useEffect(() => {
    loadCoupons();
  }, [loadCoupons]);

  const handleOpenModal = (type, coupon = null) => {
    setModalType(type);
    if (coupon) {
      setCurrentId(coupon._id);
      setFormData({
        code: coupon.code || '',
        title: coupon.title || '',
        description: coupon.description || '',
        discountType: coupon.discountType || 'PERCENTAGE',
        discountValue: coupon.discountValue || '',
        minOrderValue: coupon.minOrderValue || 0,
        maxDiscountAmount: coupon.maxDiscountAmount || '',
        validFrom: coupon.validFrom ? coupon.validFrom.split('T')[0] : '',
        validUntil: coupon.validUntil ? coupon.validUntil.split('T')[0] : '',
        usageLimit: coupon.usageLimit || ''
      });
    } else {
      setCurrentId(null);
      setFormData({
        code: '', title: '', description: '', discountType: 'PERCENTAGE',
        discountValue: '', minOrderValue: 0, maxDiscountAmount: '',
        validFrom: '', validUntil: '', usageLimit: ''
      });
    }
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const payload = { ...formData };
      if (!payload.maxDiscountAmount) delete payload.maxDiscountAmount;
      if (!payload.usageLimit) delete payload.usageLimit;
      
      const { ok, data } = modalType === 'edit'
        ? await updateCoupon(currentId, payload)
        : await createCoupon(payload);

      if (ok) {
        handleCloseModal();
        loadCoupons();
      } else {
        alert(data.message || 'Failed to save coupon');
      }
    } catch (err) {
      alert('Network error while saving coupon');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this coupon?')) return;
    try {
      const { ok, data } = await deleteCoupon(id);
      if (ok) {
        loadCoupons();
      } else {
        alert(data.message || 'Failed to delete coupon');
      }
    } catch (err) {
      alert('Network error while deleting coupon');
    }
  };

  const handleToggleStatus = async (id) => {
    try {
      const { ok, data } = await toggleCouponStatus(id);
      if (ok) {
        setCoupons(coupons.map(c => c._id === id ? { ...c, isActive: !c.isActive } : c));
      } else {
        alert(data.message || 'Failed to toggle status');
      }
    } catch (err) {
      alert('Network error');
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  const columns = [
    {
      key: 'srNo',
      label: 'Sr. No.',
      sortable: false,
      align: 'center',
      render: (_, rowIndex) => (
        <span className="text-gray-500 font-medium text-sm">
          {((page - 1) * limit) + rowIndex + 1}
        </span>
      )
    },
    {
      key: 'code',
      label: 'Coupon Code',
      sortable: true,
      render: (row) => <span className="font-bold text-[#d4af37] px-2 py-1 bg-[#d4af37]/10 rounded-md uppercase">{row.code}</span>
    },
    {
      key: 'title',
      label: 'Title',
      sortable: true,
      render: (row) => (
        <div>
          <div className="font-medium text-slate-800">{row.title}</div>
          <div className="text-[10px] text-gray-500 max-w-[200px] truncate">{row.description}</div>
        </div>
      )
    },
    {
      key: 'discount',
      label: 'Discount',
      sortable: false,
      render: (row) => (
        <span className="font-bold text-emerald-600">
          {row.discountType === 'PERCENTAGE' ? `${row.discountValue}%` : `₹${row.discountValue}`}
          {row.maxDiscountAmount ? ` (Max ₹${row.maxDiscountAmount})` : ''}
        </span>
      )
    },
    {
      key: 'validity',
      label: 'Validity',
      sortable: false,
      render: (row) => (
        <div className="text-xs text-gray-600">
          <div>From: <span className="font-medium">{formatDate(row.validFrom)}</span></div>
          <div>To: <span className="font-medium">{formatDate(row.validUntil)}</span></div>
        </div>
      )
    },
    {
      key: 'usage',
      label: 'Usage',
      sortable: false,
      align: 'center',
      render: (row) => (
        <span className="text-xs font-semibold text-slate-700">
          {row.usageCount} / {row.usageLimit || '∞'}
        </span>
      )
    },
    {
      key: 'isActive',
      label: 'Status',
      sortable: true,
      align: 'center',
      render: (row) => (
        <button
          onClick={() => handleToggleStatus(row._id)}
          className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors cursor-pointer ${
            row.isActive ? 'bg-emerald-500' : 'bg-slate-300'
          }`}
        >
          <span
            className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${
              row.isActive ? 'translate-x-4' : 'translate-x-1'
            }`}
          />
        </button>
      )
    },
    {
      key: 'actions',
      label: 'Actions',
      align: 'right',
      render: (row) => (
        <ActionDropdown 
          row={row} 
          onEdit={(r) => handleOpenModal('edit', r)}
          onDelete={handleDelete}
          onView={(r) => { setSelectedCoupon(r); setViewModalOpen(true); }}
        />
      )
    }
  ];

  const filterConfig = [
    {
      key: 'isActive',
      label: 'Status',
      type: 'select',
      options: [
        { label: 'Active', value: 'true' },
        { label: 'Inactive', value: 'false' }
      ]
    }
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">Coupons & Offers</h1>
          <p className="text-slate-400 mt-1">Create and manage platform-wide discounts and promotions</p>
        </div>
        <button
          onClick={() => handleOpenModal('add')}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#d4af37] text-white hover:bg-[#b5952f] rounded-xl text-sm font-bold shadow-sm transition-all cursor-pointer"
        >
          <Plus size={18} /> Create Coupon
        </button>
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-xl flex items-center gap-3">
          <ShieldAlert size={20} />
          {error}
        </div>
      )}

      <DataTable
        columns={columns}
        data={coupons}
        loading={loading}
        emptyMessage="No coupons found matching your criteria."
        search={{ value: search, placeholder: 'Search code or title...' }}
        onSearchChange={setSearch}
        filterConfig={filterConfig}
        filters={filters}
        onFilterChange={setFilters}
        onClearFilters={handleClearFilters}
        sorting={{ sortBy, sortOrder }}
        onSortChange={setSort}
        pagination={{ page, limit, total }}
        onPageChange={setPage}
        onLimitChange={setLimit}
      />

      {modalOpen && (
        <div className="fixed inset-0 bg-gray-900/50 flex items-center justify-center p-4 z-50 overflow-y-auto pt-20">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden p-6 space-y-6 animate-fadeIn">
            <div className="flex items-center justify-between border-b pb-3">
              <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <Tags className="text-[#d4af37]" size={22} />
                {modalType === 'edit' ? 'Edit Coupon' : 'Create New Coupon'}
              </h2>
              <button onClick={handleCloseModal} className="text-gray-400 hover:text-gray-600 cursor-pointer">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Coupon Code *</label>
                  <input
                    type="text"
                    name="code"
                    value={formData.code}
                    onChange={handleInputChange}
                    placeholder="e.g. WELCOME50"
                    required
                    className="w-full p-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-[#d4af37] outline-none uppercase"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Title *</label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    placeholder="e.g. 50% Off First Order"
                    required
                    className="w-full p-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-[#d4af37] outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Description</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Terms and conditions..."
                  rows="2"
                  className="w-full p-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-[#d4af37] outline-none"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Discount Type *</label>
                  <select
                    name="discountType"
                    value={formData.discountType}
                    onChange={handleInputChange}
                    required
                    className="w-full p-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-[#d4af37] outline-none"
                  >
                    <option value="PERCENTAGE">Percentage (%)</option>
                    <option value="FLAT">Flat Amount (₹)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Discount Value *</label>
                  <input
                    type="number"
                    name="discountValue"
                    value={formData.discountValue}
                    onChange={handleInputChange}
                    placeholder="e.g. 50"
                    required
                    min="1"
                    className="w-full p-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-[#d4af37] outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Max Discount (₹)</label>
                  <input
                    type="number"
                    name="maxDiscountAmount"
                    value={formData.maxDiscountAmount}
                    onChange={handleInputChange}
                    placeholder="e.g. 150"
                    disabled={formData.discountType === 'FLAT'}
                    className="w-full p-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-[#d4af37] outline-none disabled:bg-gray-100"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Min Order Value (₹)</label>
                  <input
                    type="number"
                    name="minOrderValue"
                    value={formData.minOrderValue}
                    onChange={handleInputChange}
                    placeholder="e.g. 200"
                    className="w-full p-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-[#d4af37] outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Valid From *</label>
                  <input
                    type="date"
                    name="validFrom"
                    value={formData.validFrom}
                    onChange={handleInputChange}
                    required
                    className="w-full p-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-[#d4af37] outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Valid Until *</label>
                  <input
                    type="date"
                    name="validUntil"
                    value={formData.validUntil}
                    onChange={handleInputChange}
                    required
                    className="w-full p-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-[#d4af37] outline-none"
                  />
                </div>
              </div>

              <div className="w-1/2 pr-2">
                <label className="block text-xs font-bold text-gray-700 mb-1">Usage Limit (Total uses)</label>
                <input
                  type="number"
                  name="usageLimit"
                  value={formData.usageLimit}
                  onChange={handleInputChange}
                  placeholder="Leave blank for unlimited"
                  className="w-full p-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-[#d4af37] outline-none"
                />
              </div>

              <div className="flex gap-3 pt-4 border-t">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="flex-1 py-3 border border-gray-200 text-gray-700 font-bold text-sm rounded-xl hover:bg-gray-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 py-3 bg-[#d4af37] text-white font-bold text-sm rounded-xl hover:bg-[#b5952f] disabled:opacity-50 cursor-pointer"
                >
                  {submitting ? 'Saving...' : 'Save Coupon'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Details Modal */}
      {viewModalOpen && selectedCoupon && (
        <div className="fixed inset-0 bg-gray-900/50 flex items-center justify-center p-4 z-50 overflow-y-auto pt-20">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden p-6 space-y-4 animate-fadeIn">
            <div className="flex items-center justify-between border-b pb-3">
              <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <Tags className="text-[#d4af37]" size={22} /> Coupon Details
              </h2>
              <button onClick={() => setViewModalOpen(false)} className="text-gray-400 hover:text-gray-600 cursor-pointer">
                <X size={20} />
              </button>
            </div>
            
            <div className="space-y-4 text-sm">
              <div className="bg-gray-50 p-4 rounded-xl flex items-center justify-between">
                <span className="font-bold text-slate-700">Code</span>
                <span className="font-bold text-[#d4af37] px-2 py-1 bg-[#d4af37]/10 rounded-md uppercase">{selectedCoupon.code}</span>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="block text-gray-400 text-xs font-bold mb-1">Title</span>
                  <span className="font-medium text-slate-800">{selectedCoupon.title}</span>
                </div>
                <div>
                  <span className="block text-gray-400 text-xs font-bold mb-1">Status</span>
                  <span className={`px-2 py-1 rounded text-xs font-bold ${selectedCoupon.isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                    {selectedCoupon.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
                <div className="col-span-2">
                  <span className="block text-gray-400 text-xs font-bold mb-1">Description</span>
                  <span className="text-slate-600">{selectedCoupon.description || 'No description provided'}</span>
                </div>
                
                <div>
                  <span className="block text-gray-400 text-xs font-bold mb-1">Discount</span>
                  <span className="font-bold text-emerald-600">
                    {selectedCoupon.discountType === 'PERCENTAGE' ? `${selectedCoupon.discountValue}%` : `₹${selectedCoupon.discountValue}`}
                  </span>
                </div>
                <div>
                  <span className="block text-gray-400 text-xs font-bold mb-1">Max Discount</span>
                  <span className="text-slate-700">{selectedCoupon.maxDiscountAmount ? `₹${selectedCoupon.maxDiscountAmount}` : 'N/A'}</span>
                </div>
                
                <div>
                  <span className="block text-gray-400 text-xs font-bold mb-1">Min Order Value</span>
                  <span className="text-slate-700">₹{selectedCoupon.minOrderValue || 0}</span>
                </div>
                <div>
                  <span className="block text-gray-400 text-xs font-bold mb-1">Usage</span>
                  <span className="text-slate-700">{selectedCoupon.usageCount} / {selectedCoupon.usageLimit || 'Unlimited'}</span>
                </div>
                
                <div>
                  <span className="block text-gray-400 text-xs font-bold mb-1">Valid From</span>
                  <span className="text-slate-700">{formatDate(selectedCoupon.validFrom)}</span>
                </div>
                <div>
                  <span className="block text-gray-400 text-xs font-bold mb-1">Valid Until</span>
                  <span className="text-slate-700">{formatDate(selectedCoupon.validUntil)}</span>
                </div>
              </div>
            </div>
            
            <div className="pt-4 border-t">
              <button
                onClick={() => setViewModalOpen(false)}
                className="w-full py-3 bg-gray-100 text-gray-700 font-bold text-sm rounded-xl hover:bg-gray-200 cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SuperAdminCoupons;
