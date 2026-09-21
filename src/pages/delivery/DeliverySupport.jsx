import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  HelpCircle,
  Plus,
  MessageSquare,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Send,
  X,
  Bike,
  ArrowLeft
} from 'lucide-react';
import API_BASE_URL from '../../services/apiService';

const DeliverySupport = () => {
  const navigate = useNavigate();
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTicket, setActiveTicket] = useState(null);
  const [replyMessage, setReplyMessage] = useState('');
  const [sendingReply, setSendingReply] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [statusFilter, setStatusFilter] = useState('');

  // Form State
  const [subject, setSubject] = useState('');
  const [category, setCategory] = useState('DELIVERY');
  const [priority, setPriority] = useState('MEDIUM');
  const [description, setDescription] = useState('');
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    fetchTickets();
  }, [statusFilter]);

  const fetchTickets = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('delivery_token') || localStorage.getItem('token');
      const query = statusFilter ? `?status=${statusFilter}` : '';
      const res = await fetch(`${API_BASE_URL}/api/support/tickets/delivery/my${query}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) {
        setTickets(data.data || []);
      } else {
        setError(data.message || 'Failed to fetch tickets');
      }
    } catch (err) {
      setError('Network error while fetching rider tickets');
    } finally {
      setLoading(false);
    }
  };

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
        setTickets([data.data, ...tickets]);
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
    return new Date(dateStr).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 pb-20">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-slate-900/90 backdrop-blur-md border-b border-slate-800 px-4 py-4 flex items-center justify-between max-w-5xl mx-auto">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/delivery/home')}
            className="p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white transition-colors"
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
          className="px-3.5 py-2 bg-[#d4af37] text-slate-950 hover:bg-[#c5a028] font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-lg shadow-[#d4af37]/10 transition-colors"
        >
          <Plus size={16} /> New Support Ticket
        </button>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-6 space-y-6">
        {/* Status Filter */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          {['', 'OPEN', 'IN_PROGRESS', 'WAITING_FOR_PARTNER', 'RESOLVED', 'CLOSED'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-colors ${
                statusFilter === st
                  ? 'bg-[#d4af37] text-slate-950 shadow'
                  : 'bg-slate-900 text-slate-400 border border-slate-800 hover:text-slate-200'
              }`}
            >
              {st === '' ? 'ALL TICKETS' : st.replace(/_/g, ' ')}
            </button>
          ))}
        </div>

        {/* Tickets Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-3">
            {loading ? (
              <div className="p-8 text-center text-slate-500 bg-slate-900/60 rounded-2xl border border-slate-800">
                Loading rider support tickets...
              </div>
            ) : tickets.length === 0 ? (
              <div className="p-12 text-center bg-slate-900/60 rounded-2xl border border-slate-800 space-y-3">
                <HelpCircle size={40} className="mx-auto text-slate-600" />
                <p className="text-sm font-semibold text-slate-400">No support tickets submitted</p>
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="px-4 py-2 bg-[#d4af37]/10 text-[#d4af37] border border-[#d4af37]/30 rounded-xl text-xs font-bold hover:bg-[#d4af37]/20"
                >
                  Create Support Ticket
                </button>
              </div>
            ) : (
              tickets.map((t) => (
                <div
                  key={t._id}
                  onClick={() => setActiveTicket(t)}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer space-y-2 ${
                    activeTicket?._id === t._id
                      ? 'bg-slate-900 border-[#d4af37] shadow-lg shadow-[#d4af37]/5'
                      : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
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
                          : 'bg-slate-800 text-slate-300 border border-slate-700'
                      }`}
                    >
                      {t.status.replace(/_/g, ' ')}
                    </span>
                  </div>

                  <h3 className="font-bold text-sm text-slate-100 line-clamp-1">{t.subject}</h3>
                  <p className="text-xs text-slate-400 line-clamp-2">{t.description}</p>

                  <div className="flex items-center justify-between text-[10px] text-slate-500 pt-2 border-t border-slate-800/80">
                    <span>Category: {t.category.replace(/_/g, ' ')}</span>
                    <span>{formatDate(t.createdAt)}</span>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Chat / Details Panel */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4 flex flex-col justify-between h-[520px]">
            {activeTicket ? (
              <>
                <div className="space-y-3">
                  <div className="border-b border-slate-800 pb-3 flex justify-between items-start">
                    <div>
                      <span className="font-mono text-xs font-bold text-[#d4af37]">{activeTicket.ticketNumber}</span>
                      <h2 className="font-bold text-base text-slate-100 mt-0.5">{activeTicket.subject}</h2>
                      <p className="text-xs text-slate-400">
                        Category: {activeTicket.category.replace(/_/g, ' ')} | Priority: {activeTicket.priority}
                      </p>
                    </div>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        activeTicket.status === 'OPEN'
                          ? 'bg-amber-500/20 text-amber-400'
                          : activeTicket.status === 'RESOLVED'
                          ? 'bg-emerald-500/20 text-emerald-400'
                          : 'bg-slate-800 text-slate-300'
                      }`}
                    >
                      {activeTicket.status}
                    </span>
                  </div>

                  {/* Messages Thread */}
                  <div className="space-y-3 overflow-y-auto max-h-72 pr-1">
                    {(activeTicket.messages || []).map((msg, idx) => (
                      <div
                        key={idx}
                        className={`p-3 rounded-xl text-xs space-y-1 ${
                          msg.senderType === 'SUPER_ADMIN' || msg.senderType === 'SUPPORT_AGENT'
                            ? 'bg-[#d4af37]/10 border border-[#d4af37]/30 text-slate-100 ml-3'
                            : 'bg-slate-800/80 border border-slate-700 text-slate-200 mr-3'
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
                <form onSubmit={handleSendReply} className="pt-3 border-t border-slate-800 space-y-2">
                  <textarea
                    value={replyMessage}
                    onChange={(e) => setReplyMessage(e.target.value)}
                    placeholder="Type message to support officers..."
                    rows="2"
                    required
                    className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-100 focus:border-[#d4af37] outline-none resize-none"
                  />
                  <button
                    type="submit"
                    disabled={sendingReply}
                    className="w-full py-2 bg-[#d4af37] text-slate-950 font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 hover:bg-[#c5a028] disabled:opacity-50"
                  >
                    <Send size={14} /> Send Rider Message
                  </button>
                </form>
              </>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-500 space-y-2">
                <MessageSquare size={36} className="text-slate-600" />
                <p className="text-xs font-semibold text-slate-400">Select a ticket to inspect conversation thread & reply</p>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Create Ticket Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg p-6 space-y-4 relative shadow-2xl">
            <button
              onClick={() => setShowCreateModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white p-1"
            >
              <X size={20} />
            </button>

            <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
              <Bike className="text-[#d4af37]" size={20} /> Submit Rider Support Request
            </h2>

            <form onSubmit={handleCreateTicket} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 font-semibold mb-1">Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 focus:border-[#d4af37] outline-none"
                >
                  <option value="DELIVERY">Delivery Job Issue</option>
                  <option value="PAYMENT">Rider Payout Dispute</option>
                  <option value="ACCOUNT">Rider Onboarding / Account</option>
                  <option value="TECHNICAL">App Technical Bug</option>
                  <option value="OTHER">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-400 font-semibold mb-1">Priority</label>
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value)}
                  className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 focus:border-[#d4af37] outline-none"
                >
                  <option value="LOW">Low</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="HIGH">High</option>
                  <option value="URGENT">Urgent</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-400 font-semibold mb-1">Subject</label>
                <input
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="Summary of issue..."
                  required
                  className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 focus:border-[#d4af37] outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-semibold mb-1">Description</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Detailed description of problem..."
                  rows="3"
                  required
                  className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 focus:border-[#d4af37] outline-none resize-none"
                />
              </div>

              <button
                type="submit"
                disabled={creating}
                className="w-full py-2.5 bg-[#d4af37] text-slate-950 font-bold rounded-xl hover:bg-[#c5a028] disabled:opacity-50 transition-colors mt-2"
              >
                {creating ? 'Submitting...' : 'Submit Rider Ticket'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default DeliverySupport;
