import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getCustomerOrdersAPI } from '../../services/customer/orderService.js';
import CustomerBottomNav from '../../components/customer/CustomerBottomNav.jsx';
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
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4 text-slate-100" data-testid="customer-orders-page">
        <div className="w-12 h-12 border-4 border-[#d4af37] border-t-transparent rounded-full animate-spin"></div>
        <p className="text-[#d4af37] mt-4 font-bold text-sm">Fetching your order history...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans flex flex-col pb-20" data-testid="customer-orders-page">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-slate-900 border-b border-slate-800 px-4 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/user/home')}
            className="w-10 h-10 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center hover:bg-slate-700 transition-colors cursor-pointer"
            data-testid="orders-back-btn"
          >
            <ArrowLeft size={18} className="text-white" />
          </button>
          <div>
            <h1 className="text-lg font-black text-white">My Orders</h1>
            <p className="text-xs text-slate-400">Order History & Tracking</p>
          </div>
        </div>

        <div className="flex items-center gap-1 text-xs text-[#d4af37] font-bold">
          <ShoppingBag size={16} />
          <span>{orders.length} Orders</span>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-3xl mx-auto w-full p-4 space-y-4">
        {error && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-2xl p-4 flex items-center gap-3 text-red-400 text-xs">
            <AlertCircle size={18} className="shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {orders.length === 0 ? (
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 text-center space-y-4 my-8 shadow-xl" data-testid="empty-orders-view">
            <UtensilsCrossed size={48} className="text-slate-600 mx-auto" />
            <div className="space-y-1">
              <h2 className="text-lg font-bold text-white">No Orders Placed Yet</h2>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
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
                  className="bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-3xl p-5 space-y-3 shadow-xl transition-all cursor-pointer group"
                  data-testid="customer-order-card"
                >
                  <div className="flex items-center justify-between border-b border-slate-800/60 pb-3">
                    <div className="flex items-center gap-3">
                      {ord.restaurantId?.documents?.restaurantImage ? (
                        <img
                          src={ord.restaurantId.documents.restaurantImage}
                          alt={ord.restaurantId.restaurantName}
                          className="w-10 h-10 rounded-2xl object-cover border border-slate-800"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-2xl bg-amber-500/10 text-[#d4af37] border border-amber-500/20 flex items-center justify-center font-bold">
                          <Store size={18} />
                        </div>
                      )}
                      <div>
                        <h3 className="font-bold text-white text-sm group-hover:text-[#d4af37] transition-colors" data-testid="restaurant-name">
                          {ord.restaurantId?.restaurantName || 'Restaurant'}
                        </h3>
                        <p className="text-[11px] text-slate-400 font-mono" data-testid="order-number">{ord.orderNumber}</p>
                      </div>
                    </div>

                    <span className={`px-2.5 py-0.5 border text-[10px] font-bold rounded-full uppercase ${getStatusBadgeClass(ord.orderStatus)}`} data-testid="order-status-badge">
                      {ord.orderStatus}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-xs">
                    <div className="min-w-0 max-w-[240px]">
                      <p className="text-slate-300 font-medium truncate" data-testid="order-items-summary">
                        {itemsText}
                      </p>
                      <p className="text-[11px] text-slate-500 mt-0.5 flex items-center gap-1" data-testid="order-date">
                        <Clock size={12} /> {formattedDate}
                      </p>
                    </div>

                    <div className="text-right flex items-center gap-2">
                      <div>
                        <p className="text-[10px] text-slate-400 uppercase font-bold">Total</p>
                        <p className="font-black text-[#d4af37] text-sm" data-testid="order-total">
                          ₹{ord.pricing?.grandTotal || 0}
                        </p>
                      </div>
                      <ChevronRight size={18} className="text-slate-500 group-hover:text-white transition-colors" />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      <CustomerBottomNav />
    </div>
  );
};

export default CustomerOrders;
