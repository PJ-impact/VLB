import React, { useState } from 'react';
import { api } from '../api/client';
import { 
  Building2, 
  User, 
  CheckCircle2, 
  AlertCircle, 
  ArrowRight,
  ShieldCheck,
  RotateCcw
} from 'lucide-react';
import { Link } from 'react-router-dom';

export const KioskPage: React.FC = () => {
  const [name, setName] = useState('');
  const [isCompany, setIsCompany] = useState(false);
  const [affiliation, setAffiliation] = useState('');
  const [hostName, setHostName] = useState('');
  const [department, setDepartment] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const resetForm = () => {
    setName('');
    setIsCompany(false);
    setAffiliation('');
    setHostName('');
    setDepartment('');
    setStatus('idle');
    setErrorMessage('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');
    setErrorMessage('');

    // Format both fields for the host payload
    const hostPayload = department ? `${hostName} - ${department}` : hostName;

    try {
      await api.post('/visitors/check-in', {
        name,
        isCompany,
        affiliation,
        host: hostPayload,
      });
      setStatus('success');
    } catch (err: any) {
      setStatus('error');
      setErrorMessage(
        err.response?.data?.message || 'Check-in failed. Please verify your details or consult the front desk.'
      );
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between">
      {/* Header bar */}
      <header className="w-full bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="bg-blue-600 text-white p-2 rounded-lg font-bold text-lg">
            VLB
          </div>
          <div>
            <h1 className="font-bold text-slate-800 leading-tight">Visitor Self-Service</h1>
            <p className="text-xs text-slate-500">Facility Access Registration</p>
          </div>
        </div>
        <Link
          to="/login"
          className="text-xs font-semibold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-md transition"
        >
          Staff Portal
        </Link>
      </header>

      {/* Main Form Container */}
      <main className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-lg bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
          {status === 'success' ? (
            <div className="text-center py-6 space-y-4">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 text-green-600">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-slate-900">You are checked in!</h2>
                <p className="text-slate-600 mt-2 text-sm">
                  Welcome, <span className="font-semibold text-slate-800">{name}</span>. Your arrival notification has been routed to{' '}
                  <span className="font-semibold text-slate-800">{hostName}</span>
                  {department && <span> in <span className="font-semibold text-slate-800">{department}</span></span>}.
                </p>
              </div>

              <div className="pt-4">
                <button
                  type="button"
                  onClick={resetForm}
                  className="w-full inline-flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-medium transition"
                >
                  <RotateCcw className="w-4 h-4" /> Check In Another Guest
                </button>
              </div>
            </div>
          ) : (
            <>
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-slate-900">Visitor Registration</h2>
                <p className="text-sm text-slate-500 mt-1">
                  Please provide your details to receive building clearance.
                </p>
              </div>

              {status === 'error' && (
                <div className="mb-5 p-3.5 rounded-lg bg-red-50 border border-red-200 flex items-start gap-2.5 text-red-700 text-sm">
                  <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                  <span>{errorMessage}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1">
                    Full Name
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Jane Doe"
                    className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                </div>

                {/* Entity Category Dynamic Toggle */}
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                    Visit Classification
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setIsCompany(false)}
                      className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg border text-sm font-medium transition ${
                        !isCompany
                          ? 'border-blue-600 bg-blue-50/70 text-blue-700'
                          : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      <User className="w-4 h-4" /> Individual / Guest
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsCompany(true)}
                      className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg border text-sm font-medium transition ${
                        isCompany
                          ? 'border-blue-600 bg-blue-50/70 text-blue-700'
                          : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      <Building2 className="w-4 h-4" /> Company / Vendor
                    </button>
                  </div>
                </div>

                {/* Dynamic Affiliation / Purpose Input */}
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1">
                    {isCompany ? 'Company / Organization Name' : 'Purpose of Visit'}
                  </label>
                  <input
                    type="text"
                    required
                    value={affiliation}
                    onChange={(e) => setAffiliation(e.target.value)}
                    placeholder={
                      isCompany
                        ? 'e.g., Apex Engineering Ltd'
                        : 'e.g., Interview, Personal Consultation'
                    }
                    className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                </div>

                {/* Split Host Name & Department Fields */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1">
                      Host Person
                    </label>
                    <input
                      type="text"
                      required
                      value={hostName}
                      onChange={(e) => setHostName(e.target.value)}
                      placeholder="e.g., Dr. Arthur"
                      className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1">
                      Department
                    </label>
                    <input
                      type="text"
                      required
                      value={department}
                      onChange={(e) => setDepartment(e.target.value)}
                      placeholder="e.g., IT Department"
                      className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={status === 'loading'}
                  className="w-full mt-2 inline-flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-medium shadow-sm transition disabled:opacity-50"
                >
                  {status === 'loading' ? (
                    'Processing Check-In...'
                  ) : (
                    <>
                      Complete Registration <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>
            </>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full py-4 text-center text-xs text-slate-400 flex items-center justify-center gap-1">
        <ShieldCheck className="w-4 h-4 text-slate-400" />
        Secured Visitor Management System
      </footer>
    </div>
  );
};