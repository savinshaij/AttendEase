'use client'

import { useEffect, useState } from 'react'
import api from '@/utils/axios'
import { useAuth } from '@/context/AuthProvider'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, Users, ChevronRight, User, Shield, Mail, Frown, Loader2, Plus } from 'lucide-react'
import { useRouter } from 'next/navigation'

const UserManagementPage = () => {
  const { authToken } = useAuth()
  const router = useRouter()

  const [users, setUsers] = useState([])
  const [search, setSearch] = useState('')
  const [filtered, setFiltered] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedRole, setSelectedRole] = useState('all')

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true)
        const res = await api.get('/admin/users', {
          headers: { Authorization: `Bearer ${authToken}` }
        })
        setUsers(res.data.users)
        setFiltered(res.data.users)
      } catch (err) {
        console.error('Error fetching users:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchUsers()
  }, [authToken])

  useEffect(() => {
    let filteredList = users.filter((u) =>
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase())
    )

    if (selectedRole !== 'all') {
      filteredList = filteredList.filter(u => u.role === selectedRole)
    }

    setFiltered(filteredList)
  }, [search, users, selectedRole])

  // Avatar Component
  const Avatar = ({ src, fallback, className = '' }) => {
    return (
      <div className={`relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full ${className}`}>
        {src ? (
          <img src={src} alt="User avatar" className="aspect-square h-full w-full" />
        ) : (
          <div className="flex h-full w-full items-center justify-center rounded-full bg-gray-100">
            {fallback && <span className="font-medium text-gray-600">{fallback.charAt(0).toUpperCase()}</span>}
          </div>
        )}
      </div>
    )
  }

  // Badge Component
  const Badge = ({ children, variant = 'default', className = '' }) => {
    const variants = {
      default: 'bg-gray-100 text-gray-800',
      admin: 'bg-purple-100 text-purple-800',
      manager: 'bg-green-100 text-green-800',
      user: 'bg-blue-100 text-blue-800'
    }
    return (
      <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${variants[variant]} ${className}`}>
        {children}
      </span>
    )
  }

  // Button Component
  const Button = ({ children, variant = 'default', size = 'default', onClick, className = '', ...props }) => {
    const variants = {
      default: 'bg-gray-900 text-white hover:bg-gray-800',
      outline: 'border border-gray-200 bg-white hover:bg-gray-50',
      ghost: 'hover:bg-gray-100'
    }
    const sizes = {
      default: 'h-10 px-4 py-2',
      sm: 'h-9 px-3 text-sm'
    }
    return (
      <button
        className={`inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-400 disabled:opacity-50 ${variants[variant]} ${sizes[size]} ${className}`}
        onClick={onClick}
        {...props}
      >
        {children}
      </button>
    )
  }

  // Input Component
  const Input = ({ className = '', ...props }) => {
    return (
      <input
        className={`flex h-10 w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm ring-offset-white file:border-0 file:bg-transparent file:text-sm file:font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-400 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
        {...props}
      />
    )
  }

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="p-6 space-y-6 max-w-7xl mx-auto"
    >
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex items-center gap-3">
          <motion.div
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            className="p-2 rounded-lg bg-blue-50"
          >
            <Users className="w-6 h-6 text-blue-600" />
          </motion.div>
          <div>
            <h1 className="text-2xl font-bold text-gray-800">User Management</h1>
            <p className="text-sm text-gray-500">Manage all system users and permissions</p>
          </div>
        </div>
        
        <Button 
          onClick={() => router.push('/admin/register-user')}
          className="gap-2"
        >
          <Plus className="w-4 h-4" />
          Add New User
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1 max-w-xl">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            type="text"
            className="pl-10"
            placeholder="Search users by name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        
        <div className="flex gap-2 overflow-x-auto pb-2">
          <Button 
            variant={selectedRole === 'all' ? 'default' : 'outline'}
            onClick={() => setSelectedRole('all')}
            className="shrink-0"
          >
            All Users
          </Button>
          <Button 
            variant={selectedRole === 'admin' ? 'default' : 'outline'}
            onClick={() => setSelectedRole('admin')}
            className="shrink-0 gap-1"
          >
            <Shield className="w-4 h-4" /> Admins
          </Button>
          <Button 
            variant={selectedRole === 'manager' ? 'default' : 'outline'}
            onClick={() => setSelectedRole('manager')}
            className="shrink-0 gap-1"
          >
            <Users className="w-4 h-4" /> Managers
          </Button>
          <Button 
            variant={selectedRole === 'employee' ? 'default' : 'outline'}
            onClick={() => setSelectedRole('employee')}
            className="shrink-0 gap-1"
          >
            <User className="w-4 h-4" /> Employees
          </Button>
        </div>
      </div>

      {/* User Table */}
      <div className="rounded-lg border border-gray-200 bg-white shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center p-12">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
              className="flex items-center gap-2 text-gray-500"
            >
              <Loader2 className="w-6 h-6" />
              
            </motion.div>
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-12 text-center">
            <Frown className="w-12 h-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900">No users found</h3>
            <p className="text-sm text-gray-500">
              {search ? 'Try a different search term' : selectedRole !== 'all' ? 'No users with this role' : 'No users available'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                <AnimatePresence>
                  {filtered.map((user) => (
                    <motion.tr
                      key={user._id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="hover:bg-gray-50 cursor-pointer"
                      onClick={() => router.push(`/admin/user-management/${user._id}`)}
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <Avatar src={user.avatar} fallback={user.name} />
                          <span className="font-medium">{user.name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2 text-gray-600">
                          <Mail className="w-4 h-4" />
                          {user.email}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Badge variant={user.role}>
                          {user.role === 'admin' && <Shield className="inline w-3 h-3 mr-1" />}
                          {user.role === 'manager' && <Users className="inline w-3 h-3 mr-1" />}
                          {user.role === 'user' && <User className="inline w-3 h-3 mr-1" />}
                          {user.role}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <Button variant="ghost" size="sm" className="gap-1">
                          View <ChevronRight className="w-4 h-4" />
                        </Button>
                      </td>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <motion.div 
          whileHover={{ y: -2 }}
          className="p-4 bg-white rounded-lg border border-gray-200 shadow-sm"
        >
          <p className="text-sm text-gray-500">Total Users</p>
          <p className="text-2xl font-bold">{users.length}</p>
        </motion.div>
        <motion.div 
          whileHover={{ y: -2 }}
          className="p-4 bg-white rounded-lg border border-gray-200 shadow-sm"
        >
          <p className="text-sm text-gray-500">Admins</p>
          <p className="text-2xl font-bold">{users.filter(u => u.role === 'admin').length}</p>
        </motion.div>
        <motion.div 
          whileHover={{ y: -2 }}
          className="p-4 bg-white rounded-lg border border-gray-200 shadow-sm"
        >
          <p className="text-sm text-gray-500">Managers</p>
          <p className="text-2xl font-bold">{users.filter(u => u.role === 'manager').length}</p>
        </motion.div>
        <motion.div 
          whileHover={{ y: -2 }}
          className="p-4 bg-white rounded-lg border border-gray-200 shadow-sm"
        >
          <p className="text-sm text-gray-500">Employees</p>
          <p className="text-2xl font-bold">{users.filter(u => u.role === 'employee').length}</p>
        </motion.div>
      </div>
    </motion.div>
  )
}

export default UserManagementPage