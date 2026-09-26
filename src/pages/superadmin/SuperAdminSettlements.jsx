import React, { useState, useEffect, useCallback } from 'react';
import { Landmark, ShieldAlert, Plus, X, AlertCircle, Eye, Settings, CheckCircle, XCircle, RefreshCw } from 'lucide-react';
import API_BASE_URL from '../../services/apiService';
import DataTable from '../../components/common/Table/DataTable';
import { useDataTableSync } from '../../hooks/useDataTableSync';
const ActionDropdown = ({ row, onProcess, onMarkPaid, onMarkFailed, onViewDetail, processing }) => {
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
        <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-100 z-10 py-1 overflow-hidden">
          <button
            onClick={() => { setOpen(false); onViewDetail(row._id); }}
            className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2 transition-colors"
          >
            <Eye size={14} className="text-gray-500" />
            View Details
          </button>
          
          {row.status === 'PENDING' && (
            <button
              onClick={() => { setOpen(false); onProcess(row._id); }}
              disabled={processing}
              className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2 transition-colors disabled:opacity-50"
            >
              <RefreshCw size={14} className="text-blue-500" />
              Process
            </button>
          )}

          {(row.status === 'PENDING' || row.status === 'PROCESSING') && (
            <button
              onClick={() => { setOpen(false); onMarkPaid(row); }}
              disabled={processing}
              className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2 transition-colors disabled:opacity-50"
            >
              <CheckCircle size={14} className="text-emerald-500" />
              Mark Paid
            </button>
          )}

          {row.status === 'PROCESSING' && (
            <div className="h-[1px] bg-gray-100 my-1"></div>
          )}
          {row.status === 'PROCESSING' && (
            <button
              onClick={() => { setOpen(false); onMarkFailed(row); }}
              disabled={processing}
              className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2 transition-colors disabled:opacity-50"
            >
              <XCircle size={14} className="text-red-500" />
              Mark Failed
            </button>
          )}
        </div>
      )}
    </div>
  );
};

