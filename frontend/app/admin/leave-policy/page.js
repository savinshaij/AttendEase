'use client';
import { useEffect, useState } from 'react';
import api from '@/utils/axios';
import { useRouter } from 'next/navigation';
import { AlertCircle, CheckCircle2, Loader2, ChevronDown } from 'lucide-react';
import { useAuth } from '@/context/AuthProvider';

export default function LeavePolicyPage() {
  const [policies, setPolicies] = useState([]);
  const [leaveTypes, setLeaveTypes] = useState([]);
  const [form, setForm] = useState({
    leaveType: '',
    policyName: '',
    description: '',
    numberOfLeaves: ''
  });
  const [message, setMessage] = useState({ text: '', type: '' });
  const [loading, setLoading] = useState(false);

  const { authToken } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!authToken) return router.push('/login');
    fetchPolicies();
    fetchLeaveTypes();
  }, [authToken]);

  const fetchPolicies = async () => {
    try {
      const res = await api.get('/admin/leave-policies', {
        headers: { Authorization: `Bearer ${authToken}` }
      });
      setPolicies(res.data.policies);
    } catch {
      setMessage({ text: 'Failed to load policies', type: 'error' });
    }
  };

  const fetchLeaveTypes = async () => {
    try {
      const res = await api.get('/admin/leave-types', {
        headers: { Authorization: `Bearer ${authToken}` }
      });
      setLeaveTypes(res.data.leaveTypes);
    } catch {
      setMessage({ text: 'Failed to load leave types', type: 'error' });
    }
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setMessage({ text: '', type: '' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/admin/leave-policy', form, {
        headers: { Authorization: `Bearer ${authToken}` }
      });
      setMessage({ text: 'Policy added successfully', type: 'success' });
      setForm({ leaveType: '', policyName: '', description: '', numberOfLeaves: '' });
      fetchPolicies();
    } catch (err) {
      setMessage({
        text: err.response?.data?.message || 'Failed to add policy',
        type: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this policy?')) return;
    try {
      await api.delete(`/admin/leave-policy/${id}`, {
        headers: { Authorization: `Bearer ${authToken}` }
      });
      setPolicies((prev) => prev.filter((p) => p._id !== id));
      setMessage({ text: 'Policy deleted successfully', type: 'success' });
    } catch (err) {
      setMessage({
        text: err.response?.data?.message || 'Failed to delete policy',
        type: 'error'
      });
    }
  };




  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto min-h-screen">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[#14121f]">Leave Policy Management</h1>
        <p className="text-[#666] mt-1">Create and manage leave policies for your team.</p>
      </div>

      {message.text && (
        <div
          className={`mb-6 p-4 rounded-md border flex items-center gap-2 ${message.type === 'success'
              ? 'bg-green-50 text-green-700 border-green-200'
              : 'bg-red-50 text-red-700 border-red-200'
            }`}
        >
          {message.type === 'success' ? (
            <CheckCircle2 className="h-5 w-5" />
          ) : (
            <AlertCircle className="h-5 w-5" />
          )}
          <span>{message.text}</span>
        </div>
      )}

      <div className="flex flex-col md:flex-row gap-8">
        {/* Policy Form */}
        <div className="flex-1 bg-white border border-[#e0e0e0] rounded-xl p-6 shadow-sm">
          <h2 className="text-xl font-semibold mb-4 text-[#14121f]">Add New Policy</h2>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="leaveType" className="block text-sm text-gray-700 mb-1">
                Leave Type
              </label>
              <div className="relative">
                <select
                  id="leaveType"
                  name="leaveType"
                  value={form.leaveType}
                  onChange={handleChange}
                  className="w-full bg-white border border-gray-300 text-gray-900 rounded-md p-3 pr-10 focus:ring-blue-500 focus:border-blue-500"
                  required
                >
                  <option value="">Select Leave Type</option>
                  {leaveTypes.map((lt) => (
                    <option key={lt._id} value={lt._id}>{lt.typeName}</option>
                  ))}
                </select>
                {/* <ChevronDown className="absolute right-3 top-3.5 h-5 w-5 text-gray-400 pointer-events-none" /> */}
              </div>
            </div>

            <div>
              <label htmlFor="policyName" className="block text-sm text-gray-700 mb-1">
                Policy Name
              </label>
              <input
                id="policyName"
                name="policyName"
                value={form.policyName}
                onChange={handleChange}
                placeholder="Annual Leave Policy"
                className="w-full bg-white border border-gray-300 text-gray-900 rounded-md p-3 focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>

            <div>
              <label htmlFor="numberOfLeaves" className="block text-sm text-gray-700 mb-1">
                Number of Leaves
              </label>
              <input
                id="numberOfLeaves"
                name="numberOfLeaves"
                type="number"
                value={form.numberOfLeaves}
                onChange={handleChange}
                placeholder="15"
                className="w-full bg-white border border-gray-300 text-gray-900 rounded-md p-3 focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>

            <div>
              <label htmlFor="description" className="block text-sm text-gray-700 mb-1">
                Description (Optional)
              </label>
              <input
                id="description"
                name="description"
                value={form.description}
                onChange={handleChange}
                placeholder="Short description"
                className="w-full bg-white border border-gray-300 text-gray-900 rounded-md p-3 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`w-full flex justify-center items-center py-3 px-6 rounded-md text-sm font-semibold text-white ${loading ? 'bg-blue-500' : 'bg-blue-600 hover:bg-blue-700'
                } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500`}
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin h-4 w-4 mr-2" />
                  Processing...
                </>
              ) : (
                'Add Policy'
              )}
            </button>
          </form>
        </div>

        {/* Existing Policies Table */}
        <div className="flex-1 bg-white border border-[#e0e0e0] rounded-xl p-6 shadow-sm">
          <h2 className="text-xl font-semibold mb-4 text-[#14121f]">Existing Policies</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm text-left text-gray-700">
              <thead className="bg-[#f6f4f5] text-gray-700 text-xs uppercase tracking-wider">
                <tr>
                  <th className="px-4 py-3">Leave Type</th>
                  <th className="px-4 py-3">Policy Name</th>
                  <th className="px-4 py-3">Leaves</th>
                  <th className="px-4 py-3">Description</th>
                  <th className="px-4 py-3 text-center">Action</th>
                </tr>
              </thead>
              <tbody>
                {policies.map((p) => (
                  <tr
                    key={p._id}
                    className="border-b border-[#e0e0e0] hover:bg-gray-50 transition"
                  >
                    <td className="px-4 py-3">{p.leaveType?.typeName || 'Unknown'}</td>
                    <td className="px-4 py-3">{p.policyName}</td>
                    <td className="px-4 py-3">{p.numberOfLeaves}</td>
                    <td className="px-4 py-3 text-gray-600">{p.description || '-'}</td>
                    <td className="px-4 py-3 text-center">
                      <button
                        onClick={() => handleDelete(p._id)}
                        className="text-sm text-red-600 hover:underline"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>

            </table>
            {!policies.length && <p className="text-gray-500 mt-4">No policies found.</p>}
          </div>
        </div>
      </div>
    </div>
  );
}