import { useState, useEffect, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router';
import ProjectCard from '../../components/user/ProjectCard.jsx';
import {
  mockProjects,
  mockHearts,
  mockComments,
  getUserById,
} from '../../data/mockdata.js';

const CATEGORIES = ['All Projects', 'Web Dev', 'AI & ML', 'IoT', 'Design'];
const YEARS = ['1st Year', '2nd Year', '3rd Year', '4th Year'];

const TAG_MAP = {
  'Web Dev': ['web-dev', 'react', 'javascript', 'node'],
  'AI & ML': ['ai', 'machine-learning', 'python'],
  IoT: ['devops', 'mobile'],
  Design: ['ui-ux'],
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
  const [activeCategory, setActiveCategory] = useState('All Projects');
  const [activeYears, setActiveYears] = useState([]);
  const [sortBy, setSortBy] = useState('newest');
  const [currentPage, setCurrentPage] = useState(1);

  const gridContainerRef = useRef(null);
  const ITEMS_PER_PAGE = 8;

  function toggleYear(year) {
    setActiveYears((prev) =>
      prev.includes(year) ? prev.filter((y) => y !== year) : [...prev, year]
    );
    setCurrentPage(1);
  }

  const filteredProjects = useMemo(() => {
    return mockProjects
      .filter((project) => {
        if (activeCategory === 'All Projects') return true;
        const tags = JSON.parse(project.tags || '[]');
        const allowedTags = TAG_MAP[activeCategory] || [];
        return tags.some((t) => allowedTags.includes(t));
      })
      .sort((a, b) => {
        if (sortBy === 'newest') return new Date(b.created_at) - new Date(a.created_at);
        return (
          mockHearts.filter((h) => h.project_id === b.id).length -
          mockHearts.filter((h) => h.project_id === a.id).length
        );
      });
  }, [activeCategory, sortBy]);

  useEffect(() => {
    setCurrentPage(1);
  }, [filteredProjects.length]);

  const totalPages = Math.ceil(filteredProjects.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const currentProjects = filteredProjects.slice(startIndex, endIndex);

  const handlePageChange = (page) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
  };

  // Scroll to top of grid container on page change
  useEffect(() => {
    if (gridContainerRef.current) {
      gridContainerRef.current.scrollTo({
        top: 0,
        behavior: 'smooth',
      });
    }
  }, [currentPage]);

  const handleCategoryChange = (cat) => {
    setActiveCategory(cat);
    setCurrentPage(1);
  };

  const handleSortChange = (sort) => {
    setSortBy(sort);
    setCurrentPage(1);
  };

  return (
    <div className="h-[calc(100vh-80px)] flex flex-col px-10 py-8">
      {/* Fixed header */}
      <div className="flex-shrink-0">
        <div className="flex items-start justify-between mb-6">
          <div>
            <h1 className="text-[38px] font-semibold text-black leading-tight">Student Showcase</h1>
            <p className="text-[20px] text-black mt-1">
              Discover the next generation of academic innovation
            </p>
          </div>

          <div className="flex items-center gap-3 mt-2">
            <div className="flex items-center bg-[#edeeef] rounded-xl p-1">
              <button
                onClick={() => handleSortChange('newest')}
                className={`px-6 py-2 rounded-lg text-sm font-bold transition-colors ${
                  sortBy === 'newest'
                    ? 'bg-white text-[#630ed4] shadow-sm'
                    : 'text-[#4a4455] hover:text-[#630ed4]'
                }`}
              >
                Newest
              </button>
              <button
                onClick={() => handleSortChange('favorite')}
                className={`px-6 py-2 rounded-lg text-sm font-bold transition-colors ${
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
      </div>

      {/* Main row: sidebar + grid – both independently scrollable */}
      <div className="flex flex-1 gap-8 overflow-hidden">
        {/* ✅ Sidebar scrolls independently */}
        <aside className="w-[210px] shrink-0 h-full overflow-y-auto pr-2 scrollbar-thin">
          <div className="mb-6">
            <p className="text-[#65646f] text-[18px] mb-3 font-normal tracking-wide">CATEGORY</p>
            <div className="flex flex-col gap-3">
              {CATEGORIES.map((cat) => {
                const isActive = activeCategory === cat;
                return (
                  <label key={cat} className="flex items-center gap-3 cursor-pointer">
                    <div
                      onClick={() => handleCategoryChange(cat)}
                      className={`w-6 h-6 rounded flex items-center justify-center shrink-0 border-2 cursor-pointer ${
                        isActive
                          ? 'bg-[#6214d2] border-[#6214d2]'
                          : 'bg-white border-[#cccbd1]'
                      }`}
                    >
                      {isActive && (
                        <svg width="12" height="9" viewBox="0 0 12 9" fill="none">
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
                    <span className="text-[#65646f] text-[15px]">{cat}</span>
                  </label>
                );
              })}
            </div>
          </div>

          <div className="mb-6">
            <p className="text-[#65646f] text-[18px] mb-3 font-medium tracking-wide">YEAR / LEVEL</p>
            <div className="flex flex-wrap gap-2">
              {YEARS.map((year) => {
                const isActive = activeYears.includes(year);
                return (
                  <button
                    key={year}
                    onClick={() => toggleYear(year)}
                    className={`px-3 py-1.5 rounded-full text-[14px] transition-colors ${
                      isActive ? 'bg-[#dbc0ff] text-black' : 'bg-[#d9d9d9] text-black hover:bg-[#c9c9c9]'
                    }`}
                  >
                    {year}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="bg-[#8a38f5] rounded-[15px] p-5 text-white">
            <p className="text-[24px] font-semibold mb-2">Get a project?</p>
            <p className="text-[15px] font-medium leading-snug mb-4">
              Share your research or prototype with the academic community and get feedback.
            </p>
            <button
              onClick={() => navigate('/upload')}
              className="w-full bg-white text-[#630ed4] font-semibold text-[18px] py-2.5 rounded-xl hover:bg-purple-50 transition-colors"
            >
              Upload Now
            </button>
          </div>
        </aside>

        {/* ✅ Grid container scrolls independently */}
        <div
          ref={gridContainerRef}
          className="flex-1 overflow-y-auto pr-2"
          style={{ scrollbarWidth: 'thin' }}
        >
          {filteredProjects.length === 0 ? (
            <div className="text-center py-20 text-gray-400 text-lg">
              No projects found for this category.
            </div>
          ) : (
            <>
              <div className="grid grid-cols-4 gap-6">
                {currentProjects.map((project) => {
                  const author = getUserById(project.author_id);
                  const heartCount = mockHearts.filter((h) => h.project_id === project.id).length;
                  const commentCount = mockComments.filter((c) => c.project_id === project.id).length;
                  return (
                    <ProjectCard
                      key={project.id}
                      project={project}
                      author={author}
                      heartCount={heartCount}
                      commentCount={commentCount}
                    />
                  );
                })}
              </div>

              {totalPages > 1 && (
                <div className="flex justify-center items-center gap-2 mt-10 pb-4">
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className={`px-4 py-2 rounded-lg text-sm font-medium ${
                      currentPage === 1
                        ? 'text-gray-400 cursor-not-allowed'
                        : 'text-[#630ed4] hover:bg-purple-50'
                    }`}
                  >
                    Previous
                  </button>

                  {getPageNumbers(currentPage, totalPages).map((item, index) =>
                    item === '...' ? (
                      <span key={`ellipsis-${index}`} className="px-3 py-2 text-gray-500">
                        …
                      </span>
                    ) : (
                      <button
                        key={item}
                        onClick={() => handlePageChange(item)}
                        className={`px-4 py-2 rounded-lg text-sm font-medium ${
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
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className={`px-4 py-2 rounded-lg text-sm font-medium ${
                      currentPage === totalPages
                        ? 'text-gray-400 cursor-not-allowed'
                        : 'text-[#630ed4] hover:bg-purple-50'
                    }`}
                  >
                    Next
                  </button>
                </div>
              )}

              <p className="text-center text-sm text-gray-500 mt-2 pb-2">
                Showing {startIndex + 1}–{Math.min(endIndex, filteredProjects.length)} of {filteredProjects.length} projects
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}