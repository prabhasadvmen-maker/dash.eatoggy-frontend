import React, { useState, useEffect, useCallback } from 'react';
import { Star, ShieldAlert, EyeOff, ShieldCheck, Flag } from 'lucide-react';
import API_BASE_URL from '../../services/apiService';
import DataTable from '../../components/common/Table/DataTable';
import { useDataTableSync } from '../../hooks/useDataTableSync';

const SuperAdminReviews = () => {
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

  const [reviews, setReviews] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchReviews = useCallback(async () => {
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

      const response = await fetch(`${API_BASE_URL}/api/super-admin/reviews?${queryParams.toString()}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('superadmin_token')}`
        }
      });
      const data = await response.json();
      
      if (response.ok) {
        setReviews(data.data || []);
        if (data.meta && data.meta.pagination) {
          setTotal(data.meta.pagination.total);
        } else if (data.pagination) {
          setTotal(data.pagination.total);
        } else {
          setTotal(data.data?.length || 0);
        }
      } else {
        setError(data.message || 'Failed to fetch reviews');
      }
    } catch (err) {
      setError('Network error while fetching reviews');
    } finally {
      setLoading(false);
    }
  }, [page, limit, search, sortBy, sortOrder, filters]);

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  const handleUpdateStatus = async (reviewId, newStatus) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/super-admin/reviews/${reviewId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('superadmin_token')}`
        },
        body: JSON.stringify({ status: newStatus })
      });
      const data = await response.json();
      if (response.ok) {
        setReviews(reviews.map(r => r._id === reviewId ? { ...r, status: newStatus } : r));
      } else {
        alert(data.message || 'Failed to update review status');
      }
    } catch (err) {
      alert('Network error while updating review status');
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  const columns = [
    {
      key: 'customer',
      label: 'Customer',
      sortable: false,
      render: (row) => <span className="font-bold text-slate-800 text-xs">{row.customerId?.fullName || row.customerId?.name || 'Customer'}</span>
    },
    {
      key: 'restaurant',
      label: 'Restaurant',
      sortable: false,
      render: (row) => <span className="font-medium text-slate-700 text-xs">{row.restaurantId?.name || 'Restaurant'}</span>
    },
    {
      key: 'rating',
      label: 'Rating',
      sortable: true,
      align: 'center',
      render: (row) => <span className="font-bold text-amber-600">★ {row.rating}/5</span>
    },
    {
      key: 'comment',
      label: 'Comment',
      sortable: false,
      render: (row) => <span className="text-slate-600 max-w-xs text-xs">{row.comment || 'No text'}</span>
    },
    {
      key: 'createdAt',
      label: 'Date',
      sortable: true,
      render: (row) => <span className="text-slate-400 text-xs whitespace-nowrap">{formatDate(row.createdAt)}</span>
    },
    {
      key: 'status',
      label: 'Status',
      sortable: true,
      align: 'center',
      render: (row) => (
        <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${row.status === 'PUBLISHED' ? 'bg-emerald-100 text-emerald-800' : row.status === 'HIDDEN' ? 'bg-gray-100 text-gray-700' : 'bg-red-100 text-red-800'}`}>
          {row.status}
        </span>
      )
    },
    {
      key: 'actions',
      label: 'Moderation Action',
      align: 'center',
      render: (row) => (
        <div className="flex justify-center gap-2">
          {row.status !== 'PUBLISHED' && (
            <button
              onClick={() => handleUpdateStatus(row._id, 'PUBLISHED')}
              title="Publish"
              className="p-1.5 bg-emerald-100 text-emerald-800 rounded-lg hover:bg-emerald-200 transition-colors cursor-pointer"
            >
              <ShieldCheck size={14} />
            </button>
          )}
          {row.status !== 'HIDDEN' && (
            <button
              onClick={() => handleUpdateStatus(row._id, 'HIDDEN')}
              title="Hide Review"
              className="p-1.5 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors cursor-pointer"
            >
              <EyeOff size={14} />
            </button>
          )}
          {row.status !== 'FLAGGED' && (
            <button
              onClick={() => handleUpdateStatus(row._id, 'FLAGGED')}
              title="Flag Review"
              className="p-1.5 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors cursor-pointer"
            >
              <Flag size={14} />
            </button>
          )}
        </div>
      )
    }
  ];

  const filterConfig = [
    {
      key: 'status',
      label: 'Review Status',
      type: 'select',
      options: [
        { label: 'Published', value: 'PUBLISHED' },
        { label: 'Hidden', value: 'HIDDEN' },
        { label: 'Flagged', value: 'FLAGGED' }
      ]
    }
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">Master Reviews & Moderation Center</h1>
          <p className="text-slate-400 mt-1">Audit customer ratings across restaurants and moderate abusive or fake feedback</p>
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
        data={reviews}
        loading={loading}
        emptyMessage="No reviews found matching your criteria."
        
        search={{ value: search, placeholder: 'Search review comment...' }}
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
  );
};

export default SuperAdminReviews;
