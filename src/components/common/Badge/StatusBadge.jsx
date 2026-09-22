import React from 'react';
import { CheckCircle2, XCircle, Clock, AlertTriangle, ShieldCheck, ShieldAlert, CreditCard } from 'lucide-react';

const StatusBadge = ({ status, customLabel, size = 'sm', className = '', showIcon = false }) => {
  if (!status) return null;

  const normalizedStatus = String(status).toUpperCase();

  const statusConfig = {
    APPROVED: {
      color: 'bg-emerald-50 border-emerald-200 text-emerald-700',
      icon: CheckCircle2,
      label: 'Approved'
    },
    ACTIVE: {
      color: 'bg-emerald-50 border-emerald-200 text-emerald-700',
      icon: ShieldCheck,
      label: 'Active'
    },
    PAYMENT_SUCCESS: {
      color: 'bg-emerald-50 border-emerald-200 text-emerald-700',
      icon: CreditCard,
      label: 'Payment Verified'
    },
    SUCCESS: {
      color: 'bg-emerald-50 border-emerald-200 text-emerald-700',
      icon: CheckCircle2,
      label: 'Success'
    },

    PENDING: {
      color: 'bg-amber-50 border-amber-200 text-amber-700',
      icon: Clock,
      label: 'Pending'
    },
    PENDING_REVIEW: {
      color: 'bg-amber-50 border-amber-200 text-[#a58523]',
      icon: Clock,
      label: 'Pending Review'
    },
    ONBOARDING_IN_PROGRESS: {
      color: 'bg-amber-50 border-amber-200 text-amber-700',
      icon: Clock,
      label: 'In Progress'
    },
    PAYMENT_PENDING: {
      color: 'bg-amber-50 border-amber-200 text-amber-700',
      icon: CreditCard,
      label: 'Payment Pending'
    },

    REJECTED: {
      color: 'bg-rose-50 border-rose-200 text-rose-700',
      icon: XCircle,
      label: 'Rejected'
    },
    SUSPENDED: {
      color: 'bg-rose-50 border-rose-200 text-rose-700',
      icon: ShieldAlert,
      label: 'Suspended'
    },
    INACTIVE: {
      color: 'bg-slate-100 border-slate-200 text-slate-600',
      icon: AlertTriangle,
      label: 'Inactive'
    },
    FAILED: {
      color: 'bg-rose-50 border-rose-200 text-rose-700',
      icon: XCircle,
      label: 'Failed'
    }
  };

  const current = statusConfig[normalizedStatus] || {
    color: 'bg-slate-100 border-slate-200 text-slate-600',
    icon: Clock,
    label: normalizedStatus
  };

  const IconComponent = current.icon;
  const labelText = customLabel || current.label;

  const sizes = {
    xs: 'px-2 py-0.5 text-[10px]',
    sm: 'px-3 py-1 text-xs',
    md: 'px-3.5 py-1.5 text-xs'
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-bold border rounded-full uppercase tracking-wider ${current.color} ${sizes[size] || sizes.sm} ${className}`}
    >
      {showIcon && <IconComponent className="w-3.5 h-3.5 shrink-0" />}
      <span>{labelText}</span>
    </span>
  );
};

export default StatusBadge;
