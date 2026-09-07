import React, { useEffect, useState } from 'react';
import { api } from '../api/client';
import { NavBar } from '../components/NavBar';
import { 
  Building2, 
  User, 
  Search, 
  RefreshCw, 
  Clock, 
  Briefcase, 
  Download,
  Calendar
} from 'lucide-react';

interface VisitorHistoryItem {
  id: number;
  name: string;
  isCompany: boolean;
  affiliation: string;
  host: string;
  checkInTime: string;
  checkOutTime: string | null;
  status: string;
}

export const HistoryPage: React.FC = () => {
  const [history, setHistory] = useState<VisitorHistoryItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const res = await api.get('/visitors/history');
      setHistory(res.data);
    } catch (err: any) {
      console.error('Failed to load history', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const parseHostDetails = (rawHost: string) => {
    if (!rawHost) return { hostPerson: '—', department: '—' };
    const parts = rawHost.split(' - ');
    if (parts.length >= 2) {
      return {
        hostPerson: parts[0].trim(),
        department: parts.slice(1).join(' - ').trim(),
      };
    }
    return {
      hostPerson: rawHost.trim(),
      department: 'General',
    };
  };

  const calculateDuration = (checkIn: string, checkOut: string | null) => {
    if (!checkOut) return 'Active';
    const start = new Date(checkIn).getTime();
    const end = new Date(checkOut).getTime();
    const diffMinutes = Math.max(0, Math.floor((end - start) / (1000 * 60)));
    
    if (diffMinutes < 60) return `${diffMinutes}m`;
    const hours = Math.floor(diffMinutes / 60);
    const mins = diffMinutes % 60;
    return `${hours}h ${mins}m`;
  };

  const filteredHistory = history.filter((v) => {
    const q = searchQuery.toLowerCase();
    const { hostPerson, department } = parseHostDetails(v.host);
    return (
      v.name.toLowerCase().includes(q) ||
      v.affiliation.toLowerCase().includes(q) ||
      hostPerson.toLowerCase().includes(q) ||
      department.toLowerCase().includes(q)
    );
  });

  const exportToCSV = () => {
    if (filteredHistory.length === 0) return;

    const headers = ['ID', 'Visitor Name', 'Classification', 'Affiliation', 'Host Person', 'Department', 'Check-In', 'Check-Out', 'Duration', 'Status'];
    
    const rows = filteredHistory.map((item) => {
      const { hostPerson, department } = parseHostDetails(item.host);
      return [
        item.id,
        `"${item.name.replace(/"/g, '""')}"`,
        item.isCompany ? 'Company' : 'Individual',
        `"${item.affiliation.replace(/"/g, '""')}"`,
        `"${hostPerson.replace(/"/g, '""')}"`,
        `"${department.replace(/"/g, '""')}"`,
        item.checkInTime ? new Date(item.checkInTime).toLocaleString() : '',
        item.checkOutTime ? new Date(item.checkOutTime).toLocaleString() : 'N/A',
        calculateDuration(item.checkInTime, item.checkOutTime),
        item.status,
      ].join(',');
    });

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `visitor-log-${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <NavBar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Top Header & Export Controls */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              Audit & Historical Logs
            </h1>
            <p className="text-sm text-slate-500 mt-0.5">
              Comprehensive chronological log of all facility visitor activity
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={exportToCSV}
              disabled={filteredHistory.length === 0}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold shadow-sm transition disabled:opacity-50"
            >
              <Download className="w-3.5 h-3.5" />
              Export CSV
            </button>
            <button
              type="button"
              onClick={fetchHistory}
              disabled={loading}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-slate-300 bg-white text-xs font-medium text-slate-700 hover:bg-slate-50 transition disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          </div>
        </div>

        {/* Search */}
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

        {/* History Table */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          {loading && history.length === 0 ? (
            <div className="py-16 text-center text-slate-400 text-sm">
              Loading audit logs...
            </div>
          ) : filteredHistory.length === 0 ? (
            <div className="py-16 text-center text-slate-400 text-sm">
              {searchQuery
                ? 'No logs matched your query.'
                : 'No historical visitor records found.'}
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
                    <th className="py-3 px-6">Check-In</th>
                    <th className="py-3 px-6">Check-Out</th>
                    <th className="py-3 px-6 text-right">Duration</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm">
                  {filteredHistory.map((item) => {
                    const { hostPerson, department } = parseHostDetails(item.host);
                    const duration = calculateDuration(item.checkInTime, item.checkOutTime);

                    return (
                      <tr key={item.id} className="hover:bg-slate-50/70 transition">
                        <td className="py-4 px-6 font-semibold text-slate-900">
                          {item.name}
                        </td>

                        <td className="py-4 px-6">
                          {item.isCompany ? (
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
                          {item.affiliation}
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

                        <td className="py-4 px-6 text-xs text-slate-600 font-mono">
                          <div className="flex items-center gap-1">
                            <Calendar className="w-3.5 h-3.5 text-slate-400" />
                            {item.checkInTime ? new Date(item.checkInTime).toLocaleDateString() : '—'}
                          </div>
                          <div className="flex items-center gap-1 text-slate-400 mt-0.5">
                            <Clock className="w-3 h-3" />
                            {item.checkInTime ? new Date(item.checkInTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '—'}
                          </div>
                        </td>

                        <td className="py-4 px-6 text-xs text-slate-600 font-mono">
                          {item.checkOutTime ? (
                            <>
                              <div className="flex items-center gap-1">
                                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                                {new Date(item.checkOutTime).toLocaleDateString()}
                              </div>
                              <div className="flex items-center gap-1 text-slate-400 mt-0.5">
                                <Clock className="w-3 h-3" />
                               {new Date(item.checkOutTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </div>
                            </>
                          ) : (
                            <span className="inline-flex px-2 py-0.5 rounded text-[11px] font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                              Still Present
                            </span>
                          )}
                        </td>

                        <td className="py-4 px-6 text-right font-medium text-slate-800 text-xs">
                          {duration}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};