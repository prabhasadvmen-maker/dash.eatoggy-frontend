import React, { useState, useEffect } from 'react';
import {
  MessageSquareWarning,
  ShieldAlert,
  CheckCircle2,
  Clock,
  Send,
  Lock,
  Search,
  Filter,
  User,
  ShoppingBag,
  Calendar,
  AlertTriangle,
  UserCheck
} from 'lucide-react';
import API_BASE_URL from '../../services/apiService';

const SuperAdminSupport = () => {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTicket, setActiveTicket] = useState(null);
  const [replyMessage, setReplyMessage] = useState('');
  const [isInternalNote, setIsInternalNote] = useState(false);
  const [processing, setProcessing] = useState(false);

  // Filters
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [roleFilter, setRoleFilter] = useState('');

  useEffect(() => {
    fetchTickets();
  }, [statusFilter, priorityFilter, categoryFilter, roleFilter]);

  const fetchTickets = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (statusFilter) params.append('status', statusFilter);
      if (priorityFilter) params.append('priority', priorityFilter);
      if (categoryFilter) params.append('category', categoryFilter);
      if (roleFilter) params.append('userType', roleFilter);
      if (search) params.append('search', search);

      const response = await fetch(
        `${API_BASE_URL}/api/super-admin/support/tickets?${params.toString()}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('superadmin_token')}`
          }
        }
      );
      const data = await response.json();
      if (response.ok) {
        setTickets(data.data || []);
      } else {
        setError(data.message || 'Failed to fetch support tickets');
      }
    } catch (err) {
      setError('Network error while fetching support tickets');
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchTickets();
  };

  const handleSendReply = async (e) => {
    e.preventDefault();
    if (!activeTicket || !replyMessage.trim()) return;
    setProcessing(true);

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/super-admin/support/tickets/${activeTicket._id}/messages`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem('superadmin_token')}`
          },
          body: JSON.stringify({
            message: replyMessage.trim(),
            isInternalNote,
            senderName: 'SuperAdmin Support Agent'
          })
        }
      );
      const data = await response.json();
      if (response.ok) {
        setActiveTicket(data.data);
        setTickets(tickets.map((t) => (t._id === data.data._id ? data.data : t)));
        setReplyMessage('');
        setIsInternalNote(false);
      } else {
        alert(data.message || 'Failed to send reply');
      }
    } catch (err) {
      alert('Network error while sending reply');
    } finally {
      setProcessing(false);
    }
  };

  const handleUpdateStatus = async (ticketId, newStatus) => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/super-admin/support/tickets/${ticketId}/status`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem('superadmin_token')}`
          },
          body: JSON.stringify({ status: newStatus })
        }
      );
      const data = await response.json();
      if (response.ok) {
        setTickets(tickets.map((t) => (t._id === ticketId ? { ...t, status: newStatus } : t)));
        if (activeTicket?._id === ticketId) {
          setActiveTicket({ ...activeTicket, status: newStatus });
        }
      } else {
        alert(data.message || 'Failed to update ticket status');
      }
    } catch (err) {
      alert('Network error while updating status');
    }
  };

  const handleUpdatePriority = async (ticketId, newPriority) => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/super-admin/support/tickets/${ticketId}/priority`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem('superadmin_token')}`
          },
          body: JSON.stringify({ priority: newPriority })
        }
      );
      const data = await response.json();
      if (response.ok) {
        setTickets(tickets.map((t) => (t._id === ticketId ? { ...t, priority: newPriority } : t)));
        if (activeTicket?._id === ticketId) {
          setActiveTicket({ ...activeTicket, priority: newPriority });
        }
      } else {
        alert(data.message || 'Failed to update priority');
      }
    } catch (err) {
      alert('Network error while updating priority');
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const renderRequesterInfo = (ticket) => {
    if (ticket.customerId) {
      return (
        <span className="text-xs text-slate-700 font-semibold">
          Customer: {ticket.customerId.name || ticket.customerId.email || 'Customer User'}
        </span>
      );
    }
    if (ticket.restaurantId) {
      return (
        <span className="text-xs text-slate-700 font-semibold">
          Restaurant: {ticket.restaurantId.name || 'Restaurant Partner'}
        </span>
      );
    }
    if (ticket.deliveryPartnerId) {
      return (
        <span className="text-xs text-slate-700 font-semibold">
          Delivery Partner: {ticket.deliveryPartnerId.name || 'Delivery Partner'}
        </span>
      );
    }
    return <span className="text-xs text-slate-500">User ID: {ticket.userId}</span>;
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Page Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">Support & Helpdesk Control Center</h1>
          <p className="text-slate-400 mt-1">
            Global ticket management across customers, restaurants, and delivery partners
          </p>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-xl flex items-center gap-3 text-xs font-semibold">
          <ShieldAlert size={20} />
          {error}
        </div>
      )}

      {/* Search & Filter Bar */}
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex flex-wrap gap-3 items-center justify-between">
        <form onSubmit={handleSearchSubmit} className="flex-1 min-w-[240px] relative">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by ticket #, subject, description..."
            className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs outline-none focus:ring-2 focus:ring-[#d4af37]"
          />
          <Search size={16} className="absolute left-3 top-2.5 text-gray-400" />
        </form>

        <div className="flex flex-wrap gap-2 items-center">
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold outline-none focus:ring-2 focus:ring-[#d4af37]"
          >
            <option value="">All Roles</option>
            <option value="CUSTOMER">Customer</option>
            <option value="RESTAURANT">Restaurant</option>
            <option value="DELIVERY_PARTNER">Delivery Partner</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold outline-none focus:ring-2 focus:ring-[#d4af37]"
          >
            <option value="">All Statuses</option>
            <option value="OPEN">Open</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="WAITING_FOR_CUSTOMER">Waiting for Customer</option>
            <option value="WAITING_FOR_PARTNER">Waiting for Partner</option>
            <option value="RESOLVED">Resolved</option>
            <option value="CLOSED">Closed</option>
          </select>

          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold outline-none focus:ring-2 focus:ring-[#d4af37]"
          >
            <option value="">All Priorities</option>
            <option value="LOW">Low</option>
            <option value="MEDIUM">Medium</option>
            <option value="HIGH">High</option>
            <option value="URGENT">Urgent</option>
          </select>

          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold outline-none focus:ring-2 focus:ring-[#d4af37]"
          >
            <option value="">All Categories</option>
            <option value="ORDER_ISSUE">Order Issue</option>
            <option value="PAYMENT">Payment Issue</option>
            <option value="REFUND">Refund Request</option>
            <option value="DELIVERY">Delivery Issue</option>
            <option value="RESTAURANT">Restaurant</option>
            <option value="SUBSCRIPTION">Subscription</option>
            <option value="ACCOUNT">Account</option>
            <option value="TECHNICAL">Technical</option>
            <option value="OTHER">Other</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Tickets Table List */}
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-gray-600">
              <thead className="bg-gray-50 border-b border-gray-100 text-gray-400 uppercase text-xs font-semibold">
                <tr>
                  <th className="px-6 py-4">Ticket #</th>
                  <th className="px-6 py-4">Role</th>
                  <th className="px-6 py-4">Subject</th>
                  <th className="px-6 py-4 text-center">Priority</th>
                  <th className="px-6 py-4 text-center">Status</th>
                  <th className="px-6 py-4 text-center">Action</th>
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
                      <td className="px-6 py-4 font-bold text-slate-800 font-mono text-xs">
                        {t.ticketNumber}
                      </td>
                      <td className="px-6 py-4 text-xs font-semibold text-slate-600">{t.userType}</td>
                      <td className="px-6 py-4 text-xs font-medium text-slate-800 max-w-xs truncate">
                        {t.subject}
                      </td>
                      <td className="px-6 py-4 text-center font-bold text-xs">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] ${
                            t.priority === 'URGENT'
                              ? 'bg-red-100 text-red-800 font-black'
                              : t.priority === 'HIGH'
                              ? 'bg-amber-100 text-amber-800 font-bold'
                              : 'bg-slate-100 text-slate-700'
                          }`}
                        >
                          {t.priority}
                        </span>
                      </td>
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
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 space-y-4 flex flex-col justify-between min-h-[500px]">
          {activeTicket ? (
            <>
              <div className="space-y-3">
                <div className="flex justify-between items-start border-b border-gray-100 pb-3">
                  <div>
                    <span className="font-mono text-xs font-bold text-amber-600">
                      {activeTicket.ticketNumber}
                    </span>
                    <h2 className="text-base font-bold text-slate-800 mt-0.5">{activeTicket.subject}</h2>
                    <p className="text-xs text-slate-400">
                      Role: {activeTicket.userType} | Category: {activeTicket.category.replace(/_/g, ' ')}
                    </p>
                    <div className="mt-1">{renderRequesterInfo(activeTicket)}</div>
                  </div>

                  <div className="flex flex-col gap-1 items-end">
                    <select
                      value={activeTicket.status}
                      onChange={(e) => handleUpdateStatus(activeTicket._id, e.target.value)}
                      className="px-2.5 py-1 bg-gray-50 border border-gray-200 rounded-lg text-xs font-bold"
                    >
                      <option value="OPEN">OPEN</option>
                      <option value="IN_PROGRESS">IN_PROGRESS</option>
                      <option value="WAITING_FOR_CUSTOMER">WAITING FOR CUSTOMER</option>
                      <option value="WAITING_FOR_PARTNER">WAITING FOR PARTNER</option>
                      <option value="RESOLVED">RESOLVED</option>
                      <option value="CLOSED">CLOSED</option>
                    </select>

                    <select
                      value={activeTicket.priority}
                      onChange={(e) => handleUpdatePriority(activeTicket._id, e.target.value)}
                      className="px-2.5 py-0.5 bg-gray-50 border border-gray-200 rounded-lg text-[10px] font-bold text-gray-700"
                    >
                      <option value="LOW">LOW</option>
                      <option value="MEDIUM">MEDIUM</option>
                      <option value="HIGH">HIGH</option>
                      <option value="URGENT">URGENT</option>
                    </select>
                  </div>
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
                        msg.isInternalNote
                          ? 'bg-amber-100/70 border border-amber-300 text-amber-950 font-medium'
                          : msg.senderType === 'SUPER_ADMIN' || msg.senderType === 'SUPPORT_AGENT'
                          ? 'bg-amber-50 text-slate-800 border border-amber-200/60 ml-3'
                          : 'bg-slate-50 text-slate-700 border border-gray-100 mr-3'
                      }`}
                    >
                      <div className="flex justify-between font-bold text-[10px] text-slate-400">
                        <span className="flex items-center gap-1">
                          {msg.isInternalNote && <Lock size={12} className="text-amber-700" />}
                          {msg.senderName} ({msg.senderType})
                          {msg.isInternalNote && ' [INTERNAL NOTE]'}
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
                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-1.5 text-xs text-slate-700 font-bold cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isInternalNote}
                      onChange={(e) => setIsInternalNote(e.target.checked)}
                      className="rounded border-gray-300 text-[#d4af37] focus:ring-[#d4af37]"
                    />
                    <Lock size={13} className={isInternalNote ? 'text-amber-600' : 'text-gray-400'} />
                    Internal Note (Hidden from Customer/Partner)
                  </label>
                </div>

                <textarea
                  value={replyMessage}
                  onChange={(e) => setReplyMessage(e.target.value)}
                  placeholder={
                    isInternalNote
                      ? 'Type internal admin note (only visible to SuperAdmin)...'
                      : 'Type official support response to user...'
                  }
                  rows="3"
                  required
                  className={`w-full p-3 border rounded-xl text-xs outline-none resize-none ${
                    isInternalNote
                      ? 'bg-amber-50/50 border-amber-300 focus:ring-2 focus:ring-amber-500'
                      : 'border-gray-200 focus:ring-2 focus:ring-[#d4af37]'
                  }`}
                />
                <button
                  type="submit"
                  disabled={processing}
                  className={`w-full py-2.5 font-bold text-xs rounded-xl flex items-center justify-center gap-2 disabled:opacity-50 transition-colors ${
                    isInternalNote
                      ? 'bg-amber-600 hover:bg-amber-700 text-white'
                      : 'bg-[#d4af37] hover:bg-[#c5a028] text-slate-900'
                  }`}
                >
                  <Send size={14} /> {isInternalNote ? 'Save Internal Note' : 'Send Official Response'}
                </button>
              </form>
            </>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-400 space-y-2">
              <MessageSquareWarning size={40} className="text-slate-300" />
              <p className="text-xs font-semibold">Select a ticket from table to inspect details & manage</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SuperAdminSupport;
