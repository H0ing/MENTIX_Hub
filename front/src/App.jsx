import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ToastProvider }  from './components/shared/Toast';
import { AuthProvider }   from './contexts/AuthContext';   // admin JWT auth
import { LoadingProvider } from './components/shared/GlobalLoading';
import AdminRoutes  from './routes/AdminRoutes';
import ClientRoutes from './routes/ClientRoutes';          // owns its own client auth

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>     {/* admin auth — wraps admin routes only */}
        <ToastProvider>
          <LoadingProvider>
            <Routes>
              <Route path="/admin/*" element={<AdminRoutes />} />
              <Route path="/*"       element={<ClientRoutes />} />
            </Routes>
          </LoadingProvider>
        </ToastProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
