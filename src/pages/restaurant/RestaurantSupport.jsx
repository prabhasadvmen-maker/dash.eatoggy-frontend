import React, { useState, useEffect } from 'react';
import {
  HelpCircle,
  Plus,
  MessageSquare,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Send,
  X,
  ShoppingBag,
  ShieldCheck,
  Search,
  Filter
} from 'lucide-react';
import API_BASE_URL from '../../services/apiService';

const RestaurantSupport = () => {
  const [tickets, setTickets] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTicket, setActiveTicket] = useState(null);
  const [replyMessage, setReplyMessage] = useState('');
  const [sendingReply, setSendingReply] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [statusFilter, setStatusFilter] = useState('');

  // Form State
  const [subject, setSubject] = useState('');
  const [category, setCategory] = useState('RESTAURANT');
  const [priority, setPriority] = useState('MEDIUM');
  const [orderId, setOrderId] = useState('');
  const [description, setDescription] = useState('');
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    fetchTickets();
    fetchOrders();
  }, [statusFilter]);

  const fetchTickets = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('restaurant_token') || localStorage.getItem('token');
      const query = statusFilter ? `?status=${statusFilter}` : '';
      const res = await fetch(`${API_BASE_URL}/api/support/tickets/restaurant/my${query}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) {
        setTickets(data.data || []);
      } else {
        setError(data.message || 'Failed to fetch support tickets');
      }
    } catch (err) {
      setError('Network error while fetching tickets');
    } finally {
      setLoading(false);
    }
  };

  const fetchOrders = async () => {
    try {
      const token = localStorage.getItem('restaurant_token') || localStorage.getItem('token');
      const res = await fetch(`${API_BASE_URL}/api/restaurants/orders`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) {
        setOrders(data.data || []);
      }
    } catch (err) {
      console.error('Failed to fetch orders for restaurant support context', err);
    }
  };

  const handleCreateTicket = async (e) => {
    e.preventDefault();
    if (!subject.trim() || !description.trim()) return;
    setCreating(true);

    try {
      const token = localStorage.getItem('restaurant_token') || localStorage.getItem('token');
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
      const token = localStorage.getItem('restaurant_token') || localStorage.getItem('token');
      const res = await fetch(`${API_BASE_URL}/api/support/tickets/${activeTicket._id}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          message: replyMessage.trim(),
          senderName: 'Restaurant Manager'
        })
      });

      const data = await res.json();
      if (res.ok) {
        setActiveTicket(data.data);
        setTickets(tickets.map((t) => (t._id === data.data._id ? data.data : t)));
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
    if (!dateStr) return 'N/A';
    return new Date(dateStr).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Restaurant Partner Help & Support</h1>
          <p className="text-slate-400 text-sm mt-1">
            Submit issues regarding order fulfillments, payouts, menus, or platform technical bugs
          </p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="px-4 py-2.5 bg-[#d4af37] text-slate-900 hover:bg-[#c5a028] font-bold text-xs rounded-xl flex items-center gap-2 shadow-sm transition-colors"
        >
          <Plus size={16} /> New Support Request
        </button>
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-xl flex items-center gap-3 text-xs font-semibold">
          <AlertTriangle size={18} /> {error}
        </div>
      )}

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex gap-4 items-center">
        <Filter size={16} className="text-gray-400" />
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3.5 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold text-gray-700 outline-none focus:ring-2 focus:ring-[#d4af37]"
        >
          <option value="">All Ticket Statuses</option>
          <option value="OPEN">Open</option>
          <option value="IN_PROGRESS">In Progress</option>
          <option value="WAITING_FOR_PARTNER">Waiting for Partner</option>
          <option value="RESOLVED">Resolved</option>
          <option value="CLOSED">Closed</option>
        </select>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Tickets List Table */}
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-gray-600">
              <thead className="bg-gray-50 border-b border-gray-100 text-gray-400 uppercase text-[11px] font-semibold">
                <tr>
                  <th className="px-6 py-3.5">Ticket #</th>
                  <th className="px-6 py-3.5">Category</th>
                  <th className="px-6 py-3.5">Subject</th>
                  <th className="px-6 py-3.5 text-center">Priority</th>
                  <th className="px-6 py-3.5 text-center">Status</th>
                  <th className="px-6 py-3.5 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {loading ? (
                  <tr>
                    <td colSpan="6" className="px-6 py-8 text-center text-gray-400">
                      Loading support tickets...
                    </td>
                  </tr>
                ) : tickets.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="px-6 py-8 text-center text-gray-400">
                      No support tickets found.
                    </td>
                  </tr>
                ) : (
                  tickets.map((t) => (
                    <tr
                      key={t._id}
                      onClick={() => setActiveTicket(t)}
                      className={`hover:bg-gray-50 cursor-pointer transition-colors ${
                        activeTicket?._id === t._id ? 'bg-amber-50/40' : ''
                      }`}
                    >
                      <td className="px-6 py-4 font-bold text-slate-800 font-mono text-xs">{t.ticketNumber}</td>
                      <td className="px-6 py-4 text-xs font-semibold text-slate-600">
                        {t.category.replace(/_/g, ' ')}
                      </td>
                      <td className="px-6 py-4 text-xs font-medium text-slate-800 max-w-xs truncate">
                        {t.subject}
                      </td>
                      <td className="px-6 py-4 text-center font-bold text-xs">{t.priority}</td>
                      <td className="px-6 py-4 text-center">
                        <span
                          className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                            t.status === 'OPEN'
                              ? 'bg-amber-100 text-amber-800'
                              : t.status === 'RESOLVED'
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-gray-100 text-gray-700'
                          }`}
                        >
                          {t.status.replace(/_/g, ' ')}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setActiveTicket(t);
                          }}
                          className="px-3 py-1.5 bg-slate-800 text-white rounded-lg text-xs font-semibold hover:bg-slate-700"
                        >
                          View Thread
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Ticket Details & Chat Panel */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 space-y-4 flex flex-col justify-between min-h-[460px]">
          {activeTicket ? (
            <>
              <div className="space-y-3">
                <div className="flex justify-between items-start border-b border-gray-100 pb-3">
                  <div>
                    <span className="font-mono text-xs font-bold text-amber-600">{activeTicket.ticketNumber}</span>
                    <h2 className="text-base font-bold text-slate-800 mt-0.5">{activeTicket.subject}</h2>
                    <p className="text-xs text-slate-400">
                      Category: {activeTicket.category.replace(/_/g, ' ')} | Priority: {activeTicket.priority}
                    </p>
                  </div>
                  <span
                    className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                      activeTicket.status === 'OPEN'
                        ? 'bg-amber-100 text-amber-800'
                        : activeTicket.status === 'RESOLVED'
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-gray-100 text-gray-700'
                    }`}
                  >
                    {activeTicket.status}
                  </span>
                </div>

                {activeTicket.orderId && (
                  <div className="p-2.5 bg-gray-50 rounded-xl border border-gray-200 text-xs flex items-center justify-between text-slate-600">
                    <span className="flex items-center gap-1.5 font-medium">
                      <ShoppingBag size={14} className="text-amber-600" /> Linked Order:
                    </span>
                    <span className="font-mono font-bold text-slate-800">
                      {activeTicket.orderId.orderId || activeTicket.orderId}
                    </span>
                  </div>
                )}

                {/* Messages Thread */}
                <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
                  {(activeTicket.messages || []).map((msg, idx) => (
                    <div
                      key={idx}
                      className={`p-3 rounded-xl text-xs space-y-1 ${
                        msg.senderType === 'SUPER_ADMIN' || msg.senderType === 'SUPPORT_AGENT'
                          ? 'bg-amber-50 text-slate-800 border border-amber-200/60 ml-3'
                          : 'bg-slate-50 text-slate-700 border border-gray-100 mr-3'
                      }`}
                    >
                      <div className="flex justify-between font-bold text-[10px] text-slate-400">
                        <span>
                          {msg.senderName} ({msg.senderType})
                        </span>
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
                  placeholder="Type message to support officers..."
                  rows="3"
                  required
                  className="w-full p-3 border border-gray-200 rounded-xl text-xs focus:ring-2 focus:ring-[#d4af37] outline-none resize-none"
                />
                <button
                  type="submit"
                  disabled={sendingReply}
                  className="w-full py-2.5 bg-[#d4af37] hover:bg-[#c5a028] text-slate-900 font-bold text-xs rounded-xl flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  <Send size={14} /> Send Message to Helpdesk
                </button>
              </form>
            </>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-400 space-y-2">
              <MessageSquare size={36} className="text-slate-300" />
              <p className="text-xs font-semibold">Select a ticket to inspect conversation thread and reply</p>
            </div>
          )}
        </div>
      </div>

      {/* Create Ticket Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 space-y-4 relative shadow-xl border border-gray-100">
            <button
              onClick={() => setShowCreateModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1"
            >
              <X size={20} />
            </button>

            <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <HelpCircle className="text-[#d4af37]" size={20} /> Create Support Request
            </h2>

            <form onSubmit={handleCreateTicket} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-600 font-semibold mb-1">Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-[#d4af37]"
                >
                  <option value="RESTAURANT">Restaurant Operations</option>
                  <option value="ORDER_ISSUE">Order Fulfillment</option>
                  <option value="PAYMENT">Payouts & Settlements</option>
                  <option value="SUBSCRIPTION">Tiffin Subscriptions</option>
                  <option value="TECHNICAL">Menu / Technical Bug</option>
                  <option value="OTHER">Other Query</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-600 font-semibold mb-1">Priority</label>
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value)}
                  className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-[#d4af37]"
                >
                  <option value="LOW">Low</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="HIGH">High</option>
                  <option value="URGENT">Urgent</option>
                </select>
              </div>

              {orders.length > 0 && (
                <div>
                  <label className="block text-slate-600 font-semibold mb-1">Linked Order (Optional)</label>
                  <select
                    value={orderId}
                    onChange={(e) => setOrderId(e.target.value)}
                    className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-[#d4af37]"
                  >
                    <option value="">None / Platform General</option>
                    {orders.map((o) => (
                      <option key={o._id} value={o._id}>
                        Order #{o.orderId || o._id.slice(-6)} - ₹{o.grandTotal} ({o.status})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div>
                <label className="block text-slate-600 font-semibold mb-1">Subject</label>
                <input
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="Summary of query..."
                  required
                  className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-[#d4af37]"
                />
              </div>

              <div>
                <label className="block text-slate-600 font-semibold mb-1">Description</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Detailed description of problem..."
                  rows="3"
                  required
                  className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-[#d4af37] resize-none"
                />
              </div>

              <button
                type="submit"
                disabled={creating}
                className="w-full py-2.5 bg-[#d4af37] hover:bg-[#c5a028] text-slate-900 font-bold rounded-xl transition-colors disabled:opacity-50 mt-2"
              >
                {creating ? 'Submitting Request...' : 'Submit Support Request'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default RestaurantSupport;
