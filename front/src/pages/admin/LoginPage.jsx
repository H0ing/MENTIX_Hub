import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Input } from '../../components/shared/Input';

export default function AdminLoginPage() {
  const { login }    = useAuth();
  const navigate     = useNavigate();
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [error, setError]       = useState('');
  const [loading, setLoading]   = useState(false);

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

  return (
    <div className="min-h-screen bg-[#F7F5FB] flex items-center justify-center p-4">
      <div className="bg-white rounded-[14px] border border-[#ECE9F4] shadow-[0_8px_32px_rgba(30,20,60,0.1)] w-full max-w-[400px] p-8">

        {/* Brand */}
        <div className="mb-8 text-center">
          <h1 className="text-[22px] font-black text-[#7C3AED] tracking-[-0.02em] m-0">Mentix-Hub</h1>
          <p className="text-[13px] text-[#8B8B9E] mt-1">Admin Console</p>
        </div>

        <form onSubmit={handleSubmit} noValidate>
          {/* Email */}
          <div className="mb-4">
            <label className="block text-[11.5px] font-bold text-[#8B8B9E] uppercase tracking-[0.04em] mb-[7px]">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="admin@mentix.dev"
              required
              autoFocus
              className="w-full px-3 py-[10px] border border-[#ECE9F4] rounded-[9px] text-[13.5px] bg-[#F7F5FB] outline-none text-[#1A1A2E] focus:border-[#7C3AED] transition-colors"
            />
          </div>

          {/* Password */}
          <Input
            label="Password"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
          />

          {/* Error */}
          {error && (
            <div className="mb-4 text-[12.5px] font-semibold text-[#E0245E] bg-[#FDEAF0] px-3 py-2.5 rounded-[8px]">
              {error}
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#7C3AED] hover:bg-[#6425D0] text-white font-semibold text-[14px] py-[11px] rounded-[10px] transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading ? 'Signing in…' : 'Sign In'}
          </button>
        </form>

        <p className="text-center text-[12px] text-[#8B8B9E] mt-5">
          Admin access only. Client users log in at the main site.
        </p>
      </div>
    </div>
  );
}
