import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router';
import { FiArrowLeft } from 'react-icons/fi';

const OTP_LENGTH = 6;
const DEMO_OTP = '123456';

export default function OtpReset() {
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email || 'your email';

  const [digits, setDigits] = useState(Array(OTP_LENGTH).fill(''));
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
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

  function handleResend() {
    setDigits(Array(OTP_LENGTH).fill(''));
    inputRefs.current[0]?.focus();
    setError('');
    alert('OTP resent (demo)');
  }

  function handleSubmit(e) {
    e.preventDefault();
    const otp = digits.join('');
    if (otp.length < OTP_LENGTH) {
      setError('Please enter the full 6-digit OTP.');
      return;
    }

    setLoading(true);
    setError('');

    setTimeout(() => {
      if (otp === DEMO_OTP) {
        navigate('/reset-password', { state: { email } });
      } else {
        setError('Invalid OTP. Please try again.');
        setLoading(false);
      }
    }, 500);
  }

  return (
    <div className="h-screen bg-white flex flex-col items-center justify-center overflow-hidden font-[Inter,sans-serif]">
      <p className="text-[#630ed4] font-black text-4xl tracking-tight mb-7">MENTIX-Hub</p>

      <div className="w-full max-w-[540px] bg-white border border-[rgba(204,195,216,0.3)] rounded-[28px] shadow-[0px_7px_17px_rgba(0,0,0,0.05)] px-12 py-12">
        <h1 className="text-[#191c1d] font-bold text-[42px] tracking-tight leading-tight mb-3">
          OTP Reset Password
        </h1>
        <p className="text-[#4a4455] text-base leading-relaxed mb-8">
          Enter OTP code sent to{' '}
          <span className="font-medium">{email}</span>
        </p>

        <form onSubmit={handleSubmit}>
          {/* ✅ Redesigned OTP boxes – fixed width, centered */}
          <div className="flex justify-center gap-3 mb-8" onPaste={handlePaste}>
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
                className="w-14 h-[72px] text-center text-2xl font-semibold border border-[#a39cad] rounded-[14px] outline-none focus:border-[#630ed4] focus:ring-2 focus:ring-[#630ed4]/20 transition-all bg-white text-[#191c1d] caret-[#630ed4] disabled:opacity-50"
              />
            ))}
          </div>

          {error && (
            <div className="text-red-500 text-sm font-medium text-center -mt-2 mb-4">
              {error}
            </div>
          )}

          <div className="text-center mb-6">
            <p className="text-black font-semibold text-base mb-1">
              Didn&apos;t receive OTP code?
            </p>
            <button
              type="button"
              onClick={handleResend}
              disabled={loading}
              className="text-[#630ed4] font-semibold text-base hover:underline disabled:opacity-50"
            >
              Resend code
            </button>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#7c3aed] text-white font-bold text-lg py-4 rounded-[14px] hover:bg-[#6d28d9] transition-colors disabled:opacity-70"
          >
            {loading ? 'Verifying...' : 'Verify & Proceed'}
          </button>
        </form>
      </div>

      <div className="mt-6 border-t border-[rgba(204,195,216,0.2)] pt-5">
        <Link
          to="/login"
          className="flex items-center gap-2 text-[#630ed4] font-semibold text-base hover:underline"
        >
          <FiArrowLeft size={18} />
          Return to Login
        </Link>
      </div>
    </div>
  );
}