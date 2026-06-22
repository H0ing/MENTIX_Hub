import { Outlet } from 'react-router-dom';
import Sidebar from '../../components/admin/Sidebar';
import TopBar  from '../../components/admin/TopBar';

export default function AdminLayout() {
  return (
    <div className="flex min-h-screen bg-[#F7F5FB] text-[#1A1A2E]" style={{ fontFamily: "'Inter',-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif" }}>
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <TopBar />
        <main className="flex-1 px-8 py-7 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
