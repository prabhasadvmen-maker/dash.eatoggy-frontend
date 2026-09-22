import React, { useState, useEffect, useCallback } from 'react';
import {
  MessageSquareWarning,
  ShieldAlert,
  Send,
  Lock,
  ShoppingBag
} from 'lucide-react';
import API_BASE_URL from '../../services/apiService';
import DataTable from '../../components/common/Table/DataTable';
import { useDataTableSync } from '../../hooks/useDataTableSync';

const SuperAdminSupport = () => {
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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [activeTicket, setActiveTicket] = useState(null);
  const [replyMessage, setReplyMessage] = useState('');
  const [isInternalNote, setIsInternalNote] = useState(false);
  const [processing, setProcessing] = useState(false);

  const fetchTickets = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      
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

      const response = await fetch(`${API_BASE_URL}/api/super-admin/support/tickets?${queryParams.toString()}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('superadmin_token')}`
        }
      });
      const data = await response.json();
      
      if (response.ok) {
        setTickets(data.data || []);
        if (data.meta && data.meta.pagination) {
          setTotal(data.meta.pagination.total);
        } else if (data.pagination) {
          setTotal(data.pagination.total);
        } else {
          setTotal(data.data?.length || 0);
        }
      } else {
        setError(data.message || 'Failed to fetch support tickets');
      }
    } catch (err) {
      setError('Network error while fetching support tickets');
    } finally {
      setLoading(false);
    }
  }, [page, limit, search, sortBy, sortOrder, filters]);

  useEffect(() => {
    fetchTickets();
  }, [fetchTickets]);

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
          Customer: {ticket.customerId.name || ticket.customerId.fullName || ticket.customerId.email || 'Customer User'}
        </span>
      );
    }
    if (ticket.restaurantId) {
      return (
        <span className="text-xs text-slate-700 font-semibold">
          Restaurant: {ticket.restaurantId.name || ticket.restaurantId.restaurantName || 'Restaurant Partner'}
        </span>
      );
    }
    if (ticket.deliveryPartnerId) {
      return (
        <span className="text-xs text-slate-700 font-semibold">
          Delivery Partner: {ticket.deliveryPartnerId.name || ticket.deliveryPartnerId.fullName || 'Delivery Partner'}
        </span>
      );
    }
    return <span className="text-xs text-slate-500">User ID: {ticket.userId}</span>;
  };

  const columns = [
    {
      key: 'ticketNumber',
      label: 'Ticket #',
      sortable: false,
      render: (row) => <span className="font-bold text-slate-800 font-mono text-xs">{row.ticketNumber}</span>
    },
    {
      key: 'userType',
      label: 'Role',
      sortable: false,
      render: (row) => <span className="text-xs font-semibold text-slate-600">{row.userType}</span>
    },
    {
      key: 'subject',
      label: 'Subject',
      sortable: false,
      render: (row) => <span className="text-xs font-medium text-slate-800 max-w-[150px] truncate block" title={row.subject}>{row.subject}</span>
    },
    {
      key: 'priority',
      label: 'Priority',
      sortable: true,
      align: 'center',
      render: (row) => (
        <span
          className={`px-2 py-0.5 rounded-full text-[10px] ${
            row.priority === 'URGENT'
              ? 'bg-red-100 text-red-800 font-black'
              : row.priority === 'HIGH'
              ? 'bg-amber-100 text-amber-800 font-bold'
              : 'bg-slate-100 text-slate-700'
          }`}
        >
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
        <span
          className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
            row.status === 'OPEN'
              ? 'bg-amber-100 text-amber-800'
              : row.status === 'RESOLVED'
              ? 'bg-emerald-100 text-emerald-800'
              : 'bg-gray-100 text-gray-700'
          }`}
        >
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
          onClick={(e) => {
            e.stopPropagation();
            setActiveTicket(row);
          }}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
            activeTicket?._id === row._id ? 'bg-amber-100 text-amber-800' : 'bg-slate-800 text-white hover:bg-slate-700'
          }`}
        >
          View
        </button>
      )
    }
  ];

  const filterConfig = [
    {
      key: 'userType',
      label: 'Role',
      type: 'select',
      options: [
        { label: 'Customer', value: 'CUSTOMER' },
        { label: 'Restaurant', value: 'RESTAURANT' },
        { label: 'Delivery Partner', value: 'DELIVERY_PARTNER' }
      ]
    },
    {
      key: 'status',
      label: 'Status',
      type: 'select',
      options: [
        { label: 'Open', value: 'OPEN' },
        { label: 'In Progress', value: 'IN_PROGRESS' },
        { label: 'Waiting for Customer', value: 'WAITING_FOR_CUSTOMER' },
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
        { label: 'Low', value: 'LOW' },
        { label: 'Medium', value: 'MEDIUM' },
        { label: 'High', value: 'HIGH' },
        { label: 'Urgent', value: 'URGENT' }
      ]
    },
    {
      key: 'category',
      label: 'Category',
      type: 'select',
      options: [
        { label: 'Order Issue', value: 'ORDER_ISSUE' },
        { label: 'Payment Issue', value: 'PAYMENT' },
        { label: 'Refund Request', value: 'REFUND' },
        { label: 'Delivery Issue', value: 'DELIVERY' },
        { label: 'Restaurant', value: 'RESTAURANT' },
        { label: 'Subscription', value: 'SUBSCRIPTION' },
        { label: 'Account', value: 'ACCOUNT' },
        { label: 'Technical', value: 'TECHNICAL' },
        { label: 'Other', value: 'OTHER' }
      ]
    }
  ];

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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Tickets Table List */}
        <div className="lg:col-span-2">
          <DataTable
            columns={columns}
            data={tickets}
            loading={loading}
            emptyMessage="No support tickets found matching criteria."
            
            search={{ value: search, placeholder: 'Search by ticket #, subject...' }}
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
          />
        </div>

        {/* Ticket Details & Chat Panel */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 space-y-4 flex flex-col justify-between h-[calc(100vh-200px)] sticky top-6">
          {activeTicket ? (
            <>
              <div className="space-y-3 flex-1 overflow-hidden flex flex-col">
                <div className="flex justify-between items-start border-b border-gray-100 pb-3 flex-shrink-0">
                  <div>
                    <span className="font-mono text-xs font-bold text-amber-600">
                      {activeTicket.ticketNumber}
                    </span>
                    <h2 className="text-base font-bold text-slate-800 mt-0.5">{activeTicket.subject}</h2>
                    <p className="text-xs text-slate-400">
                      Role: {activeTicket.userType} | Category: {activeTicket.category?.replace(/_/g, ' ')}
                    </p>
                    <div className="mt-1">{renderRequesterInfo(activeTicket)}</div>
                  </div>

                  <div className="flex flex-col gap-1 items-end">
                    <select
                      value={activeTicket.status}
                      onChange={(e) => handleUpdateStatus(activeTicket._id, e.target.value)}
                      className="px-2.5 py-1 bg-gray-50 border border-gray-200 rounded-lg text-xs font-bold outline-none focus:ring-2 focus:ring-[#d4af37]"
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
                      className="px-2.5 py-0.5 bg-gray-50 border border-gray-200 rounded-lg text-[10px] font-bold text-gray-700 outline-none focus:ring-2 focus:ring-[#d4af37]"
                    >
                      <option value="LOW">LOW</option>
                      <option value="MEDIUM">MEDIUM</option>
                      <option value="HIGH">HIGH</option>
                      <option value="URGENT">URGENT</option>
                    </select>
                  </div>
                </div>

                {activeTicket.orderId && (
                  <div className="p-2.5 bg-gray-50 rounded-xl border border-gray-200 text-xs flex items-center justify-between text-slate-600 flex-shrink-0">
                    <span className="flex items-center gap-1.5 font-medium">
                      <ShoppingBag size={14} className="text-amber-600" /> Linked Order:
                    </span>
                    <span className="font-mono font-bold text-slate-800">
                      {activeTicket.orderId.orderId || activeTicket.orderId}
                    </span>
                  </div>
                )}

                {/* Messages Thread */}
                <div className="space-y-3 flex-1 overflow-y-auto pr-1 pb-4">
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
              <form onSubmit={handleSendReply} className="pt-3 border-t border-gray-100 space-y-2 flex-shrink-0">
                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-1.5 text-xs text-slate-700 font-bold cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isInternalNote}
                      onChange={(e) => setIsInternalNote(e.target.checked)}
                      className="rounded border-gray-300 text-[#d4af37] focus:ring-[#d4af37]"
                    />
                    <Lock size={13} className={isInternalNote ? 'text-amber-600' : 'text-gray-400'} />
                    Internal Note (Hidden from User)
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
                  className={`w-full py-2.5 font-bold text-xs rounded-xl flex items-center justify-center gap-2 disabled:opacity-50 transition-colors cursor-pointer ${
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
