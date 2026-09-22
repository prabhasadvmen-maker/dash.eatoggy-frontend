import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  Settings, Plus, RefreshCw, X, ToggleLeft, ToggleRight, Edit2, Trash2
} from 'lucide-react';
import {
  getSubcategories,
  createSubcategory,
  updateSubcategory,
  toggleSubcategoryStatus,
  deleteSubcategory,
  getCategories
} from '../../services/superadmin/superAdminMenuService';
import ConfirmModal from '../../components/common/ConfirmModal/ConfirmModal';
import DataTable from '../../components/common/Table/DataTable';
import { useDataTableSync } from '../../hooks/useDataTableSync';

const Subcategories = () => {
  const {
    page, setPage,
    limit, setLimit,
    search, setSearch,
    sortBy, sortOrder, setSort,
    filters, setFilters,
    handleClearFilters
  } = useDataTableSync({
    defaultSortBy: 'sortOrder',
    defaultSortOrder: 'asc'
  });

  const [subcategories, setSubcategories] = useState([]);
  const [categories, setCategories] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [activeDropdownId, setActiveDropdownId] = useState(null);
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('ADD');
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

  const fetchCategoriesList = useCallback(async () => {
    try {
      const res = await getCategories({ isActive: 'true', limit: 1000 });
      if (res.ok && res.data?.data) {
        setCategories(res.data.data);
      }
    } catch (err) {
      console.error('Failed to fetch categories for dropdown');
    }
  }, []);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await getSubcategories({
        page,
        limit,
        search,
        sortBy,
        sortOrder,
        ...filters
      });
      if (res.ok && res.data) {
        setSubcategories(res.data.data || []);
        if (res.data.meta && res.data.meta.pagination) {
          setTotal(res.data.meta.pagination.total);
        } else {
          setTotal(res.data.data?.length || 0);
        }
      } else {
        setError(res.data?.message || 'Failed to fetch subcategories');
      }
    } catch (err) {
      setError('Network error connecting to server');
    }
    setLoading(false);
  }, [page, limit, search, sortBy, sortOrder, filters]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    fetchCategoriesList();
  }, [fetchCategoriesList]);

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

  const handleToggleEnable = async (id, currentStatus) => {
    setActionLoading(true);
    try {
      const res = await toggleSubcategoryStatus(id, !currentStatus);
      if (res.ok && res.data?.data) {
        fetchData();
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
        fetchData();
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
        fetchData();
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

  const getStatusBadge = (isActive) => {
    return isActive ? (
      <span className="px-2.5 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full text-xs font-semibold">Active</span>
    ) : (
      <span className="px-2.5 py-1 bg-red-50 text-red-700 border border-red-200 rounded-full text-xs font-semibold">Inactive</span>
    );
  };

  const columns = [
    {
      key: 'sortOrder',
      label: 'Sort',
      sortable: true,
      width: '100px',
      render: (row) => (
        <span className="inline-flex items-center justify-center w-6 h-6 rounded-md bg-slate-100 text-slate-600 font-mono text-xs">
          {row.sortOrder}
        </span>
      )
    },
    {
      key: 'name',
      label: 'Name',
      sortable: true,
      render: (row) => (
        <div>
          <div className="font-bold text-slate-900">{row.name}</div>
          {row.description && (
            <div className="text-xs text-slate-500 mt-0.5 max-w-xs truncate">{row.description}</div>
          )}
        </div>
      )
    },
    {
      key: 'categoryId',
      label: 'Parent Category',
      sortable: false, // can't easily sort by nested field without agg, keep it unsortable for now
      render: (row) => (
        row.categoryId ? (
          <span className="inline-flex items-center px-2 py-1 bg-blue-50 text-blue-700 rounded font-medium text-xs border border-blue-100">
            {row.categoryId.name}
          </span>
        ) : (
          <span className="text-slate-400 italic">Unknown</span>
        )
      )
    },
    {
      key: 'isActive',
      label: 'Status',
      sortable: true,
      width: '120px',
      render: (row) => getStatusBadge(row.isActive)
    },
    {
      key: 'updatedAt',
      label: 'Updated At',
      sortable: true,
      render: (row) => new Date(row.updatedAt).toLocaleDateString()
    },
    {
      key: 'actions',
      label: 'Action',
      align: 'right',
      width: '100px',
      render: (row) => (
        <div className="inline-block text-left relative" ref={activeDropdownId === row._id ? dropdownRef : null}>
          <button
            onClick={(e) => toggleDropdown(row._id, e)}
            className="p-2 text-slate-500 hover:text-[#d4af37] hover:bg-slate-100 rounded-lg transition-colors cursor-pointer border border-transparent"
          >
            <Settings size={18} />
          </button>

          {activeDropdownId === row._id && (
            <div className="absolute right-0 mt-1 w-48 bg-white rounded-xl shadow-lg border border-slate-100 py-1.5 z-30 animate-fadeIn text-left">
              <button
                onClick={() => openEditModal(row)}
                className="w-full text-left px-4 py-2 text-sm font-medium text-slate-700 hover:bg-blue-50 hover:text-blue-600 flex items-center gap-2 cursor-pointer transition-colors"
              >
                <Edit2 size={16} className="text-blue-500" /> Edit Subcategory
              </button>
              <button
                onClick={() => handleToggleEnable(row._id, row.isActive)}
                className={`w-full text-left px-4 py-2 text-sm font-medium flex items-center gap-2 cursor-pointer transition-colors ${
                  row.isActive
                    ? 'text-red-600 hover:bg-red-50'
                    : 'text-emerald-600 hover:bg-emerald-50'
                }`}
              >
                {row.isActive ? (
                  <><ToggleLeft size={16} className="text-red-500" /> Deactivate</>
                ) : (
                  <><ToggleRight size={16} className="text-emerald-500" /> Activate</>
                )}
              </button>
              <button
                onClick={() => confirmDelete(row._id)}
                className="w-full text-left px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 flex items-center gap-2 cursor-pointer transition-colors"
              >
                <Trash2 size={16} className="text-red-500" /> Delete
              </button>
            </div>
          )}
        </div>
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
    },
    {
      key: 'categoryId',
      label: 'Category',
      type: 'select',
      options: categories.map(cat => ({ label: cat.name, value: cat._id }))
    }
  ];

  const tableActions = (
    <>
      <button 
        onClick={openAddModal}
        className="inline-flex items-center justify-center gap-2 px-4 bg-[#d4af37] text-white hover:bg-[#b5952f] rounded-xl text-sm font-medium shadow-sm transition-all cursor-pointer h-9 whitespace-nowrap"
      >
        <Plus size={16} /> Add Subcategory
      </button>
      <button 
        onClick={fetchData}
        className="inline-flex items-center justify-center gap-2 px-4 bg-white border border-slate-200 hover:border-slate-300 text-slate-700 rounded-xl text-sm font-medium shadow-sm transition-all cursor-pointer h-9"
      >
        <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
      </button>
    </>
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Subcategories</h1>
          <p className="text-slate-500 text-sm mt-1">Manage platform master subcategories linked to categories</p>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl text-sm">
          {error}
        </div>
      )}

      <DataTable
        columns={columns}
        data={subcategories}
        loading={loading}
        emptyMessage="No subcategories found matching your criteria."
        
        search={{ value: search, placeholder: 'Search subcategories...' }}
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
        
        actions={tableActions}
      />

      {/* Add/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md flex flex-col overflow-hidden animate-fadeIn">
            <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h2 className="text-lg font-bold text-slate-900">
                {modalMode === 'ADD' ? 'Add Subcategory' : 'Edit Subcategory'}
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 p-1 rounded hover:bg-slate-200 cursor-pointer transition-colors">
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="p-6 space-y-4 text-sm">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Parent Category <span className="text-red-500">*</span></label>
                  <select
                    required
                    value={formData.categoryId}
                    onChange={(e) => setFormData({...formData, categoryId: e.target.value})}
                    className="w-full px-4 py-2 bg-white border border-slate-200 rounded-xl focus:ring-1 focus:ring-[#d4af37] focus:border-[#d4af37] outline-none cursor-pointer"
                  >
                    <option value="" disabled>Select a category</option>
                    {categories.map(cat => (
                      <option key={cat._id} value={cat._id}>{cat.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Name <span className="text-red-500">*</span></label>
                  <input 
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    placeholder="e.g. Thali"
                    className="w-full px-4 py-2 bg-white border border-slate-200 rounded-xl focus:ring-1 focus:ring-[#d4af37] focus:border-[#d4af37] outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Description</label>
                  <textarea 
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    placeholder="Optional description"
                    rows="3"
                    className="w-full px-4 py-2 bg-white border border-slate-200 rounded-xl focus:ring-1 focus:ring-[#d4af37] focus:border-[#d4af37] outline-none transition-all resize-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Sort Order</label>
                  <input 
                    type="number"
                    value={formData.sortOrder}
                    onChange={(e) => setFormData({...formData, sortOrder: Number(e.target.value)})}
                    className="w-full px-4 py-2 bg-white border border-slate-200 rounded-xl focus:ring-1 focus:ring-[#d4af37] focus:border-[#d4af37] outline-none transition-all"
                  />
                </div>
                {modalMode === 'ADD' && (
                  <div className="flex items-center gap-2 mt-2">
                    <input 
                      type="checkbox" 
                      id="isActive"
                      checked={formData.isActive}
                      onChange={(e) => setFormData({...formData, isActive: e.target.checked})}
                      className="w-4 h-4 text-[#d4af37] rounded focus:ring-[#d4af37] cursor-pointer"
                    />
                    <label htmlFor="isActive" className="text-slate-700 font-medium cursor-pointer">Active</label>
                  </div>
                )}
              </div>
              <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-end gap-2">
                <button 
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-slate-300 text-slate-700 rounded-xl hover:bg-slate-100 font-medium cursor-pointer transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  disabled={actionLoading}
                  className="px-4 py-2 bg-[#d4af37] text-white rounded-xl hover:bg-[#b5952f] font-medium disabled:opacity-50 cursor-pointer transition-colors"
                >
                  {actionLoading ? 'Saving...' : 'Save Subcategory'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

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
