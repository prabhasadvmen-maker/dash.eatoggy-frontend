import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  getRestaurantTiffinPlansAPI,
  createRestaurantTiffinPlanAPI,
  updateRestaurantTiffinPlanAPI,
  toggleTiffinPlanStatusAPI,
  deleteRestaurantTiffinPlanAPI
} from '../../services/subscription/subscriptionService.js';
import {
  Calendar,
  Plus,
  Edit2,
  Power,
  ArrowLeft,
  Utensils,
  AlertCircle,
  Trash2,
  Settings,
  Eye,
  MoreVertical
} from 'lucide-react';
import DataTable from '../../components/common/Table/DataTable';
import { useDataTableSync } from '../../hooks/useDataTableSync';

const ActionDropdown = ({ row, onEdit, onToggleStatus, onDelete }) => {
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
        className="p-1.5 bg-gray-100 border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
        title="Settings"
      >
        <Settings size={16} />
      </button>
      
      {open && (
        <div className="absolute right-0 mt-2 w-40 bg-white rounded-xl shadow-lg border border-gray-100 z-10 py-1 overflow-hidden">
          <button
            onClick={() => { setOpen(false); onEdit(row); }}
            className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2 transition-colors"
          >
            <Eye size={14} className="text-gray-500" />
            View Plan
          </button>
          <button
            onClick={() => { setOpen(false); onEdit(row); }}
            className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2 transition-colors"
          >
            <Edit2 size={14} className="text-blue-500" />
            Edit Plan
          </button>
          <button
            onClick={() => { setOpen(false); onToggleStatus(row._id, row.status); }}
            className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2 transition-colors"
          >
            <Power size={14} className={row.status === 'ACTIVE' ? 'text-amber-500' : 'text-emerald-500'} />
            {row.status === 'ACTIVE' ? 'Disable Plan' : 'Enable Plan'}
          </button>
          <div className="h-[1px] bg-gray-100 my-1"></div>
          <button
            onClick={() => { setOpen(false); onDelete(row._id); }}
            className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2 transition-colors"
          >
            <Trash2 size={14} className="text-red-500" />
            Delete Plan
          </button>
        </div>
      )}
    </div>
  );
};

