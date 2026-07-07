import { useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { FiEye, FiEyeOff } from 'react-icons/fi';
import { useAuth } from '../../routes/ClientRoutes';
import { login as loginApi } from '../../api/authApi';
import { setCurrentLogin } from '../../utils/storage';

export default function Login() {
  const navigate = useNavigate();
  const { login: contextLogin } = useAuth();
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [isPending, setIsPending] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setIsPending(false);
    setLoading(true);

    try {
      const res = await loginApi({ email: identifier, password });
      const { user, accessToken, refreshToken } = res.data.data;

      localStorage.removeItem('adminUser');
      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('refreshToken', refreshToken);
      setCurrentLogin(user);
      contextLogin(user);
      navigate('/');
    } catch (err) {
      const msg = err.response?.data?.message || 'Login failed. Please try again.';
      setError(msg);
      if (msg === 'Please verify your email before logging in.') {
        setIsPending(true);
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="h-screen bg-white flex flex-col items-center justify-center overflow-hidden font-[Inter,sans-serif]">
      <p className="text-[#630ed4] font-black text-2xl tracking-tight mb-5">MENTIX-Hub</p>

      <div className="w-full max-w-[420px] bg-white border border-[rgba(204,195,216,0.3)] rounded-[20px] shadow-[0px_5px_12px_rgba(0,0,0,0.05)] px-8 py-8">
        <h1 className="text-[#191c1d] font-bold text-[30px] tracking-tight leading-tight mb-1">
          Welcome Back
        </h1>
        <p className="text-[#4a4455] text-sm leading-relaxed mb-5">
          Sign in to continue exploring projects and mentorship opportunities.
        </p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="text-[#4a4455] font-medium text-xs block mb-1">
              Email or Username
            </label>
            <input
              type="text"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              placeholder="Enter your email or username"
              className="w-full border border-[#ccc3d8] rounded-[10px] px-3 py-2.5 text-sm text-gray-700 placeholder:text-[#7b7487] outline-none focus:border-[#630ed4] focus:ring-1 focus:ring-[#630ed4] transition-all"
              required
            />
          </div>

          <div>
            <label className="text-[#4a4455] font-medium text-xs block mb-1">Password</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full border border-[#ccc3d8] rounded-[10px] px-3 py-2.5 pr-10 text-sm text-gray-700 placeholder:text-[#7b7487] outline-none focus:border-[#630ed4] focus:ring-1 focus:ring-[#630ed4] transition-all"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#4a4455] hover:text-[#630ed4] transition-colors"
              >
                {showPassword ? <FiEyeOff size={16} /> : <FiEye size={16} />}
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-4 h-4 rounded border-[#ccc3d8] accent-[#630ed4] cursor-pointer"
              />
              <span className="text-[#4a4455] font-semibold text-xs">Remember Me</span>
            </label>
            <Link to="/forgot-password" className="text-[#630ed4] font-semibold text-xs hover:underline">
              Forgot Password?
            </Link>
          </div>

          {error && (
            <div>
              <div className="text-red-500 text-xs font-medium -mt-1">{error}</div>
              {isPending && (
                <Link
                  to="/otp-reset"
                  state={{ email: identifier, type: 'email_verify' }}
                  className="mt-2 block text-center text-[#630ed4] font-semibold text-xs hover:underline"
                >
                  Verify Email Now
                </Link>
              )}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className={`w-full bg-[#7c3aed] text-white font-bold text-sm py-3 rounded-[10px] transition-colors ${
              loading ? 'opacity-70 cursor-not-allowed' : 'hover:bg-[#6d28d9]'
            }`}
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>
      </div>

      <p className="mt-4 text-[#4a4455] text-sm">
        Don&apos;t have an account?{' '}
        <Link to="/signup" className="text-[#630ed4] font-bold hover:underline">
          Sign Up
        </Link>
      </p>
    </div>
  );
}