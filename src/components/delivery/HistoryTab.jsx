import React, { useState, useEffect } from 'react';
import { Card, StatusBadge, Pagination } from '../common';
import { getCompletedDeliveries } from '../../services/delivery/deliveryOrderService';
import { Clock, MapPin, Navigation, IndianRupee, Search, Calendar } from 'lucide-react';
import { toast } from 'react-toastify';

const HistoryTab = () => {
  const [deliveries, setDeliveries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  
  const fetchHistory = async (pageNum = 1) => {
    try {
      setLoading(true);
      const response = await getCompletedDeliveries(pageNum, 10);
      if (response.success && response.data) {
        setDeliveries(response.data.deliveries || []);
        setTotalPages(response.data.pagination?.totalPages || 1);
        setPage(pageNum);
      }
    } catch (error) {
      toast.error('Failed to load history');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory(1);
  }, []);

  const handlePageChange = (newPage) => {
    fetchHistory(newPage);
  };

  const filteredDeliveries = deliveries.filter(d => 
    (d.orderNumber || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (d.restaurantName || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-2">
        <h2 className="text-xl font-bold text-slate-800">Delivery History</h2>
        
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search size={16} className="text-slate-400" />
          </div>
          <input
            type="text"
            className="block w-full pl-10 pr-3 py-2 border border-slate-300 rounded-lg leading-5 bg-white placeholder-slate-500 focus:outline-none focus:placeholder-slate-400 focus:border-[#d4af37] focus:ring-1 focus:ring-[#d4af37] sm:text-sm transition duration-150 ease-in-out"
            placeholder="Search order # or restaurant"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3, 4].map(i => (
            <Card key={i} className="p-4 animate-pulse flex flex-col md:flex-row justify-between">
              <div className="space-y-3 w-full md:w-2/3">
                <div className="h-4 bg-slate-200 rounded w-1/4"></div>
                <div className="h-4 bg-slate-200 rounded w-3/4"></div>
                <div className="h-4 bg-slate-200 rounded w-1/2"></div>
              </div>
              <div className="mt-4 md:mt-0 h-10 bg-slate-200 rounded w-24"></div>
            </Card>
          ))}
        </div>
      ) : filteredDeliveries.length === 0 ? (
        <Card className="p-10 text-center bg-slate-50 border-dashed border-2 border-slate-300">
          <Clock size={48} className="mx-auto text-slate-400 mb-3" />
          <h3 className="text-lg font-semibold text-slate-700 mb-1">No history found</h3>
          <p className="text-slate-500 text-sm">
            {searchQuery ? 'No deliveries matched your search.' : 'You haven\'t completed any deliveries yet.'}
          </p>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredDeliveries.map(delivery => (
            <Card key={delivery._id} className="p-0 overflow-hidden hover:shadow-md transition-shadow">
              <div className="bg-slate-50 p-4 border-b border-slate-200 flex justify-between items-center">
                <div>
                  <p className="font-bold text-slate-800">
                    Order #{delivery.orderNumber || delivery._id.substring(0, 8).toUpperCase()}
                  </p>
                  <p className="text-xs text-slate-500 flex items-center mt-1">
                    <Calendar size={12} className="mr-1" />
                    {new Date(delivery.createdAt || Date.now()).toLocaleString()}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-green-600 flex items-center justify-end">
                    <IndianRupee size={16} /> {delivery.deliveryFee || '0'}
                  </p>
                  <StatusBadge status={delivery.status || 'DELIVERED'} />
                </div>
              </div>
              
              <div className="p-4">
                <div className="flex items-start mb-3">
                  <div className="bg-slate-100 p-2 rounded-full mr-3 text-slate-500 mt-1">
                    <MapPin size={16} />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Pickup</p>
                    <p className="text-sm font-medium text-slate-800">{delivery.restaurantName || 'Restaurant'}</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="bg-amber-50 p-2 rounded-full mr-3 text-[#d4af37] mt-1">
                    <Navigation size={16} />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-[#d4af37] uppercase tracking-wide">Drop</p>
                    <p className="text-sm font-medium text-slate-800 line-clamp-1">
                      {delivery.customerAddress?.addressLine1 || delivery.dropLocation || 'Customer Address'}
                    </p>
                  </div>
                </div>
              </div>
            </Card>
          ))}
          
          {totalPages > 1 && (
            <div className="mt-6 flex justify-center">
              <Pagination 
                currentPage={page} 
                totalPages={totalPages} 
                onPageChange={handlePageChange} 
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default HistoryTab;
