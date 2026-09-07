import React, { useEffect, useState } from 'react';
import { api } from '../api/client';
import { NavBar } from '../components/NavBar';
import { 
  Building2, 
  User, 
  Search, 
  RefreshCw, 
  Clock, 
  LogOut, 
  CheckCircle2,
  Briefcase
} from 'lucide-react';

interface Visitor {
  id: number;
  name: string;
  isCompany: boolean;
  affiliation: string;
  host: string;
  checkInTime: string;
  status: string;
}

interface RowProps {
  visitor: Visitor;
  onCheckOut: (id: number, name: string) => void;
  isCheckingOut: boolean;
}

// Separated sub-component for the table row
const VisitorRow: React.FC<RowProps> = ({ visitor, onCheckOut, isCheckingOut }) => {
  const parts = visitor.host ? visitor.host.split(' - ') : [];
  const hostPerson = parts[0]?.trim() || visitor.host || '—';
  const department = parts.length > 1 ? parts.slice(1).join(' - ').trim() : 'General';

  const formattedTime = visitor.checkInTime
    ? new Date(visitor.checkInTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    : '—';

  return (
    <tr className="hover:bg-slate-50/70 transition">
      <td className="py-4 px-6 font-semibold text-slate-900">
        {visitor.name}
      </td>

      <td className="py-4 px-6">
        {visitor.isCompany ? (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200">
            <Building2 className="w-3.5 h-3.5" /> Company
          </span>
        ) : (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-700 border border-slate-200">
            <User className="w-3.5 h-3.5" /> Individual
          </span>
        )}
      </td>

      <td className="py-4 px-6 text-slate-700">
        {visitor.affiliation}
      </td>

      <td className="py-4 px-6 font-medium text-slate-800">
        {hostPerson}
      </td>

      <td className="py-4 px-6">
        <span className="inline-flex items-center gap-1.5 text-xs text-slate-700 bg-slate-100 px-2.5 py-1 rounded-md border border-slate-200">
          <Briefcase className="w-3 h-3 text-slate-500" />
          {department}
        </span>
      </td>

      <td className="py-4 px-6 text-xs text-slate-500 font-mono">
        <div className="flex items-center gap-1">
          <Clock className="w-3.5 h-3.5 text-slate-400" />
          {formattedTime}
        </div>
      </td>

      <td className="py-4 px-6 text-right">
        <button
          type="button"
          onClick={() => onCheckOut(visitor.id, visitor.name)}
          disabled={isCheckingOut}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-50 hover:bg-red-100 text-red-700 text-xs font-semibold border border-red-200 transition disabled:opacity-50"
        >
          <LogOut className="w-3.5 h-3.5" />
          {isCheckingOut ? 'Checking out...' : 'Check Out'}
        </button>
      </td>
    </tr>
  );
};

export const DashboardPage: React.FC = () => {
  const [visitors, setVisitors] = useState<Visitor[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [actionMessage, setActionMessage] = useState<string | null>(null);
  const [checkingOutId, setCheckingOutId] = useState<number | null>(null);

  const fetchActiveVisitors = async () => {
    setLoading(true);
    try {
      const res = await api.get('/visitors/active');
      setVisitors(res.data);
    } catch (err: any) {
      console.error('Failed to fetch visitors', err);
    } finally {
      setLoading(false);
    }
  };

    useEffect(() => {
    fetchActiveVisitors();
    const interval = setInterval(fetchActiveVisitors, 15000);
    return () => clearInterval(interval);
    }, []);

  const handleCheckOut = async (id: number, name: string) => {
    setCheckingOutId(id);
    setActionMessage(null);
    try {
      await api.patch(`/visitors/${id}/check-out`);
      setVisitors((prev) => prev.filter((v) => v.id !== id));
      setActionMessage(`${name} has been successfully checked out.`);
      setTimeout(() => setActionMessage(null), 4000);
    } catch (err: any) {
      console.error('Check-out failed', err);
      alert(err.response?.data?.message || 'Failed to check out visitor.');
    
    } finally {
      setCheckingOutId(null);
    }
  };

  const filteredVisitors = visitors.filter((v) => {
    const q = searchQuery.toLowerCase();
    return (
      v.name.toLowerCase().includes(q) ||
      v.affiliation.toLowerCase().includes(q) ||
      v.host.toLowerCase().includes(q)
    );
  });

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <NavBar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              Active Visitors
            </h1>
            <p className="text-sm text-slate-500 mt-0.5">
              Currently checked in and present within the facility
            </p>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs font-semibold px-3 py-1.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
              {visitors.length} {visitors.length === 1 ? 'Guest' : 'Guests'} on Premise
            </span>
            <button
              type="button"
              onClick={fetchActiveVisitors}
              disabled={loading}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-300 bg-white text-xs font-medium text-slate-700 hover:bg-slate-50 transition disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          </div>
        </div>

        {actionMessage && (
          <div className="mb-4 p-3 rounded-lg bg-green-50 border border-green-200 flex items-center gap-2 text-green-800 text-xs font-medium">
            <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0" />
            <span>{actionMessage}</span>
          </div>
        )}

        <div className="mb-6 relative max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by visitor, host, department, or affiliation..."
            className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-300 text-sm bg-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600"
          />
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          {loading && visitors.length === 0 ? (
            <div className="py-16 text-center text-slate-400 text-sm">
              Loading visitor roster...
            </div>
          ) : filteredVisitors.length === 0 ? (
            <div className="py-16 text-center text-slate-400 text-sm">
              {searchQuery
                ? 'No visitors matched your search query.'
                : 'No active visitors currently in the building.'}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-xs font-semibold uppercase tracking-wider text-slate-600">
                    <th className="py-3 px-6">Visitor</th>
                    <th className="py-3 px-6">Classification</th>
                    <th className="py-3 px-6">Affiliation / Purpose</th>
                    <th className="py-3 px-6">Host Person</th>
                    <th className="py-3 px-6">Department</th>
                    <th className="py-3 px-6">Check-In Time</th>
                    <th className="py-3 px-6 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm">
                  {filteredVisitors.map((visitor) => (
                    <VisitorRow
                      key={visitor.id}
                      visitor={visitor}
                      onCheckOut={handleCheckOut}
                      isCheckingOut={checkingOutId === visitor.id}
                    />
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};