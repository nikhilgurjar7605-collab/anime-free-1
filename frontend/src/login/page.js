'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/AuthContext';
import { loginWithTelegram } from '@/lib/api';
import toast from 'react-hot-toast';
import { Play, Send, Loader2, Info } from 'lucide-react';

export default function LoginPage() {
  const { user, login } = useAuth();
  const router = useRouter();
  const [telegramId, setTelegramId] = useState('');
  const [firstName, setFirstName] = useState('');
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) router.replace('/');
  }, [user]);

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!telegramId.trim()) {
      toast.error('Please enter your Telegram ID');
      return;
    }
    setLoading(true);
    try {
      const data = await loginWithTelegram({
        telegramId: telegramId.trim(),
        firstName: firstName.trim(),
        username: username.trim(),
      });
      login(data.token, data.user);
      toast.success(`Welcome, ${data.user.firstName || data.user.username || 'User'}!`);
      router.replace('/');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-dark-900 flex items-center justify-center px-4">
      {/* Background effect */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-brand-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 left-1/3 w-64 h-64 bg-brand-600/5 rounded-full blur-3xl" />
      </div>

      <div className="relative w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-brand-500 rounded-2xl mb-5 shadow-xl shadow-brand-500/30">
            <Play size={28} fill="white" className="text-white" />
          </div>
          <h1 className="font-display text-5xl tracking-wider gradient-text mb-2">STREAMVAULT</h1>
          <p className="text-white/40 text-sm">Login with your Telegram ID to continue</p>
        </div>

        {/* Card */}
        <div className="glass rounded-2xl p-8">
          <form onSubmit={handleLogin} className="flex flex-col gap-5">
            <div>
              <label className="block text-xs font-semibold text-white/50 uppercase tracking-wider mb-2">
                Telegram ID <span className="text-brand-400">*</span>
              </label>
              <div className="relative">
                <Send size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
                <input
                  type="text"
                  value={telegramId}
                  onChange={e => setTelegramId(e.target.value)}
                  placeholder="e.g. 123456789"
                  className="w-full bg-dark-700 border border-white/8 rounded-xl pl-10 pr-4 py-3 text-white placeholder-white/20 focus:outline-none focus:border-brand-500/50 transition-colors text-sm"
                  required
                />
              </div>
              <div className="flex items-start gap-1.5 mt-2">
                <Info size={12} className="text-white/25 mt-0.5 shrink-0" />
                <p className="text-xs text-white/25">
                  Get your ID by messaging <span className="text-brand-400/70">@userinfobot</span> on Telegram
                </p>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-white/50 uppercase tracking-wider mb-2">
                First Name <span className="text-white/25">(optional)</span>
              </label>
              <input
                type="text"
                value={firstName}
                onChange={e => setFirstName(e.target.value)}
                placeholder="Your name"
                className="w-full bg-dark-700 border border-white/8 rounded-xl px-4 py-3 text-white placeholder-white/20 focus:outline-none focus:border-brand-500/50 transition-colors text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-white/50 uppercase tracking-wider mb-2">
                Telegram Username <span className="text-white/25">(optional)</span>
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30 text-sm">@</span>
                <input
                  type="text"
                  value={username}
                  onChange={e => setUsername(e.target.value)}
                  placeholder="username"
                  className="w-full bg-dark-700 border border-white/8 rounded-xl pl-8 pr-4 py-3 text-white placeholder-white/20 focus:outline-none focus:border-brand-500/50 transition-colors text-sm"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="flex items-center justify-center gap-2 w-full py-3.5 bg-brand-500 hover:bg-brand-600 disabled:opacity-60 rounded-xl text-white font-semibold text-sm transition-all shadow-lg shadow-brand-500/25 mt-1"
            >
              {loading ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
              {loading ? 'Logging in...' : 'Continue with Telegram ID'}
            </button>
          </form>
        </div>

        <p className="text-center text-xs text-white/20 mt-6">
          By logging in you agree to our Terms of Service
        </p>
      </div>
    </div>
  );
}
