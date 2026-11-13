import React, { useEffect, useState } from 'react';
import { AccountingPortal } from './features/accounting';
import { AdminLoginPage } from './features/auth/AdminLoginPage';

const getStoredToken = (): string | null =>
  localStorage.getItem('admin_token') ||
  localStorage.getItem('token') ||
  localStorage.getItem('access_token') ||
  sessionStorage.getItem('admin_token') ||
  sessionStorage.getItem('token') ||
  sessionStorage.getItem('access_token');

export function App() {
  const [token, setToken] = useState<string | null>(() => getStoredToken());
  const [adminEmail, setAdminEmail] = useState<string>(
    () => localStorage.getItem('admin_email') || 'Admin'
  );

  const handleLogout = () => {
    localStorage.removeItem('admin_token');
    localStorage.removeItem('token');
    localStorage.removeItem('access_token');
    localStorage.removeItem('admin_email');
    sessionStorage.removeItem('admin_token');
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('access_token');
    setToken(null);
  };

  useEffect(() => {
    const onAuthExpired = () => setToken(null);
    window.addEventListener('admin-auth-expired', onAuthExpired);
    return () => window.removeEventListener('admin-auth-expired', onAuthExpired);
  }, []);

  if (!token) {
    return (
      <AdminLoginPage
        onLoginSuccess={(newToken, email) => {
          setToken(newToken);
          setAdminEmail(email);
        }}
      />
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100">
      <div className="bg-slate-950/80 border-b border-slate-800 px-6 py-2 flex items-center justify-between text-xs text-slate-400">
        <span>
          Signed in as <strong className="text-slate-200">{adminEmail}</strong>
        </span>
        <button
          type="button"
          onClick={handleLogout}
          className="px-3 py-1 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors"
        >
          Sign Out
        </button>
      </div>
      <AccountingPortal />
    </div>
  );
}

export default App;