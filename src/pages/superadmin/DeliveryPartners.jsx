import React, { useState, useEffect, useCallback } from 'react';
import {
  getDeliveryPartners,
  getDeliveryPartnerById,
  approveDeliveryPartner,
  rejectDeliveryPartner,
  getOnboardingFeeSetting,
  updateOnboardingFeeSetting
} from '../../services/superadmin/superAdminDeliveryService';
import {
  Bike, Eye, IndianRupee, Edit3, Save, X, FileText, CreditCard,
  CheckCircle2, XCircle, Settings
} from 'lucide-react';
import {
  Button, Input, Modal, DataTable, StatusBadge,
  Alert, PageHeader, Spinner
} from '../../components/common';
import { useDataTableSync } from '../../hooks/useDataTableSync';

const ActionDropdown = ({ row, onViewDetail }) => {
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
        <div className="absolute right-0 mt-2 w-36 bg-white rounded-xl shadow-lg border border-gray-100 z-10 py-1 overflow-hidden">
          <button
            onClick={() => { setOpen(false); onViewDetail(row); }}
            className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2 transition-colors cursor-pointer"
          >
            <Eye size={14} className="text-gray-500" />
            View Details
          </button>
        </div>
      )}
    </div>
  );
};

const DeliveryPartners = () => {
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

  const [partners, setPartners] = useState([]);
  const [totalItems, setTotalItems] = useState(0);
  const [loading, setLoading] = useState(true);
  const [statusCounts, setStatusCounts] = useState({
    ALL: 0, PENDING_REVIEW: 0, APPROVED: 0, REJECTED: 0
  });

  // Fee state
  const [fee, setFee] = useState({ amount: 499, currency: 'INR' });
  const [editingFee, setEditingFee] = useState(false);
  const [newFeeAmount, setNewFeeAmount] = useState('499');
  const [feeUpdating, setFeeUpdating] = useState(false);

  // Selected partner modal state
  const [selectedPartnerId, setSelectedPartnerId] = useState(null);
  const [partnerDetails, setPartnerDetails] = useState(null);
  const [modalLoading, setModalLoading] = useState(false);
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  const [message, setMessage] = useState({ type: '', text: '' });

  const activeTab = filters.onboardingStatus || filters.status || 'PENDING_REVIEW';

  const fetchFeeSetting = async () => {
    try {
      const res = await getOnboardingFeeSetting();
      if (res.ok && res.data?.data) {
        setFee(res.data.data);
        setNewFeeAmount(res.data.data.amount.toString());
      }
    } catch (err) {
      // Keep default ₹499
    }
  };

  const fetchPartners = useCallback(async () => {
    setLoading(true);
    try {
      const queryParams = {
        page,
        limit,
        sortBy,
        sortOrder,
        search,
        onboardingStatus: activeTab === 'ALL' ? '' : activeTab,
        ...filters
      };

      const res = await getDeliveryPartners(queryParams);
      if (res.ok && res.data) {
        const rawPartners = res.data.partners || res.data.data?.partners || (Array.isArray(res.data.data) ? res.data.data : []);
        setPartners(rawPartners);
        const total = res.data.pagination?.total || res.data.data?.total || rawPartners.length;
        setTotalItems(total);
        if (res.data.statusCounts) {
          setStatusCounts(res.data.statusCounts);
        } else if (res.data.data?.statusCounts) {
          setStatusCounts(res.data.data.statusCounts);
        } else if (res.data.meta?.statusCounts) {
          setStatusCounts(res.data.meta.statusCounts);
        }
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'Failed to fetch delivery partners' });
    } finally {
      setLoading(false);
    }
  }, [page, limit, search, sortBy, sortOrder, filters, activeTab]);

  useEffect(() => {
    fetchFeeSetting();
  }, []);

  useEffect(() => {
    fetchPartners();
  }, [fetchPartners]);

  const handleTabChange = (statusKey) => {
    setPage(1);
    if (statusKey === 'ALL') {
      const newFilters = { ...filters };
      delete newFilters.onboardingStatus;
      delete newFilters.status;
      setFilters(newFilters);
    } else {
      setFilters({ ...filters, onboardingStatus: statusKey });
    }
  };

  const handleUpdateFee = async (e) => {
    e.preventDefault();
    setFeeUpdating(true);
    setMessage({ type: '', text: '' });

    try {
      const numFee = parseInt(newFeeAmount, 10);
      if (isNaN(numFee) || numFee <= 0) {
        setMessage({ type: 'error', text: 'Please enter a valid fee amount' });
        setFeeUpdating(false);
        return;
      }

      const res = await updateOnboardingFeeSetting(numFee);
      if (res.ok && res.data?.data) {
        setFee(res.data.data);
        setEditingFee(false);
        setMessage({ type: 'success', text: 'Onboarding fee updated successfully!' });
      } else {
        setMessage({ type: 'error', text: res.data.message || 'Failed to update fee' });
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'Error updating onboarding fee' });
    } finally {
      setFeeUpdating(false);
    }
  };

  const handleOpenDetails = async (id) => {
    setSelectedPartnerId(id);
    setModalLoading(true);
    setPartnerDetails(null);

    try {
      const res = await getDeliveryPartnerById(id);
      if (res.ok && res.data?.data) {
        setPartnerDetails(res.data.data);
      } else {
        setMessage({ type: 'error', text: 'Failed to load partner details' });
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'Error loading partner details' });
    } finally {
      setModalLoading(false);
    }
  };

  const handleApprove = async (id) => {
    setActionLoading(true);
    setMessage({ type: '', text: '' });

    try {
      const res = await approveDeliveryPartner(id);
      if (res.ok) {
        setMessage({ type: 'success', text: 'Delivery Partner approved successfully!' });
        setSelectedPartnerId(null);
        fetchPartners();
      } else {
        setMessage({ type: 'error', text: res.data.message || 'Approval failed' });
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'Error approving delivery partner' });
    } finally {
      setActionLoading(false);
    }
  };

  const handleRejectSubmit = async (e) => {
    e.preventDefault();
    if (!rejectionReason || !rejectionReason.trim()) {
      setMessage({ type: 'error', text: 'Rejection reason is required' });
      return;
    }

    setActionLoading(true);
    try {
      const res = await rejectDeliveryPartner(selectedPartnerId, rejectionReason);
      if (res.ok) {
        setMessage({ type: 'success', text: 'Delivery Partner application rejected' });
        setRejectModalOpen(false);
        setSelectedPartnerId(null);
        setRejectionReason('');
        fetchPartners();
      } else {
        setMessage({ type: 'error', text: res.data.message || 'Rejection failed' });
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'Error rejecting application' });
    } finally {
      setActionLoading(false);
    }
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
      key: 'fullName',
      label: 'Partner',
      sortable: true,
      className: 'px-2 py-3',
      headerClassName: 'px-2 py-3',
      render: (row) => (
        <div className="whitespace-nowrap">
          <div className="font-bold text-slate-900 text-sm truncate max-w-[120px]" title={row.fullName || 'Name Pending'}>{row.fullName || 'Name Pending'}</div>
          <div className="text-slate-500 text-xs font-mono mt-0.5">{row.mobile}</div>
        </div>
      )
    },
    {
      key: 'city',
      label: 'City / Zone',
      sortable: true,
      className: 'px-2 py-3',
      headerClassName: 'px-2 py-3',
      render: (row) => (
        <div className="whitespace-nowrap">
          <div className="font-semibold text-slate-800 text-xs truncate max-w-[100px]" title={row.city || '-'}>{row.city || '-'}</div>
          <div className="text-slate-500 text-xs truncate max-w-[100px]" title={row.zone || '-'}>{row.zone || '-'}</div>
        </div>
      )
    },
    {
      key: 'vehicleType',
      label: 'Vehicle',
      sortable: true,
      className: 'px-2 py-3',
      headerClassName: 'px-2 py-3',
      render: (row) => (
        <span className="px-2.5 py-1 bg-amber-50 border border-[#d4af37] text-[#a58523] rounded-lg font-bold text-[10px] whitespace-nowrap">
          {row.vehicleType || 'Bike'}
        </span>
      )
    },
    {
      key: 'onboardingStatus',
      label: 'Onboarding Status',
      sortable: true,
      className: 'px-2 py-3',
      headerClassName: 'px-2 py-3',
      render: (row) => <StatusBadge status={row.onboardingStatus} showIcon />
    },
    {
      key: 'createdAt',
      label: 'Registered Date',
      sortable: true,
      className: 'px-2 py-3',
      headerClassName: 'px-2 py-3',
      render: (row) => (
        <span className="text-slate-600 font-medium text-[11px] whitespace-nowrap">
          {new Date(row.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: '2-digit' })}
        </span>
      )
    },
    {
      key: 'actions',
      label: 'Actions',
      align: 'right',
      sortable: false,
      className: 'px-2 py-3',
      headerClassName: 'px-2 py-3',
      render: (row) => (
        <ActionDropdown
          row={row}
          onViewDetail={(row) => handleOpenDetails(row._id)}
        />
      )
    }
  ];

  const filterConfig = [
    {
      key: 'vehicleType',
      label: 'Vehicle Type',
      type: 'select',
      options: [
        { label: 'All Vehicles', value: '' },
        { label: 'Bike', value: 'Bike' },
        { label: 'Scooter', value: 'Scooter' },
        { label: 'EV Bike', value: 'EV Bike' },
        { label: 'Bicycle', value: 'Bicycle' }
      ]
    }
  ];

  return (
    <div className="space-y-6">
      {/* Top Banner & Header */}
      <PageHeader
        title="Delivery Partner Management"
        description="Review onboarding applications, configure fee, and manage partners"
        icon={Bike}
        extra={
          <div className="bg-white border border-slate-200 p-4 rounded-2xl flex items-center gap-4 shadow-sm">
            <div className="w-10 h-10 bg-amber-50 border border-[#d4af37]/40 rounded-xl flex items-center justify-center text-[#a58523] shrink-0">
              <IndianRupee className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs uppercase text-slate-500 font-bold block tracking-wider">Active Onboarding Fee</span>
              {editingFee ? (
                <form onSubmit={handleUpdateFee} className="flex items-center gap-2 mt-1">
                  <input
                    type="number"
                    id="superadmin-fee-input"
                    value={newFeeAmount}
                    onChange={(e) => setNewFeeAmount(e.target.value)}
                    className="w-24 px-2 py-1 bg-slate-50 border border-slate-300 text-slate-900 rounded-lg text-sm font-bold focus:border-[#d4af37] focus:outline-none"
                    required
                  />
                  <button
                    type="submit"
                    id="superadmin-fee-save-btn"
                    disabled={feeUpdating}
                    className="p-1.5 bg-[#d4af37] text-white rounded-lg hover:bg-[#a58523] transition-all shadow-sm cursor-pointer"
                  >
                    <Save className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditingFee(false)}
                    className="p-1.5 text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </form>
              ) : (
                <div className="flex items-center gap-2">
                  <span className="text-lg font-extrabold text-[#a58523]">₹{fee.amount} INR</span>
                  <button
                    type="button"
                    id="superadmin-edit-fee-btn"
                    onClick={() => setEditingFee(true)}
                    className="p-1 text-slate-400 hover:text-[#a58523] transition-all cursor-pointer"
                    title="Edit Onboarding Fee"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          </div>
        }
      />

      {/* Global Alerts */}
      {message.text && (
        <Alert
          type={message.type === 'success' ? 'success' : 'error'}
          onClose={() => setMessage({ type: '', text: '' })}
        >
          {message.text}
        </Alert>
      )}

      {/* Tabs Header */}
      <div className="flex items-center gap-2 border-b border-gray-200 overflow-x-auto pb-1">
        <button
          onClick={() => handleTabChange('PENDING_REVIEW')}
          className={`px-4 py-2 text-sm font-medium border-b-2 whitespace-nowrap transition-colors cursor-pointer ${
            activeTab === 'PENDING_REVIEW'
              ? 'border-[#d4af37] text-gray-900 font-bold'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          PENDING_REVIEW ({statusCounts.PENDING_REVIEW || 0})
        </button>
        <button
          onClick={() => handleTabChange('APPROVED')}
          className={`px-4 py-2 text-sm font-medium border-b-2 whitespace-nowrap transition-colors cursor-pointer ${
            activeTab === 'APPROVED'
              ? 'border-emerald-500 text-emerald-600 font-bold'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          APPROVED ({statusCounts.APPROVED || 0})
        </button>
        <button
          onClick={() => handleTabChange('REJECTED')}
          className={`px-4 py-2 text-sm font-medium border-b-2 whitespace-nowrap transition-colors cursor-pointer ${
            activeTab === 'REJECTED'
              ? 'border-red-500 text-red-600 font-bold'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          REJECTED ({statusCounts.REJECTED || 0})
        </button>
        <button
          onClick={() => handleTabChange('ALL')}
          className={`px-4 py-2 text-sm font-medium border-b-2 whitespace-nowrap transition-colors cursor-pointer ${
            activeTab === 'ALL'
              ? 'border-amber-500 text-amber-600 font-bold'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          ALL STATUS ({statusCounts.ALL || 0})
        </button>
      </div>

      {/* Generic Reusable Server-Side DataTable */}
      <DataTable
        columns={columns}
        data={partners}
        loading={loading}
        emptyMessage="No delivery partners found matching the selected criteria."
        pagination={{
          page,
          limit,
          total: totalItems
        }}
        onPageChange={setPage}
        onLimitChange={setLimit}
        search={{
          value: search,
          placeholder: "Search mobile, name, city..."
        }}
        onSearchChange={setSearch}
        filterConfig={filterConfig}
        filters={filters}
        onFilterChange={setFilters}
        onClearFilters={handleClearFilters}
        sorting={{
          sortBy,
          sortOrder
        }}
        onSortChange={setSort}
      />

      {/* Partner Details Modal */}
      <Modal
        open={Boolean(selectedPartnerId)}
        onClose={() => setSelectedPartnerId(null)}
        title="Delivery Partner Application Review"
        icon={Bike}
        size="lg"
      >
        {modalLoading ? (
          <div className="p-12 text-center text-slate-500 flex items-center justify-center gap-2">
            <Spinner size="md" /> Loading partner profile...
          </div>
        ) : partnerDetails ? (
          <div className="space-y-6 text-xs text-slate-700">
            {/* Profile Overview */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200">
              <div>
                <span className="text-slate-500 block font-medium">Full Name:</span>
                <strong className="text-slate-900 text-sm font-bold">{partnerDetails.partner?.fullName}</strong>
              </div>
              <div>
                <span className="text-slate-500 block font-medium">Mobile:</span>
                <strong className="text-slate-900 font-mono">{partnerDetails.partner?.mobile}</strong>
              </div>
              <div>
                <span className="text-slate-500 block font-medium">Email:</span>
                <strong className="text-slate-900">{partnerDetails.partner?.email || 'N/A'}</strong>
              </div>
              <div>
                <span className="text-slate-500 block font-medium">City / Zone:</span>
                <strong className="text-slate-900">{partnerDetails.partner?.city} - {partnerDetails.partner?.zone}</strong>
              </div>
              <div>
                <span className="text-slate-500 block font-medium">Vehicle Type:</span>
                <strong className="text-[#a58523] font-bold">{partnerDetails.partner?.vehicleType}</strong>
              </div>
              <div>
                <span className="text-slate-500 block font-medium mb-1">Status:</span>
                <StatusBadge status={partnerDetails.partner?.onboardingStatus} showIcon size="xs" />
              </div>
            </div>

            {/* Location */}
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
              <span className="text-slate-500 block font-semibold">Operational Selected Location:</span>
              <p className="text-slate-900 font-medium">{partnerDetails.partner?.selectedAddress || 'Not specified'}</p>
            </div>

            {/* Documents */}
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
              <h3 className="font-bold text-slate-900 flex items-center gap-2 text-sm">
                <FileText className="w-4 h-4 text-[#d4af37]" /> Identity Documents Verification
              </h3>
              {partnerDetails.documents ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <span className="text-slate-500 block">Aadhaar Number:</span>
                    <strong className="text-slate-900 font-mono">{partnerDetails.documents.aadhaarNumber}</strong>
                    <div className="flex gap-2 mt-2">
                      {partnerDetails.documents.aadhaarFrontUrl && (
                        <a
                          href={partnerDetails.documents.aadhaarFrontUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="text-[#a58523] font-semibold underline text-xs hover:text-slate-900"
                        >
                          View Aadhaar Front
                        </a>
                      )}
                      {partnerDetails.documents.aadhaarBackUrl && (
                        <a
                          href={partnerDetails.documents.aadhaarBackUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="text-[#a58523] font-semibold underline text-xs hover:text-slate-900"
                        >
                          View Aadhaar Back
                        </a>
                      )}
                    </div>
                  </div>

                  <div>
                    <span className="text-slate-500 block">PAN Number:</span>
                    <strong className="text-slate-900 font-mono">{partnerDetails.documents.panNumber}</strong>
                    <div className="mt-2">
                      {partnerDetails.documents.panUrl && (
                        <a
                          href={partnerDetails.documents.panUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="text-[#a58523] font-semibold underline text-xs hover:text-slate-900"
                        >
                          View PAN Image
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                <p className="text-slate-500">No document records found.</p>
              )}
            </div>

            {/* Bank Details (Masked) */}
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
              <h3 className="font-bold text-slate-900 flex items-center gap-2 text-sm">
                <CreditCard className="w-4 h-4 text-[#d4af37]" /> Bank Payout Account (Masked)
              </h3>
              {partnerDetails.bank ? (
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <span className="text-slate-500 block">Holder Name:</span>
                    <strong className="text-slate-900">{partnerDetails.bank.accountHolderName}</strong>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Account Number:</span>
                    <strong className="text-slate-900 font-mono">{partnerDetails.bank.maskedAccountNumber}</strong>
                  </div>
                  <div>
                    <span className="text-slate-500 block">IFSC Code:</span>
                    <strong className="text-slate-900 font-mono">{partnerDetails.bank.ifscCode}</strong>
                  </div>
                </div>
              ) : (
                <p className="text-slate-500">No bank details recorded.</p>
              )}
            </div>

            {/* Payment Record */}
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
              <h3 className="font-bold text-slate-900 flex items-center gap-2 text-sm">
                <IndianRupee className="w-4 h-4 text-[#d4af37]" /> Onboarding Fee Payment Status
              </h3>
              {partnerDetails.payment ? (
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <span className="text-slate-500 block">Amount Paid:</span>
                    <strong className="text-[#a58523] font-bold">₹{partnerDetails.payment.amount} INR</strong>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Razorpay Order ID:</span>
                    <strong className="font-mono text-slate-900">{partnerDetails.payment.razorpayOrderId}</strong>
                  </div>
                  <div>
                    <span className="text-slate-500 block mb-1">Payment State:</span>
                    <StatusBadge status={partnerDetails.payment.status} size="xs" />
                  </div>
                </div>
              ) : (
                <p className="text-slate-500">No payment record found.</p>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end gap-3 pt-4 border-t border-slate-200">
              <Button
                type="button"
                id="superadmin-reject-partner-btn"
                onClick={() => setRejectModalOpen(true)}
                disabled={actionLoading}
                variant="danger"
                icon={XCircle}
              >
                Reject Application
              </Button>
              <Button
                type="button"
                id="superadmin-approve-partner-btn"
                onClick={() => handleApprove(partnerDetails.partner._id)}
                loading={actionLoading}
                variant="primary"
                icon={CheckCircle2}
              >
                Approve Delivery Partner
              </Button>
            </div>
          </div>
        ) : null}
      </Modal>

      {/* Reject Reason Modal */}
      <Modal
        open={rejectModalOpen}
        onClose={() => setRejectModalOpen(false)}
        title="Reject Delivery Partner Application"
        icon={XCircle}
        size="sm"
      >
        <form onSubmit={handleRejectSubmit} className="space-y-4">
          <p className="text-xs text-slate-600">
            Please enter the explicit reason for rejecting this application. This reason will be visible to the partner for correction and resubmission.
          </p>

          <Input
            label="Rejection Reason"
            type="textarea"
            id="superadmin-rejection-reason"
            value={rejectionReason}
            onChange={(e) => setRejectionReason(e.target.value)}
            placeholder="e.g. Aadhaar image is blurry. Please re-upload a clear copy."
            rows={3}
            required
          />

          <div className="flex justify-end gap-3 pt-2">
            <Button variant="ghost" onClick={() => setRejectModalOpen(false)}>
              Cancel
            </Button>
            <Button
              type="submit"
              id="superadmin-submit-reject-btn"
              loading={actionLoading}
              variant="dangerSolid"
            >
              Confirm Rejection
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default DeliveryPartners;
