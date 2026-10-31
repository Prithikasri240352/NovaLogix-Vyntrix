import React, { useState } from 'react';
import {
  X,
  Building,
  Calendar,
  DollarSign,
  ShieldCheck,
  AlertTriangle,
  FileText,
  Clock,
  CheckCircle,
  HelpCircle,
  RefreshCw,
  Send,
  Lock,
  ArrowRight
} from 'lucide-react';
import { FDRRecord, FDRStatus, BankVerificationStatus } from '../../types';

interface FDRDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  fdr: FDRRecord | null;
  onUpdateStatus?: (fdrId: string, status: FDRStatus, bankStatus: BankVerificationStatus, note?: string) => void;
  onExplainWhy?: (fdr: FDRRecord) => void;
  isOfficer?: boolean;
}

const LIFECYCLE_STAGES: FDRStatus[] = [
  'Uploaded',
  'OCR Extracted',
  'Pending Verification',
  'Bank Verification',
  'Verified',
  'Active',
  'Approaching Maturity',
  'Matured',
  'Renewal / Release Processing',
  'Closed'
];

export const FDRDetailModal: React.FC<FDRDetailModalProps> = ({
  isOpen,
  onClose,
  fdr,
  onUpdateStatus,
  onExplainWhy,
  isOfficer = true
}) => {
  const [remarkInput, setRemarkInput] = useState('');
  const [activeTab, setActiveTab] = useState<'details' | 'discrepancy' | 'audit' | 'twin'>('details');
  const [simulatingBank, setSimulatingBank] = useState(false);

  if (!isOpen || !fdr) return null;

  const currentStageIndex = LIFECYCLE_STAGES.indexOf(fdr.status);

  const handleSimulateBankVerify = () => {
    setSimulatingBank(true);
    setTimeout(() => {
      setSimulatingBank(false);
      if (onUpdateStatus) {
        onUpdateStatus(fdr.id, 'Verified', 'Verified', 'Automated CBS query matched all deposit fields.');
      }
    }, 1200);
  };

  const handleOfficerAction = (action: 'approve' | 'flag' | 'renewal' | 'release') => {
    if (!onUpdateStatus) return;
    if (action === 'approve') {
      onUpdateStatus(fdr.id, 'Verified', 'Verified', remarkInput || 'Officer reviewed and approved statutory compliance.');
    } else if (action === 'flag') {
      onUpdateStatus(fdr.id, 'Bank Verification', 'Mismatch Detected', remarkInput || 'Officer flagged record for discrepancy audit.');
    } else if (action === 'renewal') {
      onUpdateStatus(fdr.id, 'Renewal / Release Processing', fdr.bankVerificationStatus, remarkInput || 'Renewal notice issued to institution.');
    } else if (action === 'release') {
      onUpdateStatus(fdr.id, 'Closed', fdr.bankVerificationStatus, remarkInput || 'Statutory release approved by regulatory council.');
    }
    setRemarkInput('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-4xl max-h-[92vh] flex flex-col rounded-2xl bg-[#0e2a27] border border-[#d8be9a]/35 shadow-2xl text-[#fbf8f3] overflow-hidden">
        {/* Header */}
        <div className="p-5 border-b border-[#d8be9a]/20 bg-[#091a18] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-[#143834] border border-[#d8be9a]/30 text-[#d8be9a]">
              <FileText className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h2 className="text-xl font-bold tracking-tight text-[#fbf8f3]">
                  FDR #{fdr.fdrNumber}
                </h2>
                <span
                  className={`text-xs px-2.5 py-0.5 rounded-full font-semibold border ${
                    fdr.riskCategory === 'Critical'
                      ? 'bg-red-500/15 text-red-400 border-red-500/30'
                      : fdr.riskCategory === 'High'
                      ? 'bg-amber-500/15 text-amber-400 border-amber-500/30'
                      : 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                  }`}
                >
                  {fdr.riskCategory} Risk ({fdr.riskScore}/100)
                </span>
                <span className="text-xs px-2 py-0.5 rounded-md bg-[#133834] text-[#d8be9a] font-medium border border-[#d8be9a]/20">
                  {fdr.bankName}
                </span>
              </div>
              <p className="text-xs text-[#d0c5b4] mt-0.5">
                {fdr.institutionName} ({fdr.institutionCode})
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-[#143834] transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 10-Stage Interactive Lifecycle Visual Stepper */}
        <div className="px-6 py-3 bg-[#091a18]/70 border-b border-[#d8be9a]/15 overflow-x-auto">
          <div className="flex items-center justify-between min-w-[700px] text-[10px]">
            {LIFECYCLE_STAGES.map((stage, idx) => {
              const isPast = idx < currentStageIndex;
              const isCurrent = idx === currentStageIndex;
              return (
                <div key={stage} className="flex items-center gap-1.5">
                  <div
                    className={`flex items-center justify-center w-5 h-5 rounded-full font-bold text-[9px] ${
                      isCurrent
                        ? 'bg-[#d8be9a] text-[#091a18] ring-2 ring-[#d8be9a]/50 ring-offset-1 ring-offset-[#091a18]'
                        : isPast
                        ? 'bg-[#2ecc71] text-white'
                        : 'bg-[#143834] text-[#d0c5b4]'
                    }`}
                  >
                    {isPast ? '✓' : idx + 1}
                  </div>
                  <span
                    className={`truncate max-w-[80px] ${
                      isCurrent ? 'font-bold text-[#d8be9a]' : isPast ? 'text-[#fbf8f3]' : 'text-gray-500'
                    }`}
                    title={stage}
                  >
                    {stage}
                  </span>
                  {idx < LIFECYCLE_STAGES.length - 1 && (
                    <div className={`w-3 h-0.5 ${isPast ? 'bg-[#2ecc71]' : 'bg-[#143834]'}`} />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Tab Selector */}
        <div className="flex border-b border-[#d8be9a]/15 bg-[#0b201e] px-6">
          <button
            onClick={() => setActiveTab('details')}
            className={`py-3 px-4 text-xs font-semibold border-b-2 transition ${
              activeTab === 'details'
                ? 'border-[#d8be9a] text-[#d8be9a]'
                : 'border-transparent text-[#d0c5b4] hover:text-[#fbf8f3]'
            }`}
          >
            Financial & OCR Data
          </button>
          <button
            onClick={() => setActiveTab('discrepancy')}
            className={`py-3 px-4 text-xs font-semibold border-b-2 transition flex items-center gap-1.5 ${
              activeTab === 'discrepancy'
                ? 'border-[#d8be9a] text-[#d8be9a]'
                : 'border-transparent text-[#d0c5b4] hover:text-[#fbf8f3]'
            }`}
          >
            Bank Discrepancy Analysis
            {fdr.bankVerificationStatus === 'Mismatch Detected' && (
              <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
            )}
          </button>
          <button
            onClick={() => setActiveTab('twin')}
            className={`py-3 px-4 text-xs font-semibold border-b-2 transition ${
              activeTab === 'twin'
                ? 'border-[#d8be9a] text-[#d8be9a]'
                : 'border-transparent text-[#d0c5b4] hover:text-[#fbf8f3]'
            }`}
          >
            FDR Digital Twin
          </button>
          <button
            onClick={() => setActiveTab('audit')}
            className={`py-3 px-4 text-xs font-semibold border-b-2 transition ${
              activeTab === 'audit'
                ? 'border-[#d8be9a] text-[#d8be9a]'
                : 'border-transparent text-[#d0c5b4] hover:text-[#fbf8f3]'
            }`}
          >
            Audit Trail ({fdr.auditTrail.length})
          </button>
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {activeTab === 'details' && (
            <div className="space-y-6">
              {/* Financial Snapshot */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3.5 rounded-xl bg-[#091a18] border border-[#d8be9a]/20">
                  <span className="text-[11px] text-[#d0c5b4]">Principal Amount</span>
                  <div className="text-lg font-bold text-[#fbf8f3] mt-0.5">
                    ₹ {fdr.principalAmount.toLocaleString('en-IN')}
                  </div>
                  <div className="text-[10px] text-[#2ecc71] mt-0.5">
                    Confidence: {fdr.ocrConfidence.principalAmount}%
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-[#091a18] border border-[#d8be9a]/20">
                  <span className="text-[11px] text-[#d0c5b4]">Interest Rate</span>
                  <div className="text-lg font-bold text-[#d8be9a] mt-0.5">
                    {fdr.interestRate}% p.a.
                  </div>
                  <div className="text-[10px] text-[#2ecc71] mt-0.5">
                    Confidence: {fdr.ocrConfidence.interestRate}%
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-[#091a18] border border-[#d8be9a]/20">
                  <span className="text-[11px] text-[#d0c5b4]">Maturity Amount</span>
                  <div className="text-lg font-bold text-[#fbf8f3] mt-0.5">
                    ₹ {fdr.maturityAmount.toLocaleString('en-IN')}
                  </div>
                  <div className="text-[10px] text-[#d0c5b4] mt-0.5">Compounded Annually</div>
                </div>

                <div className="p-3.5 rounded-xl bg-[#091a18] border border-[#d8be9a]/20">
                  <span className="text-[11px] text-[#d0c5b4]">Days to Maturity</span>
                  <div
                    className={`text-lg font-bold mt-0.5 ${
                      fdr.daysToMaturity < 0
                        ? 'text-red-400'
                        : fdr.daysToMaturity <= 7
                        ? 'text-amber-400'
                        : 'text-[#2ecc71]'
                    }`}
                  >
                    {fdr.daysToMaturity < 0
                      ? `${Math.abs(fdr.daysToMaturity)} Days Overdue`
                      : fdr.daysToMaturity === 0
                      ? 'Expiring Today'
                      : `${fdr.daysToMaturity} Days`}
                  </div>
                  <div className="text-[10px] text-[#d0c5b4] mt-0.5">{fdr.maturityDate}</div>
                </div>
              </div>

              {/* Deposit Holder & Bank Branch info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-[#091a18] border border-[#d8be9a]/20 space-y-2 text-xs">
                  <div className="font-semibold text-sm text-[#d8be9a] flex items-center gap-1.5">
                    <Building className="w-4 h-4" /> Deposit & Holder Credentials
                  </div>
                  <div className="flex justify-between py-1 border-b border-[#d8be9a]/10">
                    <span className="text-[#d0c5b4]">Account Holder</span>
                    <span className="font-medium text-[#fbf8f3]">{fdr.accountHolder}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-[#d8be9a]/10">
                    <span className="text-[#d0c5b4]">Institution</span>
                    <span className="font-medium text-[#fbf8f3]">{fdr.institutionName}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-[#d8be9a]/10">
                    <span className="text-[#d0c5b4]">Issue Date</span>
                    <span className="font-medium text-[#fbf8f3]">{fdr.issueDate}</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-[#d0c5b4]">Maturity Date</span>
                    <span className="font-medium text-[#fbf8f3]">{fdr.maturityDate}</span>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-[#091a18] border border-[#d8be9a]/20 space-y-2 text-xs">
                  <div className="font-semibold text-sm text-[#d8be9a] flex items-center gap-1.5">
                    <Lock className="w-4 h-4" /> Bank Branch & Statutory Lien
                  </div>
                  <div className="flex justify-between py-1 border-b border-[#d8be9a]/10">
                    <span className="text-[#d0c5b4]">Bank</span>
                    <span className="font-medium text-[#fbf8f3]">{fdr.bankName}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-[#d8be9a]/10">
                    <span className="text-[#d0c5b4]">Branch</span>
                    <span className="font-medium text-[#fbf8f3] truncate max-w-[200px]" title={fdr.branchName}>
                      {fdr.branchName}
                    </span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-[#d8be9a]/10">
                    <span className="text-[#d0c5b4]">IFSC Code</span>
                    <span className="font-mono text-[#fbf8f3]">{fdr.ifscCode}</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-[#d0c5b4]">Lien Beneficiary</span>
                    <span className="font-medium text-[#2ecc71] flex items-center gap-1">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      {fdr.lienBeneficiary}
                    </span>
                  </div>
                </div>
              </div>

              {/* Explain Why Button */}
              {fdr.riskIssues.length > 0 && (
                <div className="p-4 rounded-xl bg-[#143834] border border-[#d8be9a]/30 flex items-center justify-between">
                  <div>
                    <h4 className="font-semibold text-sm text-[#fbf8f3] flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 text-amber-400" />
                      AI Compliance Diagnostic Flagged
                    </h4>
                    <p className="text-xs text-[#d0c5b4] mt-0.5">
                      {fdr.riskIssues[0].title}
                    </p>
                  </div>
                  <button
                    onClick={() => onExplainWhy && onExplainWhy(fdr)}
                    className="px-4 py-2 rounded-lg bg-[#d8be9a] text-[#091a18] font-bold text-xs uppercase tracking-wider hover:bg-[#c4a274] transition flex items-center gap-1.5"
                  >
                    <HelpCircle className="w-4 h-4" />
                    <span>WHY? (Explain)</span>
                  </button>
                </div>
              )}
            </div>
          )}

          {activeTab === 'discrepancy' && (
            <div className="space-y-4">
              <div className="p-3.5 rounded-xl bg-[#091a18] border border-[#d8be9a]/20 flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-semibold text-[#fbf8f3]">
                    Bidirectional CBS Ledger Cross-Check
                  </h4>
                  <p className="text-xs text-[#d0c5b4]">
                    Comparison between AI OCR extraction and simulated {fdr.bankName} core banking API
                  </p>
                </div>
                <button
                  onClick={handleSimulateBankVerify}
                  disabled={simulatingBank}
                  className="px-3.5 py-1.5 rounded-lg bg-[#143834] text-[#d8be9a] border border-[#d8be9a]/30 text-xs font-medium hover:bg-[#1b4b45] flex items-center gap-1.5 disabled:opacity-50"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${simulatingBank ? 'animate-spin' : ''}`} />
                  <span>Re-Query Bank CBS</span>
                </button>
              </div>

              {/* Comparison Matrix Table */}
              <div className="overflow-x-auto rounded-xl border border-[#d8be9a]/20 bg-[#091a18]">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#0b201e] border-b border-[#d8be9a]/20 text-[#d8be9a] uppercase text-[10px]">
                    <tr>
                      <th className="p-3">Data Field</th>
                      <th className="p-3">Document (OCR) Value</th>
                      <th className="p-3">Bank CBS Value</th>
                      <th className="p-3">Result</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#d8be9a]/10">
                    {fdr.discrepancies.map((d, i) => (
                      <tr key={i} className="hover:bg-[#143834]/30">
                        <td className="p-3 font-medium text-[#fbf8f3]">{d.field}</td>
                        <td className="p-3 font-mono text-[#d0c5b4]">{d.ocrValue}</td>
                        <td className="p-3 font-mono text-[#d0c5b4]">{d.bankValue}</td>
                        <td className="p-3">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                              d.status === 'Match'
                                ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                                : d.status === 'Mismatch'
                                ? 'bg-red-500/15 text-red-400 border border-red-500/30 font-bold'
                                : 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                            }`}
                          >
                            {d.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'twin' && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-[#091a18] border border-[#d8be9a]/20 text-xs space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-sm text-[#d8be9a]">
                    FDR Digital Twin State Machine
                  </span>
                  <span className="text-[11px] font-mono text-gray-400">
                    ID: {fdr.id}
                  </span>
                </div>
                <p className="text-[#d0c5b4]">
                  A synchronized digital replica of the physical FDR certificate #{fdr.fdrNumber}, tracking cryptographic lien markers, interest accretion, and regulatory standing.
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-2">
                  <div className="p-2.5 rounded-lg bg-[#0e2a27] border border-[#d8be9a]/15">
                    <span className="text-[10px] text-gray-400">Current Lifecycle Node</span>
                    <div className="font-semibold text-sm text-[#d8be9a] mt-0.5">{fdr.status}</div>
                  </div>
                  <div className="p-2.5 rounded-lg bg-[#0e2a27] border border-[#d8be9a]/15">
                    <span className="text-[10px] text-gray-400">CBS Token Status</span>
                    <div className="font-semibold text-sm text-[#2ecc71] mt-0.5">{fdr.bankVerificationStatus}</div>
                  </div>
                  <div className="p-2.5 rounded-lg bg-[#0e2a27] border border-[#d8be9a]/15">
                    <span className="text-[10px] text-gray-400">Document Scan Status</span>
                    <div className="font-semibold text-sm text-white mt-0.5">{fdr.documentName || 'Certificate Verified'}</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'audit' && (
            <div className="space-y-3">
              <div className="text-xs text-[#d8be9a] font-semibold uppercase tracking-wider">
                Chronological Compliance History
              </div>
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {fdr.auditTrail.map((trail) => (
                  <div
                    key={trail.id}
                    className="p-3 rounded-xl bg-[#091a18] border border-[#d8be9a]/15 flex items-start justify-between text-xs"
                  >
                    <div>
                      <div className="font-semibold text-[#fbf8f3] flex items-center gap-2">
                        {trail.action}
                        <span className="text-[10px] px-2 py-0.5 rounded bg-[#143834] text-[#d8be9a]">
                          {trail.role}
                        </span>
                      </div>
                      <div className="text-[11px] text-[#d0c5b4] mt-0.5">
                        Performed by: {trail.performedBy}
                      </div>
                      {trail.note && (
                        <div className="text-[11px] text-[#e7d7c1] italic mt-1 bg-[#0b201e] p-1.5 rounded border border-[#d8be9a]/10">
                          "{trail.note}"
                        </div>
                      )}
                    </div>
                    <span className="text-[10px] text-gray-400 shrink-0 font-mono">
                      {trail.timestamp}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Officer Interactive Action Controls (Officer Only) */}
        {isOfficer && (
          <div className="p-4 border-t border-[#d8be9a]/20 bg-[#091a18] space-y-3">
            <div className="flex items-center gap-3">
              <input
                type="text"
                placeholder="Enter regulatory review note or authorization remarks..."
                value={remarkInput}
                onChange={(e) => setRemarkInput(e.target.value)}
                className="flex-1 px-3.5 py-2 rounded-xl bg-[#0e2a27] border border-[#d8be9a]/30 text-xs text-[#fbf8f3] focus:outline-none focus:border-[#d8be9a]"
              />
            </div>
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleOfficerAction('approve')}
                  className="px-3.5 py-2 rounded-xl bg-[#2ecc71] hover:bg-[#27ae60] text-[#091a18] font-bold text-xs uppercase tracking-wider transition"
                >
                  ✓ Authorize & Mark Verified
                </button>
                <button
                  onClick={() => handleOfficerAction('flag')}
                  className="px-3.5 py-2 rounded-xl bg-[#e74c3c] hover:bg-[#c0392b] text-white font-bold text-xs uppercase tracking-wider transition"
                >
                  Flag Discrepancy
                </button>
                <button
                  onClick={() => handleOfficerAction('renewal')}
                  className="px-3.5 py-2 rounded-xl bg-[#143834] text-[#d8be9a] border border-[#d8be9a]/30 hover:bg-[#1b4b45] text-xs font-medium transition"
                >
                  Issue Renewal Notice
                </button>
              </div>
              <button
                onClick={onClose}
                className="px-4 py-2 rounded-xl bg-[#143834] text-[#fbf8f3] text-xs font-medium hover:bg-[#1b4b45] transition"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
