import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router';
import ProjectCard from '../../components/user/ProjectCard.jsx';
import { getProjects, getHeartedProjects } from '../../api/projectApi.js';
import { getFavorites } from '../../api/favoriteApi.js';
import { getCurrentLogin } from '../../utils/storage.js';

const CATEGORIES = ['All Projects', 'Web Development', 'AI & Machine Learning', 'Mobile Development', 'DevOps', 'UI/UX Design', 'Data Science', 'IoT', 'Other'];
const YEARS = ['1st Year', '2nd Year', '3rd Year', '4th Year'];
const ITEMS_PER_PAGE = 10;

const YEAR_MAP = {
  '1st Year': 1,
  '2nd Year': 2,
  '3rd Year': 3,
  '4th Year': 4,
};

function getPageNumbers(currentPage, totalPages) {
  const delta = 2;
  const range = [];
  const rangeWithDots = [];
  let l;

  for (let i = 1; i <= totalPages; i++) {
    if (i === 1 || i === totalPages || (i >= currentPage - delta && i <= currentPage + delta)) {
      range.push(i);
    }
  }

  range.forEach((i) => {
    if (l) {
      if (i - l === 2) {
        rangeWithDots.push(l + 1);
      } else if (i - l !== 1) {
        rangeWithDots.push('...');
      }
    }
    rangeWithDots.push(i);
    l = i;
  });

  return rangeWithDots;
}

