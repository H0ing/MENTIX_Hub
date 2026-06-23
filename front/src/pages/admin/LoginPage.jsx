import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

export default function AdminLoginPage() {
  const { login }  = useAuth();
  const navigate   = useNavigate();
  const [email, setEmail]           = useState('');
  const [password, setPassword]     = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError]           = useState('');
  const [loading, setLoading]       = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      navigate('/admin/moderation', { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  const inputCls =
    'w-full px-3 py-2 border border-[#ECE9F4] rounded-[8px] text-[13px] bg-[#F7F5FB] ' +
    'outline-none text-[#1A1A2E] focus:border-[#7C3AED] transition-colors placeholder:text-[#B7B2C9]';

  const labelCls = 'block text-[10.5px] font-bold text-[#8B8B9E] uppercase tracking-[0.05em] mb-1.5';

  return (
    <div className="min-h-screen bg-[#F7F5FB] flex items-center justify-center p-4">
      <div className="bg-white rounded-[12px] border border-[#ECE9F4] shadow-[0_4px_20px_rgba(30,20,60,0.08)] w-full max-w-[340px] px-7 py-6">

        {/* Brand */}
        <div className="mb-5 text-center">
          <h1 className="text-[18px] font-black text-[#7C3AED] tracking-[-0.02em] m-0 leading-none">
            Mentix-Hub
          </h1>
          <p className="text-[11px] text-[#8B8B9E] mt-1 uppercase tracking-[0.06em]">
            Admin Console
          </p>
        </div>

        <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-3">
          {/* Email */}
          <div>
            <label className={labelCls}>Email</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="admin@mentix.dev"
              required
              autoFocus
              className={inputCls}
            />
          </div>

          {/* Password */}
          <div>
            <label className={labelCls}>Password</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className={inputCls + ' pr-9'}
              />
              <button
                type="button"
                onClick={() => setShowPassword(v => !v)}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#8B8B9E] hover:text-[#7C3AED] transition-colors"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? (
                  /* eye-off */
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
                    <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
                    <line x1="1" y1="1" x2="23" y2="23"/>
                  </svg>
                ) : (
                  /* eye */
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                    <circle cx="12" cy="12" r="3"/>
                  </svg>
                )}
              </button>
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="text-[11.5px] font-semibold text-[#E0245E] bg-[#FDEAF0] px-3 py-2 rounded-[7px]">
              {error}
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="mt-1 w-full bg-[#7C3AED] hover:bg-[#6425D0] text-white font-semibold text-[13px] py-2.5 rounded-[8px] transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading ? 'Signing in…' : 'Sign In'}
          </button>
        </form>

        <p className="text-center text-[11px] text-[#B7B2C9] mt-4">
          Admin access only
        </p>
      </div>
    </div>
  );
}
