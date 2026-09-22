import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  HelpCircle,
  Plus,
  MessageSquare,
  Send,
  X,
  Bike,
  ArrowLeft,
  AlertTriangle
} from 'lucide-react';
import API_BASE_URL from '../../services/apiService';
import DataTable from '../../components/common/Table/DataTable';
import { useDataTableSync } from '../../hooks/useDataTableSync';

const DeliverySupport = () => {
  const navigate = useNavigate();
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
  const [sendingReply, setSendingReply] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Form State
  const [subject, setSubject] = useState('');
  const [category, setCategory] = useState('DELIVERY');
  const [priority, setPriority] = useState('MEDIUM');
  const [description, setDescription] = useState('');
  const [creating, setCreating] = useState(false);

  const fetchTickets = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      
      const token = localStorage.getItem('delivery_token') || localStorage.getItem('token');
      
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

      const res = await fetch(`${API_BASE_URL}/api/support/tickets/delivery/my?${queryParams.toString()}`, {
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
        setError(data.message || 'Failed to fetch tickets');
        setTickets([]);
        setTotal(0);
      }
    } catch (err) {
      setError('Network error while fetching rider tickets');
      setTickets([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }, [page, limit, search, sortBy, sortOrder, filters]);

  useEffect(() => {
    fetchTickets();
  }, [fetchTickets]);

  const handleCreateTicket = async (e) => {
    e.preventDefault();
    if (!subject.trim() || !description.trim()) return;
    setCreating(true);

    try {
      const token = localStorage.getItem('delivery_token') || localStorage.getItem('token');
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
          description: description.trim()
        })
      });

      const data = await res.json();
      if (res.ok) {
        fetchTickets();
        setShowCreateModal(false);
        setSubject('');
        setDescription('');
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
      const token = localStorage.getItem('delivery_token') || localStorage.getItem('token');
      const res = await fetch(`${API_BASE_URL}/api/support/tickets/${activeTicket._id}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          message: replyMessage.trim(),
          senderName: 'Delivery Partner'
        })
      });

      const data = await res.json();
      if (res.ok) {
        setActiveTicket(data.data);
        fetchTickets(); // refresh list
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
    return new Date(dateStr).toLocaleDateString('en-IN', {
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
        <span className="font-bold text-[#d4af37] font-mono text-xs cursor-pointer hover:text-white" onClick={() => setActiveTicket(row)}>
          {row.ticketNumber}
        </span>
      )
    },
    {
      key: 'category',
      label: 'Category',
      sortable: true,
      render: (row) => (
        <span className="text-xs font-semibold text-slate-300">
          {row.category.replace(/_/g, ' ')}
        </span>
      )
    },
    {
      key: 'subject',
      label: 'Subject',
      sortable: true,
      render: (row) => (
        <span className="text-xs font-bold text-slate-100 max-w-xs truncate block cursor-pointer hover:text-[#d4af37]" onClick={() => setActiveTicket(row)}>
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
        <span className={`text-xs font-bold ${row.priority === 'URGENT' ? 'text-red-400' : row.priority === 'HIGH' ? 'text-orange-400' : 'text-slate-300'}`}>
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
        <span className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold ${
          row.status === 'OPEN'
            ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
            : row.status === 'RESOLVED'
            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
            : 'bg-slate-800 text-slate-300 border border-slate-700'
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
    <div className="min-h-screen bg-slate-950 text-slate-100 pb-20">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-slate-900/90 backdrop-blur-md border-b border-slate-800 px-4 py-4 flex items-center justify-between max-w-7xl mx-auto">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/delivery/home')}
            className="p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <ArrowLeft size={18} />
          </button>
          <div>
            <h1 className="text-lg font-bold text-white flex items-center gap-2">
              <Bike className="text-[#d4af37]" size={20} /> Delivery Rider Helpdesk
            </h1>
            <p className="text-xs text-slate-400">Rider assistance for payouts, OTP issues & delivery disputes</p>
          </div>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="px-4 py-2 bg-[#d4af37] text-slate-950 hover:bg-[#c5a028] font-bold text-sm rounded-xl flex items-center gap-2 shadow-lg shadow-[#d4af37]/10 transition-colors cursor-pointer"
        >
          <Plus size={16} /> New Support Ticket
        </button>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6 space-y-6">
        {error && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl flex items-center gap-3 text-sm font-semibold">
            <AlertTriangle size={20} /> {error}
          </div>
        )}

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Tickets List Table */}
          <div className="lg:col-span-2 bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden shadow-xl">
            {/* The DataTable component internally may have light mode styling if not explicitly styled.
                Since it's a shared component, we wrap it. It will inherit text colors mostly.
                We can just use it and rely on the global CSS or inherit colors. 
                Wait, if DataTable uses bg-white, it might look odd here. 
                Since this is a dark theme page, we might want to ensure the table matches.
                DataTable uses some bg-white or bg-gray-50 classes.
                Let's assume the user is okay with the standard table appearance, or the table is responsive to parent.
                I will wrap it in a container.
            */}
            <DataTable
              columns={columns}
              data={tickets}
              loading={loading}
              emptyMessage="No support tickets submitted."
              
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
              
              rowClassName={(row) => activeTicket?._id === row._id ? 'bg-slate-800/50' : ''}
            />
          </div>

          {/* Chat / Details Panel */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col h-[650px] sticky top-24 shadow-xl">
            {activeTicket ? (
              <>
                <div className="flex-1 overflow-y-auto space-y-4 pr-2">
                  <div className="border-b border-slate-800 pb-4 flex justify-between items-start">
                    <div>
                      <span className="font-mono text-xs font-bold text-[#d4af37] bg-[#d4af37]/10 px-2 py-0.5 rounded-lg border border-[#d4af37]/20">{activeTicket.ticketNumber}</span>
                      <h2 className="font-bold text-lg text-slate-100 mt-2">{activeTicket.subject}</h2>
                      <p className="text-xs text-slate-400 mt-1">
                        Category: {activeTicket.category.replace(/_/g, ' ')} | Priority: {activeTicket.priority}
                      </p>
                    </div>
                    <span
                      className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold ${
                        activeTicket.status === 'OPEN'
                          ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                          : activeTicket.status === 'RESOLVED'
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                          : 'bg-slate-800 text-slate-300 border border-slate-700'
                      }`}
                    >
                      {activeTicket.status.replace(/_/g, ' ')}
                    </span>
                  </div>

                  {/* Messages Thread */}
                  <div className="space-y-4">
                    {(activeTicket.messages || []).map((msg, idx) => (
                      <div
                        key={idx}
                        className={`p-3.5 rounded-xl text-sm space-y-1.5 ${
                          msg.senderType === 'SUPER_ADMIN' || msg.senderType === 'SUPPORT_AGENT'
                            ? 'bg-[#d4af37]/10 border border-[#d4af37]/30 text-slate-100 ml-4 rounded-tl-none'
                            : 'bg-slate-800 border border-slate-700 text-slate-200 mr-4 rounded-tr-none'
                        }`}
                      >
                        <div className="flex justify-between font-bold text-[10px] text-slate-400 uppercase tracking-wide">
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
                <form onSubmit={handleSendReply} className="pt-4 border-t border-slate-800 space-y-3 mt-auto">
                  <textarea
                    value={replyMessage}
                    onChange={(e) => setReplyMessage(e.target.value)}
                    placeholder="Type message to support officers..."
                    rows="3"
                    required
                    className="w-full p-4 bg-slate-950 border border-slate-800 rounded-xl text-sm text-slate-100 focus:border-[#d4af37] outline-none resize-none transition-all"
                  />
                  <button
                    type="submit"
                    disabled={sendingReply}
                    className="w-full py-3 bg-[#d4af37] hover:bg-[#c5a028] text-slate-950 font-bold text-sm rounded-xl flex items-center justify-center gap-2 disabled:opacity-50 transition-colors shadow-sm cursor-pointer"
                  >
                    <Send size={16} /> Send Rider Message
                  </button>
                </form>
              </>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-500 space-y-3">
                <div className="w-16 h-16 bg-slate-800/50 rounded-full flex items-center justify-center mb-2">
                  <MessageSquare size={28} className="text-slate-600" />
                </div>
                <p className="text-sm font-semibold text-slate-400">Select a ticket to inspect conversation thread & reply</p>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Create Ticket Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg p-6 space-y-5 relative shadow-2xl">
            <button
              onClick={() => setShowCreateModal(false)}
              className="absolute top-5 right-5 text-slate-400 hover:text-white p-1 hover:bg-slate-800 rounded-full transition-colors cursor-pointer"
            >
              <X size={20} />
            </button>

            <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
              <Bike className="text-[#d4af37]" size={24} /> Submit Rider Support Request
            </h2>

            <form onSubmit={handleCreateTicket} className="space-y-4 text-sm">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-400 font-bold mb-1.5">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 focus:border-[#d4af37] outline-none transition-all"
                  >
                    <option value="DELIVERY">Delivery Job Issue</option>
                    <option value="PAYMENT">Rider Payout Dispute</option>
                    <option value="ACCOUNT">Rider Onboarding / Account</option>
                    <option value="TECHNICAL">App Technical Bug</option>
                    <option value="OTHER">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-400 font-bold mb-1.5">Priority</label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value)}
                    className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 focus:border-[#d4af37] outline-none transition-all"
                  >
                    <option value="LOW">Low</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="HIGH">High</option>
                    <option value="URGENT">Urgent</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-400 font-bold mb-1.5">Subject</label>
                <input
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="Summary of issue..."
                  required
                  className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 focus:border-[#d4af37] outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-bold mb-1.5">Description</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Detailed description of problem..."
                  rows="4"
                  required
                  className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 focus:border-[#d4af37] outline-none resize-none transition-all"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={creating}
                  className="w-full py-3 bg-[#d4af37] text-slate-950 font-bold rounded-xl hover:bg-[#c5a028] disabled:opacity-50 transition-colors shadow-sm cursor-pointer"
                >
                  {creating ? 'Submitting...' : 'Submit Rider Ticket'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default DeliverySupport;
