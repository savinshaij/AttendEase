'use client';
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, Mail, CheckCircle, ChevronDown, ChevronUp } from 'lucide-react';
import { useAuth } from '@/context/AuthProvider';
import api from '@/utils/axios';

export default function NotificationDropdown() {
  const { authToken, loading } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [activeTab, setActiveTab] = useState('unread');
  const [expandedId, setExpandedId] = useState(null);
  const dropdownRef = useRef(null);

  useEffect(() => {
    if (!authToken || loading) return;

    const fetchNotifications = async () => {
      try {
        const res = await api.get('/notifications/my', {
          headers: { Authorization: `Bearer ${authToken}` },
        });
        setNotifications(res.data.notifications || []);
      } catch (err) {
        console.error('Error fetching notifications:', err.response?.data || err.message);
      }
    };

    fetchNotifications();
  }, [authToken, loading]);

  useEffect(() => {
  const count = notifications.filter(n => n.status === 'unread').length;
  setUnreadCount(count);
}, [notifications]);


  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const markAsRead = async (id) => {
    try {
      await api.patch(`/notifications/${id}/read`, null, {
        headers: { Authorization: `Bearer ${authToken}` },
      });
      setNotifications(prev =>
        prev.map(n => (n._id === id ? { ...n, status: 'read' } : n))
      );
    } catch (err) {
      console.error('Mark as read failed:', err.response?.data || err.message);
    }
  };

  const markAllAsRead = async () => {
    const unread = notifications.filter(n => n.status === 'unread');
    for (const n of unread) {
      await markAsRead(n._id);
    }
  };

  const formatDate = (date) => {
    if (!date) return '';
    const now = new Date();
    const diff = Math.floor((now - new Date(date)) / 1000);
    if (diff < 60) return 'Just now';
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return `${Math.floor(diff / 86400)}d ago`;
  };

  const shouldShowViewMore = (notification) => {
    return notification.body.length > 100;
  };

  const filteredNotifications = notifications.filter(n => {
    return activeTab === 'unread' ? n.status === 'unread' : true;
  });

  return (
    <div className="relative" ref={dropdownRef}>
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        whileTap={{ scale: 0.95 }}
        className="p-2 rounded-full relative hover:bg-gray-100 transition-colors"
        aria-label="Notifications"
        aria-expanded={isOpen}
      >
        <Bell className="w-5 h-5 text-gray-600" />
        {unreadCount > 0 && (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full"
          />
        )}
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            transition={{ type: 'spring', damping: 20, stiffness: 300 }}
            className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg overflow-hidden z-20 border border-gray-200"
          >
            {/* Header */}
            <div className="p-3 border-b border-gray-200 flex justify-between items-center">
              <h3 className="text-sm font-semibold text-gray-900">Notifications</h3>
              {unreadCount > 0 && (
                <span className="text-xs px-2 py-1 rounded-full bg-blue-100 text-blue-800">
                  {unreadCount} unread
                </span>
              )}
            </div>

            {/* Tabs */}
            <div className="flex border-b border-gray-200">
              <button
                onClick={() => setActiveTab('unread')}
                className={`flex-1 py-2.5 text-sm font-medium ${activeTab === 'unread' ? 'text-blue-600 border-b-2 border-blue-500' : 'text-gray-500 hover:text-gray-700'}`}
              >
                Unread
              </button>
              <button
                onClick={() => setActiveTab('all')}
                className={`flex-1 py-2.5 text-sm font-medium ${activeTab === 'all' ? 'text-blue-600 border-b-2 border-blue-500' : 'text-gray-500 hover:text-gray-700'}`}
              >
                All
              </button>
            </div>

            {/* Notification List */}
            <div className={`${activeTab === 'unread' ? 'max-h-[300px]' : 'max-h-[400px]'} overflow-y-auto`}>
              {filteredNotifications.length === 0 ? (
                <div className="p-6 text-center">
                  <Mail className="mx-auto h-8 w-8 text-gray-300" />
                  <p className="mt-2 text-sm text-gray-500">
                    No {activeTab === 'unread' ? 'unread ' : ''}notifications
                  </p>
                </div>
              ) : (
                <ul className="divide-y divide-gray-200">
                  <AnimatePresence>
                    {filteredNotifications.map((notification) => (
                      <motion.li
                        key={notification._id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.15 }}
                        className={`px-4 py-3 hover:bg-gray-50 cursor-pointer transition-colors ${notification.status === 'unread' ? 'bg-blue-50/50' : ''}`}
                        onClick={(e) => {
                          if (e.target.closest('button')) return;
                          markAsRead(notification._id);
                        }}
                      >
                        <div className="flex items-start gap-3">
                          <div className={`mt-0.5 flex-shrink-0 rounded-full p-1.5 ${notification.status === 'unread' ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-500'}`}>
                            <Mail className="w-4 h-4" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2">
                              <p className="text-sm font-medium text-gray-900 line-clamp-1">
                                {notification.title}
                              </p>
                              <span className="text-xs text-gray-400 whitespace-nowrap">
                                {formatDate(notification.date)}
                              </span>
                            </div>
                            <div className="relative mt-1">
                              <p className={`text-xs text-gray-600 ${expandedId === notification._id ? '' : 'line-clamp-3'}`}>
                                {notification.body}
                                {expandedId !== notification._id && shouldShowViewMore(notification) && (
                                  <span className="absolute bottom-0 right-0 bg-gradient-to-l from-white to-transparent w-1/2 h-5" />
                                )}
                              </p>
                              {shouldShowViewMore(notification) && (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setExpandedId(expandedId === notification._id ? null : notification._id);
                                  }}
                                  className="text-xs text-blue-500 mt-1 hover:underline flex items-center"
                                >
                                  {expandedId === notification._id ? (
                                    <>
                                      Show less <ChevronUp className="ml-1 w-3 h-3" />
                                    </>
                                  ) : (
                                    <>
                                      View more <ChevronDown className="ml-1 w-3 h-3" />
                                    </>
                                  )}
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      </motion.li>
                    ))}
                  </AnimatePresence>
                </ul>
              )}
            </div>

            {/* Footer */}
            {activeTab === 'unread' && unreadCount > 0 && (
              <div className="p-3 border-t border-gray-200 bg-gray-50">
                <button
                  onClick={markAllAsRead}
                  className="w-full flex items-center justify-center gap-2 text-sm text-blue-600 hover:text-blue-700 px-3 py-2 rounded-md hover:bg-blue-50 transition-colors"
                >
                  <CheckCircle className="w-4 h-4" />
                  Mark all as read
                </button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
