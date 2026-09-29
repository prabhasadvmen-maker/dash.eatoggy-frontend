import React, { useState, useEffect, useCallback } from 'react';
import { MapPin, Plus, Trash2, X, Settings, Eye, Edit2, Map, ShieldAlert } from 'lucide-react';
import DataTable from '../../components/common/Table/DataTable';
import API_BASE_URL from '../../services/apiService';

const ActionDropdown = ({ row, onEdit, onDelete, onView, onToggleStatus, onAddZone }) => {
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
        className="p-1.5 bg-gray-100 border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors cursor-pointer"
        title="Settings"
      >
        <Settings size={16} />
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-100 z-10 py-1 overflow-hidden">
          <button
            onClick={() => { setOpen(false); onView(row); }}
            className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2 transition-colors cursor-pointer"
          >
            <Eye size={14} className="text-gray-500" />
            View / Manage Zones
          </button>
          <button
            onClick={() => { setOpen(false); onAddZone(row); }}
            className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2 transition-colors cursor-pointer"
          >
            <Map size={14} className="text-gray-500" />
            Add Zone
          </button>
          <button
            onClick={() => { setOpen(false); onEdit(row); }}
            className="w-full text-left px-4 py-2 text-sm text-blue-600 hover:bg-blue-50 flex items-center gap-2 transition-colors cursor-pointer"
          >
            <Edit2 size={14} className="text-blue-500" />
            Edit City
          </button>
          <button
            onClick={() => { setOpen(false); onToggleStatus(row._id, row.isActive); }}
            className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2 transition-colors cursor-pointer"
          >
            <ShieldAlert size={14} className={row.isActive ? "text-orange-500" : "text-emerald-500"} />
            {row.isActive ? 'Disable City' : 'Enable City'}
          </button>
          <div className="h-[1px] bg-gray-100 my-1"></div>
          <button
            onClick={() => { setOpen(false); onDelete(row._id); }}
            className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2 transition-colors cursor-pointer"
          >
            <Trash2 size={14} className="text-red-500" />
            Delete City
          </button>
        </div>
      )}
    </div>
  );
};

