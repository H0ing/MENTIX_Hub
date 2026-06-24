import { Outlet } from 'react-router-dom';
import Sidebar from '../../components/admin/Sidebar';
import TopBar  from '../../components/admin/TopBar';

export default function AdminLayout() {
  return (
    <div className="flex min-h-screen bg-[#F7F5FB] text-[#1A1A2E]" style={{ fontFamily: "'Inter',-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif" }}>
      <Sidebar />
      {/* flex-1 without min-w-0 so the column doesn't clip dropdowns */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <TopBar />
        <main className="flex-1 px-8 py-7 overflow-y-auto overflow-x-visible">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
