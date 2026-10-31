import React, { useState } from 'react';
import {
  ShieldAlert,
  Clock,
  CheckCircle,
  AlertTriangle,
  Building,
  Search,
  Filter,
  Eye,
  HelpCircle,
  RefreshCw,
  Send,
  FileText,
  Sliders,
  ChevronRight
} from 'lucide-react';
import { FDRRecord, UserProfile } from '../../types';

interface OfficerWorkspaceProps {
  currentUser: UserProfile;
  records: FDRRecord[];
  onSelectFdr: (fdrId: string) => void;
  onExplainWhy: (fdr: FDRRecord) => void;
  onOpenExtension: () => void;
  onVerifyBank: (fdrId: string) => void;
}

export const OfficerWorkspace: React.FC<OfficerWorkspaceProps> = ({
  currentUser,
  records,
  onSelectFdr,
  onExplainWhy,
  onOpenExtension,
  onVerifyBank
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterBank, setFilterBank] = useState('ALL');
  const [filterRisk, setFilterRisk] = useState('ALL');
  const [activeTab, setActiveTab] = useState<'queue' | 'discrepancies' | 'all'>('queue');

  // Computed metrics
  const totalRecords = records.length;
  const pendingVerification = records.filter(r => r.status === 'Pending Verification' || r.status === 'OCR Extracted').length;
  const verifiedRecords = records.filter(r => r.bankVerificationStatus === 'Verified').length;
  const mismatchCount = records.filter(r => r.bankVerificationStatus === 'Mismatch Detected').length;
  const highRiskCount = records.filter(r => r.riskCategory === 'Critical' || r.riskCategory === 'High').length;
  const approachingMaturity = records.filter(r => r.daysToMaturity > 0 && r.daysToMaturity <= 7).length;
  const overdueCount = records.filter(r => r.daysToMaturity < 0 || r.status === 'Matured').length;

  const filteredRecords = records.filter(r => {
    const matchesSearch =
      r.fdrNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.institutionName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.bankName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesBank = filterBank === 'ALL' || r.bankCode === filterBank;
    const matchesRisk = filterRisk === 'ALL' || r.riskCategory === filterRisk;

    if (activeTab === 'queue') {
      return matchesSearch && matchesBank && matchesRisk && (r.status === 'Pending Verification' || r.status === 'OCR Extracted' || r.bankVerificationStatus === 'Pending Verification');
    }
    if (activeTab === 'discrepancies') {
      return matchesSearch && matchesBank && matchesRisk && (r.bankVerificationStatus === 'Mismatch Detected' || r.riskCategory === 'Critical');
    }
    return matchesSearch && matchesBank && matchesRisk;
  });

  return (
    <div className="space-y-6">
      {/* Top Officer Command Header */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-[#0e2a27] via-[#143834] to-[#0e2a27] border border-[#d8be9a]/30 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#d8be9a] block">
            AI-Powered Regulatory Compliance Console
          </span>
          <h1 className="text-xl sm:text-2xl font-bold text-[#fbf8f3] mt-1">
            Officer Verification Workspace
          </h1>
          <p className="text-xs text-[#d0c5b4] mt-0.5">
            Active Review Queue: {pendingVerification} Deposits • Multi-Bank Adapter Handshake Active
          </p>
        </div>

        <button
          onClick={onOpenExtension}
          className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#d8be9a] to-[#c4a274] text-[#091a18] font-bold text-xs uppercase tracking-wider hover:brightness-105 shadow-md flex items-center gap-2 shrink-0 transition"
        >
          <span className="w-2 h-2 rounded-full bg-[#091a18] animate-ping" />
          <span>Launch AI Assistant Extension</span>
        </button>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="p-3.5 rounded-xl bg-[#0e2a27] border border-[#d8be9a]/20">
          <span className="text-[11px] text-[#d0c5b4] block">Total Records</span>
          <div className="text-2xl font-bold text-[#fbf8f3] mt-0.5">{totalRecords}</div>
        </div>

        <div className="p-3.5 rounded-xl bg-[#0e2a27] border border-[#d8be9a]/20">
          <span className="text-[11px] text-[#d0c5b4] block">Pending Review</span>
          <div className="text-2xl font-bold text-[#d8be9a] mt-0.5">{pendingVerification}</div>
        </div>

        <div className="p-3.5 rounded-xl bg-[#0e2a27] border border-[#d8be9a]/20">
          <span className="text-[11px] text-[#d0c5b4] block">Verified</span>
          <div className="text-2xl font-bold text-[#2ecc71] mt-0.5">{verifiedRecords}</div>
        </div>

        <div className="p-3.5 rounded-xl bg-[#0e2a27] border border-red-500/25">
          <span className="text-[11px] text-[#d0c5b4] block">Mismatches</span>
          <div className="text-2xl font-bold text-red-400 mt-0.5">{mismatchCount}</div>
        </div>

        <div className="p-3.5 rounded-xl bg-[#0e2a27] border border-amber-500/25">
          <span className="text-[11px] text-[#d0c5b4] block">≤ 7 Days Maturity</span>
          <div className="text-2xl font-bold text-amber-400 mt-0.5">{approachingMaturity}</div>
        </div>

        <div className="p-3.5 rounded-xl bg-[#0e2a27] border border-red-500/25">
          <span className="text-[11px] text-[#d0c5b4] block">Overdue Matured</span>
          <div className="text-2xl font-bold text-red-500 mt-0.5">{overdueCount}</div>
        </div>
      </div>

      {/* Main Review Queue & Filter Toolbar */}
      <div className="p-5 rounded-2xl bg-[#0e2a27] border border-[#d8be9a]/25 space-y-4">
        {/* Tab Controls & Filters */}
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-3 pb-3 border-b border-[#d8be9a]/15">
          <div className="flex items-center gap-1.5 p-1 rounded-xl bg-[#091a18] border border-[#d8be9a]/20 text-xs">
            <button
              onClick={() => setActiveTab('queue')}
              className={`px-3 py-1.5 rounded-lg font-semibold transition ${
                activeTab === 'queue'
                  ? 'bg-[#d8be9a] text-[#091a18] shadow'
                  : 'text-[#d0c5b4] hover:text-[#fbf8f3]'
              }`}
            >
              Verification Queue ({pendingVerification})
            </button>
            <button
              onClick={() => setActiveTab('discrepancies')}
              className={`px-3 py-1.5 rounded-lg font-semibold transition flex items-center gap-1.5 ${
                activeTab === 'discrepancies'
                  ? 'bg-[#d8be9a] text-[#091a18] shadow'
                  : 'text-[#d0c5b4] hover:text-[#fbf8f3]'
              }`}
            >
              <span>Discrepancies & Flags</span>
              {mismatchCount > 0 && (
                <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
              )}
            </button>
            <button
              onClick={() => setActiveTab('all')}
              className={`px-3 py-1.5 rounded-lg font-semibold transition ${
                activeTab === 'all'
                  ? 'bg-[#d8be9a] text-[#091a18] shadow'
                  : 'text-[#d0c5b4] hover:text-[#fbf8f3]'
              }`}
            >
              All Records ({totalRecords})
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto">
            <div className="relative flex-1 sm:w-56">
              <Search className="w-3.5 h-3.5 text-[#d8be9a] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search FDR, institution..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-[#091a18] border border-[#d8be9a]/25 text-xs text-[#fbf8f3] focus:outline-none focus:border-[#d8be9a]"
              />
            </div>

            <select
              value={filterBank}
              onChange={(e) => setFilterBank(e.target.value)}
              className="px-2.5 py-1.5 rounded-xl bg-[#091a18] border border-[#d8be9a]/25 text-xs text-[#d8be9a] focus:outline-none"
            >
              <option value="ALL">All Banks</option>
              <option value="SBI">State Bank of India</option>
              <option value="HDFC">HDFC Bank</option>
              <option value="CANARA">Canara Bank</option>
              <option value="AXIS">Axis Bank</option>
              <option value="BOB">Bank of Baroda</option>
              <option value="INDIAN_BANK">Indian Bank</option>
              <option value="UNION">Union Bank</option>
              <option value="ICICI">ICICI Bank</option>
            </select>

            <select
              value={filterRisk}
              onChange={(e) => setFilterRisk(e.target.value)}
              className="px-2.5 py-1.5 rounded-xl bg-[#091a18] border border-[#d8be9a]/25 text-xs text-[#d8be9a] focus:outline-none"
            >
              <option value="ALL">All Risk Levels</option>
              <option value="Critical">Critical</option>
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </select>
          </div>
        </div>

        {/* Verification Queue Table */}
        <div className="overflow-x-auto rounded-xl border border-[#d8be9a]/20 bg-[#091a18]">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#0b201e] border-b border-[#d8be9a]/20 text-[#d8be9a] uppercase text-[10px] tracking-wider">
              <tr>
                <th className="p-3.5">FDR Number</th>
                <th className="p-3.5">Institution</th>
                <th className="p-3.5">Bank</th>
                <th className="p-3.5">Principal Amount</th>
                <th className="p-3.5">Maturity Date</th>
                <th className="p-3.5">Risk & Confidence</th>
                <th className="p-3.5">CBS Status</th>
                <th className="p-3.5 text-right">Officer Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#d8be9a]/10">
              {filteredRecords.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-gray-500">
                    No FDR records match current filter criteria.
                  </td>
                </tr>
              ) : (
                filteredRecords.map((r) => (
                  <tr key={r.id} className="hover:bg-[#143834]/30 transition">
                    <td className="p-3.5 font-mono font-medium text-[#fbf8f3]">
                      #{r.fdrNumber}
                    </td>
                    <td className="p-3.5">
                      <div className="font-semibold text-[#fbf8f3] truncate max-w-[200px]" title={r.institutionName}>
                        {r.institutionName}
                      </div>
                      <div className="text-[10px] text-[#d0c5b4]">{r.institutionCode}</div>
                    </td>
                    <td className="p-3.5 font-medium text-[#fbf8f3]">
                      {r.bankName}
                    </td>
                    <td className="p-3.5 font-bold text-[#fbf8f3]">
                      ₹ {r.principalAmount.toLocaleString('en-IN')}
                    </td>
                    <td className="p-3.5">
                      <div className="font-medium text-[#fbf8f3]">{r.maturityDate}</div>
                      <div
                        className={`text-[10px] ${
                          r.daysToMaturity < 0
                            ? 'text-red-400 font-bold'
                            : r.daysToMaturity <= 7
                            ? 'text-amber-400 font-semibold'
                            : 'text-[#d0c5b4]'
                        }`}
                      >
                        {r.daysToMaturity < 0 ? `${Math.abs(r.daysToMaturity)}d Overdue` : `${r.daysToMaturity}d left`}
                      </div>
                    </td>
                    <td className="p-3.5">
                      <div className="flex items-center gap-1.5">
                        <span
                          className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full border ${
                            r.riskCategory === 'Critical'
                              ? 'bg-red-500/15 text-red-400 border-red-500/30'
                              : r.riskCategory === 'High'
                              ? 'bg-amber-500/15 text-amber-400 border-amber-500/30'
                              : 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                          }`}
                        >
                          {r.riskCategory}
                        </span>
                        {r.riskIssues.length > 0 && (
                          <button
                            onClick={() => onExplainWhy(r)}
                            className="p-1 text-[#d8be9a] hover:text-white"
                            title="WHY? Explain Risk"
                          >
                            <HelpCircle className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                      <div className="text-[10px] text-gray-400 mt-0.5">
                        OCR Conf: {r.ocrConfidence.fdrNumber}%
                      </div>
                    </td>
                    <td className="p-3.5">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                          r.bankVerificationStatus === 'Verified'
                            ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                            : r.bankVerificationStatus === 'Mismatch Detected'
                            ? 'bg-red-500/15 text-red-400 border border-red-500/30 font-bold'
                            : 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                        }`}
                      >
                        {r.bankVerificationStatus}
                      </span>
                    </td>
                    <td className="p-3.5 text-right space-x-1.5 whitespace-nowrap">
                      <button
                        onClick={() => onSelectFdr(r.id)}
                        className="px-2.5 py-1 rounded-lg bg-[#143834] text-[#d8be9a] hover:bg-[#1a4a45] text-xs font-medium"
                      >
                        Inspect
                      </button>
                      <button
                        onClick={() => onVerifyBank(r.id)}
                        className="px-2.5 py-1 rounded-lg bg-[#d8be9a] text-[#091a18] hover:bg-[#c4a274] text-xs font-bold"
                      >
                        Verify Bank
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
