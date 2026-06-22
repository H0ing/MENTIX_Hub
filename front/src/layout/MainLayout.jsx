// MainLayout.jsx
import { Outlet } from 'react-router-dom';
import Navbar from '../components/user/Navbar';
import Footer from '../components/user/Footer';

const MainLayout = () => {
  return (
    <div>
      {/* Sticky navbar - stays at top */}
      <div className="sticky top-0 z-20 bg-white shadow-sm">
        <Navbar />
      </div>
      <main>
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};

export default MainLayout;