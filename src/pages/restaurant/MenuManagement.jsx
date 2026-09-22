import React, { useState, useEffect, useCallback } from 'react';
import { 
  Plus, Edit, AlertCircle, X, Save,
  ImageIcon, Send, Trash2, Power
} from 'lucide-react';
import { 
  getMenuItems, createMenuItem, updateMenuItem, 
  submitForVerification, toggleAvailability, deleteDraft
} from '../../services/restaurant/restaurantMenuService';

import API_BASE_URL from '../../services/apiService';
import DataTable from '../../components/common/Table/DataTable';
import { useDataTableSync } from '../../hooks/useDataTableSync';

const fetchActiveCategories = async () => {
  const token = localStorage.getItem('restaurant_token');
  const res = await fetch(`${API_BASE_URL}/api/restaurants/menu/categories?isActive=true`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  const data = await res.json();
  return data.data || [];
};

const fetchActiveSubcategories = async (categoryId) => {
  const token = localStorage.getItem('restaurant_token');
  const res = await fetch(`${API_BASE_URL}/api/restaurants/menu/subcategories?isActive=true&categoryId=${categoryId}`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  const data = await res.json();
  return data.data || [];
};

const StatusBadge = ({ status, isAvailable }) => {
  let config = { bg: 'bg-gray-100', text: 'text-gray-800', label: 'Draft' };
  
  if (status === 'PENDING_REVIEW') config = { bg: 'bg-amber-100', text: 'text-amber-800', label: 'Under Review' };
  else if (status === 'APPROVED') config = { bg: 'bg-emerald-100', text: 'text-emerald-800', label: 'Approved' };
  else if (status === 'REJECTED') config = { bg: 'bg-red-100', text: 'text-red-800', label: 'Rejected' };

  return (
    <div className="flex flex-col gap-1 items-start">
      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${config.bg} ${config.text}`}>
        {config.label}
      </span>
      {status === 'APPROVED' && (
        <span className={`text-[10px] font-bold uppercase tracking-wider ${isAvailable ? 'text-emerald-600' : 'text-gray-400'}`}>
          {isAvailable ? 'Available' : 'Unavailable'}
        </span>
      )}
    </div>
  );
};

const MenuManagement = () => {
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

  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    categoryId: '',
    subcategoryId: '',
    name: '',
    description: '',
    price: '',
    foodType: 'VEG',
    preparationTime: '',
    availability: true,
  });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  // Categories loading
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const catsRes = await fetchActiveCategories();
        setCategories(catsRes || []);
      } catch (err) {
        console.error('Failed to load categories');
      }
    };
    loadCategories();
  }, []);

  const loadInitialData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const queryParams = new URLSearchParams({
        page,
        limit,
        sortBy,
        sortOrder
      });
      
      if (search) queryParams.append('search', search);
      
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          queryParams.append(key, value);
        }
      });

      const itemsRes = await getMenuItems(`?${queryParams.toString()}`);
      
      if (itemsRes.data) {
        setItems(itemsRes.data);
        if (itemsRes.meta && itemsRes.meta.pagination) {
          setTotal(itemsRes.meta.pagination.total);
        } else {
          setTotal(itemsRes.data.length);
        }
      } else {
        setItems([]);
        setTotal(0);
      }
      
    } catch (err) {
      setError(err.message || 'Failed to load menu items');
    } finally {
      setLoading(false);
    }
  }, [page, limit, search, sortBy, sortOrder, filters]);

  useEffect(() => {
    loadInitialData();
  }, [loadInitialData]);

  const handleCategoryChange = async (categoryId) => {
    setFormData({ ...formData, categoryId, subcategoryId: '' });
    if (categoryId) {
      try {
        const subCats = await fetchActiveSubcategories(categoryId);
        setSubcategories(subCats || []);
      } catch (err) {
        console.error('Failed to load subcategories');
      }
    } else {
      setSubcategories([]);
    }
  };

  const openModal = async (item = null) => {
    if (item) {
      setEditingItem(item);
      setFormData({
        categoryId: item.categoryId?._id || '',
        subcategoryId: item.subcategoryId?._id || '',
        name: item.name || '',
        description: item.description || '',
        price: item.price || '',
        foodType: item.foodType || 'VEG',
        preparationTime: item.preparationTime || '',
        availability: item.availability,
      });
      setImagePreview(item.image);
      if (item.categoryId?._id) {
        await handleCategoryChange(item.categoryId._id);
        setFormData(prev => ({ ...prev, subcategoryId: item.subcategoryId?._id || '' }));
      }
    } else {
      setEditingItem(null);
      setFormData({
        categoryId: '',
        subcategoryId: '',
        name: '',
        description: '',
        price: '',
        foodType: 'VEG',
        preparationTime: '',
        availability: true,
      });
      setImagePreview(null);
      setSubcategories([]);
    }
    setImageFile(null);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingItem(null);
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e, isDraft = false) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      setError(null);
      
      const payload = new FormData();
      Object.keys(formData).forEach(key => {
        if (formData[key] !== undefined && formData[key] !== null) {
          payload.append(key, formData[key]);
        }
      });
      payload.append('isDraft', isDraft);
      if (imageFile) {
        payload.append('image', imageFile);
      }

      if (editingItem) {
        await updateMenuItem(editingItem._id, payload);
      } else {
        await createMenuItem(payload);
      }
      
      await loadInitialData();
      closeModal();
    } catch (err) {
      setError(err.message || 'Failed to save menu item');
    } finally {
      setSubmitting(false);
    }
  };

  const handleAction = async (action, id, value = null) => {
    if (!window.confirm('Are you sure?')) return;
    try {
      if (action === 'submit') {
        await submitForVerification(id);
      } else if (action === 'toggleAvailability') {
        await toggleAvailability(id, value);
      } else if (action === 'delete') {
        await deleteDraft(id);
      }
      await loadInitialData();
    } catch (err) {
      alert(err.message);
    }
  };

  const columns = [
    {
      key: 'name',
      label: 'Item',
      sortable: true,
      render: (row) => (
        <div className="flex items-center gap-4">
          {row.image ? (
            <img src={row.image} alt={row.name} className="w-12 h-12 rounded-xl object-cover bg-gray-100 border border-gray-200" />
          ) : (
            <div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center border border-gray-200">
              <ImageIcon className="text-gray-400" size={20} />
            </div>
          )}
          <div>
            <p className="font-bold text-slate-800 text-sm">{row.name}</p>
            <p className="text-[10px] font-bold text-gray-500 flex items-center gap-1 mt-0.5">
              <span className={`w-2 h-2 rounded-full ${row.foodType === 'VEG' ? 'bg-green-500' : 'bg-red-500'}`}></span>
              {row.foodType}
            </p>
          </div>
        </div>
      )
    },
    {
      key: 'category',
      label: 'Category',
      sortable: false,
      render: (row) => (
        <div>
          <p className="text-xs font-bold text-gray-800">{row.categoryId?.name}</p>
          <p className="text-[10px] font-semibold text-gray-500">{row.subcategoryId?.name}</p>
        </div>
      )
    },
    {
      key: 'price',
      label: 'Price',
      sortable: true,
      render: (row) => (
        <span className="font-bold text-slate-900 text-sm">
          ₹{row.price}
        </span>
      )
    },
    {
      key: 'status',
      label: 'Status',
      sortable: true,
      render: (row) => (
        <div>
          <StatusBadge status={row.status} isAvailable={row.availability} />
          {row.status === 'REJECTED' && row.rejectionReason && (
            <div className="mt-1.5 p-1.5 bg-red-50 border border-red-200 rounded-lg text-[10px] text-red-700 font-medium max-w-[200px]" data-testid="rejection-reason-box">
              <span className="font-bold block text-red-800">Rejection Reason:</span>
              <span className="truncate block">{row.rejectionReason}</span>
            </div>
          )}
        </div>
      )
    },
    {
      key: 'actions',
      label: 'Actions',
      align: 'right',
      render: (row) => (
        <div className="flex items-center justify-end gap-1.5">
          {/* Edit Action */}
          {row.status !== 'PENDING_REVIEW' && (
            <button
              onClick={() => openModal(row)}
              className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
              title={row.status === 'REJECTED' ? "Edit & Correct Item" : "Edit"}
            >
              <Edit size={16} />
            </button>
          )}

          {/* Submit / Resubmit Action */}
          {(row.status === 'DRAFT' || row.status === 'REJECTED') && (
            <button
              onClick={() => handleAction('submit', row._id)}
              className="p-1.5 text-[#d4af37] hover:bg-[#fbf7ea] rounded-lg transition-colors cursor-pointer"
              title={row.status === 'REJECTED' ? "Resubmit for Review" : "Submit for Verification"}
              data-testid="resubmit-btn"
            >
              <Send size={16} />
            </button>
          )}

          {/* Availability Toggle */}
          {row.status === 'APPROVED' && (
            <button
              onClick={() => handleAction('toggleAvailability', row._id, !row.availability)}
              className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                row.availability ? 'text-emerald-600 hover:bg-emerald-50' : 'text-gray-400 hover:bg-gray-100'
              }`}
              title={row.availability ? "Mark Unavailable" : "Mark Available"}
            >
              <Power size={16} />
            </button>
          )}

          {/* Delete Draft */}
          {row.status === 'DRAFT' && (
            <button
              onClick={() => handleAction('delete', row._id)}
              className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
              title="Delete Draft"
            >
              <Trash2 size={16} />
            </button>
          )}
        </div>
      )
    }
  ];

  const filterConfig = [
    {
      key: 'status',
      label: 'Status',
      type: 'select',
      options: [
        { label: 'Draft', value: 'DRAFT' },
        { label: 'Pending Review', value: 'PENDING_REVIEW' },
        { label: 'Approved', value: 'APPROVED' },
        { label: 'Rejected', value: 'REJECTED' }
      ]
    },
    {
      key: 'availability',
      label: 'Availability',
      type: 'select',
      options: [
        { label: 'Available', value: 'true' },
        { label: 'Unavailable', value: 'false' }
      ]
    },
    {
      key: 'foodType',
      label: 'Food Type',
      type: 'select',
      options: [
        { label: 'Veg', value: 'VEG' },
        { label: 'Non-Veg', value: 'NON_VEG' }
      ]
    },
    {
      key: 'categoryId',
      label: 'Category',
      type: 'select',
      options: categories.map(c => ({ label: c.name, value: c._id }))
    }
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Menu Management</h1>
          <p className="text-gray-500 text-sm mt-1">Manage your restaurant offerings and pricing</p>
        </div>
        <button
          onClick={() => openModal()}
          className="flex items-center gap-2 bg-[#d4af37] text-white px-5 py-2.5 rounded-xl hover:bg-[#b5952f] transition-colors shadow-sm font-bold text-sm cursor-pointer"
        >
          <Plus size={18} />
          Add Menu Item
        </button>
      </div>

      {error && (
        <div className="p-4 bg-red-50 text-red-600 rounded-xl border border-red-100 flex items-center gap-3 font-semibold text-sm">
          <AlertCircle size={18} />
          <p>{error}</p>
        </div>
      )}

      <DataTable
        columns={columns}
        data={items}
        loading={loading}
        emptyMessage="No menu items found. Add your first item!"
        
        search={{ value: search, placeholder: 'Search by item name or description...' }}
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

      {/* Add/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/50 backdrop-blur-sm overflow-y-auto animate-fadeIn">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden my-8">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <h2 className="text-xl font-bold text-gray-900">
                {editingItem ? 'Edit Menu Item' : 'Add Menu Item'}
              </h2>
              <button onClick={closeModal} className="text-gray-400 hover:text-gray-600 p-2 rounded-full hover:bg-gray-100 cursor-pointer">
                <X size={20} />
              </button>
            </div>

            <form className="p-6">
              
              {/* If Rejected, show reason prominently */}
              {editingItem?.status === 'REJECTED' && (
                <div className="mb-6 p-4 bg-red-50 rounded-xl border border-red-200 flex items-start gap-3" data-testid="modal-rejection-reason">
                  <AlertCircle size={20} className="text-red-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-bold text-red-800">Verification Rejected by SuperAdmin</h4>
                    <p className="text-sm text-red-700 mt-1 font-semibold">{editingItem.rejectionReason}</p>
                    <p className="text-xs text-red-500 mt-1.5 font-medium">Please update the item details below and click "Save & Resubmit" to submit for re-verification.</p>
                  </div>
                </div>
              )}

              {/* If Approved, warn about re-verification */}
              {editingItem?.status === 'APPROVED' && (
                <div className="mb-6 p-4 bg-amber-50 rounded-xl border border-amber-200 flex items-start gap-3">
                  <AlertCircle size={20} className="text-amber-600 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-amber-900 font-medium">
                    Editing an approved item will revert its status back to <span className="font-bold">Under Review</span> until re-verified by Eatoggy.
                  </p>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div className="col-span-1 md:col-span-2">
                  <label className="block text-xs font-bold text-gray-700 mb-1.5">Item Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-[#d4af37] outline-none transition-all"
                    placeholder="e.g. Special Veg Thali"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1.5">Category *</label>
                  <select
                    required
                    value={formData.categoryId}
                    onChange={(e) => handleCategoryChange(e.target.value)}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-[#d4af37] outline-none transition-all"
                  >
                    <option value="">Select Category</option>
                    {categories.map(c => (
                      <option key={c._id} value={c._id}>{c.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1.5">Subcategory *</label>
                  <select
                    required
                    value={formData.subcategoryId}
                    onChange={(e) => setFormData({ ...formData, subcategoryId: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-[#d4af37] outline-none transition-all disabled:opacity-50"
                    disabled={!formData.categoryId}
                  >
                    <option value="">Select Subcategory</option>
                    {subcategories.map(sc => (
                      <option key={sc._id} value={sc._id}>{sc.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1.5">Price (₹) *</label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-[#d4af37] outline-none transition-all"
                    placeholder="0.00"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1.5">Food Type</label>
                  <div className="flex gap-6 pt-2">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="foodType"
                        value="VEG"
                        checked={formData.foodType === 'VEG'}
                        onChange={(e) => setFormData({ ...formData, foodType: e.target.value })}
                        className="text-green-500 focus:ring-green-500 w-4 h-4 cursor-pointer"
                      />
                      <span className="text-sm font-bold text-gray-700 flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-green-500"></span> Veg
                      </span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="foodType"
                        value="NON_VEG"
                        checked={formData.foodType === 'NON_VEG'}
                        onChange={(e) => setFormData({ ...formData, foodType: e.target.value })}
                        className="text-red-500 focus:ring-red-500 w-4 h-4 cursor-pointer"
                      />
                      <span className="text-sm font-bold text-gray-700 flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-red-500"></span> Non-Veg
                      </span>
                    </label>
                  </div>
                </div>

                <div className="col-span-1 md:col-span-2">
                  <label className="block text-xs font-bold text-gray-700 mb-1.5">Description</label>
                  <textarea
                    rows="3"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-[#d4af37] outline-none transition-all resize-none"
                    placeholder="Brief description of the item ingredients and taste..."
                  ></textarea>
                </div>

                <div className="col-span-1 md:col-span-2">
                  <label className="block text-xs font-bold text-gray-700 mb-1.5">Item Image</label>
                  <div className="flex items-start gap-6">
                    {imagePreview ? (
                      <div className="relative w-28 h-28 rounded-xl overflow-hidden border border-gray-200">
                        <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => { setImageFile(null); setImagePreview(null); }}
                          className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors shadow-sm cursor-pointer"
                        >
                          <X size={12} />
                        </button>
                      </div>
                    ) : (
                      <div className="w-28 h-28 rounded-xl border-2 border-dashed border-gray-300 flex items-center justify-center bg-gray-50 text-gray-400">
                        <ImageIcon size={28} />
                      </div>
                    )}
                    <div className="flex-1">
                      <input
                        type="file"
                        accept="image/jpeg, image/png, image/webp"
                        onChange={handleImageChange}
                        className="block w-full text-sm text-gray-500 file:mr-4 file:py-2.5 file:px-5 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-[#fbf7ea] file:text-[#b5952f] hover:file:bg-[#f5eecb] cursor-pointer transition-colors"
                      />
                      <p className="mt-2 text-xs font-medium text-gray-500">
                        Recommended: Square image, 500x500px minimum. Formats: JPG, PNG, WEBP. Max size: 2MB.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="col-span-1 md:col-span-2 flex items-center gap-3">
                  <div className="relative inline-block w-10 mr-2 align-middle select-none">
                    <input 
                      type="checkbox" 
                      id="availability-toggle"
                      checked={formData.availability}
                      onChange={(e) => setFormData({ ...formData, availability: e.target.checked })}
                      className="toggle-checkbox absolute block w-5 h-5 rounded-full bg-white border-4 appearance-none cursor-pointer transition-transform duration-200 ease-in-out"
                      style={{ transform: formData.availability ? 'translateX(100%)' : 'translateX(0)', borderColor: formData.availability ? '#10b981' : '#e5e7eb', right: '0' }}
                    />
                    <label 
                      htmlFor="availability-toggle" 
                      className={`toggle-label block overflow-hidden h-5 rounded-full bg-gray-300 cursor-pointer ${formData.availability ? 'bg-emerald-500' : 'bg-gray-200'}`}
                    ></label>
                  </div>
                  <label htmlFor="availability-toggle" className="text-sm font-bold text-gray-700 cursor-pointer">
                    Available for Order
                  </label>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-6 border-t border-gray-100">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-5 py-2.5 text-xs font-bold text-gray-700 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                
                {/* Draft button - only if new, draft, or rejected */}
                {(!editingItem || editingItem.status === 'DRAFT' || editingItem.status === 'REJECTED') && (
                  <button
                    type="button"
                    disabled={submitting}
                    onClick={(e) => handleSubmit(e, true)}
                    className="px-5 py-2.5 text-xs font-bold text-gray-700 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors flex items-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    <Save size={16} />
                    Save as Draft
                  </button>
                )}

                <button
                  type="button"
                  disabled={submitting}
                  onClick={(e) => handleSubmit(e, false)}
                  className="px-6 py-2.5 text-xs font-bold text-white bg-[#d4af37] rounded-xl hover:bg-[#b5952f] transition-colors shadow-sm flex items-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {submitting 
                    ? 'Saving...' 
                    : (editingItem?.status === 'REJECTED' 
                      ? 'Save & Resubmit for Review' 
                      : (editingItem?.status === 'APPROVED' ? 'Submit Updates' : 'Submit for Review'))}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      
    </div>
  );
};

export default MenuManagement;
