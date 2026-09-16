import React, { useState, useEffect } from 'react';
import { Pencil, Trash2, Plus, X, Search, Image as ImageIcon, AlertCircle } from 'lucide-react';
import {
  superAdminGetBanners,
  superAdminCreateBanner,
  superAdminUpdateBanner,
  superAdminDeleteBanner,
  superAdminToggleBannerStatus
} from '../../services/superadmin/superAdminBannerService';
import ConfirmModal from '../../components/common/ConfirmModal/ConfirmModal';

const Banners = () => {
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
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

  useEffect(() => {
    fetchBanners();
  }, []);

  const fetchBanners = async () => {
    try {
      setLoading(true);
      const res = await superAdminGetBanners();
      setBanners(res.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

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

  const filteredBanners = banners.filter(b => 
    b.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Banner Management</h1>
          <p className="text-sm text-gray-500">Manage hero banners for the customer application</p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="flex items-center px-4 py-2 bg-[#d4af37] text-white rounded-lg hover:bg-[#c4a030]"
          data-testid="create-banner-btn"
        >
          <Plus size={20} className="mr-2" />
          Add Banner
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-4 border-b border-gray-100">
          <div className="relative w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search banners..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:border-[#d4af37]"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-600">
            <thead className="bg-gray-50 text-gray-700">
              <tr>
                <th className="px-6 py-4 font-medium">Preview</th>
                <th className="px-6 py-4 font-medium">Banner Info</th>
                <th className="px-6 py-4 font-medium">Display Order</th>
                <th className="px-6 py-4 font-medium">Schedule</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="6" className="px-6 py-8 text-center text-gray-500">
                    Loading banners...
                  </td>
                </tr>
              ) : filteredBanners.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-8 text-center text-gray-500">
                    No banners found
                  </td>
                </tr>
              ) : (
                filteredBanners.map((banner) => (
                  <tr key={banner._id} className="border-t border-gray-50 hover:bg-gray-50/50" data-testid={`banner-row-${banner._id}`}>
                    <td className="px-6 py-4">
                      <div className="w-24 h-12 bg-gray-100 rounded-lg overflow-hidden relative">
                        {banner.image ? (
                          <img src={banner.image} alt={banner.title} className="w-full h-full object-cover" />
                        ) : (
                          <div className="absolute inset-0 flex items-center justify-center">
                            <ImageIcon size={20} className="text-gray-400" />
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-medium text-gray-900">{banner.title}</div>
                      <div className="text-xs text-gray-500 truncate max-w-[200px]">{banner.description || 'No description'}</div>
                      {banner.badge && (
                        <span className="inline-block mt-1 px-2 py-0.5 bg-blue-50 text-blue-600 rounded text-[10px] font-medium">
                          {banner.badge}
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4">{banner.displayOrder}</td>
                    <td className="px-6 py-4">
                      <div className="text-xs">
                        {banner.startDate ? new Date(banner.startDate).toLocaleDateString() : 'N/A'} - 
                        {banner.endDate ? new Date(banner.endDate).toLocaleDateString() : 'N/A'}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => handleToggleStatus(banner._id)}
                        data-testid={`toggle-banner-${banner._id}`}
                        className={`px-3 py-1 rounded-full text-xs font-medium ${
                          banner.isActive 
                            ? 'bg-green-100 text-green-700' 
                            : 'bg-gray-100 text-gray-600'
                        }`}
                      >
                        {banner.isActive ? 'Active' : 'Inactive'}
                      </button>
                    </td>
                    <td className="px-6 py-4 text-right space-x-2">
                      <button
                        onClick={() => handleOpenModal(banner)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                        title="Edit"
                      >
                        <Pencil size={18} />
                      </button>
                      <button
                        onClick={() => confirmDelete(banner._id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                        title="Delete"
                      >
                        <Trash2 size={18} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b sticky top-0 bg-white z-10">
              <h2 className="text-xl font-bold text-gray-900">
                {editingBanner ? 'Edit Banner' : 'Create New Banner'}
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 p-2"
              >
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {formError && (
                <div className="p-4 bg-red-50 text-red-600 rounded-lg flex items-center text-sm">
                  <AlertCircle size={18} className="mr-2 flex-shrink-0" />
                  {formError}
                </div>
              )}

              <div className="grid grid-cols-2 gap-6">
                <div className="col-span-2 sm:col-span-1">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Title *</label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:border-[#d4af37]"
                    placeholder="e.g. 50% Off Desserts"
                  />
                </div>

                <div className="col-span-2 sm:col-span-1">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Badge Text</label>
                  <input
                    type="text"
                    value={formData.badge}
                    onChange={(e) => setFormData({...formData, badge: e.target.value})}
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:border-[#d4af37]"
                    placeholder="e.g. PROMO"
                  />
                </div>

                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                  <textarea
                    rows={2}
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:border-[#d4af37] resize-none"
                    placeholder="Brief description of the promotion"
                  />
                </div>

                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Banner Image {(!editingBanner || formData.isActive) && '*'}
                  </label>
                  <div className="flex items-start space-x-6">
                    <div className="w-64 h-32 bg-gray-50 border-2 border-dashed border-gray-200 rounded-lg flex flex-col items-center justify-center relative overflow-hidden group">
                      {imagePreview ? (
                        <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                      ) : (
                        <div className="text-center p-4">
                          <ImageIcon className="mx-auto h-8 w-8 text-gray-400 mb-2" />
                          <span className="text-xs text-gray-500">Upload Image</span>
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
                    <div className="flex-1 text-sm text-gray-500 pt-2">
                      <p>Recommended size: 800x400px</p>
                      <p>Max file size: 5MB</p>
                      <p>Formats: JPG, PNG, WEBP</p>
                    </div>
                  </div>
                </div>

                <div className="col-span-2 sm:col-span-1">
                  <label className="block text-sm font-medium text-gray-700 mb-2">CTA Text</label>
                  <input
                    type="text"
                    value={formData.ctaText}
                    onChange={(e) => setFormData({...formData, ctaText: e.target.value})}
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:border-[#d4af37]"
                    placeholder="e.g. Order Now"
                  />
                </div>

                <div className="col-span-2 sm:col-span-1">
                  <label className="block text-sm font-medium text-gray-700 mb-2">CTA Link</label>
                  <input
                    type="text"
                    value={formData.ctaLink}
                    onChange={(e) => setFormData({...formData, ctaLink: e.target.value})}
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:border-[#d4af37]"
                    placeholder="e.g. /user/restaurant/123"
                  />
                </div>

                <div className="col-span-2 sm:col-span-1">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
                  <input
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => setFormData({...formData, startDate: e.target.value})}
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:border-[#d4af37]"
                  />
                </div>

                <div className="col-span-2 sm:col-span-1">
                  <label className="block text-sm font-medium text-gray-700 mb-2">End Date</label>
                  <input
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => setFormData({...formData, endDate: e.target.value})}
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:border-[#d4af37]"
                  />
                </div>

                <div className="col-span-2 sm:col-span-1">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Display Order</label>
                  <input
                    type="number"
                    value={formData.displayOrder}
                    onChange={(e) => setFormData({...formData, displayOrder: e.target.value})}
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:border-[#d4af37]"
                  />
                </div>

                <div className="col-span-2 sm:col-span-1 flex items-end">
                  <label className="flex items-center space-x-3 cursor-pointer py-2">
                    <input
                      type="checkbox"
                      checked={formData.isActive}
                      onChange={(e) => setFormData({...formData, isActive: e.target.checked})}
                      className="w-5 h-5 text-[#d4af37] border-gray-300 rounded focus:ring-[#d4af37]"
                    />
                    <span className="text-sm font-medium text-gray-700">Banner is Active</span>
                  </label>
                </div>
              </div>

              <div className="pt-6 border-t flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-6 py-2 border rounded-lg hover:bg-gray-50"
                  disabled={formLoading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={formLoading}
                  className="px-6 py-2 bg-[#d4af37] text-white rounded-lg hover:bg-[#c4a030] disabled:opacity-50"
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
