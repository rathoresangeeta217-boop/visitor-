import React, { useState, useEffect, Suspense, lazy } from 'react';
import { Users, Truck, ArrowLeft, Send, Camera, ShieldCheck, CheckCircle, XCircle, UserCircle, LogOut } from 'lucide-react';
import { CameraCapture } from './components/CameraCapture';
import { VoiceInput } from './components/VoiceInput';
import { SelectInput } from './components/SelectInput';
import { AdminLogin } from './components/AdminLogin';
import { FormData, Entry } from './types';
import { db } from './lib/firebase';
import { collection, addDoc, onSnapshot, query, orderBy, updateDoc, doc } from 'firebase/firestore';

// Lazy load admin panel for performance optimization
const AdminPanel = lazy(() => import('./components/AdminPanel').then(m => ({ default: m.AdminPanel })));

type ViewState = 'home' | 'customer' | 'vendor' | 'success' | 'admin_login' | 'admin';

const MEET_OPTIONS = [
  'Deepak Khandelwal',
  'Bhawna Khandelwal',
  'Khushboo Modi (Sales Manager)',
  'Nidhi Sharma (General & purchase Manger)',
  'Anshuman Singh',
  'Abhilasha'
];

const INITIAL_FORM_DATA: FormData = {
  photo: '',
  name: '',
  mobile: '',
  email: '',
  address: '',
  visitorCount: '',
  whomToMeet: '',
};

const isAuthorized = (user: string | null, whomToMeet: string) => {
  if (!user) return false;
  if (user === 'Bhawna Khandelwal' || user === 'Anshuman') return true;
  
  const userLower = user.toLowerCase();
  const whomLower = (whomToMeet || '').toLowerCase();
  
  return whomLower.includes(userLower);
};

