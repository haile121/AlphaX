'use client';

import { useEffect, useMemo, useState } from 'react';
import api, { authApi } from '@/lib/api';
import { useDialog } from '@/components/ui/DialogProvider';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Spinner } from '@/components/ui/Spinner';

interface AdminUser {
  id: string;
  email: string;
  display_name: string;
  role: string;
  level: string | null;
  xp: number;
  streak: number;
  is_active: boolean;
  created_at: string;
}

function downloadCsv(rows: AdminUser[]) {
  const headers = [
    'id',
    'display_name',
    'email',
    'role',
    'level',
    'xp',
    'streak',
    'is_active',
    'created_at',
  ];
  const escape = (v: string | number | boolean | null) => {
    const s = v === null || v === undefined ? '' : String(v);
    if (/[",\n]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
    return s;
  };
  const lines = [
    headers.join(','),
    ...rows.map((u) =>
      headers
        .map((h) => escape(u[h as keyof AdminUser] as string | number | boolean | null))
        .join(','),
    ),
  ];
  const blob = new Blob([lines.join('\n')], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `users-export-${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [myId, setMyId] = useState<string | null>(null);
  const [query, setQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<'all' | 'student' | 'admin'>('all');
  const { show } = useDialog();

  useEffect(() => {
    Promise.all([
      api.get<{ users: AdminUser[] }>('/api/admin/users'),
      authApi.me().catch(() => null),
    ])
      .then(([usersRes, meRes]) => {
        setUsers(usersRes.data.users);
        if (meRes?.data?.user?.id) setMyId(meRes.data.user.id);
      })
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return users.filter((u) => {
      if (roleFilter !== 'all' && u.role !== roleFilter) return false;
      if (!q) return true;
      return (
        u.display_name.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        (u.level ?? '').toLowerCase().includes(q)
      );
    });
  }, [users, query, roleFilter]);

  async function toggleStatus(user: AdminUser) {
    const next = !user.is_active;
    show({
      variant: 'confirm',
      title: next ? 'Activate user' : 'Deactivate user',
      message: `${next ? 'Activate' : 'Deactivate'} account for ${user.display_name}?`,
      primaryAction: {
        label: 'Confirm',
        onClick: async () => {
          await api.patch(`/api/admin/users/${user.id}/status`, { is_active: next });
          setUsers((prev) => prev.map((u) => (u.id === user.id ? { ...u, is_active: next } : u)));
        },
      },
    });
  }

  function setRole(user: AdminUser, role: 'student' | 'admin') {
    if (user.id === myId && role === 'student') {
      show({
        variant: 'warning',
        title: 'Cannot change your own role',
        message: 'Ask another admin to demote you, or keep admin access.',
        primaryAction: { label: 'OK', onClick: () => {} },
      });
      return;
    }
    show({
      variant: 'confirm',
      title: role === 'admin' ? 'Grant admin' : 'Set as student',
      message:
        role === 'admin'
          ? `Give ${user.display_name} full admin access?`
          : `Remove admin from ${user.display_name}? They will keep their account.`,
      primaryAction: {
        label: 'Confirm',
        onClick: async () => {
          await api.patch(`/api/admin/users/${user.id}/role`, { role });
          setUsers((prev) => prev.map((u) => (u.id === user.id ? { ...u, role } : u)));
        },
      },
    });
  }

  if (loading) {
    return (
      <div className="flex justify-center p-16">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-6 py-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-6">
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
          Users ({filtered.length}
          {filtered.length !== users.length ? ` of ${users.length}` : ''})
        </h1>
        <div className="flex flex-wrap items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => downloadCsv(filtered)}>
            Export CSV
          </Button>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <input
          type="search"
          placeholder="Search name, email, or level…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="flex-1 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/40"
        />
        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value as typeof roleFilter)}
          className="rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm text-gray-900 dark:text-white"
        >
          <option value="all">All roles</option>
          <option value="student">Students</option>
          <option value="admin">Admins</option>
        </select>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[880px]">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                {['Name', 'Email', 'Role', 'Level', 'XP', 'Streak', 'Status', 'Actions'].map(
                  (h) => (
                    <th
                      key={h}
                      className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase whitespace-nowrap"
                    >
                      {h}
                    </th>
                  ),
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
              {filtered.map((u) => (
                <tr key={u.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/80">
                  <td className="px-4 py-3 font-medium text-gray-900 dark:text-white">
                    {u.display_name}
                  </td>
                  <td className="px-4 py-3 text-gray-500 max-w-[220px] truncate" title={u.email}>
                    {u.email}
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant={u.role === 'admin' ? 'default' : 'success'}>
                      {u.role}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 capitalize text-gray-600 dark:text-gray-400">
                    {u.level ?? '—'}
                  </td>
                  <td className="px-4 py-3 text-gray-600 dark:text-gray-400">{u.xp}</td>
                  <td className="px-4 py-3 text-gray-600 dark:text-gray-400">🔥 {u.streak}</td>
                  <td className="px-4 py-3">
                    <Badge variant={u.is_active ? 'success' : 'default'}>
                      {u.is_active ? 'Active' : 'Inactive'}
                    </Badge>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-1.5">
                      <Button variant="outline" size="sm" onClick={() => toggleStatus(u)}>
                        {u.is_active ? 'Deactivate' : 'Activate'}
                      </Button>
                      {u.role !== 'admin' ? (
                        <Button size="sm" onClick={() => setRole(u, 'admin')}>
                          Make admin
                        </Button>
                      ) : (
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={u.id === myId}
                          title={u.id === myId ? 'Use another admin to change your role' : undefined}
                          onClick={() => setRole(u, 'student')}
                        >
                          Remove admin
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filtered.length === 0 && (
          <p className="text-center text-sm text-gray-500 py-10">No users match your filters.</p>
        )}
      </div>
    </div>
  );
}
