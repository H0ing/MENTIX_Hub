import { useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { FiMail, FiArrowLeft, FiArrowRight, FiRefreshCw } from 'react-icons/fi';
import { mockUsers } from '../../data/mockdata.js';

export default function ForgotPassword() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  function handleSubmit(e) {
    e.preventDefault();
    setError('');

    const userExists = mockUsers.some(
      (u) => u.email.toLowerCase() === email.toLowerCase()
    );

    if (!userExists) {
      setError('No account found with this email address.');
      return;
    }

    setSent(true);
    // Pass email to OTP page via state
    setTimeout(() => navigate('/otp-reset', { state: { email } }), 1500);
  }

  return (
    <div className="h-screen bg-white flex flex-col items-center justify-center overflow-hidden font-[Inter,sans-serif]">
      <p className="text-[#630ed4] font-black text-4xl tracking-tight mb-7">MENTIX-Hub</p>

      <div className="w-full max-w-[540px] bg-white border border-[rgba(204,195,216,0.3)] rounded-[32px] shadow-[0px_8px_20px_rgba(0,0,0,0.05)] px-14 py-12">
        <div className="flex justify-center mb-6">
          <div className="w-[90px] h-[90px] rounded-full bg-[rgba(99,14,212,0.1)] flex items-center justify-center">
            <FiRefreshCw size={36} className="text-[#630ed4]" strokeWidth={2} />
          </div>
        </div>

        <h1 className="text-[#191c1d] font-bold text-[42px] tracking-tight text-center leading-tight mb-3">
          Forgot Password?
        </h1>
        <p className="text-[#4a4455] text-base text-center leading-relaxed mb-8">
          Enter your email address and we&apos;ll send you a password reset link.
        </p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <div>
            <label className="text-[#4a4455] font-medium text-sm block mb-1.5">
              Email Address
            </label>
            <div className="relative">
              <FiMail
                size={18}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-[#7b7487]"
              />
              <input
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setError('');
                }}
                placeholder="name@university.edu"
                className="w-full border border-[#ccc3d8] rounded-[16px] pl-11 pr-4 py-4 text-base text-gray-700 placeholder:text-[#ccc3d8] outline-none focus:border-[#630ed4] focus:ring-1 focus:ring-[#630ed4] transition-all"
                required
              />
            </div>
            {error && (
              <div className="text-red-500 text-sm font-medium mt-1.5">{error}</div>
            )}
          </div>

          <button
            type="submit"
            disabled={sent}
            className="w-full bg-[#7c3aed] text-white font-bold text-lg py-4 rounded-[16px] hover:bg-[#6d28d9] transition-colors flex items-center justify-center gap-3 disabled:opacity-70"
          >
            {sent ? 'Sending...' : 'Send Reset Link'}
            {!sent && <FiArrowRight size={20} />}
          </button>
        </form>

        <div className="mt-6 border-t border-[rgba(204,195,216,0.2)] pt-6 flex justify-center">
          <Link
            to="/login"
            className="flex items-center gap-2 text-[#630ed4] font-semibold text-base hover:underline"
          >
            <FiArrowLeft size={18} />
            Back to Login
          </Link>
        </div>
      </div>

      <p className="mt-6 text-[#7b7487] text-sm italic text-center">
        &quot;Innovation thrives on collaboration and persistence.&quot;
      </p>
    </div>
  );
}