const SuperAdminSettlements = () => {
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

  const [settlements, setSettlements] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Generation Modal state
  const [genModalOpen, setGenModalOpen] = useState(false);
  const [genEntityType, setGenEntityType] = useState('RESTAURANT');
  const [restaurants, setRestaurants] = useState([]);
  const [deliveryPartners, setDeliveryPartners] = useState([]);
  const [selectedPartnerId, setSelectedPartnerId] = useState('');
  const [periodStart, setPeriodStart] = useState('');
  const [periodEnd, setPeriodEnd] = useState('');
  const [commissionRate, setCommissionRate] = useState(15);
  const [genLoading, setGenLoading] = useState(false);

  // Payout / Process / Fail Modals state
  const [payoutModal, setPayoutModal] = useState({ open: false, settlement: null, ref: '', notes: '' });
  const [failModal, setFailModal] = useState({ open: false, settlement: null, reason: '', notes: '' });
  const [detailModal, setDetailModal] = useState({ open: false, settlement: null, loading: false });
  const [processing, setProcessing] = useState(false);

  const fetchSettlements = useCallback(async () => {
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

      const response = await fetch(`${API_BASE_URL}/api/super-admin/settlements?${queryParams.toString()}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('superadmin_token')}`
        }
      });
      const data = await response.json();
      
      if (response.ok) {
        setSettlements(data.data || []);
        if (data.meta && data.meta.pagination) {
          setTotal(data.meta.pagination.total);
        } else if (data.pagination) {
          setTotal(data.pagination.total);
        } else {
          setTotal(data.data?.length || 0);
        }
      } else {
        setError(data.message || 'Failed to fetch settlements');
      }
    } catch (err) {
      setError('Network error while fetching settlements');
    } finally {
      setLoading(false);
    }
  }, [page, limit, search, sortBy, sortOrder, filters]);

  const fetchPartners = useCallback(async () => {
    try {
      const token = localStorage.getItem('superadmin_token');
      const [restRes, delRes] = await Promise.all([
        fetch(`${API_BASE_URL}/api/admins/restaurants`, { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch(`${API_BASE_URL}/api/admins/delivery-partners`, { headers: { 'Authorization': `Bearer ${token}` } })
      ]);

      if (restRes.ok) {
        const restData = await restRes.json();
        setRestaurants(Array.isArray(restData) ? restData : restData.data || []);
      }
      if (delRes.ok) {
        const delData = await delRes.json();
        setDeliveryPartners(Array.isArray(delData) ? delData : delData.data || []);
      }
    } catch (err) {
      console.error('Failed to load partners for settlement generation:', err);
    }
  }, []);

  useEffect(() => {
    fetchSettlements();
  }, [fetchSettlements]);

  useEffect(() => {
    fetchPartners();
  }, [fetchPartners]);

  const handleGenerateSettlement = async (e) => {
    e.preventDefault();
    if (!selectedPartnerId || !periodStart || !periodEnd) {
      alert('Please fill in all required fields');
      return;
    }

    setGenLoading(true);
    try {
      const body = {
        entityType: genEntityType,
        periodStart,
        periodEnd,
        commissionRate: Number(commissionRate)
      };

      if (genEntityType === 'RESTAURANT') {
        body.restaurantId = selectedPartnerId;
      } else {
        body.deliveryPartnerId = selectedPartnerId;
      }

      const response = await fetch(`${API_BASE_URL}/api/super-admin/settlements/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('superadmin_token')}`
        },
        body: JSON.stringify(body)
      });

      const data = await response.json();
      if (response.ok) {
        alert('Settlement statement generated successfully!');
        setGenModalOpen(false);
        setSelectedPartnerId('');
        fetchSettlements();
      } else {
        alert(data.message || 'Failed to generate settlement');
      }
    } catch (err) {
      alert('Network error while generating settlement');
    } finally {
      setGenLoading(false);
    }
  };

  const handleProcessSettlement = async (settlementId) => {
    try {
      setProcessing(true);
      const response = await fetch(`${API_BASE_URL}/api/super-admin/settlements/${settlementId}/process`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('superadmin_token')}`
        }
      });
      const data = await response.json();
      if (response.ok) {
        setSettlements(settlements.map(s => s._id === settlementId ? { ...s, status: 'PROCESSING' } : s));
      } else {
        alert(data.message || 'Failed to process settlement');
      }
    } catch (err) {
      alert('Network error while processing settlement');
    } finally {
      setProcessing(false);
    }
  };

  const handleMarkPaid = async (e) => {
    e.preventDefault();
    if (!payoutModal.settlement) return;
    setProcessing(true);

    try {
      const response = await fetch(`${API_BASE_URL}/api/super-admin/settlements/${payoutModal.settlement._id}/paid`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('superadmin_token')}`
        },
        body: JSON.stringify({
          transactionReference: payoutModal.ref,
          notes: payoutModal.notes
        })
      });
      const data = await response.json();
      if (response.ok) {
        setSettlements(settlements.map(s => s._id === payoutModal.settlement._id ? { ...s, status: 'PAID', transactionReference: payoutModal.ref } : s));
        setPayoutModal({ open: false, settlement: null, ref: '', notes: '' });
      } else {
        alert(data.message || 'Failed to mark settlement paid');
      }
    } catch (err) {
      alert('Network error while processing payout');
    } finally {
      setProcessing(false);
    }
  };

  const handleMarkFailed = async (e) => {
    e.preventDefault();
    if (!failModal.settlement) return;
    setProcessing(true);

    try {
      const response = await fetch(`${API_BASE_URL}/api/super-admin/settlements/${failModal.settlement._id}/failed`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('superadmin_token')}`
        },
        body: JSON.stringify({
          failureReason: failModal.reason,
          notes: failModal.notes
        })
      });
      const data = await response.json();
      if (response.ok) {
        setSettlements(settlements.map(s => s._id === failModal.settlement._id ? { ...s, status: 'FAILED', failureReason: failModal.reason } : s));
        setFailModal({ open: false, settlement: null, reason: '', notes: '' });
      } else {
        alert(data.message || 'Failed to update settlement status');
      }
    } catch (err) {
      alert('Network error while marking failed');
    } finally {
      setProcessing(false);
    }
  };

  const handleOpenDetail = async (settlementId) => {
    setDetailModal({ open: true, settlement: null, loading: true });
    try {
      const response = await fetch(`${API_BASE_URL}/api/super-admin/settlements/${settlementId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('superadmin_token')}`
        }
      });
      const data = await response.json();
      if (response.ok) {
        setDetailModal({ open: true, settlement: data.data, loading: false });
      } else {
        alert(data.message || 'Failed to load details');
        setDetailModal({ open: false, settlement: null, loading: false });
      }
    } catch (err) {
      alert('Network error loading details');
      setDetailModal({ open: false, settlement: null, loading: false });
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: '2-digit' });
  };

  const getStatusBadge = (status) => {
    const styles = {
      PAID: 'bg-emerald-100 text-emerald-800 border-emerald-200',
      PENDING: 'bg-amber-100 text-amber-800 border-amber-200',
      PROCESSING: 'bg-blue-100 text-blue-800 border-blue-200',
      FAILED: 'bg-red-100 text-red-800 border-red-200'
    };
    return (
      <span className={`px-2.5 py-1 rounded-full text-xs font-bold border ${styles[status] || 'bg-gray-100 text-gray-700'}`}>
        {status}
      </span>
    );
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
      key: 'settlementNumber',
      label: 'Settlement #',
      sortable: false,
      className: 'px-2 py-3',
      headerClassName: 'px-2 py-3',
      render: (row) => (
        <span className="font-bold text-slate-800 font-mono text-xs whitespace-nowrap truncate max-w-[120px] inline-block" title={row.settlementNumber}>
          {row.settlementNumber}
        </span>
      )
    },
    {
      key: 'partnerName',
      label: 'Partner Name',
      sortable: false,
      className: 'px-2 py-3',
      headerClassName: 'px-2 py-3',
      render: (row) => (
        <div className="whitespace-nowrap">
          <div className="font-medium text-slate-700 truncate max-w-[150px]" title={row.entityType === 'RESTAURANT' ? row.restaurantId?.restaurantName || row.restaurantId?.name || 'Restaurant' : row.deliveryPartnerId?.fullName || 'Rider'}>
            {row.entityType === 'RESTAURANT' ? row.restaurantId?.restaurantName || row.restaurantId?.name || 'Restaurant' : row.deliveryPartnerId?.fullName || 'Rider'}
          </div>
          <div className="text-[10px] text-gray-400 font-semibold">{row.entityType}</div>
        </div>
      )
    },
    {
      key: 'period',
      label: 'Period',
      sortable: false,
      className: 'px-2 py-3',
      headerClassName: 'px-2 py-3',
      render: (row) => (
        <span className="text-slate-500 font-medium whitespace-nowrap text-xs">
          {formatDate(row.periodStart)} – {formatDate(row.periodEnd)}
        </span>
      )
    },
    {
      key: 'totalOrdersCount',
      label: 'Orders',
      sortable: false,
      align: 'center',
      className: 'px-2 py-3',
      headerClassName: 'px-2 py-3',
      render: (row) => <span className="font-bold text-slate-700">{row.totalOrdersCount}</span>
    },
    {
      key: 'grossEarnings',
      label: 'Gross',
      sortable: false,
      align: 'center',
      className: 'px-2 py-3',
      headerClassName: 'px-2 py-3',
      render: (row) => <span className="font-bold text-slate-800">₹{row.grossEarnings}</span>
    },
    {
      key: 'deductions',
      label: 'Comm. / Tax',
      sortable: false,
      align: 'center',
      className: 'px-2 py-3',
      headerClassName: 'px-2 py-3',
      render: (row) => (
        <span className="font-semibold text-red-600 text-xs whitespace-nowrap">
          -₹{(row.platformCommissionDeduction || 0) + (row.taxDeduction || 0) + (row.refundDeduction || 0)}
        </span>
      )
    },
    {
      key: 'netPayoutAmount',
      label: 'Net Payout',
      sortable: true,
      align: 'center',
      className: 'px-2 py-3',
      headerClassName: 'px-2 py-3',
      render: (row) => <span className="font-bold text-emerald-700 text-base whitespace-nowrap">₹{row.netPayoutAmount}</span>
    },
    {
      key: 'status',
      label: 'Status',
      sortable: true,
      align: 'center',
      className: 'px-2 py-3',
      headerClassName: 'px-2 py-3',
      render: (row) => getStatusBadge(row.status)
    },
    {
      key: 'actions',
      label: 'Action',
      align: 'right',
      className: 'px-2 py-3',
      headerClassName: 'px-2 py-3',
      render: (row) => (
        <ActionDropdown
          row={row}
          onProcess={handleProcessSettlement}
          onMarkPaid={(row) => setPayoutModal({ open: true, settlement: row, ref: '', notes: '' })}
          onMarkFailed={(row) => setFailModal({ open: true, settlement: row, reason: '', notes: '' })}
          onViewDetail={handleOpenDetail}
          processing={processing}
        />
      )
    }
  ];

  const filterConfig = [
    {
      key: 'entityType',
      label: 'Partner Type',
      type: 'select',
      options: [
        { label: 'Restaurants', value: 'RESTAURANT' },
        { label: 'Delivery Partners', value: 'DELIVERY_PARTNER' }
      ]
    },
    {
      key: 'status',
      label: 'Payout Status',
      type: 'select',
      options: [
        { label: 'Pending Payout', value: 'PENDING' },
        { label: 'Processing', value: 'PROCESSING' },
        { label: 'Paid', value: 'PAID' },
        { label: 'Failed', value: 'FAILED' }
      ]
    }
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">Financial Settlements & Payouts</h1>
          <p className="text-slate-400 mt-1">Manage restaurant and delivery partner earnings, commission deductions, and bank payouts</p>
        </div>
        <button
          onClick={() => setGenModalOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#d4af37] text-white hover:bg-[#b5952f] rounded-xl text-sm font-bold shadow-sm transition-all cursor-pointer"
        >
          <Plus size={18} /> Generate Settlement
        </button>
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-xl flex items-center gap-3">
          <ShieldAlert size={20} />
          {error}
        </div>
      )}

      <DataTable
        columns={columns}
        data={settlements}
        loading={loading}
        emptyMessage="No settlement records found matching your criteria."
        
        search={{ value: search, placeholder: 'Search settlement number / reference...' }}
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

      {/* Generate Settlement Modal */}
      {genModalOpen && (
        <div className="fixed inset-0 bg-gray-900/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden p-6 space-y-4 animate-fadeIn">
            <div className="flex items-center justify-between border-b pb-3">
              <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <Landmark className="text-[#d4af37]" size={22} /> Generate Partner Settlement
              </h2>
              <button onClick={() => setGenModalOpen(false)} className="text-gray-400 hover:text-gray-600 cursor-pointer">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleGenerateSettlement} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Beneficiary Partner Type</label>
                <select
                  value={genEntityType}
                  onChange={(e) => {
                    setGenEntityType(e.target.value);
                    setSelectedPartnerId('');
                  }}
                  className="w-full p-2.5 border border-gray-200 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-[#d4af37] outline-none"
                >
                  <option value="RESTAURANT">Restaurant Partner</option>
                  <option value="DELIVERY_PARTNER">Delivery Partner</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Select Partner</label>
                <select
                  value={selectedPartnerId}
                  onChange={(e) => setSelectedPartnerId(e.target.value)}
                  required
                  className="w-full p-2.5 border border-gray-200 rounded-xl text-xs focus:ring-2 focus:ring-[#d4af37] outline-none"
                >
                  <option value="">-- Choose Partner --</option>
                  {genEntityType === 'RESTAURANT' ? (
                    restaurants.map(r => (
                      <option key={r._id} value={r._id}>{r.restaurantName || r.name} ({r.city || 'City'})</option>
                    ))
                  ) : (
                    deliveryPartners.map(d => (
                      <option key={d._id} value={d._id}>{d.fullName || d.name} ({d.mobile})</option>
                    ))
                  )}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Period Start Date</label>
                  <input
                    type="date"
                    value={periodStart}
                    onChange={(e) => setPeriodStart(e.target.value)}
                    required
                    className="w-full p-2.5 border border-gray-200 rounded-xl text-xs focus:ring-2 focus:ring-[#d4af37] outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Period End Date</label>
                  <input
                    type="date"
                    value={periodEnd}
                    onChange={(e) => setPeriodEnd(e.target.value)}
                    required
                    className="w-full p-2.5 border border-gray-200 rounded-xl text-xs focus:ring-2 focus:ring-[#d4af37] outline-none"
                  />
                </div>
              </div>

              {genEntityType === 'RESTAURANT' && (
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Platform Commission Rate (%)</label>
                  <input
                    type="number"
                    value={commissionRate}
                    onChange={(e) => setCommissionRate(e.target.value)}
                    min="0"
                    max="100"
                    required
                    className="w-full p-2.5 border border-gray-200 rounded-xl text-xs focus:ring-2 focus:ring-[#d4af37] outline-none"
                  />
                </div>
              )}

              <div className="flex gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setGenModalOpen(false)}
                  className="flex-1 py-2.5 border border-gray-200 text-gray-700 font-bold text-xs rounded-xl hover:bg-gray-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={genLoading}
                  className="flex-1 py-2.5 bg-[#d4af37] text-white font-bold text-xs rounded-xl hover:bg-[#b5952f] disabled:opacity-50 cursor-pointer"
                >
                  {genLoading ? 'Calculating...' : 'Generate Statement'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Payout Modal */}
      {payoutModal.open && (
        <div className="fixed inset-0 bg-gray-900/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden p-6 space-y-4 animate-fadeIn">
            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <Landmark className="text-emerald-600" size={20} /> Mark Settlement Paid
            </h2>
            <p className="text-xs text-gray-500">
              Net payout of <span className="font-bold text-emerald-700 text-sm">₹{payoutModal.settlement?.netPayoutAmount}</span> for settlement <span className="font-bold font-mono">{payoutModal.settlement?.settlementNumber}</span>.
            </p>

            <form onSubmit={handleMarkPaid} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Bank / UTR Transaction Reference</label>
                <input
                  type="text"
                  value={payoutModal.ref}
                  onChange={(e) => setPayoutModal({ ...payoutModal, ref: e.target.value })}
                  placeholder="e.g. UTR1982736451"
                  required
                  className="w-full p-3 border border-gray-200 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Notes (Optional)</label>
                <input
                  type="text"
                  value={payoutModal.notes}
                  onChange={(e) => setPayoutModal({ ...payoutModal, notes: e.target.value })}
                  placeholder="e.g. Weekly payout transferred via NEFT"
                  className="w-full p-3 border border-gray-200 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500 outline-none"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setPayoutModal({ open: false, settlement: null, ref: '', notes: '' })}
                  className="flex-1 py-2.5 border border-gray-200 text-gray-700 font-bold text-xs rounded-xl hover:bg-gray-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={processing}
                  className="flex-1 py-2.5 bg-emerald-600 text-white font-bold text-xs rounded-xl hover:bg-emerald-700 disabled:opacity-50 cursor-pointer"
                >
                  {processing ? 'Saving...' : 'Confirm Payout'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Fail Modal */}
      {failModal.open && (
        <div className="fixed inset-0 bg-gray-900/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden p-6 space-y-4 animate-fadeIn">
            <h2 className="text-xl font-bold text-red-600 flex items-center gap-2">
              <AlertCircle size={20} /> Mark Settlement Failed
            </h2>

            <form onSubmit={handleMarkFailed} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Failure Reason</label>
                <input
                  type="text"
                  value={failModal.reason}
                  onChange={(e) => setFailModal({ ...failModal, reason: e.target.value })}
                  placeholder="e.g. Invalid bank account or IFSC"
                  required
                  className="w-full p-3 border border-gray-200 rounded-xl text-xs focus:ring-2 focus:ring-red-500 outline-none"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setFailModal({ open: false, settlement: null, reason: '', notes: '' })}
                  className="flex-1 py-2.5 border border-gray-200 text-gray-700 font-bold text-xs rounded-xl hover:bg-gray-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={processing}
                  className="flex-1 py-2.5 bg-red-600 text-white font-bold text-xs rounded-xl hover:bg-red-700 disabled:opacity-50 cursor-pointer"
                >
                  {processing ? 'Saving...' : 'Confirm Failure'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Detail Modal */}
      {detailModal.open && (
        <div className="fixed inset-0 bg-gray-900/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 space-y-4 animate-fadeIn">
            <div className="flex items-center justify-between border-b pb-3">
              <h2 className="text-xl font-bold text-slate-800">
                Settlement Statement: <span className="font-mono text-emerald-700">{detailModal.settlement?.settlementNumber}</span>
              </h2>
              <button onClick={() => setDetailModal({ open: false, settlement: null, loading: false })} className="text-gray-400 hover:text-gray-600 cursor-pointer">
                <X size={20} />
              </button>
            </div>

            {detailModal.loading ? (
              <div className="py-8 text-center text-gray-400">Loading statement details...</div>
            ) : (
              <div className="space-y-4 text-xs">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 bg-gray-50 p-4 rounded-xl">
                  <div>
                    <span className="text-gray-400 block font-semibold">Entity Type</span>
                    <span className="font-bold text-slate-700">{detailModal.settlement?.entityType}</span>
                  </div>
                  <div>
                    <span className="text-gray-400 block font-semibold">Orders Count</span>
                    <span className="font-bold text-slate-700">{detailModal.settlement?.totalOrdersCount}</span>
                  </div>
                  <div>
                    <span className="text-gray-400 block font-semibold">Status</span>
                    <span>{getStatusBadge(detailModal.settlement?.status)}</span>
                  </div>
                  <div>
                    <span className="text-gray-400 block font-semibold">Transaction Ref</span>
                    <span className="font-bold text-slate-700 font-mono">{detailModal.settlement?.transactionReference || 'N/A'}</span>
                  </div>
                </div>

                <div className="bg-slate-50 border p-4 rounded-xl space-y-2">
                  <div className="flex justify-between font-semibold text-slate-700">
                    <span>Gross Earnings:</span>
                    <span>₹{detailModal.settlement?.grossEarnings}</span>
                  </div>
                  <div className="flex justify-between font-semibold text-red-600">
                    <span>Platform Commission ({detailModal.settlement?.platformCommissionRate}%):</span>
                    <span>-₹{detailModal.settlement?.platformCommissionDeduction}</span>
                  </div>
                  <div className="flex justify-between font-semibold text-red-600">
                    <span>Taxes / GST:</span>
                    <span>-₹{detailModal.settlement?.taxDeduction}</span>
                  </div>
                  <div className="flex justify-between font-semibold text-red-600">
                    <span>Refund Deductions:</span>
                    <span>-₹{detailModal.settlement?.refundDeduction || 0}</span>
                  </div>
                  <div className="flex justify-between font-bold text-emerald-700 text-sm border-t pt-2">
                    <span>Net Payout Amount:</span>
                    <span>₹{detailModal.settlement?.netPayoutAmount}</span>
                  </div>
                </div>

                {detailModal.settlement?.orderIds?.length > 0 && (
                  <div>
                    <h3 className="font-bold text-slate-800 mb-2">Included Orders ({detailModal.settlement.orderIds.length})</h3>
                    <div className="max-h-40 overflow-y-auto border rounded-xl divide-y">
                      {detailModal.settlement.orderIds.map(o => (
                        <div key={o._id} className="p-2.5 flex justify-between items-center text-xs">
                          <span className="font-mono font-bold text-slate-700">{o.orderNumber}</span>
                          <span className="text-gray-500">{o.orderType}</span>
                          <span className="font-bold text-slate-800">₹{o.pricing?.itemSubtotal || o.pricing?.subtotal || 0}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default SuperAdminSettlements;
