import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router';
import {
  FiLock,
  FiShield,
  FiInfo,
  FiArrowLeft,
  FiArrowRight,
  FiEye,
  FiEyeOff,
  FiCheck,
  FiCircle,
} from 'react-icons/fi';
import { resetPassword } from '../../api/authApi';

function StrengthItem({ met, label }) {
  return (
    <span className="flex items-center gap-1.5 text-xs text-[#4a4455]">
      {met ? (
        <FiCheck size={13} className="text-[#005b3d] shrink-0" />
      ) : (
        <FiCircle size={13} className="text-[#7b7487] shrink-0" />
      )}
      {label}
    </span>
  );
}

export default function ResetPassword() {
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email || '';
  const otp = location.state?.otp || '';
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // ---------- Password strength logic (same as SignUp) ----------
  const pw = newPassword;
  const hasLength = pw.length >= 8;
  const hasUpper = /[A-Z]/.test(pw);
  const hasLower = /[a-z]/.test(pw);
  const hasNumber = /[0-9]/.test(pw);
  const hasSymbol = /[^A-Za-z0-9]/.test(pw);
  const typesCount = [hasUpper, hasLower, hasNumber, hasSymbol].filter(Boolean).length;

  let strengthLevel = '';
  let strengthColor = '';
  let strengthMessage = '';
  let isPasswordValid = false;

  if (pw.length === 0) {
    // no feedback
  } else if (pw.length < 8) {
    strengthLevel = 'Too short';
    strengthColor = 'text-red-500';
    strengthMessage = 'Must be at least 8 characters.';
    isPasswordValid = false;
  } else {
    if (typesCount === 1) {
      strengthLevel = 'Weak';
      strengthColor = 'text-red-500';
      strengthMessage = 'Add more variety (uppercase, numbers, symbols).';
      isPasswordValid = false;
    } else if (typesCount === 2 || typesCount === 3) {
      strengthLevel = 'Medium';
      strengthColor = 'text-yellow-500';
      strengthMessage = 'Good – add more types for a stronger password.';
      isPasswordValid = true;
    } else if (typesCount === 4) {
      strengthLevel = 'Strong';
      strengthColor = 'text-green-600';
      strengthMessage = 'Excellent password!';
      isPasswordValid = true;
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');

    // Basic validations
    if (!newPassword) {
      setError('New password is required.');
      return;
    }
    if (!confirmPassword) {
      setError('Please confirm your password.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    if (!isPasswordValid) {
      if (pw.length < 8) {
        setError('Password must be at least 8 characters long.');
      } else {
        setError(
          'Password must contain at least two different character types (e.g., uppercase + number, or lowercase + symbol).'
        );
      }
      return;
    }

    try {
      setLoading(true);
      await resetPassword({ email, otp, new_password: newPassword });
      navigate('/login');
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to reset password. Please try again.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="h-screen bg-white flex flex-col items-center justify-center overflow-hidden font-[Inter,sans-serif]">
      <div className="text-center mb-5">
        <p className="text-[#630ed4] font-black text-2xl tracking-tight">MENTIX-Hub</p>
        <p className="text-[#4a4455] text-xs mt-0.5">Secure Academic &amp; Innovation Portal</p>
      </div>

      <div className="w-full max-w-[420px] bg-white border border-[rgba(204,195,216,0.3)] rounded-[20px] shadow-[0px_5px_24px_rgba(0,0,0,0.05)] px-8 py-7 overflow-hidden relative">
        <div
          className="absolute top-0 right-0 w-[160px] h-[160px] opacity-[0.03] pointer-events-none"
          style={{
            background: 'radial-gradient(circle at top right, #630ed4 0%, transparent 70%)',
          }}
        />

        <h1 className="text-[#191c1d] font-bold text-[28px] tracking-tight leading-tight mb-1">
          Reset Password
        </h1>
        <p className="text-[#4a4455] text-sm leading-relaxed mb-5">
          Choose a secure password for your researcher account.
        </p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {/* New Password */}
          <div>
            <label className="text-[#4a4455] font-medium text-xs block mb-1">
              New Password
            </label>
            <div className="relative">
              <FiLock
                size={14}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-[#7b7487]"
              />
              <input
                type={showNew ? 'text' : 'password'}
                value={newPassword}
                onChange={(e) => {
                  setNewPassword(e.target.value);
                  setError('');
                }}
                placeholder="••••••••"
                className="w-full bg-[#f3f4f5] border border-[#ccc3d8] rounded-[10px] pl-8 pr-9 py-2.5 text-sm text-gray-700 placeholder:text-[#6b7280] outline-none focus:border-[#630ed4] focus:ring-1 focus:ring-[#630ed4] transition-all"
                required
              />
              <button
                type="button"
                onClick={() => setShowNew(!showNew)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#7b7487] hover:text-[#630ed4] transition-colors"
              >
                {showNew ? <FiEyeOff size={14} /> : <FiEye size={14} />}
              </button>
            </div>
            {/* Strength feedback */}
            {newPassword && (
              <div className="mt-1.5 px-1">
                <div className="flex items-center gap-2">
                  <span className={`text-xs font-semibold ${strengthColor}`}>
                    {strengthLevel}
                  </span>
                  <span className="text-xs text-[#4a4455]">{strengthMessage}</span>
                </div>
                <div className="grid grid-cols-2 gap-x-3 gap-y-0.5 mt-0.5">
                  <StrengthItem met={hasLength} label="8 characters" />
                  <StrengthItem met={hasUpper || hasLower} label="Letter (upper/lower)" />
                  <StrengthItem met={hasNumber} label="Number" />
                  <StrengthItem met={hasSymbol} label="Symbol" />
                </div>
              </div>
            )}
          </div>

          {/* Confirm Password */}
          <div>
            <label className="text-[#4a4455] font-medium text-xs block mb-1">
              Confirm New Password
            </label>
            <div className="relative">
              <FiShield
                size={14}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-[#7b7487]"
              />
              <input
                type={showConfirm ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => {
                  setConfirmPassword(e.target.value);
                  setError('');
                }}
                placeholder="••••••••"
                className="w-full bg-[#f3f4f5] border border-[#ccc3d8] rounded-[10px] pl-8 pr-9 py-2.5 text-sm text-gray-700 placeholder:text-[#6b7280] outline-none focus:border-[#630ed4] focus:ring-1 focus:ring-[#630ed4] transition-all"
                required
              />
              <button
                type="button"
                onClick={() => setShowConfirm(!showConfirm)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#7b7487] hover:text-[#630ed4] transition-colors"
              >
                {showConfirm ? <FiEyeOff size={14} /> : <FiEye size={14} />}
              </button>
            </div>
          </div>

          {/* Requirements hint – updated to match our logic */}
          <div className="bg-[#f3f4f5] border border-[rgba(204,195,216,0.2)] rounded-[16px] p-4">
            <div className="flex items-center gap-2 mb-2">
              <FiInfo size={14} className="text-[#191c1d] shrink-0" />
              <span className="text-[#191c1d] font-medium text-xs">Requirement Guide</span>
            </div>
            <ul className="flex flex-col gap-1 pl-1">
              <li className="flex items-center gap-2 text-[#4a4455] text-xs">
                <span className="w-1.5 h-1.5 rounded-full bg-[#4a4455] shrink-0" />
                Minimum 8 characters
              </li>
              <li className="flex items-center gap-2 text-[#4a4455] text-xs">
                <span className="w-1.5 h-1.5 rounded-full bg-[#4a4455] shrink-0" />
                At least two different character types (uppercase, lowercase, numbers, symbols)
              </li>
            </ul>
          </div>

          {error && (
            <div className="text-red-500 text-xs font-medium -mt-1">{error}</div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#630ed4] text-white font-bold text-sm py-3 rounded-[14px] hover:bg-[#500088] transition-colors flex items-center justify-center gap-2 disabled:opacity-70"
          >
            {loading ? 'Resetting...' : 'Reset Password'}
            {!loading && <FiArrowRight size={16} />}
          </button>
        </form>

        <div className="mt-4 border-t border-[rgba(204,195,216,0.2)] pt-4 flex justify-center">
          <Link
            to="/login"
            className="flex items-center gap-2 text-[#630ed4] font-semibold text-sm hover:underline"
          >
            <FiArrowLeft size={15} />
            Return to Login
          </Link>
        </div>
      </div>

      <p className="mt-3 text-[#ccc3d8] text-xs text-center">
        © 2024 MENTIX-Hub Academic Portal. All sessions are encrypted.
      </p>
    </div>
  );
}