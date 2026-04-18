'use client';
import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/AuthContext';
import { useRouter } from 'next/navigation';
import ComingSoon from '@/components/ComingSoon';
import Navbar from '@/components/Navbar';
import {
  getAdminStats, getAdminUsers, getAdminVideos,
  uploadVideo, deleteVideo, updateVideo,
  toggleBanUser, toggleAdminUser, sendBroadcast
} from '@/lib/api';
import toast from 'react-hot-toast';
import {
  BarChart2, Users, Film, Eye, Shield, Trash2,
  Upload, Plus, Send, Ban, RefreshCw, Loader2,
  ToggleLeft, ToggleRight, Edit, X, Check
} from 'lucide-react';

// ─── STAT CARD ────────────────────────────────────────────
function StatCard({ icon: Icon, label, value, color = 'brand' }) {
  const colors = {
    brand: 'text-brand-400 bg-brand-500/10',
    green: 'text-green-400 bg-green-500/10',
    blue: 'text-blue-400 bg-blue-500/10',
    red: 'text-red-400 bg-red-500/10',
  };
  return (
    <div className="glass rounded-2xl p-5">
      <div className={`inline-flex p-2.5 rounded-xl ${colors[color]} mb-3`}>
        <Icon size={20} />
      </div>
      <div className="text-2xl font-bold text-white mb-0.5">{value?.toLocaleString()}</div>
      <div className="text-xs text-white/40">{label}</div>
    </div>
  );
}

// ─── ADD VIDEO MODAL ──────────────────────────────────────
function AddVideoModal({ onClose, onSuccess }) {
  const [form, setForm] = useState({ title: '', description: '', category: '', tags: '', videoUrl: '', videoType: 'external' });
  const [videoFile, setVideoFile] = useState(null);
  const [thumbFile, setThumbFile] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => { if (v) fd.append(k, v); });
      if (videoFile) fd.append('video', videoFile);
      if (thumbFile) fd.append('thumbnail', thumbFile);
      await uploadVideo(fd);
      toast.success('Video added successfully!');
      onSuccess();
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to add video');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="glass rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-white/8">
          <h2 className="text-lg font-bold text-white">Add New Video</h2>
          <button onClick={onClose} className="p-2 rounded-lg text-white/40 hover:text-white/70 hover:bg-white/5">
            <X size={18} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-4">
          <input required placeholder="Title *" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
            className="w-full bg-dark-700 border border-white/8 rounded-xl px-4 py-2.5 text-sm text-white placeholder-white/30 focus:outline-none focus:border-brand-500/50" />
          <textarea placeholder="Description" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} rows={3}
            className="w-full bg-dark-700 border border-white/8 rounded-xl px-4 py-2.5 text-sm text-white placeholder-white/30 focus:outline-none focus:border-brand-500/50 resize-none" />
          <div className="grid grid-cols-2 gap-3">
            <input placeholder="Category" value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
              className="bg-dark-700 border border-white/8 rounded-xl px-4 py-2.5 text-sm text-white placeholder-white/30 focus:outline-none focus:border-brand-500/50" />
            <input placeholder="Tags (comma separated)" value={form.tags} onChange={e => setForm(f => ({ ...f, tags: e.target.value }))}
              className="bg-dark-700 border border-white/8 rounded-xl px-4 py-2.5 text-sm text-white placeholder-white/30 focus:outline-none focus:border-brand-500/50" />
          </div>

          {/* Video type toggle */}
          <div className="flex rounded-xl overflow-hidden border border-white/8">
            {['external', 'upload'].map(t => (
              <button key={t} type="button" onClick={() => setForm(f => ({ ...f, videoType: t }))}
                className={`flex-1 py-2 text-sm font-medium transition-colors ${form.videoType === t ? 'bg-brand-500 text-white' : 'bg-dark-700 text-white/40'}`}>
                {t === 'external' ? '🔗 URL' : '📁 Upload File'}
              </button>
            ))}
          </div>

          {form.videoType === 'external' ? (
            <input placeholder="Video URL (mp4, m3u8, YouTube...)" value={form.videoUrl} onChange={e => setForm(f => ({ ...f, videoUrl: e.target.value }))}
              className="w-full bg-dark-700 border border-white/8 rounded-xl px-4 py-2.5 text-sm text-white placeholder-white/30 focus:outline-none focus:border-brand-500/50" />
          ) : (
            <label className="flex flex-col items-center justify-center border-2 border-dashed border-white/15 rounded-xl p-6 cursor-pointer hover:border-brand-500/40 transition-colors">
              <Upload size={24} className="text-white/30 mb-2" />
              <span className="text-sm text-white/40">{videoFile ? videoFile.name : 'Click to select video file'}</span>
              <input type="file" accept="video/*" className="hidden" onChange={e => setVideoFile(e.target.files[0])} />
            </label>
          )}

          <label className="flex items-center gap-3 border border-white/8 rounded-xl p-3 cursor-pointer hover:border-brand-500/40 transition-colors">
            <Upload size={16} className="text-white/30" />
            <span className="text-sm text-white/40">{thumbFile ? thumbFile.name : 'Thumbnail image (optional)'}</span>
            <input type="file" accept="image/*" className="hidden" onChange={e => setThumbFile(e.target.files[0])} />
          </label>

          <button type="submit" disabled={loading}
            className="flex items-center justify-center gap-2 py-3 bg-brand-500 hover:bg-brand-600 disabled:opacity-60 rounded-xl text-white font-semibold text-sm transition-all mt-2">
            {loading ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />}
            {loading ? 'Adding...' : 'Add Video'}
          </button>
        </form>
      </div>
    </div>
  );
}

