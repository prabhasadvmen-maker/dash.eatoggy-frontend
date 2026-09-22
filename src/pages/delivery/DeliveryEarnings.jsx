import React, { useState, useEffect, useCallback } from 'react';
import { IndianRupee, ShieldAlert, CheckCircle2, Clock, Eye, X } from 'lucide-react';
import API_BASE_URL from '../../services/apiService';
import DataTable from '../../components/common/Table/DataTable';
import { useDataTableSync } from '../../hooks/useDataTableSync';

const DeliveryEarnings = () => {
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
  const [summaryData, setSummaryData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Detail Modal State
  const [detailModal, setDetailModal] = useState({ open: false, statement: null, loading: false });

  const fetchEarnings = useCallback(async () => {
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

      const response = await fetch(`${API_BASE_URL}/api/delivery/earnings?${queryParams.toString()}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('delivery_token')}`
        }
      });
      const result = await response.json();
      
      if (response.ok && result.success) {
        setSettlements(result.data || []);
        if (result.meta && result.meta.pagination) {
          setTotal(result.meta.pagination.total);
        } else {
          setTotal(result.data?.length || 0);
        }
        if (result.summary) {
          setSummaryData(result.summary);
        }
      } else {
        setError(result.message || 'Failed to fetch delivery earnings');
      }
    } catch (err) {
      setError('Network error while fetching delivery earnings');
    } finally {
      setLoading(false);
    }
  }, [page, limit, search, sortBy, sortOrder, filters]);

  useEffect(() => {
    fetchEarnings();
  }, [fetchEarnings]);

  const handleOpenDetail = async (settlementId) => {
    setDetailModal({ open: true, statement: null, loading: true });
    try {
      const response = await fetch(`${API_BASE_URL}/api/delivery/earnings/${settlementId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('delivery_token')}`
        }
      });
      const result = await response.json();
      if (response.ok && result.success) {
        setDetailModal({ open: true, statement: result.data, loading: false });
      } else {
        alert(result.message || 'Failed to fetch statement detail');
        setDetailModal({ open: false, statement: null, loading: false });
      }
    } catch (err) {
      alert('Network error loading statement detail');
      setDetailModal({ open: false, statement: null, loading: false });
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  const columns = [
    {
      key: 'settlementNumber',
      label: 'Settlement #',
      sortable: true,
      render: (row) => (
        <span className="font-bold text-slate-800 font-mono text-xs">
          {row.settlementNumber}
        </span>
      )
    },
    {
      key: 'period',
      label: 'Period',
      sortable: false,
      render: (row) => (
        <span className="text-slate-500 whitespace-nowrap text-xs">
          {formatDate(row.periodStart)} – {formatDate(row.periodEnd)}
        </span>
      )
    },
    {
      key: 'totalOrdersCount',
      label: 'Deliveries',
      sortable: true,
      align: 'center',
      render: (row) => (
        <span className="font-bold text-slate-700 text-sm">
          {row.totalOrdersCount}
        </span>
      )
    },
    {
      key: 'grossEarnings',
      label: 'Gross Pay',
      sortable: true,
      align: 'right',
      render: (row) => (
        <span className="font-bold text-slate-800 text-sm">
          ₹{row.grossEarnings}
        </span>
      )
    },
    {
      key: 'taxDeduction',
      label: 'Taxes/Deductions',
      sortable: false,
      align: 'right',
      render: (row) => (
        <span className="font-semibold text-red-600 text-sm">
          -₹{row.taxDeduction || 0}
        </span>
      )
    },
    {
      key: 'netPayoutAmount',
      label: 'Net Payout',
      sortable: true,
      align: 'right',
      render: (row) => (
        <span className="font-black text-emerald-700 text-base">
          ₹{row.netPayoutAmount}
        </span>
      )
    },
    {
      key: 'status',
      label: 'Status',
      sortable: true,
      align: 'center',
      render: (row) => (
        <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
          row.status === 'PAID' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
        }`}>
          {row.status}
        </span>
      )
    },
    {
      key: 'actions',
      label: 'Action',
      align: 'right',
      render: (row) => (
        <button
          onClick={() => handleOpenDetail(row._id)}
          className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
          title="View Statement Details"
        >
          <Eye size={16} />
        </button>
      )
    }
  ];

  const filterConfig = [
    {
      key: 'status',
      label: 'Status',
      type: 'select',
      options: [
        { label: 'Pending', value: 'PENDING' },
        { label: 'Processing', value: 'PROCESSING' },
        { label: 'Paid', value: 'PAID' },
        { label: 'Failed', value: 'FAILED' }
      ]
    }
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto p-4 md:p-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">Delivery Partner Earnings & Payouts</h1>
          <p className="text-slate-500 text-sm mt-1">Track your delivery pay, platform settlements, and bank deposits</p>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-xl flex items-center gap-3 text-sm font-semibold">
          <ShieldAlert size={20} />
          {error}
        </div>
      )}

      {/* Overview Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-emerald-50/60 border border-emerald-100 p-6 rounded-2xl flex items-center justify-between shadow-sm">
          <div>
            <p className="text-sm text-emerald-800/80 font-bold mb-1">Total Paid Payouts</p>
            <p className="text-3xl font-black text-emerald-800">₹{summaryData?.totalPaid || 0}</p>
          </div>
          <div className="w-12 h-12 rounded-full bg-emerald-200 text-emerald-800 flex items-center justify-center font-bold">
            <CheckCircle2 size={24} />
          </div>
        </div>

        <div className="bg-amber-50/60 border border-amber-100 p-6 rounded-2xl flex items-center justify-between shadow-sm">
          <div>
            <p className="text-sm text-amber-800/80 font-bold mb-1">Pending Next Deposit</p>
            <p className="text-3xl font-black text-amber-800">₹{summaryData?.totalPending || 0}</p>
          </div>
          <div className="w-12 h-12 rounded-full bg-amber-200 text-amber-800 flex items-center justify-center font-bold">
            <Clock size={24} />
          </div>
        </div>
      </div>

      {/* Settlements Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <DataTable
          columns={columns}
          data={settlements}
          loading={loading}
          emptyMessage="No payout statements generated yet."
          
          search={{ value: search, placeholder: 'Search by settlement number...' }}
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
      </div>

      {/* Detail Modal */}
      {detailModal.open && (
        <div className="fixed inset-0 bg-gray-900/50 flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-xl max-h-[90vh] overflow-y-auto p-6 space-y-4">
            <div className="flex items-center justify-between border-b pb-4">
              <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                Statement Details <span className="text-sm font-mono bg-emerald-50 text-emerald-700 px-2 py-1 rounded-lg border border-emerald-100">{detailModal.statement?.settlementNumber}</span>
              </h2>
              <button onClick={() => setDetailModal({ open: false, statement: null, loading: false })} className="text-gray-400 hover:text-gray-600 cursor-pointer hover:bg-gray-100 p-1 rounded-full transition-colors">
                <X size={20} />
              </button>
            </div>

            {detailModal.loading ? (
              <div className="py-12 flex flex-col items-center justify-center">
                <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mb-4"></div>
                <div className="text-gray-500 font-medium text-sm">Loading statement details...</div>
              </div>
            ) : (
              <div className="space-y-6 text-sm">
                <div className="bg-emerald-50/50 border border-emerald-100 p-5 rounded-2xl space-y-3">
                  <div className="flex justify-between font-bold text-slate-700">
                    <span>Gross Delivery Earnings:</span>
                    <span>₹{detailModal.statement?.grossEarnings}</span>
                  </div>
                  <div className="flex justify-between font-bold text-red-600">
                    <span>Tax Withholding / Deductions:</span>
                    <span>-₹{detailModal.statement?.taxDeduction || 0}</span>
                  </div>
                  <div className="flex justify-between font-black text-emerald-800 text-lg border-t border-emerald-200 pt-3">
                    <span>Net Payout Amount:</span>
                    <span>₹{detailModal.statement?.netPayoutAmount}</span>
                  </div>
                </div>

                {detailModal.statement?.orderIds?.length > 0 && (
                  <div>
                    <h3 className="font-bold text-slate-800 mb-3 flex items-center gap-2">
                      Completed Delivery Jobs 
                      <span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full text-xs">{detailModal.statement.orderIds.length}</span>
                    </h3>
                    <div className="max-h-64 overflow-y-auto border border-gray-200 rounded-xl divide-y divide-gray-100 shadow-inner bg-gray-50/50">
                      {detailModal.statement.orderIds.map(o => (
                         <div key={o._id} className="p-3.5 flex justify-between items-center text-sm bg-white hover:bg-gray-50 transition-colors">
                          <span className="font-mono font-bold text-slate-800">{o.orderNumber}</span>
                          <span className="text-gray-500 font-medium text-xs bg-gray-100 px-2 py-0.5 rounded-full">{o.orderType}</span>
                          <span className="font-black text-emerald-600">₹{o.pricing?.deliveryFee || 40}</span>
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

export default DeliveryEarnings;
