import React, { useState, useEffect } from 'react';
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
  CheckCircle2, XCircle
} from 'lucide-react';
import {
  Button, Input, Modal, ConfirmModal, DataTable, StatusBadge,
  Card, Alert, PageHeader, SearchInput, Spinner
} from '../../components/common';

const DeliveryPartners = () => {
  const [partners, setPartners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('PENDING_REVIEW');
  const [searchQuery, setSearchQuery] = useState('');

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

  useEffect(() => {
    fetchFeeSetting();
    fetchPartners();
  }, [filterStatus]);

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

  const fetchPartners = async () => {
    setLoading(true);
    try {
      const res = await getDeliveryPartners(filterStatus, searchQuery);
      if (res.ok && res.data?.data) {
        setPartners(res.data.data.partners || (Array.isArray(res.data.data) ? res.data.data : []));
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'Failed to fetch delivery partners' });
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    if (e) e.preventDefault();
    fetchPartners();
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

  // Define columns for generic DataTable component with high contrast light theme typography
  const columns = [
    {
      key: 'partner',
      label: 'Partner',
      render: (row) => (
        <div>
          <div className="font-bold text-slate-900 text-sm">{row.fullName || 'Name Pending'}</div>
          <div className="text-slate-500 text-xs font-mono mt-0.5">{row.mobile}</div>
        </div>
      )
    },
    {
      key: 'city',
      label: 'City / Zone',
      render: (row) => (
        <div>
          <div className="font-semibold text-slate-800 text-xs">{row.city || '-'}</div>
          <div className="text-slate-500 text-xs">{row.zone || '-'}</div>
        </div>
      )
    },
    {
      key: 'vehicleType',
      label: 'Vehicle',
      render: (row) => (
        <span className="px-2.5 py-1 bg-amber-50 border border-[#d4af37] text-[#a58523] rounded-lg font-bold text-xs">
          {row.vehicleType || 'Bike'}
        </span>
      )
    },
    {
      key: 'onboardingStatus',
      label: 'Onboarding Status',
      render: (row) => <StatusBadge status={row.onboardingStatus} showIcon />
    },
    {
      key: 'createdAt',
      label: 'Registered Date',
      render: (row) => (
        <span className="text-slate-600 font-medium text-xs">
          {new Date(row.createdAt).toLocaleDateString('en-GB')}
        </span>
      )
    },
    {
      key: 'actions',
      label: 'Actions',
      align: 'right',
      render: (row) => (
        <Button
          type="button"
          id={`view-partner-${row._id}`}
          onClick={() => handleOpenDetails(row._id)}
          variant="outline"
          size="sm"
          icon={Eye}
          className="ml-auto"
        >
          View Details
        </Button>
      )
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
                    className="p-1.5 bg-[#d4af37] text-white rounded-lg hover:bg-[#a58523] transition-all shadow-sm"
                  >
                    <Save className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditingFee(false)}
                    className="p-1.5 text-slate-400 hover:text-slate-600"
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
                    className="p-1 text-slate-400 hover:text-[#a58523] transition-all"
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

      {/* Filters & Search Bar */}
      <Card padding="sm">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto pb-2 sm:pb-0 custom-scrollbar">
            {['PENDING_REVIEW', 'APPROVED', 'REJECTED', 'ALL'].map((st) => (
              <button
                key={st}
                id={`filter-status-${st.toLowerCase()}`}
                onClick={() => setFilterStatus(st)}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap shadow-sm ${
                  filterStatus === st
                    ? 'bg-amber-50 border border-[#d4af37] text-[#a58523]'
                    : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
              >
                {st === 'ALL' ? 'ALL STATUS' : st}
              </button>
            ))}
          </div>

          <SearchInput
            id="superadmin-search-partners"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onSubmit={handleSearchSubmit}
            placeholder="Search mobile, name, city..."
            className="w-full sm:w-72"
          />
        </div>
      </Card>

      {/* Generic Reusable DataTable */}
      <DataTable
        columns={columns}
        data={partners}
        loading={loading}
        emptyMessage={`No delivery partners found for filter ${filterStatus}.`}
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

      {/* Reject Reason Modal using common Modal */}
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
