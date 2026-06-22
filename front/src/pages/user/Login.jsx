import { useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { FiEye, FiEyeOff } from 'react-icons/fi';
import { mockUsers } from '../../data/mockdata.js';
import { useAuth } from '../../App.jsx';

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Find user by username or email
    const user = mockUsers.find(
      (u) =>
        u.username.toLowerCase() === identifier.toLowerCase() ||
        u.email.toLowerCase() === identifier.toLowerCase()
    );

    if (!user) {
      setError('No account found with that email or username.');
      setLoading(false);
      return;
    }

    // Simple plain‑text password check
    if (password !== 'password') {
      setError('Incorrect password. Please try again.');
      setLoading(false);
      return;
    }

    // Success
    login(user);
    navigate('/');
    setLoading(false);
  }

  return (
    <div className="h-screen bg-white flex flex-col items-center justify-center overflow-hidden font-[Inter,sans-serif]">
      <p className="text-[#630ed4] font-black text-4xl tracking-tight mb-7">MENTIX-Hub</p>

      <div className="w-full max-w-[520px] bg-white border border-[rgba(204,195,216,0.3)] rounded-[28px] shadow-[0px_7px_17px_rgba(0,0,0,0.05)] px-12 py-10">
        <h1 className="text-[#191c1d] font-bold text-[44px] tracking-tight leading-tight mb-2">
          Welcome Back
        </h1>
        <p className="text-[#4a4455] text-base leading-relaxed mb-7">
          Sign in to continue exploring projects and mentorship opportunities.
        </p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <div>
            <label className="text-[#4a4455] font-medium text-sm block mb-1.5">
              Email or Username
            </label>
            <input
              type="text"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              placeholder="Enter your email or username"
              className="w-full border border-[#ccc3d8] rounded-[14px] px-4 py-3.5 text-base text-gray-700 placeholder:text-[#7b7487] outline-none focus:border-[#630ed4] focus:ring-1 focus:ring-[#630ed4] transition-all"
              required
            />
          </div>

          <div>
            <label className="text-[#4a4455] font-medium text-sm block mb-1.5">Password</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full border border-[#ccc3d8] rounded-[14px] px-4 py-3.5 pr-12 text-base text-gray-700 placeholder:text-[#7b7487] outline-none focus:border-[#630ed4] focus:ring-1 focus:ring-[#630ed4] transition-all"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-[#4a4455] hover:text-[#630ed4] transition-colors"
              >
                {showPassword ? <FiEyeOff size={20} /> : <FiEye size={20} />}
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-5 h-5 rounded border-[#ccc3d8] accent-[#630ed4] cursor-pointer"
              />
              <span className="text-[#4a4455] font-semibold text-sm">Remember Me</span>
            </label>
            <Link to="/forgot-password" className="text-[#630ed4] font-semibold text-sm hover:underline">
              Forgot Password?
            </Link>
          </div>

          {error && (
            <div className="text-red-500 text-sm font-medium -mt-2">{error}</div>
          )}

          <button
            type="submit"
            disabled={loading}
            className={`w-full bg-[#7c3aed] text-white font-bold text-lg py-4 rounded-[14px] transition-colors ${
              loading ? 'opacity-70 cursor-not-allowed' : 'hover:bg-[#6d28d9]'
            }`}
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>
      </div>

      <p className="mt-6 text-[#4a4455] text-base">
        Don&apos;t have an account?{' '}
        <Link to="/signup" className="text-[#630ed4] font-bold hover:underline">
          Sign Up
        </Link>
      </p>
    </div>
  );
}