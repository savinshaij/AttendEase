'use client';
import { useEffect, useState } from 'react';
import api from '@/utils/axios';
import { useRouter } from 'next/navigation';
import { User, ClipboardList, CalendarDays, Send, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { useAuth } from '@/context/AuthProvider';

export default function ManagerAssignDutyPage() {
  const [employees, setEmployees] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [fromEmployee, setFromEmployee] = useState('');
  const [form, setForm] = useState({
    task: '',
    toEmployee: '',
    fromDate: '',
    toDate: '',
  });
  const [loading, setLoading] = useState(true);
  const [tasksLoading, setTasksLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });
  const router = useRouter();
  const { authToken } = useAuth();

  useEffect(() => {
    if (!authToken) {
      
      return;
    }

    const fetchEmployees = async () => {
      try {
        const res = await api.get('/users/employees', {
          headers: { Authorization: `Bearer ${authToken}` },
        });
        setEmployees(res.data.users || []);
      } catch (err) {
        setMessage({ 
          text: err.response?.data?.message || 'Failed to load employees', 
          type: 'error' 
        });
      } finally {
        setLoading(false);
      }
    };

    fetchEmployees();
  }, [authToken, router]);

  useEffect(() => {
    if (!fromEmployee || !authToken) return;

    const fetchTasks = async () => {
      setTasksLoading(true);
      try {
        const res = await api.get(`/task/employee/${fromEmployee}`, {
          headers: { Authorization: `Bearer ${authToken}` },
        });
        setTasks(res.data.tasks || []);
      } catch (err) {
        setMessage({ 
          text: err.response?.data?.message || 'Failed to load tasks', 
          type: 'error' 
        });
        setTasks([]);
      } finally {
        setTasksLoading(false);
      }
    };

    fetchTasks();
  }, [fromEmployee, authToken]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setMessage({ text: '', type: '' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const payload = {
        ...form,
        fromEmployee,
      };

      await api.post('/duty/assign', payload, {
        headers: { Authorization: `Bearer ${authToken}` },
      });

      setMessage({ 
        text: 'Duty assigned successfully!', 
        type: 'success' 
      });
      setForm({ task: '', toEmployee: '', fromDate: '', toDate: '' });
      setTasks([]);
      setFromEmployee('');
    } catch (err) {
      setMessage({ 
        text: err.response?.data?.message || 'Failed to assign duty', 
        type: 'error' 
      });
    } finally {
      setSubmitting(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return isNaN(date.getTime()) ? '' : date.toISOString().split('T')[0];
  };



  return (
    <div className="max-w-3xl mx-auto p-4 md:p-6 lg:p-8">
      <div className="flex items-center gap-3 mb-8">
        <User className="w-8 h-8 text-blue-600" />
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Duty Assignment</h1>
          <p className="text-gray-600">Reassign employee responsibilities</p>
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

      {loading ? (
        <div className="flex justify-center items-center h-40">
          <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="bg-white rounded-lg border border-gray-200 p-6 space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              <span className="flex items-center gap-2">
                <User className="w-4 h-4" />
                Original Employee
              </span>
            </label>
            <select
              value={fromEmployee}
              onChange={(e) => {
                setFromEmployee(e.target.value);
                setForm({ ...form, task: '' });
              }}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            >
              <option value="">Select employee to reassign from</option>
              {employees.map((user) => (
                <option key={user._id} value={user._id}>
                  {user.name} ({user.department || 'No department'})
                </option>
              ))}
            </select>
          </div>

          {fromEmployee && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <span className="flex items-center gap-2">
                  <ClipboardList className="w-4 h-4" />
                  Task to Reassign
                </span>
              </label>
              {tasksLoading ? (
                <div className="flex items-center justify-center h-16">
                  <Loader2 className="w-5 h-5 animate-spin text-blue-500" />
                </div>
              ) : tasks.length > 0 ? (
                <select
                  name="task"
                  value={form.task}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                >
                  <option value="">Select task to reassign</option>
                  {tasks.map((task) => (
                    <option key={task._id} value={task._id}>
                      {task.title} ({task.status})
                    </option>
                  ))}
                </select>
              ) : (
                <p className="text-sm text-gray-500">No tasks found for this employee</p>
              )}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              <span className="flex items-center gap-2">
                <User className="w-4 h-4" />
                Assign To (Substitute)
              </span>
            </label>
            <select
              name="toEmployee"
              value={form.toEmployee}
              onChange={handleChange}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            >
              <option value="">Select substitute employee</option>
              {employees
                .filter((user) => user._id !== fromEmployee)
                .map((user) => (
                  <option key={user._id} value={user._id}>
                    {user.name} ({user.department || 'No department'})
                  </option>
                ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              <span className="flex items-center gap-2">
                <CalendarDays className="w-4 h-4" />
                Reassignment Period
              </span>
            </label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <input
                  type="date"
                  name="fromDate"
                  value={form.fromDate}
                  min={formatDate(new Date())}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
              <div>
                <input
                  type="date"
                  name="toDate"
                  value={form.toDate}
                  min={form.fromDate || formatDate(new Date())}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-4">
            <button
              type="submit"
              disabled={submitting || !form.task || !form.toEmployee || !form.fromDate || !form.toDate}
              className={`flex items-center gap-2 px-6 py-3 text-base font-medium rounded-md shadow-sm text-white ${
                submitting || !form.task || !form.toEmployee || !form.fromDate || !form.toDate
                  ? 'bg-blue-400 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700'
              } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500`}
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Assigning...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  Assign Duty
                </>
              )}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}