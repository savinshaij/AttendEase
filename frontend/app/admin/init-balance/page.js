'use client';
import { useState, useEffect } from 'react';
import api from '@/utils/axios';
import { useAuth } from '@/context/AuthProvider';

export default function InitLeaveBalancePage() {
  const [employees, setEmployees] = useState([]);
  const [selected, setSelected] = useState('');
  const [message, setMessage] = useState('');
  const [result, setResult] = useState([]);

  const { authToken } = useAuth();

  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const res = await api.get('/auth/employees', {
          headers: { Authorization: `Bearer ${authToken}` }
        });
        setEmployees(res.data.users);
      } catch (err) {
        setMessage('❌ Failed to load employees');
      }
    };

    if (authToken) fetchEmployees();
  }, [authToken]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selected) return setMessage('⚠️ Please select an employee');

    try {
      const res = await api.post(
        '/admin/init-leave-balance',
        { employeeId: selected },
        {
          headers: { Authorization: `Bearer ${authToken}` }
        }
      );

      setMessage(res.data.message);
      setResult(res.data.results || []);
    } catch (err) {
      setMessage(err.response?.data?.message || '❌ Failed to initialize balance');
    }
  };

  return (
    <div className="max-w-xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Initialize Leave Balance</h1>
      <p className="text-sm text-gray-600 mb-2">
        Use this page to manually assign leave policies to employees who don’t have them yet.
      </p>

      {message && <p className="mb-4 text-blue-600">{message}</p>}

      <form onSubmit={handleSubmit} className="space-y-4">
        <select
          className="w-full border p-2 rounded"
          value={selected}
          onChange={(e) => setSelected(e.target.value)}
        >
          <option value="">-- Select Employee --</option>
          {employees.map((emp) => (
            <option key={emp._id} value={emp._id}>
              {emp.name} ({emp.email})
            </option>
          ))}
        </select>

        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Initialize Balance
        </button>
      </form>

      {result.length > 0 && (
        <div className="mt-6">
          <h2 className="text-lg font-semibold mb-2">Result</h2>
          <ul className="list-disc list-inside text-sm">
            {result.map((r, i) => (
              <li key={i}>
                {r.leaveType}: {r.status}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
