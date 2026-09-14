import React, { useState, useEffect } from 'react';
import { Trash2, ShieldAlert, Settings, Eye, Edit, UserPlus, LogIn, ToggleRight, ToggleLeft } from 'lucide-react';
import API_BASE_URL from '../../services/apiService';

const Admins = () => {
  const [admins, setAdmins] = useState([]);
  const [openDropdownId, setOpenDropdownId] = useState(null);
  const [modalState, setModalState] = useState({ isOpen: false, type: 'add', adminId: null });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [submitError, setSubmitError] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'Admin'
  });

  const currentUser = JSON.parse(localStorage.getItem('superadmin_user') || '{}');

  useEffect(() => {
    fetchAdmins();
  }, []);

  const fetchAdmins = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/admins`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('superadmin_token')}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        const filteredData = data.filter(admin => admin._id !== currentUser.id);
        setAdmins(filteredData);
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
  };

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
    setOpenDropdownId(null);
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
        if (isEdit) {
          setAdmins(admins.map(a => a._id === data._id ? data : a));
        } else {
          setAdmins([data, ...admins]);
        }
        setModalState({ isOpen: false, type: 'add', adminId: null });
      } else {
        setSubmitError(data.message || `Failed to ${isEdit ? 'update' : 'create'} admin`);
      }
    } catch (err) {
      setSubmitError(`Network error while ${modalState.type === 'edit' ? 'updating' : 'creating'} admin`);
    }
  };

  const handleDelete = async (id) => {
    if (id === currentUser.id) {
      alert("You cannot delete your own account.");
      return;
    }

    if (!window.confirm('Are you sure you want to delete this admin?')) {
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/admins/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('superadmin_token')}`
        }
      });

      if (response.ok) {
        setAdmins(admins.filter(admin => admin._id !== id));
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
        setAdmins(admins.map(admin => 
          admin._id === id ? { ...admin, isActive: !currentStatus } : admin
        ));
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

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">Admins</h1>
          <p className="text-slate-400 mt-1">{admins.length} admin{admins.length !== 1 ? 's' : ''} registered</p>
        </div>
        <button
          onClick={() => openModal('add')}
          className="inline-flex items-center gap-2 bg-[#1e1e2e] text-[#d4af37] px-5 py-2.5 rounded-xl hover:bg-black transition-colors font-medium shadow-sm"
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
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-600">
            <thead className="bg-gray-50 border-b border-gray-100 text-gray-400 uppercase text-xs font-semibold">
              <tr>
                <th className="px-6 py-4">#</th>
                <th className="px-6 py-4">Name</th>
                <th className="px-6 py-4">Email</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Last Login</th>
                <th className="px-6 py-4">Created</th>
                <th className="px-6 py-4 text-center">Login As</th>
                <th className="px-6 py-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                <tr>
                  <td colSpan="8" className="px-6 py-8 text-center text-gray-400">Loading admins...</td>
                </tr>
              ) : admins.length === 0 ? (
                <tr>
                  <td colSpan="8" className="px-6 py-8 text-center text-gray-400">No admins found.</td>
                </tr>
              ) : (
                admins.map((admin, index) => (
                  <tr key={admin._id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 text-slate-400 font-medium">
                      {index + 1}
                    </td>
                    <td className="px-6 py-4 font-bold text-slate-800">
                      {admin.name || 'N/A'}
                    </td>
                    <td className="px-6 py-4 text-slate-500 font-medium">
                      {admin.email}
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => handleToggleStatus(admin._id, admin.isActive !== false)}
                        disabled={admin._id === currentUser.id}
                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold transition-colors ${
                          admin.isActive !== false 
                            ? 'bg-[#d4af37]/20 text-[#a58523] hover:bg-[#d4af37]/30' 
                            : 'bg-red-100 text-red-700 hover:bg-red-200'
                        } ${admin._id === currentUser.id ? 'opacity-50 cursor-not-allowed' : ''}`}
                      >
                        {admin.isActive !== false ? <ToggleRight size={14} /> : <ToggleLeft size={14} />}
                        {admin.isActive !== false ? 'Active' : 'Inactive'}
                      </button>
                    </td>
                    <td className="px-6 py-4 text-slate-400 font-medium whitespace-nowrap">
                      {formatDate(admin.lastLogin)}
                    </td>
                    <td className="px-6 py-4 text-slate-400 font-medium whitespace-nowrap">
                      {formatDate(admin.createdAt)}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <button
                        className="inline-flex items-center gap-1.5 bg-[#1e1e2e] text-[#d4af37] px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-black transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                        onClick={() => handleImpersonate(admin._id)}
                        disabled={admin._id === currentUser.id}
                      >
                        <LogIn size={14} /> Login
                      </button>
                    </td>
                    <td className="px-6 py-4 text-center relative">
                      <button
                        onClick={() => setOpenDropdownId(openDropdownId === admin._id ? null : admin._id)}
                        className="text-gray-400 hover:text-gray-600 transition-colors p-2 rounded-lg hover:bg-gray-100"
                        title="Actions"
                      >
                        <Settings size={18} />
                      </button>
                      
                      {openDropdownId === admin._id && (
                        <>
                          <div 
                            className="fixed inset-0 z-10" 
                            onClick={() => setOpenDropdownId(null)}
                          ></div>
                          <div className="absolute right-8 top-10 mt-2 w-36 bg-white rounded-xl shadow-lg border border-gray-100 py-1 z-20 text-left">
                            <button
                              onClick={() => openModal('view', admin)}
                              className="w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2 transition-colors font-medium"
                            >
                              <Eye size={16} className="text-gray-400" /> View
                            </button>
                            <button
                              onClick={() => openModal('edit', admin)}
                              className="w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2 transition-colors font-medium"
                            >
                              <Edit size={16} className="text-gray-400" /> Edit
                            </button>
                            <div className="h-px bg-gray-100 my-1 mx-2"></div>
                            <button
                              onClick={() => { setOpenDropdownId(null); handleDelete(admin._id); }}
                              disabled={admin._id === currentUser.id}
                              className="w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                              title={admin._id === currentUser.id ? "Cannot delete yourself" : ""}
                            >
                              <Trash2 size={16} className="text-red-500" /> Delete
                            </button>
                          </div>
                        </>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Dynamic Modal (Add / Edit / View) */}
      {modalState.isOpen && (
        <div className="fixed inset-0 bg-gray-900/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">
                {modalState.type === 'add' ? 'Add New Admin' : modalState.type === 'edit' ? 'Edit Admin' : 'Admin Details'}
              </h2>
              <button onClick={() => setModalState({ isOpen: false, type: 'add', adminId: null })} className="text-gray-400 hover:text-gray-600 p-2 text-2xl leading-none">&times;</button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {submitError && (
                <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm">
                  {submitError}
                </div>
              )}
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  disabled={modalState.type === 'view'}
                  className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#d4af37] focus:border-transparent outline-none transition-all disabled:opacity-70 disabled:bg-gray-100"
                  placeholder="John Doe"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  disabled={modalState.type === 'view'}
                  className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#d4af37] focus:border-transparent outline-none transition-all disabled:opacity-70 disabled:bg-gray-100"
                  placeholder="john@eatoggy.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                <select
                  name="role"
                  value={formData.role}
                  onChange={handleInputChange}
                  disabled={modalState.type === 'view'}
                  className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#d4af37] focus:border-transparent outline-none transition-all disabled:opacity-70 disabled:bg-gray-100"
                >
                  <option value="SuperAdmin">SuperAdmin</option>
                  <option value="Admin">Admin</option>
                  <option value="Manager">Manager</option>
                  <option value="Support">Support</option>
                </select>
              </div>

              {modalState.type !== 'view' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {modalState.type === 'edit' ? 'New Password (leave blank to keep current)' : 'Password'}
                  </label>
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    required={modalState.type === 'add'}
                    minLength="6"
                    className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#d4af37] focus:border-transparent outline-none transition-all"
                    placeholder="••••••••"
                  />
                </div>
              )}

              <div className="pt-4 flex gap-3">
                {modalState.type === 'view' ? (
                  <button
                    type="button"
                    onClick={() => setModalState({ isOpen: false, type: 'add', adminId: null })}
                    className="w-full px-4 py-2.5 bg-[#1e1e2e] text-[#d4af37] font-medium rounded-lg hover:bg-black transition-colors shadow-sm"
                  >
                    Close
                  </button>
                ) : (
                  <>
                    <button
                      type="button"
                      onClick={() => setModalState({ isOpen: false, type: 'add', adminId: null })}
                      className="flex-1 px-4 py-2.5 border border-gray-200 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="flex-1 px-4 py-2.5 bg-[#1e1e2e] text-[#d4af37] font-medium rounded-lg hover:bg-black transition-colors shadow-sm"
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
    </div>
  );
};

export default Admins;
