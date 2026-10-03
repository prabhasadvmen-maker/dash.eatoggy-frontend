import React, { useState } from 'react';
import { Card, Button, Input } from '../common';
import { updatePartnerProfile } from '../../services/delivery/deliveryOrderService';
import { User, Phone, Mail, Truck, CreditCard, Bell, Shield, HelpCircle, LogOut, ChevronRight } from 'lucide-react';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';

const ProfileTab = ({ partner, setPartner }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    email: partner?.email || '',
    emergencyContact: partner?.emergencyContact || ''
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('delivery_token');
    localStorage.removeItem('deliveryToken');
    toast.success('Logged out successfully');
    navigate('/delivery/login');
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      const res = await updatePartnerProfile(formData);
      if (res.success) {
        toast.success('Profile updated');
        setPartner({ ...partner, ...formData });
        setIsEditing(false);
      } else {
        toast.error(res.message || 'Failed to update profile');
      }
    } catch (error) {
      toast.error('An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn pb-6">
      {/* Profile Header Card */}
      <Card className="p-6 text-center relative overflow-hidden border-t-4 border-t-[#d4af37]">
        <div className="absolute top-0 left-0 w-full h-24 bg-gradient-to-r from-slate-100 to-amber-50"></div>
        <div className="relative z-10">
          <div className="w-24 h-24 mx-auto bg-[#d4af37] rounded-full flex items-center justify-center text-white text-3xl font-bold border-4 border-white shadow-md mb-4">
            {partner?.fullName?.charAt(0) || 'D'}
          </div>
          <h2 className="text-2xl font-bold text-slate-800">{partner?.fullName || 'Delivery Partner'}</h2>
          <p className="text-slate-500 font-medium">Partner ID: #{partner?._id?.substring(0, 6).toUpperCase() || 'DP0001'}</p>
          <div className="mt-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
            Active
          </div>
        </div>
      </Card>

      {/* Personal Information */}
      <Card className="p-0 overflow-hidden">
        <div className="bg-slate-50 px-5 py-4 border-b border-slate-200 flex justify-between items-center">
          <h3 className="font-bold text-slate-800 flex items-center">
            <User size={18} className="mr-2 text-slate-500" /> Personal Info
          </h3>
          <Button 
            variant="outline" 
            size="sm" 
            className="text-xs py-1 h-auto"
            onClick={() => isEditing ? handleSave() : setIsEditing(true)}
            loading={loading}
          >
            {isEditing ? 'Save Changes' : 'Edit'}
          </Button>
        </div>
        <div className="p-5 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-slate-500 font-semibold mb-1 uppercase tracking-wide">Mobile Number</p>
              <div className="flex items-center text-slate-800 bg-slate-50 p-2 rounded border border-slate-100">
                <Phone size={16} className="mr-2 text-slate-400" /> +91 {partner?.mobile || '----------'}
              </div>
            </div>
            
            <div>
              <p className="text-xs text-slate-500 font-semibold mb-1 uppercase tracking-wide">Email Address</p>
              {isEditing ? (
                <div className="flex items-center">
                  <Mail size={16} className="mr-2 text-slate-400" />
                  <input 
                    type="email" 
                    value={formData.email} 
                    onChange={e => setFormData({...formData, email: e.target.value})}
                    className="w-full text-sm border-b border-slate-300 focus:border-[#d4af37] outline-none py-1"
                  />
                </div>
              ) : (
                <div className="flex items-center text-slate-800 bg-slate-50 p-2 rounded border border-slate-100">
                  <Mail size={16} className="mr-2 text-slate-400" /> {partner?.email || 'Not provided'}
                </div>
              )}
            </div>
          </div>
        </div>
      </Card>

      {/* Vehicle Details */}
      <Card className="p-0 overflow-hidden">
        <div className="bg-slate-50 px-5 py-4 border-b border-slate-200">
          <h3 className="font-bold text-slate-800 flex items-center">
            <Truck size={18} className="mr-2 text-slate-500" /> Vehicle Details
          </h3>
        </div>
        <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="flex items-center">
            <div className="bg-amber-50 p-3 rounded-full mr-4 text-[#d4af37]">
              <Truck size={24} />
            </div>
            <div>
              <p className="text-xs text-slate-500 uppercase tracking-wide font-semibold">Vehicle Type</p>
              <p className="font-bold text-slate-800">{partner?.vehicleType || 'Two Wheeler'}</p>
            </div>
          </div>
          <div className="flex items-center">
            <div className="bg-slate-100 p-3 rounded-full mr-4 text-slate-600">
              <CreditCard size={24} />
            </div>
            <div>
              <p className="text-xs text-slate-500 uppercase tracking-wide font-semibold">Vehicle Number</p>
              <p className="font-bold text-slate-800">{partner?.vehicleNumber || 'Not provided'}</p>
            </div>
          </div>
        </div>
      </Card>

      {/* Settings Menu */}
      <Card className="p-0 overflow-hidden">
        <div className="divide-y divide-slate-100">
          <button className="w-full px-5 py-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
            <div className="flex items-center text-slate-700">
              <Bell size={20} className="mr-3 text-slate-400" />
              <span className="font-medium">Notification Preferences</span>
            </div>
            <ChevronRight size={20} className="text-slate-400" />
          </button>
          
          <button className="w-full px-5 py-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
            <div className="flex items-center text-slate-700">
              <Shield size={20} className="mr-3 text-slate-400" />
              <span className="font-medium">Account Security</span>
            </div>
            <ChevronRight size={20} className="text-slate-400" />
          </button>
          
          <button className="w-full px-5 py-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
            <div className="flex items-center text-slate-700">
              <HelpCircle size={20} className="mr-3 text-slate-400" />
              <span className="font-medium">Help & Support</span>
            </div>
            <ChevronRight size={20} className="text-slate-400" />
          </button>
        </div>
      </Card>

      {/* Logout */}
      <Button 
        variant="outline" 
        fullWidth 
        className="py-4 border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300"
        onClick={handleLogout}
      >
        <LogOut className="mr-2" /> Sign Out
      </Button>
    </div>
  );
};

export default ProfileTab;