const RestaurantTiffinPlans = () => {
  const navigate = useNavigate();
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

  const [plans, setPlans] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [showModal, setShowModal] = useState(false);
  const [editingPlan, setEditingPlan] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // Form State
  const [planName, setPlanName] = useState('');
  const [description, setDescription] = useState('');
  const [mealType, setMealType] = useState('LUNCH');
  const [durationDays, setDurationDays] = useState(30);
  const [pricePerMeal, setPricePerMeal] = useState(120);
  const [discountPercentage, setDiscountPercentage] = useState(10);
  const [cutoffTime, setCutoffTime] = useState('09:00');
  const [items, setItems] = useState([{ name: 'Roti', quantity: 4 }, { name: 'Dal', quantity: 1 }]);
  const [availableDays, setAvailableDays] = useState(['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY']);

  const fetchPlans = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Build query string based on DataTable state
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

      // We'll pass this via a manual fetch to intercept, or we can use the service but the service doesn't support queryParams yet.
      // Wait, let's use the fetch directly so we don't have to rewrite the service right now.
      const token = localStorage.getItem('restaurant_token') || localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/restaurants/tiffin-plans?${queryParams.toString()}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      const resData = await response.json();
      
      if (response.ok && resData.success) {
        setPlans(resData.data?.plans || resData.data || []);
        if (resData.meta && resData.meta.pagination) {
          setTotal(resData.meta.pagination.total);
        } else {
          setTotal(resData.data?.plans?.length || 0);
        }
      } else {
        setError(resData.message || 'Failed to load restaurant tiffin plans');
        setPlans([]);
        setTotal(0);
      }
    } catch (err) {
      setError('Error loading restaurant tiffin plans');
      setPlans([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }, [page, limit, search, sortBy, sortOrder, filters]);

  useEffect(() => {
    fetchPlans();
  }, [fetchPlans]);

  const openCreateModal = () => {
    setEditingPlan(null);
    setPlanName('');
    setDescription('');
    setMealType('LUNCH');
    setDurationDays(30);
    setPricePerMeal(120);
    setDiscountPercentage(10);
    setCutoffTime('09:00');
    setItems([{ name: 'Roti', quantity: 4 }, { name: 'Special Curry', quantity: 1 }]);
    setShowModal(true);
  };

  const openEditModal = (plan) => {
    setEditingPlan(plan);
    setPlanName(plan.name || plan.planName || '');
    setDescription(plan.description || '');
    setMealType(plan.mealType || 'LUNCH');
    setDurationDays(plan.planDurationDays || plan.durationDays || 30);
    setPricePerMeal(plan.pricePerMeal || 120);
    setDiscountPercentage(plan.discountPercentage || 0);
    setCutoffTime(plan.cutoffTime || '09:00');
    setItems(plan.items && plan.items.length > 0 ? plan.items : [{ name: 'Item', quantity: 1 }]);
    setAvailableDays(plan.availableDays || []);
    setShowModal(true);
  };

  const handleAddItem = () => {
    setItems([...items, { name: '', quantity: 1 }]);
  };

  const handleItemChange = (index, field, value) => {
    const updated = [...items];
    updated[index][field] = field === 'quantity' ? Number(value) : value;
    setItems(updated);
  };

  const handleRemoveItem = (index) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!planName || pricePerMeal <= 0) {
      alert('Plan Name and valid Price Per Meal are required');
      return;
    }

    const payload = {
      planName,
      description,
      mealType,
      durationDays: Number(durationDays),
      pricePerMeal: Number(pricePerMeal),
      discountPercentage: Number(discountPercentage),
      cutoffTime,
      items: items.filter(i => i.name.trim() !== ''),
      availableDays
    };

    try {
      setSubmitting(true);
      let res;
      if (editingPlan) {
        res = await updateRestaurantTiffinPlanAPI(editingPlan._id, payload);
      } else {
        res = await createRestaurantTiffinPlanAPI(payload);
      }

      if (res.ok && res.data.success) {
        setShowModal(false);
        fetchPlans();
      } else {
        alert(res.data.message || 'Failed to save tiffin plan');
      }
    } catch (err) {
      alert('Error saving tiffin plan');
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleStatus = async (planId, currentStatus) => {
    try {
      const res = await toggleTiffinPlanStatusAPI(planId, currentStatus === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE');
      if (res.ok && res.data.success) {
        fetchPlans();
      } else {
        alert(res.data.message || 'Failed to update plan status');
      }
    } catch (err) {
      alert('Error updating status');
    }
  };

  const handleDeletePlan = async (planId) => {
    if (window.confirm('Are you sure you want to delete this tiffin plan?')) {
      try {
        const res = await deleteRestaurantTiffinPlanAPI(planId);
        if (res.ok && res.data.success) {
          fetchPlans();
        } else {
          alert(res.data.message || 'Failed to delete plan');
        }
      } catch (err) {
        alert('Error deleting plan');
      }
    }
  };


  const columns = [
    {
      key: 'srNo',
      label: 'Sr. No.',
      align: 'center',
      render: (_, rowIndex) => (
        <span className="text-gray-500 font-medium text-sm">
          {((page - 1) * limit) + rowIndex + 1}
        </span>
      )
    },
    {
      key: 'name',
      label: 'Plan Name',
      sortable: true,
      render: (row) => (
        <div className="flex flex-col">
          <span className="font-bold text-gray-900 text-sm">{row.name || row.planName}</span>
          <span className="text-xs text-gray-500 line-clamp-1 max-w-[200px]">{row.description}</span>
        </div>
      )
    },
    {
      key: 'mealType',
      label: 'Meal Type',
      sortable: true,
      render: (row) => (
        <span className="px-2.5 py-0.5 bg-amber-500/10 border border-amber-500/30 text-[#d4af37] text-[10px] font-bold rounded-full uppercase">
          {row.mealType}
        </span>
      )
    },
    {
      key: 'planDurationDays',
      label: 'Duration',
      sortable: true,
      align: 'center',
      render: (row) => (
        <span className="text-xs font-semibold text-gray-700 bg-indigo-500/10 border border-indigo-500/30 px-2.5 py-0.5 rounded-full">
          {row.planDurationDays || row.durationDays} Days
        </span>
      )
    },
    {
      key: 'pricePerMeal',
      label: 'Price / Meal',
      sortable: true,
      align: 'right',
      render: (row) => (
        <span className="font-bold text-[#d4af37] text-sm">
          ₹{row.pricePerMeal}
        </span>
      )
    },
    {
      key: 'totalPrice',
      label: 'Total Plan Price',
      sortable: true,
      align: 'right',
      render: (row) => (
        <span className="font-bold text-gray-900 text-sm">
          ₹{row.totalPrice}
        </span>
      )
    },
    {
      key: 'status',
      label: 'Status',
      sortable: true,
      align: 'center',
      render: (row) => {
        const isActive = row.status === 'ACTIVE';
        return (
          <span className={`px-2.5 py-0.5 border text-[10px] font-bold rounded-full ${
            isActive ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' : 'bg-gray-100 text-gray-500 border-gray-200'
          }`}>
            {isActive ? 'ACTIVE' : 'INACTIVE'}
          </span>
        );
      }
    },
    {
      key: 'actions',
      label: 'Actions',
      align: 'right',
      render: (row) => (
        <ActionDropdown 
          row={row} 
          onEdit={openEditModal} 
          onToggleStatus={handleToggleStatus} 
          onDelete={handleDeletePlan} 
        />
      )
    }
  ];

  const filterConfig = [
    {
      key: 'status',
      label: 'Status',
      type: 'select',
      options: [
        { label: 'All Statuses', value: '' },
        { label: 'Active', value: 'ACTIVE' },
        { label: 'Inactive', value: 'INACTIVE' }
      ]
    },
    {
      key: 'mealType',
      label: 'Meal Type',
      type: 'select',
      options: [
        { label: 'All Meals', value: '' },
        { label: 'Lunch', value: 'LUNCH' },
        { label: 'Dinner', value: 'DINNER' },
        { label: 'Both', value: 'BOTH' }
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-gray-900 font-sans flex flex-col p-4 md:p-6">
      {/* Header */}
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-200 pb-4 mb-6">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/restaurant')}
            className="w-10 h-10 rounded-full bg-white border border-gray-200 flex items-center justify-center hover:bg-gray-100 cursor-pointer transition-colors"
          >
            <ArrowLeft size={18} className="text-gray-900" />
          </button>
          <div>
            <h1 className="text-xl font-black text-gray-900 flex items-center gap-2">
              <Calendar size={22} className="text-[#d4af37]" />
              Tiffin Plan Management
            </h1>
            <p className="text-xs text-gray-500 mt-1">Manage Daily Meal Subscription Offers for Customers</p>
          </div>
        </div>

        <button
          onClick={openCreateModal}
          className="px-4 py-2.5 bg-[#1e1e2e] text-[#d4af37] font-bold rounded-xl text-sm hover:brightness-110 cursor-pointer flex items-center gap-1.5 shadow-lg shadow-[#d4af37]/10 transition-all"
        >
          <Plus size={18} />
          Create Tiffin Plan
        </button>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-6xl mx-auto w-full space-y-6">
        {error && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 flex items-center gap-3 text-red-400 text-sm font-semibold">
            <AlertCircle size={20} className="shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
          <DataTable
            columns={columns}
            data={plans}
            loading={loading}
            emptyState={
              <div className="py-12 flex flex-col items-center justify-center text-center space-y-4">
                <div className="w-16 h-16 bg-gray-100/50 rounded-full flex items-center justify-center">
                  <Utensils size={32} className="text-gray-400" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900 mb-1">No Tiffin Plans Found</h3>
                  <p className="text-sm text-gray-500 max-w-sm mx-auto">Create subscription packages for weekly or monthly recurring lunch and dinner deliveries!</p>
                </div>
                <button
                  onClick={openCreateModal}
                  className="px-5 py-2 bg-[#1e1e2e] text-[#d4af37] font-bold rounded-lg text-sm mt-2 hover:bg-black transition-colors cursor-pointer"
                >
                  Create Your First Plan
                </button>
              </div>
            }
            
            search={{ value: search, placeholder: 'Search plan name or description...' }}
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
            
            // Adjust pagination text to look good in dark mode
            paginationClassName="text-gray-700"
          />
        </div>
      </main>

      {/* Create / Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 flex items-center justify-center p-4 z-[100] animate-fadeIn">
          <div className="bg-white rounded-[2rem] p-8 max-w-xl w-full space-y-6 shadow-2xl max-h-[90vh] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent">
            <div className="flex items-center justify-between border-b border-gray-100 pb-5">
              <h2 className="text-2xl font-black text-gray-900 flex items-center gap-2">
                <Calendar size={24} className="text-[#d4af37]" />
                {editingPlan ? 'Edit Tiffin Plan' : 'Create New Tiffin Plan'}
              </h2>
              <button 
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors p-2 rounded-full hover:bg-gray-50"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5 text-sm">
              <div className="space-y-2">
                <label className="text-gray-700 font-bold text-xs uppercase tracking-wider">Plan Name *</label>
                <input
                  type="text"
                  required
                  value={planName}
                  onChange={(e) => setPlanName(e.target.value)}
                  placeholder="e.g. Executive Lunch Thali"
                  className="w-full px-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#d4af37]/30 focus:border-[#d4af37] transition-all"
                />
              </div>

              <div className="space-y-2">
                <label className="text-gray-700 font-bold text-xs uppercase tracking-wider">Description</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Fresh home style meals delivered daily..."
                  className="w-full px-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#d4af37]/30 focus:border-[#d4af37] h-24 resize-none transition-all"
                />
              </div>

              <div className="grid grid-cols-2 gap-5">
                <div className="space-y-2">
                  <label className="text-gray-700 font-bold text-xs uppercase tracking-wider">Meal Type</label>
                  <select
                    value={mealType}
                    onChange={(e) => setMealType(e.target.value)}
                    className="w-full px-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#d4af37]/30 focus:border-[#d4af37] transition-all"
                  >
                    <option value="LUNCH">Lunch Only</option>
                    <option value="DINNER">Dinner Only</option>
                    <option value="BOTH">Lunch & Dinner</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-gray-700 font-bold text-xs uppercase tracking-wider">Duration (Days)</label>
                  <input
                    type="number"
                    min="1"
                    value={durationDays}
                    onChange={(e) => setDurationDays(e.target.value)}
                    className="w-full px-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#d4af37]/30 focus:border-[#d4af37] transition-all"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-5">
                <div className="space-y-2">
                  <label className="text-gray-700 font-bold text-xs uppercase tracking-wider">Price Per Meal (₹) *</label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={pricePerMeal}
                    onChange={(e) => setPricePerMeal(e.target.value)}
                    className="w-full px-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#d4af37]/30 focus:border-[#d4af37] transition-all"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-gray-700 font-bold text-xs uppercase tracking-wider">Discount %</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={discountPercentage}
                    onChange={(e) => setDiscountPercentage(e.target.value)}
                    className="w-full px-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#d4af37]/30 focus:border-[#d4af37] transition-all"
                  />
                </div>
              </div>

              {/* Items List */}
              <div className="space-y-4 border-t border-gray-100 pt-5 mt-4">
                <div className="flex items-center justify-between">
                  <label className="text-gray-700 font-bold text-xs uppercase tracking-wider">Included Daily Menu Items</label>
                  <button
                    type="button"
                    onClick={handleAddItem}
                    className="text-xs text-white bg-[#1e1e2e] hover:bg-black px-3 py-1.5 rounded-lg font-bold flex items-center gap-1 cursor-pointer transition-colors"
                  >
                    <Plus size={14} /> Add Item
                  </button>
                </div>

                <div className="space-y-3">
                  {items.map((item, idx) => (
                    <div key={idx} className="flex items-center gap-3 bg-white border border-gray-100 p-2 rounded-2xl shadow-sm">
                      <input
                        type="text"
                        placeholder="Item name (e.g. Roti)"
                        value={item.name}
                        onChange={(e) => handleItemChange(idx, 'name', e.target.value)}
                        className="flex-1 px-4 py-2.5 bg-gray-50 border-none rounded-xl text-gray-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#d4af37]/30 transition-all"
                      />
                      <input
                        type="number"
                        min="1"
                        placeholder="Qty"
                        value={item.quantity}
                        onChange={(e) => handleItemChange(idx, 'quantity', e.target.value)}
                        className="w-20 px-3 py-2.5 bg-gray-50 border-none rounded-xl text-gray-900 text-center focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#d4af37]/30 transition-all"
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveItem(idx)}
                        className="text-red-500 hover:text-red-600 hover:bg-red-50 p-2.5 rounded-xl transition-colors cursor-pointer"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex items-center justify-end gap-3 border-t border-gray-100 pt-6 mt-6">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-6 py-3 bg-gray-100 text-gray-700 font-bold rounded-xl hover:bg-gray-200 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-8 py-3 bg-[#1e1e2e] text-[#d4af37] font-black rounded-xl hover:bg-black disabled:opacity-50 cursor-pointer transition-colors shadow-lg shadow-[#1e1e2e]/20"
                >
                  {submitting ? 'Saving...' : 'Save Tiffin Plan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default RestaurantTiffinPlans;
