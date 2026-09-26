import React, { useState, useEffect, useCallback } from 'react';
import { Pencil, Trash2, Plus, X, Image as ImageIcon, AlertCircle, Settings, Eye } from 'lucide-react';
import {
  adminGetBanners,
  adminCreateBanner,
  adminUpdateBanner,
  adminDeleteBanner,
  adminToggleBannerStatus
} from '../../services/admin/adminBannerService';
import ConfirmModal from '../../components/common/ConfirmModal/ConfirmModal';
import DataTable from '../../components/common/Table/DataTable';
import { useDataTableSync } from '../../hooks/useDataTableSync';

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
        className="p-1.5 bg-gray-100 border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
        title="Settings"
      >
        <Settings size={16} />
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-32 bg-white rounded-xl shadow-lg border border-gray-100 z-10 py-1 overflow-hidden">
          <button
            onClick={() => { setOpen(false); onView(row); }}
            className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2 transition-colors cursor-pointer"
          >
            <Eye size={14} className="text-gray-500" />
            View
          </button>
          <button
            onClick={() => { setOpen(false); onEdit(row); }}
            className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2 transition-colors cursor-pointer"
          >
            <Pencil size={14} className="text-blue-500" />
            Edit
          </button>
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

const AdminMarketing = () => {
  const {
    page, setPage,
    limit, setLimit,
    search, setSearch,
    sortBy, sortOrder, setSort,
    filters, setFilters,
    handleClearFilters
  } = useDataTableSync({
    defaultSortBy: 'displayOrder',
    defaultSortOrder: 'asc'
  });

  const [banners, setBanners] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBanner, setEditingBanner] = useState(null);
  const [viewModal, setViewModal] = useState({ open: false, banner: null });
  
  // Confirm Modal State
  const [confirmModal, setConfirmModal] = useState({
    open: false,
    id: null
  });
  
  // Form State
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    badge: '',
    ctaText: 'Order Now',
    ctaLink: '',
    displayOrder: 0,
    isActive: true,
    startDate: '',
    endDate: ''
  });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState('');

  const fetchBanners = useCallback(async () => {
    try {
      setLoading(true);
      
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

      const res = await adminGetBanners(`?${queryParams.toString()}`);
      setBanners(res.data || []);
      if (res.meta && res.meta.pagination) {
        setTotal(res.meta.pagination.total);
      } else if (res.pagination) {
        setTotal(res.pagination.total);
      } else {
        setTotal(res.data?.length || 0);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [page, limit, search, sortBy, sortOrder, filters]);

  useEffect(() => {
    fetchBanners();
  }, [fetchBanners]);

  const handleOpenModal = (banner = null) => {
    setFormError('');
    if (banner) {
      setEditingBanner(banner);
      setFormData({
        title: banner.title || '',
        description: banner.description || '',
        badge: banner.badge || '',
        ctaText: banner.ctaText || 'Order Now',
        ctaLink: banner.ctaLink || '',
        displayOrder: banner.displayOrder || 0,
        isActive: banner.isActive,
        startDate: banner.startDate ? new Date(banner.startDate).toISOString().split('T')[0] : '',
        endDate: banner.endDate ? new Date(banner.endDate).toISOString().split('T')[0] : ''
      });
      setImagePreview(banner.image);
    } else {
      setEditingBanner(null);
      setFormData({
        title: '',
        description: '',
        badge: '',
        ctaText: 'Order Now',
        ctaLink: '',
        displayOrder: 0,
        isActive: true,
        startDate: '',
        endDate: ''
      });
      setImagePreview(null);
    }
    setImageFile(null);
    setIsModalOpen(true);
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormLoading(true);
    setFormError('');

    try {
      const data = new FormData();
      Object.keys(formData).forEach(key => {
        data.append(key, formData[key]);
      });
      
      if (imageFile) {
        data.append('image', imageFile);
      }

      if (editingBanner) {
        await adminUpdateBanner(editingBanner._id, data);
      } else {
        await adminCreateBanner(data);
      }
      
      await fetchBanners();
      setIsModalOpen(false);
    } catch (err) {
      setFormError(err.message || 'Failed to save banner');
    } finally {
      setFormLoading(false);
    }
  };

  const confirmDelete = (id) => {
    setConfirmModal({ open: true, id });
  };

  const handleDelete = async () => {
    const id = confirmModal.id;
    if (!id) return;
    
    setFormLoading(true);
    try {
      await adminDeleteBanner(id);
      setBanners(banners.filter(b => b._id !== id));
      setConfirmModal({ open: false, id: null });
      fetchBanners(); // refresh total
    } catch (err) {
      alert(err.message || 'Failed to delete banner');
    } finally {
      setFormLoading(false);
    }
  };

  const handleToggleStatus = async (id) => {
    try {
      const res = await adminToggleBannerStatus(id);
      setBanners(banners.map(b => b._id === id ? res.data : b));
    } catch (err) {
      alert(err.message || 'Failed to toggle status');
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
          {((page - 1) * limit) + rowIndex + 1}
        </span>
      )
    },
    {
      key: 'image',
      label: 'Preview',
      sortable: false,
      className: 'px-2 py-3',
      headerClassName: 'px-2 py-3',
      render: (row) => (
        <div className="w-20 h-10 bg-gray-100 rounded-lg overflow-hidden relative">
          {row.image ? (
            <img src={row.image} alt={row.title} className="w-full h-full object-cover" />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center">
              <ImageIcon size={16} className="text-gray-400" />
            </div>
          )}
        </div>
      )
    },
    {
      key: 'title',
      label: 'Banner Info',
      sortable: true,
      className: 'px-2 py-3',
      headerClassName: 'px-2 py-3',
      render: (row) => (
        <div className="whitespace-nowrap">
          <div className="font-medium text-gray-900 truncate max-w-[150px]" title={row.title}>{row.title}</div>
          <div className="text-[10px] text-gray-500 truncate max-w-[150px]">{row.description || 'No description'}</div>
          {row.badge && (
            <span className="inline-block mt-0.5 px-2 py-0.5 bg-blue-50 text-blue-600 rounded text-[10px] font-medium">
              {row.badge}
            </span>
          )}
        </div>
      )
    },
    {
      key: 'displayOrder',
      label: 'Order',
      sortable: true,
      align: 'center',
      className: 'px-2 py-3',
      headerClassName: 'px-2 py-3',
      render: (row) => <span className="font-bold text-gray-700">{row.displayOrder}</span>
    },
    {
      key: 'schedule',
      label: 'Schedule',
      sortable: false,
      className: 'px-2 py-3',
      headerClassName: 'px-2 py-3',
      render: (row) => (
        <div className="text-[11px] text-slate-500 whitespace-nowrap">
          {row.startDate ? new Date(row.startDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: '2-digit' }) : 'N/A'} - <br/>
          {row.endDate ? new Date(row.endDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: '2-digit' }) : 'N/A'}
        </div>
      )
    },
    {
      key: 'isActive',
      label: 'Status',
      sortable: true,
      align: 'center',
      className: 'px-2 py-3',
      headerClassName: 'px-2 py-3',
      render: (row) => (
        <button
          onClick={() => handleToggleStatus(row._id)}
          className={`px-2 py-1 rounded-full text-[10px] font-bold cursor-pointer whitespace-nowrap ${
            row.isActive 
              ? 'bg-emerald-100 text-emerald-800' 
              : 'bg-gray-100 text-gray-600'
          }`}
        >
          {row.isActive ? 'Active' : 'Inactive'}
        </button>
      )
    },
    {
      key: 'actions',
      label: 'Actions',
      align: 'right',
      className: 'px-2 py-3',
      headerClassName: 'px-2 py-3',
      render: (row) => (
        <ActionDropdown 
          row={row} 
          onView={(b) => setViewModal({ open: true, banner: b })}
          onEdit={handleOpenModal} 
          onDelete={confirmDelete} 
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
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">Marketing & Banners</h1>
          <p className="text-sm text-slate-500 mt-1">Manage promotional banners for the platform</p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="flex items-center px-4 py-2 bg-[#d4af37] text-white font-bold text-sm rounded-xl hover:bg-[#b5952f] transition-colors shadow-sm cursor-pointer"
        >
          <Plus size={18} className="mr-2" />
          Add Banner
        </button>
      </div>

      <DataTable
        columns={columns}
        data={banners}
        loading={loading}
        emptyMessage="No banners found matching your criteria."
        
        search={{ value: search, placeholder: 'Search by title or description...' }}
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

      {isModalOpen && (
        <div className="fixed inset-0 bg-gray-900/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto animate-fadeIn">
            <div className="flex items-center justify-between p-6 border-b sticky top-0 bg-white z-10">
              <h2 className="text-xl font-bold text-gray-900">
                {editingBanner ? 'Edit Banner' : 'Create New Banner'}
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 p-2 cursor-pointer transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {formError && (
                <div className="p-4 bg-red-50 text-red-600 rounded-xl flex items-center text-sm font-semibold">
                  <AlertCircle size={18} className="mr-2 flex-shrink-0" />
                  {formError}
                </div>
              )}

              <div className="grid grid-cols-2 gap-6">
                <div className="col-span-2 sm:col-span-1">
                  <label className="block text-xs font-bold text-gray-700 mb-1">Title *</label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                    className="w-full p-2.5 border border-gray-200 rounded-xl text-xs focus:ring-2 focus:ring-[#d4af37] outline-none"
                    placeholder="e.g. 50% Off Desserts"
                  />
                </div>

                <div className="col-span-2 sm:col-span-1">
                  <label className="block text-xs font-bold text-gray-700 mb-1">Badge Text</label>
                  <input
                    type="text"
                    value={formData.badge}
                    onChange={(e) => setFormData({...formData, badge: e.target.value})}
                    className="w-full p-2.5 border border-gray-200 rounded-xl text-xs focus:ring-2 focus:ring-[#d4af37] outline-none"
                    placeholder="e.g. PROMO"
                  />
                </div>

                <div className="col-span-2">
                  <label className="block text-xs font-bold text-gray-700 mb-1">Description</label>
                  <textarea
                    rows={2}
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    className="w-full p-2.5 border border-gray-200 rounded-xl text-xs focus:ring-2 focus:ring-[#d4af37] outline-none resize-none"
                    placeholder="Brief description of the promotion"
                  />
                </div>

                <div className="col-span-2">
                  <label className="block text-xs font-bold text-gray-700 mb-2">
                    Banner Image {(!editingBanner || formData.isActive) && '*'}
                  </label>
                  <div className="flex items-start space-x-6">
                    <div className="w-64 h-32 bg-gray-50 border-2 border-dashed border-gray-200 rounded-xl flex flex-col items-center justify-center relative overflow-hidden group">
                      {imagePreview ? (
                        <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                      ) : (
                        <div className="text-center p-4">
                          <ImageIcon className="mx-auto h-8 w-8 text-gray-400 mb-2" />
                          <span className="text-xs font-semibold text-gray-500">Upload Image</span>
                        </div>
                      )}
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        required={!editingBanner && formData.isActive}
                      />
                    </div>
                    <div className="flex-1 text-xs text-gray-500 font-medium space-y-1 pt-2">
                      <p>Recommended size: 800x400px</p>
                      <p>Max file size: 5MB</p>
                      <p>Formats: JPG, PNG, WEBP</p>
                    </div>
                  </div>
                </div>

                <div className="col-span-2 sm:col-span-1">
                  <label className="block text-xs font-bold text-gray-700 mb-1">CTA Text</label>
                  <input
                    type="text"
                    value={formData.ctaText}
                    onChange={(e) => setFormData({...formData, ctaText: e.target.value})}
                    className="w-full p-2.5 border border-gray-200 rounded-xl text-xs focus:ring-2 focus:ring-[#d4af37] outline-none"
                    placeholder="e.g. Order Now"
                  />
                </div>

                <div className="col-span-2 sm:col-span-1">
                  <label className="block text-xs font-bold text-gray-700 mb-1">CTA Link</label>
                  <input
                    type="text"
                    value={formData.ctaLink}
                    onChange={(e) => setFormData({...formData, ctaLink: e.target.value})}
                    className="w-full p-2.5 border border-gray-200 rounded-xl text-xs focus:ring-2 focus:ring-[#d4af37] outline-none"
                    placeholder="e.g. /user/restaurant/123"
                  />
                </div>

                <div className="col-span-2 sm:col-span-1">
                  <label className="block text-xs font-bold text-gray-700 mb-1">Start Date</label>
                  <input
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => setFormData({...formData, startDate: e.target.value})}
                    className="w-full p-2.5 border border-gray-200 rounded-xl text-xs focus:ring-2 focus:ring-[#d4af37] outline-none"
                  />
                </div>

                <div className="col-span-2 sm:col-span-1">
                  <label className="block text-xs font-bold text-gray-700 mb-1">End Date</label>
                  <input
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => setFormData({...formData, endDate: e.target.value})}
                    className="w-full p-2.5 border border-gray-200 rounded-xl text-xs focus:ring-2 focus:ring-[#d4af37] outline-none"
                  />
                </div>

                <div className="col-span-2 sm:col-span-1">
                  <label className="block text-xs font-bold text-gray-700 mb-1">Display Order</label>
                  <input
                    type="number"
                    value={formData.displayOrder}
                    onChange={(e) => setFormData({...formData, displayOrder: e.target.value})}
                    className="w-full p-2.5 border border-gray-200 rounded-xl text-xs focus:ring-2 focus:ring-[#d4af37] outline-none"
                  />
                </div>

                <div className="col-span-2 sm:col-span-1 flex items-end">
                  <label className="flex items-center space-x-2 cursor-pointer py-2 text-xs font-bold text-gray-700">
                    <input
                      type="checkbox"
                      checked={formData.isActive}
                      onChange={(e) => setFormData({...formData, isActive: e.target.checked})}
                      className="w-4 h-4 text-[#d4af37] border-gray-300 rounded focus:ring-[#d4af37]"
                    />
                    <span>Banner is Active</span>
                  </label>
                </div>
              </div>

              <div className="pt-6 border-t flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 max-w-[120px] py-2.5 border border-gray-200 text-gray-700 font-bold text-xs rounded-xl hover:bg-gray-50 cursor-pointer transition-colors"
                  disabled={formLoading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={formLoading}
                  className="flex-1 max-w-[150px] py-2.5 bg-[#d4af37] text-white font-bold text-xs rounded-xl hover:bg-[#b5952f] disabled:opacity-50 cursor-pointer transition-colors"
                >
                  {formLoading ? 'Saving...' : 'Save Banner'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirm Delete Modal */}
      <ConfirmModal
        open={confirmModal.open}
        title="Delete Banner"
        message="Are you sure you want to delete this banner? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        variant="danger"
        loading={formLoading}
        onConfirm={handleDelete}
        onCancel={() => setConfirmModal({ open: false, id: null })}
      />

      {/* View Banner Modal */}
      {viewModal.open && viewModal.banner && (
        <div className="fixed inset-0 bg-gray-900/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto animate-fadeIn">
            <div className="flex items-center justify-between p-6 border-b sticky top-0 bg-white z-10">
              <h2 className="text-xl font-bold text-gray-900">Banner Details</h2>
              <button onClick={() => setViewModal({ open: false, banner: null })} className="text-gray-400 hover:text-gray-600 p-2 cursor-pointer">
                <X size={20} />
              </button>
            </div>
            <div className="p-6 space-y-6">
              <div className="w-full h-48 bg-gray-100 rounded-xl overflow-hidden relative">
                {viewModal.banner.image ? (
                  <img src={viewModal.banner.image} alt="Banner" className="w-full h-full object-cover" />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center text-gray-400">No Image</div>
                )}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <p className="text-xs text-gray-500 font-bold mb-1">Title</p>
                  <p className="text-sm font-medium text-gray-900">{viewModal.banner.title || 'N/A'}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-xs text-gray-500 font-bold mb-1">Description</p>
                  <p className="text-sm text-gray-700">{viewModal.banner.description || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 font-bold mb-1">Badge</p>
                  {viewModal.banner.badge ? (
                    <span className="px-2 py-0.5 bg-blue-50 text-blue-600 rounded text-xs font-medium">{viewModal.banner.badge}</span>
                  ) : <span className="text-sm text-gray-700">N/A</span>}
                </div>
                <div>
                  <p className="text-xs text-gray-500 font-bold mb-1">Status</p>
                  {viewModal.banner.isActive ? (
                    <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded text-xs font-bold">Active</span>
                  ) : (
                    <span className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded text-xs font-bold">Inactive</span>
                  )}
                </div>
                <div>
                  <p className="text-xs text-gray-500 font-bold mb-1">Start Date</p>
                  <p className="text-sm text-gray-700">{viewModal.banner.startDate ? new Date(viewModal.banner.startDate).toLocaleDateString() : 'N/A'}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 font-bold mb-1">End Date</p>
                  <p className="text-sm text-gray-700">{viewModal.banner.endDate ? new Date(viewModal.banner.endDate).toLocaleDateString() : 'N/A'}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 font-bold mb-1">CTA Text</p>
                  <p className="text-sm text-gray-700">{viewModal.banner.ctaText || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 font-bold mb-1">CTA Link</p>
                  <p className="text-sm text-gray-700 break-all">{viewModal.banner.ctaLink || 'N/A'}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminMarketing;
