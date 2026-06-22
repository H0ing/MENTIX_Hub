import { Routes, Route, Navigate } from 'react-router-dom';
import { createContext, useContext, useState } from 'react';
import MainLayout from '../layout/MainLayout';

// Public pages
import Login           from '../pages/user/Login';
import SignUp          from '../pages/user/SignUp';
import ForgotPassword  from '../pages/user/ForgotPassword';
import OtpReset        from '../pages/user/OtpReset';
import ResetPassword   from '../pages/user/ResetPassword';
import WebsiteGuideline from '../pages/user/WebsiteGuideline';

// Protected page route definitions
import UserRoutes from './UserRoutes';

// Auth helpers
import { getCurrentLogin, setCurrentLogin, removeCurrentLogin } from '../utils/storage';

// ── Client-side Auth Context ─────────────────────────────────────────────────
const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(() => getCurrentLogin());

  function login(userData) {
    setCurrentLogin(userData);
    setCurrentUser(userData);
  }

  function logout() {
    removeCurrentLogin();
    setCurrentUser(null);
  }

  return (
    <AuthContext.Provider value={{ currentUser, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}

// ── Route guard ───────────────────────────────────────────────────────────────
function ProtectedRoute({ children }) {
  const { currentUser } = useAuth();
  return currentUser ? children : <Navigate to="/login" replace />;
}

// ── Client entry point ────────────────────────────────────────────────────────
// AuthProvider is mounted here — wraps all client routes
export default function ClientRoutes() {
  return (
    <AuthProvider>
      <Routes>
        {/* Public */}
        <Route path="/login"           element={<Login />} />
        <Route path="/signup"          element={<SignUp />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/otp-reset"       element={<OtpReset />} />
        <Route path="/reset-password"  element={<ResetPassword />} />
        <Route path="/guidelines"      element={<WebsiteGuideline />} />

        {/* Protected — with Navbar + Footer via MainLayout */}
        <Route element={<ProtectedRoute><MainLayout /></ProtectedRoute>}>
          {UserRoutes}
        </Route>

        {/* Catch-all */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </AuthProvider>
  );
}
