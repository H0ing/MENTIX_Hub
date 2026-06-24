import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../components/shared/Toast';
import Button from '../../components/shared/Button';
import { Input } from '../../components/shared/Input';

export default function ProfilePage() {
  const showToast = useToast();
  const navigate = useNavigate();
  const { user: authUser } = useAuth();

  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(authUser?.full_name || authUser?.username || '');
  const [email] = useState(authUser?.email || '');

  const initials = (authUser?.full_name || authUser?.username || 'Admin')
    .split(' ').slice(0, 2).map(p => p[0]).join('').toUpperCase();

  function handleSave() {
    showToast('Profile updated');
    setEditing(false);
  }

  if (!authUser) return null;

  return (
    <div>
      <div className="flex items-start justify-between mb-6">
        <div>
          <h2 className="text-[25px] font-black m-0 mb-1 tracking-[-0.01em]">My Profile</h2>
          <p className="m-0 text-[#8B8B9E] text-[13.5px]">View and manage your admin account.</p>
        </div>
        <Button variant="primary" onClick={() => setEditing(v => !v)}>
          {editing ? 'Cancel' : 'Edit Profile'}
        </Button>
      </div>

      <div className="bg-white border border-[#ECE9F4] rounded-[14px] p-6">
        <div className="flex items-center gap-5 pb-6 border-b border-[#ECE9F4] mb-6">
          <div className="w-[64px] h-[64px] rounded-full bg-gradient-to-br from-[#A78BFA] to-[#7C3AED] text-white flex items-center justify-center text-[22px] font-bold flex-shrink-0">
            {initials}
          </div>
          <div>
            <div className="text-[18px] font-bold">{authUser.full_name || authUser.username}</div>
            <div className="text-[13px] text-[#8B8B9E] capitalize">
              {authUser.role?.replace(/_/g, ' ')}
            </div>
          </div>
        </div>

        {editing ? (
          <div className="flex flex-col gap-4">
            <Input label="Full Name" value={name} onChange={e => setName(e.target.value)} placeholder="Your full name" />
            <Input label="Email" value={email} disabled placeholder="name@mentix.dev" />
            <div className="text-[13px] text-[#8B8B9E]">Role cannot be changed here.</div>
            <div className="flex gap-2.5 mt-2">
              <Button variant="primary" onClick={handleSave}>Save Changes</Button>
              <Button onClick={() => setEditing(false)}>Cancel</Button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            <div className="grid grid-cols-[140px_1fr] gap-2">
              <span className="text-[12px] font-bold text-[#8B8B9E] uppercase tracking-[0.04em]">Email</span>
              <span className="text-[13.5px]">{authUser.email || '—'}</span>
            </div>
            <div className="grid grid-cols-[140px_1fr] gap-2">
              <span className="text-[12px] font-bold text-[#8B8B9E] uppercase tracking-[0.04em]">Role</span>
              <span className="text-[13.5px] capitalize">{authUser.role?.replace(/_/g, ' ')}</span>
            </div>
          </div>
        )}
      </div>

      <div className="mt-6 border-t border-[#ECE9F4] pt-5 flex items-center justify-between">
        <div className="text-[12px] text-[#8B8B9E]">
          Need to change your role or permissions? Contact a Super Admin.
        </div>
        <button
          onClick={() => navigate('/admin/settings')}
          className="text-[12.5px] font-semibold text-[#7C3AED] hover:underline cursor-pointer bg-transparent border-none"
        >
          Go to Settings
        </button>
      </div>
    </div>
  );
}