// ─── BROADCAST MODAL ──────────────────────────────────────
function BroadcastModal({ onClose }) {
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!message.trim()) return;
    setLoading(true);
    try {
      const { message: msg } = await sendBroadcast(message.trim());
      toast.success(msg);
      onClose();
    } catch (err) {
      toast.error('Broadcast failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="glass rounded-2xl w-full max-w-md">
        <div className="flex items-center justify-between p-6 border-b border-white/8">
          <h2 className="text-lg font-bold text-white">Broadcast Message</h2>
          <button onClick={onClose} className="p-2 rounded-lg text-white/40 hover:text-white/70"><X size={18} /></button>
        </div>
        <form onSubmit={handleSend} className="p-6 flex flex-col gap-4">
          <textarea
            placeholder="Message to all users..."
            value={message}
            onChange={e => setMessage(e.target.value)}
            rows={5}
            className="w-full bg-dark-700 border border-white/8 rounded-xl px-4 py-3 text-sm text-white placeholder-white/30 focus:outline-none focus:border-brand-500/50 resize-none"
            required
          />
          <button type="submit" disabled={loading}
            className="flex items-center justify-center gap-2 py-3 bg-brand-500 hover:bg-brand-600 disabled:opacity-60 rounded-xl text-white font-semibold text-sm">
            {loading ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
            Send to All Users
          </button>
        </form>
      </div>
    </div>
  );
}

// ─── MAIN ADMIN PAGE ──────────────────────────────────────
export default function AdminPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [tab, setTab] = useState('overview');
  const [stats, setStats] = useState(null);
  const [videos, setVideos] = useState([]);
  const [users, setUsers] = useState([]);
  const [loadingData, setLoadingData] = useState(false);
  const [showAddVideo, setShowAddVideo] = useState(false);
  const [showBroadcast, setShowBroadcast] = useState(false);
  const [videoSearch, setVideoSearch] = useState('');
  const [userSearch, setUserSearch] = useState('');

  const fetchStats = async () => {
    try {
      const data = await getAdminStats();
      setStats(data);
    } catch {}
  };

  const fetchVideos = async () => {
    setLoadingData(true);
    try {
      const data = await getAdminVideos({ search: videoSearch, limit: 50 });
      setVideos(data.videos);
    } catch {} finally { setLoadingData(false); }
  };

  const fetchUsers = async () => {
    setLoadingData(true);
    try {
      const data = await getAdminUsers({ search: userSearch, limit: 50 });
      setUsers(data.users);
    } catch {} finally { setLoadingData(false); }
  };

  useEffect(() => {
    if (tab === 'overview') fetchStats();
    if (tab === 'videos') fetchVideos();
    if (tab === 'users') fetchUsers();
  }, [tab]);

  const handleDeleteVideo = async (id, title) => {
    if (!confirm(`Delete "${title}"?`)) return;
    try {
      await deleteVideo(id);
      toast.success('Video deleted');
      fetchVideos();
    } catch { toast.error('Delete failed'); }
  };

  const handleToggleBan = async (id) => {
    try {
      const { user: u } = await toggleBanUser(id);
      toast.success(`User ${u.isBanned ? 'banned' : 'unbanned'}`);
      fetchUsers();
    } catch { toast.error('Action failed'); }
  };

  const handleToggleAdmin = async (id) => {
    try {
      await toggleAdminUser(id);
      toast.success('Admin status updated');
      fetchUsers();
    } catch { toast.error('Action failed'); }
  };

  const API_BASE = process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:5000';

  if (authLoading) return (
    <div className="min-h-screen bg-dark-900 flex items-center justify-center">
      <Loader2 size={40} className="animate-spin text-brand-500" />
    </div>
  );

  if (!user || !user.isAdmin) return <ComingSoon />;

  const tabs = [
    { id: 'overview', label: 'Overview', icon: BarChart2 },
    { id: 'videos', label: 'Videos', icon: Film },
    { id: 'users', label: 'Users', icon: Users },
  ];

  return (
    <div className="min-h-screen bg-dark-900">
      <Navbar />
      {showAddVideo && <AddVideoModal onClose={() => setShowAddVideo(false)} onSuccess={fetchVideos} />}
      {showBroadcast && <BroadcastModal onClose={() => setShowBroadcast(false)} />}

      <main className="max-w-7xl mx-auto px-4 pt-24 pb-16">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Shield size={20} className="text-brand-400" />
              <span className="text-xs font-semibold text-brand-400 uppercase tracking-wider">Admin Panel</span>
            </div>
            <h1 className="font-display text-4xl tracking-wider text-white">DASHBOARD</h1>
          </div>
          <button
            onClick={() => setShowBroadcast(true)}
            className="flex items-center gap-2 px-4 py-2 bg-dark-700 hover:bg-dark-600 border border-white/8 rounded-xl text-white/60 text-sm font-medium transition-all"
          >
            <Send size={15} /> Broadcast
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 p-1 bg-dark-800 rounded-xl mb-8 w-fit">
          {tabs.map(t => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium transition-all ${
                tab === t.id ? 'bg-brand-500 text-white shadow-lg shadow-brand-500/25' : 'text-white/40 hover:text-white/70'
              }`}
            >
              <t.icon size={15} /> {t.label}
            </button>
          ))}
        </div>

        {/* ── OVERVIEW TAB ── */}
        {tab === 'overview' && stats && (
          <div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              <StatCard icon={Users} label="Total Users" value={stats.stats.totalUsers} color="blue" />
              <StatCard icon={Film} label="Total Videos" value={stats.stats.totalVideos} color="brand" />
              <StatCard icon={Eye} label="Total Views" value={stats.stats.totalViews} color="green" />
              <StatCard icon={Ban} label="Banned Users" value={stats.stats.bannedUsers} color="red" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="glass rounded-2xl p-6">
                <h3 className="text-sm font-semibold text-white/40 uppercase tracking-wider mb-4">Recent Users</h3>
                <div className="flex flex-col gap-3">
                  {stats.recentUsers.map(u => (
                    <div key={u._id} className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-brand-600 flex items-center justify-center text-white text-xs font-bold shrink-0">
                        {(u.firstName || u.username || 'U')[0].toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm text-white/80 truncate">{u.firstName || u.username || 'Anonymous'}</div>
                        <div className="text-xs text-white/30">ID: {u.telegramId}</div>
                      </div>
                      {u.isAdmin && <span className="text-xs text-brand-400 bg-brand-500/10 px-2 py-0.5 rounded-full">Admin</span>}
                    </div>
                  ))}
                </div>
              </div>

              <div className="glass rounded-2xl p-6">
                <h3 className="text-sm font-semibold text-white/40 uppercase tracking-wider mb-4">Top Videos</h3>
                <div className="flex flex-col gap-3">
                  {stats.topVideos.map((v, i) => (
                    <div key={v._id} className="flex items-center gap-3">
                      <span className="text-xs font-bold text-white/20 w-5 shrink-0">#{i + 1}</span>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm text-white/80 truncate">{v.title}</div>
                        <div className="text-xs text-white/30">{v.views.toLocaleString()} views</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── VIDEOS TAB ── */}
        {tab === 'videos' && (
          <div>
            <div className="flex items-center gap-3 mb-6">
              <input
                placeholder="Search videos..."
                value={videoSearch}
                onChange={e => setVideoSearch(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && fetchVideos()}
                className="flex-1 bg-dark-700 border border-white/8 rounded-xl px-4 py-2.5 text-sm text-white placeholder-white/30 focus:outline-none focus:border-brand-500/50"
              />
              <button onClick={fetchVideos} className="p-2.5 bg-dark-700 border border-white/8 rounded-xl text-white/50 hover:text-white">
                <RefreshCw size={16} />
              </button>
              <button
                onClick={() => setShowAddVideo(true)}
                className="flex items-center gap-2 px-4 py-2.5 bg-brand-500 hover:bg-brand-600 rounded-xl text-white text-sm font-semibold transition-all"
              >
                <Plus size={16} /> Add Video
              </button>
            </div>

            {loadingData ? (
              <div className="flex justify-center py-16"><Loader2 size={32} className="animate-spin text-brand-500" /></div>
            ) : (
              <div className="glass rounded-2xl overflow-hidden">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-white/5">
                      <th className="text-left text-xs font-semibold text-white/30 uppercase tracking-wider px-6 py-4">Video</th>
                      <th className="text-left text-xs font-semibold text-white/30 uppercase tracking-wider px-4 py-4 hidden md:table-cell">Category</th>
                      <th className="text-left text-xs font-semibold text-white/30 uppercase tracking-wider px-4 py-4 hidden md:table-cell">Views</th>
                      <th className="text-left text-xs font-semibold text-white/30 uppercase tracking-wider px-4 py-4 hidden md:table-cell">Status</th>
                      <th className="px-6 py-4"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {videos.map(v => (
                      <tr key={v._id} className="hover:bg-white/2 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            {v.thumbnail ? (
                              <img src={`${API_BASE}${v.thumbnail}`} alt="" className="w-16 h-10 object-cover rounded-lg shrink-0" />
                            ) : (
                              <div className="w-16 h-10 bg-dark-600 rounded-lg flex items-center justify-center shrink-0">
                                <Film size={14} className="text-white/20" />
                              </div>
                            )}
                            <span className="text-sm text-white/80 line-clamp-1">{v.title}</span>
                          </div>
                        </td>
                        <td className="px-4 py-4 hidden md:table-cell">
                          <span className="text-xs text-white/40">{v.category}</span>
                        </td>
                        <td className="px-4 py-4 hidden md:table-cell">
                          <span className="text-xs text-white/40">{v.views.toLocaleString()}</span>
                        </td>
                        <td className="px-4 py-4 hidden md:table-cell">
                          <span className={`text-xs px-2 py-1 rounded-full ${v.isPublished ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'}`}>
                            {v.isPublished ? 'Published' : 'Hidden'}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <button
                            onClick={() => handleDeleteVideo(v._id, v.title)}
                            className="p-2 rounded-lg text-red-400/60 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                          >
                            <Trash2 size={15} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {videos.length === 0 && (
                  <div className="text-center py-16 text-white/20 text-sm">No videos found</div>
                )}
              </div>
            )}
          </div>
        )}

        {/* ── USERS TAB ── */}
        {tab === 'users' && (
          <div>
            <div className="flex items-center gap-3 mb-6">
              <input
                placeholder="Search by name, username or ID..."
                value={userSearch}
                onChange={e => setUserSearch(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && fetchUsers()}
                className="flex-1 bg-dark-700 border border-white/8 rounded-xl px-4 py-2.5 text-sm text-white placeholder-white/30 focus:outline-none focus:border-brand-500/50"
              />
              <button onClick={fetchUsers} className="p-2.5 bg-dark-700 border border-white/8 rounded-xl text-white/50 hover:text-white">
                <RefreshCw size={16} />
              </button>
            </div>

            {loadingData ? (
              <div className="flex justify-center py-16"><Loader2 size={32} className="animate-spin text-brand-500" /></div>
            ) : (
              <div className="glass rounded-2xl overflow-hidden">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-white/5">
                      <th className="text-left text-xs font-semibold text-white/30 uppercase tracking-wider px-6 py-4">User</th>
                      <th className="text-left text-xs font-semibold text-white/30 uppercase tracking-wider px-4 py-4 hidden md:table-cell">Telegram ID</th>
                      <th className="text-left text-xs font-semibold text-white/30 uppercase tracking-wider px-4 py-4 hidden md:table-cell">Joined</th>
                      <th className="text-left text-xs font-semibold text-white/30 uppercase tracking-wider px-4 py-4">Status</th>
                      <th className="px-6 py-4 text-right text-xs font-semibold text-white/30 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {users.map(u => (
                      <tr key={u._id} className="hover:bg-white/2 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-brand-600 flex items-center justify-center text-white text-xs font-bold shrink-0">
                              {(u.firstName || u.username || 'U')[0].toUpperCase()}
                            </div>
                            <div>
                              <div className="text-sm text-white/80">{u.firstName || u.username || 'Anonymous'}</div>
                              {u.username && <div className="text-xs text-white/30">@{u.username}</div>}
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-4 hidden md:table-cell">
                          <span className="text-xs text-white/40 font-mono">{u.telegramId}</span>
                        </td>
                        <td className="px-4 py-4 hidden md:table-cell">
                          <span className="text-xs text-white/40">{new Date(u.createdAt).toLocaleDateString()}</span>
                        </td>
                        <td className="px-4 py-4">
                          <div className="flex flex-col gap-1">
                            {u.isAdmin && <span className="text-xs bg-brand-500/10 text-brand-400 px-2 py-0.5 rounded-full w-fit">Admin</span>}
                            {u.isBanned && <span className="text-xs bg-red-500/10 text-red-400 px-2 py-0.5 rounded-full w-fit">Banned</span>}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2 justify-end">
                            <button
                              onClick={() => handleToggleAdmin(u._id)}
                              title={u.isAdmin ? 'Remove admin' : 'Make admin'}
                              className="p-1.5 rounded-lg text-brand-400/50 hover:text-brand-400 hover:bg-brand-500/10 transition-colors"
                            >
                              <Shield size={14} />
                            </button>
                            <button
                              onClick={() => handleToggleBan(u._id)}
                              title={u.isBanned ? 'Unban' : 'Ban'}
                              className={`p-1.5 rounded-lg transition-colors ${u.isBanned ? 'text-green-400/70 hover:text-green-400 hover:bg-green-500/10' : 'text-red-400/50 hover:text-red-400 hover:bg-red-500/10'}`}
                            >
                              <Ban size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {users.length === 0 && (
                  <div className="text-center py-16 text-white/20 text-sm">No users found</div>
                )}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
