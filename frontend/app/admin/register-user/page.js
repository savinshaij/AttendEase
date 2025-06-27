'use client';
import { useState } from 'react';
import api from '@/utils/axios';
import { useRouter } from 'next/navigation';
import {
  User, Mail, Key, Phone, Building2, BadgeCheck, BookOpen, Briefcase,
  MapPin, ChevronDown, Loader2, CheckCircle2, AlertCircle
} from 'lucide-react';
import { useAuth } from '@/context/AuthProvider';
export default function RegisterUserPage() {
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    role: 'employee',
    department: '',
    age: '',
    qualification: '',
    experience: '',
    address: '',
    isActive: true
  });

  const [message, setMessage] = useState({ text: '', type: '' });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  
  
  const { authToken } = useAuth();
  const validateForm = () => {
    const newErrors = {};
    if (!form.name.trim()) newErrors.name = 'Name is required';
    if (!form.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      newErrors.email = 'Invalid email format';
    }
    if (!form.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    } else if (!/^\d{10}$/.test(form.phone)) {
      newErrors.phone = 'Phone must be 10 digits';
    }
    if (!form.password || form.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    if (!form.department.trim()) newErrors.department = 'Department is required';
    if (!form.age || isNaN(form.age) || Number(form.age) <= 0) newErrors.age = 'Valid age is required';
    if (!form.qualification.trim()) newErrors.qualification = 'Qualification is required';
    if (!form.experience.trim()) newErrors.experience = 'Experience is required';
    if (!form.address.trim()) newErrors.address = 'Address is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const newValue = type === 'checkbox' ? checked : value;
    setForm({ ...form, [name]: newValue });
    setMessage({ text: '', type: '' });
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    setLoading(true);

    try {
      const res = await api.post('/auth/admin/register', form, {
        headers: { Authorization: `Bearer ${authToken}` }
      });

      const userId = res.data.user._id;

      await api.post('/admin/init-leave-balance', {
        employeeId: userId
      }, {
        headers: { Authorization: `Bearer ${authToken}` }
      });

      setMessage({
        text: 'User registered and leave balances initialized successfully',
        type: 'success'
      });

      setForm({
        name: '',
        email: '',
        phone: '',
        password: '',
        role: 'employee',
        department: '',
        age: '',
        qualification: '',
        experience: '',
        address: '',
        isActive: true
      });
      setErrors({});
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to register user';
      setMessage({
        text: msg,
        type: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const inputClass = (field) =>
    `pl-10 w-full p-2.5 rounded-md border ${
      errors[field]
        ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
        : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
    }`;

  return (
    <div className="p-6 md:p-8 max-w-3xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-[#14121f]">Manage Users</h1>
        <p className="text-[#666]">Register new employees or managers</p>
      </div>

      {message.text && (
        <div className={`mb-6 p-4 rounded-md ${
          message.type === 'success'
            ? 'bg-green-50 text-green-700 border border-green-200'
            : 'bg-red-50 text-red-700 border border-red-200'
        }`}>
          <div className="flex items-center">
            {message.type === 'success' ? (
              <CheckCircle2 className="h-5 w-5 mr-2" />
            ) : (
              <AlertCircle className="h-5 w-5 mr-2" />
            )}
            <span>{message.text}</span>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Name */}
        <Field icon={User} id="name" label="Full Name" value={form.name} onChange={handleChange} error={errors.name} />

        {/* Email */}
        <Field icon={Mail} id="email" label="Email" type="email" value={form.email} onChange={handleChange} error={errors.email} />

        {/* Phone */}
        <Field icon={Phone} id="phone" label="Phone Number" value={form.phone} onChange={handleChange} error={errors.phone} />

        {/* Password */}
        <Field icon={Key} id="password" label="Password" type="password" value={form.password} onChange={handleChange} error={errors.password} />

        {/* Department */}
        <Field icon={Building2} id="department" label="Department" value={form.department} onChange={handleChange} error={errors.department} />

        {/* Age */}
        <Field icon={BadgeCheck} id="age" label="Age" type="number" value={form.age} onChange={handleChange} error={errors.age} />

        {/* Qualification */}
        <Field icon={BookOpen} id="qualification" label="Qualification" value={form.qualification} onChange={handleChange} error={errors.qualification} />

        {/* Experience */}
        <Field icon={Briefcase} id="experience" type="number" label="Experience" value={form.experience} onChange={handleChange} error={errors.experience} />

        {/* Address */}
        <div>
          <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">Address</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <MapPin className="h-5 w-5 text-gray-400" />
            </div>
            <textarea
              name="address"
              id="address"
              value={form.address}
              onChange={handleChange}
              className={`pl-10 w-full p-2.5 rounded-md border ${
                errors.address ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
              }`}
              rows={3}
              placeholder="Full address"
            />
          </div>
          {errors.address && <p className="mt-1 text-sm text-red-600">{errors.address}</p>}
        </div>

        {/* Role */}
        <div>
          <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-1">Role</label>
          <div className="relative">
            <select
              id="role"
              name="role"
              value={form.role}
              onChange={handleChange}
              className="appearance-none w-full p-2.5 pl-3 pr-10 rounded-md border border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="employee">Employee</option>
              <option value="manager">Manager</option>
            </select>
            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
              <ChevronDown className="h-5 w-5 text-gray-400" />
            </div>
          </div>
        </div>

        {/* Is Active */}
        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            id="isActive"
            name="isActive"
            checked={form.isActive}
            onChange={handleChange}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
          <label htmlFor="isActive" className="text-sm text-gray-700">Active</label>
        </div>

        {/* Submit */}
        <div className="pt-2">
          <button
            type="submit"
            disabled={loading}
            className={`w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
              loading ? 'bg-blue-400' : 'bg-blue-600 hover:bg-blue-700'
            } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500`}
          >
            {loading ? (
              <>
                <Loader2 className="animate-spin h-4 w-4 mr-2" />
                Processing...
              </>
            ) : (
              'Register User'
            )}
          </button>
        </div>
      </form>
    </div>
  );
}

// 👇 Reusable Input Field Component
function Field({ icon: Icon, id, label, type = 'text', value, onChange, error }) {
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Icon className="h-5 w-5 text-gray-400" />
        </div>
        <input
          type={type}
          name={id}
          id={id}
          value={value}
          onChange={onChange}
          className={`pl-10 w-full p-2.5 rounded-md border ${
            error ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
          }`}
          placeholder={`Enter ${label.toLowerCase()}`}
        />
      </div>
      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
    </div>
  );
}
