"use client";
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useAuth } from '@/context/AuthProvider';

const AttendEaseLight = () => {
  const [form, setForm] = useState({ email: '', password: '' });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();
  const { login } = useAuth();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    try {
      await login(form.email, form.password);
    } catch (err) {
      setError(err.message || 'Login failed.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f5f5f3] text-[#121211]">
      {/* Header */}
      <header className="fixed w-full z-50 bg-white/90 backdrop-blur-sm border-b border-gray-200">
        <div className="container mx-auto px-6 py-4 flex justify-between items-center">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center space-x-2"
          >
            <div className="w-8 h-8 rounded-md bg-[#121211] flex items-center justify-center text-white font-bold">AE</div>
            <span className="text-xl font-bold tracking-tight">AttendEase</span>
          </motion.div>
        </div>
      </header>

      {/* Hero + Login */}
      <section className="min-h-screen flex items-center pt-20 pb-20 px-6">
        <div className="container mx-auto md:px-16 flex flex-col-reverse lg:flex-row items-center gap-12">

          {/* Left Text */}
          <motion.div 
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="lg:w-1/2"
          >
            <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight tracking-tight">
              <span className="block">Effortless </span>
              <span className="block text-[#121211]">Attendance & Leave</span>
            </h1>
            <p className="text-lg text-gray-600 mb-8 max-w-lg leading-relaxed">
              Streamline your workforce management with our intuitive platform. 
              Track attendance, manage leaves, and ensure productivity effortlessly.
            </p>

            {/* Feature Highlights */}
            <div className="grid grid-cols-2 gap-4 mb-8">
              {[
                { icon: '✓', text: 'Real-time tracking' },
                { icon: '✓', text: 'Leave management' },
                { icon: '✓', text: 'Duty handover' },
                { icon: '✓', text: 'Automated reports' }
              ].map((feature, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 + 0.3 }}
                  className="flex items-center space-x-2"
                >
                  <span className="text-lg">{feature.icon}</span>
                  <span className="text-gray-700">{feature.text}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Login Form */}
          <motion.div 
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="lg:w-1/2 w-full"
          >
            <form 
              onSubmit={handleSubmit}
              className="bg-white rounded-2xl p-8 max-w-md mx-auto border border-gray-200 shadow-sm hover:shadow-md transition-all"
            >
              <h3 className="text-2xl font-bold mb-6 text-center tracking-tight">Login</h3>

              {error && (
                <div className="mb-4 text-red-600 text-sm text-center font-medium">{error}</div>
              )}

              <div className="space-y-4">
                <div>
                  <label className="block text-gray-700 mb-2 text-sm font-medium">Email</label>
                  <input 
                    type="email"
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#121211] focus:border-transparent outline-none transition"
                    placeholder="your@email.com"
                  />
                </div>
                <div>
                  <label className="block text-gray-700 mb-2 text-sm font-medium">Password</label>
                  <input 
                    type="password"
                    name="password"
                    value={form.password}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#121211] focus:border-transparent outline-none transition"
                    placeholder="••••••••"
                  />
                </div>

                <motion.button
                  type="submit"
                  disabled={isLoading}
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  className={`w-full py-3 bg-[#121211] text-white rounded-lg font-medium transition-all mt-4 ${
                    isLoading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-[#000]'
                  }`}
                >
                  {isLoading ? 'Signing In...' : 'Sign In'}
                </motion.button>
              </div>

              <div className="mt-6 text-center text-sm text-gray-500">
                <a href="#" className="hover:text-[#121211] transition-colors font-medium">Forgot password?</a>
              </div>
            </form>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 py-12">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center space-x-2 mb-6 md:mb-0"
            >
              <div className="w-8 h-8 rounded-md bg-[#121211] flex items-center justify-center text-white font-bold">AE</div>
              <span className="text-xl font-bold tracking-tight">AttendEase</span>
            </motion.div>

            
          </div>

          <motion.div 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="mt-12 pt-6 border-t border-gray-200 text-center text-gray-500 text-sm"
          >
            © {new Date().getFullYear()} AttendEase. All rights reserved.
          </motion.div>
        </div>
      </footer>
    </div>
  );
};

export default AttendEaseLight;
