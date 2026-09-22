import React, { useState, useEffect, useCallback } from 'react';
import {
  HelpCircle,
  Plus,
  MessageSquare,
  Send,
  X,
  ShoppingBag,
  AlertTriangle
} from 'lucide-react';
import API_BASE_URL from '../../services/apiService';
import DataTable from '../../components/common/Table/DataTable';
import { useDataTableSync } from '../../hooks/useDataTableSync';

const RestaurantSupport = () => {
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

  const [tickets, setTickets] = useState([]);
  const [total, setTotal] = useState(0);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [activeTicket, setActiveTicket] = useState(null);
  const [replyMessage, setReplyMessage] = useState('');
  const [sendingReply, setSendingReply] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Form State
  const [subject, setSubject] = useState('');
  const [category, setCategory] = useState('RESTAURANT');
  const [priority, setPriority] = useState('MEDIUM');
  const [orderId, setOrderId] = useState('');
  const [description, setDescription] = useState('');
  const [creating, setCreating] = useState(false);

  const fetchTickets = useCallback(async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('restaurant_token') || localStorage.getItem('token');
      
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

      const res = await fetch(`${API_BASE_URL}/api/support/tickets/restaurant/my?${queryParams.toString()}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setTickets(data.data || []);
        if (data.meta && data.meta.pagination) {
          setTotal(data.meta.pagination.total);
        } else {
          setTotal(data.data?.length || 0);
        }
      } else {
        setError(data.message || 'Failed to fetch support tickets');
        setTickets([]);
        setTotal(0);
      }
    } catch (err) {
      setError('Network error while fetching tickets');
      setTickets([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }, [page, limit, search, sortBy, sortOrder, filters]);

  useEffect(() => {
    fetchTickets();
  }, [fetchTickets]);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const token = localStorage.getItem('restaurant_token') || localStorage.getItem('token');
      // For creating a ticket related to an order we might fetch last 20 recent orders, but this depends on endpoint.
      // Leaving as is.
      const res = await fetch(`${API_BASE_URL}/api/restaurants/orders`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) {
        // Just use the first 50 orders to prevent massive dropdowns if they don't paginate
        setOrders(data.data?.slice(0, 50) || []);
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
        fetchTickets();
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
        fetchTickets(); // refresh list to update counts or status if auto-updated
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

  const columns = [
    {
      key: 'ticketNumber',
      label: 'Ticket #',
      sortable: true,
      render: (row) => (
        <span className="font-bold text-slate-800 font-mono text-xs cursor-pointer hover:text-[#d4af37]" onClick={() => setActiveTicket(row)}>
          {row.ticketNumber}
        </span>
      )
    },
    {
      key: 'category',
      label: 'Category',
      sortable: true,
      render: (row) => (
        <span className="text-xs font-semibold text-slate-600">
          {row.category.replace(/_/g, ' ')}
        </span>
      )
    },
    {
      key: 'subject',
      label: 'Subject',
      sortable: true,
      render: (row) => (
        <span className="text-xs font-medium text-slate-800 max-w-xs truncate block cursor-pointer hover:text-[#d4af37]" onClick={() => setActiveTicket(row)}>
          {row.subject}
        </span>
      )
    },
    {
      key: 'priority',
      label: 'Priority',
      sortable: true,
      align: 'center',
      render: (row) => (
        <span className={`text-xs font-bold ${row.priority === 'URGENT' ? 'text-red-600' : row.priority === 'HIGH' ? 'text-orange-500' : 'text-slate-600'}`}>
          {row.priority}
        </span>
      )
    },
    {
      key: 'status',
      label: 'Status',
      sortable: true,
      align: 'center',
      render: (row) => (
        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
          row.status === 'OPEN'
            ? 'bg-amber-100 text-amber-800'
            : row.status === 'RESOLVED'
            ? 'bg-emerald-100 text-emerald-800'
            : 'bg-gray-100 text-gray-700'
        }`}>
          {row.status.replace(/_/g, ' ')}
        </span>
      )
    },
    {
      key: 'actions',
      label: 'Action',
      align: 'right',
      render: (row) => (
        <button
          onClick={() => setActiveTicket(row)}
          className={`px-3 py-1.5 rounded-lg text-[10px] font-semibold transition-colors cursor-pointer ${
            activeTicket?._id === row._id ? 'bg-[#d4af37] text-slate-900' : 'bg-slate-800 text-white hover:bg-slate-700'
          }`}
        >
          View Thread
        </button>
      )
    }
  ];

  const filterConfig = [
    {
      key: 'status',
      label: 'Status',
      type: 'select',
      options: [
        { label: 'All Statuses', value: '' },
        { label: 'Open', value: 'OPEN' },
        { label: 'In Progress', value: 'IN_PROGRESS' },
        { label: 'Waiting for Partner', value: 'WAITING_FOR_PARTNER' },
        { label: 'Resolved', value: 'RESOLVED' },
        { label: 'Closed', value: 'CLOSED' }
      ]
    },
    {
      key: 'priority',
      label: 'Priority',
      type: 'select',
      options: [
        { label: 'All Priorities', value: '' },
        { label: 'Low', value: 'LOW' },
        { label: 'Medium', value: 'MEDIUM' },
        { label: 'High', value: 'HIGH' },
        { label: 'Urgent', value: 'URGENT' }
      ]
    }
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto p-4 md:p-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">Help & Support</h1>
          <p className="text-slate-500 text-sm mt-1">
            Submit issues regarding order fulfillments, payouts, menus, or platform technical bugs
          </p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="px-4 py-2.5 bg-[#d4af37] text-slate-900 hover:bg-[#c5a028] font-bold text-sm rounded-xl flex items-center gap-2 shadow-sm transition-colors cursor-pointer"
        >
          <Plus size={18} /> New Support Request
        </button>
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-xl flex items-center gap-3 text-sm font-semibold">
          <AlertTriangle size={20} /> {error}
        </div>
      )}

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Tickets List Table */}
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <DataTable
            columns={columns}
            data={tickets}
            loading={loading}
            emptyMessage="No support tickets found."
            
            search={{ value: search, placeholder: 'Search ticket # or subject...' }}
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
            
            // Allow row selection highlight
            rowClassName={(row) => activeTicket?._id === row._id ? 'bg-amber-50/40' : ''}
          />
        </div>

        {/* Ticket Details & Chat Panel */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col h-[600px] sticky top-6">
          {activeTicket ? (
            <>
              <div className="flex-1 overflow-y-auto space-y-4 pr-2">
                <div className="flex justify-between items-start border-b border-gray-100 pb-4">
                  <div>
                    <span className="font-mono text-xs font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-lg border border-amber-100">{activeTicket.ticketNumber}</span>
                    <h2 className="text-lg font-bold text-slate-800 mt-2">{activeTicket.subject}</h2>
                    <p className="text-xs text-slate-500 mt-1">
                      {activeTicket.category.replace(/_/g, ' ')} &bull; {activeTicket.priority}
                    </p>
                  </div>
                  <span
                    className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
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
                  <div className="p-3 bg-gray-50 rounded-xl border border-gray-200 text-xs flex items-center justify-between text-slate-600 shadow-inner">
                    <span className="flex items-center gap-1.5 font-bold">
                      <ShoppingBag size={14} className="text-amber-600" /> Linked Order:
                    </span>
                    <span className="font-mono font-bold text-slate-800 bg-white px-2 py-1 rounded border border-gray-200">
                      {activeTicket.orderId.orderId || activeTicket.orderId}
                    </span>
                  </div>
                )}

                {/* Messages Thread */}
                <div className="space-y-4">
                  {(activeTicket.messages || []).map((msg, idx) => (
                    <div
                      key={idx}
                      className={`p-3.5 rounded-xl text-sm space-y-1.5 ${
                        msg.senderType === 'SUPER_ADMIN' || msg.senderType === 'SUPPORT_AGENT'
                          ? 'bg-amber-50 text-slate-800 border border-amber-200/60 ml-4 rounded-tl-none'
                          : 'bg-slate-50 text-slate-700 border border-gray-100 mr-4 rounded-tr-none'
                      }`}
                    >
                      <div className="flex justify-between font-bold text-[10px] text-slate-400">
                        <span className="text-slate-600 uppercase tracking-wide">
                          {msg.senderName}
                        </span>
                        <span>{formatDate(msg.createdAt)}</span>
                      </div>
                      <p className="whitespace-pre-wrap">{msg.message}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Reply Form */}
              <form onSubmit={handleSendReply} className="pt-4 border-t border-gray-100 space-y-3 mt-auto">
                <textarea
                  value={replyMessage}
                  onChange={(e) => setReplyMessage(e.target.value)}
                  placeholder="Type message to support officers..."
                  rows="3"
                  required
                  className="w-full p-3 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-[#d4af37] outline-none resize-none transition-all"
                />
                <button
                  type="submit"
                  disabled={sendingReply}
                  className="w-full py-3 bg-[#d4af37] hover:bg-[#c5a028] text-slate-900 font-bold text-sm rounded-xl flex items-center justify-center gap-2 disabled:opacity-50 transition-colors shadow-sm cursor-pointer"
                >
                  <Send size={16} /> Send Message to Helpdesk
                </button>
              </form>
            </>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-400 space-y-3">
              <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-2">
                <MessageSquare size={28} className="text-gray-300" />
              </div>
              <p className="text-sm font-semibold text-slate-500">Select a ticket to inspect conversation thread and reply</p>
            </div>
          )}
        </div>
      </div>

      {/* Create Ticket Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 space-y-5 relative shadow-2xl border border-gray-100">
            <button
              onClick={() => setShowCreateModal(false)}
              className="absolute top-5 right-5 text-gray-400 hover:text-gray-600 p-1 hover:bg-gray-100 rounded-full transition-colors cursor-pointer"
            >
              <X size={20} />
            </button>

            <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
              <HelpCircle className="text-[#d4af37]" size={24} /> Create Support Request
            </h2>

            <form onSubmit={handleCreateTicket} className="space-y-4 text-sm">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-700 font-bold mb-1.5">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-[#d4af37] transition-all"
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
                  <label className="block text-slate-700 font-bold mb-1.5">Priority</label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value)}
                    className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-[#d4af37] transition-all"
                  >
                    <option value="LOW">Low</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="HIGH">High</option>
                    <option value="URGENT">Urgent</option>
                  </select>
                </div>
              </div>

              {orders.length > 0 && (
                <div>
                  <label className="block text-slate-700 font-bold mb-1.5">Linked Order (Optional)</label>
                  <select
                    value={orderId}
                    onChange={(e) => setOrderId(e.target.value)}
                    className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-[#d4af37] transition-all"
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
                <label className="block text-slate-700 font-bold mb-1.5">Subject</label>
                <input
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="Summary of query..."
                  required
                  className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-[#d4af37] transition-all"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1.5">Description</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Detailed description of problem..."
                  rows="4"
                  required
                  className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-[#d4af37] resize-none transition-all"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={creating}
                  className="w-full py-3 bg-[#d4af37] hover:bg-[#c5a028] text-slate-900 font-bold rounded-xl transition-colors disabled:opacity-50 cursor-pointer shadow-sm"
                >
                  {creating ? 'Submitting Request...' : 'Submit Support Request'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default RestaurantSupport;
