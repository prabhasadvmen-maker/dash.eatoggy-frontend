import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { MapPin, Navigation2, ShieldAlert, Bike, Loader2, Navigation, AlertTriangle } from 'lucide-react';
import API_BASE_URL from '../../services/apiService';

// Fix Leaflet's default icon path issue
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom Icon for delivery agents
const agentIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-orange.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

// Map Updater Component to center map on agents
const MapUpdater = ({ agents }) => {
  const map = useMap();
  useEffect(() => {
    if (agents && agents.length > 0) {
      const bounds = L.latLngBounds(agents.map(a => [a.currentLocation?.latitude || 28.6139, a.currentLocation?.longitude || 77.2090]));
      map.fitBounds(bounds, { padding: [50, 50] });
    }
  }, [agents, map]);
  return null;
};

const AdminLiveTracking = () => {
  const [agents, setAgents] = useState([]);
  const [apiKey, setApiKey] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedAgent, setSelectedAgent] = useState(null);

  // Default Center (New Delhi)
  const defaultCenter = [28.6139, 77.2090];

  const fetchTrackingData = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await fetch(`${API_BASE_URL}/api/admins/live-tracking`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('admin_token')}`
        }
      });
      const data = await response.json();
      if (response.ok) {
        setAgents(data.agents || []);
        setApiKey(data.geoapifyKey || '');
        if (!data.geoapifyKey) {
          setError('Geoapify API Key is missing. Map may not render properly.');
        }
      } else {
        setError(data.message || 'Failed to fetch live tracking data');
      }
    } catch (err) {
      setError('Network error connecting to server');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTrackingData();
    // Refresh every 30 seconds
    const interval = setInterval(fetchTrackingData, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-6 animate-fadeIn h-[calc(100vh-120px)] flex flex-col">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 shrink-0">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 flex items-center gap-2">
            <Navigation className="text-amber-500" /> Live Tracking
          </h1>
          <p className="text-slate-400 mt-1">Real-time location monitoring of delivery partners</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="px-4 py-2 bg-amber-50 border border-amber-100 rounded-xl flex items-center gap-2 shadow-sm">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-sm font-bold text-amber-800">{agents.length} Active Partners</span>
          </div>
          <button 
            onClick={fetchTrackingData}
            className="px-4 py-2 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 rounded-xl text-sm font-semibold shadow-sm transition-all"
          >
            Refresh
          </button>
        </div>
      </div>

      {error && !apiKey && (
        <div className="bg-red-50 text-red-600 p-4 rounded-xl flex items-center gap-3 shrink-0">
          <ShieldAlert size={20} />
          {error}
        </div>
      )}
      
      {error && apiKey && (
        <div className="bg-amber-50 text-amber-600 p-4 rounded-xl flex items-center gap-3 shrink-0">
          <AlertTriangle size={20} />
          {error}
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex flex-col lg:flex-row gap-6 flex-1 min-h-0">
        
        {/* Map View */}
        <div className="flex-1 bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden relative flex flex-col">
          {loading && agents.length === 0 ? (
            <div className="absolute inset-0 bg-white/80 z-50 flex items-center justify-center backdrop-blur-sm">
              <div className="flex flex-col items-center text-amber-600">
                <Loader2 className="animate-spin mb-2" size={32} />
                <p className="font-bold">Loading Live Map...</p>
              </div>
            </div>
          ) : null}

          {apiKey ? (
            <MapContainer 
              center={defaultCenter} 
              zoom={12} 
              className="w-full h-full z-0 flex-1"
            >
              <TileLayer
                url={`https://maps.geoapify.com/v1/tile/osm-bright/{z}/{x}/{y}.png?apiKey=${apiKey}`}
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors | <a href="https://www.geoapify.com/">Geoapify</a>'
              />
              <MapUpdater agents={agents} />
              
              {agents.map((agent) => (
                <Marker 
                  key={agent._id} 
                  position={[agent.currentLocation?.latitude || defaultCenter[0], agent.currentLocation?.longitude || defaultCenter[1]]}
                  icon={agentIcon}
                  eventHandlers={{
                    click: () => setSelectedAgent(agent)
                  }}
                >
                  <Popup className="rounded-xl font-sans">
                    <div className="text-center min-w-[150px]">
                      <div className="font-bold text-gray-900 mb-1 flex justify-center items-center gap-1">
                        <Bike size={14} className="text-amber-500" />
                        {agent.fullName || 'Partner'}
                      </div>
                      <div className="text-xs text-gray-500 mb-2">{agent.mobile}</div>
                      <span className="inline-block px-2 py-0.5 bg-emerald-50 text-emerald-600 text-[10px] font-bold rounded border border-emerald-100">
                        ONLINE
                      </span>
                    </div>
                  </Popup>
                </Marker>
              ))}
            </MapContainer>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-gray-400 bg-gray-50">
              <MapPin size={48} className="mb-4 text-gray-300" />
              <p className="font-semibold">Map is unavailable.</p>
              <p className="text-sm">Please check the Geoapify API key.</p>
            </div>
          )}
        </div>

        {/* Sidebar / List */}
        <div className="w-full lg:w-80 bg-white rounded-2xl shadow-sm border border-gray-100 flex flex-col overflow-hidden shrink-0">
          <div className="p-4 border-b border-gray-100 bg-slate-50 shrink-0">
            <h2 className="font-bold text-slate-800 flex items-center gap-2">
              <Navigation2 size={18} className="text-amber-500" />
              Active Partners
            </h2>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {agents.length === 0 && !loading && (
              <p className="text-center text-sm text-gray-400 py-8">No active delivery partners right now.</p>
            )}
            {agents.map((agent) => (
              <div 
                key={agent._id} 
                onClick={() => setSelectedAgent(agent)}
                className={`p-3 rounded-xl border ${selectedAgent?._id === agent._id ? 'border-amber-400 bg-amber-50/50' : 'border-gray-100 hover:border-amber-200'} cursor-pointer transition-colors flex items-center justify-between group`}
              >
                <div>
                  <h3 className="font-bold text-gray-900 text-sm group-hover:text-amber-700 transition-colors">{agent.fullName || 'Partner'}</h3>
                  <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                    <Bike size={12} className="text-gray-400" /> {agent.vehicleType || 'Bike'}
                  </p>
                </div>
                <div className="text-right">
                  <span className="block text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full mb-1">ONLINE</span>
                  <span className="text-[10px] text-gray-400 font-mono">{agent.mobile}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminLiveTracking;
