import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { FiSearch, FiChevronDown, FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import MentorCard from '../../components/user/MentorCard.jsx';
import { listUsers } from '../../api/userApi.js';

const MENTORS_PER_PAGE = 8;

export default function MentorProjects() {
  const navigate = useNavigate();
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('latest');
  const [page, setPage] = useState(1);
  const [mentors, setMentors] = useState([]);
  const [totalItems, setTotalItems] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setSearch(searchInput);
      setPage(1);
    }, 400);
    return () => clearTimeout(timer);
  }, [searchInput]);

  useEffect(() => {
    async function fetchMentors() {
      setLoading(true);
      try {
        const params = {
          role: 'mentor',
          page,
          limit: MENTORS_PER_PAGE,
          search: search || undefined,
          sort: sortBy === 'name' ? 'name' : undefined,
        };
        const { data } = await listUsers(params);
        setMentors(data.data || []);
        setTotalItems(data.pagination?.totalItems || 0);
      } catch (err) {
        console.error('Failed to fetch mentors:', err);
        setMentors([]);
        setTotalItems(0);
      } finally {
        setLoading(false);
      }
    }
    fetchMentors();
  }, [search, sortBy, page]);

  const totalPages = Math.ceil(totalItems / MENTORS_PER_PAGE);

  function handleRequest(mentor) {
    navigate('/request-mentorship', { state: { mentor } });
  }

  return (
    <div className="px-6 py-6 ">
      <div className="flex items-end justify-between mb-6">
        <h1 className="text-[24px] font-bold text-[#151c27]">Expert Mentors</h1>

        <div className="flex items-center gap-3">
          <div className="flex-1 min-w-[320px] bg-[#f0f3ff] border border-[#cfc2d4] rounded-lg px-4 py-2.5 flex items-center gap-2 shadow-sm">
            <FiSearch size={16} className="text-[#4c4452] shrink-0" />
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search by name, expertise, or research area..."
              className="bg-transparent outline-none text-[#6b7280] text-[14px] w-full placeholder:text-[#6b7280]"
            />
          </div>

          <div className="flex flex-col gap-1">
            <div className="bg-[#f0f3ff] h-10 border border-[#cfc2d4] rounded-lg px-3 py-2 flex items-center gap-2 min-w-[140px] relative">
              <select
                value={sortBy}
                onChange={(e) => { setSortBy(e.target.value); setPage(1); }}
                className="bg-transparent outline-none text-[#151c27] text-[13px] w-full appearance-none cursor-pointer pr-5"
              >
                <option value="latest">Latest</option>
                <option value="name">Name</option>
              </select>
              <FiChevronDown size={15} className="text-[#6b7280] absolute right-3 pointer-events-none" />
            </div>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-20">
          <div className="w-8 h-8 border-4 border-[#630ed4] border-t-transparent rounded-full animate-spin" />
        </div>
      ) : mentors.length === 0 ? (
        <div className="text-center py-20 text-gray-400 text-base">
          No mentors found matching your search.
        </div>
      ) : (
        <div className="grid grid-cols-4 gap-4 mb-8">
          {mentors.map((mentor) => (
            <MentorCard
              key={mentor.id}
              mentor={mentor}
              onRequest={handleRequest}
            />
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-1.5">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="p-1.5 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-40 transition-colors"
          >
            <FiChevronLeft size={15} />
          </button>

          {Array.from({ length: totalPages }, (_, i) => i + 1).map((num) => (
            <button
              key={num}
              onClick={() => setPage(num)}
              className={`w-8 h-8 rounded-lg text-xs font-medium transition-colors ${
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
            className="p-1.5 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-40 transition-colors"
          >
            <FiChevronRight size={15} />
          </button>
        </div>
      )}
    </div>
  );
}
