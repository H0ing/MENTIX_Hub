import { useState } from 'react';
import { useNavigate } from 'react-router';
import { FiSearch, FiChevronDown, FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import MentorCard from '../../components/user/MentorCard.jsx';
import { mockUsers } from '../../data/mockdata.js';

const MENTORS_PER_PAGE = 8;

const mentors = mockUsers.filter((u) => u.role === 'mentor');

export default function MentorProjects() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('latest');
  const [page, setPage] = useState(1);

  const filtered = mentors.filter((m) =>
    m.full_name.toLowerCase().includes(search.toLowerCase()) ||
    (m.bio || '').toLowerCase().includes(search.toLowerCase())
  );

  const sorted = [...filtered].sort((a, b) => {
    if (sortBy === 'latest') return new Date(b.created_at) - new Date(a.created_at);
    return a.full_name.localeCompare(b.full_name);
  });

  const totalPages = Math.ceil(sorted.length / MENTORS_PER_PAGE);
  const paginated = sorted.slice((page - 1) * MENTORS_PER_PAGE, page * MENTORS_PER_PAGE);

  function handleRequest(mentor) {
    navigate('/request-mentorship', { state: { mentor } });
  }

  return (
    <div className="px-10 py-10">
      {/* Header row */}
      <div className="flex items-end justify-between mb-8">
        <h1 className="text-[33px] font-bold text-[#151c27]">Expert Mentors</h1>

        <div className="flex items-center gap-4">
          {/* Search */}
          <div className="flex-1 min-w-[400px] bg-[#f0f3ff] border border-[#cfc2d4] rounded-xl px-5 py-4 flex items-center gap-3 shadow-sm">
            <FiSearch size={20} className="text-[#4c4452] shrink-0" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, expertise, or research area..."
              className="bg-transparent outline-none text-[#6b7280] text-[17px] w-full placeholder:text-[#6b7280]"
            />
          </div>

          {/* Sort by */}
          <div className="flex flex-col gap-1 ">
            
            <div className="bg-[#f0f3ff] h-14 border border-[#cfc2d4] rounded-xl px-4 py-3 flex items-center gap-3 min-w-[160px] relative">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-transparent outline-none text-[#151c27] text-[15px] w-full appearance-none cursor-pointer pr-6"
              >
                <option value="latest">Latest</option>
                <option value="name">Name</option>
              </select>
              <FiChevronDown size={18} className="text-[#6b7280] absolute right-4 pointer-events-none" />
            </div>
          </div>
        </div>
      </div>

      {/* Mentor grid */}
      {paginated.length === 0 ? (
        <div className="text-center py-24 text-gray-400 text-lg">
          No mentors found matching your search.
        </div>
      ) : (
        <div className="grid grid-cols-4 gap-6 mb-10">
          {paginated.map((mentor) => (
            <MentorCard
              key={mentor.id}
              mentor={mentor}
              onRequest={handleRequest}
            />
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-40 transition-colors"
          >
            <FiChevronLeft size={18} />
          </button>

          {Array.from({ length: totalPages }, (_, i) => i + 1).map((num) => (
            <button
              key={num}
              onClick={() => setPage(num)}
              className={`w-9 h-9 rounded-lg text-sm font-medium transition-colors ${
                num === page
                  ? 'bg-[#630ed4] text-white'
                  : 'border border-gray-200 text-gray-600 hover:bg-gray-50'
              }`}
            >
              {num}
            </button>
          ))}

          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-40 transition-colors"
          >
            <FiChevronRight size={18} />
          </button>
        </div>
      )}
    </div>
  );
}