import React, { useState, useEffect } from 'react';
import {
  ShieldAlert,
  Search,
  Filter,
  Clock,
  UserCheck,
  FileText,
  Activity,
  Layers,
  CheckCircle2,
  Eye,
  X,
} from 'lucide-react';
import { fetchAuditLogs } from '../../../services/api';
import { formatDualDate } from '../../../utils/nepaliCalendar';
import { useAuth } from '../../../context/AuthContext';

const AuditTrailTab = ({ isDark }) => {
  const { lang, currentBranch } = useAuth();
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [entityFilter, setEntityFilter] = useState('');
  const [selectedLog, setSelectedLog] = useState(null);

  const loadLogs = async () => {
    setLoading(true);
    try {
      const params = {};
      if (entityFilter) params.entity_type = entityFilter;
      if (search) params.search = search;
      const res = await fetchAuditLogs(params);
      if (res && res.success && res.data?.logs) {
        setLogs(res.data.logs);
      }
    } catch (e) {}
    setLoading(false);
  };

  useEffect(() => {
    loadLogs();
  }, [entityFilter, currentBranch?.id]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    loadLogs();
  };

  return (
    <div className="space-y-6">
      {/* Header & Filter Controls */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 p-4 rounded-2xl bg-slate-950 border border-slate-800">
        <div>
          <h4 className="text-sm font-bold text-white flex items-center gap-2">
            <Activity className="w-4 h-4 text-emerald-400" />
            <span>Immutable Institutional Audit Trail</span>
          </h4>
          <p className="text-xs text-slate-400 mt-0.5">
            Cryptographic ledger tracking all modifications to student marks, fee collections, promotions, and profiles.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Entity filter */}
          <select
            value={entityFilter}
            onChange={(e) => setEntityFilter(e.target.value)}
            className="bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white"
          >
            <option value="">All Entities</option>
            <option value="student_marks">Marks & Grading</option>
            <option value="fee_receipts">Fee Receipts & Billing</option>
            <option value="students">Student SIS Profiles</option>
            <option value="student_promotions">Promotions & Cohorts</option>
            <option value="transfer_certificates">Transfer Certificates (TC)</option>
            <option value="timetable_slots">Timetable Scheduling</option>
          </select>

          {/* Search */}
          <form onSubmit={handleSearchSubmit} className="relative">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Filter by operator / ID..."
              className="bg-slate-900 border border-slate-700 rounded-xl pl-3 pr-8 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none"
            />
            <button type="submit" className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white">
              <Search className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>
      </div>

      {/* Logs Table */}
      <div className="rounded-2xl border border-slate-800 bg-slate-950 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-900 text-slate-400 font-bold uppercase text-[10px]">
                <th className="py-3 px-4">Timestamp (AD/BS)</th>
                <th className="py-3 px-4">Operator / Staff</th>
                <th className="py-3 px-4">Action Event</th>
                <th className="py-3 px-4">Entity & Target ID</th>
                <th className="py-3 px-4">IP Address</th>
                <th className="py-3 px-4 text-right">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {logs.length === 0 ? (
                <tr>
                  <td colSpan="6" className="py-8 text-center text-slate-500">
                    {loading ? 'Reading audit trail...' : 'No audit records match the selected filter.'}
                  </td>
                </tr>
              ) : (
                logs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-900/40">
                    <td className="py-3 px-4 text-slate-300 font-mono text-[11px]">
                      {formatDualDate(log.created_at?.slice(0, 10), lang)}
                      <div className="text-[10px] text-slate-500">{log.created_at?.slice(11, 19)}</div>
                    </td>

                    <td className="py-3 px-4">
                      <div className="font-bold text-white">{log.user_name}</div>
                      <span className="text-[9px] uppercase font-bold px-1.5 py-0.2 rounded bg-slate-800 text-emerald-400 font-mono">
                        {log.user_role}
                      </span>
                    </td>

                    <td className="py-3 px-4">
                      <span className="font-mono font-bold text-xs text-indigo-300">
                        {log.action}
                      </span>
                    </td>

                    <td className="py-3 px-4">
                      <div className="text-slate-300 font-mono text-[11px]">{log.entity_type}</div>
                      <div className="text-[10px] text-slate-500 font-mono">ID: {log.entity_id}</div>
                    </td>

                    <td className="py-3 px-4 font-mono text-[10px] text-slate-400">
                      {log.ip_address || '127.0.0.1'}
                    </td>

                    <td className="py-3 px-4 text-right">
                      {(log.old_values || log.new_values) && (
                        <button
                          type="button"
                          onClick={() => setSelectedLog(log)}
                          className="p-1.5 rounded-lg bg-slate-900 border border-slate-700 hover:border-emerald-500 text-slate-300 cursor-pointer"
                          title="Inspect JSON Payload & Changes"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL: INSPECT AUDIT LOG PAYLOAD */}
      {selectedLog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl relative">
            <button
              onClick={() => setSelectedLog(null)}
              className="absolute top-5 right-5 text-slate-400 hover:text-white cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
            <h3 className="text-lg font-bold text-white mb-1">Audit Ledger Entry #{selectedLog.id}</h3>
            <p className="text-xs text-slate-400 mb-4 font-mono">{selectedLog.action} on {selectedLog.entity_type} (ID: {selectedLog.entity_id})</p>

            <div className="space-y-3 text-xs">
              {selectedLog.old_values && (
                <div>
                  <div className="text-[10px] uppercase font-bold text-rose-400 mb-1">Previous Values (Before Action)</div>
                  <pre className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-rose-300 font-mono text-[11px] overflow-x-auto">
                    {JSON.stringify(selectedLog.old_values, null, 2)}
                  </pre>
                </div>
              )}

              {selectedLog.new_values && (
                <div>
                  <div className="text-[10px] uppercase font-bold text-emerald-400 mb-1">Updated Values (Snapshot)</div>
                  <pre className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-emerald-300 font-mono text-[11px] overflow-x-auto">
                    {JSON.stringify(selectedLog.new_values, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AuditTrailTab;

