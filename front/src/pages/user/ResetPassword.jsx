import { useState } from 'react';
import { Link, useNavigate } from 'react-router';
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
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState('');

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

  function handleSubmit(e) {
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

    // In a real app, you'd call the reset API here.
    // For demo, just navigate to login.
    navigate('/login');
  }

  return (
    <div className="h-screen bg-white flex flex-col items-center justify-center overflow-hidden font-[Inter,sans-serif]">
      <div className="text-center mb-6">
        <p className="text-[#630ed4] font-black text-4xl tracking-tight">MENTIX-Hub</p>
        <p className="text-[#4a4455] text-sm mt-1">Secure Academic &amp; Innovation Portal</p>
      </div>

      <div className="w-full max-w-[540px] bg-white border border-[rgba(204,195,216,0.3)] rounded-[26px] shadow-[0px_7px_32px_rgba(0,0,0,0.05)] px-12 py-10 overflow-hidden relative">
        <div
          className="absolute top-0 right-0 w-[200px] h-[200px] opacity-[0.03] pointer-events-none"
          style={{
            background: 'radial-gradient(circle at top right, #630ed4 0%, transparent 70%)',
          }}
        />

        <h1 className="text-[#191c1d] font-bold text-[40px] tracking-tight leading-tight mb-2">
          Reset Password
        </h1>
        <p className="text-[#4a4455] text-base leading-relaxed mb-7">
          Choose a secure password for your researcher account.
        </p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          {/* New Password */}
          <div>
            <label className="text-[#4a4455] font-medium text-sm block mb-1.5">
              New Password
            </label>
            <div className="relative">
              <FiLock
                size={16}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-[#7b7487]"
              />
              <input
                type={showNew ? 'text' : 'password'}
                value={newPassword}
                onChange={(e) => {
                  setNewPassword(e.target.value);
                  setError('');
                }}
                placeholder="••••••••"
                className="w-full bg-[#f3f4f5] border border-[#ccc3d8] rounded-[13px] pl-10 pr-11 py-4 text-base text-gray-700 placeholder:text-[#6b7280] outline-none focus:border-[#630ed4] focus:ring-1 focus:ring-[#630ed4] transition-all"
                required
              />
              <button
                type="button"
                onClick={() => setShowNew(!showNew)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-[#7b7487] hover:text-[#630ed4] transition-colors"
              >
                {showNew ? <FiEyeOff size={16} /> : <FiEye size={16} />}
              </button>
            </div>
            {/* Strength feedback */}
            {newPassword && (
              <div className="mt-2 px-1">
                <div className="flex items-center gap-2">
                  <span className={`text-sm font-semibold ${strengthColor}`}>
                    {strengthLevel}
                  </span>
                  <span className="text-xs text-[#4a4455]">{strengthMessage}</span>
                </div>
                <div className="grid grid-cols-2 gap-x-4 gap-y-1 mt-1">
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
            <label className="text-[#4a4455] font-medium text-sm block mb-1.5">
              Confirm New Password
            </label>
            <div className="relative">
              <FiShield
                size={16}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-[#7b7487]"
              />
              <input
                type={showConfirm ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => {
                  setConfirmPassword(e.target.value);
                  setError('');
                }}
                placeholder="••••••••"
                className="w-full bg-[#f3f4f5] border border-[#ccc3d8] rounded-[13px] pl-10 pr-11 py-4 text-base text-gray-700 placeholder:text-[#6b7280] outline-none focus:border-[#630ed4] focus:ring-1 focus:ring-[#630ed4] transition-all"
                required
              />
              <button
                type="button"
                onClick={() => setShowConfirm(!showConfirm)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-[#7b7487] hover:text-[#630ed4] transition-colors"
              >
                {showConfirm ? <FiEyeOff size={16} /> : <FiEye size={16} />}
              </button>
            </div>
          </div>

          {/* Requirements hint – updated to match our logic */}
          <div className="bg-[#f3f4f5] border border-[rgba(204,195,216,0.2)] rounded-[20px] p-5">
            <div className="flex items-center gap-2 mb-3">
              <FiInfo size={16} className="text-[#191c1d] shrink-0" />
              <span className="text-[#191c1d] font-medium text-sm">Requirement Guide</span>
            </div>
            <ul className="flex flex-col gap-1.5 pl-1">
              <li className="flex items-center gap-2 text-[#4a4455] text-sm">
                <span className="w-1.5 h-1.5 rounded-full bg-[#4a4455] shrink-0" />
                Minimum 8 characters
              </li>
              <li className="flex items-center gap-2 text-[#4a4455] text-sm">
                <span className="w-1.5 h-1.5 rounded-full bg-[#4a4455] shrink-0" />
                At least two different character types (uppercase, lowercase, numbers, symbols)
              </li>
            </ul>
          </div>

          {error && (
            <div className="text-red-500 text-sm font-medium -mt-1">{error}</div>
          )}

          <button
            type="submit"
            className="w-full bg-[#630ed4] text-white font-bold text-lg py-4 rounded-[20px] hover:bg-[#500088] transition-colors flex items-center justify-center gap-3"
          >
            Reset Password
            <FiArrowRight size={20} />
          </button>
        </form>

        <div className="mt-5 border-t border-[rgba(204,195,216,0.2)] pt-5 flex justify-center">
          <Link
            to="/login"
            className="flex items-center gap-2 text-[#630ed4] font-semibold text-base hover:underline"
          >
            <FiArrowLeft size={18} />
            Return to Login
          </Link>
        </div>
      </div>

      <p className="mt-4 text-[#ccc3d8] text-xs text-center">
        © 2024 MENTIX-Hub Academic Portal. All sessions are encrypted.
      </p>
    </div>
  );
}