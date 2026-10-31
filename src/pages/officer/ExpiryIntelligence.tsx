import React, { useState } from 'react';
import {
  Clock,
  Calendar,
  AlertTriangle,
  Building,
  Bell,
  CheckCircle,
  HelpCircle,
  ChevronRight,
  Filter,
  ArrowRight
} from 'lucide-react';
import { FDRRecord } from '../../types';

interface ExpiryIntelligenceProps {
  records: FDRRecord[];
  onSelectFdr: (fdrId: string) => void;
  onExplainWhy: (fdr: FDRRecord) => void;
}

export const ExpiryIntelligence: React.FC<ExpiryIntelligenceProps> = ({
  records,
  onSelectFdr,
  onExplainWhy
}) => {
  const [selectedFilter, setSelectedFilter] = useState<string>('ALL');
  const [viewMode, setViewMode] = useState<'timeline' | 'table' | 'calendar'>('timeline');

  // Breakdown buckets
  const expiringToday = records.filter(r => r.daysToMaturity === 0);
  const expiring3Days = records.filter(r => r.daysToMaturity > 0 && r.daysToMaturity <= 3);
  const expiring5Days = records.filter(r => r.daysToMaturity > 3 && r.daysToMaturity <= 5);
  const expiring7Days = records.filter(r => r.daysToMaturity > 5 && r.daysToMaturity <= 7);
  const expiring15Days = records.filter(r => r.daysToMaturity > 7 && r.daysToMaturity <= 15);
  const expiring30Days = records.filter(r => r.daysToMaturity > 15 && r.daysToMaturity <= 30);
  const overdueRecords = records.filter(r => r.daysToMaturity < 0 || r.status === 'Matured');

  const getFilteredRecords = () => {
    switch (selectedFilter) {
      case 'TODAY': return expiringToday;
      case '3DAYS': return expiring3Days;
      case '5DAYS': return expiring5Days;
      case '7DAYS': return expiring7Days;
      case '15DAYS': return expiring15Days;
      case '30DAYS': return expiring30Days;
      case 'OVERDUE': return overdueRecords;
      default: return records;
    }
  };

  const displayRecords = getFilteredRecords();

  return (
    <div className="space-y-6">
      {/* Expiry Header Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-[#0e2a27] via-[#143834] to-[#0e2a27] border border-[#d8be9a]/30 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#d8be9a] block">
            Automated Lifecycle Monitoring
          </span>
          <h1 className="text-xl sm:text-2xl font-bold text-[#fbf8f3] mt-1">
            FDR Expiry Intelligence Hub
          </h1>
          <p className="text-xs text-[#d0c5b4] mt-0.5">
            Real-Time Horizon Tracking Across 0d, 3d, 5d, 7d, 15d, 30d Milestones & Overdue Deposits
          </p>
        </div>

        {/* View Toggle */}
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-[#091a18] border border-[#d8be9a]/25 text-xs">
          <button
            onClick={() => setViewMode('timeline')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition ${
              viewMode === 'timeline' ? 'bg-[#d8be9a] text-[#091a18]' : 'text-[#d0c5b4] hover:text-[#fbf8f3]'
            }`}
          >
            Milestone Timeline
          </button>
          <button
            onClick={() => setViewMode('table')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition ${
              viewMode === 'table' ? 'bg-[#d8be9a] text-[#091a18]' : 'text-[#d0c5b4] hover:text-[#fbf8f3]'
            }`}
          >
            Maturity Table
          </button>
          <button
            onClick={() => setViewMode('calendar')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition ${
              viewMode === 'calendar' ? 'bg-[#d8be9a] text-[#091a18]' : 'text-[#d0c5b4] hover:text-[#fbf8f3]'
            }`}
          >
            Calendar View
          </button>
        </div>
      </div>

      {/* 8 Expiry Category Filter Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2.5">
        {[
          { id: 'TODAY', label: 'Today (0d)', count: expiringToday.length, color: 'text-red-400 border-red-500/30' },
          { id: '3DAYS', label: 'Within 3d', count: expiring3Days.length, color: 'text-red-400 border-red-500/30' },
          { id: '5DAYS', label: 'Within 5d', count: expiring5Days.length, color: 'text-amber-400 border-amber-500/30' },
          { id: '7DAYS', label: 'Within 7d', count: expiring7Days.length, color: 'text-amber-400 border-amber-500/30' },
          { id: '15DAYS', label: 'Within 15d', count: expiring15Days.length, color: 'text-yellow-400 border-yellow-500/30' },
          { id: '30DAYS', label: 'Within 30d', count: expiring30Days.length, color: 'text-emerald-400 border-emerald-500/30' },
          { id: 'OVERDUE', label: 'Overdue', count: overdueRecords.length, color: 'text-red-500 font-bold border-red-500/50' },
          { id: 'ALL', label: 'All Deposits', count: records.length, color: 'text-[#d8be9a] border-[#d8be9a]/30' }
        ].map((item) => (
          <button
            key={item.id}
            onClick={() => setSelectedFilter(item.id)}
            className={`p-3 rounded-xl border text-left transition ${
              selectedFilter === item.id
                ? 'bg-[#143834] ring-1 ring-[#d8be9a] shadow-md'
                : 'bg-[#0e2a27] hover:bg-[#143834]/50'
            }`}
          >
            <span className="text-[10px] text-gray-400 uppercase font-medium block truncate">
              {item.label}
            </span>
            <div className={`text-xl font-bold mt-1 ${item.color}`}>
              {item.count}
            </div>
          </button>
        ))}
      </div>

      {/* View Mode 1: Milestone Timeline */}
      {viewMode === 'timeline' && (
        <div className="p-6 rounded-2xl bg-[#0e2a27] border border-[#d8be9a]/25 space-y-6">
          <h2 className="text-base font-bold text-[#fbf8f3] flex items-center gap-2">
            <Clock className="w-4 h-4 text-[#d8be9a]" />
            <span>Interactive Horizon Expiry Timeline</span>
          </h2>

          <div className="relative pl-6 space-y-6 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-[#d8be9a]/30">
            {/* 3 Days Milestone */}
            {expiring3Days.length > 0 && (
              <div className="relative">
                <div className="absolute -left-6 top-1 w-4 h-4 rounded-full bg-red-500 ring-4 ring-[#0e2a27]" />
                <div className="p-4 rounded-xl bg-[#091a18] border border-red-500/30 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-red-400 uppercase tracking-wider">
                      🚨 Milestone 1: Expiring in 3 Days (Urgent Statutory Lien Action)
                    </span>
                    <span className="text-xs font-mono text-[#d8be9a]">
                      {expiring3Days[0].maturityDate}
                    </span>
                  </div>
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pt-1">
                    <div>
                      <div className="font-bold text-sm text-[#fbf8f3]">
                        {expiring3Days[0].bankName} • #{expiring3Days[0].fdrNumber}
                      </div>
                      <div className="text-xs text-[#d0c5b4]">
                        {expiring3Days[0].institutionName} (₹ {expiring3Days[0].principalAmount.toLocaleString('en-IN')})
                      </div>
                    </div>
                    <button
                      onClick={() => onSelectFdr(expiring3Days[0].id)}
                      className="px-3.5 py-1.5 rounded-lg bg-[#d8be9a] text-[#091a18] text-xs font-bold hover:bg-[#c4a274]"
                    >
                      Process Renewal
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* 5 Days Milestone */}
            {expiring5Days.length > 0 && (
              <div className="relative">
                <div className="absolute -left-6 top-1 w-4 h-4 rounded-full bg-amber-500 ring-4 ring-[#0e2a27]" />
                <div className="p-4 rounded-xl bg-[#091a18] border border-amber-500/30 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">
                      ⚠️ Milestone 2: Expiring in 5 Days
                    </span>
                    <span className="text-xs font-mono text-[#d8be9a]">
                      {expiring5Days[0].maturityDate}
                    </span>
                  </div>
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pt-1">
                    <div>
                      <div className="font-bold text-sm text-[#fbf8f3]">
                        {expiring5Days[0].bankName} • #{expiring5Days[0].fdrNumber}
                      </div>
                      <div className="text-xs text-[#d0c5b4]">
                        {expiring5Days[0].institutionName} (₹ {expiring5Days[0].principalAmount.toLocaleString('en-IN')})
                      </div>
                    </div>
                    <button
                      onClick={() => onSelectFdr(expiring5Days[0].id)}
                      className="px-3.5 py-1.5 rounded-lg bg-[#143834] text-[#d8be9a] border border-[#d8be9a]/30 text-xs font-semibold"
                    >
                      Inspect Deposit
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Overdue Milestone */}
            {overdueRecords.length > 0 && (
              <div className="relative">
                <div className="absolute -left-6 top-1 w-4 h-4 rounded-full bg-red-600 ring-4 ring-[#0e2a27]" />
                <div className="p-4 rounded-xl bg-[#091a18] border border-red-600/40 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-red-400 uppercase tracking-wider">
                      ⛔ Critical: Past Maturity / Overdue (15 Days Elapsed)
                    </span>
                    <span className="text-xs font-mono text-red-400">
                      Matured {overdueRecords[0].maturityDate}
                    </span>
                  </div>
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pt-1">
                    <div>
                      <div className="font-bold text-sm text-[#fbf8f3]">
                        {overdueRecords[0].bankName} • #{overdueRecords[0].fdrNumber}
                      </div>
                      <div className="text-xs text-[#d0c5b4]">
                        {overdueRecords[0].institutionName} (₹ {overdueRecords[0].principalAmount.toLocaleString('en-IN')})
                      </div>
                    </div>
                    <button
                      onClick={() => onSelectFdr(overdueRecords[0].id)}
                      className="px-3.5 py-1.5 rounded-lg bg-red-900/70 text-red-200 text-xs font-bold hover:bg-red-800"
                    >
                      Issue Breach Notice
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* View Mode 2: Maturity Table */}
      {viewMode === 'table' && (
        <div className="p-5 rounded-2xl bg-[#0e2a27] border border-[#d8be9a]/25 space-y-4">
          <h2 className="text-base font-bold text-[#fbf8f3]">
            Maturity Horizon Schedule
          </h2>
          <div className="overflow-x-auto rounded-xl border border-[#d8be9a]/20 bg-[#091a18]">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#0b201e] border-b border-[#d8be9a]/20 text-[#d8be9a] uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="p-3.5">FDR Number</th>
                  <th className="p-3.5">Institution</th>
                  <th className="p-3.5">Bank</th>
                  <th className="p-3.5">Principal</th>
                  <th className="p-3.5">Maturity Date</th>
                  <th className="p-3.5">Horizon</th>
                  <th className="p-3.5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#d8be9a]/10">
                {displayRecords.map((r) => (
                  <tr key={r.id} className="hover:bg-[#143834]/30 transition">
                    <td className="p-3.5 font-mono font-medium text-[#fbf8f3]">#{r.fdrNumber}</td>
                    <td className="p-3.5 text-[#fbf8f3] truncate max-w-[200px]">{r.institutionName}</td>
                    <td className="p-3.5 text-[#fbf8f3]">{r.bankName}</td>
                    <td className="p-3.5 font-bold text-[#fbf8f3]">₹ {r.principalAmount.toLocaleString('en-IN')}</td>
                    <td className="p-3.5 font-medium text-[#fbf8f3]">{r.maturityDate}</td>
                    <td className="p-3.5">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          r.daysToMaturity < 0
                            ? 'bg-red-500/20 text-red-400'
                            : r.daysToMaturity <= 7
                            ? 'bg-amber-500/20 text-amber-400'
                            : 'bg-emerald-500/20 text-emerald-400'
                        }`}
                      >
                        {r.daysToMaturity < 0 ? `${Math.abs(r.daysToMaturity)}d Overdue` : `${r.daysToMaturity}d`}
                      </span>
                    </td>
                    <td className="p-3.5 text-right">
                      <button
                        onClick={() => onSelectFdr(r.id)}
                        className="px-2.5 py-1 rounded bg-[#143834] text-[#d8be9a] hover:bg-[#1a4a45] text-xs"
                      >
                        Review
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* View Mode 3: Calendar View */}
      {viewMode === 'calendar' && (
        <div className="p-6 rounded-2xl bg-[#0e2a27] border border-[#d8be9a]/25 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-[#fbf8f3] flex items-center gap-2">
              <Calendar className="w-4 h-4 text-[#d8be9a]" />
              <span>November 2026 Maturity Calendar</span>
            </h2>
            <span className="text-xs font-mono text-[#d8be9a]">Local Time: 30-Oct-2026</span>
          </div>

          <div className="grid grid-cols-7 gap-2 text-center text-xs">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
              <div key={d} className="p-2 font-bold text-[#d8be9a] uppercase text-[10px] bg-[#091a18] rounded-lg">
                {d}
              </div>
            ))}

            {/* Calendar grid mock for November 2026 */}
            {Array.from({ length: 30 }).map((_, i) => {
              const day = i + 1;
              const hasSBI = day === 2;
              const hasHDFC = day === 4;
              const hasCanara = day === 6;
              const hasIndian = day === 14;
              const hasICICI = day === 29;

              return (
                <div
                  key={day}
                  className={`min-h-[70px] p-2 rounded-xl border text-left flex flex-col justify-between ${
                    hasSBI
                      ? 'bg-red-950/40 border-red-500/50'
                      : hasHDFC || hasCanara
                      ? 'bg-amber-950/40 border-amber-500/40'
                      : 'bg-[#091a18]/60 border-[#d8be9a]/15'
                  }`}
                >
                  <span className="text-xs font-bold text-[#d0c5b4]">{day}</span>
                  {hasSBI && (
                    <span className="text-[9px] font-bold px-1 py-0.5 rounded bg-red-600 text-white truncate">
                      SBI ₹50L (3d)
                    </span>
                  )}
                  {hasHDFC && (
                    <span className="text-[9px] font-bold px-1 py-0.5 rounded bg-amber-600 text-white truncate">
                      HDFC ₹1.2Cr
                    </span>
                  )}
                  {hasCanara && (
                    <span className="text-[9px] font-bold px-1 py-0.5 rounded bg-yellow-600 text-white truncate">
                      Canara ₹35L
                    </span>
                  )}
                  {hasIndian && (
                    <span className="text-[9px] font-bold px-1 py-0.5 rounded bg-[#143834] text-[#d8be9a] truncate">
                      Indian ₹60L
                    </span>
                  )}
                  {hasICICI && (
                    <span className="text-[9px] font-bold px-1 py-0.5 rounded bg-[#143834] text-[#2ecc71] truncate">
                      ICICI ₹85L
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
