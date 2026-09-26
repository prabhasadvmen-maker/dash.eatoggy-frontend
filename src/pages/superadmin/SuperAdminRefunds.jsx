import React, { useState, useEffect, useCallback } from 'react';
import { ShieldAlert } from 'lucide-react';
import API_BASE_URL from '../../services/apiService';
import DataTable from '../../components/common/Table/DataTable';
import { useDataTableSync } from '../../hooks/useDataTableSync';

const SuperAdminRefunds = () => {
  const {
    page, setPage,
    limit, setLimit,
    search, setSearch,
    sortBy, sortOrder, setSort
  } = useDataTableSync({
    defaultSortBy: 'createdAt',
    defaultSortOrder: 'desc'
  });

  const [payments, setPayments] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchRefunds = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      
      const queryParams = new URLSearchParams({
        page,
        limit,
        sortBy,
        sortOrder,
        status: 'REFUNDED' // Hardcode status to REFUNDED for this screen
      });
      
      if (search) queryParams.append('search', search);

      const response = await fetch(`${API_BASE_URL}/api/super-admin/payments?${queryParams.toString()}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('superadmin_token')}`
        }
      });
      const data = await response.json();
      
      if (response.ok) {
        setPayments(data.data || []);
        if (data.meta && data.meta.pagination) {
          setTotal(data.meta.pagination.total);
        } else if (data.pagination) {
          setTotal(data.pagination.total);
        } else {
          setTotal(data.data?.length || 0);
        }
      } else {
        setError(data.message || 'Failed to fetch refunds');
      }
    } catch (err) {
      setError('Network error while fetching refunds');
    } finally {
      setLoading(false);
    }
  }, [page, limit, search, sortBy, sortOrder]);

  useEffect(() => {
    fetchRefunds();
  }, [fetchRefunds]);

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: '2-digit', hour: '2-digit', minute: '2-digit' });
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
      key: 'razorpayOrderId',
      label: 'Transaction / Order',
      sortable: false,
      className: 'px-2 py-3',
      headerClassName: 'px-2 py-3',
      render: (row) => (
        <div className="whitespace-nowrap">
          <div className="truncate max-w-[200px]" title={row.razorpayOrderId}>Order ID: <span className="font-mono text-xs text-gray-600">{row.razorpayOrderId}</span></div>
          {row.refundDetails?.refundId && <div className="text-[10px] text-purple-600 font-mono truncate max-w-[200px]" title={row.refundDetails?.refundId}>Refund ID: {row.refundDetails?.refundId}</div>}
        </div>
      )
    },
    {
      key: 'customer',
      label: 'Paid By',
      sortable: false,
      className: 'px-2 py-3',
      headerClassName: 'px-2 py-3',
      render: (row) => {
        let name = 'Unknown';
        let mobile = '';
        
        if (row.customer) { name = row.customer.name; mobile = row.customer.mobile; }
        else if (row.restaurant) { name = row.restaurant.name || row.restaurant.restaurantName; mobile = row.restaurant.mobile; }
        else if (row.deliveryPartner) { name = row.deliveryPartner.fullName; mobile = row.deliveryPartner.mobile; }

        return (
          <div className="whitespace-nowrap">
            <div className="font-medium text-slate-700 truncate max-w-[120px]" title={name}>{name || 'Unknown'}</div>
            <div className="text-[10px] text-gray-400 font-mono mt-0.5">{mobile}</div>
          </div>
        );
      }
    },
    {
      key: 'refundDetails.reason',
      label: 'Refund Reason',
      sortable: false,
      className: 'px-2 py-3',
      headerClassName: 'px-2 py-3',
      render: (row) => (
        <span className="text-slate-600 font-medium text-[11px] truncate max-w-[200px] inline-block whitespace-nowrap" title={row.refundDetails?.reason || 'Admin initiated refund'}>
          {row.refundDetails?.reason || 'Admin initiated refund'}
        </span>
      )
    },
    {
      key: 'refundDetails.refundAmount',
      label: 'Amount',
      sortable: false,
      align: 'center',
      className: 'px-2 py-3',
      headerClassName: 'px-2 py-3',
      render: (row) => (
        <span className="font-bold text-purple-700 whitespace-nowrap text-xs">
          ₹{row.refundDetails?.refundAmount || row.amount}
        </span>
      )
    },
    {
      key: 'refundDetails.refundedAt',
      label: 'Refunded Date',
      sortable: true,
      className: 'px-2 py-3',
      headerClassName: 'px-2 py-3',
      render: (row) => (
        <span className="text-slate-500 font-medium whitespace-nowrap text-[11px]">
          {formatDate(row.refundDetails?.refundedAt || row.updatedAt)}
        </span>
      )
    }
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">Refunds Audit Log</h1>
          <p className="text-slate-400 mt-1">Audit log of all refunded orders, subscriptions, and reason records</p>
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
        data={payments}
        loading={loading}
        emptyMessage="No refunded records found."
        
        search={{ value: search, placeholder: 'Search Razorpay Order ID / Payment ID...' }}
        onSearchChange={setSearch}
        
        sorting={{ sortBy, sortOrder }}
        onSortChange={setSort}

        pagination={{ page, limit, total }}
        onPageChange={setPage}
        onLimitChange={setLimit}
      />
    </div>
  );
};

export default SuperAdminRefunds;
