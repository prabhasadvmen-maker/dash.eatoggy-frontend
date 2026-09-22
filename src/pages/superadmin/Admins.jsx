import React, { useState, useEffect, useCallback } from 'react';
import { Trash2, ShieldAlert, Eye, Edit, UserPlus, LogIn, ToggleRight, ToggleLeft } from 'lucide-react';
import API_BASE_URL from '../../services/apiService';
import ConfirmModal from '../../components/common/ConfirmModal/ConfirmModal';
import DataTable from '../../components/common/Table/DataTable';
import { useDataTableSync } from '../../hooks/useDataTableSync';

const Admins = () => {
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

  const [admins, setAdmins] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [modalState, setModalState] = useState({ isOpen: false, type: 'add', adminId: null });
  const [submitError, setSubmitError] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'Admin'
  });
  
  // Confirm Modal State
  const [confirmModal, setConfirmModal] = useState({
    open: false,
    id: null
  });

  const currentUser = JSON.parse(localStorage.getItem('superadmin_user') || '{}');

  const fetchAdmins = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      
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

      const response = await fetch(`${API_BASE_URL}/api/admins?${queryParams.toString()}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('superadmin_token')}`
        }
      });
      
      if (response.ok) {
        const result = await response.json();
        
        let fetchedData = [];
        let fetchedTotal = 0;

        if (result.data) {
           fetchedData = result.data;
           if (result.meta && result.meta.pagination) {
             fetchedTotal = result.meta.pagination.total;
           } else {
             fetchedTotal = fetchedData.length;
           }
        } else if (Array.isArray(result)) {
           // fallback just in case backend didn't update properly
           fetchedData = result;
           fetchedTotal = result.length;
        }

        // We could filter currentUser out on frontend, but for total count accuracy, 
        // it's better if it's done via backend. Assuming it's fine for now, we'll mark the user row as disabled.
        
        setAdmins(fetchedData);
        setTotal(fetchedTotal);
      } else if (response.status === 401) {
        localStorage.removeItem('superadmin_token');
        localStorage.removeItem('superadmin_user');
        window.location.href = '/superadmin/login';
      } else {
        setError('Failed to fetch admins');
      }
    } catch (err) {
      setError('Network error while fetching admins');
    } finally {
      setLoading(false);
    }
  }, [page, limit, search, sortBy, sortOrder, filters]);

  useEffect(() => {
    fetchAdmins();
  }, [fetchAdmins]);

  const openModal = (type, admin = null) => {
    if (admin) {
      setFormData({
        name: admin.name || '',
        email: admin.email || '',
        role: admin.role || 'Admin',
        password: '' // Don't populate password for security
      });
    } else {
      setFormData({ name: '', email: '', password: '', role: 'Admin' });
    }
    setSubmitError('');
    setModalState({ isOpen: true, type, adminId: admin ? admin._id : null });
  };

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError('');

    try {
      const isEdit = modalState.type === 'edit';
      const url = isEdit 
        ? `${API_BASE_URL}/api/admins/${modalState.adminId}` 
        : `${API_BASE_URL}/api/admins`;
      
      const payload = { ...formData };
      // If editing and password is empty, don't send it so we don't overwrite
      if (isEdit && !payload.password) {
        delete payload.password;
      }

      const response = await fetch(url, {
        method: isEdit ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('superadmin_token')}`
        },
        body: JSON.stringify(payload)
      });

      const data = await response.json();

      if (response.ok) {
        setModalState({ isOpen: false, type: 'add', adminId: null });
        fetchAdmins();
      } else {
        setSubmitError(data.message || `Failed to ${isEdit ? 'update' : 'create'} admin`);
      }
    } catch (err) {
      setSubmitError(`Network error while ${modalState.type === 'edit' ? 'updating' : 'creating'} admin`);
    }
  };

  const confirmDelete = (id) => {
    if (id === currentUser.id) {
      alert("You cannot delete your own account.");
      return;
    }
    setConfirmModal({ open: true, id });
  };

  const handleDelete = async () => {
    const id = confirmModal.id;
    if (!id) return;

    try {
      const response = await fetch(`${API_BASE_URL}/api/admins/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('superadmin_token')}`
        }
      });

      if (response.ok) {
        setConfirmModal({ open: false, id: null });
        fetchAdmins();
      } else {
        alert('Failed to delete admin');
      }
    } catch (err) {
      alert('Network error while deleting admin');
    }
  };

  const handleToggleStatus = async (id, currentStatus) => {
    if (id === currentUser.id) {
      alert("You cannot deactivate your own account.");
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/admins/${id}/toggle-status`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('superadmin_token')}`
        }
      });

      if (response.ok) {
        fetchAdmins();
      } else {
        alert('Failed to update status');
      }
    } catch (err) {
      alert('Network error while updating status');
    }
  };

  const handleImpersonate = async (adminId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/impersonate/${adminId}`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('superadmin_token')}` }
      });
      const data = await response.json();
      if (response.ok) {
        localStorage.setItem('admin_token', data.token);
        localStorage.setItem('admin_user', JSON.stringify(data.user));
        window.open('/admin', '_blank');
      } else {
        alert(data.message || 'Failed to login as admin');
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
      key: 'name',
      label: 'Name',
      sortable: true,
      render: (row) => (
        <span className="font-bold text-slate-800">
          {row.name || 'N/A'} {row._id === currentUser.id ? '(You)' : ''}
        </span>
      )
    },
    {
      key: 'email',
      label: 'Email',
      sortable: true,
      render: (row) => (
        <span className="text-xs font-medium text-slate-600">
          {row.email}
        </span>
      )
    },
    {
      key: 'role',
      label: 'Role',
      sortable: true,
      render: (row) => (
        <span className="text-xs font-semibold text-slate-600">
          {row.role}
        </span>
      )
    },
    {
      key: 'isActive',
      label: 'Status',
      sortable: true,
      render: (row) => (
        <button
          onClick={() => handleToggleStatus(row._id, row.isActive !== false)}
          disabled={row._id === currentUser.id}
          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold transition-colors cursor-pointer ${
            row.isActive !== false 
              ? 'bg-[#d4af37]/20 text-[#a58523] hover:bg-[#d4af37]/30' 
              : 'bg-red-100 text-red-700 hover:bg-red-200'
          } ${row._id === currentUser.id ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          {row.isActive !== false ? <ToggleRight size={14} /> : <ToggleLeft size={14} />}
          {row.isActive !== false ? 'Active' : 'Inactive'}
        </button>
      )
    },
    {
      key: 'lastLogin',
      label: 'Last Login',
      sortable: true,
      render: (row) => (
        <span className="text-xs font-medium text-slate-500 whitespace-nowrap">
          {formatDate(row.lastLogin)}
        </span>
      )
    },
    {
      key: 'actions',
      label: 'Actions',
      align: 'right',
      render: (row) => (
        <div className="flex items-center justify-end space-x-2">
          <button
            className="inline-flex items-center gap-1.5 bg-[#1e1e2e] text-[#d4af37] px-2 py-1 rounded-lg text-[10px] font-bold hover:bg-black transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            onClick={() => handleImpersonate(row._id)}
            disabled={row._id === currentUser.id}
            title="Login As"
          >
            <LogIn size={12} /> Login
          </button>
          
          <button
            onClick={() => openModal('view', row)}
            className="p-1.5 text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer transition-colors"
            title="View"
          >
            <Eye size={16} />
          </button>
          
          <button
            onClick={() => openModal('edit', row)}
            className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg cursor-pointer transition-colors"
            title="Edit"
          >
            <Edit size={16} />
          </button>
          
          <button
            onClick={() => confirmDelete(row._id)}
            disabled={row._id === currentUser.id}
            className={`p-1.5 rounded-lg cursor-pointer transition-colors ${
              row._id === currentUser.id ? 'text-gray-300' : 'text-red-600 hover:bg-red-50'
            }`}
            title={row._id === currentUser.id ? "Cannot delete yourself" : "Delete"}
          >
            <Trash2 size={16} />
          </button>
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
      key: 'role',
      label: 'Role',
      type: 'select',
      options: [
        { label: 'SuperAdmin', value: 'SuperAdmin' },
        { label: 'Admin', value: 'Admin' },
        { label: 'Manager', value: 'Manager' },
        { label: 'Support', value: 'Support' }
      ]
    }
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">Admins</h1>
          <p className="text-slate-400 mt-1">{total} admin{total !== 1 ? 's' : ''} registered</p>
        </div>
        <button
          onClick={() => openModal('add')}
          className="inline-flex items-center gap-2 bg-[#1e1e2e] text-[#d4af37] px-5 py-2.5 rounded-xl hover:bg-black transition-colors font-medium shadow-sm cursor-pointer"
        >
          <UserPlus size={18} />
          Add Admin
        </button>
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-xl flex items-center gap-3">
          <ShieldAlert size={20} />
          {error}
        </div>
      )}

      {/* Table Section */}
      <DataTable
        columns={columns}
        data={admins}
        loading={loading}
        emptyMessage="No admins found matching your criteria."
        
        search={{ value: search, placeholder: 'Search by name or email...' }}
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

      {/* Dynamic Modal (Add / Edit / View) */}
      {modalState.isOpen && (
        <div className="fixed inset-0 bg-gray-900/50 flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">
                {modalState.type === 'add' ? 'Add New Admin' : modalState.type === 'edit' ? 'Edit Admin' : 'Admin Details'}
              </h2>
              <button 
                onClick={() => setModalState({ isOpen: false, type: 'add', adminId: null })} 
                className="text-gray-400 hover:text-gray-600 p-2 text-2xl leading-none cursor-pointer"
              >
                &times;
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {submitError && (
                <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm font-semibold">
                  {submitError}
                </div>
              )}
              
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Full Name</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  disabled={modalState.type === 'view'}
                  className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#d4af37] outline-none transition-all disabled:opacity-70 disabled:bg-gray-50 text-xs"
                  placeholder="John Doe"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Email Address</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  disabled={modalState.type === 'view'}
                  className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#d4af37] outline-none transition-all disabled:opacity-70 disabled:bg-gray-50 text-xs"
                  placeholder="john@eatoggy.com"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Role</label>
                <select
                  name="role"
                  value={formData.role}
                  onChange={handleInputChange}
                  disabled={modalState.type === 'view'}
                  className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#d4af37] outline-none transition-all disabled:opacity-70 disabled:bg-gray-50 text-xs"
                >
                  <option value="SuperAdmin">SuperAdmin</option>
                  <option value="Admin">Admin</option>
                  <option value="Manager">Manager</option>
                  <option value="Support">Support</option>
                </select>
              </div>

              {modalState.type !== 'view' && (
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    {modalState.type === 'edit' ? 'New Password (leave blank to keep current)' : 'Password'}
                  </label>
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    required={modalState.type === 'add'}
                    minLength="6"
                    className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#d4af37] outline-none transition-all text-xs"
                    placeholder="••••••••"
                  />
                </div>
              )}

              <div className="pt-4 flex gap-3">
                {modalState.type === 'view' ? (
                  <button
                    type="button"
                    onClick={() => setModalState({ isOpen: false, type: 'add', adminId: null })}
                    className="w-full px-4 py-2.5 bg-[#1e1e2e] text-[#d4af37] font-bold text-xs rounded-xl hover:bg-black transition-colors shadow-sm cursor-pointer"
                  >
                    Close
                  </button>
                ) : (
                  <>
                    <button
                      type="button"
                      onClick={() => setModalState({ isOpen: false, type: 'add', adminId: null })}
                      className="flex-1 px-4 py-2.5 border border-gray-200 text-gray-700 font-bold text-xs rounded-xl hover:bg-gray-50 transition-colors cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="flex-1 px-4 py-2.5 bg-[#1e1e2e] text-[#d4af37] font-bold text-xs rounded-xl hover:bg-black transition-colors shadow-sm cursor-pointer"
                    >
                      {modalState.type === 'edit' ? 'Save Changes' : 'Create Admin'}
                    </button>
                  </>
                )}
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirm Delete Modal */}
      <ConfirmModal
        open={confirmModal.open}
        title="Delete Admin"
        message="Are you sure you want to delete this admin?"
        confirmText="Delete"
        cancelText="Cancel"
        variant="danger"
        loading={false}
        onConfirm={handleDelete}
        onCancel={() => setConfirmModal({ open: false, id: null })}
      />
    </div>
  );
};

export default Admins;
