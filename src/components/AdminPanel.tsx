import React, { useState, useMemo } from 'react';
import { Entry } from '../types';
import { ArrowLeft, CheckCircle, XCircle, Clock, FileText, Download, X, User, Phone, MessageSquare, Edit3, Share2 } from 'lucide-react';

interface AdminPanelProps {
  entries: Entry[];
  loggedInUser: string | null;
  onBack: () => void;
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
  onUpdateRemarks: (id: string, remarks: string) => void;
}

const isAuthorized = (user: string | null, whomToMeet: string) => {
  if (!user) return false;
  if (user === 'Bhawna Khandelwal' || user === 'Anshuman') return true;
  
  const userLower = user.toLowerCase();
  const whomLower = (whomToMeet || '').toLowerCase();
  
  return whomLower.includes(userLower);
};

export function AdminPanel({ entries, loggedInUser, onBack, onApprove, onReject, onUpdateRemarks }: AdminPanelProps) {
  const [filter, setFilter] = useState<'all' | 'customer' | 'vendor'>('all');
  const [fullscreenImage, setFullscreenImage] = useState<string | null>(null);
  const [remarksEntry, setRemarksEntry] = useState<Entry | null>(null);
  const [remarksText, setRemarksText] = useState<string>('');

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

      {/* Remarks & Share Modal */}
      {remarksEntry && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-in fade-in duration-200" 
          onClick={() => setRemarksEntry(null)}
        >
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl relative flex flex-col gap-4" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-xl text-slate-900">Post-Visit Actions</h3>
              <button onClick={() => setRemarksEntry(null)} className="text-slate-400 hover:text-slate-600 transition-colors">
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div>
              <p className="text-sm font-medium text-slate-700">Visitor</p>
              <p className="text-slate-900 font-bold">{remarksEntry.name} ({remarksEntry.mobile})</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Remarks / New Details</label>
              <textarea 
                value={remarksText}
                onChange={e => setRemarksText(e.target.value)}
                className="w-full min-h-[100px] border border-slate-300 rounded-xl p-3 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none"
                placeholder="Add notes about the meeting..."
              ></textarea>
            </div>

            <div className="flex flex-col gap-3 mt-2">
              <button
                onClick={() => {
                  onUpdateRemarks(remarksEntry.id, remarksText);
                  setRemarksEntry(null);
                }}
                className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-xl transition-all shadow-md shadow-blue-600/20"
              >
                <CheckCircle className="w-5 h-5" />
                Save Remarks
              </button>
              
              <div className="relative flex items-center justify-center py-2">
                <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-200"></div></div>
                <div className="relative bg-white px-4 text-xs font-medium text-slate-400 uppercase">Or Share Request</div>
              </div>

              <a
                href={`sms:${remarksEntry.mobile}?body=${encodeURIComponent("Hi " + remarksEntry.name + ", thank you for visiting us! We hope you had a great experience. Please consider leaving us a review on Google: https://share.google/NdUcQ2SKTdxagGx3r")}`}
                className="w-full flex items-center justify-center gap-2 bg-green-50 text-green-700 hover:bg-green-100 border border-green-200 font-semibold py-3 px-4 rounded-xl transition-all"
              >
                <Share2 className="w-5 h-5" />
                SMS Google Review Link
              </a>
              <a
                href={`https://wa.me/${remarksEntry.mobile}?text=${encodeURIComponent("Hi " + remarksEntry.name + ", thank you for visiting us! We hope you had a great experience. Please consider leaving us a review on Google: https://share.google/NdUcQ2SKTdxagGx3r")}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full flex items-center justify-center gap-2 bg-[#25D366]/10 text-[#075E54] hover:bg-[#25D366]/20 border border-[#25D366]/30 font-semibold py-3 px-4 rounded-xl transition-all"
              >
                <MessageSquare className="w-5 h-5" />
                WhatsApp Review Link
              </a>
            </div>
          </div>
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
                      <div className="flex items-center gap-2 mt-0.5">
                        <p className="text-sm text-slate-500">{entry.mobile} {entry.visitorCount ? `• ${entry.visitorCount} person(s)` : ''}</p>
                        <a 
                          href={`tel:${entry.mobile}`}
                          className="inline-flex items-center justify-center p-1 bg-green-100 text-green-700 hover:bg-green-200 rounded-full transition-colors"
                          title="Call Customer"
                        >
                          <Phone className="w-3 h-3" />
                        </a>
                        <a 
                          href={`sms:${entry.mobile}`}
                          className="inline-flex items-center justify-center p-1 bg-blue-100 text-blue-700 hover:bg-blue-200 rounded-full transition-colors"
                          title="Message Customer"
                        >
                          <MessageSquare className="w-3 h-3" />
                        </a>
                      </div>
                      {entry.remarks && (
                        <p className="mt-2 text-xs text-slate-600 bg-slate-100 p-2 rounded-lg border border-slate-200">
                          <span className="font-semibold block mb-1">Remarks:</span>
                          {entry.remarks}
                        </p>
                      )}
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
                      {entry.status === 'approved' && (
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => {
                              setRemarksEntry(entry);
                              setRemarksText(entry.remarks || '');
                            }}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Add Remarks / Share"
                          >
                            <Edit3 className="w-5 h-5" />
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