export default function App() {
  const [view, setView] = useState<ViewState>('home');
  const [formData, setFormData] = useState<FormData>(INITIAL_FORM_DATA);
  const [entries, setEntries] = useState<Entry[]>([]);
  const [activeNotification, setActiveNotification] = useState<Entry | null>(null);
  const [loggedInUser, setLoggedInUser] = useState<string | null>(null);

  // Firestore real-time sync
  useEffect(() => {
    const q = query(collection(db, 'entries'), orderBy('timestamp', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedEntries: Entry[] = [];
      snapshot.forEach((doc) => {
        fetchedEntries.push({ id: doc.id, ...doc.data() } as Entry);
      });
      
      // Look for new pending entries to show notification
      const newestPending = fetchedEntries.find(e => e.status === 'pending');
      if (newestPending && isAuthorized(loggedInUser, newestPending.whomToMeet)) {
        // Compare with current activeNotification to prevent re-triggering for the same entry constantly
        setActiveNotification(prev => {
          if (prev?.id !== newestPending.id) {
            // Send system notification if supported and permitted
            if ('Notification' in window && Notification.permission === 'granted') {
              const notif = new Notification(`New ${newestPending.type} Entry`, {
                body: `${newestPending.name} (${newestPending.mobile}) is waiting for approval to meet ${newestPending.whomToMeet}.`,
                icon: newestPending.photo || undefined,
              });
              notif.onclick = () => {
                window.focus();
                notif.close();
              };
            }
            return newestPending;
          }
          return prev;
        });
      } else {
        setActiveNotification(null);
      }
      
      setEntries(fetchedEntries);
    });

    return () => unsubscribe();
  }, [loggedInUser]);

  // Auto-approve after 60 seconds
  useEffect(() => {
    if (activeNotification) {
      const timer = setTimeout(() => {
        handleApprove(activeNotification.id);
      }, 60000);
      return () => clearTimeout(timer);
    }
  }, [activeNotification]);

  const handleSelectType = (type: 'customer' | 'vendor') => {
    setFormData(INITIAL_FORM_DATA);
    setView(type);
  };

  const updateField = (field: keyof FormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.mobile || !formData.photo || !formData.whomToMeet) {
      alert('Please fill in Name, Mobile Number, Whom to Meet, and Capture Photo.');
      return;
    }
    
    const newEntry = {
      ...formData,
      type: view as 'customer' | 'vendor',
      timestamp: Date.now(),
      status: 'pending'
    };

    try {
      await addDoc(collection(db, 'entries'), newEntry);
      
      setView('success');
      
      // Auto return to home after 3 seconds
      setTimeout(() => {
        setView('home');
      }, 3000);
    } catch (err) {
      console.error('Error adding document: ', err);
      alert('Failed to submit entry. Please try again.');
    }
  };

  const handleApprove = async (id: string) => {
    try {
      await updateDoc(doc(db, 'entries', id), { status: 'approved' });
      if (activeNotification?.id === id) setActiveNotification(null);
    } catch (err) {
      console.error('Error approving entry: ', err);
    }
  };

  const handleReject = async (id: string) => {
    try {
      await updateDoc(doc(db, 'entries', id), { status: 'rejected' });
      if (activeNotification?.id === id) setActiveNotification(null);
    } catch (err) {
      console.error('Error rejecting entry: ', err);
    }
  };

  const handleAdminAccess = () => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
    setView('admin_login');
  };

  const handleLoginSuccess = (user: string) => {
    setLoggedInUser(user);
    setView('admin');
  };

  return (
    <div className="relative min-h-screen bg-slate-50">
      {view === 'admin_login' && (
        <AdminLogin onLoginSuccess={handleLoginSuccess} onBack={() => setView('home')} />
      )}

      {view === 'admin' && (
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-slate-50 font-medium text-slate-500">Loading Admin Dashboard...</div>}>
          <AdminPanel 
            entries={entries} 
            loggedInUser={loggedInUser}
            onBack={() => {
              setLoggedInUser(null);
              setView('home');
            }} 
            onApprove={handleApprove} 
            onReject={handleReject} 
          />
        </Suspense>
      )}

      {/* Global Notification Overlay */}
      {view === 'admin' && activeNotification && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[100] animate-in fade-in slide-in-from-top-4 duration-300">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 p-4 w-[400px] flex flex-col gap-3">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
                {activeNotification.photo ? (
                  <img src={activeNotification.photo} alt="visitor" className="w-full h-full object-cover rounded-full" />
                ) : (
                  <Users className="w-6 h-6 text-blue-600" />
                )}
              </div>
              <div>
                <p className="text-sm font-bold text-slate-900">New {activeNotification.type} Entry</p>
                <p className="text-xs text-slate-500">{activeNotification.name} ({activeNotification.mobile})</p>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => handleReject(activeNotification.id)}
                className="flex-1 flex items-center justify-center gap-2 py-2 px-3 bg-slate-100 hover:bg-red-50 text-slate-700 hover:text-red-600 rounded-lg text-sm font-semibold transition-colors"
              >
                <XCircle className="w-4 h-4" /> Reject
              </button>
              <button
                onClick={() => handleApprove(activeNotification.id)}
                className="flex-1 flex items-center justify-center gap-2 py-2 px-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-semibold transition-colors shadow-md shadow-emerald-600/20"
              >
                <CheckCircle className="w-4 h-4" /> Approve
              </button>
            </div>
            <p className="text-[10px] text-slate-400 text-center uppercase tracking-wider">Auto-approves in 60s</p>
          </div>
        </div>
      )}

      {view === 'success' && (
        <div className="min-h-screen flex items-center justify-center p-6">
          <div className="bg-white p-12 rounded-3xl shadow-xl flex flex-col items-center max-w-lg w-full text-center">
            <div className="w-24 h-24 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mb-6">
              <Send className="w-12 h-12" />
            </div>
            <h2 className="text-3xl font-bold text-slate-900 mb-2">Entry Logged</h2>
            <p className="text-lg text-slate-500">
              Thank you. The entry has been successfully recorded.
            </p>
          </div>
        </div>
      )}

      {(view === 'customer' || view === 'vendor') && (
        <div className="min-h-screen flex flex-col items-center py-10 px-4 sm:px-6 lg:px-8">
          <div className="w-full max-w-4xl flex items-center justify-between mb-8">
            <button
              onClick={() => setView('home')}
              className="flex items-center gap-2 px-4 py-3 bg-white hover:bg-slate-100 text-slate-700 rounded-xl font-semibold shadow-sm transition-colors border border-slate-200"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Back to Home</span>
            </button>
            <h1 className="text-3xl font-bold text-slate-900 capitalize">
              {view} Registration
            </h1>
            <div className="w-[140px]" /> {/* Spacer for centering */}
          </div>

          <form onSubmit={handleSubmit} className="w-full max-w-4xl grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* Left Column: Camera Capture */}
            <div className="lg:col-span-5 flex flex-col items-center bg-white p-8 rounded-3xl shadow-sm border border-slate-200">
              <h2 className="text-xl font-bold text-slate-800 mb-6 w-full text-center">Live Photo Capture</h2>
              <CameraCapture onCapture={(src) => updateField('photo', src)} />
              
              {formData.photo && (
                <div className="mt-6 p-4 bg-blue-50 text-blue-800 rounded-xl w-full text-center font-medium">
                  Image captured successfully
                </div>
              )}
            </div>

            {/* Right Column: Form Fields */}
            <div className="lg:col-span-7 bg-white p-8 sm:p-10 rounded-3xl shadow-sm border border-slate-200 flex flex-col gap-6">
              {!formData.photo ? (
                <div className="flex-1 flex flex-col items-center justify-center text-center py-12 px-4 h-full">
                  <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-6">
                    <Camera className="w-10 h-10 text-slate-300" />
                  </div>
                  <h3 className="text-2xl font-bold text-slate-800 mb-2">Photo Required</h3>
                  <p className="text-slate-500 text-lg max-w-sm mx-auto">
                    Please capture a live photo using the camera before filling out the visitor details.
                  </p>
                </div>
              ) : (
                <>
                  <VoiceInput
                    label="Full Name"
                    placeholder="e.g. John Doe"
                    value={formData.name}
                    onChangeText={(text) => updateField('name', text)}
                    required
                  />
                  
                  <VoiceInput
                    label="Mobile Number"
                    placeholder="e.g. 555-0123"
                    type="tel"
                    value={formData.mobile}
                    onChangeText={(text) => updateField('mobile', text)}
                    required
                  />
                  
                  <VoiceInput
                    label="Email Address"
                    placeholder="e.g. john@example.com"
                    type="email"
                    value={formData.email}
                    onChangeText={(text) => updateField('email', text)}
                  />
                  
                  <VoiceInput
                    label="Home / Office Address"
                    placeholder="e.g. 123 Main St"
                    value={formData.address}
                    onChangeText={(text) => updateField('address', text)}
                  />
                  
                  <SelectInput
                    label="Whom to Meet"
                    value={formData.whomToMeet}
                    onChangeSelect={(value) => updateField('whomToMeet', value)}
                    options={MEET_OPTIONS}
                    icon={<UserCircle className="w-5 h-5" />}
                    required
                  />
                  
                  <VoiceInput
                    label="Number of Visitors"
                    placeholder="e.g. 1"
                    type="number"
                    min="1"
                    value={formData.visitorCount}
                    onChangeText={(text) => updateField('visitorCount', text)}
                  />

                  <div className="pt-6 border-t border-slate-100 mt-2">
                    <button
                      type="submit"
                      className="w-full flex items-center justify-center gap-3 bg-blue-600 hover:bg-blue-700 text-white py-5 rounded-2xl text-xl font-bold shadow-lg shadow-blue-600/20 transition-all active:scale-[0.98]"
                    >
                      <span>Submit Entry</span>
                      <Send className="w-6 h-6" />
                    </button>
                  </div>
                </>
              )}
            </div>
          </form>
        </div>
      )}

      {view === 'home' && (
        <div className="min-h-screen flex flex-col items-center justify-center p-6">
          {/* Admin Access Button */}
          <button
            onClick={handleAdminAccess}
            className="absolute top-6 right-6 flex items-center gap-2 px-4 py-2 bg-white hover:bg-slate-100 text-slate-600 rounded-lg shadow-sm border border-slate-200 font-medium transition-colors"
          >
            <ShieldCheck className="w-5 h-5" />
            <span>Admin Panel</span>
          </button>

          <div className="max-w-3xl w-full">
            <div className="text-center mb-16">
              <h1 className="text-5xl font-extrabold text-slate-900 mb-4 tracking-tight">Gate Entry System</h1>
              <p className="text-xl text-slate-500 font-medium">Please select your visitor type to begin registration.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
              <button
                onClick={() => handleSelectType('customer')}
                className="group flex flex-col items-center justify-center gap-6 p-12 bg-white hover:bg-blue-50 border-2 border-transparent hover:border-blue-200 rounded-[2.5rem] shadow-xl hover:shadow-2xl hover:shadow-blue-900/5 transition-all duration-300"
              >
                <div className="w-32 h-32 bg-blue-100 group-hover:bg-blue-600 text-blue-600 group-hover:text-white rounded-[2rem] flex items-center justify-center transition-colors duration-300">
                  <Users className="w-16 h-16" />
                </div>
                <h2 className="text-3xl font-bold text-slate-800 group-hover:text-blue-900">Customer</h2>
              </button>

              <button
                onClick={() => handleSelectType('vendor')}
                className="group flex flex-col items-center justify-center gap-6 p-12 bg-white hover:bg-amber-50 border-2 border-transparent hover:border-amber-200 rounded-[2.5rem] shadow-xl hover:shadow-2xl hover:shadow-amber-900/5 transition-all duration-300"
              >
                <div className="w-32 h-32 bg-amber-100 group-hover:bg-amber-500 text-amber-600 group-hover:text-white rounded-[2rem] flex items-center justify-center transition-colors duration-300">
                  <Truck className="w-16 h-16" />
                </div>
                <h2 className="text-3xl font-bold text-slate-800 group-hover:text-amber-900">Vendor</h2>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
