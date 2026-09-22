import React from 'react';
import Modal from '../Modal/Modal';
import Button from '../Button/Button';
import { AlertTriangle, AlertCircle, CheckCircle2, Info } from 'lucide-react';

const ConfirmModal = ({
  open,
  title = 'Are you sure?',
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'danger',
  loading = false,
  onConfirm,
  onCancel,
  icon,
  id
}) => {
  const iconMap = {
    danger: AlertTriangle,
    warning: AlertCircle,
    success: CheckCircle2,
    primary: Info
  };

  const IconComponent = icon || iconMap[variant] || AlertCircle;

  const btnVariantMap = {
    danger: 'dangerSolid',
    warning: 'primary',
    success: 'primary',
    primary: 'primary'
  };

  const iconColorMap = {
    danger: 'text-rose-600 bg-rose-50 border-rose-200',
    warning: 'text-amber-700 bg-amber-50 border-amber-200',
    success: 'text-emerald-700 bg-emerald-50 border-emerald-200',
    primary: 'text-amber-700 bg-amber-50 border-amber-200'
  };

  return (
    <Modal
      open={open}
      onClose={onCancel}
      title={title}
      size="sm"
      id={id}
      footer={
        <>
          <Button variant="ghost" onClick={onCancel} disabled={loading}>
            {cancelText}
          </Button>
          <Button
            variant={btnVariantMap[variant]}
            onClick={onConfirm}
            loading={loading}
          >
            {confirmText}
          </Button>
        </>
      }
    >
      <div className="flex items-start gap-4 pt-1">
        <div className={`p-3 rounded-xl border shrink-0 ${iconColorMap[variant]}`}>
          <IconComponent className="w-6 h-6" />
        </div>
        <p className="text-xs text-slate-700 leading-relaxed font-medium pt-1">
          {message}
        </p>
      </div>
    </Modal>
  );
};

export default ConfirmModal;
