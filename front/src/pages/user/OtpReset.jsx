import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router';
import { FiArrowLeft } from 'react-icons/fi';
import { verifyEmail, resendOTP, verifyOtp } from '../../api/authApi';

const OTP_LENGTH = 6;

export default function OtpReset() {
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email || '';
  const type = location.state?.type || 'email_verify';

  const [digits, setDigits] = useState(Array(OTP_LENGTH).fill(''));
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [resent, setResent] = useState(false);
  const inputRefs = useRef([]);

  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  function handleChange(index, value) {
    const digit = value.replace(/\D/g, '').slice(-1);
    const next = [...digits];
    next[index] = digit;
    setDigits(next);
    setError('');

    if (digit && index < OTP_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  }

  function handleKeyDown(index, e) {
    if (e.key === 'Backspace' && !digits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  }

  function handlePaste(e) {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, OTP_LENGTH);
    const next = [...digits];
    for (let i = 0; i < pasted.length; i++) {
      next[i] = pasted[i];
    }
    setDigits(next);
    setError('');
    const lastFilled = Math.min(pasted.length, OTP_LENGTH - 1);
    inputRefs.current[lastFilled]?.focus();
  }

  async function handleResend() {
    try {
      await resendOTP({ email, type });
      setDigits(Array(OTP_LENGTH).fill(''));
      inputRefs.current[0]?.focus();
      setError('');
      setResent(true);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to resend OTP.');
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const otp = digits.join('');
    if (otp.length < OTP_LENGTH) {
      setError('Please enter the full 6-digit OTP.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      if (type === 'email_verify') {
        await verifyEmail({ email, otp });
        navigate('/login');
      } else {
        await verifyOtp({ email, otp, type: 'password_reset' });
        navigate('/reset-password', { state: { email, otp } });
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Invalid OTP. Please try again.';
      setError(msg);
      setLoading(false);
    }
  }

  return (
    <div className="h-screen bg-white flex flex-col items-center justify-center overflow-hidden font-[Inter,sans-serif]">
      <p className="text-[#630ed4] font-black text-2xl tracking-tight mb-5">MENTIX-Hub</p>

      <div className="w-full max-w-[420px] bg-white border border-[rgba(204,195,216,0.3)] rounded-[20px] shadow-[0px_5px_12px_rgba(0,0,0,0.05)] px-8 py-8">
        <h1 className="text-[#191c1d] font-bold text-[28px] tracking-tight leading-tight mb-2">
          OTP Reset Password
        </h1>
        <p className="text-[#4a4455] text-sm leading-relaxed mb-6">
          Enter OTP code sent to{' '}
          <span className="font-medium">{email}</span>
        </p>

        <form onSubmit={handleSubmit}>
          {/* ✅ Redesigned OTP boxes – fixed width, centered */}
          <div className="flex justify-center gap-2 mb-6" onPaste={handlePaste}>
            {digits.map((digit, i) => (
              <input
                key={i}
                ref={(el) => (inputRefs.current[i] = el)}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(e) => handleChange(i, e.target.value)}
                onKeyDown={(e) => handleKeyDown(i, e)}
                disabled={loading}
                className="w-11 h-[52px] text-center text-lg font-semibold border border-[#a39cad] rounded-[10px] outline-none focus:border-[#630ed4] focus:ring-2 focus:ring-[#630ed4]/20 transition-all bg-white text-[#191c1d] caret-[#630ed4] disabled:opacity-50"
              />
            ))}
          </div>

          {error && (
            <div className="text-red-500 text-xs font-medium text-center -mt-1 mb-3">
              {error}
            </div>
          )}

          <div className="text-center mb-5">
            <p className="text-black font-semibold text-sm mb-0.5">
              Didn&apos;t receive OTP code?
            </p>
            <button
              type="button"
              onClick={handleResend}
              disabled={loading}
              className="text-[#630ed4] font-semibold text-sm hover:underline disabled:opacity-50"
            >
              {resent ? 'Resent!' : 'Resend code'}
            </button>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#7c3aed] text-white font-bold text-sm py-3 rounded-[10px] hover:bg-[#6d28d9] transition-colors disabled:opacity-70"
          >
            {loading ? 'Verifying...' : 'Verify & Proceed'}
          </button>
        </form>
      </div>

      <div className="mt-4 border-t border-[rgba(204,195,216,0.2)] pt-4">
        <Link
          to="/login"
          className="flex items-center gap-2 text-[#630ed4] font-semibold text-sm hover:underline"
        >
          <FiArrowLeft size={15} />
          Return to Login
        </Link>
      </div>
    </div>
  );
}