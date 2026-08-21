import React, { useState, useMemo } from 'react';
import { Entry } from '../types';
import { ArrowLeft, CheckCircle, XCircle, Clock, FileText, Download, X, User } from 'lucide-react';

interface AdminPanelProps {
  entries: Entry[];
  loggedInUser: string | null;
  onBack: () => void;
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
}

const isAuthorized = (user: string | null, whomToMeet: string) => {
  if (!user) return false;
  if (user === 'Bhawna Khandelwal' || user === 'Anshuman') return true;
  
  const userLower = user.toLowerCase();
  const whomLower = (whomToMeet || '').toLowerCase();
  
  return whomLower.includes(userLower);
};

export function AdminPanel({ entries, loggedInUser, onBack, onApprove, onReject }: AdminPanelProps) {
  const [filter, setFilter] = useState<'all' | 'customer' | 'vendor'>('all');
  const [fullscreenImage, setFullscreenImage] = useState<string | null>(null);

  // Filter entries to only those authorized for the current user
  const authorizedEntries = useMemo(() => {
    return entries.filter(e => isAuthorized(loggedInUser, e.whomToMeet));
  }, [entries, loggedInUser]);

  const filteredEntries = useMemo(() => {
    let result = authorizedEntries;
    if (filter !== 'all') {
      result = result.filter((e) => e.type === filter);
    }
    // Sort by newest first
    return result.sort((a, b) => b.timestamp - a.timestamp);
  }, [authorizedEntries, filter]);

  // Stats should reflect only authorized entries
  const totalEntries = authorizedEntries.length;
  const approvedEntries = authorizedEntries.filter((e) => e.status === 'approved').length;
  const pendingEntries = authorizedEntries.filter((e) => e.status === 'pending').length;

  return (
    <div className="min-h-screen bg-slate-50 p-6 md:p-10">
      
      {/* Fullscreen Image Overlay */}
      {fullscreenImage && (
        <div 
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4 sm:p-8 cursor-pointer animate-in fade-in duration-200"
          onClick={() => setFullscreenImage(null)}
        >
          <button className="absolute top-6 right-6 p-2 text-white hover:bg-white/10 rounded-full transition-colors">
            <X className="w-8 h-8" />
          </button>
          <img 
            src={fullscreenImage} 
            alt="Fullscreen visitor" 
            className="max-w-full max-h-full object-contain rounded-xl shadow-2xl" 
          />
        </div>
      )}

      <div className="max-w-7xl mx-auto space-y-8">

        
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={onBack}
              className="p-3 bg-white hover:bg-slate-100 text-slate-700 rounded-xl shadow-sm transition-colors border border-slate-200"
              title="Logout"
            >
              <ArrowLeft className="w-6 h-6" />
            </button>
            <div>
              <h1 className="text-3xl font-bold text-slate-900">Admin Dashboard</h1>
              {loggedInUser && (
                <p className="text-slate-500 font-medium flex items-center gap-2 mt-1">
                  <User className="w-4 h-4" /> Welcome, {loggedInUser}
                </p>
              )}
            </div>
          </div>
          
          <div className="flex gap-4">
            <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-lg font-medium hover:bg-slate-50">
              <Download className="w-4 h-4" />
              Weekly Report
            </button>
            <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-lg font-medium hover:bg-slate-50">
              <Download className="w-4 h-4" />
              Monthly Report
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center">
              <FileText className="w-6 h-6" />
            </div>
            <div>
              <p className="text-slate-500 font-medium">Total Entries</p>
              <p className="text-2xl font-bold text-slate-900">{totalEntries}</p>
            </div>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex items-center gap-4">
            <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center">
              <CheckCircle className="w-6 h-6" />
            </div>
            <div>
              <p className="text-slate-500 font-medium">Approved</p>
              <p className="text-2xl font-bold text-slate-900">{approvedEntries}</p>
            </div>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex items-center gap-4">
            <div className="w-12 h-12 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center">
              <Clock className="w-6 h-6" />
            </div>
            <div>
              <p className="text-slate-500 font-medium">Pending</p>
              <p className="text-2xl font-bold text-slate-900">{pendingEntries}</p>
            </div>
          </div>
        </div>

        {/* Filters & Table */}
        <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex items-center justify-between">
            <h2 className="text-xl font-bold text-slate-800">Visitor Logs</h2>
            <div className="flex gap-2 bg-slate-100 p-1 rounded-lg">
              {(['all', 'customer', 'vendor'] as const).map((type) => (
                <button
                  key={type}
                  onClick={() => setFilter(type)}
                  className={`px-4 py-2 rounded-md font-medium text-sm capitalize transition-colors ${
                    filter === type ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 text-slate-500 text-sm uppercase tracking-wider">
                  <th className="p-4 font-semibold">Photo</th>
                  <th className="p-4 font-semibold">Visitor</th>
                  <th className="p-4 font-semibold">Host / Meet With</th>
                  <th className="p-4 font-semibold">Type</th>
                  <th className="p-4 font-semibold">Time</th>
                  <th className="p-4 font-semibold">Status</th>
                  <th className="p-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredEntries.map((entry) => (
                  <tr key={entry.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="p-4">
                      {entry.photo ? (
                        <img 
                          src={entry.photo} 
                          alt={entry.name} 
                          className="w-12 h-12 rounded-lg object-cover bg-slate-100 cursor-pointer hover:opacity-80 transition-opacity hover:shadow-md" 
                          onClick={() => setFullscreenImage(entry.photo)}
                          title="Click to view full image"
                        />
                      ) : (
                        <div className="w-12 h-12 bg-slate-100 rounded-lg flex items-center justify-center text-slate-400">
                          No Pic
                        </div>
                      )}
                    </td>
                    <td className="p-4">
                      <p className="font-bold text-slate-900">{entry.name}</p>
                      <p className="text-sm text-slate-500">{entry.mobile} {entry.visitorCount ? `• ${entry.visitorCount} person(s)` : ''}</p>
                    </td>
                    <td className="p-4">
                      <span className="text-sm font-medium text-slate-700">{entry.whomToMeet || 'N/A'}</span>
                    </td>
                    <td className="p-4">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium capitalize ${
                        entry.type === 'customer' ? 'bg-blue-100 text-blue-700' : 'bg-amber-100 text-amber-700'
                      }`}>
                        {entry.type}
                      </span>
                    </td>
                    <td className="p-4 text-sm text-slate-600">
                      {new Date(entry.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td className="p-4">
                      {entry.status === 'pending' && <span className="text-amber-600 bg-amber-50 px-3 py-1 rounded-full text-xs font-semibold">Pending</span>}
                      {entry.status === 'approved' && <span className="text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full text-xs font-semibold">Approved</span>}
                      {entry.status === 'rejected' && <span className="text-red-600 bg-red-50 px-3 py-1 rounded-full text-xs font-semibold">Rejected</span>}
                    </td>
                    <td className="p-4 text-right">
                      {entry.status === 'pending' && (
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => onApprove(entry.id)}
                            className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                            title="Approve"
                          >
                            <CheckCircle className="w-5 h-5" />
                          </button>
                          <button
                            onClick={() => onReject(entry.id)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Reject"
                          >
                            <XCircle className="w-5 h-5" />
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
                {filteredEntries.length === 0 && (
                  <tr>
                    <td colSpan={7} className="p-8 text-center text-slate-500">
                      No logs found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
}
