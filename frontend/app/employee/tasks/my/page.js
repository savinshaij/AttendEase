'use client';
import { useEffect, useState } from 'react';
import api from '@/utils/axios';
import { useAuth } from '@/context/AuthProvider';
import {
  CheckCircle,
  Clock,
  AlertCircle,
  Loader2,
  ListChecks,
  CircleDollarSign
} from 'lucide-react';

export default function MyTasksPage() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });
  const { authToken } = useAuth(); 

  useEffect(() => {
    if (!authToken) return;

    const fetchTasks = async () => {
      try {
        const res = await api.get('/task/my-tasks', {
          headers: { Authorization: `Bearer ${authToken}` },
        });
        setTasks(res.data.tasks);
      } catch (err) {
        setMessage({
          text: err.response?.data?.message || 'Failed to load tasks',
          type: 'error'
        });
      } finally {
        setLoading(false);
      }
    };

    fetchTasks();
  }, [authToken]);

  const updateStatus = async (taskId, status) => {
    setActionLoading(true);
    try {
      const res = await api.put(`/task/${taskId}/status`, { status }, {
        headers: { Authorization: `Bearer ${authToken}` },
      });
      setTasks(prev => prev.map(t => (t._id === taskId ? res.data.task : t)));
      setMessage({
        text: 'Task status updated successfully!',
        type: 'success'
      });
    } catch (err) {
      setMessage({
        text: err.response?.data?.message || 'Failed to update status',
        type: 'error'
      });
    } finally {
      setActionLoading(false);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'in-progress':
        return <Clock className="w-4 h-4 text-yellow-500" />;
      default:
        return <CircleDollarSign className="w-4 h-4 text-gray-500" />;
    }
  };
  return (
    <div className="max-w-7xl mx-auto p-4 md:p-6 lg:p-8">
      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <ListChecks className="w-8 h-8 text-blue-600" />
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Tasks</h1>
          <p className="text-gray-600">Manage your assigned responsibilities</p>
        </div>
      </div>

      {/* Message alert */}
      {message.text && (
        <div className={`p-4 mb-6 rounded-md flex items-start gap-3 ${
          message.type === 'error' 
            ? 'bg-red-50 text-red-700' 
            : 'bg-green-50 text-green-700'
        }`}>
          {message.type === 'error' ? (
            <AlertCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
          ) : (
            <CheckCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
          )}
          <p className="text-sm">{message.text}</p>
        </div>
      )}

      {/* Tasks List */}
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
        </div>
      ) : tasks.length === 0 ? (
        <div className="bg-gray-50 rounded-lg p-8 text-center">
          <p className="text-gray-500">No tasks assigned to you yet</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr className="text-left text-gray-600 text-sm">
                  <th className="px-6 py-3 font-medium">Task</th>
                  <th className="px-6 py-3 font-medium">Description</th>
                  <th className="px-6 py-3 font-medium">Status</th>
                  <th className="px-6 py-3 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {tasks.map((task) => (
                  <tr key={task._id} className="hover:bg-gray-50 transition">
                    <td className="px-6 py-4 font-medium text-gray-900">
                      <div className="flex items-center gap-2">
                        <CircleDollarSign className="w-4 h-4 text-gray-400" />
                        {task.title}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-700 max-w-xs truncate">
                      {task.description || 'No description'}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        {getStatusIcon(task.status)}
                        <span className={`capitalize font-medium ${
                          task.status === 'completed'
                            ? 'text-green-600'
                            : task.status === 'in-progress'
                            ? 'text-yellow-600'
                            : 'text-gray-600'
                        }`}>
                          {task.status}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        {['in-progress', 'completed'].map((status) => (
                          <button
                            key={status}
                            onClick={() => updateStatus(task._id, status)}
                            disabled={actionLoading || task.status === status}
                            className={`px-3 py-1.5 text-xs font-medium rounded-md transition ${
                              actionLoading || task.status === status
                                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                : status === 'completed'
                                ? 'bg-green-600 text-white hover:bg-green-700'
                                : 'bg-yellow-600 text-white hover:bg-yellow-700'
                            }`}
                          >
                            {actionLoading ? (
                              <Loader2 className="w-3 h-3 animate-spin" />
                            ) : (
                              `Mark ${status}`
                            )}
                          </button>
                        ))}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}