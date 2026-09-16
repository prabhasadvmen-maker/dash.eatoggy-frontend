import React, { useState, useEffect, useRef } from 'react';
import { 
  Settings, Loader2, Plus, RefreshCw, X, ToggleLeft, ToggleRight, Edit2, LayoutList, Trash2
} from 'lucide-react';
import {
  getSubcategories,
  createSubcategory,
  updateSubcategory,
  toggleSubcategoryStatus,
  getCategories,
  deleteSubcategory
} from '../../services/superadmin/superAdminMenuService';
import ConfirmModal from '../../components/common/ConfirmModal/ConfirmModal';

const Subcategories = () => {
  const [subcategories, setSubcategories] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Filters
  const [activeTab, setActiveTab] = useState('ALL');
  const [filterCategoryId, setFilterCategoryId] = useState('');
  const [activeDropdownId, setActiveDropdownId] = useState(null);
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('ADD'); // 'ADD' or 'EDIT'
  const [selectedSubcategory, setSelectedSubcategory] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  // Confirm Modal State
  const [confirmModal, setConfirmModal] = useState({
    open: false,
    id: null
  });

  // Form State
  const [formData, setFormData] = useState({
    categoryId: '',
    name: '',
    description: '',
    sortOrder: 0,
    isActive: true
  });

  const dropdownRef = useRef(null);

  useEffect(() => {
    fetchData();
    fetchCategories();
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setActiveDropdownId(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchData = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await getSubcategories();
      if (res.ok && res.data?.data) {
        setSubcategories(res.data.data);
      } else {
        setError(res.data?.message || 'Failed to fetch subcategories');
      }
    } catch (err) {
      setError('Network error connecting to server');
    }
    setLoading(false);
  };

  const fetchCategories = async () => {
    try {
      // Only active categories for the dropdown in form
      const res = await getCategories('true');
      if (res.ok && res.data?.data) {
        setCategories(res.data.data);
      }
    } catch (err) {
      console.error('Failed to fetch categories for dropdown');
    }
  };

  const handleToggleEnable = async (id, currentStatus) => {
    setActionLoading(true);
    try {
      const res = await toggleSubcategoryStatus(id, !currentStatus);
      if (res.ok && res.data?.data) {
        setSubcategories(subcategories.map(s => s._id === id ? res.data.data : s));
        setActiveDropdownId(null);
      } else {
        alert(res.data?.message || 'Failed to update status');
      }
    } catch (err) {
      console.error(err);
      alert('Network error while updating status');
    }
    setActionLoading(false);
  };

  const confirmDelete = (id) => {
    setConfirmModal({ open: true, id });
    setActiveDropdownId(null);
  };

  const handleDelete = async () => {
    const id = confirmModal.id;
    if (!id) return;
    setActionLoading(true);
    try {
      const res = await deleteSubcategory(id);
      if (res.ok) {
        setSubcategories(subcategories.filter(s => s._id !== id));
        setActiveDropdownId(null);
      } else {
        alert(res.data?.message || 'Failed to delete subcategory');
      }
    } catch (err) {
      console.error(err);
      alert('Network error while deleting subcategory');
    }
    setActionLoading(false);
    setConfirmModal({ open: false, id: null });
  };

  const openAddModal = () => {
    setModalMode('ADD');
    setSelectedSubcategory(null);
    setFormData({ categoryId: '', name: '', description: '', sortOrder: 0, isActive: true });
    setIsModalOpen(true);
    setActiveDropdownId(null);
  };

  const openEditModal = (subcategory) => {
    setModalMode('EDIT');
    setSelectedSubcategory(subcategory);
    setFormData({ 
      categoryId: subcategory.categoryId?._id || '',
      name: subcategory.name, 
      description: subcategory.description || '', 
      sortOrder: subcategory.sortOrder || 0,
      isActive: subcategory.isActive
    });
    setIsModalOpen(true);
    setActiveDropdownId(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) return alert('Name is required');
    if (!formData.categoryId) return alert('Category selection is required');
    
    setActionLoading(true);
    try {
      let res;
      if (modalMode === 'ADD') {
        res = await createSubcategory(formData);
      } else {
        res = await updateSubcategory(selectedSubcategory._id, formData);
      }

      if (res.ok && res.data?.data) {
        setIsModalOpen(false);
        fetchData(); // Refresh list to get populated parent category
      } else {
        alert(res.data?.message || `Failed to ${modalMode.toLowerCase()} subcategory`);
      }
    } catch (err) {
      console.error(err);
      alert(`Network error while saving subcategory`);
    }
    setActionLoading(false);
  };

  const toggleDropdown = (id, e) => {
    e.stopPropagation();
    setActiveDropdownId(prev => prev === id ? null : id);
  };

  const filteredSubcategories = subcategories.filter(s => {
    let matchTab = true;
    if (activeTab === 'ACTIVE') matchTab = s.isActive;
    if (activeTab === 'INACTIVE') matchTab = !s.isActive;
    
    let matchCategory = true;
    if (filterCategoryId) matchCategory = s.categoryId?._id === filterCategoryId;
    
    return matchTab && matchCategory;
  });

  const getStatusBadge = (isActive) => {
    return isActive ? (
      <span className="px-2.5 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full text-xs font-semibold">Active</span>
    ) : (
      <span className="px-2.5 py-1 bg-red-50 text-red-700 border border-red-200 rounded-full text-xs font-semibold">Inactive</span>
    );
  };

  // Get unique categories for the table filter dropdown
  const filterCategories = Array.from(new Set(subcategories.map(s => s.categoryId?._id))).map(id => {
    const sub = subcategories.find(s => s.categoryId?._id === id);
    return sub ? sub.categoryId : null;
  }).filter(Boolean);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Subcategories</h1>
          <p className="text-gray-500 text-sm mt-1">Manage platform master subcategories linked to categories</p>
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={openAddModal}
            className="inline-flex items-center gap-2 px-4 py-2 bg-[#d4af37] text-white hover:bg-[#b5952f] rounded-xl text-sm font-medium shadow-sm transition-all cursor-pointer"
          >
            <Plus size={16} /> Add Subcategory
          </button>
          <button 
            onClick={fetchData}
            className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 hover:border-gray-300 text-gray-700 rounded-xl text-sm font-medium shadow-sm transition-all cursor-pointer"
          >
            <RefreshCw size={16} className={loading ? "animate-spin" : ""} /> Refresh
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl text-sm">
          {error}
        </div>
      )}

      {/* Tabs & Filters */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-200 pb-1">
        <div className="flex items-center gap-2 overflow-x-auto">
          <button
            onClick={() => setActiveTab('ALL')}
            className={`px-4 py-2 text-sm font-medium border-b-2 whitespace-nowrap transition-colors cursor-pointer ${
              activeTab === 'ALL'
                ? 'border-[#d4af37] text-gray-900 font-bold'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            All
          </button>
          <button
            onClick={() => setActiveTab('ACTIVE')}
            className={`px-4 py-2 text-sm font-medium border-b-2 whitespace-nowrap transition-colors cursor-pointer ${
              activeTab === 'ACTIVE'
                ? 'border-emerald-500 text-emerald-600 font-bold'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Active
          </button>
          <button
            onClick={() => setActiveTab('INACTIVE')}
            className={`px-4 py-2 text-sm font-medium border-b-2 whitespace-nowrap transition-colors cursor-pointer ${
              activeTab === 'INACTIVE'
                ? 'border-red-500 text-red-600 font-bold'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Inactive
          </button>
        </div>

        <div>
          <select 
            value={filterCategoryId}
            onChange={(e) => setFilterCategoryId(e.target.value)}
            className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#d4af37] bg-white cursor-pointer"
          >
            <option value="">All Categories</option>
            {filterCategories.map(cat => (
              <option key={cat._id} value={cat._id}>{cat.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Table Container */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="flex flex-col items-center justify-center p-12 text-gray-400">
            <Loader2 className="animate-spin text-[#d4af37] mb-2" size={36} />
            <p className="text-sm">Loading subcategories...</p>
          </div>
        ) : filteredSubcategories.length === 0 ? (
          <div className="p-12 text-center text-gray-500">
            <LayoutList className="mx-auto text-gray-300 mb-3" size={48} />
            <p className="font-semibold text-gray-700">No subcategories found</p>
            <p className="text-sm text-gray-400 mt-1">Click "Add Subcategory" to create a new one.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-gray-600">
              <thead className="bg-gray-50 text-gray-700 font-semibold border-b border-gray-100">
                <tr>
                  <th className="px-6 py-4">Sort</th>
                  <th className="px-6 py-4">Subcategory Name</th>
                  <th className="px-6 py-4">Parent Category</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Updated At</th>
                  <th className="px-6 py-4 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredSubcategories.map(subcategory => (
                  <tr key={subcategory._id} className="hover:bg-gray-50/80 transition-colors">
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center justify-center w-6 h-6 rounded-md bg-gray-100 text-gray-600 font-mono text-xs">
                        {subcategory.sortOrder}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-bold text-gray-900">{subcategory.name}</div>
                      {subcategory.description && (
                        <div className="text-xs text-gray-500 mt-0.5 max-w-xs truncate">{subcategory.description}</div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {subcategory.categoryId ? (
                        <span className="inline-flex items-center px-2 py-1 bg-blue-50 text-blue-700 rounded font-medium text-xs border border-blue-100">
                          {subcategory.categoryId.name}
                        </span>
                      ) : (
                        <span className="text-gray-400 italic">Unknown</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {getStatusBadge(subcategory.isActive)}
                    </td>
                    <td className="px-6 py-4 text-xs text-gray-500">
                      {new Date(subcategory.updatedAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-center relative">
                      <div className="inline-block text-left" ref={activeDropdownId === subcategory._id ? dropdownRef : null}>
                        <button
                          onClick={(e) => toggleDropdown(subcategory._id, e)}
                          className="p-2 text-gray-600 hover:text-[#d4af37] hover:bg-gray-100 rounded-lg transition-colors border border-transparent hover:border-gray-200 cursor-pointer"
                        >
                          <Settings size={20} />
                        </button>

                        {/* Dropdown Menu */}
                        {activeDropdownId === subcategory._id && (
                          <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-100 py-1.5 z-30 animate-fadeIn">
                            <button
                              onClick={() => openEditModal(subcategory)}
                              className="w-full text-left px-4 py-2 text-xs font-medium text-gray-700 hover:bg-blue-50 hover:text-blue-600 flex items-center gap-2 transition-colors cursor-pointer"
                            >
                              <Edit2 size={16} className="text-blue-500" /> Edit Subcategory
                            </button>
                            <button
                              onClick={() => handleToggleEnable(subcategory._id, subcategory.isActive)}
                              className={`w-full text-left px-4 py-2 text-xs font-medium flex items-center gap-2 transition-colors cursor-pointer ${
                                subcategory.isActive
                                  ? 'text-red-600 hover:bg-red-50'
                                  : 'text-emerald-600 hover:bg-emerald-50'
                              }`}
                            >
                              {subcategory.isActive ? (
                                <>
                                  <ToggleLeft size={16} className="text-red-500" /> Deactivate
                                </>
                              ) : (
                                <>
                                  <ToggleRight size={16} className="text-emerald-500" /> Activate
                                </>
                              )}
                            </button>
                            <button
                              onClick={() => confirmDelete(subcategory._id)}
                              className="w-full text-left px-4 py-2 text-xs font-medium text-red-600 hover:bg-red-50 flex items-center gap-2 transition-colors cursor-pointer"
                            >
                              <Trash2 size={16} className="text-red-500" /> Delete
                            </button>
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md flex flex-col overflow-hidden animate-fadeIn">
            <div className="p-4 border-b flex justify-between items-center bg-gray-50">
              <h2 className="text-lg font-bold text-gray-900">
                {modalMode === 'ADD' ? 'Add Subcategory' : 'Edit Subcategory'}
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="p-6 space-y-4 text-sm">
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Parent Category <span className="text-red-500">*</span></label>
                  <select
                    required
                    value={formData.categoryId}
                    onChange={(e) => setFormData({...formData, categoryId: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#d4af37] focus:border-transparent outline-none bg-white"
                  >
                    <option value="" disabled>Select a category</option>
                    {categories.map(cat => (
                      <option key={cat._id} value={cat._id}>{cat.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Name <span className="text-red-500">*</span></label>
                  <input 
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    placeholder="e.g. Thali"
                    className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#d4af37] focus:border-transparent outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Description</label>
                  <textarea 
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    placeholder="Optional description"
                    rows="3"
                    className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#d4af37] focus:border-transparent outline-none resize-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Sort Order</label>
                  <input 
                    type="number"
                    value={formData.sortOrder}
                    onChange={(e) => setFormData({...formData, sortOrder: Number(e.target.value)})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#d4af37] focus:border-transparent outline-none"
                  />
                </div>
                {modalMode === 'ADD' && (
                  <div className="flex items-center gap-2 mt-2">
                    <input 
                      type="checkbox" 
                      id="isActive"
                      checked={formData.isActive}
                      onChange={(e) => setFormData({...formData, isActive: e.target.checked})}
                      className="w-4 h-4 text-[#d4af37] rounded focus:ring-[#d4af37]"
                    />
                    <label htmlFor="isActive" className="text-gray-700 font-medium cursor-pointer">Active</label>
                  </div>
                )}
              </div>
              <div className="p-4 border-t bg-gray-50 flex justify-end gap-2">
                <button 
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-100 font-medium"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  disabled={actionLoading}
                  className="px-4 py-2 bg-[#d4af37] text-white rounded-xl hover:bg-[#b5952f] font-medium disabled:opacity-50"
                >
                  {actionLoading ? 'Saving...' : 'Save Subcategory'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirm Delete Modal */}
      <ConfirmModal
        open={confirmModal.open}
        title="Delete Subcategory"
        message="Are you sure you want to delete this subcategory? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        variant="danger"
        loading={actionLoading}
        onConfirm={handleDelete}
        onCancel={() => setConfirmModal({ open: false, id: null })}
      />

    </div>
  );
};

export default Subcategories;
