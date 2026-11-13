import React, { useState } from 'react';
import axios from 'axios';

interface AdminLoginPageProps {
  onLoginSuccess: (token: string, email: string) => void;
}

const getAuthBaseUrl = (): string => {
  if (import.meta.env?.VITE_API_URL) {
    return `${import.meta.env.VITE_API_URL}/admin/auth`;
  }
  return 'http://127.0.0.1:8000/admin/auth';
};

export const AdminLoginPage: React.FC<AdminLoginPageProps> = ({ onLoginSuccess }) => {
  const [email, setEmail] = useState('admin@hamads.com');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const { data } = await axios.post(`${getAuthBaseUrl()}/login`, {
        email: email.trim(),
        password,
      });

      const token: string | undefined = data?.access_token || data?.token;
      if (!token) {
        throw new Error('Server did not return an access token.');
      }

      localStorage.setItem('admin_token', token);
      localStorage.setItem('admin_email', email.trim());
      onLoginSuccess(token, email.trim());
    } catch (err: any) {
      const detail =
        err?.response?.data?.detail ||
        err?.message ||
        'Login failed. Check your admin credentials.';
      setError(typeof detail === 'string' ? detail : JSON.stringify(detail));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-slate-800/90 border border-slate-700 rounded-2xl shadow-2xl p-8">
        <div className="mb-6">
          <span className="inline-block text-xs font-semibold uppercase tracking-wider text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-full mb-3">
            Hamads Finance &amp; IFRS Ledger
          </span>
          <h1 className="text-2xl font-bold text-white">Admin Portal Sign In</h1>
          <p className="text-sm text-slate-400 mt-1">
            Sign in with your administrator credentials to access accounting and payouts.
          </p>
        </div>

        {error && (
          <div className="mb-4 rounded-lg bg-red-500/10 border border-red-500/30 px-4 py-3 text-sm text-red-300">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="admin-email" className="block text-sm font-medium text-slate-300 mb-1.5">
              Admin Email
            </label>
            <input
              id="admin-email"
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@hamads.com"
              className="w-full rounded-lg bg-slate-900 border border-slate-700 px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
            />
          </div>

          <div>
            <label htmlFor="admin-password" className="block text-sm font-medium text-slate-300 mb-1.5">
              Password
            </label>
            <input
              id="admin-password"
              type="password"
              required
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••••••"
              className="w-full rounded-lg bg-slate-900 border border-slate-700 px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-2.5 px-4 text-sm transition-colors"
          >
            {loading ? 'Authenticating...' : 'Sign In to Accounting Portal'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AdminLoginPage;
