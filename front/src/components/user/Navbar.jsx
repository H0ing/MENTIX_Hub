import { Link, useLocation, useNavigate } from 'react-router';
import { useState, useEffect, useRef } from 'react';
import { FiSearch, FiMail } from 'react-icons/fi';
import { mockProjects } from '../../data/mockdata';
import { useAuth } from '../../App';

const navLinks = [
  { label: 'Dashboard', path: '/' },
  { label: 'Upload', path: '/upload' },
  { label: 'Mentors', path: '/mentors' },
];

export default function Navbar() {
  const { logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const [showMenu, setShowMenu] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const menuRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setShowMenu(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearch = (e) => {
    const value = e.target.value;
    setSearchTerm(value);

    const filteredProjects = mockProjects.filter((project) =>
      project.title.toLowerCase().includes(value.toLowerCase())
    );

    console.log('Search Result:', filteredProjects);
  };

  return (
    <nav className="bg-[#f8f9fa] px-8 h-[80px] flex items-center justify-between border-b border-gray-100">
      {/* Logo + nav links */}
      <div className="flex items-center gap-12">
        <span className="text-[#630ed4] font-black text-3xl font-inter">
          MENTIX-Hub
        </span>

        <div className="flex items-center gap-8">
          {navLinks.map((link) => {
            const isActive = location.pathname === link.path;

            return (
              <Link
                key={link.path}
                to={link.path}
                className={`font-bold text-lg transition-colors ${
                  isActive
                    ? 'text-[#6214d2]'
                    : 'text-[#584e5c] hover:text-[#6214d2]'
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </div>
      </div>

      {/* Search + mail + avatar */}
      <div className="flex items-center gap-4">
        <div className="flex items-center bg-[#d9d9d9] rounded-xl px-4 py-2 gap-2 w-56">
          <FiSearch
            size={18}
            className="text-[#44454b] shrink-0"
          />

          <input
            type="text"
            value={searchTerm}
            onChange={handleSearch}
            placeholder="Search projects...."
            className="bg-transparent outline-none text-[#404143] font-light text-sm w-full placeholder:text-[#404143]"
          />
        </div>

        <button
          onClick={() => navigate('/inbox')}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <FiMail size={24} className="text-gray-600" />
        </button>

        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="bg-[#d9d9d9] rounded-full w-12 h-12 shrink-0"
          />

          {showMenu && (
            <div className="absolute right-0 mt-2 w-40 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
              <button
                onClick={() => {
                  navigate('/profile');
                  setShowMenu(false);
                }}
                className="w-full text-left px-4 py-3 hover:bg-gray-100 text-sm"
              >
                My Profile
              </button>

              <button
                onClick={() => {
                  logout();
                  navigate('/login');
                  setShowMenu(false);
                }}
                className="w-full text-left px-4 py-3 hover:bg-gray-100 text-sm text-red-500"
              >
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}