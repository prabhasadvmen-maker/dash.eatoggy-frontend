import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  getRestaurantTiffinPlansAPI,
  createRestaurantTiffinPlanAPI,
  updateRestaurantTiffinPlanAPI,
  toggleTiffinPlanStatusAPI
} from '../../services/subscription/subscriptionService.js';
import {
  Calendar,
  Plus,
  Edit2,
  Power,
  ArrowLeft,
  Utensils,
  AlertCircle,
  Trash2
} from 'lucide-react';
import DataTable from '../../components/common/Table/DataTable';
import { useDataTableSync } from '../../hooks/useDataTableSync';

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
        setPlans(resData.data || []);
        if (resData.meta && resData.meta.pagination) {
          setTotal(resData.meta.pagination.total);
        } else {
          setTotal(resData.data?.length || 0);
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

  const columns = [
    {
      key: 'name',
      label: 'Plan Name',
      sortable: true,
      render: (row) => (
        <div className="flex flex-col">
          <span className="font-bold text-white text-sm">{row.name || row.planName}</span>
          <span className="text-xs text-slate-400 line-clamp-1 max-w-[200px]">{row.description}</span>
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
        <span className="text-xs font-semibold text-slate-300 bg-indigo-500/10 border border-indigo-500/30 px-2.5 py-0.5 rounded-full">
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
        <span className="font-bold text-white text-sm">
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
            isActive ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' : 'bg-slate-800 text-slate-500 border-slate-700'
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
        <div className="flex items-center justify-end gap-2">
          <button
            onClick={() => handleToggleStatus(row._id, row.status)}
            className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${
              row.status === 'ACTIVE' 
                ? 'bg-amber-500/10 text-amber-400 border-amber-500/30 hover:bg-amber-500/20' 
                : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/20'
            }`}
            title={row.status === 'ACTIVE' ? 'Deactivate' : 'Activate'}
          >
            <Power size={14} />
          </button>
          <button
            onClick={() => openEditModal(row)}
            className="p-1.5 bg-slate-800 border border-slate-700 text-white rounded-lg hover:bg-slate-700 transition-colors cursor-pointer"
            title="Edit Plan"
          >
            <Edit2 size={14} />
          </button>
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
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans flex flex-col p-4 md:p-6">
      {/* Header */}
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4 mb-6">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/restaurant')}
            className="w-10 h-10 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center hover:bg-slate-800 cursor-pointer transition-colors"
          >
            <ArrowLeft size={18} className="text-white" />
          </button>
          <div>
            <h1 className="text-xl font-black text-white flex items-center gap-2">
              <Calendar size={22} className="text-[#d4af37]" />
              Tiffin Plan Management
            </h1>
            <p className="text-xs text-slate-400 mt-1">Manage Daily Meal Subscription Offers for Customers</p>
          </div>
        </div>

        <button
          onClick={openCreateModal}
          className="px-4 py-2.5 bg-[#d4af37] text-slate-950 font-bold rounded-xl text-sm hover:brightness-110 cursor-pointer flex items-center gap-1.5 shadow-lg shadow-[#d4af37]/10 transition-all"
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

        <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-xl overflow-hidden">
          <DataTable
            columns={columns}
            data={plans}
            loading={loading}
            emptyMessage={
              <div className="py-12 flex flex-col items-center justify-center text-center space-y-4">
                <div className="w-16 h-16 bg-slate-800/50 rounded-full flex items-center justify-center">
                  <Utensils size={32} className="text-slate-500" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white mb-1">No Tiffin Plans Found</h3>
                  <p className="text-sm text-slate-400 max-w-sm mx-auto">Create subscription packages for weekly or monthly recurring lunch and dinner deliveries!</p>
                </div>
                <button
                  onClick={openCreateModal}
                  className="px-5 py-2 bg-[#d4af37] text-slate-950 font-bold rounded-lg text-sm mt-2 hover:bg-[#c5a028] transition-colors cursor-pointer"
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
            paginationClassName="text-slate-300"
          />
        </div>
      </main>

      {/* Create / Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto animate-fadeIn">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-xl w-full space-y-5 shadow-2xl my-8">
            <h2 className="text-xl font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-4">
              <Calendar size={22} className="text-[#d4af37]" />
              {editingPlan ? 'Edit Tiffin Plan' : 'Create New Tiffin Plan'}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4 text-sm">
              <div className="space-y-1.5">
                <label className="text-slate-300 font-bold">Plan Name *</label>
                <input
                  type="text"
                  required
                  value={planName}
                  onChange={(e) => setPlanName(e.target.value)}
                  placeholder="e.g. Executive Lunch Thali"
                  className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-[#d4af37] transition-all"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-slate-300 font-bold">Description</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Fresh home style meals delivered daily..."
                  className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-[#d4af37] h-24 resize-none transition-all"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-slate-300 font-bold">Meal Type</label>
                  <select
                    value={mealType}
                    onChange={(e) => setMealType(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-[#d4af37] transition-all"
                  >
                    <option value="LUNCH">LUNCH</option>
                    <option value="DINNER">DINNER</option>
                    <option value="BOTH">BOTH</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-slate-300 font-bold">Duration (Days)</label>
                  <input
                    type="number"
                    min="1"
                    value={durationDays}
                    onChange={(e) => setDurationDays(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-[#d4af37] transition-all"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-slate-300 font-bold">Price Per Meal (₹) *</label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={pricePerMeal}
                    onChange={(e) => setPricePerMeal(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-[#d4af37] transition-all"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-slate-300 font-bold">Discount %</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={discountPercentage}
                    onChange={(e) => setDiscountPercentage(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-[#d4af37] transition-all"
                  />
                </div>
              </div>

              {/* Items List */}
              <div className="space-y-3 border-t border-slate-800 pt-4 mt-2">
                <div className="flex items-center justify-between">
                  <label className="text-slate-300 font-bold">Included Daily Menu Items</label>
                  <button
                    type="button"
                    onClick={handleAddItem}
                    className="text-xs text-[#d4af37] font-bold hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <Plus size={14} /> Add Item
                  </button>
                </div>

                {items.map((item, idx) => (
                  <div key={idx} className="flex items-center gap-3">
                    <input
                      type="text"
                      placeholder="Item name"
                      value={item.name}
                      onChange={(e) => handleItemChange(idx, 'name', e.target.value)}
                      className="flex-1 px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-[#d4af37] transition-all"
                    />
                    <input
                      type="number"
                      min="1"
                      placeholder="Qty"
                      value={item.quantity}
                      onChange={(e) => handleItemChange(idx, 'quantity', e.target.value)}
                      className="w-20 px-3 py-3 bg-slate-950 border border-slate-800 rounded-xl text-white text-center focus:outline-none focus:border-[#d4af37] transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveItem(idx)}
                      className="text-red-400 hover:text-red-300 p-2 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                ))}
              </div>

              {/* Action buttons */}
              <div className="flex items-center justify-end gap-3 border-t border-slate-800 pt-5 mt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-5 py-2.5 bg-slate-800 text-slate-300 font-bold rounded-xl hover:bg-slate-700 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-2.5 bg-[#d4af37] text-slate-950 font-black rounded-xl hover:bg-[#c5a028] disabled:opacity-50 cursor-pointer transition-colors shadow-lg shadow-[#d4af37]/10"
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
