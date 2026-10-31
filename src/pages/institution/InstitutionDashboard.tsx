import React, { useState } from 'react';
import {
  UploadCloud,
  FileText,
  Clock,
  ShieldCheck,
  AlertTriangle,
  Building,
  CheckCircle,
  Eye,
  Calendar,
  Download,
  Filter,
  Search,
  RefreshCw,
  Mail,
  Send,
  ArrowRight
} from 'lucide-react';
import { FDRRecord, UserProfile } from '../../types';

interface InstitutionDashboardProps {
  currentUser: UserProfile;
  records: FDRRecord[];
  onOpenUpload: () => void;
  onSelectFdr: (fdrId: string) => void;
  onRequestRenewal: (fdrId: string) => void;
  onOpenEmailAlert?: (collegeName?: string, fdrNumber?: string) => void;
}

export const InstitutionDashboard: React.FC<InstitutionDashboardProps> = ({
  currentUser,
  records,
  onOpenUpload,
  onSelectFdr,
  onRequestRenewal,
  onOpenEmailAlert
}) => {
  // Isolate records to this institution only
  const institutionName = currentUser.institutionName || 'Apex Institute of Technology & Engineering';
  const myRecords = records.filter(r => r.institutionName.toLowerCase() === institutionName.toLowerCase());

  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('ALL');

  const totalSubmitted = myRecords.length;
  const verifiedCount = myRecords.filter(r => r.status === 'Verified' || r.bankVerificationStatus === 'Verified').length;
  const pendingCount = myRecords.filter(r => r.status === 'Pending Verification' || r.status === 'OCR Extracted').length;
  const approachingCount = myRecords.filter(r => r.daysToMaturity > 0 && r.daysToMaturity <= 30).length;
  const maturedCount = myRecords.filter(r => r.daysToMaturity < 0 || r.status === 'Matured').length;
  const totalCorpus = myRecords.reduce((sum, r) => sum + r.principalAmount, 0);

  // Find most recent FDR nearing maturity
  const recentExpiringFdr = myRecords.find(r => r.daysToMaturity >= 0 && r.daysToMaturity <= 7) || myRecords[0];

  const filtered = myRecords.filter(r => {
    const matchesSearch =
      r.fdrNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.bankName.toLowerCase().includes(searchTerm.toLowerCase());
    if (filterStatus === 'ALL') return matchesSearch;
    if (filterStatus === 'VERIFIED') return matchesSearch && (r.status === 'Verified' || r.bankVerificationStatus === 'Verified');
    if (filterStatus === 'PENDING') return matchesSearch && (r.status === 'Pending Verification' || r.status === 'OCR Extracted');
    if (filterStatus === 'MATURING') return matchesSearch && r.daysToMaturity <= 30;
    return matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* 1. Mandatory Alert: Your Recent FDR is going to expire */}
      <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-[#4a1515]/80 via-[#2e1212]/90 to-[#0e2a27] border-2 border-red-500/50 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4 animate-in fade-in duration-300">
        <div className="flex items-start gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-red-950 border border-red-500/60 flex items-center justify-center text-red-400 shrink-0 mt-0.5">
            <Mail className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-red-500/20 text-red-300 border border-red-500/40">
                🚨 Immediate Action: FDR Expiring
              </span>
              <span className="text-xs text-[#d8be9a] font-mono">
                Recipient: 240352.cs@rmkec.ac.in
              </span>
            </div>
            <h2 className="text-sm sm:text-base font-bold text-[#fbf8f3] mt-1">
              Your Recent FDR #{recentExpiringFdr?.fdrNumber || '394829104821'} for {institutionName} is going to expire!
            </h2>
            <p className="text-xs text-[#fca5a5] mt-0.5">
              Maturity Date: {recentExpiringFdr?.maturityDate || '02-Nov-2026'} ({recentExpiringFdr?.daysToMaturity || 3} days remaining) • Depository: {recentExpiringFdr?.bankName || 'State Bank of India'} (₹ {recentExpiringFdr?.principalAmount?.toLocaleString('en-IN') || '50,00,000'})
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto shrink-0">
          <button
            onClick={() => onOpenEmailAlert && onOpenEmailAlert(institutionName, recentExpiringFdr?.fdrNumber || '394829104821')}
            className="flex-1 md:flex-none px-4 py-2 rounded-xl bg-gradient-to-r from-[#d8be9a] to-[#c4a274] text-[#091a18] font-bold text-xs uppercase tracking-wider hover:brightness-105 shadow flex items-center justify-center gap-2 transition"
          >
            <Mail className="w-3.5 h-3.5" />
            <span>View / Send Alert Email</span>
          </button>
          {recentExpiringFdr && (
            <button
              onClick={() => onSelectFdr(recentExpiringFdr.id)}
              className="px-3 py-2 rounded-xl bg-[#143834] text-[#d8be9a] border border-[#d8be9a]/30 hover:bg-[#1a4a45] text-xs font-semibold"
            >
              View FDR
            </button>
          )}
        </div>
      </div>

      {/* Institution Header Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-[#0e2a27] via-[#143834] to-[#0e2a27] border border-[#d8be9a]/30 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#d8be9a] block">
            Institution FDR Compliance Center
          </span>
          <h1 className="text-xl sm:text-2xl font-bold text-[#fbf8f3] mt-1">
            {institutionName}
          </h1>
          <p className="text-xs text-[#d0c5b4] mt-0.5">
            AICTE Code: {currentUser.institutionCode || 'INST-AICTE-TN-0492'} • Active Corpus Guarantee: ₹ {(totalCorpus / 10000000).toFixed(2)} Crores
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => onOpenEmailAlert && onOpenEmailAlert(institutionName, recentExpiringFdr?.fdrNumber || '394829104821')}
            className="px-4 py-2.5 rounded-xl bg-[#143834] text-[#d8be9a] border border-[#d8be9a]/35 text-xs font-semibold hover:bg-[#1b4b45] flex items-center gap-2 transition"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Alert 240352.cs@rmkec.ac.in</span>
          </button>

          <button
            onClick={onOpenUpload}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#d8be9a] to-[#c4a274] text-[#091a18] font-bold text-xs uppercase tracking-wider hover:brightness-105 shadow-lg shadow-black/20 flex items-center gap-2 shrink-0 transition"
          >
            <UploadCloud className="w-4 h-4" />
            <span>Upload New FDR Certificate</span>
          </button>
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3.5">
        <div className="p-4 rounded-xl bg-[#0e2a27] border border-[#d8be9a]/20">
          <span className="text-xs text-[#d0c5b4] block">Total Submitted</span>
          <div className="text-2xl font-bold text-[#fbf8f3] mt-1">{totalSubmitted}</div>
          <span className="text-[10px] text-gray-400 mt-1 block">Active on record</span>
        </div>

        <div className="p-4 rounded-xl bg-[#0e2a27] border border-[#d8be9a]/20">
          <span className="text-xs text-[#d0c5b4] block">Verified & Active</span>
          <div className="text-2xl font-bold text-[#2ecc71] mt-1">{verifiedCount}</div>
          <span className="text-[10px] text-emerald-400/80 mt-1 block">Lien confirmed</span>
        </div>

        <div className="p-4 rounded-xl bg-[#0e2a27] border border-[#d8be9a]/20">
          <span className="text-xs text-[#d0c5b4] block">Pending Verification</span>
          <div className="text-2xl font-bold text-[#d8be9a] mt-1">{pendingCount}</div>
          <span className="text-[10px] text-[#d8be9a]/80 mt-1 block">In Officer queue</span>
        </div>

        <div className="p-4 rounded-xl bg-[#0e2a27] border border-[#d8be9a]/20">
          <span className="text-xs text-[#d0c5b4] block">Approaching Maturity</span>
          <div className="text-2xl font-bold text-amber-400 mt-1">{approachingCount}</div>
          <span className="text-[10px] text-amber-400/80 mt-1 block">Within 30 days</span>
        </div>

        <div className="p-4 rounded-xl bg-[#0e2a27] border border-[#d8be9a]/20 col-span-2 lg:col-span-1">
          <span className="text-xs text-[#d0c5b4] block">Matured / Overdue</span>
          <div className="text-2xl font-bold text-red-400 mt-1">{maturedCount}</div>
          <span className="text-[10px] text-red-400/80 mt-1 block">Requires action</span>
        </div>
      </div>

      {/* Filter and Table Section */}
      <div className="p-5 rounded-2xl bg-[#0e2a27] border border-[#d8be9a]/25 space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <h2 className="text-base font-bold text-[#fbf8f3]">
            Submitted Fixed Deposit Receipts
          </h2>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-60">
              <Search className="w-4 h-4 text-[#d8be9a] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search FDR #, bank..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-[#091a18] border border-[#d8be9a]/25 text-xs text-[#fbf8f3] focus:outline-none focus:border-[#d8be9a]"
              />
            </div>

            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-3 py-1.5 rounded-xl bg-[#091a18] border border-[#d8be9a]/25 text-xs text-[#d8be9a] focus:outline-none"
            >
              <option value="ALL">All Deposits</option>
              <option value="VERIFIED">Verified</option>
              <option value="PENDING">Pending</option>
              <option value="MATURING">Approaching</option>
            </select>
          </div>
        </div>

        {/* Data Table */}
        <div className="overflow-x-auto rounded-xl border border-[#d8be9a]/20 bg-[#091a18]">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#0b201e] border-b border-[#d8be9a]/20 text-[#d8be9a] uppercase text-[10px] tracking-wider">
              <tr>
                <th className="p-3.5">FDR Number</th>
                <th className="p-3.5">Bank / Branch</th>
                <th className="p-3.5">Principal Amount</th>
                <th className="p-3.5">Interest</th>
                <th className="p-3.5">Maturity Date</th>
                <th className="p-3.5">Verification</th>
                <th className="p-3.5">Lifecycle</th>
                <th className="p-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#d8be9a]/10">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-gray-500">
                    No matching FDR records found for this institution.
                  </td>
                </tr>
              ) : (
                filtered.map((r) => (
                  <tr key={r.id} className="hover:bg-[#143834]/30 transition">
                    <td className="p-3.5 font-mono font-medium text-[#fbf8f3]">
                      #{r.fdrNumber}
                    </td>
                    <td className="p-3.5">
                      <div className="font-semibold text-[#fbf8f3]">{r.bankName}</div>
                      <div className="text-[10px] text-[#d0c5b4] truncate max-w-[180px]">{r.branchName}</div>
                    </td>
                    <td className="p-3.5 font-bold text-[#fbf8f3]">
                      ₹ {r.principalAmount.toLocaleString('en-IN')}
                    </td>
                    <td className="p-3.5 text-[#d8be9a] font-mono">
                      {r.interestRate}%
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
                        {r.daysToMaturity < 0
                          ? `${Math.abs(r.daysToMaturity)}d Overdue`
                          : `${r.daysToMaturity}d remaining`}
                      </div>
                    </td>
                    <td className="p-3.5">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                          r.bankVerificationStatus === 'Verified'
                            ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                            : r.bankVerificationStatus === 'Mismatch Detected'
                            ? 'bg-red-500/15 text-red-400 border border-red-500/30'
                            : 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                        }`}
                      >
                        {r.bankVerificationStatus}
                      </span>
                    </td>
                    <td className="p-3.5">
                      <span className="text-[11px] px-2 py-0.5 rounded-full bg-[#133834] text-[#d8be9a] border border-[#d8be9a]/20">
                        {r.status}
                      </span>
                    </td>
                    <td className="p-3.5 text-right space-x-1.5 whitespace-nowrap">
                      <button
                        onClick={() => onSelectFdr(r.id)}
                        className="px-2.5 py-1 rounded-lg bg-[#143834] text-[#d8be9a] hover:bg-[#1a4a45] text-xs font-medium"
                      >
                        View Details
                      </button>
                      {r.daysToMaturity <= 15 && (
                        <button
                          onClick={() => onRequestRenewal(r.id)}
                          className="px-2.5 py-1 rounded-lg bg-[#d8be9a] text-[#091a18] hover:bg-[#c4a274] text-xs font-bold"
                        >
                          Request Renewal
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
    </div>
  );
};
