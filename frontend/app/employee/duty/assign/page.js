'use client';

import { useState, useEffect } from 'react';
import api from '@/utils/axios';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthProvider';
import {
  UserRound, ClipboardList, CalendarDays, Send,
  Loader2, CheckCircle2, AlertCircle
} from 'lucide-react';

export default function AssignDutyEmployee() {
  const [employees, setEmployees] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [form, setForm] = useState({ task: '', toEmployee: '', fromDate: '', toDate: '' });
  const [message, setMessage] = useState({ text: '', type: '' });
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  const { authToken } = useAuth();
  const router = useRouter();

  useEffect(() => {
    

    const fetchInitialData = async () => {
      try {
        const [empRes, taskRes] = await Promise.all([
          api.get('/users/employees', {
            headers: { Authorization: `Bearer ${authToken}` }
          }),
          api.get('/task/my-tasks', {
            headers: { Authorization: `Bearer ${authToken}` }
          }),
        ]);

        setEmployees(empRes.data.users);
        setTasks(taskRes.data.tasks);
      } catch (err) {
        setMessage({
          text: err.response?.data?.message || 'Failed to load required data',
          type: 'error'
        });
      } finally {
        setFetching(false);
      }
    };

    fetchInitialData();
  }, [authToken, router]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setMessage({ text: '', type: '' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await api.post('/duty/request', form, {
        headers: { Authorization: `Bearer ${authToken}` }
      });

      setMessage({ text: 'Duty handover request submitted successfully!', type: 'success' });
      setForm({ task: '', toEmployee: '', fromDate: '', toDate: '' });
    } catch (err) {
      setMessage({
        text: err.response?.data?.message || 'Failed to submit request',
        type: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const getSelectedTask = () => tasks.find(t => t._id === form.task);
  const getSelectedEmployee = () => employees.find(e => e._id === form.toEmployee);



  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="flex items-center gap-3 mb-6">
        <UserRound className="w-8 h-8 text-blue-600" />
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Duty Handover Request</h1>
          <p className="text-gray-600">Delegate your responsibilities to another team member</p>
        </div>
      </div>

      {message.text && (
        <div className={`p-4 mb-6 rounded-md flex items-start gap-3 ${
          message.type === 'error' 
            ? 'bg-red-50 text-red-700' 
            : 'bg-green-50 text-green-700'
        }`}>
          {message.type === 'error' ? (
            <AlertCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
          ) : (
            <CheckCircle2 className="w-5 h-5 mt-0.5 flex-shrink-0" />
          )}
          <p className="text-sm">{message.text}</p>
        </div>
      )}

      <div className="bg-white rounded-lg shadow border border-gray-200 overflow-hidden">
        {fetching ? (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            <div className="grid grid-cols-1 gap-6">
              {/* Task Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1 items-center gap-2">
                  <ClipboardList className="w-4 h-4" />
                  Select Task
                </label>
                <select
                  name="task"
                  value={form.task}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">-- Select a task --</option>
                  {tasks.map(task => (
                    <option key={task._id} value={task._id}>
                      {task.title} {task.status && `(${task.status})`}
                    </option>
                  ))}
                </select>
                {form.task && (
                  <p className="mt-1 text-xs text-gray-500">
                    {getSelectedTask()?.description || 'No description available'}
                  </p>
                )}
              </div>

              {/* Employee Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1 items-center gap-2">
                  <UserRound className="w-4 h-4" />
                  Assign To
                </label>
                <select
                  name="toEmployee"
                  value={form.toEmployee}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">-- Select employee --</option>
                  {employees.map(user => (
                    <option key={user._id} value={user._id}>
                      {user.name} ({user.department || 'No department'})
                    </option>
                  ))}
                </select>
                {form.toEmployee && (
                  <p className="mt-1 text-xs text-gray-500">
                    {getSelectedEmployee()?.email || 'No email available'}
                  </p>
                )}
              </div>

              {/* Date Range */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1 items-center gap-2">
                  <CalendarDays className="w-4 h-4" />
                  Handover Period
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <input
                      type="date"
                      name="fromDate"
                      value={form.fromDate}
                      onChange={handleChange}
                      min={new Date().toISOString().split('T')[0]}
                      required
                      className="w-full px-3 py-2.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <input
                      type="date"
                      name="toDate"
                      value={form.toDate}
                      onChange={handleChange}
                      min={form.fromDate || new Date().toISOString().split('T')[0]}
                      required
                      className="w-full px-3 py-2.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>
                {form.fromDate && form.toDate && (
                  <p className="mt-1 text-xs text-gray-500">
                    {calculateDays(form.fromDate, form.toDate)} day(s) handover period
                  </p>
                )}
              </div>
            </div>

            <div className="flex justify-end pt-4">
              <button
                type="submit"
                disabled={loading || !form.task || !form.toEmployee || !form.fromDate || !form.toDate}
                className={`inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white ${
                  loading || !form.task || !form.toEmployee || !form.fromDate || !form.toDate
                    ? 'bg-blue-400 cursor-not-allowed'
                    : 'bg-blue-600 hover:bg-blue-700'
                } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500`}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <Send className="mr-2 h-4 w-4" />
                    Submit Request
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

// Helper function to calculate days between dates
function calculateDays(startDate, endDate) {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const diffTime = Math.abs(end - start);
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
}