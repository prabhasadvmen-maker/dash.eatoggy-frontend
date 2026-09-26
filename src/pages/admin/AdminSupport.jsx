import React, { useState, useEffect, useCallback } from 'react';
import {
  MessageSquareWarning,
  ShieldAlert,
  Send,
  Lock,
  ShoppingBag,
  Settings,
  Eye,
  X
} from 'lucide-react';
import API_BASE_URL from '../../services/apiService';
import DataTable from '../../components/common/Table/DataTable';
import { useDataTableSync } from '../../hooks/useDataTableSync';

const ActionDropdown = ({ row, onView }) => {
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
        className="p-1.5 bg-gray-100 border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
        title="Settings"
      >
        <Settings size={16} />
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-32 bg-white rounded-xl shadow-lg border border-gray-100 z-10 py-1 overflow-hidden">
          <button
            onClick={() => { setOpen(false); onView(row); }}
            className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2 transition-colors cursor-pointer"
          >
            <Eye size={14} className="text-gray-500" />
            View
          </button>
        </div>
      )}
    </div>
  );
};

const AdminSupport = () => {
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

      const response = await fetch(`${API_BASE_URL}/api/admins/support/tickets?${queryParams.toString()}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('admin_token')}`
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
        `${API_BASE_URL}/api/admins/support/tickets/${activeTicket._id}/messages`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem('admin_token')}`
          },
          body: JSON.stringify({
            message: replyMessage.trim(),
            isInternalNote,
            senderName: 'Admin Support Agent'
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
        `${API_BASE_URL}/api/admins/support/tickets/${ticketId}/status`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem('admin_token')}`
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
        `${API_BASE_URL}/api/admins/support/tickets/${ticketId}/priority`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem('admin_token')}`
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
      key: 'srNo',
      label: 'Sr. No.',
      align: 'center',
      className: 'px-2 py-3',
      headerClassName: 'px-2 py-3',
      render: (_, rowIndex) => (
        <span className="text-gray-500 font-medium text-sm">
          {((page - 1) * limit) + rowIndex + 1}
        </span>
      )
    },
    {
      key: 'ticketNumber',
      label: 'Ticket #',
      sortable: false,
      className: 'px-2 py-3',
      headerClassName: 'px-2 py-3',
      render: (row) => <span className="font-bold text-slate-800 font-mono text-xs">{row.ticketNumber}</span>
    },
    {
      key: 'userType',
      label: 'Role',
      sortable: false,
      className: 'px-2 py-3',
      headerClassName: 'px-2 py-3',
      render: (row) => <span className="text-[10px] font-semibold text-slate-600 whitespace-nowrap">{row.userType}</span>
    },
    {
      key: 'subject',
      label: 'Subject',
      sortable: false,
      className: 'px-2 py-3',
      headerClassName: 'px-2 py-3',
      render: (row) => <span className="text-xs font-medium text-slate-800 max-w-[200px] truncate block whitespace-nowrap" title={row.subject}>{row.subject}</span>
    },
    {
      key: 'priority',
      label: 'Priority',
      sortable: true,
      align: 'center',
      className: 'px-2 py-3',
      headerClassName: 'px-2 py-3',
      render: (row) => (
        <span
          className={`px-2 py-0.5 rounded-full text-[9px] whitespace-nowrap ${
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
      className: 'px-2 py-3',
      headerClassName: 'px-2 py-3',
      render: (row) => (
        <span
          className={`px-2 py-0.5 rounded-full text-[9px] font-bold whitespace-nowrap ${
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
      label: 'Actions',
      align: 'right',
      className: 'px-2 py-3',
      headerClassName: 'px-2 py-3',
      render: (row) => (
        <ActionDropdown 
          row={row} 
          onView={(t) => setActiveTicket(t)} 
        />
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

      <div>
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

      {/* Ticket Details & Chat Modal */}
      {activeTicket && (
        <div className="fixed inset-0 bg-gray-900/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col animate-fadeIn">
            <div className="flex items-center justify-between p-6 border-b border-gray-100 shrink-0">
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
              <div className="flex items-center gap-3">
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
                <button
                  onClick={() => setActiveTicket(null)}
                  className="text-gray-400 hover:text-gray-600 p-1 cursor-pointer ml-2"
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            <div className="p-6 flex-1 overflow-y-auto space-y-4 bg-slate-50/50">
              {activeTicket.orderId && (
                <div className="p-2.5 bg-white rounded-xl border border-gray-200 text-xs flex items-center justify-between text-slate-600 shadow-sm">
                  <span className="flex items-center gap-1.5 font-medium">
                    <ShoppingBag size={14} className="text-amber-600" /> Linked Order:
                  </span>
                  <span className="font-mono font-bold text-slate-800">
                    {activeTicket.orderId.orderId || activeTicket.orderId}
                  </span>
                </div>
              )}

              {/* Messages Thread */}
              <div className="space-y-3">
                {(activeTicket.messages || []).map((msg, idx) => (
                  <div
                    key={idx}
                    className={`p-3 rounded-xl text-xs space-y-1 shadow-sm ${
                      msg.isInternalNote
                        ? 'bg-amber-100/70 border border-amber-300 text-amber-950 font-medium'
                        : msg.senderType === 'SUPER_ADMIN' || msg.senderType === 'SUPPORT_AGENT'
                        ? 'bg-white text-slate-800 border border-gray-100 ml-8'
                        : 'bg-slate-800 text-white border border-slate-700 mr-8'
                    }`}
                  >
                    <div className={`flex justify-between font-bold text-[10px] ${
                      msg.senderType === 'SUPER_ADMIN' || msg.senderType === 'SUPPORT_AGENT' || msg.isInternalNote ? 'text-slate-400' : 'text-slate-300'
                    }`}>
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
            <div className="p-6 border-t border-gray-100 shrink-0 bg-white rounded-b-2xl">
              <form onSubmit={handleSendReply} className="space-y-3">
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
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminSupport;
