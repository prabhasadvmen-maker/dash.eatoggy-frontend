import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  HelpCircle,
  Plus,
  MessageSquare,
  Clock,
  CheckCircle2,
  AlertCircle,
  ChevronRight,
  Send,
  X,
  ShoppingBag,
  ArrowLeft,
  ShieldCheck
} from 'lucide-react';
import API_BASE_URL from '../../services/apiService';


const CustomerSupport = () => {
  const navigate = useNavigate();
  const [tickets, setTickets] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTicket, setActiveTicket] = useState(null);
  const [replyMessage, setReplyMessage] = useState('');
  const [sendingReply, setSendingReply] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Form State
  const [subject, setSubject] = useState('');
  const [category, setCategory] = useState('ORDER_ISSUE');
  const [priority, setPriority] = useState('MEDIUM');
  const [orderId, setOrderId] = useState('');
  const [description, setDescription] = useState('');
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    fetchTickets();
    fetchOrders();
  }, []);

  const fetchTickets = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('customer_token') || localStorage.getItem('token');
      const res = await fetch(`${API_BASE_URL}/api/support/tickets/my`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) {
        setTickets(data.data || []);
      } else {
        setError(data.message || 'Failed to fetch tickets');
      }
    } catch (err) {
      setError('Network error while fetching support tickets');
    } finally {
      setLoading(false);
    }
  };

  const fetchOrders = async () => {
    try {
      const token = localStorage.getItem('customer_token') || localStorage.getItem('token');
      const res = await fetch(`${API_BASE_URL}/api/customers/orders`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) {
        setOrders(data.data || []);
      }
    } catch (err) {
      console.error('Failed to fetch orders for support context', err);
    }
  };

  const handleCreateTicket = async (e) => {
    e.preventDefault();
    if (!subject.trim() || !description.trim()) return;
    setCreating(true);

    try {
      const token = localStorage.getItem('customer_token') || localStorage.getItem('token');
      const res = await fetch(`${API_BASE_URL}/api/support/tickets`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          subject: subject.trim(),
          category,
          priority,
          orderId: orderId || null,
          description: description.trim()
        })
      });

      const data = await res.json();
      if (res.ok) {
        setTickets([data.data, ...tickets]);
        setShowCreateModal(false);
        setSubject('');
        setDescription('');
        setOrderId('');
        setActiveTicket(data.data);
      } else {
        alert(data.message || 'Failed to create support ticket');
      }
    } catch (err) {
      alert('Network error while creating ticket');
    } finally {
      setCreating(false);
    }
  };

  const handleSendReply = async (e) => {
    e.preventDefault();
    if (!activeTicket || !replyMessage.trim()) return;
    setSendingReply(true);

    try {
      const token = localStorage.getItem('customer_token') || localStorage.getItem('token');
      const res = await fetch(`${API_BASE_URL}/api/support/tickets/${activeTicket._id}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          message: replyMessage.trim(),
          senderName: 'Customer'
        })
      });

      const data = await res.json();
      if (res.ok) {
        setActiveTicket(data.data);
        setTickets(tickets.map(t => (t._id === data.data._id ? data.data : t)));
        setReplyMessage('');
      } else {
        alert(data.message || 'Failed to send reply');
      }
    } catch (err) {
      alert('Network error while sending reply');
    } finally {
      setSendingReply(false);
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const filteredTickets = tickets.filter(t => {
    if (statusFilter === 'ALL') return true;
    return t.status === statusFilter;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-20">
      <main className="max-w-5xl mx-auto px-4 py-6 space-y-6">
        
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/user/dashboard')}
              className="p-2 rounded-xl bg-gray-50 border border-gray-200 text-gray-500 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft size={18} />
            </button>
            <div>
              <h1 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <HelpCircle className="text-[#d4af37]" size={20} /> Customer Help & Support
              </h1>
              <p className="text-xs text-gray-500">Get assistance with orders, payments, subscriptions & accounts</p>
            </div>
          </div>

          <button
            onClick={() => setShowCreateModal(true)}
            className="px-3.5 py-2 bg-[#d4af37] text-slate-950 hover:bg-[#c5a028] font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-lg shadow-[#d4af37]/10 transition-colors"
          >
            <Plus size={16} /> New Support Ticket
          </button>
        </div>
        {/* Status Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          {['ALL', 'OPEN', 'IN_PROGRESS', 'WAITING_FOR_CUSTOMER', 'RESOLVED', 'CLOSED'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-colors ${
                statusFilter === st
                  ? 'bg-[#d4af37] text-slate-950 shadow'
                  : 'bg-white text-gray-500 border border-gray-100 hover:text-slate-200'
              }`}
            >
              {st.replace(/_/g, ' ')}
            </button>
          ))}
        </div>

        {/* Tickets Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-3">
            {loading ? (
              <div className="p-8 text-center text-gray-400 bg-white/60 rounded-2xl border border-gray-100">
                Loading support tickets...
              </div>
            ) : filteredTickets.length === 0 ? (
              <div className="p-12 text-center bg-white/60 rounded-2xl border border-gray-100 space-y-3">
                <HelpCircle size={40} className="mx-auto text-gray-300" />
                <p className="text-sm font-semibold text-gray-500">No support tickets found</p>
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="px-4 py-2 bg-[#d4af37]/10 text-[#d4af37] border border-[#d4af37]/30 rounded-xl text-xs font-bold hover:bg-[#d4af37]/20"
                >
                  Create Support Ticket
                </button>
              </div>
            ) : (
              filteredTickets.map((t) => (
                <div
                  key={t._id}
                  onClick={() => setActiveTicket(t)}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer space-y-2 ${
                    activeTicket?._id === t._id
                      ? 'bg-white border-[#d4af37] shadow-lg shadow-[#d4af37]/5'
                      : 'bg-white/60 border-gray-100 hover:border-gray-200'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-bold text-[#d4af37]">{t.ticketNumber}</span>
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold ${
                        t.status === 'OPEN'
                          ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                          : t.status === 'RESOLVED'
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                          : 'bg-gray-50 text-gray-700 border border-gray-200'
                      }`}
                    >
                      {t.status.replace(/_/g, ' ')}
                    </span>
                  </div>

                  <h3 className="font-bold text-sm text-gray-900 line-clamp-1">{t.subject}</h3>
                  <p className="text-xs text-gray-500 line-clamp-2">{t.description}</p>

                  <div className="flex items-center justify-between text-[10px] text-gray-400 pt-2 border-t border-gray-100/80">
                    <span>Category: {t.category.replace(/_/g, ' ')}</span>
                    <span>{formatDate(t.createdAt)}</span>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Ticket Details & Chat Panel */}
          <div className="bg-white border border-gray-100 rounded-2xl p-5 space-y-4 flex flex-col justify-between h-[520px]">
            {activeTicket ? (
              <>
                <div className="space-y-3">
                  <div className="border-b border-gray-100 pb-3 flex justify-between items-start">
                    <div>
                      <span className="font-mono text-xs font-bold text-[#d4af37]">{activeTicket.ticketNumber}</span>
                      <h2 className="font-bold text-base text-gray-900 mt-0.5">{activeTicket.subject}</h2>
                      <p className="text-xs text-gray-500">
                        Category: {activeTicket.category.replace(/_/g, ' ')} | Priority: {activeTicket.priority}
                      </p>
                    </div>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        activeTicket.status === 'OPEN'
                          ? 'bg-amber-500/20 text-amber-400'
                          : activeTicket.status === 'RESOLVED'
                          ? 'bg-emerald-500/20 text-emerald-400'
                          : 'bg-gray-50 text-gray-700'
                      }`}
                    >
                      {activeTicket.status}
                    </span>
                  </div>

                  {activeTicket.orderId && (
                    <div className="p-2.5 bg-transparent rounded-xl border border-gray-100 text-xs flex items-center justify-between text-gray-700">
                      <span className="flex items-center gap-1.5">
                        <ShoppingBag size={14} className="text-[#d4af37]" /> Linked Order ID:
                      </span>
                      <span className="font-mono font-bold text-gray-900">
                        {activeTicket.orderId.orderId || activeTicket.orderId}
                      </span>
                    </div>
                  )}

                  {/* Messages Thread */}
                  <div className="space-y-3 overflow-y-auto max-h-64 pr-1">
                    {(activeTicket.messages || []).map((msg, idx) => (
                      <div
                        key={idx}
                        className={`p-3 rounded-xl text-xs space-y-1 ${
                          msg.senderType === 'SUPER_ADMIN' || msg.senderType === 'SUPPORT_AGENT'
                            ? 'bg-[#d4af37]/10 border border-[#d4af37]/30 text-gray-900 ml-3'
                            : 'bg-gray-50/80 border border-gray-200 text-slate-200 mr-3'
                        }`}
                      >
                        <div className="flex justify-between font-bold text-[10px] text-gray-500">
                          <span>{msg.senderName} ({msg.senderType})</span>
                          <span>{formatDate(msg.createdAt)}</span>
                        </div>
                        <p className="whitespace-pre-wrap">{msg.message}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Reply Form */}
                <form onSubmit={handleSendReply} className="pt-3 border-t border-gray-100 space-y-2">
                  <textarea
                    value={replyMessage}
                    onChange={(e) => setReplyMessage(e.target.value)}
                    placeholder="Type your message or reply..."
                    rows="2"
                    required
                    className="w-full p-3 bg-transparent border border-gray-100 rounded-xl text-xs text-gray-900 focus:border-[#d4af37] outline-none resize-none"
                  />
                  <button
                    type="submit"
                    disabled={sendingReply}
                    className="w-full py-2 bg-[#d4af37] text-slate-950 font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 hover:bg-[#c5a028] disabled:opacity-50"
                  >
                    <Send size={14} /> Send Message
                  </button>
                </form>
              </>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 text-gray-400 space-y-2">
                <MessageSquare size={36} className="text-gray-300" />
                <p className="text-xs font-semibold text-gray-500">Select a ticket from the left panel to view thread & reply</p>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Create Ticket Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-transparent/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-gray-100 rounded-2xl w-full max-w-lg p-6 space-y-4 relative shadow-2xl">
            <button
              onClick={() => setShowCreateModal(false)}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-900 p-1"
            >
              <X size={20} />
            </button>

            <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <HelpCircle className="text-[#d4af37]" size={20} /> Submit Support Ticket
            </h2>

            <form onSubmit={handleCreateTicket} className="space-y-3 text-xs">
              <div>
                <label className="block text-gray-500 font-semibold mb-1">Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full p-2.5 bg-transparent border border-gray-100 rounded-xl text-gray-900 focus:border-[#d4af37] outline-none"
                >
                  <option value="ORDER_ISSUE">Order Issue</option>
                  <option value="PAYMENT">Payment Issue</option>
                  <option value="REFUND">Refund Request</option>
                  <option value="DELIVERY">Delivery Issue</option>
                  <option value="RESTAURANT">Restaurant Complaint</option>
                  <option value="SUBSCRIPTION">Tiffin Subscription</option>
                  <option value="ACCOUNT">Account Issue</option>
                  <option value="TECHNICAL">Technical Bug</option>
                  <option value="OTHER">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-gray-500 font-semibold mb-1">Priority</label>
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value)}
                  className="w-full p-2.5 bg-transparent border border-gray-100 rounded-xl text-gray-900 focus:border-[#d4af37] outline-none"
                >
                  <option value="LOW">Low</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="HIGH">High</option>
                  <option value="URGENT">Urgent</option>
                </select>
              </div>

              {orders.length > 0 && (
                <div>
                  <label className="block text-gray-500 font-semibold mb-1">Linked Order (Optional)</label>
                  <select
                    value={orderId}
                    onChange={(e) => setOrderId(e.target.value)}
                    className="w-full p-2.5 bg-transparent border border-gray-100 rounded-xl text-gray-900 focus:border-[#d4af37] outline-none"
                  >
                    <option value="">None / Not Order Specific</option>
                    {orders.map((o) => (
                      <option key={o._id} value={o._id}>
                        Order #{o.orderId || o._id.slice(-6)} - ₹{o.grandTotal} ({o.status})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div>
                <label className="block text-gray-500 font-semibold mb-1">Subject</label>
                <input
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="Summary of issue..."
                  required
                  className="w-full p-2.5 bg-transparent border border-gray-100 rounded-xl text-gray-900 focus:border-[#d4af37] outline-none"
                />
              </div>

              <div>
                <label className="block text-gray-500 font-semibold mb-1">Description</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Detailed description of problem..."
                  rows="3"
                  required
                  className="w-full p-2.5 bg-transparent border border-gray-100 rounded-xl text-gray-900 focus:border-[#d4af37] outline-none resize-none"
                />
              </div>

              <button
                type="submit"
                disabled={creating}
                className="w-full py-2.5 bg-[#d4af37] text-slate-950 font-bold rounded-xl hover:bg-[#c5a028] disabled:opacity-50 transition-colors mt-2"
              >
                {creating ? 'Submitting...' : 'Submit Support Ticket'}
              </button>
            </form>
          </div>
        </div>
      )}

      
    </div>
  );
};

export default CustomerSupport;
