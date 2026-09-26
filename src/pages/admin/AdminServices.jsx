import React, { useState, useEffect } from 'react';
import { Briefcase, RefreshCw, Eye, Store, MapPin, IndianRupee, Clock, Utensils, CheckCircle2, XCircle } from 'lucide-react';
import API_BASE_URL from '../../services/apiService';
import DataTable from '../../components/common/Table/DataTable';
import { useDataTableSync } from '../../hooks/useDataTableSync';

const AdminServices = () => {
  const {
    page,
    limit,
    search,
  } = useDataTableSync({
    defaultSortBy: 'createdAt',
    defaultSortOrder: 'desc'
  });

  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchServices = async () => {
    setLoading(true);
    setError('');
    try {
      const token = localStorage.getItem('admin_token');
      const res = await fetch(`${API_BASE_URL}/api/admins/services`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) {
        setServices(data);
      } else {
        setError(data.message || 'Failed to fetch services');
      }
    } catch (err) {
      setError('Network error connecting to server');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchServices();
  }, []);

  const getMealTypeBadge = (type) => {
    switch (type) {
      case 'VEG': return <span className="px-2 py-0.5 bg-green-50 text-green-700 border border-green-200 rounded text-[10px] font-bold">VEG</span>;
      case 'NON_VEG': return <span className="px-2 py-0.5 bg-red-50 text-red-700 border border-red-200 rounded text-[10px] font-bold">NON-VEG</span>;
      default: return <span className="px-2 py-0.5 bg-gray-50 text-gray-700 border border-gray-200 rounded text-[10px] font-bold">{type}</span>;
    }
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
      key: 'partner',
      label: 'Partner Details',
      sortable: false,
      className: 'px-2 py-3',
      headerClassName: 'px-2 py-3',
      render: (row) => (
        <div>
          <div className="font-bold text-gray-900 flex items-center gap-1.5">
            <Store size={14} className="text-[#d4af37]" />
            {row.restaurantId?.restaurantName || 'Unknown Partner'}
            {row.restaurantId?.isPhoneVerified && <span className="text-emerald-600 text-[10px] font-semibold">✓</span>}
          </div>
          <div className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
            <MapPin size={12} className="text-gray-400" /> {row.restaurantId?.city || 'N/A'}
          </div>
        </div>
      )
    },
    {
      key: 'serviceName',
      label: 'Service / Plan Name',
      sortable: true,
      className: 'px-2 py-3',
      headerClassName: 'px-2 py-3',
      render: (row) => (
        <div>
          <div className="font-bold text-slate-800">{row.name}</div>
          <div className="text-[10px] text-gray-500 truncate max-w-[150px]">{row.description || 'No description'}</div>
        </div>
      )
    },
    {
      key: 'mealDetails',
      label: 'Meal Info',
      sortable: false,
      className: 'px-2 py-3',
      headerClassName: 'px-2 py-3',
      render: (row) => (
        <div className="flex flex-col gap-1 items-start">
          {getMealTypeBadge(row.mealType)}
          <span className="text-xs text-slate-600 flex items-center gap-1 font-medium">
            <Utensils size={10} className="text-slate-400" /> {row.totalMeals} Meals
          </span>
        </div>
      )
    },
    {
      key: 'duration',
      label: 'Duration',
      sortable: true,
      className: 'px-2 py-3',
      headerClassName: 'px-2 py-3',
      render: (row) => (
        <div className="flex items-center gap-1 text-sm font-semibold text-slate-700">
          <Clock size={14} className="text-slate-400" />
          {row.planDurationDays} Days
        </div>
      )
    },
    {
      key: 'pricing',
      label: 'Pricing',
      sortable: true,
      className: 'px-2 py-3',
      headerClassName: 'px-2 py-3',
      render: (row) => (
        <div>
          <div className="font-bold text-amber-700 flex items-center">
            <IndianRupee size={12} /> {row.totalPrice?.toLocaleString('en-IN') || 0}
          </div>
          <div className="text-[10px] text-slate-500">
            ₹{row.pricePerMeal}/meal
          </div>
        </div>
      )
    },
    {
      key: 'status',
      label: 'Status',
      sortable: true,
      align: 'center',
      className: 'px-2 py-3',
      headerClassName: 'px-2 py-3',
      render: (row) => (
        row.status === 'ACTIVE'
          ? <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full text-[10px] font-bold"><CheckCircle2 size={12} /> Active</span>
          : <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-gray-50 text-gray-600 border border-gray-200 rounded-full text-[10px] font-bold"><XCircle size={12} /> Inactive</span>
      )
    },
    {
      key: 'actions',
      label: 'Action',
      align: 'right',
      className: 'px-2 py-3',
      headerClassName: 'px-2 py-3',
      render: (row) => (
        <button
          className="p-1.5 bg-gray-100 border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
          title="View Details"
        >
          <Eye size={16} />
        </button>
      )
    }
  ];

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Partner Services (Tiffin Plans)</h1>
          <p className="text-gray-500 text-sm mt-1">View all subscriptions and service packages offered by restaurant partners.</p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={fetchServices}
            className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 rounded-xl text-sm font-semibold shadow-sm transition-all cursor-pointer"
          >
            <RefreshCw size={16} className={loading ? "animate-spin" : ""} /> Refresh Data
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded-r-xl shadow-sm">
          <p className="font-medium text-sm">{error}</p>
        </div>
      )}

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <DataTable
          columns={columns}
          data={services}
          loading={loading}
          pagination={true}
          defaultLimit={10}
        />
      </div>
    </div>
  );
};

export default AdminServices;
