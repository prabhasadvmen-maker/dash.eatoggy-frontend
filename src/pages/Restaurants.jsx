import React, { useState, useEffect, useRef } from 'react';
import { Settings, Eye, CheckCircle2, XCircle, Trash2, Loader2, Store, RefreshCw, X, MapPin, Phone, Mail, FileText, Video, Image as ImageIcon, ToggleLeft, ToggleRight } from 'lucide-react';
import API_BASE_URL from '../config/api';

const Restaurants = () => {
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('ALL');
  const [activeDropdownId, setActiveDropdownId] = useState(null);
  
  // Modal State
  const [selectedRestaurant, setSelectedRestaurant] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState('VIEW'); // 'VIEW' or 'REJECT'
  const [rejectReason, setRejectReason] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [previewMedia, setPreviewMedia] = useState(null);

  const getFileType = (url, defaultType = 'image') => {
    if (!url) return 'none';
    const cleanUrl = url.split('?')[0].toLowerCase();
    if (cleanUrl.match(/\.(mp4|mov|webm|avi|mkv)$/) || cleanUrl.startsWith('data:video/')) return 'video';
    if (cleanUrl.match(/\.(pdf)$/) || cleanUrl.startsWith('data:application/pdf')) return 'pdf';
    if (cleanUrl.match(/\.(jpg|jpeg|png|webp|gif|svg)$/) || cleanUrl.startsWith('data:image/')) return 'image';
    return defaultType;
  };

  const renderDocCard = (title, url, Icon, defaultType = 'image') => {
    if (!url) {
      return (
        <div className="p-3 bg-gray-50 border border-gray-200/80 rounded-xl text-center flex flex-col items-center justify-center min-h-[120px]">
          <Icon size={20} className="text-gray-300 mb-1" />
          <span className="text-xs font-medium text-gray-400">{title}</span>
          <span className="text-[10px] text-gray-300 mt-0.5">Not Uploaded</span>
        </div>
      );
    }

    const fType = getFileType(url, defaultType);

    return (
      <div className="bg-white border border-gray-200 rounded-xl p-2.5 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between">
        <div className="flex items-center justify-between mb-1.5 px-0.5">
          <span className="text-xs font-bold text-gray-800 flex items-center gap-1.5 truncate">
            <Icon size={14} className="text-blue-500 shrink-0" /> {title}
          </span>
          <a
            href={url}
            target="_blank"
            rel="noreferrer"
            className="text-[11px] font-semibold text-blue-600 hover:text-blue-800 hover:underline shrink-0"
          >
            Full Link ↗
          </a>
        </div>

        {fType === 'image' && (
          <div
            className="relative group cursor-pointer overflow-hidden rounded-lg border border-gray-100 bg-gray-50"
            onClick={() => setPreviewMedia({ url, title, type: 'image' })}
          >
            <img
              src={url}
              alt={title}
              className="w-full h-28 object-cover rounded-lg group-hover:scale-105 transition-transform duration-200"
            />
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-bold gap-1">
              <Eye size={16} /> View Image
            </div>
          </div>
        )}

        {fType === 'video' && (
          <div className="rounded-lg overflow-hidden border border-gray-100 bg-black">
            <video src={url} className="w-full h-28 object-contain" controls />
          </div>
        )}

        {fType === 'pdf' && (
          <div
            className="h-28 bg-red-50/80 border border-red-100 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:bg-red-100/80 transition-colors p-2 text-center"
            onClick={() => setPreviewMedia({ url, title, type: 'pdf' })}
          >
            <FileText size={28} className="text-red-500 mb-1" />
            <span className="text-xs font-bold text-red-700">Preview PDF</span>
            <span className="text-[10px] text-red-500 mt-0.5">Click to view</span>
          </div>
        )}
      </div>
    );
  };

  const dropdownRef = useRef(null);

  useEffect(() => {
    fetchRestaurants();
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

  const fetchRestaurants = async () => {
    setLoading(true);
    setError('');
    try {
      const token = localStorage.getItem('superadmin_token');
      const res = await fetch(`${API_BASE_URL}/api/admins/restaurants`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) {
        setRestaurants(Array.isArray(data) ? data : []);
      } else {
        setError(data.message || 'Failed to fetch restaurants');
      }
    } catch (err) {
      setError('Network error connecting to server');
    }
    setLoading(false);
  };

  const handleApprove = async (id) => {
    setActionLoading(true);
    try {
      const token = localStorage.getItem('superadmin_token');
      const res = await fetch(`${API_BASE_URL}/api/admins/restaurants/${id}/approve`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        setRestaurants(restaurants.map(r => r._id === id ? { ...r, status: 'APPROVED', rejectionReason: '' } : r));
        setIsModalOpen(false);
        setActiveDropdownId(null);
      } else {
        alert('Failed to approve restaurant');
      }
    } catch (err) {
      console.error(err);
      alert('Network error while approving restaurant');
    }
    setActionLoading(false);
  };

  const handleReject = async (id) => {
    if (!rejectReason.trim()) return alert('Please enter a rejection reason');
    setActionLoading(true);
    try {
      const token = localStorage.getItem('superadmin_token');
      const res = await fetch(`${API_BASE_URL}/api/admins/restaurants/${id}/reject`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ reason: rejectReason })
      });
      if (res.ok) {
        setRestaurants(restaurants.map(r => r._id === id ? { ...r, status: 'REJECTED', rejectionReason: rejectReason } : r));
        setIsModalOpen(false);
        setRejectReason('');
        setActiveDropdownId(null);
      } else {
        alert('Failed to reject restaurant');
      }
    } catch (err) {
      console.error(err);
      alert('Network error while rejecting restaurant');
    }
    setActionLoading(false);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this restaurant record? This action cannot be undone.')) {
      return;
    }
    setActionLoading(true);
    try {
      const token = localStorage.getItem('superadmin_token');
      const res = await fetch(`${API_BASE_URL}/api/admins/restaurants/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        setRestaurants(restaurants.filter(r => r._id !== id));
        setActiveDropdownId(null);
        if (selectedRestaurant && selectedRestaurant._id === id) {
          setIsModalOpen(false);
        }
      } else {
        alert('Failed to delete restaurant');
      }
    } catch (err) {
      console.error(err);
      alert('Network error while deleting restaurant');
    }
    setActionLoading(false);
  };

  const handleToggleEnable = async (id) => {
    setActionLoading(true);
    try {
      const token = localStorage.getItem('superadmin_token');
      const res = await fetch(`${API_BASE_URL}/api/admins/restaurants/${id}/toggle-status`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) {
        setRestaurants(restaurants.map(r => r._id === id ? data.restaurant : r));
        setActiveDropdownId(null);
        if (selectedRestaurant && selectedRestaurant._id === id) {
          setSelectedRestaurant(data.restaurant);
        }
      } else {
        alert(data.message || 'Failed to update restaurant status');
      }
    } catch (err) {
      console.error(err);
      alert('Network error while updating restaurant status');
    }
    setActionLoading(false);
  };

  const openViewModal = (restaurant) => {
    setSelectedRestaurant(restaurant);
    setModalType('VIEW');
    setRejectReason('');
    setIsModalOpen(true);
    setActiveDropdownId(null);
  };

  const openRejectModal = (restaurant) => {
    setSelectedRestaurant(restaurant);
    setModalType('REJECT');
    setRejectReason(restaurant.rejectionReason || '');
    setIsModalOpen(true);
    setActiveDropdownId(null);
  };

  const toggleDropdown = (id, e) => {
    e.stopPropagation();
    setActiveDropdownId(prev => prev === id ? null : id);
  };

  const filteredRestaurants = restaurants.filter(r => {
    if (activeTab === 'PENDING') return r.status === 'PENDING';
    if (activeTab === 'APPROVED') return r.status === 'APPROVED';
    if (activeTab === 'SUSPENDED') return r.status === 'SUSPENDED';
    if (activeTab === 'REJECTED') return r.status === 'REJECTED';
    return true;
  });

  const getStatusBadge = (status) => {
    switch (status) {
      case 'APPROVED':
        return <span className="px-2.5 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full text-xs font-semibold">Active / Approved</span>;
      case 'PENDING':
        return <span className="px-2.5 py-1 bg-orange-50 text-orange-700 border border-orange-200 rounded-full text-xs font-semibold flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-pulse"></span> Pending</span>;
      case 'REJECTED':
        return <span className="px-2.5 py-1 bg-red-50 text-red-700 border border-red-200 rounded-full text-xs font-semibold">Rejected</span>;
      case 'SUSPENDED':
        return <span className="px-2.5 py-1 bg-gray-100 text-gray-700 border border-gray-300 rounded-full text-xs font-semibold">Suspended</span>;
      default:
        return <span className="px-2.5 py-1 bg-gray-50 text-gray-600 border border-gray-200 rounded-full text-xs font-semibold">{status}</span>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Restaurants & Kitchens</h1>
          <p className="text-gray-500 text-sm mt-1">Manage restaurant applications, onboarding, and partner accounts</p>
        </div>
        <button 
          onClick={fetchRestaurants}
          className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 hover:border-gray-300 text-gray-700 rounded-xl text-sm font-medium shadow-sm transition-all self-start sm:self-auto cursor-pointer"
        >
          <RefreshCw size={16} className={loading ? "animate-spin" : ""} /> Refresh
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl text-sm">
          {error}
        </div>
      )}

      {/* Tabs & Stats */}
      <div className="flex items-center gap-2 border-b border-gray-200 overflow-x-auto pb-1">
        <button
          onClick={() => setActiveTab('ALL')}
          className={`px-4 py-2 text-sm font-medium border-b-2 whitespace-nowrap transition-colors cursor-pointer ${
            activeTab === 'ALL'
              ? 'border-[#d4af37] text-gray-900 font-bold'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          All ({restaurants.length})
        </button>
        <button
          onClick={() => setActiveTab('PENDING')}
          className={`px-4 py-2 text-sm font-medium border-b-2 whitespace-nowrap transition-colors cursor-pointer ${
            activeTab === 'PENDING'
              ? 'border-orange-500 text-orange-600 font-bold'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          Pending ({restaurants.filter(r => r.status === 'PENDING').length})
        </button>
        <button
          onClick={() => setActiveTab('APPROVED')}
          className={`px-4 py-2 text-sm font-medium border-b-2 whitespace-nowrap transition-colors cursor-pointer ${
            activeTab === 'APPROVED'
              ? 'border-emerald-500 text-emerald-600 font-bold'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          Active / Approved ({restaurants.filter(r => r.status === 'APPROVED').length})
        </button>
        <button
          onClick={() => setActiveTab('SUSPENDED')}
          className={`px-4 py-2 text-sm font-medium border-b-2 whitespace-nowrap transition-colors cursor-pointer ${
            activeTab === 'SUSPENDED'
              ? 'border-purple-500 text-purple-600 font-bold'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          Disabled / Suspended ({restaurants.filter(r => r.status === 'SUSPENDED').length})
        </button>
        <button
          onClick={() => setActiveTab('REJECTED')}
          className={`px-4 py-2 text-sm font-medium border-b-2 whitespace-nowrap transition-colors cursor-pointer ${
            activeTab === 'REJECTED'
              ? 'border-red-500 text-red-600 font-bold'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          Rejected ({restaurants.filter(r => r.status === 'REJECTED').length})
        </button>
      </div>

      {/* Table Container */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="flex flex-col items-center justify-center p-12 text-gray-400">
            <Loader2 className="animate-spin text-[#d4af37] mb-2" size={36} />
            <p className="text-sm">Loading restaurant applications...</p>
          </div>
        ) : filteredRestaurants.length === 0 ? (
          <div className="p-12 text-center text-gray-500">
            <Store className="mx-auto text-gray-300 mb-3" size={48} />
            <p className="font-semibold text-gray-700">No restaurants found</p>
            <p className="text-sm text-gray-400 mt-1">There are no records matching the selected tab.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-gray-600">
              <thead className="bg-gray-50 text-gray-700 font-semibold border-b border-gray-100">
                <tr>
                  <th className="px-6 py-4">Restaurant</th>
                  <th className="px-6 py-4">Owner Details</th>
                  <th className="px-6 py-4">City / Address</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredRestaurants.map(restaurant => (
                  <tr key={restaurant._id} className="hover:bg-gray-50/80 transition-colors">
                    {/* Restaurant Info */}
                    <td className="px-6 py-4">
                      <div className="font-bold text-gray-900">{restaurant.restaurantName}</div>
                      <div className="text-xs text-gray-500 mt-0.5">{restaurant.restaurantType} {restaurant.cuisine ? `• ${restaurant.cuisine}` : ''}</div>
                    </td>

                    {/* Owner Details */}
                    <td className="px-6 py-4">
                      <div className="font-medium text-gray-800 flex items-center gap-1.5">
                        {restaurant.ownerName}
                        {restaurant.isPhoneVerified && <span title="Phone Verified" className="text-emerald-600 text-xs font-semibold">✓ Verified</span>}
                      </div>
                      <div className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                        <Phone size={12} className="text-gray-400" /> {restaurant.mobile}
                      </div>
                      {restaurant.email && (
                        <div className="text-xs text-gray-400 flex items-center gap-1 mt-0.5 truncate max-w-[200px]">
                          <Mail size={12} className="text-gray-400" /> {restaurant.email}
                        </div>
                      )}
                    </td>

                    {/* Location */}
                    <td className="px-6 py-4">
                      <div className="font-medium text-gray-800 flex items-center gap-1">
                        <MapPin size={14} className="text-gray-400 shrink-0" /> {restaurant.city}
                      </div>
                      <div className="text-xs text-gray-400 truncate max-w-[220px] mt-0.5">
                        {restaurant.fullAddress} {restaurant.pincode ? `- ${restaurant.pincode}` : ''}
                      </div>
                    </td>

                    {/* Status */}
                    <td className="px-6 py-4">
                      {getStatusBadge(restaurant.status)}
                    </td>

                    {/* Action Dropdown Column with Gear Icon */}
                    <td className="px-6 py-4 text-center relative">
                      <div className="inline-block text-left" ref={activeDropdownId === restaurant._id ? dropdownRef : null}>
                        <button
                          onClick={(e) => toggleDropdown(restaurant._id, e)}
                          className="p-2 text-gray-600 hover:text-[#d4af37] hover:bg-gray-100 rounded-lg transition-colors border border-transparent hover:border-gray-200 cursor-pointer"
                          title="Actions"
                        >
                          <Settings size={20} />
                        </button>

                        {/* Dropdown Menu */}
                        {activeDropdownId === restaurant._id && (
                          <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-100 py-1.5 z-30 animate-fadeIn">
                            {/* View Option */}
                            <button
                              onClick={() => openViewModal(restaurant)}
                              className="w-full text-left px-4 py-2 text-xs font-medium text-gray-700 hover:bg-gray-50 hover:text-blue-600 flex items-center gap-2 transition-colors cursor-pointer"
                            >
                              <Eye size={16} className="text-blue-500" /> View Details
                            </button>

                            {/* Enable / Disable Option */}
                            <button
                              onClick={() => handleToggleEnable(restaurant._id)}
                              className={`w-full text-left px-4 py-2 text-xs font-medium flex items-center gap-2 transition-colors cursor-pointer ${
                                restaurant.status === 'APPROVED'
                                  ? 'text-purple-600 hover:bg-purple-50'
                                  : 'text-emerald-600 hover:bg-emerald-50'
                              }`}
                            >
                              {restaurant.status === 'APPROVED' ? (
                                <>
                                  <ToggleLeft size={16} className="text-purple-500" /> Disable Account
                                </>
                              ) : (
                                <>
                                  <ToggleRight size={16} className="text-emerald-500" /> Enable Account
                                </>
                              )}
                            </button>

                            {/* Approve Option */}
                            {restaurant.status !== 'APPROVED' && (
                              <button
                                onClick={() => handleApprove(restaurant._id)}
                                className="w-full text-left px-4 py-2 text-xs font-medium text-gray-700 hover:bg-emerald-50 hover:text-emerald-600 flex items-center gap-2 transition-colors cursor-pointer"
                              >
                                <CheckCircle2 size={16} className="text-emerald-500" /> Approve Application
                              </button>
                            )}

                            {/* Reject Option */}
                            {restaurant.status !== 'REJECTED' && (
                              <button
                                onClick={() => openRejectModal(restaurant)}
                                className="w-full text-left px-4 py-2 text-xs font-medium text-gray-700 hover:bg-orange-50 hover:text-orange-600 flex items-center gap-2 transition-colors cursor-pointer"
                              >
                                <XCircle size={16} className="text-orange-500" /> Reject Application
                              </button>
                            )}

                            <div className="my-1 border-t border-gray-100"></div>

                            {/* Delete Option */}
                            <button
                              onClick={() => handleDelete(restaurant._id)}
                              className="w-full text-left px-4 py-2 text-xs font-medium text-red-600 hover:bg-red-50 flex items-center gap-2 transition-colors cursor-pointer"
                            >
                              <Trash2 size={16} className="text-red-500" /> Delete Record
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

      {/* Modal (View or Reject) */}
      {isModalOpen && selectedRestaurant && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden animate-fadeIn">
            {/* Modal Header */}
            <div className="p-6 border-b flex justify-between items-center bg-gray-50">
              <div>
                <h2 className="text-xl font-bold text-gray-900">
                  {modalType === 'REJECT' ? 'Reject Restaurant Application' : 'Restaurant Details & Documents'}
                </h2>
                <p className="text-xs text-gray-500 mt-0.5">{selectedRestaurant.restaurantName} ({selectedRestaurant.city})</p>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600 cursor-pointer">
                <X size={20} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-6 custom-scrollbar">
              {/* Status Badge */}
              <div className="flex items-center justify-between bg-gray-50 p-4 rounded-xl border border-gray-100">
                <span className="text-sm font-medium text-gray-600">Current Application Status</span>
                {getStatusBadge(selectedRestaurant.status)}
              </div>

              {/* Owner & Restaurant Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                  <h3 className="font-bold text-gray-900 mb-3 border-b border-gray-200 pb-2">Restaurant Details</h3>
                  <div className="space-y-1.5 text-xs text-gray-600">
                    <p><span className="font-semibold text-gray-700">Name:</span> {selectedRestaurant.restaurantName}</p>
                    <p><span className="font-semibold text-gray-700">Type:</span> {selectedRestaurant.restaurantType}</p>
                    <p><span className="font-semibold text-gray-700">Cuisine:</span> {selectedRestaurant.cuisine || 'N/A'}</p>
                    <p><span className="font-semibold text-gray-700">Hours:</span> {selectedRestaurant.operatingHours?.open || 'N/A'} - {selectedRestaurant.operatingHours?.close || 'N/A'}</p>
                    <p><span className="font-semibold text-gray-700">Address:</span> {selectedRestaurant.fullAddress}, {selectedRestaurant.city} - {selectedRestaurant.pincode}</p>
                  </div>
                </div>

                <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                  <h3 className="font-bold text-gray-900 mb-3 border-b border-gray-200 pb-2">Owner & Bank Info</h3>
                  <div className="space-y-1.5 text-xs text-gray-600">
                    <p><span className="font-semibold text-gray-700">Owner Name:</span> {selectedRestaurant.ownerName}</p>
                    <p><span className="font-semibold text-gray-700">Mobile:</span> {selectedRestaurant.mobile} {selectedRestaurant.isPhoneVerified && '✅ (Verified)'}</p>
                    <p><span className="font-semibold text-gray-700">Email:</span> {selectedRestaurant.email}</p>
                    {selectedRestaurant.bankDetails && (
                      <>
                        <p><span className="font-semibold text-gray-700">Bank Holder:</span> {selectedRestaurant.bankDetails.accountHolderName || 'N/A'}</p>
                        <p><span className="font-semibold text-gray-700">Account No:</span> {selectedRestaurant.bankDetails.accountNumber || 'N/A'}</p>
                        <p><span className="font-semibold text-gray-700">IFSC Code:</span> {selectedRestaurant.bankDetails.ifscCode || 'N/A'}</p>
                        <p><span className="font-semibold text-gray-700">UPI ID:</span> {selectedRestaurant.bankDetails.upiId || 'N/A'}</p>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* R2 Documents Section with Live Image & Video Previews */}
              <div>
                <h3 className="font-bold text-gray-900 mb-3 border-b border-gray-100 pb-2 text-sm">Uploaded Documents (Cloudflare R2)</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  {renderDocCard('PAN Card', selectedRestaurant.documents?.panCard || selectedRestaurant.documents?.businessRegistration, FileText, 'image')}
                  {renderDocCard('Food License (FSSAI)', selectedRestaurant.documents?.foodLicense, FileText, 'image')}
                  {renderDocCard('Owner ID Proof', selectedRestaurant.documents?.idProof, FileText, 'image')}
                  {renderDocCard('Restaurant Image', selectedRestaurant.documents?.restaurantImage, ImageIcon, 'image')}
                  {renderDocCard('Menu Card', selectedRestaurant.documents?.menu, FileText, 'image')}
                  {renderDocCard('Kitchen Video', selectedRestaurant.documents?.kitchenVideo, Video, 'video')}
                </div>
              </div>

              {/* Rejection reason display or input */}
              {selectedRestaurant.status === 'REJECTED' && selectedRestaurant.rejectionReason && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700">
                  <span className="font-bold">Rejection Reason:</span> {selectedRestaurant.rejectionReason}
                </div>
              )}

              {modalType === 'REJECT' && (
                <div className="pt-2">
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Enter Rejection Reason *</label>
                  <textarea 
                    value={rejectReason}
                    onChange={(e) => setRejectReason(e.target.value)}
                    placeholder="E.g., Invalid document, address mismatch..."
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none resize-none"
                    rows="3"
                  ></textarea>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-6 border-t bg-gray-50 flex flex-wrap justify-end gap-3">
              {modalType === 'REJECT' ? (
                <>
                  <button 
                    onClick={() => setIsModalOpen(false)}
                    className="px-5 py-2 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-100 text-sm font-medium transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={() => handleReject(selectedRestaurant._id)}
                    disabled={actionLoading || !rejectReason.trim()}
                    className="flex items-center gap-2 px-6 py-2 bg-red-600 text-white rounded-xl hover:bg-red-700 text-sm font-medium transition-colors disabled:opacity-50 cursor-pointer"
                  >
                    <XCircle size={18} /> {actionLoading ? 'Rejecting...' : 'Confirm Rejection'}
                  </button>
                </>
              ) : (
                <>
                  <button 
                    onClick={() => handleDelete(selectedRestaurant._id)}
                    className="flex items-center gap-1.5 px-4 py-2 text-red-600 hover:bg-red-50 rounded-xl text-sm font-medium transition-colors border border-red-200 mr-auto cursor-pointer"
                  >
                    <Trash2 size={16} /> Delete Record
                  </button>

                  {selectedRestaurant.status !== 'APPROVED' && (
                    <button 
                      onClick={() => handleApprove(selectedRestaurant._id)}
                      disabled={actionLoading}
                      className="flex items-center gap-2 px-5 py-2 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 text-sm font-medium transition-colors disabled:opacity-50 cursor-pointer"
                    >
                      <CheckCircle2 size={18} /> Approve Application
                    </button>
                  )}

                  {selectedRestaurant.status !== 'REJECTED' && (
                    <button 
                      onClick={() => setModalType('REJECT')}
                      className="flex items-center gap-2 px-5 py-2 bg-orange-100 text-orange-700 rounded-xl hover:bg-orange-200 text-sm font-medium transition-colors cursor-pointer"
                    >
                      <XCircle size={18} /> Reject Application
                    </button>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Lightbox Media Preview Modal (No Blur) */}
      {previewMedia && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/80 animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[92vh] flex flex-col overflow-hidden shadow-2xl">
            <div className="p-4 border-b flex justify-between items-center bg-gray-900 text-white">
              <h3 className="font-bold text-sm flex items-center gap-2">
                📄 {previewMedia.title} Preview
              </h3>
              <div className="flex items-center gap-3">
                <a
                  href={previewMedia.url}
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs bg-blue-600 hover:bg-blue-700 px-3 py-1 rounded-lg text-white font-medium transition-colors"
                >
                  Open Original ↗
                </a>
                <button
                  onClick={() => setPreviewMedia(null)}
                  className="text-gray-400 hover:text-white text-xl leading-none px-2 cursor-pointer"
                >
                  ✕
                </button>
              </div>
            </div>
            <div className="p-4 overflow-auto flex items-center justify-center bg-gray-100 min-h-[400px]">
              {previewMedia.type === 'image' && (
                <img
                  src={previewMedia.url}
                  alt={previewMedia.title}
                  className="max-h-[75vh] max-w-full object-contain rounded-lg shadow-md"
                />
              )}
              {previewMedia.type === 'video' && (
                <video
                  src={previewMedia.url}
                  className="max-h-[75vh] max-w-full rounded-lg shadow-md"
                  controls
                  autoPlay
                />
              )}
              {previewMedia.type === 'pdf' && (
                <iframe
                  src={previewMedia.url}
                  title={previewMedia.title}
                  className="w-full h-[75vh] rounded-lg border"
                />
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Restaurants;
