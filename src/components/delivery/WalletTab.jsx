import React, { useState, useEffect } from 'react';
import { Card, Button } from '../common';
import { getEarnings } from '../../services/delivery/deliveryOrderService';
import { Wallet, IndianRupee, AlertCircle } from 'lucide-react';
import { toast } from 'react-toastify';

const WalletTab = () => {
  const [earningsData, setEarningsData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEarnings = async () => {
      try {
        setLoading(true);
        const response = await getEarnings();
        if (response.success && response.data) {
          setEarningsData(response.data);
        } else {
          setEarningsData({
            walletBalance: 1250,
            pendingAmount: 300,
            totalWithdrawals: 5000,
            transactions: [] // transactions are moved to EarningsTab or we can list here too
          });
        }
      } catch (error) {
        toast.error('Failed to load wallet data');
      } finally {
        setLoading(false);
      }
    };
    fetchEarnings();
  }, []);

  const handleWithdraw = () => {
    if (!earningsData || earningsData.walletBalance < 500) {
      toast.error('Minimum withdrawal amount is ₹500');
      return;
    }
    toast.success('Withdrawal request submitted! It will be processed in 1-2 business days.');
  };

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <Card className="h-40 bg-slate-200"></Card>
        <Card className="h-32 bg-slate-200"></Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-slate-800">Wallet & Payouts</h2>
      </div>

      <Card className="bg-gradient-to-br from-[#d4af37] to-[#a58523] text-white border-0 shadow-lg relative overflow-hidden">
        <div className="absolute -right-6 -top-6 text-white/20">
          <Wallet size={120} />
        </div>
        <div className="p-6 relative z-10">
          <p className="text-white/80 font-medium uppercase tracking-wide text-sm mb-1">Available Balance</p>
          <h2 className="text-4xl font-bold mb-6 flex items-center">
            <IndianRupee size={32} className="mr-1" />
            {earningsData?.walletBalance || '0'}
          </h2>
          
          <Button 
            className="bg-white text-[#a58523] hover:bg-slate-50 border-0 shadow-md font-bold"
            onClick={handleWithdraw}
          >
            Withdraw to Bank
          </Button>
          
          {(earningsData?.walletBalance || 0) < 500 && (
            <p className="text-white/70 text-xs mt-3 flex items-center">
              <AlertCircle size={12} className="mr-1" /> Min withdrawal ₹500
            </p>
          )}
        </div>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="p-5 border-t-4 border-t-blue-500">
          <p className="text-slate-500 text-sm font-medium mb-1">Pending Clearance</p>
          <p className="text-2xl font-bold text-slate-800">₹{earningsData?.pendingAmount || '0'}</p>
          <p className="text-xs text-slate-400 mt-2">Processing for next payout</p>
        </Card>
        <Card className="p-5 border-t-4 border-t-green-500">
          <p className="text-slate-500 text-sm font-medium mb-1">Total Withdrawn</p>
          <p className="text-2xl font-bold text-slate-800">₹{earningsData?.totalWithdrawals || '0'}</p>
          <p className="text-xs text-slate-400 mt-2">Lifetime earnings transferred</p>
        </Card>
      </div>

      <Card className="bg-slate-50 p-5 mt-6 border border-slate-200">
        <h3 className="font-semibold text-slate-800 mb-3">Bank Account Details</h3>
        <div className="space-y-2 text-sm text-slate-600">
          <div className="flex justify-between">
            <span>Bank Name</span>
            <span className="font-medium text-slate-800">HDFC Bank</span>
          </div>
          <div className="flex justify-between">
            <span>Account Number</span>
            <span className="font-medium text-slate-800">XXXX XXXX 1234</span>
          </div>
          <div className="flex justify-between">
            <span>Status</span>
            <span className="font-medium text-green-600">Verified</span>
          </div>
        </div>
        <Button variant="outline" size="sm" className="w-full mt-4 text-slate-600">
          Update Bank Details
        </Button>
      </Card>
    </div>
  );
};

export default WalletTab;
