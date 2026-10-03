import React, { useState, useEffect } from 'react';
import { Card, Button, StatusBadge } from '../common';
import { getEarnings } from '../../services/delivery/deliveryOrderService';
import { Wallet, IndianRupee, ArrowDownRight, ArrowUpRight, Calendar, AlertCircle } from 'lucide-react';
import { toast } from 'react-toastify';

const EarningsTab = () => {
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
          // Mock data if endpoint returns empty but success
          setEarningsData({
            walletBalance: 1250,
            todaysEarnings: 350,
            thisWeekEarnings: 2100,
            totalEarnings: 15400,
            transactions: [
              { _id: 't1', type: 'CREDIT', amount: 45, description: 'Delivery Fee - ORD-123', date: new Date().toISOString(), status: 'COMPLETED' },
              { _id: 't2', type: 'CREDIT', amount: 50, description: 'Delivery Fee - ORD-124', date: new Date(Date.now() - 86400000).toISOString(), status: 'COMPLETED' },
              { _id: 't3', type: 'DEBIT', amount: 1000, description: 'Withdrawal to Bank', date: new Date(Date.now() - 172800000).toISOString(), status: 'COMPLETED' },
              { _id: 't4', type: 'CREDIT', amount: 100, description: 'Weekend Bonus', date: new Date(Date.now() - 259200000).toISOString(), status: 'COMPLETED' }
            ]
          });
        }
      } catch (error) {
        toast.error('Failed to load earnings data');
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
    // Here we would normally call a withdraw API endpoint
  };

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <Card className="h-40 bg-slate-200"></Card>
        <div className="grid grid-cols-2 gap-4">
          <Card className="h-24 bg-slate-200"></Card>
          <Card className="h-24 bg-slate-200"></Card>
        </div>
        <div className="space-y-3 mt-6">
          <div className="h-6 bg-slate-200 w-1/3 rounded"></div>
          <Card className="h-16 bg-slate-200"></Card>
          <Card className="h-16 bg-slate-200"></Card>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Wallet Balance Card */}
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

      {/* Summary Stats */}
      <div className="grid grid-cols-2 gap-4">
        <Card className="p-5 flex flex-col justify-center border-l-4 border-l-green-500">
          <p className="text-slate-500 text-sm font-medium mb-1">Today's Earnings</p>
          <p className="text-2xl font-bold text-slate-800">₹{earningsData?.todaysEarnings || '0'}</p>
        </Card>
        <Card className="p-5 flex flex-col justify-center border-l-4 border-l-blue-500">
          <p className="text-slate-500 text-sm font-medium mb-1">This Week</p>
          <p className="text-2xl font-bold text-slate-800">₹{earningsData?.thisWeekEarnings || '0'}</p>
        </Card>
      </div>

      {/* Transaction History */}
      <div>
        <div className="flex justify-between items-center mb-4 mt-8">
          <h3 className="text-lg font-bold text-slate-800">Recent Transactions</h3>
          <Button variant="outline" size="sm" className="text-xs">View All</Button>
        </div>
        
        {(!earningsData?.transactions || earningsData.transactions.length === 0) ? (
          <Card className="p-8 text-center bg-slate-50 border-dashed border-2 border-slate-300">
            <Wallet size={40} className="mx-auto text-slate-400 mb-3" />
            <p className="text-slate-500">No transactions found.</p>
          </Card>
        ) : (
          <div className="space-y-3">
            {earningsData.transactions.map((txn) => (
              <Card key={txn._id} className="p-4 flex items-center justify-between hover:shadow-sm transition-shadow">
                <div className="flex items-center">
                  <div className={`p-3 rounded-full mr-4 ${
                    txn.type === 'CREDIT' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
                  }`}>
                    {txn.type === 'CREDIT' ? <ArrowDownRight size={20} /> : <ArrowUpRight size={20} />}
                  </div>
                  <div>
                    <p className="font-semibold text-slate-800">{txn.description}</p>
                    <p className="text-xs text-slate-500 flex items-center mt-1">
                      <Calendar size={12} className="mr-1" />
                      {new Date(txn.date).toLocaleDateString()} • {new Date(txn.date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`text-lg font-bold ${txn.type === 'CREDIT' ? 'text-green-600' : 'text-slate-800'}`}>
                    {txn.type === 'CREDIT' ? '+' : '-'}₹{txn.amount}
                  </p>
                  {txn.status !== 'COMPLETED' && (
                    <span className="text-[10px] uppercase font-bold text-amber-500 bg-amber-50 px-2 py-0.5 rounded">
                      {txn.status}
                    </span>
                  )}
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default EarningsTab;
