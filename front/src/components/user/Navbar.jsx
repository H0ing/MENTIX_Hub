import { Link, useLocation, useNavigate } from 'react-router';
import { useState, useEffect, useRef, useCallback } from 'react';
import { FiSearch, FiMail, FiFlag } from 'react-icons/fi';
import { getProjects } from '../../api/projectApi';
import { useAuth } from '../../routes/ClientRoutes';
import useNotificationCount from '../../hooks/useNotificationCount';
import { getProjectCover } from '../../utils/projectCover';

const navLinks = [
  { label: 'Home', path: '/' },
  { label: 'Upload', path: '/upload' },
  { label: 'Mentors Profile', path: '/mentors' },
];

export default function Navbar() {
  const { currentUser, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const { totalPending, cleared, markSeen } = useNotificationCount();
  const showBadge = totalPending > 0 && !cleared;

  const initials = currentUser?.full_name
    ? currentUser.full_name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
    : '?';

  const [showMenu, setShowMenu] = useState(false);
  const [menuPos, setMenuPos] = useState({ top: 0, right: 0 });
  const [searchTerm, setSearchTerm] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const menuRef = useRef(null);
  const menuBtnRef = useRef(null);
  const searchRef = useRef(null);
  const debounceRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setShowMenu(false);
      }
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setShowSuggestions(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearch = useCallback((value) => {
    setSearchTerm(value);

    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (!value.trim()) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    debounceRef.current = setTimeout(async () => {
      try {
        const { data } = await getProjects({ search: value, limit: 100 });
        setSuggestions(data.data || []);
        setShowSuggestions(true);
      } catch {
        setSuggestions([]);
      }
    }, 300);
  }, []);

  function handleSelectProject(project) {
    setSearchTerm('');
    setSuggestions([]);
    setShowSuggestions(false);
    navigate(`/project/${project.id}`);
  }

  return (
    <nav className="bg-[#f8f9fa] px-6 h-14 flex items-center justify-between border-b border-gray-100 overflow-visible relative ">
      {/* Logo + nav links */}
      <div className="flex items-center gap-8">
        <span className="text-[#630ed4] font-black text-xl font-inter">
          MENTIX-Hub
        </span>

        <div className="flex items-center gap-6">
          {navLinks.map((link) => {
            const isActive = location.pathname === link.path;

            return (
              <Link
                key={link.path}
                to={link.path}
                className={`font-bold text-sm transition-colors ${
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
      <div className="flex items-center gap-3">
        <div className="relative" ref={searchRef}>
          <div className="flex items-center bg-[#d9d9d9] rounded-lg px-3 py-1.5 gap-2 w-48">
            <FiSearch
              size={14}
              className="text-[#44454b] shrink-0"
            />

            <input
              type="text"
              value={searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
              placeholder="Search projects...."
              className="bg-transparent outline-none text-[#404143] font-light text-xs w-full placeholder:text-[#404143]"
            />
          </div>

          <style>{`
            .scrollbar-hide::-webkit-scrollbar { display: none; }
            .scrollbar-hide { scrollbar-width: none; -ms-overflow-style: none; }
          `}</style>

          {showSuggestions && suggestions.length > 0 && (
            <div className="absolute right-0 mt-1 w-80 bg-white border border-gray-200 rounded-xl shadow-lg z-50 max-h-72 overflow-y-auto scrollbar-hide">
              <div className="py-1">
                {suggestions.map((project) => (
                  <button
                    key={project.id}
                    onClick={() => handleSelectProject(project)}
                    className="w-full text-left px-3 py-2.5 flex items-center gap-3 transition-colors border-l-2 border-transparent hover:border-[#630ed4] hover:bg-gray-50"
                  >
                    <div className="w-14 h-9 rounded-lg bg-[#d9d9d9] overflow-hidden shrink-0">
                      <img src={getProjectCover(project)} alt="" className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <span className="text-[13px] font-semibold text-[#191c1d] truncate block">{project.title}</span>
                      <span className="text-[11px] text-[#4a4455]">{project.full_name || 'Unknown'}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {showSuggestions && searchTerm.trim() && suggestions.length === 0 && (
            <div className="absolute right-0 mt-1 w-80 bg-white border border-gray-200 rounded-xl shadow-lg z-50">
              <div className="flex items-center gap-2 px-3 py-3">
                <FiSearch size={14} className="text-gray-300 shrink-0" />
                <p className="text-xs text-gray-400">No projects found for "<span className="font-medium text-gray-500">{searchTerm}</span>"</p>
              </div>
            </div>
          )}
        </div>

        <button
          onClick={() => navigate('/flag-center')}
          className="relative p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
          title="Flag Center"
        >
          <FiFlag size={18} className="text-gray-600" />
        </button>

        <button
          onClick={() => { markSeen(); navigate('/inbox'); }}
          className="relative p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <FiMail size={18} className="text-gray-600" />
          {showBadge && (
            <span className="absolute -top-0.5 -right-0.5 bg-red-500 text-white text-[10px] font-bold w-4 h-4 flex items-center justify-center rounded-full leading-none">
              {totalPending > 9 ? '9+' : totalPending}
            </span>
          )}
        </button>

        <div ref={menuRef}>
          <button
            ref={menuBtnRef}
            onClick={() => {
              if (!showMenu && menuBtnRef.current) {
                const rect = menuBtnRef.current.getBoundingClientRect();
                setMenuPos({ top: rect.bottom + 8, right: window.innerWidth - rect.right });
              }
              setShowMenu(!showMenu);
            }}
            className="w-9 h-9 rounded-full overflow-hidden bg-[#d9d9d9] shrink-0"
          >
            {currentUser?.avatar_url ? (
              <img src={currentUser.avatar_url} alt="" className="w-full h-full object-cover" />
            ) : (
              <span className="text-xs font-bold text-gray-500">{initials}</span>
            )}
          </button>

          {showMenu && (
            <div
              style={{ position: 'fixed', top: menuPos.top, right: menuPos.right }}
              className="w-48 bg-white rounded-xl shadow-xl border border-gray-100 z-[999]"
            >
              <div className="p-2 flex flex-col gap-1">
                <button
                  onClick={() => {
                    navigate('/profile');
                    setShowMenu(false);
                  }}
                  className="w-full text-left px-3 py-2 rounded-lg text-[13px] font-medium text-gray-700 hover:bg-purple-50 hover:text-[#630ed4] transition-colors flex items-center gap-2.5"
                >
                  <span className="w-6 h-6 rounded-full bg-purple-100 flex items-center justify-center shrink-0">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#630ed4" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
                    </svg>
                  </span>
                  My Profile
                </button>

                <button
                  onClick={() => {
                    logout();
                    navigate('/login');
                    setShowMenu(false);
                  }}
                  className="w-full text-left px-3 py-2 rounded-lg text-[13px] font-medium text-red-500 hover:bg-red-50 transition-colors flex items-center gap-2.5"
                >
                  <span className="w-6 h-6 rounded-full bg-red-100 flex items-center justify-center shrink-0">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
                    </svg>
                  </span>
                  Logout
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
