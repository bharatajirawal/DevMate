import React, { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from '../config/axios';
import { UserContext } from '../context/user.context';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';

const Login = () => {
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
      const res = await axios.post('/users/login', { email, password });
      localStorage.setItem('token', res.data.token);
      setUser(res.data.user);
      toast.success('Logged in successfully! 🎉');
      navigate('/');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-4">
      <motion.div 
        initial={{ opacity: 0, y: 50 }} 
        animate={{ opacity: 1, y: 0 }} 
        transition={{ duration: 0.5 }}
        className="bg-gray-800 p-12 rounded-lg shadow-xl w-full max-w-lg"
      >
        <h2 className="text-4xl font-bold text-white mb-8 text-center">Welcome Back</h2>

        <form onSubmit={submitHandler}>
          <div className="mb-12"> {/* Increased margin-bottom for more gap */}
            <label className="block text-gray-300 text-lg mb-2" htmlFor="email">Email</label>
            <input
              onChange={(e) => setEmail(e.target.value)}
              value={email}
              type="email"
              id="email"
              className="w-full p-5 text-lg rounded-lg bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
              placeholder="Enter your email"
              required
            />
          </div>
          
          <div className="mb-12">
            <label className="block text-gray-300 text-lg mb-5" htmlFor="password">Password</label>
            <input
              onChange={(e) => setPassword(e.target.value)}
              value={password}
              type="password"
              id="password"
              className="w-full p-6 text-lg rounded-lg bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
              placeholder="Enter your password"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full p-8 text-lg rounded-lg text-white font-bold transition ${
              loading ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-500 hover:bg-blue-600'
            }`}
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        <p className="text-gray-400 mt-6 text-center text-lg">
          Don't have an account?{' '}
          <Link to="/register" className="text-blue-400 hover:underline transition">
            Create one
          </Link>
        </p>
      </motion.div>
    </div>
  );
};

export default Login;