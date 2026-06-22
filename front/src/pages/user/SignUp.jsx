import { useState } from 'react';
import { Link, useNavigate } from 'react-router';
import {
  FiUser,
  FiMail,
  FiLock,
  FiShield,
  FiEye,
  FiEyeOff,
  FiCheck,
  FiCircle,
  FiArrowRight,
} from 'react-icons/fi';
import { mockUsers } from '../../data/mockdata.js';

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

export default function SignUp() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    year: '',
    major: '',
    agreed: false,
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  const pw = form.password;
  const hasLength = pw.length >= 8;
  const hasUpper = /[A-Z]/.test(pw);
  const hasLower = /[a-z]/.test(pw);
  const hasNumber = /[0-9]/.test(pw);
  const hasSymbol = /[^A-Za-z0-9]/.test(pw);

  const typesCount = [hasUpper, hasLower, hasNumber, hasSymbol].filter(Boolean).length;

  // ---- Determine strength level ----
  let strengthLevel = '';
  let strengthColor = '';
  let strengthMessage = '';
  let isPasswordValid = false;

  if (pw.length === 0) {
    // no password entered yet – no feedback
  } else if (pw.length < 8) {
    strengthLevel = 'Too short';
    strengthColor = 'text-red-500';
    strengthMessage = 'Must be at least 8 characters.';
    isPasswordValid = false;
  } else {
    // length >= 8
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

  function update(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
    setError('');
  }

  function handleSubmit(e) {
    e.preventDefault();
    setError('');

    // ---- All fields required ----
    if (!form.username.trim()) {
      setError('Username is required.');
      return;
    }
    if (!form.email.trim()) {
      setError('Email is required.');
      return;
    }
    if (!form.password) {
      setError('Password is required.');
      return;
    }
    if (!form.confirmPassword) {
      setError('Please confirm your password.');
      return;
    }
    if (!form.year.trim()) {
      setError('Year is required.');
      return;
    }
    if (!form.major.trim()) {
      setError('Major is required.');
      return;
    }
    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    if (!form.agreed) {
      setError('You must agree to the Terms and Conditions.');
      return;
    }

    // ---- Password strength validation ----
    if (!isPasswordValid) {
      if (pw.length < 8) {
        setError('Password must be at least 8 characters long.');
      } else {
        setError('Password must contain at least two different character types (e.g., uppercase + number, or lowercase + symbol).');
      }
      return;
    }

    // ---- Uniqueness checks ----
    const usernameTaken = mockUsers.some(
      (u) => u.username.toLowerCase() === form.username.toLowerCase()
    );
    if (usernameTaken) {
      setError('Username is already taken.');
      return;
    }

    const emailTaken = mockUsers.some(
      (u) => u.email.toLowerCase() === form.email.toLowerCase()
    );
    if (emailTaken) {
      setError('Email is already registered.');
      return;
    }

    // ---- Success ----
    const newUser = {
      id: mockUsers.length + 1,
      username: form.username,
      email: form.email,
      full_name: form.username,
      bio: '',
      avatar_url: `https://i.pravatar.cc/150?img=${mockUsers.length + 1}`,
      website: '',
      github: '',
      twitter: '',
      linkedin: '',
      role: 'student',
      status: 'active',
      last_login: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    mockUsers.push(newUser);
    navigate('/login');
  }

  return (
    <>
      <style>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          scrollbar-width: none;
          -ms-overflow-style: none;
        }
      `}</style>

      <div className="h-screen bg-white flex flex-col items-center justify-center overflow-hidden font-[Inter,sans-serif] py-4">
        <p className="text-[#630ed4] font-black text-3xl tracking-tight mb-4">MENTIX-Hub</p>

        <div className="w-full max-w-[560px] bg-white border border-[rgba(204,195,216,0.3)] rounded-[24px] shadow-[0px_6px_28px_rgba(0,0,0,0.05)] px-10 py-8 overflow-y-auto max-h-[calc(100vh-120px)] scrollbar-hide">
          <div className="text-center mb-6">
            <h1 className="text-[#191c1d] font-semibold text-4xl tracking-tight mb-1">
              Create Account
            </h1>
            <p className="text-[#4a4455] text-sm">Join the student and mentor community.</p>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {/* Username */}
            <div>
              <label className="text-[#4a4455] font-medium text-xs block mb-1">Username *</label>
              <div className="relative">
                <FiUser size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#7b7487]" />
                <input
                  type="text"
                  value={form.username}
                  onChange={(e) => update('username', e.target.value)}
                  placeholder="e.g. academic_pioneer"
                  className="w-full border border-[#ccc3d8] rounded-[12px] pl-9 pr-4 py-3 text-sm text-gray-700 placeholder:text-[#7b7487] outline-none focus:border-[#630ed4] focus:ring-1 focus:ring-[#630ed4] transition-all"
                  required
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="text-[#4a4455] font-medium text-xs block mb-1">Email Address *</label>
              <div className="relative">
                <FiMail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#7b7487]" />
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => update('email', e.target.value)}
                  placeholder="you@university.edu"
                  className="w-full border border-[#ccc3d8] rounded-[12px] pl-9 pr-4 py-3 text-sm text-gray-700 placeholder:text-[#7b7487] outline-none focus:border-[#630ed4] focus:ring-1 focus:ring-[#630ed4] transition-all"
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="text-[#4a4455] font-medium text-xs block mb-1">Password *</label>
              <div className="relative">
                <FiLock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#7b7487]" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={form.password}
                  onChange={(e) => update('password', e.target.value)}
                  placeholder="••••••••"
                  className="w-full border border-[#ccc3d8] rounded-[12px] pl-9 pr-10 py-3 text-sm text-gray-700 placeholder:text-[#7b7487] outline-none focus:border-[#630ed4] focus:ring-1 focus:ring-[#630ed4] transition-all"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#7b7487] hover:text-[#630ed4] transition-colors"
                >
                  {showPassword ? <FiEyeOff size={15} /> : <FiEye size={15} />}
                </button>
              </div>

              {/* Password strength feedback */}
              {form.password && (
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
              <label className="text-[#4a4455] font-medium text-xs block mb-1">Confirm Password *</label>
              <div className="relative">
                <FiShield size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#7b7487]" />
                <input
                  type="password"
                  value={form.confirmPassword}
                  onChange={(e) => update('confirmPassword', e.target.value)}
                  placeholder="••••••••"
                  className="w-full border border-[#ccc3d8] rounded-[12px] pl-9 pr-4 py-3 text-sm text-gray-700 placeholder:text-[#7b7487] outline-none focus:border-[#630ed4] focus:ring-1 focus:ring-[#630ed4] transition-all"
                  required
                />
              </div>
            </div>

            {/* Year + Major – now required */}
            <div className="flex gap-3">
              <div className="flex-1">
                <label className="text-[#4a4455] font-medium text-xs block mb-1">Year *</label>
                <input
                  type="text"
                  value={form.year}
                  onChange={(e) => update('year', e.target.value)}
                  placeholder="e.g., 1st year"
                  className="w-full border border-[#ccc3d8] rounded-[12px] px-3 py-3 text-xs text-gray-700 placeholder:text-[#7b7487] outline-none focus:border-[#630ed4] focus:ring-1 focus:ring-[#630ed4] transition-all"
                  required
                />
              </div>
              <div className="flex-1">
                <label className="text-[#4a4455] font-medium text-xs block mb-1">Major *</label>
                <input
                  type="text"
                  value={form.major}
                  onChange={(e) => update('major', e.target.value)}
                  placeholder="e.g., Computer Science"
                  className="w-full border border-[#ccc3d8] rounded-[12px] px-3 py-3 text-xs text-gray-700 placeholder:text-[#7b7487] outline-none focus:border-[#630ed4] focus:ring-1 focus:ring-[#630ed4] transition-all"
                  required
                />
              </div>
            </div>

            {/* Terms */}
            <label className="flex items-start gap-2.5 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={form.agreed}
                onChange={(e) => update('agreed', e.target.checked)}
                className="mt-0.5 w-4 h-4 rounded border-[#ccc3d8] accent-[#630ed4] cursor-pointer shrink-0"
              />
              <span className="text-[#4a4455] text-xs leading-relaxed">
                I agree to the{' '}
                <span className="text-[#630ed4] font-medium cursor-pointer hover:underline">
                  Terms and Conditions
                </span>{' '}
                and{' '}
                <span className="text-[#630ed4] font-medium cursor-pointer hover:underline">
                  Privacy Policy
                </span>
                . <span className="text-red-500">*</span>
              </span>
            </label>

            {/* Error message */}
            {error && (
              <div className="text-red-500 text-sm font-medium -mt-1">{error}</div>
            )}

            <button
              type="submit"
              className="w-full bg-[#7c3aed] text-white font-semibold text-base py-3.5 rounded-[12px] hover:bg-[#6d28d9] transition-colors flex items-center justify-center gap-2"
            >
              Create Account
              <FiArrowRight size={18} />
            </button>

            <p className="text-center text-[#4a4455] font-semibold text-sm">
              Already have an account?{' '}
              <Link to="/login" className="text-[#630ed4] font-bold hover:underline">
                Login
              </Link>
            </p>
          </form>
        </div>

        <p className="mt-4 text-[#ccc3d8] text-xs">
          © 2024 MENTIX-Hub. Empowering Academic Excellence.
        </p>
      </div>
    </>
  );
}