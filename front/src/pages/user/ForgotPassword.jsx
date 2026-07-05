import { useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { FiMail, FiArrowLeft, FiArrowRight, FiRefreshCw } from 'react-icons/fi';
import { forgotPassword } from '../../api/authApi';

export default function ForgotPassword() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');

    try {
      await forgotPassword({ email });
      setSent(true);
      setTimeout(() => navigate('/otp-reset', { state: { email, type: 'password_reset' } }), 1500);
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to send reset code. Please try again.';
      setError(msg);
    }
  }

  return (
    <div className="h-screen bg-white flex flex-col items-center justify-center overflow-hidden font-[Inter,sans-serif]">
      <p className="text-[#630ed4] font-black text-2xl tracking-tight mb-5">MENTIX-Hub</p>

      <div className="w-full max-w-[420px] bg-white border border-[rgba(204,195,216,0.3)] rounded-[24px] shadow-[0px_5px_14px_rgba(0,0,0,0.05)] px-8 py-8">
        <div className="flex justify-center mb-4">
          <div className="w-[68px] h-[68px] rounded-full bg-[rgba(99,14,212,0.1)] flex items-center justify-center">
            <FiRefreshCw size={28} className="text-[#630ed4]" strokeWidth={2} />
          </div>
        </div>

        <h1 className="text-[#191c1d] font-bold text-[28px] tracking-tight text-center leading-tight mb-2">
          Forgot Password?
        </h1>
        <p className="text-[#4a4455] text-sm text-center leading-relaxed mb-6">
          Enter your email address and we&apos;ll send you a password reset link.
        </p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="text-[#4a4455] font-medium text-xs block mb-1">
              Email Address
            </label>
            <div className="relative">
              <FiMail
                size={15}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-[#7b7487]"
              />
              <input
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setError('');
                }}
                placeholder="name@university.edu"
                className="w-full border border-[#ccc3d8] rounded-[12px] pl-9 pr-3 py-2.5 text-sm text-gray-700 placeholder:text-[#ccc3d8] outline-none focus:border-[#630ed4] focus:ring-1 focus:ring-[#630ed4] transition-all"
                required
              />
            </div>
            {error && (
              <div className="text-red-500 text-xs font-medium mt-1">{error}</div>
            )}
          </div>

          <button
            type="submit"
            disabled={sent}
            className="w-full bg-[#7c3aed] text-white font-bold text-sm py-3 rounded-[12px] hover:bg-[#6d28d9] transition-colors flex items-center justify-center gap-2 disabled:opacity-70"
          >
            {sent ? 'Sending...' : 'Send Reset Link'}
            {!sent && <FiArrowRight size={16} />}
          </button>
        </form>

        <div className="mt-5 border-t border-[rgba(204,195,216,0.2)] pt-5 flex justify-center">
          <Link
            to="/login"
            className="flex items-center gap-2 text-[#630ed4] font-semibold text-sm hover:underline"
          >
            <FiArrowLeft size={15} />
            Back to Login
          </Link>
        </div>
      </div>

      <p className="mt-4 text-[#7b7487] text-xs italic text-center">
        &quot;Innovation thrives on collaboration and persistence.&quot;
      </p>
    </div>
  );
}