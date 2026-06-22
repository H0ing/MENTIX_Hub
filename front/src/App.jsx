import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { createContext, useState, useContext } from 'react';
import MainLayout from './layout/MainLayout';

// ---------- Public (Auth) Pages ----------
import Login from './pages/user/Login';
import SignUp from './pages/user/SignUp';
import ForgotPassword from './pages/user/ForgotPassword';
import OtpReset from './pages/user/OtpReset';
import ResetPassword from './pages/user/ResetPassword';

// ---------- Protected Routes ----------
import UserRoutes from './routes/UserRoutes';
import WebsiteGuideline from './pages/user/WebsiteGuideline';

// ---------- Auth helpers (from your storage) ----------
import { getCurrentLogin, setCurrentLogin, removeCurrentLogin } from './utils/storage';

// ---------- Auth Context ----------
const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [isAuthenticated, setIsAuthenticated] = useState(() => !!getCurrentLogin());

  const login = (userData) => {
    setCurrentLogin(userData);
    setIsAuthenticated(true);
  };

  const logout = () => {
    removeCurrentLogin();
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
}

// ---------- Protected Route Wrapper ----------
function ProtectedRoute({ children }) {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? children : <Navigate to="/login" replace />;
}

// ---------- Main App ----------
function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* ========== PUBLIC ROUTES (no navbar/footer) ========== */}
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/otp-reset" element={<OtpReset />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/guidelines" element={<WebsiteGuideline />} />

          {/* ========== PROTECTED ROUTES (with navbar/footer) ========== */}
          <Route
            element={
              <ProtectedRoute>
                <MainLayout />
              </ProtectedRoute>
            }
          >
            {UserRoutes}
          </Route>

          {/* ========== CATCH‑ALL ========== */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;