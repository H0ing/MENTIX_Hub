import { useEffect, useState } from 'react';
import { Tabs } from '../../components/shared/Tabs';
import Table, { Tr, Td } from '../../components/shared/Table';
import Modal from '../../components/shared/Modal';
import Button from '../../components/shared/Button';
import StatusTag from '../../components/shared/StatusTag';
import MvpBadge from '../../components/shared/MvpBadge';
import { Input, Select as FormSelect } from '../../components/shared/Input';
import { useToast } from '../../components/shared/Toast';
import * as userService from '../../services/userService';
import { can } from '../../services/authService';
import { DB_TABLES } from '../../data/mock/users';

const ROLE_LABEL = { super_admin: 'Super Admin', moderator: 'Moderator', dev_admin: 'Dev Admin' };
const PRIVILEGE_OPTIONS = ['SELECT', 'INSERT', 'UPDATE', 'DELETE', 'ALL PRIVILEGES'];

// Tabs with their permission key — undefined = no restriction
const TAB_DEFS = [
  { id: 'admins',  label: 'Admin Users',    permKey: 'tab_admins' },
  { id: 'clients', label: 'Client Users',   permKey: 'tab_clients' },
  {
    id: 'dbusers', label: 'Database Users', permKey: 'tab_dbusers',
    icon: <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><ellipse cx="12" cy="5.5" rx="7" ry="2.7"/><path d="M5 5.5V18c0 1.5 3 2.7 7 2.7s7-1.2 7-2.7V5.5"/><path d="M5 12c0 1.5 3 2.7 7 2.7s7-1.2 7-2.7"/></svg>,
  },
];

