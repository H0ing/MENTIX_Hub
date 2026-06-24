import { Routes, Route, Navigate } from 'react-router-dom';
import AdminLayout    from '../layouts/admin/AdminLayout';
import LoginPage      from '../pages/admin/LoginPage';
import ModerationPage from '../pages/admin/ModerationPage';
import UsersPage      from '../pages/admin/UsersPage';
import BackupPage     from '../pages/admin/BackupPage';
import DatabasePage   from '../pages/admin/DatabasePage';
import AuditLogsPage  from '../pages/admin/AuditLogsPage';
import SettingsPage   from '../pages/admin/SettingsPage';
import SentFormsPage  from '../pages/admin/SentFormsPage';
import ProfilePage    from '../pages/admin/ProfilePage';
import RequireAdmin   from './RequireAdmin';
import RequirePage    from './RequirePage';

export default function AdminRoutes() {
  return (
    <Routes>
      {/* Public */}
      <Route path="login" element={<LoginPage />} />

      {/* All protected pages — RequireAdmin checks auth, RequirePage checks role per route */}
      <Route element={<RequireAdmin />}>
        <Route element={<AdminLayout />}>
          <Route index element={<Navigate to="moderation" replace />} />

          <Route path="moderation" element={
            <RequirePage permKey="moderation"><ModerationPage /></RequirePage>
          } />
          <Route path="users" element={
            <RequirePage permKey="users"><UsersPage /></RequirePage>
          } />
          <Route path="backup" element={
            <RequirePage permKey="backup"><BackupPage /></RequirePage>
          } />
          <Route path="database" element={
            <RequirePage permKey="database"><DatabasePage /></RequirePage>
          } />
          <Route path="audit-logs" element={
            <RequirePage permKey="audit-logs"><AuditLogsPage /></RequirePage>
          } />
          <Route path="settings" element={
            <RequirePage permKey="settings"><SettingsPage /></RequirePage>
          } />
          <Route path="sent-forms" element={
            <RequirePage permKey="sent-forms"><SentFormsPage /></RequirePage>
          } />
          <Route path="profile" element={<ProfilePage />} />

          {/* Fallback: redirect to the first page the role can access */}
          <Route path="*" element={<Navigate to="moderation" replace />} />
        </Route>
      </Route>
    </Routes>
  );
}
