import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { BRANCHES } from '../types';

const LoginPage = () => {
  const { login } = useAuth();
  const [role, setRole] = useState<'admin' | 'coordinator' | 'bsh'>('admin');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [branch, setBranch] = useState('CSE');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Validate inputs
      if (!username || !password || !role) {
        setError('Please fill in all fields');
        return;
      }

      await login(username, password, role);
    } catch (err: any) {
      console.error('Login error:', err);
      setError(err.message || 'Invalid credentials. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div 
      className="fixed inset-0 overflow-hidden"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      {/* Background with adjusted opacity */}
      <div className="absolute inset-0 z-0" style={{
        backgroundImage: 'url("/images/img.png")',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }} />
      <div className="absolute inset-0 z-0 bg-black bg-opacity-75" /> {/* Increased opacity */}

      <motion.div 
        className="relative z-10 min-h-screen py-24 flex flex-col items-center"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        <motion.div 
          className="mb-8"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <img
            src="/images/logo.png"
            alt="NEC Logo"
            className="h-16 object-contain"
          />
        </motion.div>

        <motion.div 
          className="w-[90%] max-w-sm mx-auto"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          <motion.div 
            className="bg-slate-800/90 backdrop-blur-sm rounded-2xl shadow-xl p-6 border border-slate-700"
            whileHover={{ scale: 1.02 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <div className="text-center mb-6">
              <h1 className="text-3xl font-bold text-white">
                Student Feedback
              </h1>
              <p className="text-slate-400 mt-2 text-sm">
                Help us improve by sharing your feedback
              </p>
            </div>

            <div className="flex gap-1 mb-4">
              {['admin', 'coordinator', 'bsh'].map((roleType) => (
                <button
                  key={roleType}
                  type="button"
                  onClick={() => setRole(roleType as 'admin' | 'coordinator' | 'bsh')}
                  className={`flex-1 py-1.5 px-2 text-sm rounded-lg font-medium transition-all ${
                    role === roleType
                      ? 'bg-blue-600 text-white shadow-md'
                      : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                  }`}
                >
                  {roleType.charAt(0).toUpperCase() + roleType.slice(1)}
                </button>
              ))}
            </div>

            <motion.form 
              onSubmit={handleSubmit} 
              className="space-y-4"
            >
              <AnimatePresence mode="wait">
                {role === 'coordinator' && (
                  <motion.div
                    key="branch-select"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                  >
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-1">
                        Branch
                      </label>
                      <select
                        value={branch}
                        onChange={(e) => setBranch(e.target.value)}
                        className="w-full px-3 py-2 text-base bg-slate-700 border border-slate-600 text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                      >
                        {BRANCHES.map(b => (
                          <option key={b} value={b}>{b}</option>
                        ))}
                      </select>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
              
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">
                  Username
                </label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full px-3 py-2 text-base bg-slate-700 border border-slate-600 text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none placeholder-slate-400"
                  placeholder={
                    role === 'admin' ? 'admin' :
                    role === 'coordinator' ? `${branch.toLowerCase()}_coord` :
                    'bsh_coord'
                  }
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">
                  Password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-3 py-2 text-base bg-slate-700 border border-slate-600 text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none placeholder-slate-400"
                  placeholder="Enter your password"
                  required
                />
              </div>

              {error && (
                <div className="bg-red-900/50 border border-red-700 text-red-200 px-3 py-2 rounded-lg text-sm">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 text-white py-2 px-4 text-base rounded-lg font-medium hover:bg-blue-700 focus:ring-4 focus:ring-blue-200 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Logging in...' : 'Login'}
              </button>
            </motion.form>

            <div className="mt-4 pt-4 border-t border-slate-700 text-center">
              <p className="text-sm text-slate-400">
                Student? <a href="/feedback" className="text-blue-400 hover:text-blue-300 font-medium">Submit Feedback</a>
              </p>
            </div>
          </motion.div>
        </motion.div>
      </motion.div>
    </motion.div>
  );
};

export default LoginPage;
