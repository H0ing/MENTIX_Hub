import { useState, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router';
import { FiEdit2, FiGithub, FiTwitter, FiX, FiCamera, FiUsers, FiUser } from 'react-icons/fi';
import UploadProjectCard from '../../components/user/UploadProjectCard';
import FavouriteProjectCard from '../../components/user/FavouriteProjectCard';
import { mockUsers, mockProjects, mockFavorites } from '../../data/mockdata';
import { getCurrentLogin } from '../../utils/storage';

// ─── helpers ────────────────────────────────────────────────────────────────

function getUser() {
  try {
    const raw = localStorage.getItem('current_login');
    if (raw) return JSON.parse(raw);
  } catch {
    console.error("failed")
  }
  return mockUsers.find((u) => u.id === 2) || mockUsers[0];
}

function saveUser(user) {
  localStorage.setItem('current_login', JSON.stringify(user));
}

// ─── Edit Profile Modal ──────────────────────────────────────────────────────

function EditProfileModal({ user, onClose, onSave }) {
  const [bio, setBio] = useState(user.bio || '');
  const [github, setGithub] = useState(user.github || '');
  const [twitter, setTwitter] = useState(user.twitter || '');
  const [avatarUrl, setAvatarUrl] = useState(user.avatar_url || '');
  const [avatarPreview, setAvatarPreview] = useState(user.avatar_url || '');
  const fileRef = useRef(null);

  function handleImageChange(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const result = ev.target?.result;
      if (typeof result === 'string') {
        setAvatarPreview(result);
        setAvatarUrl(result);
      }
    };
    reader.readAsDataURL(file);
  }

  function handleSave() {
    onSave({ ...user, bio, github, twitter, avatar_url: avatarUrl });
    onClose();
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-[20px] shadow-xl w-full max-w-[520px] p-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-[#191c1d]">Edit Profile</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <FiX size={22} />
          </button>
        </div>

        <div className="flex justify-center mb-6">
          <div className="relative">
            <div className="w-24 h-24 rounded-full overflow-hidden bg-[#d9d9d9]">
              {avatarPreview ? (
                <img
                  src={avatarPreview}
                  alt="Avatar"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400 text-3xl font-bold">
                  {user.full_name?.charAt(0) || '?'}
                </div>
              )}
            </div>
            <button
              onClick={() => fileRef.current?.click()}
              className="absolute bottom-0 right-0 bg-[#630ed4] text-white rounded-full p-1.5 hover:bg-[#500088] transition-colors"
            >
              <FiCamera size={14} />
            </button>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleImageChange}
            />
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <div>
            <label className="text-[#4a4455] font-medium text-sm block mb-1.5">Bio</label>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              rows={3}
              placeholder="Tell us about yourself..."
              className="w-full border border-[#ccc3d8] rounded-xl px-4 py-3 text-base text-gray-700 outline-none focus:border-[#630ed4] focus:ring-1 focus:ring-[#630ed4] resize-none transition-all"
            />
          </div>

          <div>
            <label className="text-[#4a4455] font-medium text-sm block mb-1.5">GitHub Username</label>
            <div className="relative">
              <FiGithub size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#7b7487]" />
              <input
                type="text"
                value={github}
                onChange={(e) => setGithub(e.target.value)}
                placeholder="e.g. jane-chen"
                className="w-full border border-[#ccc3d8] rounded-xl pl-9 pr-4 py-3 text-base text-gray-700 outline-none focus:border-[#630ed4] focus:ring-1 focus:ring-[#630ed4] transition-all"
              />
            </div>
          </div>

          <div>
            <label className="text-[#4a4455] font-medium text-sm block mb-1.5">Twitter Handle</label>
            <div className="relative">
              <FiTwitter size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#7b7487]" />
              <input
                type="text"
                value={twitter}
                onChange={(e) => setTwitter(e.target.value)}
                placeholder="e.g. janecodes"
                className="w-full border border-[#ccc3d8] rounded-xl pl-9 pr-4 py-3 text-base text-gray-700 outline-none focus:border-[#630ed4] focus:ring-1 focus:ring-[#630ed4] transition-all"
              />
            </div>
          </div>

          <div className="flex gap-3 mt-2">
            <button
              onClick={onClose}
              className="flex-1 border border-[#ccc3d8] text-[#4a4455] font-semibold py-3 rounded-xl hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="flex-1 bg-[#630ed4] text-white font-semibold py-3 rounded-xl hover:bg-[#500088] transition-colors"
            >
              Save
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Profile Page ────────────────────────────────────────────────────────────

export default function Profile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const currentUser = getCurrentLogin();

  const profileUser = id
    ? mockUsers.find((u) => u.id === Number(id))
    : (currentUser || mockUsers.find((u) => u.id === 2));

  const isOwnProfile = !id || (currentUser && currentUser.id === Number(id));

  const [user, setUser] = useState(profileUser);
  const [activeTab, setActiveTab] = useState('uploaded');
  const [editOpen, setEditOpen] = useState(false);

  const [uploadedProjects, setUploadedProjects] = useState(() =>
    mockProjects.filter((p) => p.author_id === (id ? Number(id) : user.id))
  );

  const [favouriteIds, setFavouriteIds] = useState(() =>
    mockFavorites.filter((f) => f.user_id === user.id).map((f) => f.project_id)
  );
  const favouriteProjects = mockProjects.filter((p) => favouriteIds.includes(p.id));

  function handleSaveProfile(updated) {
    setUser(updated);
    saveUser(updated);
  }

  function handleDeleteProject(projectId) {
    setUploadedProjects((prev) => prev.filter((p) => p.id !== projectId));
  }

  const displayProjects = uploadedProjects;

  function handleRemoveFavourite(projectId) {
    setFavouriteIds((prev) => prev.filter((id) => id !== projectId));
  }

  return (
    <>
      <div className="bg-[#fcfcfc] min-h-screen py-8 px-8 font-[Inter,sans-serif]">
        {/* Profile card */}
        <div className="border border-[#bdbdbd] rounded-[10px] bg-white p-6 flex items-start gap-8 mb-6">
          <div className="w-[180px] h-[180px] rounded-[8px] overflow-hidden bg-[#d9d9d9] shrink-0">
            {user.avatar_url ? (
              <img
                src={user.avatar_url}
                alt={user.full_name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-5xl font-bold text-gray-400">
                {user.full_name?.charAt(0) || '?'}
              </div>
            )}
          </div>

          <div className="flex-1 pt-2">
            <h1 className="font-semibold text-[38px] text-black leading-tight mb-1">
              {user.full_name}
            </h1>
            <p className="text-[20px] text-black mb-2 capitalize">
              {user.role} · {user.status}
            </p>
            <p className="text-[20px] text-black mb-4">
              {user.bio || 'No bio yet.'}
            </p>

            <div className="flex gap-4">
              {user.github && (
                <a
                  href={`https://github.com/${user.github}`}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1.5 text-[#4a4455] hover:text-[#630ed4] transition-colors text-sm font-medium"
                >
                  <FiGithub size={16} /> {user.github}
                </a>
              )}
              {user.twitter && (
                <a
                  href={`https://twitter.com/${user.twitter}`}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1.5 text-[#4a4455] hover:text-[#1da1f2] transition-colors text-sm font-medium"
                >
                  <FiTwitter size={16} /> @{user.twitter}
                </a>
              )}
            </div>
          </div>

          <div className="flex flex-col gap-2 shrink-0">
            {isOwnProfile ? (
              <button
                onClick={() => setEditOpen(true)}
                className="flex items-center gap-2 bg-[#dfdfdf] hover:bg-[#d0d0d0] text-[#630ed4] font-medium text-[20px] px-5 py-2.5 rounded-[10px] transition-colors"
              >
                <FiEdit2 size={18} />
                Edit Profile
              </button>
            ) : (
              <>
                <Link
                  to="/request-collaboration"
                  className="flex items-center gap-2 bg-[#008321] text-white font-semibold text-[18px] px-5 py-2.5 rounded-[10px] hover:bg-[#006919] transition-colors"
                >
                  <FiUsers size={18} />
                  Request Collaboration
                </Link>
                {user.role === 'mentor' && (
                  <button
                    onClick={() => navigate('/request-mentorship', { state: { mentor: user } })}
                    className="flex items-center gap-2 bg-[#1600c0] text-white font-semibold text-[18px] px-5 py-2.5 rounded-[10px] hover:bg-[#1200a0] transition-colors"
                  >
                    <FiUser size={18} />
                    Request Mentor
                  </button>
                )}
              </>
            )}
          </div>
        </div>

        {/* Tabs */}
        <div className="relative mb-6">
          <div className="flex gap-8 border-b border-[#919191]">
            <button
              onClick={() => setActiveTab('uploaded')}
              className={`pb-3 text-[20px] font-semibold transition-colors relative ${
                activeTab === 'uploaded' ? 'text-[#630ed4]' : 'text-black hover:text-[#630ed4]'
              }`}
            >
              Uploaded Projects
              {activeTab === 'uploaded' && (
                <span className="absolute bottom-[-2px] left-0 right-0 h-[4px] bg-[#630ed4] rounded-full" />
              )}
            </button>

            {isOwnProfile && (
              <button
                onClick={() => setActiveTab('favourites')}
                className={`pb-3 text-[20px] font-semibold transition-colors relative ${
                  activeTab === 'favourites' ? 'text-[#630ed4]' : 'text-black hover:text-[#630ed4]'
                }`}
              >
                Saved Favorites
                {activeTab === 'favourites' && (
                  <span className="absolute bottom-[-2px] left-0 right-0 h-[4px] bg-[#630ed4] rounded-full" />
                )}
              </button>
            )}
          </div>
        </div>

        {/* Tab content */}
        {activeTab === 'uploaded' && (
          <>
            {displayProjects.length === 0 ? (
              <div className="text-center py-20 text-gray-400 text-lg">
                No uploaded projects yet.
              </div>
            ) : (
              <div className="grid grid-cols-3 gap-6">
                {displayProjects.map((project) => (
                  <UploadProjectCard
                    key={project.id}
                    project={project}
                    onDelete={isOwnProfile ? handleDeleteProject : undefined}
                    showFavorite={!isOwnProfile}
                  />
                ))}
              </div>
            )}
          </>
        )}

        {isOwnProfile && activeTab === 'favourites' && (
          <>
            {favouriteProjects.length === 0 ? (
              <div className="text-center py-20 text-gray-400 text-lg">
                No saved favorites yet.
              </div>
            ) : (
              <div className="grid grid-cols-3 gap-6">
                {favouriteProjects.map((project) => (
                  <FavouriteProjectCard
                    key={project.id}
                    project={project}
                    onRemove={handleRemoveFavourite}
                  />
                ))}
              </div>
            )}
          </>
        )}
      </div>

      {editOpen && (
        <EditProfileModal
          user={user}
          onClose={() => setEditOpen(false)}
          onSave={handleSaveProfile}
        />
      )}
    </>
  );
}
