import React, { useState, useEffect, useCallback } from 'react';
import { Eye, ToggleRight, ToggleLeft, ShieldAlert, UserSquare2, ShoppingBag, CreditCard, Settings } from 'lucide-react';
import API_BASE_URL from '../../services/apiService';
import DataTable from '../../components/common/Table/DataTable';
import { useDataTableSync } from '../../hooks/useDataTableSync';

const ActionDropdown = ({ row, onView }) => {
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
            onClick={() => { setOpen(false); onView(row._id); }}
            className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2 transition-colors cursor-pointer"
          >
            <Eye size={14} className="text-gray-500" />
            View
          </button>
        </div>
      )}
    </div>
  );
};

const AdminUsers = () => {
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

  const [customers, setCustomers] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [customerDetail, setCustomerDetail] = useState(null);
  const [loadingDetail, setLoadingDetail] = useState(false);

  const fetchCustomers = useCallback(async () => {
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

      const response = await fetch(`${API_BASE_URL}/api/admins/customers?${queryParams.toString()}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('admin_token')}`
        }
      });
      const data = await response.json();
      
      if (response.ok) {
        setCustomers(data.data || []);
        if (data.meta && data.meta.pagination) {
          setTotal(data.meta.pagination.total);
        } else if (data.pagination) { // old format fallback
          setTotal(data.pagination.total);
        } else {
          setTotal(data.data?.length || 0);
        }
      } else {
        setError(data.message || 'Failed to fetch customers');
      }
    } catch (err) {
      setError('Network error while fetching customers');
    } finally {
      setLoading(false);
    }
  }, [page, limit, search, sortBy, sortOrder, filters]);

  useEffect(() => {
    fetchCustomers();
  }, [fetchCustomers]);

  const handleToggleStatus = async (id, currentStatus) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/admins/customers/${id}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('admin_token')}`
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
      const response = await fetch(`${API_BASE_URL}/api/admins/customers/${id}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('admin_token')}`
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
      key: 'name',
      label: 'Customer',
      sortable: true,
      className: 'px-2 py-3',
      headerClassName: 'px-2 py-3',
      render: (row) => (
        <div className="flex items-center gap-2 font-bold text-slate-800">
          <div className="w-8 h-8 rounded-full bg-amber-100 text-amber-800 flex items-center justify-center text-xs font-bold shrink-0">
            {row.name ? row.name[0].toUpperCase() : 'C'}
          </div>
          {row.name || 'Unnamed Customer'}
        </div>
      )
    },
    {
      key: 'mobile',
      label: 'Mobile',
      sortable: true,
      className: 'px-2 py-3',
      headerClassName: 'px-2 py-3',
      render: (row) => <span className="font-medium text-slate-600">{row.mobile}</span>
    },
    {
      key: 'email',
      label: 'Email',
      sortable: true,
      className: 'px-2 py-3',
      headerClassName: 'px-2 py-3',
      render: (row) => <span className="text-slate-500">{row.email || 'N/A'}</span>
    },
    {
      key: 'totalOrders',
      label: 'Total Orders',
      sortable: false,
      align: 'center',
      className: 'px-2 py-3',
      headerClassName: 'px-2 py-3',
      render: (row) => <span className="font-bold text-slate-700">{row.totalOrders}</span>
    },
    {
      key: 'totalSpent',
      label: 'Total Spent',
      sortable: false,
      align: 'center',
      className: 'px-2 py-3',
      headerClassName: 'px-2 py-3',
      render: (row) => <span className="font-bold text-amber-700">₹{row.totalSpent?.toLocaleString('en-IN') || 0}</span>
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
          onClick={() => handleToggleStatus(row._id, row.isActive)}
          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold transition-colors cursor-pointer ${
            row.isActive !== false 
              ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200' 
              : 'bg-red-100 text-red-700 hover:bg-red-200'
          }`}
        >
          {row.isActive !== false ? <ToggleRight size={14} /> : <ToggleLeft size={14} />}
          {row.isActive !== false ? 'Active' : 'Suspended'}
        </button>
      )
    },
    {
      key: 'createdAt',
      label: 'Registered Date',
      sortable: true,
      className: 'px-2 py-3',
      headerClassName: 'px-2 py-3',
      render: (row) => <span className="text-slate-400 font-medium text-xs">{formatDate(row.createdAt)}</span>
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
          onView={(id) => openCustomerDetail(id)} 
        />
      )
    }
  ];

  const filterConfig = [
    {
      key: 'status',
      label: 'Status',
      type: 'select',
      options: [
        { label: 'Active', value: 'ACTIVE' },
        { label: 'Suspended', value: 'SUSPENDED' }
      ]
    }
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
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

      <DataTable
        columns={columns}
        data={customers}
        loading={loading}
        emptyMessage="No customers found matching your criteria."
        
        search={{ value: search, placeholder: 'Search by name, mobile, email...' }}
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

      {/* Customer Detail Modal */}
      {selectedCustomer && (
        <div className="fixed inset-0 bg-gray-900/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto animate-fadeIn">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between sticky top-0 bg-white">
              <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <UserSquare2 className="text-amber-500" size={20} /> Customer Details
              </h2>
              <button onClick={() => { setSelectedCustomer(null); setCustomerDetail(null); }} className="text-gray-400 hover:text-gray-600 p-2 text-2xl leading-none cursor-pointer">&times;</button>
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

export default AdminUsers;
