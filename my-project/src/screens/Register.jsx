import React, { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { UserContext } from '../context/user.context';
import axios from '../config/axios';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';

const Register = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const { setUser } = useContext(UserContext);
  const navigate = useNavigate();

  async function submitHandler(e) {
    e.preventDefault();
    setLoading(true);
    toast.dismiss(); // Clear any previous toasts

    try {
      const res = await axios.post('/users/register', { email, password });
      localStorage.setItem('token', res.data.token);
      setUser(res.data.user);
      toast.success('Registered successfully! 🎉');
      navigate('/');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-900 via-indigo-900 to-gray-900 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="bg-gray-800/50 backdrop-blur-md p-12 rounded-2xl shadow-2xl w-full max-w-2xl border border-gray-700/30"
      >
        <h2 className="text-5xl font-bold text-white mb-10 text-center">Create Account</h2>

        <form onSubmit={submitHandler}>
          <div className="mb-10">
            <label className="block text-gray-300 text-xl mb-3" htmlFor="email">Email</label>
            <input
              onChange={(e) => setEmail(e.target.value)}
              value={email}
              type="email"
              id="email"
              className="w-full p-5 text-xl rounded-xl bg-gray-700/50 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 transition"
              placeholder="Enter your email"
              required
            />
          </div>

          <div className="mb-10">
            <label className="block text-gray-300 text-xl mb-3" htmlFor="password">Password</label>
            <input
              onChange={(e) => setPassword(e.target.value)}
              value={password}
              type="password"
              id="password"
              className="w-full p-5 text-xl rounded-xl bg-gray-700/50 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 transition"
              placeholder="Enter your password"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full p-5 text-xl rounded-xl text-white font-bold transition ${
              loading ? 'bg-purple-400 cursor-not-allowed' : 'bg-purple-600 hover:bg-purple-700'
            }`}
          >
            {loading ? 'Registering...' : 'Register'}
          </button>
        </form>

        <p className="text-gray-400 mt-8 text-center text-xl">
          Already have an account?{' '}
          <Link to="/login" className="text-purple-400 hover:underline transition">
            Login
          </Link>
        </p>
      </motion.div>
    </div>
  );
};

export default Register;