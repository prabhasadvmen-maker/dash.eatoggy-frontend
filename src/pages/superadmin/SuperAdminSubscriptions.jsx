import React, { useState, useEffect, useCallback } from 'react';
import { CreditCard, ShieldAlert, Store, UserSquare2, Ban, Eye } from 'lucide-react';
import API_BASE_URL from '../../services/apiService';
import DataTable from '../../components/common/Table/DataTable';
import { useDataTableSync } from '../../hooks/useDataTableSync';

const SuperAdminSubscriptions = () => {
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

  const [subscriptions, setSubscriptions] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [selectedSub, setSelectedSub] = useState(null);
  const [subDetail, setSubDetail] = useState(null);
  const [loadingDetail, setLoadingDetail] = useState(false);

  const fetchSubscriptions = useCallback(async () => {
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

      const response = await fetch(`${API_BASE_URL}/api/super-admin/subscriptions?${queryParams.toString()}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('superadmin_token')}`
        }
      });
      const data = await response.json();
      
      if (response.ok) {
        setSubscriptions(data.data || []);
        if (data.meta && data.meta.pagination) {
          setTotal(data.meta.pagination.total);
        } else if (data.pagination) {
          setTotal(data.pagination.total);
        } else {
          setTotal(data.data?.length || 0);
        }
      } else {
        setError(data.message || 'Failed to fetch subscriptions');
      }
    } catch (err) {
      setError('Network error while fetching subscriptions');
    } finally {
      setLoading(false);
    }
  }, [page, limit, search, sortBy, sortOrder, filters]);

  useEffect(() => {
    fetchSubscriptions();
  }, [fetchSubscriptions]);

  const handleCancelSubscription = async (id) => {
    if (!window.confirm('Are you sure you want to cancel this subscription as Admin?')) return;
    try {
      const response = await fetch(`${API_BASE_URL}/api/super-admin/subscriptions/${id}/cancel`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('superadmin_token')}`
        }
      });
      const data = await response.json();
      if (response.ok) {
        setSubscriptions(subscriptions.map(s => s._id === id ? { ...s, status: 'CANCELLED' } : s));
        if (subDetail) setSubDetail({ ...subDetail, subscription: { ...subDetail.subscription, status: 'CANCELLED' } });
      } else {
        alert(data.message || 'Failed to cancel subscription');
      }
    } catch (err) {
      alert('Network error while cancelling subscription');
    }
  };

  const openSubDetail = async (id) => {
    setSelectedSub(id);
    setLoadingDetail(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/super-admin/subscriptions/${id}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('superadmin_token')}`
        }
      });
      const data = await response.json();
      if (response.ok) {
        setSubDetail(data.data);
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

  const getStatusBadge = (status) => {
    const styles = {
      ACTIVE: 'bg-emerald-100 text-emerald-800',
      PAUSED: 'bg-amber-100 text-amber-800',
      PENDING_PAYMENT: 'bg-blue-100 text-blue-800',
      EXPIRED: 'bg-gray-100 text-gray-800',
      CANCELLED: 'bg-red-100 text-red-800'
    };
    return (
      <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${styles[status] || 'bg-gray-100 text-gray-700'}`}>
        {status}
      </span>
    );
  };

  const columns = [
    {
      key: 'subscriptionNumber',
      label: 'Subscription #',
      sortable: true,
      render: (row) => <span className="font-bold text-slate-800">{row.subscriptionNumber}</span>
    },
    {
      key: 'customerId',
      label: 'Customer',
      sortable: false,
      render: (row) => (
        <div>
          <div className="font-medium text-slate-700">{row.customerId?.name || 'Customer'}</div>
          <div className="text-xs text-slate-400">{row.customerId?.mobile}</div>
        </div>
      )
    },
    {
      key: 'planId',
      label: 'Restaurant & Plan',
      sortable: false,
      render: (row) => (
        <div>
          <div className="font-medium text-slate-700">{row.planSnapshot?.name || 'Tiffin Plan'}</div>
          <div className="text-xs text-slate-400">{row.restaurantId?.name}</div>
        </div>
      )
    },
    {
      key: 'completedOccurrencesCount',
      label: 'Completed',
      sortable: false, // Could be sortable if we allow sorting by virtual or numeric
      align: 'center',
      render: (row) => <span className="font-bold text-slate-700">{row.completedOccurrencesCount} / {row.totalOccurrences}</span>
    },
    {
      key: 'status',
      label: 'Status',
      sortable: true,
      align: 'center',
      render: (row) => getStatusBadge(row.status)
    },
    {
      key: 'pricing.grandTotal',
      label: 'Total Price',
      sortable: true,
      align: 'center',
      render: (row) => <span className="font-bold text-slate-800">₹{row.pricing?.grandTotal || 0}</span>
    },
    {
      key: 'startDate',
      label: 'Start Date',
      sortable: true,
      render: (row) => <span className="text-slate-400 font-medium whitespace-nowrap">{formatDate(row.startDate)}</span>
    },
    {
      key: 'actions',
      label: 'Actions',
      align: 'right',
      render: (row) => (
        <div className="flex items-center justify-end gap-2">
          <button
            onClick={() => openSubDetail(row._id)}
            className="inline-flex items-center gap-1 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-slate-700 rounded-lg text-xs font-semibold transition-colors cursor-pointer"
          >
            <Eye size={14} /> View
          </button>

          {row.status === 'ACTIVE' && (
            <button
              onClick={() => handleCancelSubscription(row._id)}
              className="inline-flex items-center gap-1 px-3 py-1.5 bg-red-100 hover:bg-red-200 text-red-700 rounded-lg text-xs font-semibold transition-colors cursor-pointer"
            >
              <Ban size={14} /> Cancel
            </button>
          )}
        </div>
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
        { label: 'Paused', value: 'PAUSED' },
        { label: 'Pending Payment', value: 'PENDING_PAYMENT' },
        { label: 'Cancelled', value: 'CANCELLED' },
        { label: 'Expired', value: 'EXPIRED' }
      ]
    }
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">Master Subscriptions Management</h1>
          <p className="text-slate-400 mt-1">Global view of all recurring tiffin subscriptions across EATOGGY</p>
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
        data={subscriptions}
        loading={loading}
        emptyMessage="No subscriptions found matching your criteria."
        
        search={{ value: search, placeholder: 'Search subscription number...' }}
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

      {/* Subscription Detail Modal */}
      {selectedSub && (
        <div className="fixed inset-0 bg-gray-900/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto animate-fadeIn">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between sticky top-0 bg-white">
              <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <CreditCard className="text-amber-500" size={20} /> Subscription ({subDetail?.subscription?.subscriptionNumber})
              </h2>
              <button onClick={() => { setSelectedSub(null); setSubDetail(null); }} className="text-gray-400 hover:text-gray-600 p-2 text-2xl leading-none cursor-pointer">&times;</button>
            </div>

            {loadingDetail || !subDetail ? (
              <div className="p-8 text-center text-gray-400">Loading details...</div>
            ) : (
              <div className="p-6 space-y-6">
                <div className="bg-amber-50/60 p-4 rounded-xl border border-amber-100 flex justify-between items-center">
                  <div>
                    <p className="text-xs text-amber-800/60 font-semibold">Plan</p>
                    <p className="font-bold text-slate-800 text-lg">{subDetail.subscription?.planSnapshot?.name}</p>
                    <p className="text-xs text-slate-600">{subDetail.subscription?.restaurantId?.name}</p>
                  </div>
                  <div>
                    {getStatusBadge(subDetail.subscription?.status)}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 text-xs">
                  <div className="p-3 bg-gray-50 rounded-xl border border-gray-100">
                    <p className="text-gray-400 font-bold mb-1">Customer</p>
                    <p className="font-bold text-slate-800">{subDetail.subscription?.customerId?.name}</p>
                    <p className="text-slate-500">{subDetail.subscription?.customerId?.mobile}</p>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-xl border border-gray-100">
                    <p className="text-gray-400 font-bold mb-1">Duration & Price</p>
                    <p className="font-bold text-slate-800">{formatDate(subDetail.subscription?.startDate)} – {formatDate(subDetail.subscription?.endDate)}</p>
                    <p className="font-bold text-amber-700 text-sm">₹{subDetail.subscription?.pricing?.grandTotal}</p>
                  </div>
                </div>

                {/* Occurrence History */}
                <div>
                  <h3 className="font-bold text-slate-800 text-sm mb-3">Daily Occurrences Timeline ({subDetail.occurrences?.length || 0})</h3>
                  <div className="space-y-2 max-h-48 overflow-y-auto pr-2">
                    {subDetail.occurrences?.map((occ, idx) => (
                      <div key={idx} className="p-3 bg-gray-50 rounded-xl border border-gray-100 flex justify-between items-center text-xs">
                        <div>
                          <span className="font-bold text-slate-800">{formatDate(occ.scheduledDate)}</span>
                          {occ.orderId && <span className="text-gray-400 ml-2">Order #{occ.orderId?.orderNumber}</span>}
                        </div>
                        <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${occ.status === 'GENERATED' ? 'bg-emerald-100 text-emerald-800' : 'bg-gray-100 text-gray-700'}`}>
                          {occ.status}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default SuperAdminSubscriptions;
