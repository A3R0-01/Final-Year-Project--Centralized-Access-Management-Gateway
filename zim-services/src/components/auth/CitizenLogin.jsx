// src/components/auth/CitizenLogin.js
import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { login } from '@/redux/slices/authSlice';
import { useRouter } from 'next/router';

const CitizenLogin = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const dispatch = useDispatch();
  const router = useRouter();
  const { loading, error } = useSelector((state) => state.auth);

  const handleSubmit = async (e) => {
    e.preventDefault();
    dispatch(login({ username, password }));
  };

  // Redirect if login is successful (you might want to check for a token in the state)
  const token = useSelector((state) => state.auth.token);
  React.useEffect(() => {
    if (token) {
      router.push('/citizen/dashboard'); // Redirect to the citizen dashboard
    }
  }, [token, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded shadow-md w-96">
        <h2 className="text-2xl font-semibold mb-6 text-center text-gray-700">
          Citizen Portal Login
        </h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label
              htmlFor="username"
              className="block text-gray-700 text-sm font-bold mb-2"
            >
              Username
            </label>
            <input
              type="text"
              id="username"
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>
          <div className="mb-6">
            <label
              htmlFor="password"
              className="block text-gray-700 text-sm font-bold mb-2"
            >
              Password
            </label>
            <input
              type="password"
              id="password"
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 mb-3 leading-tight focus:outline-none focus:shadow-outline"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <div className="flex items-center justify-between">
            <button
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
              type="submit"
              disabled={loading}
            >
              {loading ? 'Logging in...' : 'Login'}
            </button>
            {/* You might want to add a "Forgot Password?" link here */}
          </div>
          {error && (
            <p className="text-red-500 text-xs italic mt-4 text-center">
              {error.message || 'Invalid username or password'}
            </p>
          )}
        </form>
        <div className="mt-4 text-center">
          <p className="text-gray-600 text-sm">New citizen?</p>
          <button
            onClick={() => router.push('/citizen/register')} // Link to registration page
            className="text-blue-500 hover:text-blue-700 font-bold text-sm"
          >
            Register for an account
          </button>
        </div>
      </div>
    </div>
  );
};

export default CitizenLogin;