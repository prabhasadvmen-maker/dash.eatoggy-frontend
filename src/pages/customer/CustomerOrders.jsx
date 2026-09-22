import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getCustomerOrdersAPI } from '../../services/customer/orderService.js';

import {
  ShoppingBag,
  Store,
  Clock,
  ChevronRight,
  ArrowLeft,
  UtensilsCrossed,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

const CustomerOrders = () => {
  const navigate = useNavigate();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await getCustomerOrdersAPI();
        if (res.ok && res.data.success) {
          setOrders(res.data.data);
        } else {
          setError(res.data.message || 'Failed to fetch your orders');
        }
      } catch (err) {
        setError('Error loading orders history');
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'DELIVERED':
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
      case 'CANCELLED':
      case 'REJECTED':
        return 'bg-red-500/10 text-red-400 border-red-500/30';
      case 'PLACED':
      case 'ACCEPTED':
      case 'PREPARING':
      case 'READY':
      case 'OUT_FOR_DELIVERY':
      default:
        return 'bg-[#d4af37]/10 text-[#d4af37] border-[#d4af37]/30';
    }
  };

  if (loading) {
    return (
      <div className="space-y-6 max-w-7xl mx-auto pb-20">
        <div className="w-12 h-12 border-4 border-[#d4af37] border-t-transparent rounded-full animate-spin"></div>
        <p className="text-[#d4af37] mt-4 font-bold text-sm">Fetching your order history...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-20">
      {/* Main Content */}
      <main className="flex-1 max-w-3xl mx-auto w-full p-4 space-y-4">
        
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/user/home')}
              className="w-10 h-10 rounded-full bg-gray-50 border border-gray-200 flex items-center justify-center hover:bg-gray-100 transition-colors cursor-pointer"
              data-testid="orders-back-btn"
            >
              <ArrowLeft size={18} className="text-gray-900" />
            </button>
            <div>
              <h1 className="text-lg font-black text-gray-900">My Orders</h1>
              <p className="text-xs text-gray-500">Order History & Tracking</p>
            </div>
          </div>

          <div className="flex items-center gap-1 text-xs text-[#d4af37] font-bold bg-[#d4af37]/10 px-3 py-1.5 rounded-xl border border-[#d4af37]/20">
            <ShoppingBag size={16} />
            <span>{orders.length} Orders</span>
          </div>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-2xl p-4 flex items-center gap-3 text-red-400 text-xs">
            <AlertCircle size={18} className="shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {orders.length === 0 ? (
          <div className="bg-white border border-gray-100 rounded-3xl p-8 text-center space-y-4 my-8 shadow-xl" data-testid="empty-orders-view">
            <UtensilsCrossed size={48} className="text-gray-300 mx-auto" />
            <div className="space-y-1">
              <h2 className="text-lg font-bold text-gray-900">No Orders Placed Yet</h2>
              <p className="text-xs text-gray-500 max-w-sm mx-auto">
                Explore our gourmet menu items and order your favorite meals today!
              </p>
            </div>
            <button
              onClick={() => navigate('/user/home')}
              className="px-6 py-2.5 bg-[#d4af37] hover:brightness-110 text-slate-950 font-bold rounded-xl text-xs uppercase cursor-pointer"
            >
              Browse Restaurants
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {orders.map((ord) => {
              const itemsCount = ord.items ? ord.items.length : 0;
              const itemsText = ord.items
                ? ord.items.map(i => `${i.quantity}x ${i.foodNameSnapshot}`).join(', ')
                : '';

              const formattedDate = ord.createdAt
                ? new Date(ord.createdAt).toLocaleDateString('en-IN', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })
                : '';

              return (
                <div
                  key={ord._id}
                  onClick={() => navigate(`/user/orders/${ord._id}`)}
                  className="bg-white border border-gray-100 hover:border-gray-200 rounded-3xl p-5 space-y-3 shadow-xl transition-all cursor-pointer group"
                  data-testid="customer-order-card"
                >
                  <div className="flex items-center justify-between border-b border-gray-100/60 pb-3">
                    <div className="flex items-center gap-3">
                      {ord.restaurantId?.documents?.restaurantImage ? (
                        <img
                          src={ord.restaurantId.documents.restaurantImage}
                          alt={ord.restaurantId.restaurantName}
                          className="w-10 h-10 rounded-2xl object-cover border border-gray-100"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-2xl bg-amber-500/10 text-[#d4af37] border border-amber-500/20 flex items-center justify-center font-bold">
                          <Store size={18} />
                        </div>
                      )}
                      <div>
                        <h3 className="font-bold text-gray-900 text-sm group-hover:text-[#d4af37] transition-colors" data-testid="restaurant-name">
                          {ord.restaurantId?.restaurantName || 'Restaurant'}
                        </h3>
                        <p className="text-[11px] text-gray-500 font-mono" data-testid="order-number">{ord.orderNumber}</p>
                      </div>
                    </div>

                    <span className={`px-2.5 py-0.5 border text-[10px] font-bold rounded-full uppercase ${getStatusBadgeClass(ord.orderStatus)}`} data-testid="order-status-badge">
                      {ord.orderStatus}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-xs">
                    <div className="min-w-0 max-w-[240px]">
                      <p className="text-gray-700 font-medium truncate" data-testid="order-items-summary">
                        {itemsText}
                      </p>
                      <p className="text-[11px] text-gray-400 mt-0.5 flex items-center gap-1" data-testid="order-date">
                        <Clock size={12} /> {formattedDate}
                      </p>
                    </div>

                    <div className="text-right flex items-center gap-2">
                      <div>
                        <p className="text-[10px] text-gray-500 uppercase font-bold">Total</p>
                        <p className="font-black text-[#d4af37] text-sm" data-testid="order-total">
                          ₹{ord.pricing?.grandTotal || 0}
                        </p>
                      </div>
                      <ChevronRight size={18} className="text-gray-400 group-hover:text-gray-900 transition-colors" />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      
    </div>
  );
};

export default CustomerOrders;
