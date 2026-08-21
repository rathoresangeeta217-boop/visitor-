import React, { useState } from 'react';
import { Lock, User, ArrowLeft, ChevronDown } from 'lucide-react';

const ADMIN_CREDENTIALS: Record<string, string> = {
  'Bhawna Khandelwal': 'Bhawna1718',
  'Deepak Khandelwal': 'Deepak1234',
  'Anshuman': 'Anshu9785',
  'Abhilasha': 'Abhi6462',
  'khushboo': 'khushi7608',
};

interface AdminLoginProps {
  onLoginSuccess: (user: string) => void;
  onBack: () => void;
}

export function AdminLogin({ onLoginSuccess, onBack }: AdminLoginProps) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (ADMIN_CREDENTIALS[username] === password) {
      onLoginSuccess(username);
    } else {
      setError('Invalid password. Please try again.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-slate-50">
      <div className="bg-white p-8 sm:p-10 rounded-3xl shadow-xl w-full max-w-md border border-slate-100">
        <button 
          onClick={onBack}
          className="flex items-center gap-2 text-slate-500 hover:text-slate-900 mb-8 transition-colors font-medium"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to Home
        </button>

        <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center mb-6">
          <Lock className="w-8 h-8" />
        </div>

        <h1 className="text-3xl font-bold text-slate-900 mb-2">Admin Login</h1>
        <p className="text-slate-500 mb-8 font-medium">Please enter your credentials to access the admin panel.</p>

        <form onSubmit={handleLogin} className="space-y-5">
          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-700 ml-1 uppercase tracking-wider">Select User</label>
            <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <select
                value={username}
                onChange={(e) => { setUsername(e.target.value); setError(''); }}
                className="w-full bg-slate-50 border-2 border-slate-200 rounded-xl py-4 pl-12 pr-10 text-base font-semibold text-slate-900 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all outline-none appearance-none"
                required
              >
                <option value="" disabled>Choose your name...</option>
                {Object.keys(ADMIN_CREDENTIALS).map(name => (
                  <option key={name} value={name}>{name}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none" />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-700 ml-1 uppercase tracking-wider">Password</label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="password"
                value={password}
                onChange={(e) => { setPassword(e.target.value); setError(''); }}
                className="w-full bg-slate-50 border-2 border-slate-200 rounded-xl py-4 pl-12 pr-4 text-base font-semibold text-slate-900 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all outline-none"
                placeholder="Enter password"
                required
              />
            </div>
          </div>

          {error && (
            <div className="p-3 bg-red-50 text-red-600 text-sm font-semibold rounded-lg border border-red-100">
              {error}
            </div>
          )}

          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-4 rounded-xl text-lg font-bold shadow-lg shadow-blue-600/20 transition-all active:scale-[0.98] mt-4"
          >
            Login to Dashboard
          </button>
        </form>
      </div>
    </div>
  );
}
