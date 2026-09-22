import React, { useState, useEffect, useCallback } from 'react';
import { Pencil, Trash2, Plus, X, Image as ImageIcon, AlertCircle } from 'lucide-react';
import {
  superAdminGetBanners,
  superAdminCreateBanner,
  superAdminUpdateBanner,
  superAdminDeleteBanner,
  superAdminToggleBannerStatus
} from '../../services/superadmin/superAdminBannerService';
import ConfirmModal from '../../components/common/ConfirmModal/ConfirmModal';
import DataTable from '../../components/common/Table/DataTable';
import { useDataTableSync } from '../../hooks/useDataTableSync';

const Banners = () => {
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

      const res = await superAdminGetBanners(`?${queryParams.toString()}`);
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
        await superAdminUpdateBanner(editingBanner._id, data);
      } else {
        await superAdminCreateBanner(data);
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
      await superAdminDeleteBanner(id);
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
      const res = await superAdminToggleBannerStatus(id);
      setBanners(banners.map(b => b._id === id ? res.data : b));
    } catch (err) {
      alert(err.message || 'Failed to toggle status');
    }
  };

  const columns = [
    {
      key: 'image',
      label: 'Preview',
      sortable: false,
      render: (row) => (
        <div className="w-24 h-12 bg-gray-100 rounded-lg overflow-hidden relative">
          {row.image ? (
            <img src={row.image} alt={row.title} className="w-full h-full object-cover" />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center">
              <ImageIcon size={20} className="text-gray-400" />
            </div>
          )}
        </div>
      )
    },
    {
      key: 'title',
      label: 'Banner Info',
      sortable: true,
      render: (row) => (
        <div>
          <div className="font-medium text-gray-900">{row.title}</div>
          <div className="text-xs text-gray-500 truncate max-w-[200px]">{row.description || 'No description'}</div>
          {row.badge && (
            <span className="inline-block mt-1 px-2 py-0.5 bg-blue-50 text-blue-600 rounded text-[10px] font-medium">
              {row.badge}
            </span>
          )}
        </div>
      )
    },
    {
      key: 'displayOrder',
      label: 'Display Order',
      sortable: true,
      align: 'center',
      render: (row) => row.displayOrder
    },
    {
      key: 'schedule',
      label: 'Schedule',
      sortable: false,
      render: (row) => (
        <div className="text-xs text-slate-500 whitespace-nowrap">
          {row.startDate ? new Date(row.startDate).toLocaleDateString() : 'N/A'} - 
          {row.endDate ? new Date(row.endDate).toLocaleDateString() : 'N/A'}
        </div>
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
          className={`px-3 py-1 rounded-full text-[10px] font-bold cursor-pointer ${
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
      render: (row) => (
        <div className="flex items-center justify-end space-x-2">
          <button
            onClick={() => handleOpenModal(row)}
            className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg cursor-pointer transition-colors"
            title="Edit"
          >
            <Pencil size={16} />
          </button>
          <button
            onClick={() => confirmDelete(row._id)}
            className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg cursor-pointer transition-colors"
            title="Delete"
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
    }
  ];

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Banner Management</h1>
          <p className="text-sm text-gray-500 mt-1">Manage hero banners for the customer application</p>
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
    </div>
  );
};

export default Banners;
