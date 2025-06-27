'use client';
import { useEffect, useState } from 'react';
import api from '@/utils/axios';
import { CalendarDays, AlertCircle, Loader2, CheckCircle2, ChevronDown } from 'lucide-react';
import { Modal } from '@/components/modals/modals';
import { useAuth } from '@/context/AuthProvider';

export default function LeaveApplyPage() {
  const [form, setForm] = useState({
    policy: '',
    startDate: '',
    endDate: '',
    reason: '',
  });
  const [leaveBalances, setLeaveBalances] = useState([]);
  const [message, setMessage] = useState({ text: '', type: '' });
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [daysRequested, setDaysRequested] = useState(0);
  const [modal, setModal] = useState({
    isOpen: false,
    title: "Success!",
    description: "Your changes have been saved successfully.",
    type: "success",
    primaryButtonText: "Okay",
    secondaryButtonText: "Not now",
    showCloseButton: false,
    noButtons: false,
  });

  const { authToken } = useAuth();

  useEffect(() => {
    if (!authToken) return;

    const fetchBalances = async () => {
      try {
        const res = await api.get('/leave/balance/me', {
          headers: { Authorization: `Bearer ${authToken}` },
        });

        const balances = res.data.balances.filter(item => item?.policy?.leaveType);
        setLeaveBalances(balances);

        if (balances.length > 0) {
          setForm(prev => ({ ...prev, policy: balances[0].policy._id }));
        }
      } catch (err) {
        console.error('Error fetching balances:', err);
        setMessage({
          text: err.response?.data?.message || 'Failed to fetch leave balances',
          type: 'error'
        });
      } finally {
        setFetching(false);
      }
    };

    fetchBalances();
  }, [authToken]);

  useEffect(() => {
    if (form.startDate && form.endDate) {
      const start = new Date(form.startDate);
      const end = new Date(form.endDate);
      const diffTime = Math.abs(end - start);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
      setDaysRequested(diffDays);
    } else {
      setDaysRequested(0);
    }
  }, [form.startDate, form.endDate]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setMessage({ text: '', type: '' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!authToken) return;

    setLoading(true);
    try {
      await api.post('/leave/apply', form, {
        headers: { Authorization: `Bearer ${authToken}` },
      });

      setModal({
        isOpen: true,
        title: "Leave Request Submitted",
        description: "Your leave request has been submitted successfully and is pending approval.",
        type: "success",
        primaryButtonText: "Okay",
        secondaryButtonText: "Not now",
        showCloseButton: true,
        noButtons: false,
      });

      setMessage({
        text: 'Leave request submitted successfully!',
        type: 'success'
      });

      setForm({
        policy: leaveBalances[0]?.policy._id || '',
        startDate: '',
        endDate: '',
        reason: '',
      });
      setDaysRequested(0);
    } catch (err) {
      setModal({
        isOpen: true,
        title: "Error Submitting Leave",
        description: "Failed to apply for leave. Please try again.",
        type: "error",
        primaryButtonText: "Try again",
        secondaryButtonText: "Not now",
        showCloseButton: true,
        noButtons: false,
      });

      setMessage({
        text: err.response?.data?.message || 'Failed to apply for leave',
        type: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const selectedPolicy = leaveBalances.find(b => b.policy._id === form.policy);



  return (
    <div className="max-w-2xl mx-auto p-6">

      <Modal
        isOpen={modal.isOpen}
        onClose={() => setModal(prevModal => ({ 
          ...prevModal,
          isOpen: false
        }))}
        title={modal.title}
        description={modal.description}
        type={modal.type}
        noButtons={modal.noButtons}
        primaryButtonText={modal.primaryButtonText}
        secondaryButtonText= {modal.secondaryButtonText}
      />
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center gap-2">
          <CalendarDays className="w-8 h-8 text-blue-600" />
          Apply for Leave
        </h1>
        <p className="text-gray-600">Submit your leave request for approval</p>
      </div>

      {message.text && (
        <div className={`p-4 mb-6 rounded-md flex items-start gap-3 ${message.type === 'error' ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'}`}>
          {message.type === 'error' ? (
            <AlertCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
          ) : (
            <CheckCircle2 className="w-5 h-5 mt-0.5 flex-shrink-0" />
          )}
          <p className="text-sm">{message.text}</p>
        </div>
      )}

      {fetching ? (
        <div className="flex justify-center items-center h-40">
          <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
        </div>
      ) : leaveBalances.length === 0 ? (
        <div className="bg-red-50 p-4 rounded-md text-red-700 flex items-center gap-3">
          <AlertCircle className="w-5 h-5" />
          <p>No leave balances available. Please contact HR.</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Leave Type</label>
              <div className="relative">
                <select
                  name="policy"
                  value={form.policy}
                  onChange={handleChange}
                  className="w-full pl-3 pr-10 py-2.5 border border-gray-300 rounded-md appearance-none bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                >
                  {leaveBalances.map(item => (
                    <option key={item.policy._id} value={item.policy._id}>
                      {item.policy.leaveType.typeName} (Remaining: {item.remainingBalance} days)
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-3 h-4 w-4 text-gray-400 pointer-events-none" />
              </div>
              {selectedPolicy && (
                <p className="mt-1 text-sm text-gray-500">
                  Max duration: {selectedPolicy.policy.maxDuration} days per request
                </p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                <input
                  type="date"
                  name="startDate"
                  value={form.startDate}
                  onChange={handleChange}
                  min={new Date().toISOString().split('T')[0]}
                  required
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                <input
                  type="date"
                  name="endDate"
                  value={form.endDate}
                  onChange={handleChange}
                  min={form.startDate || new Date().toISOString().split('T')[0]}
                  required
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            {daysRequested > 0 && selectedPolicy && (
              <div className="bg-blue-50 p-4 rounded-md">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-blue-800">Days Requested:</span>
                  <span className="font-semibold">{daysRequested} day{daysRequested !== 1 ? 's' : ''}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-blue-800">Remaining Balance:</span>
                  <span className="font-semibold">{selectedPolicy.remainingBalance} day{selectedPolicy.remainingBalance !== 1 ? 's' : ''}</span>
                </div>
                {daysRequested > selectedPolicy.remainingBalance && (
                  <p className="mt-2 text-sm text-red-600">
                    You're requesting more days than your remaining balance
                  </p>
                )}
                {selectedPolicy.policy.maxDuration && daysRequested > selectedPolicy.policy.maxDuration && (
                  <p className="mt-2 text-sm text-red-600">
                    Exceeds maximum duration of {selectedPolicy.policy.maxDuration} days per request
                  </p>
                )}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Reason</label>
              <textarea
                name="reason"
                value={form.reason}
                onChange={handleChange}
                required
                rows={4}
                className="w-full px-3 py-2.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Briefly explain the reason for your leave"
              />
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Submitting...
                </>
              ) : (
                'Submit Leave Request'
              )}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}