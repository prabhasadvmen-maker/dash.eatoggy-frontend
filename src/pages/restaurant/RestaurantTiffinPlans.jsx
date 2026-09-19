import React, { useState, useEffect } from 'react';
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
  Clock,
  Tag,
  CheckCircle2,
  AlertCircle,
  Trash2
} from 'lucide-react';

const RestaurantTiffinPlans = () => {
  const navigate = useNavigate();
  const [plans, setPlans] = useState([]);
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

  useEffect(() => {
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await getRestaurantTiffinPlansAPI();
      if (res.ok && res.data.success) {
        setPlans(res.data.data.plans || []);
      } else {
        setError(res.data.message || 'Failed to load restaurant tiffin plans');
      }
    } catch (err) {
      setError('Error loading restaurant tiffin plans');
    } finally {
      setLoading(false);
    }
  };

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
    setPlanName(plan.planName || '');
    setDescription(plan.description || '');
    setMealType(plan.mealType || 'LUNCH');
    setDurationDays(plan.durationDays || 30);
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

  const handleToggleDay = (day) => {
    if (availableDays.includes(day)) {
      setAvailableDays(availableDays.filter(d => d !== day));
    } else {
      setAvailableDays([...availableDays, day]);
    }
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
      const res = await toggleTiffinPlanStatusAPI(planId, !currentStatus);
      if (res.ok && res.data.success) {
        fetchPlans();
      } else {
        alert(res.data.message || 'Failed to update plan status');
      }
    } catch (err) {
      alert('Error updating status');
    }
  };

  const ALL_WEEKDAYS = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY'];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans flex flex-col p-4 md:p-6" data-testid="restaurant-tiffin-plans-page">
      {/* Header */}
      <header className="flex items-center justify-between border-b border-slate-800 pb-4 mb-6">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/restaurant/dashboard')}
            className="w-10 h-10 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center hover:bg-slate-800 cursor-pointer"
          >
            <ArrowLeft size={18} className="text-white" />
          </button>
          <div>
            <h1 className="text-xl font-black text-white flex items-center gap-2">
              <Calendar size={22} className="text-[#d4af37]" />
              Tiffin Plan Management
            </h1>
            <p className="text-xs text-slate-400">Manage Daily Meal Subscription Offers for Customers</p>
          </div>
        </div>

        <button
          onClick={openCreateModal}
          className="px-4 py-2.5 bg-[#d4af37] text-slate-950 font-bold rounded-2xl text-xs hover:brightness-110 cursor-pointer flex items-center gap-1.5 shadow-lg shadow-[#d4af37]/10"
          data-testid="create-plan-btn"
        >
          <Plus size={16} />
          Create Tiffin Plan
        </button>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-5xl mx-auto w-full space-y-6">
        {error && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-2xl p-4 flex items-center gap-3 text-red-400 text-xs">
            <AlertCircle size={18} className="shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 space-y-3">
            <div className="w-10 h-10 border-4 border-[#d4af37] border-t-transparent rounded-full animate-spin"></div>
            <p className="text-xs text-[#d4af37] font-bold">Loading tiffin plans...</p>
          </div>
        ) : plans.length === 0 ? (
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-10 text-center space-y-4 my-8 shadow-xl" data-testid="empty-restaurant-plans">
            <Utensils size={48} className="text-slate-600 mx-auto" />
            <div className="space-y-1">
              <h2 className="text-lg font-bold text-white">No Tiffin Plans Created</h2>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                Create subscription packages for weekly or monthly recurring lunch and dinner deliveries!
              </p>
            </div>
            <button
              onClick={openCreateModal}
              className="px-6 py-2.5 bg-[#d4af37] text-slate-950 font-bold rounded-xl text-xs uppercase cursor-pointer"
            >
              Create Your First Plan
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4" data-testid="restaurant-plans-grid">
            {plans.map((plan) => (
              <div
                key={plan._id}
                className="bg-slate-900 border border-slate-800 rounded-3xl p-5 space-y-4 shadow-xl flex flex-col justify-between"
                data-testid={`restaurant-plan-card-${plan._id}`}
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="px-2.5 py-0.5 bg-amber-500/10 border border-amber-500/30 text-[#d4af37] text-[10px] font-bold rounded-full uppercase">
                          {plan.mealType}
                        </span>
                        <span className="px-2.5 py-0.5 bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 text-[10px] font-bold rounded-full">
                          {plan.durationDays} Days
                        </span>
                      </div>
                      <h3 className="text-base font-bold text-white mt-2" data-testid="plan-title">{plan.planName}</h3>
                      <p className="text-xs text-slate-400">{plan.description}</p>
                    </div>

                    <span className={`px-2.5 py-0.5 border text-[10px] font-bold rounded-full ${
                      plan.isActive ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' : 'bg-slate-800 text-slate-500 border-slate-700'
                    }`}>
                      {plan.isActive ? 'ACTIVE' : 'INACTIVE'}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs bg-slate-950/60 p-3 rounded-2xl border border-slate-800/80">
                    <div>
                      <p className="text-[10px] text-slate-400 uppercase font-bold">Price / Meal</p>
                      <p className="font-bold text-[#d4af37]">₹{plan.pricePerMeal}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-slate-400 uppercase font-bold">Cutoff Time</p>
                      <p className="font-medium text-white">{plan.cutoffTime || '09:00'}</p>
                    </div>
                  </div>

                  {plan.items && plan.items.length > 0 && (
                    <div className="space-y-1">
                      <p className="text-[10px] text-slate-400 uppercase font-bold">Included Daily Menu:</p>
                      <div className="flex flex-wrap gap-1">
                        {plan.items.map((it, idx) => (
                          <span key={idx} className="px-2 py-0.5 bg-slate-800 text-slate-300 text-[11px] rounded border border-slate-700">
                            {it.quantity}x {it.name}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between border-t border-slate-800 pt-3">
                  <button
                    onClick={() => handleToggleStatus(plan._id, plan.isActive)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold border cursor-pointer flex items-center gap-1 ${
                      plan.isActive
                        ? 'bg-amber-500/10 text-[#d4af37] border-amber-500/30 hover:bg-amber-500/20'
                        : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/20'
                    }`}
                    data-testid={`toggle-status-btn-${plan._id}`}
                  >
                    <Power size={12} />
                    {plan.isActive ? 'Deactivate' : 'Activate'}
                  </button>

                  <button
                    onClick={() => openEditModal(plan)}
                    className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white text-xs font-bold rounded-xl cursor-pointer flex items-center gap-1"
                    data-testid={`edit-plan-btn-${plan._id}`}
                  >
                    <Edit2 size={12} /> Edit Plan
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Create / Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-lg w-full space-y-4 shadow-2xl my-8">
            <h2 className="text-lg font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-3">
              <Calendar size={18} className="text-[#d4af37]" />
              {editingPlan ? 'Edit Tiffin Plan' : 'Create New Tiffin Plan'}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="text-slate-300 font-bold">Plan Name *</label>
                <input
                  type="text"
                  required
                  value={planName}
                  onChange={(e) => setPlanName(e.target.value)}
                  placeholder="e.g. Executive Lunch Thali"
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-[#d4af37]"
                  data-testid="plan-name-input"
                />
              </div>

              <div className="space-y-1">
                <label className="text-slate-300 font-bold">Description</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Fresh home style meals delivered daily..."
                  className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-[#d4af37] h-20"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-slate-300 font-bold">Meal Type</label>
                  <select
                    value={mealType}
                    onChange={(e) => setMealType(e.target.value)}
                    className="w-full px-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-[#d4af37]"
                  >
                    <option value="LUNCH">LUNCH</option>
                    <option value="DINNER">DINNER</option>
                    <option value="BOTH">BOTH</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-slate-300 font-bold">Duration (Days)</label>
                  <input
                    type="number"
                    min="1"
                    value={durationDays}
                    onChange={(e) => setDurationDays(e.target.value)}
                    className="w-full px-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-[#d4af37]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-slate-300 font-bold">Price Per Meal (₹) *</label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={pricePerMeal}
                    onChange={(e) => setPricePerMeal(e.target.value)}
                    className="w-full px-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-[#d4af37]"
                    data-testid="price-input"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-slate-300 font-bold">Discount %</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={discountPercentage}
                    onChange={(e) => setDiscountPercentage(e.target.value)}
                    className="w-full px-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-[#d4af37]"
                  />
                </div>
              </div>

              {/* Items List */}
              <div className="space-y-2 border-t border-slate-800 pt-3">
                <div className="flex items-center justify-between">
                  <label className="text-slate-300 font-bold">Included Daily Menu Items</label>
                  <button
                    type="button"
                    onClick={handleAddItem}
                    className="text-[11px] text-[#d4af37] font-bold hover:underline flex items-center gap-1"
                  >
                    <Plus size={12} /> Add Item
                  </button>
                </div>

                {items.map((item, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <input
                      type="text"
                      placeholder="Item name"
                      value={item.name}
                      onChange={(e) => handleItemChange(idx, 'name', e.target.value)}
                      className="flex-1 px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-[#d4af37]"
                    />
                    <input
                      type="number"
                      min="1"
                      placeholder="Qty"
                      value={item.quantity}
                      onChange={(e) => handleItemChange(idx, 'quantity', e.target.value)}
                      className="w-16 px-2 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white text-center focus:outline-none focus:border-[#d4af37]"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveItem(idx)}
                      className="text-red-400 hover:text-red-300 p-1"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
              </div>

              {/* Action buttons */}
              <div className="flex items-center justify-end gap-3 border-t border-slate-800 pt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 font-bold rounded-xl hover:bg-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 bg-[#d4af37] text-slate-950 font-black rounded-xl hover:brightness-110 cursor-pointer"
                  data-testid="save-plan-btn"
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
