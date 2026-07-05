import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router';
import { FiEdit2, FiGithub, FiTwitter, FiX, FiCamera, FiUsers, FiUser } from 'react-icons/fi';
import UploadProjectCard from '../../components/user/UploadProjectCard';
import FavouriteProjectCard from '../../components/user/FavouriteProjectCard';
import { getMe, getUserById, updateMe, getUserProjects } from '../../api/userApi';
import { getFavorites, removeFavorite } from '../../api/favoriteApi';
import { deleteProject } from '../../api/projectApi';
import { uploadAvatar } from '../../api/uploadApi';
import { useToast } from '../../components/shared/Toast';
import { useAuth } from '../../routes/ClientRoutes';
import { getCurrentLogin, setCurrentLogin } from '../../utils/storage';

function getInitials(name) {
  if (!name) return '?';
  return name.split(' ').slice(0, 2).map(p => p[0]).join('').toUpperCase();
}

function EditProfileModal({ user, onClose, onSave }) {
  const showToast = useToast();
  const [username, setUsername] = useState(user.username || '');
  const [fullName, setFullName] = useState(user.full_name || '');
  const [bio, setBio] = useState(user.bio || '');
  const [github, setGithub] = useState(user.github || '');
  const [twitter, setTwitter] = useState(user.twitter || '');
  const [linkedin, setLinkedin] = useState(user.linkedin || '');
  const [avatarPreview, setAvatarPreview] = useState(user.avatar_url || '');
  const [avatarFile, setAvatarFile] = useState(null);
  const [saving, setSaving] = useState(false);
  const [usernameError, setUsernameError] = useState('');
  const fileRef = useRef(null);

  function handleImageChange(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setAvatarFile(file);
    const reader = new FileReader();
    reader.onload = (ev) => {
      const result = ev.target?.result;
      if (typeof result === 'string') {
        setAvatarPreview(result);
      }
    };
    reader.readAsDataURL(file);
  }

  function validateUsername(val) {
    const usernameRegex = /^[a-zA-Z][a-zA-Z0-9_]{2,31}$/;
    if (!usernameRegex.test(val)) {
      return 'Username must be 3-32 characters, start with a letter, and contain only letters, numbers, and underscores.';
    }
    if (/__/.test(val)) {
      return 'Username cannot have consecutive underscores.';
    }
    return '';
  }

  async function handleSave() {
    const uErr = validateUsername(username);
    if (uErr) {
      setUsernameError(uErr);
      showToast(uErr);
      return;
    }

    setSaving(true);
    try {
      if (avatarFile) {
        await uploadAvatar(avatarFile);
      }
      const { data } = await updateMe({ username, full_name: fullName, bio, github, twitter, linkedin });
      onSave(data.data);
      showToast('Profile updated');
      onClose();
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to save profile');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-[16px] shadow-xl w-full max-w-[460px] p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-[#191c1d]">Edit Profile</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <FiX size={18} />
          </button>
        </div>

        <div className="flex justify-center mb-4">
          <div className="relative">
            <div className="w-20 h-20 rounded-full overflow-hidden bg-[#d9d9d9]">
              {avatarPreview ? (
                <img
                  src={avatarPreview}
                  alt="Avatar"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400 text-2xl font-bold">
                  {getInitials(user.full_name)}
                </div>
              )}
            </div>
            <button
              onClick={() => fileRef.current?.click()}
              className="absolute bottom-0 right-0 bg-[#630ed4] text-white rounded-full p-1 hover:bg-[#500088] transition-colors"
            >
              <FiCamera size={12} />
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

        <div className="flex flex-col gap-3">
          <div>
            <label className="text-[#4a4455] font-medium text-xs block mb-1">Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => { setUsername(e.target.value); setUsernameError(''); }}
              placeholder="e.g. academic_pioneer"
              className="w-full border border-[#ccc3d8] rounded-lg px-3 py-2 text-sm text-gray-700 outline-none focus:border-[#630ed4] focus:ring-1 focus:ring-[#630ed4] transition-all"
            />
            {usernameError && <p className="text-red-500 text-[10px] mt-1">{usernameError}</p>}
          </div>

          <div>
            <label className="text-[#4a4455] font-medium text-xs block mb-1">Full Name</label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="e.g. Alex Johnson"
              className="w-full border border-[#ccc3d8] rounded-lg px-3 py-2 text-sm text-gray-700 outline-none focus:border-[#630ed4] focus:ring-1 focus:ring-[#630ed4] transition-all"
            />
          </div>

          <div>
            <label className="text-[#4a4455] font-medium text-xs block mb-1">Bio</label>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              rows={3}
              placeholder="Tell us about yourself..."
              className="w-full border border-[#ccc3d8] rounded-lg px-3 py-2 text-sm text-gray-700 outline-none focus:border-[#630ed4] focus:ring-1 focus:ring-[#630ed4] resize-none transition-all"
            />
          </div>

          <div>
            <label className="text-[#4a4455] font-medium text-xs block mb-1">GitHub Username</label>
            <div className="relative">
              <FiGithub size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#7b7487]" />
              <input
                type="text"
                value={github}
                onChange={(e) => setGithub(e.target.value)}
                placeholder="e.g. jane-chen"
                className="w-full border border-[#ccc3d8] rounded-lg pl-8 pr-3 py-2 text-sm text-gray-700 outline-none focus:border-[#630ed4] focus:ring-1 focus:ring-[#630ed4] transition-all"
              />
            </div>
          </div>

          <div>
            <label className="text-[#4a4455] font-medium text-xs block mb-1">Twitter Handle</label>
            <div className="relative">
              <FiTwitter size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#7b7487]" />
              <input
                type="text"
                value={twitter}
                onChange={(e) => setTwitter(e.target.value)}
                placeholder="e.g. janecodes"
                className="w-full border border-[#ccc3d8] rounded-lg pl-8 pr-3 py-2 text-sm text-gray-700 outline-none focus:border-[#630ed4] focus:ring-1 focus:ring-[#630ed4] transition-all"
              />
            </div>
          </div>

          <div>
            <label className="text-[#4a4455] font-medium text-xs block mb-1">LinkedIn</label>
            <div className="relative">
              <input
                type="text"
                value={linkedin}
                onChange={(e) => setLinkedin(e.target.value)}
                placeholder="e.g. janecodes"
                className="w-full border border-[#ccc3d8] rounded-lg px-3 py-2 text-sm text-gray-700 outline-none focus:border-[#630ed4] focus:ring-1 focus:ring-[#630ed4] transition-all"
              />
            </div>
          </div>

          <div className="flex gap-3 mt-1">
            <button
              onClick={onClose}
              className="flex-1 border border-[#ccc3d8] text-[#4a4455] font-semibold py-2.5 rounded-lg hover:bg-gray-50 transition-colors text-sm"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex-1 bg-[#630ed4] text-white font-semibold py-2.5 rounded-lg hover:bg-[#500088] transition-colors text-sm disabled:opacity-50"
            >
              {saving ? 'Saving...' : 'Save'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Profile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const currentUser = getCurrentLogin();
  const { updateUser } = useAuth();

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('uploaded');
  const [editOpen, setEditOpen] = useState(false);

  const [uploadedProjects, setUploadedProjects] = useState([]);
  const [favouriteProjects, setFavouriteProjects] = useState([]);

  const profileId = id ? Number(id) : currentUser?.id;
  const isOwnProfile = !id || (currentUser && currentUser.id === Number(id));

  useEffect(() => {
    async function fetchProfile() {
      setLoading(true);
      try {
        let userData;
        if (isOwnProfile) {
          const { data } = await getMe();
          userData = data.data;
        } else {
          const { data } = await getUserById(profileId);
          userData = data.data;
        }
        setUser(userData);

        const [projResult] = await Promise.all([
          getUserProjects(profileId, { page: 1, limit: 50 }),
        ]);
        setUploadedProjects(projResult.data.data?.projects || []);
      } catch (err) {
        console.error('Failed to fetch profile:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchProfile();
  }, [id]);

  useEffect(() => {
    if (!isOwnProfile) return;
    async function fetchFavourites() {
      try {
        const { data } = await getFavorites({ page: 1, limit: 50 });
        setFavouriteProjects(data.data || []);
      } catch (err) {
        console.error('Failed to fetch favorites:', err);
      }
    }
    fetchFavourites();
  }, [id]);

  async function handleSaveProfile(updated) {
    setUser(updated);
    if (isOwnProfile) {
      setCurrentLogin(updated);
      updateUser(updated);
    }
  }

  async function handleDeleteProject(projectId) {
    try {
      await deleteProject(projectId);
      setUploadedProjects((prev) => prev.filter((p) => p.id !== projectId));
    } catch (err) {
      console.error('Failed to delete project:', err);
    }
  }

  async function handleRemoveFavourite(projectId) {
    try {
      await removeFavorite(projectId);
      setFavouriteProjects((prev) => prev.filter((p) => p.id !== projectId));
    } catch (err) {
      console.error('Failed to remove favorite:', err);
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="w-8 h-8 border-4 border-[#630ed4] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="text-center py-20 text-gray-400 text-base">
        User not found.
      </div>
    );
  }

  return (
    <>
      <div className="bg-[#fcfcfc] min-h-screen py-6 px-6 font-[Inter,sans-serif]">
        <div className="border border-[#bdbdbd] rounded-[10px] bg-white p-5 flex items-start gap-6 mb-5">
          <div className="w-[140px] h-[140px] rounded-[8px] overflow-hidden bg-[#d9d9d9] shrink-0">
            {user.avatar_url ? (
              <img
                src={user.avatar_url}
                alt={user.full_name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-4xl font-bold text-gray-400">
                {getInitials(user.full_name)}
              </div>
            )}
          </div>

          <div className="flex-1 pt-1">
            <h1 className="font-semibold text-[26px] text-black leading-tight mb-0">
              {user.full_name}
            </h1>
            <p className="text-[13px] text-[#630ed4] font-medium mb-1">
              @{user.username}
            </p>
            <p className="text-[15px] text-black mb-1 capitalize">
              {user.role} · {user.status || 'active'}
            </p>
            <p className="text-[15px] text-black mb-3">
              {user.bio || 'No bio yet.'}
            </p>

            <div className="flex gap-4">
              {user.github && (
                <a
                  href={`https://github.com/${user.github}`}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1.5 text-[#4a4455] hover:text-[#630ed4] transition-colors text-xs font-medium"
                >
                  <FiGithub size={14} /> {user.github}
                </a>
              )}
              {user.twitter && (
                <a
                  href={`https://twitter.com/${user.twitter}`}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1.5 text-[#4a4455] hover:text-[#1da1f2] transition-colors text-xs font-medium"
                >
                  <FiTwitter size={14} /> @{user.twitter}
                </a>
              )}
              {user.linkedin && (
                <a
                  href={`https://linkedin.com/in/${user.linkedin}`}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1.5 text-[#4a4455] hover:text-[#0a66c2] transition-colors text-xs font-medium"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
                  {user.linkedin}
                </a>
              )}
            </div>
          </div>

          <div className="flex flex-col gap-1.5 shrink-0">
            {isOwnProfile ? (
              <button
                onClick={() => setEditOpen(true)}
                className="flex items-center gap-2 bg-[#dfdfdf] hover:bg-[#d0d0d0] text-[#630ed4] font-medium text-[15px] px-4 py-2 rounded-[8px] transition-colors"
              >
                <FiEdit2 size={15} />
                Edit Profile
              </button>
            ) : (
              <>
                <Link
                  to="/request-collaboration"
                  state={{ receiver: user }}
                  className="flex items-center gap-2 bg-[#008321] text-white font-semibold text-[14px] px-4 py-2 rounded-[8px] hover:bg-[#006919] transition-colors"
                >
                  <FiUsers size={15} />
                  Request Collaboration
                </Link>
                {user.role === 'mentor' && (
                  <button
                    onClick={() => navigate('/request-mentorship', { state: { mentor: user } })}
                    className="flex items-center gap-2 bg-[#1600c0] text-white font-semibold text-[14px] px-4 py-2 rounded-[8px] hover:bg-[#1200a0] transition-colors"
                  >
                    <FiUser size={15} />
                    Request Mentor
                  </button>
                )}
              </>
            )}
          </div>
        </div>

        <div className="relative mb-5">
          <div className="flex gap-6 border-b border-[#919191]">
            <button
              onClick={() => setActiveTab('uploaded')}
              className={`pb-2 text-[15px] font-semibold transition-colors relative ${
                activeTab === 'uploaded' ? 'text-[#630ed4]' : 'text-black hover:text-[#630ed4]'
              }`}
            >
              Uploaded Projects
              {activeTab === 'uploaded' && (
                <span className="absolute bottom-[-2px] left-0 right-0 h-[3px] bg-[#630ed4] rounded-full" />
              )}
            </button>

            {isOwnProfile && (
              <button
                onClick={() => setActiveTab('favourites')}
                className={`pb-2 text-[15px] font-semibold transition-colors relative ${
                  activeTab === 'favourites' ? 'text-[#630ed4]' : 'text-black hover:text-[#630ed4]'
                }`}
              >
                Saved Favorites
                {activeTab === 'favourites' && (
                  <span className="absolute bottom-[-2px] left-0 right-0 h-[3px] bg-[#630ed4] rounded-full" />
                )}
              </button>
            )}
          </div>
        </div>

        {activeTab === 'uploaded' && (
          <>
            {uploadedProjects.length === 0 ? (
              <div className="text-center py-16 text-gray-400 text-base">
                No uploaded projects yet.
              </div>
            ) : (
              <div className="grid grid-cols-6 gap-3 ">
                {uploadedProjects.map((project) => (
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
              <div className="text-center py-16 text-gray-400 text-base">
                No saved favorites yet.
              </div>
            ) : (
              <div className="grid grid-cols-6 gap-3">
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