export default function UsersPage() {
  const showToast = useToast();
  // Find first accessible tab for default
  const firstAccessible = TAB_DEFS.find(t => can(t.permKey))?.id ?? 'admins';
  const normalizeUser = (u) => ({
    ...u,
    name: u.name ?? u.full_name ?? u.username ?? '',
    ip: u.ip ?? u.last_login ?? '—'
  });
  const [tab, setTab] = useState(firstAccessible);
  const [adminUsers, setAdminUsers]   = useState([]);
  const [clientUsers, setClientUsers] = useState([]);
  const [dbUsers, setDbUsers]         = useState(() => userService.getDbUsers());
  const [roleFilter, setRoleFilter]     = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [createModal, setCreateModal]   = useState(false);
  const [editRoleModal, setEditRoleModal]   = useState(null);
  const [editClientModal, setEditClientModal] = useState(null);
  const [deleteModal, setDeleteModal]   = useState(null);
  const [showDbForm, setShowDbForm]     = useState(false);
  const [dbForm, setDbForm]             = useState({ username: '', host: 'localhost', password: '', confirm: '', privs: {} });

  const [loadError, setLoadError] = useState('');
  const [loadingUsers, setLoadingUsers] = useState(true);

  useEffect(() => {
    let alive = true;

    async function loadUsers() {
      setLoadingUsers(true);
      try {
        const [adminsRes, clientsRes] = await Promise.all([
          userService.getAdminUsers(),
          userService.getClientUsers()
        ]);
        if (!alive) return;
        setAdminUsers((adminsRes.data ?? []).map(normalizeUser));
        setClientUsers((clientsRes.data ?? []).map(normalizeUser));
      } catch (err) {
        if (!alive) return;
        setLoadError(err.response?.data?.message || 'Failed to load users.');
      } finally {
        if (alive) setLoadingUsers(false);
      }
    }

    loadUsers();
    return () => { alive = false; };
  }, []);

  const filteredClients = clientUsers.filter(u => {
    const okRole   = roleFilter   === 'all' || u.role   === roleFilter.toLowerCase();
    const okStatus = statusFilter === 'all' || u.status === statusFilter.toLowerCase();
    return okRole && okStatus;
  });

  function handleCreateAccount(form) {
    const newUser = {
      id: Date.now(),
      name: form.name,
      email: form.email,
      role: form.role,
      status: 'active',
      last_login: null,
      ip: '—'
    };

    if (tab === 'admins') {
      setAdminUsers(prev => [newUser, ...prev]);
      showToast('Admin account created locally');
    } else {
      setClientUsers(prev => [newUser, ...prev]);
      showToast('Client account created locally');
    }
    setCreateModal(false);
  }
  async function handleEditRole(id, role) {
    try {
      await userService.updateAdminRole(id, role);
      setAdminUsers(prev => prev.map(u => u.id === id ? { ...u, role } : u));
      setEditRoleModal(null);
      showToast('Role updated');
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to update role.');
    }
  }
  function handleEditClient(id, changes) {
    setClientUsers(prev => prev.map(u => (u.id === id ? { ...u, ...changes } : u)));
    setEditClientModal(null);
    showToast('User updated locally');
  }
  async function handleToggleSuspend(id, currentStatus) {
    try {
      const newStatus = currentStatus === 'active' ? 'suspended' : 'active';
      await userService.toggleSuspend(id, currentStatus);
      setClientUsers(prev => prev.map(u => u.id === id ? { ...u, status: newStatus } : u));
      showToast(`User ${newStatus === 'active' ? 'reinstated' : 'suspended'}`);
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to update status.');
    }
  }
  async function handleDelete() {
    if (!deleteModal) return;
    try {
      if (deleteModal.kind === 'admin') {
        await userService.deleteAdminUser(deleteModal.id);
        setAdminUsers(prev => prev.filter(u => u.id !== deleteModal.id));
      } else {
        await userService.deleteClientUser(deleteModal.id);
        setClientUsers(prev => prev.filter(u => u.id !== deleteModal.id));
      }
      setDeleteModal(null);
      showToast('Account deleted');
    } catch (err) {
      showToast(err.response?.data?.message || 'Delete failed. Please try again.');
      setDeleteModal(null);
    }
  }
  function handleDeleteDbUser(id) {
    userService.deleteDbUser(id);
    setDbUsers(userService.getDbUsers());
    showToast('DB user deleted');
  }
  function handleCreateDbUser() {
    if (dbForm.password !== dbForm.confirm) { showToast('Passwords do not match'); return; }
    const privs = Object.entries(dbForm.privs).filter(([,p]) => p).map(([table, priv]) => ({ table, priv }));
    userService.createDbUser({ username: dbForm.username, host: dbForm.host, privs });
    setDbUsers(userService.getDbUsers());
    setShowDbForm(false);
    setDbForm({ username: '', host: 'localhost', password: '', confirm: '', privs: {} });
    showToast('Database user created');
  }

  const [newAcct, setNewAcct] = useState({ name: '', email: '', role: '' });

  return (
    <div>
      <div className="flex items-start justify-between mb-1.5">
        <div>
          <h2 className="text-[25px] font-black m-0 mb-1 tracking-[-0.01em]">User Management</h2>
          <p className="m-0 text-[#8B8B9E] text-[13.5px]">Manage admin accounts and client (student / mentor) accounts.</p>
        </div>
        {/* Disable "Create Account" on DB users tab — DB users have their own create flow */}
        <Button variant="primary" disabled={tab === 'dbusers'} onClick={() => setCreateModal(true)}>
          + Create Account
        </Button>
      </div>

      {/* Role-gated tab bar */}
      <div className="flex gap-[22px] border-b border-[#ECE9F4] mb-[22px]">
        {TAB_DEFS.map(t => {
          const locked   = !can(t.permKey);
          const isActive = tab === t.id;
          return (
            <button
              key={t.id}
              onClick={() => !locked && setTab(t.id)}
              title={locked ? 'Access restricted for your role' : undefined}
              className={`
                flex items-center gap-1.5 pb-3 text-[13.5px] font-semibold border-b-2 -mb-px transition-colors
                ${isActive ? 'text-[#7C3AED] border-[#7C3AED]' : 'border-transparent'}
                ${locked ? 'text-[#C4BFDA] cursor-not-allowed' : 'text-[#8B8B9E] hover:text-[#1A1A2E] cursor-pointer'}
              `}
            >
              {t.icon && <span>{t.icon}</span>}
              {t.label}
              {locked && (
                <svg className="w-[11px] h-[11px] ml-0.5 mb-[1px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                  <rect x="3" y="11" width="18" height="11" rx="2"/>
                  <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                </svg>
              )}
            </button>
          );
        })}
      </div>

      {/* Admin users */}
      {tab === 'admins' && (
        <>
          <Table columns={['Name', 'Role', 'Last Login', 'IP', 'Actions']}>
            {adminUsers.map(u => (
              <Tr key={u.id}>
                <Td><b>{u.name}</b></Td>
                <Td><StatusTag status={u.role} /></Td>
                <Td className="opacity-55">— <MvpBadge /></Td>
                <Td className="opacity-55">— <MvpBadge /></Td>
                <Td>
                  <div className="flex gap-3">
                    <span onClick={() => setEditRoleModal(u)} className="text-[#7C3AED] font-semibold text-[12.5px] cursor-pointer">Edit Role</span>
                    <span onClick={() => setDeleteModal({ kind: 'admin', id: u.id })} className="text-[#E0245E] font-semibold text-[12.5px] cursor-pointer">Delete</span>
                  </div>
                </Td>
              </Tr>
            ))}
          </Table>
          <div className="mt-4 border-[1.5px] border-dashed border-[#ECE9F4] rounded-[14px] px-[18px] py-[18px] flex items-center justify-between bg-[#FBFAFD] opacity-55">
            <div>
              <div className="text-[13.5px] font-bold flex items-center gap-2">Custom Privilege Mode (CLI-only Admin)<MvpBadge /></div>
              <div className="text-[12px] text-[#8B8B9E] mt-1">Fine-grained CLI-defined privilege sets for non-standard admin roles.</div>
            </div>
            <Button disabled>Configure</Button>
          </div>
        </>
      )}

      {/* Client users */}
      {tab === 'clients' && (
        <>
          <div className="flex gap-3 mb-[18px]">
            <select value={roleFilter} onChange={e => setRoleFilter(e.target.value)} className="px-2.5 py-[9px] border border-[#ECE9F4] rounded-[9px] bg-white text-[13px] outline-none focus:border-[#7C3AED]">
              <option value="all">All roles</option><option value="student">Student</option><option value="mentor">Mentor</option>
            </select>
            <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="px-2.5 py-[9px] border border-[#ECE9F4] rounded-[9px] bg-white text-[13px] outline-none focus:border-[#7C3AED]">
              <option value="all">All statuses</option><option value="active">Active</option><option value="suspended">Suspended</option><option value="banned">Banned</option>
            </select>
          </div>
          <Table columns={['Name', 'Role', 'Status', 'Actions']}>
            {filteredClients.map(u => (
              <Tr key={u.id}>
                <Td><b>{u.name}</b></Td>
                <Td className="capitalize">{u.role}</Td>
                <Td><StatusTag status={u.status} /></Td>
                <Td>
                  <div className="flex gap-3">
                    <span onClick={() => setEditClientModal(u)} className="text-[#7C3AED] font-semibold text-[12.5px] cursor-pointer">Edit</span>
                    <span onClick={() => handleToggleSuspend(u.id, u.status)} className="text-[#7C3AED] font-semibold text-[12.5px] cursor-pointer">{u.status === 'active' ? 'Suspend' : 'Reinstate'}</span>
                    <span onClick={() => setDeleteModal({ kind: 'client', id: u.id })} className="text-[#E0245E] font-semibold text-[12.5px] cursor-pointer">Delete</span>
                  </div>
                </Td>
              </Tr>
            ))}
          </Table>
        </>
      )}

      {/* DB users */}
      {tab === 'dbusers' && (
        <>
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="text-[15px] font-bold">Database Users</div>
              <div className="text-[12.5px] text-[#8B8B9E] mt-0.5">Manage MySQL database-level users and their table privileges.</div>
            </div>
            <Button variant="primary" onClick={() => setShowDbForm(v => !v)}>+ Create DB User</Button>
          </div>
          {dbUsers.map(u => (
            <div key={u.id} className="bg-white border border-[#ECE9F4] rounded-[11px] px-[18px] py-3.5 flex items-center gap-3.5 mb-2.5">
              <div className="w-[34px] h-[34px] rounded-full bg-gradient-to-br from-[#A78BFA] to-[#7C3AED] text-white flex items-center justify-center text-[12px] font-bold flex-shrink-0">
                {u.username.slice(0, 2).toUpperCase()}
              </div>
              <div className="flex-1">
                <div className="text-[13.5px] font-bold">{u.username}</div>
                <div className="text-[12px] text-[#8B8B9E]">@{u.host}</div>
                <div className="flex flex-wrap gap-1.5 mt-1.5">
                  {u.privs.map((p, i) => {
                    const isAll = p.table === 'ALL' || p.priv === 'ALL PRIVILEGES';
                    return <span key={i} className={`text-[10px] font-bold px-2 py-[2px] rounded-full ${isAll ? 'bg-[#FEF3E2] text-[#B45309]' : 'bg-[#F0EAFC] text-[#7C3AED]'}`}>{p.table}: {p.priv}</span>;
                  })}
                </div>
              </div>
              <span onClick={() => handleDeleteDbUser(u.id)} className="text-[#E0245E] font-semibold text-[12.5px] cursor-pointer">Delete</span>
            </div>
          ))}
          {showDbForm && (
            <div className="bg-white border-[1.5px] border-[#7C3AED] rounded-[14px] p-[22px] max-w-[660px] mt-4">
              <h3 className="text-[15.5px] font-bold mb-[18px]">Create New Database User</h3>
              <div className="grid grid-cols-2 gap-3.5">
                <Input label="Username" placeholder="e.g. app_reader" value={dbForm.username} onChange={e => setDbForm(f => ({ ...f, username: e.target.value }))} />
                <FormSelect label="Host" value={dbForm.host} onChange={e => setDbForm(f => ({ ...f, host: e.target.value }))}>
                  <option value="localhost">localhost</option><option value="%">% (any host)</option>
                </FormSelect>
              </div>
              <div className="grid grid-cols-2 gap-3.5">
                <Input label="Password" type="password" placeholder="••••••••" value={dbForm.password} onChange={e => setDbForm(f => ({ ...f, password: e.target.value }))} />
                <Input label="Confirm Password" type="password" placeholder="••••••••" value={dbForm.confirm} onChange={e => setDbForm(f => ({ ...f, confirm: e.target.value }))} />
              </div>
              <div className="text-[11.5px] font-bold text-[#8B8B9E] uppercase tracking-[0.04em] mb-2.5">Table Privileges</div>
              <div className="flex flex-col gap-2 mb-4">
                {DB_TABLES.map(t => {
                  const enabled = !!dbForm.privs[t.name];
                  return (
                    <div key={t.name} className="grid grid-cols-[1fr_auto_auto] gap-2.5 items-center bg-[#F7F5FB] border border-[#ECE9F4] rounded-lg px-3 py-2.5">
                      <div>
                        <div className="text-[13px] font-semibold">{t.name}</div>
                        <div className="text-[11.5px] text-[#8B8B9E]">{t.rows} rows · {t.size}</div>
                      </div>
                      <label className="flex items-center gap-1.5 text-[12px] text-[#8B8B9E] cursor-pointer">
                        <input type="checkbox" checked={enabled} onChange={e => setDbForm(f => ({ ...f, privs: { ...f.privs, [t.name]: e.target.checked ? 'SELECT' : '' } }))} className="accent-[#7C3AED]" /> Enable
                      </label>
                      <select disabled={!enabled} value={dbForm.privs[t.name] || 'SELECT'} onChange={e => setDbForm(f => ({ ...f, privs: { ...f.privs, [t.name]: e.target.value } }))} className={`px-2 py-1.5 border border-[#ECE9F4] rounded-lg text-[12.5px] bg-white ${!enabled ? 'opacity-40 pointer-events-none' : ''}`}>
                        {PRIVILEGE_OPTIONS.map(p => <option key={p}>{p}</option>)}
                      </select>
                    </div>
                  );
                })}
              </div>
              <div className="flex gap-2.5">
                <Button variant="primary" onClick={handleCreateDbUser}>Create User</Button>
                <Button onClick={() => setShowDbForm(false)}>Cancel</Button>
              </div>
            </div>
          )}
        </>
      )}

      {/* Create account modal */}
      <Modal open={createModal} title="Create Account" onClose={() => setCreateModal(false)}
        footer={<><Button onClick={() => setCreateModal(false)}>Cancel</Button><Button variant="primary" onClick={() => handleCreateAccount(newAcct)}>Create</Button></>}>
        <Input label="Name" placeholder="Full name" value={newAcct.name} onChange={e => setNewAcct(f => ({ ...f, name: e.target.value }))} />
        <Input label="Email" placeholder="name@mentix.dev" value={newAcct.email} onChange={e => setNewAcct(f => ({ ...f, email: e.target.value }))} />
        <FormSelect label="Role" value={newAcct.role} onChange={e => setNewAcct(f => ({ ...f, role: e.target.value }))}>
          {tab === 'admins' ? ['super_admin','moderator','dev_admin'].map(r=><option key={r} value={r}>{ROLE_LABEL[r]}</option>) : ['student','mentor'].map(r=><option key={r} value={r} className="capitalize">{r}</option>)}
        </FormSelect>
      </Modal>

      {/* Edit role modal */}
      <Modal open={!!editRoleModal} title="Edit Role" onClose={() => setEditRoleModal(null)}
        footer={<><Button onClick={() => setEditRoleModal(null)}>Cancel</Button><Button variant="primary" onClick={() => handleEditRole(editRoleModal?.id, document.getElementById('editRoleSel')?.value)}>Save</Button></>}>
        {editRoleModal && <FormSelect id="editRoleSel" label="Role" defaultValue={editRoleModal.role}>{['super_admin','moderator','dev_admin'].map(r=><option key={r} value={r}>{ROLE_LABEL[r]}</option>)}</FormSelect>}
      </Modal>

      {/* Edit client modal */}
      <Modal open={!!editClientModal} title="Edit User" onClose={() => setEditClientModal(null)}
        footer={<><Button onClick={() => setEditClientModal(null)}>Cancel</Button><Button variant="primary" onClick={() => handleEditClient(editClientModal?.id, { name: document.getElementById('editClientName')?.value, email: document.getElementById('editClientEmail')?.value })}>Save</Button></>}>
        {editClientModal && (
          <>
            <Input id="editClientName" label="Name" defaultValue={editClientModal.name} />
            <Input id="editClientEmail" label="Email" defaultValue={editClientModal.email} />
          </>
        )}
      </Modal>

      {/* Delete modal */}
      <Modal open={!!deleteModal} title="Delete this account?" onClose={() => setDeleteModal(null)}
        footer={<><Button onClick={() => setDeleteModal(null)}>Cancel</Button><Button variant="danger" onClick={handleDelete}>Delete</Button></>}>
        <p className="m-0">This can't be undone.</p>
      </Modal>
    </div>
  );
}
