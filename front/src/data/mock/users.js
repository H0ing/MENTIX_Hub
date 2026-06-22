export const adminUsers = [
  { id: 1, name: 'Alex Rivera', email: 'alex.rivera@mentix.dev',  role: 'super_admin', lastLogin: null, ip: null },
  { id: 2, name: 'Sarah Chen',  email: 'sarah.chen@mentix.dev',   role: 'moderator',   lastLogin: null, ip: null },
  { id: 3, name: 'Priya Nair',  email: 'priya.nair@mentix.dev',   role: 'dev_admin',   lastLogin: null, ip: null },
];

export const clientUsers = [
  { id: 1, name: 'Dr. Elena Rodriguez', email: 'elena.rodriguez@mentix.dev', role: 'mentor',  status: 'active' },
  { id: 2, name: 'Jordan Kim',          email: 'j.kim@mentix.dev',           role: 'student', status: 'banned' },
];

export const dbUsers = [
  {
    id: 1,
    username: 'app_reader',
    host: 'localhost',
    privs: [{ table: 'projects', priv: 'SELECT' }, { table: 'users', priv: 'SELECT' }],
  },
  {
    id: 2,
    username: 'backup_agent',
    host: '%',
    privs: [{ table: 'ALL', priv: 'ALL PRIVILEGES' }],
  },
];

export const DB_TABLES = [
  { name: 'users',        rows: '12,481',    size: '44 MB' },
  { name: 'projects',     rows: '84,012',    size: '204 MB' },
  { name: 'comments',     rows: '3,112,055', size: '89 MB' },
  { name: 'audit_logs',   rows: '2,481,902', size: '412 MB' },
  { name: 'reports',      rows: '9,311',     size: '8 MB' },
  { name: 'mentor_forms', rows: '1,204',     size: '3 MB' },
];
