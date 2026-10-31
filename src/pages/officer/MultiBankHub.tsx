import React, { useState } from 'react';
import {
  Building,
  CheckCircle,
  AlertTriangle,
  RefreshCw,
  Search,
  ExternalLink,
  ShieldCheck,
  Cpu,
  Info,
  Clock,
  ArrowRight
} from 'lucide-react';
import { FDRRecord, SupportedBankCode } from '../../types';
import { MOCK_BANKS_INFO } from '../../data/sampleFDRs';

interface MultiBankHubProps {
  records: FDRRecord[];
  onSelectFdr: (fdrId: string) => void;
  onVerifyBank: (fdrId: string) => void;
}

export const MultiBankHub: React.FC<MultiBankHubProps> = ({
  records,
  onSelectFdr,
  onVerifyBank
}) => {
  const [selectedBank, setSelectedBank] = useState<string>('ALL');
  const [queryingBank, setQueryingBank] = useState<string | null>(null);
  const [batchResult, setBatchResult] = useState<string | null>(null);

  const bankRecords = selectedBank === 'ALL'
    ? records
    : records.filter(r => r.bankCode === selectedBank);

  const handleTestBankPing = (bankCode: string) => {
    setQueryingBank(bankCode);
    setBatchResult(null);
    setTimeout(() => {
      setQueryingBank(null);
      setBatchResult(`Adapter handshake confirmed: ${bankCode} Core Gateway responsive. Round-trip latency: ${Math.floor(28 + Math.random() * 35)}ms.`);
    }, 900);
  };

  const handleRunBatchVerification = () => {
    setQueryingBank('BATCH');
    setBatchResult(null);
    setTimeout(() => {
      setQueryingBank(null);
      setBatchResult(`Batch Verification Engine scanned ${records.length} records across 8 bank adapters: 7 Verified, 1 Discrepancy isolated (Axis Bank), 1 Dual-Auth token pending (Union Bank).`);
    }, 1200);
  };

  return (
    <div className="space-y-6">
      {/* Hub Header */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-[#0e2a27] via-[#143834] to-[#0e2a27] border border-[#d8be9a]/30 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#d8be9a] block">
            Adapter-Based Interoperability
          </span>
          <h1 className="text-xl sm:text-2xl font-bold text-[#fbf8f3] mt-1">
            NoavaLogix Multi-Bank Verification Hub
          </h1>
          <p className="text-xs text-[#d0c5b4] mt-0.5">
            Real-Time CBS Telemetry & Bidirectional Discrepancy Matching Across 8 Scheduled Commercial Banks
          </p>
        </div>

        <button
          onClick={handleRunBatchVerification}
          disabled={queryingBank !== null}
          className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#d8be9a] to-[#c4a274] text-[#091a18] font-bold text-xs uppercase tracking-wider hover:brightness-105 shadow-md flex items-center gap-2 shrink-0 transition disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${queryingBank === 'BATCH' ? 'animate-spin' : ''}`} />
          <span>Execute Multi-Bank Batch Check</span>
        </button>
      </div>

      {/* Mandatory Regulatory Simulation Notice */}
      <div className="p-4 rounded-xl bg-[#091a18] border border-[#d8be9a]/25 text-xs flex items-start gap-3">
        <Info className="w-5 h-5 text-[#d8be9a] shrink-0 mt-0.5" />
        <div className="space-y-1">
          <div className="font-semibold text-[#fbf8f3]">
            Simulated Bank Core Banking Adapter Architecture (Sandbox Staging v2.4)
          </div>
          <p className="text-[#d0c5b4] leading-relaxed">
            In compliance with security standards, this prototype integrates with standard mock bank adapters simulating Core Banking Systems (CBS) for SBI, Indian Bank, Canara Bank, Bank of Baroda, Union Bank, HDFC, ICICI, and Axis Bank. No real customer credentials or live bank endpoints are exposed.
          </p>
        </div>
      </div>

      {batchResult && (
        <div className="p-3.5 rounded-xl bg-[#1b4332]/60 border border-[#2ecc71]/40 text-xs text-[#a3e635] flex items-center gap-2 animate-in fade-in">
          <CheckCircle className="w-4 h-4 shrink-0 text-[#2ecc71]" />
          <span>{batchResult}</span>
        </div>
      )}

      {/* 8 Bank Integration Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {MOCK_BANKS_INFO.map((b) => {
          const bankRecordCount = records.filter(r => r.bankCode === b.code).length;
          const isSelected = selectedBank === b.code;
          return (
            <div
              key={b.code}
              onClick={() => setSelectedBank(isSelected ? 'ALL' : b.code)}
              className={`p-3.5 rounded-xl border cursor-pointer transition ${
                isSelected
                  ? 'bg-[#143834] border-[#d8be9a] ring-1 ring-[#d8be9a]'
                  : 'bg-[#0e2a27] border-[#d8be9a]/20 hover:border-[#d8be9a]/50'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xl">{b.icon}</span>
                <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-[#091a18] text-[#2ecc71]">
                  {b.latency}
                </span>
              </div>
              <div className="font-bold text-xs text-[#fbf8f3] mt-2 truncate" title={b.name}>
                {b.name}
              </div>
              <div className="flex items-center justify-between mt-2 pt-2 border-t border-[#d8be9a]/10 text-[10px]">
                <span className="text-[#d0c5b4]">{bankRecordCount} in Workspace</span>
                <span className="text-[#d8be9a] font-mono">Adapter v2.4</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Filtered Bank Records Table */}
      <div className="p-5 rounded-2xl bg-[#0e2a27] border border-[#d8be9a]/25 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-[#fbf8f3] flex items-center gap-2">
            <span>Bank-Wise FDR Telemetry Ledger</span>
            {selectedBank !== 'ALL' && (
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-[#143834] text-[#d8be9a] font-normal border border-[#d8be9a]/20">
                Filtered: {selectedBank}
              </span>
            )}
          </h2>

          {selectedBank !== 'ALL' && (
            <button
              onClick={() => setSelectedBank('ALL')}
              className="text-xs text-[#d8be9a] hover:underline"
            >
              Show All Banks
            </button>
          )}
        </div>

        <div className="overflow-x-auto rounded-xl border border-[#d8be9a]/20 bg-[#091a18]">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#0b201e] border-b border-[#d8be9a]/20 text-[#d8be9a] uppercase text-[10px] tracking-wider">
              <tr>
                <th className="p-3.5">Bank</th>
                <th className="p-3.5">FDR Number</th>
                <th className="p-3.5">Institution</th>
                <th className="p-3.5">Principal Amount</th>
                <th className="p-3.5">Lien Status</th>
                <th className="p-3.5">Bank Status</th>
                <th className="p-3.5 text-right">Verification Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#d8be9a]/10">
              {bankRecords.map((r) => (
                <tr key={r.id} className="hover:bg-[#143834]/30 transition">
                  <td className="p-3.5 font-semibold text-[#fbf8f3]">
                    {r.bankName}
                  </td>
                  <td className="p-3.5 font-mono text-[#d0c5b4]">
                    #{r.fdrNumber}
                  </td>
                  <td className="p-3.5 truncate max-w-[180px] text-[#fbf8f3]">
                    {r.institutionName}
                  </td>
                  <td className="p-3.5 font-bold text-[#fbf8f3]">
                    ₹ {r.principalAmount.toLocaleString('en-IN')}
                  </td>
                  <td className="p-3.5">
                    <span className="text-[10px] text-[#2ecc71] flex items-center gap-1 font-medium">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      {r.lienMarked ? 'Lien Marked' : 'Pending Lien'}
                    </span>
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
                  <td className="p-3.5 text-right space-x-1.5 whitespace-nowrap">
                    <button
                      onClick={() => onSelectFdr(r.id)}
                      className="px-2.5 py-1 rounded-lg bg-[#143834] text-[#d8be9a] hover:bg-[#1a4a45] text-xs font-medium"
                    >
                      Audit
                    </button>
                    <button
                      onClick={() => onVerifyBank(r.id)}
                      className="px-2.5 py-1 rounded-lg bg-[#d8be9a] text-[#091a18] hover:bg-[#c4a274] text-xs font-bold"
                    >
                      Query CBS
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