export default function Dashboard() {
  const navigate = useNavigate();
  const currentUser = getCurrentLogin();
  const [activeCategory, setActiveCategory] = useState('All Projects');
  const [activeYears, setActiveYears] = useState([]);
  const [sortBy, setSortBy] = useState('newest');
  const [currentPage, setCurrentPage] = useState(1);
  const [projects, setProjects] = useState([]);
  const [totalItems, setTotalItems] = useState(0);
  const [loading, setLoading] = useState(true);
  const [pollCount, setPollCount] = useState(0);
  const [heartedIds, setHeartedIds] = useState(new Set());
  const [favoritedIds, setFavoritedIds] = useState(new Set());

  const gridContainerRef = useRef(null);

  useEffect(() => {
    async function fetchUserState() {
      try {
        const [heartRes, favRes] = await Promise.allSettled([
          getHeartedProjects({ page: 1, limit: 999 }),
          getFavorites({ page: 1, limit: 999 }),
        ]);
        if (heartRes.status === 'fulfilled') {
          const hearted = heartRes.value.data.data || [];
          setHeartedIds(new Set(hearted.map((h) => h.project_id)));
        }
        if (favRes.status === 'fulfilled') {
          const favorites = favRes.value.data.data || [];
          setFavoritedIds(new Set(favorites.map((f) => f.id)));
        }
      } catch { /* not logged in — stay empty */ }
    }
    fetchUserState();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => setPollCount((c) => c + 1), 30000);
    return () => clearInterval(interval);
  }, []);

  function toggleYear(year) {
    setActiveYears((prev) =>
      prev.includes(year) ? prev.filter((y) => y !== year) : [...prev, year]
    );
    setCurrentPage(1);
  }

  useEffect(() => {
    async function fetchProjects() {
      setLoading(true);
      try {
        const params = {
          page: currentPage,
          limit: ITEMS_PER_PAGE,
          sort: sortBy === 'favorite' ? 'favorite' : 'newest',
        };

        if (activeCategory !== 'All Projects') {
          params.category = activeCategory;
        }

        if (activeYears.length > 0) {
          params.year = activeYears.map((y) => YEAR_MAP[y]);
        }

        if (currentUser?.id) {
          params.exclude_author_id = currentUser.id;
        }

        const { data } = await getProjects(params);
        setProjects(data.data || []);
        setTotalItems(data.pagination?.totalItems || 0);
        setTotalItems(data.pagination?.totalItems || 0);
      } catch (err) {
        console.error('Failed to fetch projects:', err);
        setProjects([]);
        setTotalItems(0);
      } finally {
        setLoading(false);
      }
    }
    fetchProjects();
  }, [activeCategory, activeYears, sortBy, currentPage, pollCount]);

  useEffect(() => {
    if (gridContainerRef.current) {
      gridContainerRef.current.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [currentPage]);

  const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);

  return (
    <div className="min-h-screen flex flex-col px-6 py-6">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h1 className="text-[26px] font-semibold text-black leading-tight">Student Showcase</h1>
          <p className="text-[15px] text-black mt-0.5">
            Discover the next generation of academic innovation
          </p>
        </div>

        <div className="flex items-center gap-3 mt-1">
          <div className="flex items-center bg-[#edeeef] rounded-lg p-0.5">
            <button
              onClick={() => { setSortBy('newest'); setCurrentPage(1); }}
              className={`px-4 py-1.5 rounded-md text-xs font-bold transition-colors ${
                sortBy === 'newest'
                  ? 'bg-white text-[#630ed4] shadow-sm'
                  : 'text-[#4a4455] hover:text-[#630ed4]'
              }`}
            >
              Newest
            </button>
            <button
              onClick={() => { setSortBy('favorite'); setCurrentPage(1); }}
              className={`px-4 py-1.5 rounded-md text-xs font-bold transition-colors ${
                sortBy === 'favorite'
                  ? 'bg-white text-[#630ed4] shadow-sm'
                  : 'text-[#4a4455] hover:text-[#630ed4]'
              }`}
            >
              Most Favorite
            </button>
          </div>
        </div>
      </div>

      <div className="flex gap-6 items-start">
        <aside className="w-[180px] shrink-0 sticky top-0 pr-2">
          <div className="mb-4">
            <p className="text-[#65646f] text-[13px] mb-2 font-normal tracking-wide">CATEGORY</p>
            <div className="flex flex-col gap-2">
              {CATEGORIES.map((cat) => {
                const isActive = activeCategory === cat;
                return (
                  <label key={cat} className="flex items-center gap-2.5 cursor-pointer">
                    <div
                      onClick={() => { setActiveCategory(cat); setCurrentPage(1); }}
                      className={`w-5 h-5 rounded flex items-center justify-center shrink-0 border-2 cursor-pointer ${
                        isActive
                          ? 'bg-[#6214d2] border-[#6214d2]'
                          : 'bg-white border-[#cccbd1]'
                      }`}
                    >
                      {isActive && (
                        <svg width="10" height="7" viewBox="0 0 12 9" fill="none">
                          <path
                            d="M1 4L4.5 7.5L11 1"
                            stroke="white"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      )}
                    </div>
                    <span className="text-[#65646f] text-[13px]">{cat}</span>
                  </label>
                );
              })}
            </div>
          </div>

          <div className="mb-4">
            <p className="text-[#65646f] text-[13px] mb-2 font-medium tracking-wide">YEAR / LEVEL</p>
            <div className="flex flex-wrap gap-1.5">
              {YEARS.map((year) => {
                const isActive = activeYears.includes(year);
                return (
                  <button
                    key={year}
                    onClick={() => toggleYear(year)}
                    className={`px-2.5 py-1 rounded-full text-[12px] transition-colors ${
                      isActive ? 'bg-[#dbc0ff] text-black' : 'bg-[#d9d9d9] text-black hover:bg-[#c9c9c9]'
                    }`}
                  >
                    {year}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="bg-[#8a38f5] rounded-[12px] p-4 text-white">
            <p className="text-[17px] font-semibold mb-1.5">Get a project?</p>
            <p className="text-[13px] font-medium leading-snug mb-3">
              Share your research or prototype with the academic community and get feedback.
            </p>
            <button
              onClick={() => navigate('/upload')}
              className="w-full bg-white text-[#630ed4] font-semibold text-[14px] py-2 rounded-lg hover:bg-purple-50 transition-colors"
            >
              Upload Now
            </button>
          </div>
        </aside>

        <div ref={gridContainerRef} className="flex-1 pr-2">
          {loading ? (
            <div className="flex justify-center items-center py-20">
              <div className="w-8 h-8 border-4 border-[#630ed4] border-t-transparent rounded-full animate-spin" />
            </div>
          ) : projects.length === 0 ? (
            <div className="text-center py-16 text-gray-400 text-base">
              No projects found.
            </div>
          ) : (
            <>
              <div className="grid grid-cols-5 gap-4">
                {projects.map((project) => {
                  const author = {
                    full_name: project.full_name,
                    role: project.author_role || 'student',
                    avatar_url: project.avatar_url,
                  };
                  const isOwner = currentUser?.id === project.author_id;
                  return (
                    <ProjectCard
                      key={project.id}
                      project={project}
                      author={author}
                      heartCount={project.heart_count || 0}
                      commentCount={project.comment_count || 0}
                      isHearted={heartedIds.has(project.id)}
                      isFavorited={favoritedIds.has(project.id)}
                      isOwner={isOwner}
                    />
                  );
                })}
              </div>

              {totalPages > 1 && (
                <div className="flex justify-center items-center gap-2 mt-6 pb-4">
                  <button
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium ${
                      currentPage === 1
                        ? 'text-gray-400 cursor-not-allowed'
                        : 'text-[#630ed4] hover:bg-purple-50'
                    }`}
                  >
                    Previous
                  </button>

                  {getPageNumbers(currentPage, totalPages).map((item, index) =>
                    item === '...' ? (
                      <span key={`ellipsis-${index}`} className="px-2 py-1.5 text-gray-500 text-xs">
                        ...
                      </span>
                    ) : (
                      <button
                        key={item}
                        onClick={() => setCurrentPage(item)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium ${
                          currentPage === item
                            ? 'bg-[#630ed4] text-white'
                            : 'text-[#4a4455] hover:bg-gray-100'
                        }`}
                      >
                        {item}
                      </button>
                    )
                  )}

                  <button
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium ${
                      currentPage === totalPages
                        ? 'text-gray-400 cursor-not-allowed'
                        : 'text-[#630ed4] hover:bg-purple-50'
                    }`}
                  >
                    Next
                  </button>
                </div>
              )}

              <p className="text-center text-xs text-gray-500 mt-1 pb-2">
                Showing {(currentPage - 1) * ITEMS_PER_PAGE + 1}&ndash;
                {Math.min(currentPage * ITEMS_PER_PAGE, totalItems)} of {totalItems} projects
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
