'use client';

import { useEffect, useState } from 'react';
import {
    Send, Search, User, Users, Loader2, AlertCircle, CheckCircle2, Check
} from 'lucide-react';


import { useAuth } from '@/context/AuthProvider'; 
import api from '@/utils/axios';


export default function NotificationSendPage() {
    const { authToken, loading } = useAuth(); 


    const [employees, setEmployees] = useState([]);
    
    const [selectedIds, setSelectedIds] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [form, setForm] = useState({ title: '', body: '' });
    const [isSending, setIsSending] = useState(false);
    const [notification, setNotification] = useState({
        show: false,
        type: 'success',
        message: '',
    });

    // Fetch employees
useEffect(() => {
  if (loading || !authToken) return; 

  const fetchEmployees = async () => {
    try {
      const res = await api.get('/users/employees', {
        headers: { Authorization: `Bearer ${authToken}` },
      });
      setEmployees(res.data.users || []);
    } catch (err) {
      console.error("❌ Fetch employees failed:", err.response?.data || err.message);
      setNotification({
        show: true,
        type: 'error',
        message: 'Failed to load employees',
      });
    }
  };

  fetchEmployees();
}, [authToken, loading]); // ✅ Include loading in deps

    const filtered = employees.filter(emp =>
        emp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        emp.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const toggleSelect = (id) => {
        setSelectedIds(prev =>
            prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
        );
    };

    const selectAll = () => {
        const all = filtered.map(e => e._id);
        if (all.every(id => selectedIds.includes(id))) {
            setSelectedIds(prev => prev.filter(id => !all.includes(id)));
        } else {
            setSelectedIds(prev => Array.from(new Set([...prev, ...all])));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!form.title.trim() || !form.body.trim() || selectedIds.length === 0) {
            return setNotification({ show: true, type: 'error', message: 'Fill in all fields and select employees.' });
        }

        setIsSending(true);
        try {
            await api.post(
                '/notifications/send',
                {
                    employeeIds: selectedIds,
                    title: form.title,
                    body: form.body,
                },
                {
                    headers: { Authorization: `Bearer ${authToken}` },
                }
            );

            setNotification({ show: true, type: 'success', message: '✅ Notifications sent!' });
            setSelectedIds([]);
            setForm({ title: '', body: '' });
        } catch (err) {
            setNotification({ show: true, type: 'error', message: err.response?.data?.message || 'Failed to send notifications' });
        } finally {
            setIsSending(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto p-6">
            <div className="flex items-center gap-3 mb-6">
                <Send className="w-6 h-6 text-indigo-600" />
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Send Notifications</h1>
                    <p className="text-gray-600 text-sm">Notify selected employees</p>
                </div>
            </div>

            {notification.show && (
                <div className={`p-4 mb-5 rounded-md flex items-center gap-3 ${notification.type === 'error' ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'
                    }`}>
                    {notification.type === 'error' ? (
                        <AlertCircle className="w-5 h-5" />
                    ) : (
                        <CheckCircle2 className="w-5 h-5" />
                    )}
                    <p className="text-sm">{notification.message}</p>
                </div>
            )}

            <div className="bg-white border rounded-lg shadow-sm">
                <div className="p-5 border-b flex justify-between items-center">
                    <div className="flex items-center gap-2 font-medium text-gray-700">
                        <Users className="w-5 h-5 text-gray-500" />
                        Select Employees
                    </div>
                    <button onClick={selectAll} className="text-sm text-indigo-600 hover:underline">
                        {filtered.every(emp => selectedIds.includes(emp._id)) ? 'Deselect All' : 'Select All'}
                    </button>
                </div>

                <div className="px-5 pt-4">
                    <div className="relative mb-4">
                        <Search className="absolute left-3 top-2.5 text-gray-400 h-5 w-5" />
                        <input
                            type="text"
                            placeholder="Search by name or email..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10 pr-3 py-2 border rounded w-full text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                        />
                    </div>

                    <div className="max-h-64 overflow-y-auto border rounded p-2">
                        {filtered.length === 0 ? (
                            <p className="text-sm text-gray-500 text-center py-4">No employees found</p>
                        ) : (
                            filtered.map(emp => (
                                <label key={emp._id} className="flex items-center gap-3 py-2 px-2 rounded hover:bg-gray-50">
                                    <input
                                        type="checkbox"
                                        checked={selectedIds.includes(emp._id)}
                                        onChange={() => toggleSelect(emp._id)}
                                        className="h-4 w-4 text-indigo-600 rounded"
                                    />
                                    <div>
                                        <p className="text-sm font-medium text-gray-800">{emp.name}</p>
                                        <p className="text-xs text-gray-500">{emp.email}</p>
                                    </div>
                                </label>
                            ))
                        )}
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="p-5 space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                        <input
                            type="text"
                            value={form.title}
                            onChange={(e) => setForm({ ...form, title: e.target.value })}
                            className="w-full border px-3 py-2 rounded text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Body</label>
                        <textarea
                            rows={4}
                            value={form.body}
                            onChange={(e) => setForm({ ...form, body: e.target.value })}
                            className="w-full border px-3 py-2 rounded text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                        />
                    </div>

                    <div className="flex justify-between items-center">
                        <div className="text-sm text-gray-600">
                            {selectedIds.length > 0 ? (
                                <span>{selectedIds.length} selected</span>
                            ) : (
                                'No employees selected'
                            )}
                        </div>
                        <button
                            type="submit"
                            disabled={isSending}
                            className={`flex items-center gap-2 px-4 py-2 text-sm rounded text-white ${isSending ? 'bg-indigo-400' : 'bg-indigo-600 hover:bg-indigo-700'
                                }`}
                        >
                            {isSending ? (
                                <>
                                    <Loader2 className="animate-spin w-4 h-4" />
                                    Sending...
                                </>
                            ) : (
                                <>
                                    <Send className="w-4 h-4" />
                                    Send Notification
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