const CityZones = () => {
  const [cities, setCities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  
  // View Zones Modal
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [expandedCity, setExpandedCity] = useState(null);

  // City modal
  const [cityModal, setCityModal] = useState(false);
  const [editCityId, setEditCityId] = useState(null);
  const [cityName, setCityName] = useState('');
  const [citySubmitting, setCitySubmitting] = useState(false);

  // Zone modal
  const [zoneModal, setZoneModal] = useState({ open: false, cityId: null, cityName: '' });
  const [zoneName, setZoneName] = useState('');
  const [zoneSubmitting, setZoneSubmitting] = useState(false);


  const token = localStorage.getItem('superadmin_token');
  const headers = { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` };

  const fetchCities = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const params = search ? `?search=${search}` : '';
      const res = await fetch(`${API_BASE_URL}/api/super-admin/cities${params}`, { headers });
      const data = await res.json();
      if (res.ok) setCities(data.data || []);
      else setError(data.message || 'Failed to fetch cities');
    } catch {
      setError('Network error');
    } finally {
      setLoading(false);
    }
  }, [search]);

  useEffect(() => { fetchCities(); }, [fetchCities]);

  const handleCreateOrUpdateCity = async (e) => {
    e.preventDefault();
    if (!cityName.trim()) return;
    setCitySubmitting(true);
    try {
      const url = editCityId 
        ? `${API_BASE_URL}/api/super-admin/cities/${editCityId}`
        : `${API_BASE_URL}/api/super-admin/cities`;
      const method = editCityId ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method, headers,
        body: JSON.stringify({ city: cityName.trim() })
      });
      const data = await res.json();
      if (res.ok) { 
        setCityModal(false); 
        setCityName(''); 
        setEditCityId(null);
        fetchCities(); 
      }
      else alert(data.message || `Failed to ${editCityId ? 'update' : 'create'} city`);
    } catch { alert('Network error'); }
    finally { setCitySubmitting(false); }
  };

  const handleToggleCity = async (id, isActive) => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/super-admin/cities/${id}`, {
        method: 'PUT', headers,
        body: JSON.stringify({ isActive: !isActive })
      });
      if (res.ok) fetchCities();
    } catch { alert('Network error'); }
  };

  const handleDeleteCity = async (id) => {
    if (!window.confirm('Delete this city and all its zones?')) return;
    try {
      const res = await fetch(`${API_BASE_URL}/api/super-admin/cities/${id}`, { method: 'DELETE', headers });
      if (res.ok) fetchCities();
    } catch { alert('Network error'); }
  };

  const handleAddZone = async (e) => {
    e.preventDefault();
    if (!zoneName.trim()) return;
    setZoneSubmitting(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/super-admin/cities/${zoneModal.cityId}/zones`, {
        method: 'POST', headers,
        body: JSON.stringify({ name: zoneName.trim() })
      });
      const data = await res.json();
      if (res.ok) { 
        setZoneModal({ open: false, cityId: null, cityName: '' }); 
        setZoneName('');
        // Refresh cities and update expandedCity from fresh data
        const refreshed = await fetch(`${API_BASE_URL}/api/super-admin/cities`, { headers }).then(r => r.json());
        const freshList = refreshed.data || [];
        setCities(freshList);
        if (expandedCity && expandedCity._id === zoneModal.cityId) {
          const updated = freshList.find(c => c._id === zoneModal.cityId);
          if (updated) setExpandedCity(updated);
        }
      }
      else alert(data.message || 'Failed to add zone');
    } catch { alert('Network error'); }
    finally { setZoneSubmitting(false); }
  };

  const handleDeleteZone = async (cityId, zoneId) => {
    if (!window.confirm('Delete this zone?')) return;
    try {
      const res = await fetch(`${API_BASE_URL}/api/super-admin/cities/${cityId}/zones/${zoneId}`, { method: 'DELETE', headers });
      if (res.ok) {
        fetchCities();
        // Update expanded city if view modal is open
        if (expandedCity && expandedCity._id === cityId) {
          setExpandedCity({
            ...expandedCity,
            zones: expandedCity.zones.filter(z => z._id !== zoneId)
          });
        }
      }
    } catch { alert('Network error'); }
  };

  const columns = [
    {
      key: 'srNo',
      label: 'Sr. No.',
      sortable: false,
      align: 'center',
      render: (_, rowIndex) => (
        <span className="text-gray-500 font-medium text-sm">
          {rowIndex + 1}
        </span>
      )
    },
    {
      key: 'city',
      label: 'City Name',
      sortable: true,
      render: (row) => (
        <div className="flex items-center gap-2 font-bold text-slate-800">
          <MapPin size={16} className="text-[#d4af37]" /> {row.city}
        </div>
      )
    },
    {
      key: 'zones',
      label: 'Zones',
      sortable: false,
      align: 'left',
      render: (row) => (
        <div className="flex flex-wrap gap-1.5 max-w-xs">
          {row.zones?.length > 0 ? (
            row.zones.map((zone, index) => (
              <span key={index} className="px-2 py-1 bg-[#d4af37]/10 text-[#a58523] rounded-md text-xs font-semibold whitespace-nowrap">
                {zone.name}
              </span>
            ))
          ) : (
            <span className="text-gray-400 text-xs italic">No zones added</span>
          )}
        </div>
      )
    },
    {
      key: 'isActive',
      label: 'Status',
      sortable: true,
      align: 'center',
      render: (row) => (
        <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
          row.isActive 
            ? 'bg-emerald-100 text-emerald-700' 
            : 'bg-red-100 text-red-700'
        }`}>
          {row.isActive ? 'Active' : 'Inactive'}
        </span>
      )
    },
    {
      key: 'actions',
      label: 'Actions',
      align: 'right',
      render: (row) => (
        <ActionDropdown 
          row={row} 
          onEdit={(r) => { setCityModal(true); setCityName(r.city); setEditCityId(r._id); }}
          onDelete={handleDeleteCity}
          onView={(r) => { setExpandedCity(r); setViewModalOpen(true); }}
          onToggleStatus={handleToggleCity}
          onAddZone={(r) => { setZoneModal({ open: true, cityId: r._id, cityName: r.city }); setZoneName(''); }}
        />
      )
    }
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">City & Zone Management</h1>
          <p className="text-slate-400 mt-1">Define service areas — cities and their delivery zones</p>
        </div>
        <button
          onClick={() => { setCityModal(true); setCityName(''); setEditCityId(null); }}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#d4af37] text-white hover:bg-[#b5952f] rounded-xl text-sm font-bold shadow-sm transition-all cursor-pointer"
        >
          <Plus size={18} /> Add City
        </button>
      </div>

      {error && <div className="bg-red-50 text-red-600 p-4 rounded-xl text-sm">{error}</div>}

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
        <DataTable
          data={cities}
          columns={columns}
          loading={loading}
          searchPlaceholder="Search cities..."
          searchTerm={search}
          onSearchChange={setSearch}
          totalItems={cities.length}
          totalPages={1}
          currentPage={1}
          onPageChange={() => {}}
        />
      </div>

      {/* Add/Edit City Modal */}
      {cityModal && (
        <div className="fixed inset-0 bg-gray-900/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-gray-900">{editCityId ? 'Edit City' : 'Add New City'}</h2>
              <button onClick={() => setCityModal(false)} className="text-gray-400 hover:text-gray-600 cursor-pointer"><X size={20} /></button>
            </div>
            <form onSubmit={handleCreateOrUpdateCity} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">City Name *</label>
                <input
                  type="text"
                  value={cityName}
                  onChange={e => setCityName(e.target.value)}
                  placeholder="e.g. Delhi"
                  required
                  autoFocus
                  className="w-full p-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-[#d4af37] outline-none"
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setCityModal(false)} className="flex-1 py-2.5 border border-gray-200 text-gray-700 font-bold text-xs rounded-xl hover:bg-gray-50 cursor-pointer">Cancel</button>
                <button type="submit" disabled={citySubmitting} className="flex-1 py-2.5 bg-[#d4af37] text-white font-bold text-xs rounded-xl hover:bg-[#b5952f] disabled:opacity-50 cursor-pointer">
                  {citySubmitting ? (editCityId ? 'Saving...' : 'Adding...') : (editCityId ? 'Save Changes' : 'Add City')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Zone Modal */}
      {zoneModal.open && (
        <div className="fixed inset-0 bg-gray-900/50 flex items-center justify-center p-4 z-[60]">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-gray-900">Add Zone — <span className="text-[#d4af37]">{zoneModal.cityName}</span></h2>
              <button onClick={() => setZoneModal({ open: false, cityId: null, cityName: '' })} className="text-gray-400 hover:text-gray-600 cursor-pointer"><X size={20} /></button>
            </div>
            <form onSubmit={handleAddZone} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Zone Name *</label>
                <input
                  type="text"
                  value={zoneName}
                  onChange={e => setZoneName(e.target.value)}
                  placeholder="e.g. North Delhi"
                  required
                  autoFocus
                  className="w-full p-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-[#d4af37] outline-none"
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setZoneModal({ open: false, cityId: null, cityName: '' })} className="flex-1 py-2.5 border border-gray-200 text-gray-700 font-bold text-xs rounded-xl hover:bg-gray-50 cursor-pointer">Cancel</button>
                <button type="submit" disabled={zoneSubmitting} className="flex-1 py-2.5 bg-[#d4af37] text-white font-bold text-xs rounded-xl hover:bg-[#b5952f] disabled:opacity-50 cursor-pointer">
                  {zoneSubmitting ? 'Adding...' : 'Add Zone'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Zones Modal */}
      {viewModalOpen && expandedCity && (
        <div className="fixed inset-0 bg-gray-900/50 flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl p-6 space-y-6">
            <div className="flex items-center justify-between border-b pb-4">
              <div>
                <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                  <MapPin className="text-[#d4af37]" size={24} /> 
                  Zones in {expandedCity.city}
                </h2>
                <p className="text-sm text-gray-500 mt-1">Manage all delivery zones for this city</p>
              </div>
              <button onClick={() => setViewModalOpen(false)} className="text-gray-400 hover:text-gray-600 cursor-pointer">
                <X size={24} />
              </button>
            </div>
            
            <div className="min-h-[200px] max-h-[60vh] overflow-y-auto custom-scrollbar pr-2">
              <div className="flex items-center justify-between mb-4">
                 <h3 className="font-bold text-slate-700">Total Zones ({expandedCity.zones.length})</h3>
                 <button
                    onClick={() => { setZoneModal({ open: true, cityId: expandedCity._id, cityName: expandedCity.city }); setZoneName(''); }}
                    className="inline-flex items-center gap-2 px-3 py-1.5 bg-[#d4af37]/10 text-[#a58523] hover:bg-[#d4af37]/20 rounded-lg text-sm font-bold transition-colors cursor-pointer"
                  >
                    <Plus size={16} /> Add Zone
                  </button>
              </div>

              {expandedCity.zones.length === 0 ? (
                <div className="bg-gray-50 border border-dashed border-gray-200 rounded-xl p-8 text-center">
                  <Map className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500 font-medium">No zones added yet.</p>
                  <p className="text-sm text-gray-400">Click on "Add Zone" to create delivery zones for {expandedCity.city}.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {expandedCity.zones.map(zone => (
                    <div key={zone._id} className="flex items-center justify-between p-3 bg-gray-50 border border-gray-100 rounded-xl hover:border-gray-200 transition-colors">
                      <span className="font-semibold text-slate-700">{zone.name}</span>
                      <button
                        onClick={() => handleDeleteZone(expandedCity._id, zone._id)}
                        className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                        title="Delete Zone"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            <div className="pt-4 border-t flex justify-end">
              <button
                onClick={() => setViewModalOpen(false)}
                className="px-6 py-2.5 bg-gray-100 text-gray-700 font-bold text-sm rounded-xl hover:bg-gray-200 cursor-pointer transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default CityZones;
