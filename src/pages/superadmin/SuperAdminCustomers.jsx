import React, { useState, useEffect } from 'react';
import { Search, Eye, ToggleRight, ToggleLeft, ShieldAlert, UserSquare2, ShoppingBag, CreditCard, IndianRupee } from 'lucide-react';
import API_BASE_URL from '../../services/apiService';

const SuperAdminCustomers = () => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [customerDetail, setCustomerDetail] = useState(null);
  const [loadingDetail, setLoadingDetail] = useState(false);

  useEffect(() => {
    fetchCustomers();
  }, [search, statusFilter]);

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      const query = new URLSearchParams();
      if (search) query.append('search', search);
      if (statusFilter) query.append('status', statusFilter);

      const response = await fetch(`${API_BASE_URL}/api/super-admin/customers?${query.toString()}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('superadmin_token')}`
        }
      });
      const data = await response.json();
      if (response.ok) {
        setCustomers(data.data || []);
      } else {
        setError(data.message || 'Failed to fetch customers');
      }
    } catch (err) {
      setError('Network error while fetching customers');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (id, currentStatus) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/super-admin/customers/${id}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('superadmin_token')}`
        },
        body: JSON.stringify({ isActive: !currentStatus })
      });
      const data = await response.json();
      if (response.ok) {
        setCustomers(customers.map(c => c._id === id ? { ...c, isActive: !currentStatus } : c));
      } else {
        alert(data.message || 'Failed to update status');
      }
    } catch (err) {
      alert('Network error while updating customer status');
    }
  };

  const openCustomerDetail = async (id) => {
    setSelectedCustomer(id);
    setLoadingDetail(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/super-admin/customers/${id}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('superadmin_token')}`
        }
      });
      const data = await response.json();
      if (response.ok) {
        setCustomerDetail(data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingDetail(false);
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
          <h1 className="text-3xl font-bold text-slate-800">Customer Management</h1>
          <p className="text-slate-400 mt-1">Manage and audit all registered customers on EATOGGY</p>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-xl flex items-center gap-3">
          <ShieldAlert size={20} />
          {error}
        </div>
      )}

      {/* Filters Bar */}
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex flex-col md:flex-row gap-4 justify-between items-center">
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Search by name, mobile, email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-[#d4af37] focus:border-transparent outline-none"
          />
        </div>

        <div className="flex gap-3 w-full md:w-auto">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-[#d4af37] outline-none"
          >
            <option value="">All Statuses</option>
            <option value="ACTIVE">Active Only</option>
            <option value="SUSPENDED">Suspended Only</option>
          </select>
        </div>
      </div>

      {/* Table Section */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-600">
            <thead className="bg-gray-50 border-b border-gray-100 text-gray-400 uppercase text-xs font-semibold">
              <tr>
                <th className="px-6 py-4">Customer</th>
                <th className="px-6 py-4">Mobile</th>
                <th className="px-6 py-4">Email</th>
                <th className="px-6 py-4 text-center">Total Orders</th>
                <th className="px-6 py-4 text-center">Total Spent</th>
                <th className="px-6 py-4 text-center">Status</th>
                <th className="px-6 py-4">Registered Date</th>
                <th className="px-6 py-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                <tr>
                  <td colSpan="8" className="px-6 py-8 text-center text-gray-400">Loading customers...</td>
                </tr>
              ) : customers.length === 0 ? (
                <tr>
                  <td colSpan="8" className="px-6 py-8 text-center text-gray-400">No customers found.</td>
                </tr>
              ) : (
                customers.map((customer) => (
                  <tr key={customer._id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 font-bold text-slate-800 flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-amber-100 text-amber-800 flex items-center justify-center text-xs font-bold">
                        {customer.name ? customer.name[0].toUpperCase() : 'C'}
                      </div>
                      {customer.name || 'Unnamed Customer'}
                    </td>
                    <td className="px-6 py-4 font-medium text-slate-600">
                      {customer.mobile}
                    </td>
                    <td className="px-6 py-4 text-slate-500">
                      {customer.email || 'N/A'}
                    </td>
                    <td className="px-6 py-4 text-center font-bold text-slate-700">
                      {customer.totalOrders}
                    </td>
                    <td className="px-6 py-4 text-center font-bold text-amber-700">
                      ₹{customer.totalSpent?.toLocaleString('en-IN') || 0}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <button
                        onClick={() => handleToggleStatus(customer._id, customer.isActive)}
                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold transition-colors ${
                          customer.isActive !== false 
                            ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200' 
                            : 'bg-red-100 text-red-700 hover:bg-red-200'
                        }`}
                      >
                        {customer.isActive !== false ? <ToggleRight size={14} /> : <ToggleLeft size={14} />}
                        {customer.isActive !== false ? 'Active' : 'Suspended'}
                      </button>
                    </td>
                    <td className="px-6 py-4 text-slate-400 font-medium">
                      {formatDate(customer.createdAt)}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <button
                        onClick={() => openCustomerDetail(customer._id)}
                        className="inline-flex items-center gap-1 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-slate-700 rounded-lg text-xs font-semibold transition-colors"
                      >
                        <Eye size={14} /> View Detail
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Customer Detail Modal */}
      {selectedCustomer && (
        <div className="fixed inset-0 bg-gray-900/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between sticky top-0 bg-white">
              <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <UserSquare2 className="text-amber-500" size={20} /> Customer Details
              </h2>
              <button onClick={() => { setSelectedCustomer(null); setCustomerDetail(null); }} className="text-gray-400 hover:text-gray-600 p-2 text-2xl leading-none">&times;</button>
            </div>

            {loadingDetail || !customerDetail ? (
              <div className="p-8 text-center text-gray-400">Loading details...</div>
            ) : (
              <div className="p-6 space-y-6">
                <div className="bg-amber-50/60 p-4 rounded-xl border border-amber-100 grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <p className="text-xs text-amber-800/60 font-semibold">Name</p>
                    <p className="font-bold text-slate-800">{customerDetail.customer?.name || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-amber-800/60 font-semibold">Mobile</p>
                    <p className="font-bold text-slate-800">{customerDetail.customer?.mobile}</p>
                  </div>
                  <div>
                    <p className="text-xs text-amber-800/60 font-semibold">Email</p>
                    <p className="font-bold text-slate-800">{customerDetail.customer?.email || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-amber-800/60 font-semibold">Status</p>
                    <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-bold ${customerDetail.customer?.isActive !== false ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-700'}`}>
                      {customerDetail.customer?.isActive !== false ? 'Active' : 'Suspended'}
                    </span>
                  </div>
                </div>

                <div>
                  <h3 className="font-bold text-slate-800 text-sm mb-3 flex items-center gap-1.5">
                    <ShoppingBag size={16} className="text-amber-500" /> Recent Orders ({customerDetail.orders?.length || 0})
                  </h3>
                  {customerDetail.orders?.length === 0 ? (
                    <p className="text-xs text-gray-400">No orders placed yet.</p>
                  ) : (
                    <div className="space-y-2">
                      {customerDetail.orders?.map(order => (
                        <div key={order._id} className="p-3 bg-gray-50 rounded-xl border border-gray-100 flex justify-between items-center text-xs">
                          <div>
                            <p className="font-bold text-slate-800">{order.orderNumber} • {order.restaurantId?.name || 'Restaurant'}</p>
                            <p className="text-gray-400">{formatDate(order.createdAt)} • Status: <span className="font-semibold text-slate-700">{order.orderStatus}</span></p>
                          </div>
                          <p className="font-bold text-slate-800 text-sm">₹{order.pricing?.grandTotal}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div>
                  <h3 className="font-bold text-slate-800 text-sm mb-3 flex items-center gap-1.5">
                    <CreditCard size={16} className="text-amber-500" /> Subscriptions ({customerDetail.subscriptions?.length || 0})
                  </h3>
                  {customerDetail.subscriptions?.length === 0 ? (
                    <p className="text-xs text-gray-400">No active subscriptions.</p>
                  ) : (
                    <div className="space-y-2">
                      {customerDetail.subscriptions?.map(sub => (
                        <div key={sub._id} className="p-3 bg-gray-50 rounded-xl border border-gray-100 flex justify-between items-center text-xs">
                          <div>
                            <p className="font-bold text-slate-800">{sub.subscriptionNumber} • {sub.planSnapshot?.name || 'Tiffin Plan'}</p>
                            <p className="text-gray-400">Status: <span className="font-semibold text-amber-700">{sub.status}</span></p>
                          </div>
                          <p className="font-bold text-slate-800 text-sm">₹{sub.pricing?.grandTotal}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default SuperAdminCustomers;
