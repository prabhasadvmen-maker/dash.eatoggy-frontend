import React, { useState, useEffect } from 'react';
import { Settings, ShieldAlert, CheckCircle2, Save, History, Sliders, CreditCard, Truck, Globe } from 'lucide-react';
import API_BASE_URL from '../../services/apiService';

const SuperAdminSettings = () => {
  const [activeTab, setActiveTab] = useState('platform');
  const [settings, setSettings] = useState({
    platformName: 'EATOGGY',
    supportEmail: 'support@eatoggy.com',
    supportPhone: '+91 98765 43210',
    defaultCommissionRate: 15,
    baseDeliveryFee: 40,
    maintenanceMode: false,
    autoAssignDelivery: true,
    razorpayEnabled: true,
    codEnabled: true
  });
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchSettings();
    fetchHistory();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/api/super-admin/settings`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('superadmin_token')}`
        }
      });
      const result = await response.json();
      if (response.ok && result.data) {
        setSettings(result.data);
      } else {
        setError(result.message || 'Failed to fetch settings');
      }
    } catch (err) {
      setError('Network error while fetching settings');
    } finally {
      setLoading(false);
    }
  };

  const fetchHistory = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/super-admin/settings/history`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('superadmin_token')}`
        }
      });
      const result = await response.json();
      if (response.ok && result.data) {
        setHistory(result.data);
      }
    } catch (err) {
      console.error('Error fetching settings history:', err);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setSuccess('');
    setError('');

    try {
      const response = await fetch(`${API_BASE_URL}/api/super-admin/settings`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('superadmin_token')}`
        },
        body: JSON.stringify(settings)
      });
      const result = await response.json();
      if (response.ok) {
        setSettings(result.data);
        setSuccess('Platform settings updated successfully');
        fetchHistory();
      } else {
        setError(result.message || 'Failed to update settings');
      }
    } catch (err) {
      setError('Network error while updating settings');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">Master Platform Settings & Config</h1>
          <p className="text-slate-400 mt-1">Configure global parameters, commission percentages, gateway toggles, and view setting audit history</p>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex border-b border-gray-200 space-x-6 overflow-x-auto" id="settings-tab-bar">
        {[
          { id: 'platform', label: 'Platform & Branding', icon: Globe },
          { id: 'payments', label: 'Payments & Commission', icon: CreditCard },
          { id: 'delivery', label: 'Delivery & Operations', icon: Truck },
          { id: 'history', label: 'Audit History Log', icon: History }
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`pb-3 flex items-center gap-2 text-xs font-bold transition-all border-b-2 whitespace-nowrap ${
                activeTab === tab.id
                  ? 'border-[#d4af37] text-[#a58523]'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
              id={`tab-btn-${tab.id}`}
            >
              <Icon size={16} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-xl flex items-center gap-3" id="settings-error-alert">
          <ShieldAlert size={20} />
          {error}
        </div>
      )}

      {success && (
        <div className="bg-emerald-50 text-emerald-800 p-4 rounded-xl flex items-center gap-3 font-semibold text-xs" id="settings-success-alert">
          <CheckCircle2 size={20} />
          {success}
        </div>
      )}

      {loading ? (
        <div className="p-12 text-center text-slate-400 bg-white rounded-2xl border border-gray-100">
          Loading platform configuration...
        </div>
      ) : activeTab === 'history' ? (
        /* AUDIT HISTORY LOG TABLE */
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm space-y-4">
          <div className="flex justify-between items-center pb-2 border-b border-gray-100">
            <div>
              <h3 className="font-bold text-slate-800 text-sm">Settings Modification Audit Trail</h3>
              <p className="text-xs text-slate-400">Timestamped record of all master platform configuration updates</p>
            </div>
            <span className="text-xs font-bold text-slate-500 bg-slate-100 px-3 py-1 rounded-full">{history.length} Logs</span>
          </div>

          {history.length === 0 ? (
            <div className="p-8 text-center text-slate-400 text-xs">No settings history recorded yet.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50 text-slate-500 font-bold uppercase text-[10px] border-b border-gray-200">
                    <th className="p-3">Setting Key</th>
                    <th className="p-3">Previous Value</th>
                    <th className="p-3">New Value</th>
                    <th className="p-3">Updated By</th>
                    <th className="p-3">Timestamp</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {history.map((log) => (
                    <tr key={log._id} className="hover:bg-slate-50/50">
                      <td className="p-3 font-mono font-bold text-slate-800" id={`history-key-${log._id}`}>{log.settingKey}</td>
                      <td className="p-3 font-mono text-slate-500">{String(log.oldValue ?? 'null')}</td>
                      <td className="p-3 font-mono font-bold text-emerald-700">{String(log.newValue ?? 'null')}</td>
                      <td className="p-3 text-slate-600 font-medium">{log.changedByEmail || 'SuperAdmin'}</td>
                      <td className="p-3 text-slate-400 font-mono text-[11px]">{new Date(log.createdAt).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      ) : (
        /* FORM SETTINGS */
        <form onSubmit={handleSave} className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-gray-100 space-y-6">
          {activeTab === 'platform' && (
            <div className="space-y-6">
              <h3 className="font-bold text-slate-800 text-sm pb-2 border-b border-gray-100">Platform Identity & Contact</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Platform Brand Name</label>
                  <input
                    type="text"
                    value={settings.platformName || ''}
                    onChange={(e) => setSettings({ ...settings, platformName: e.target.value })}
                    required
                    className="w-full p-3 border border-gray-200 rounded-xl text-xs focus:ring-2 focus:ring-[#d4af37] outline-none"
                    id="input-setting-platform-name"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Support Email</label>
                  <input
                    type="email"
                    value={settings.supportEmail || ''}
                    onChange={(e) => setSettings({ ...settings, supportEmail: e.target.value })}
                    required
                    className="w-full p-3 border border-gray-200 rounded-xl text-xs focus:ring-2 focus:ring-[#d4af37] outline-none"
                    id="input-setting-support-email"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Support Contact Phone</label>
                  <input
                    type="text"
                    value={settings.supportPhone || ''}
                    onChange={(e) => setSettings({ ...settings, supportPhone: e.target.value })}
                    required
                    className="w-full p-3 border border-gray-200 rounded-xl text-xs focus:ring-2 focus:ring-[#d4af37] outline-none"
                    id="input-setting-support-phone"
                  />
                </div>
              </div>

              <div className="p-4 bg-red-50/50 border border-red-100 rounded-xl flex items-center justify-between">
                <div>
                  <span className="font-bold text-xs text-red-800 block">Platform Maintenance Mode</span>
                  <span className="text-[11px] text-red-600/80">Temporarily pause new customer checkouts for system maintenance</span>
                </div>
                <input
                  type="checkbox"
                  checked={settings.maintenanceMode || false}
                  onChange={(e) => setSettings({ ...settings, maintenanceMode: e.target.checked })}
                  className="w-5 h-5 accent-red-600 cursor-pointer"
                  id="toggle-setting-maintenance-mode"
                />
              </div>
            </div>
          )}

          {activeTab === 'payments' && (
            <div className="space-y-6">
              <h3 className="font-bold text-slate-800 text-sm pb-2 border-b border-gray-100">Financial Commission & Payment Methods</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Default Platform Commission (%)</label>
                  <input
                    type="number"
                    value={settings.defaultCommissionRate ?? 15}
                    onChange={(e) => setSettings({ ...settings, defaultCommissionRate: Number(e.target.value) })}
                    required
                    min="0"
                    max="100"
                    className="w-full p-3 border border-gray-200 rounded-xl text-xs focus:ring-2 focus:ring-[#d4af37] outline-none"
                    id="input-setting-commission"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Base Delivery Fee (₹)</label>
                  <input
                    type="number"
                    value={settings.baseDeliveryFee ?? 40}
                    onChange={(e) => setSettings({ ...settings, baseDeliveryFee: Number(e.target.value) })}
                    required
                    min="0"
                    className="w-full p-3 border border-gray-200 rounded-xl text-xs focus:ring-2 focus:ring-[#d4af37] outline-none"
                    id="input-setting-delivery-fee"
                  />
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                  <div>
                    <span className="font-bold text-xs text-slate-800 block">Razorpay Online Payment Gateway</span>
                    <span className="text-[11px] text-slate-400">Enable card, UPI, and netbanking online checkout</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.razorpayEnabled ?? true}
                    onChange={(e) => setSettings({ ...settings, razorpayEnabled: e.target.checked })}
                    className="w-5 h-5 accent-[#d4af37] cursor-pointer"
                    id="toggle-setting-razorpay"
                  />
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                  <div>
                    <span className="font-bold text-xs text-slate-800 block">Cash On Delivery (COD)</span>
                    <span className="text-[11px] text-slate-400">Allow cash payment on order arrival</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.codEnabled ?? true}
                    onChange={(e) => setSettings({ ...settings, codEnabled: e.target.checked })}
                    className="w-5 h-5 accent-[#d4af37] cursor-pointer"
                    id="toggle-setting-cod"
                  />
                </div>
              </div>
            </div>
          )}

          {activeTab === 'delivery' && (
            <div className="space-y-6">
              <h3 className="font-bold text-slate-800 text-sm pb-2 border-b border-gray-100">Delivery Assignment Engine Controls</h3>
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                <div>
                  <span className="font-bold text-xs text-slate-800 block">Auto-Assign Delivery Rider Engine</span>
                  <span className="text-[11px] text-slate-400">Automatically broadcast ready orders to nearest available rider</span>
                </div>
                <input
                  type="checkbox"
                  checked={settings.autoAssignDelivery ?? true}
                  onChange={(e) => setSettings({ ...settings, autoAssignDelivery: e.target.checked })}
                  className="w-5 h-5 accent-[#d4af37] cursor-pointer"
                  id="toggle-setting-auto-assign"
                />
              </div>
            </div>
          )}

          <div className="pt-4 flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-3 bg-[#d4af37] hover:bg-[#c5a028] text-slate-900 font-bold text-xs rounded-xl flex items-center gap-2 shadow-md disabled:opacity-50"
              id="btn-save-settings"
            >
              <Save size={16} /> {saving ? 'Saving...' : 'Save Configuration'}
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

export default SuperAdminSettings;
