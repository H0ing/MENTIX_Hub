import { can } from '../services/authService';
import LockedPanel from '../components/shared/LockedPanel';

/**
 * RequirePage — wraps a single page component and shows LockedPanel
 * instead of the real content when the logged-in role lacks permission.
 *
 * Usage (in AdminRoutes.jsx):
 *   <RequirePage permKey="settings"><SettingsPage /></RequirePage>
 */
export default function RequirePage({ permKey, children }) {
  if (!can(permKey)) {
    return <LockedPanel message={`Your role does not have access to this page.`} />;
  }
  return children;
}
