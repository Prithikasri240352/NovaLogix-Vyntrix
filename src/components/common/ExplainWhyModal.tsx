import React from 'react';
import { HelpCircle, AlertOctagon, CheckCircle2, ArrowRight, ShieldAlert, FileText, X } from 'lucide-react';
import { FDRRecord, RiskIssue } from '../../types';

interface ExplainWhyModalProps {
  isOpen: boolean;
  onClose: () => void;
  fdr: FDRRecord | null;
  issue?: RiskIssue | null;
}

export const ExplainWhyModal: React.FC<ExplainWhyModalProps> = ({
  isOpen,
  onClose,
  fdr,
  issue
}) => {
  if (!isOpen || !fdr) return null;

  const activeIssue = issue || (fdr.riskIssues && fdr.riskIssues[0]) || {
    id: 'default',
    title: 'Statutory Verification Assessment',
    field: 'All Extracted Fields',
    evidence: 'Cross-validated document OCR scan with core banking system response.',
    whyItMatters: 'Guarantees the authenticity of statutory endowment funds deposited by the institution.',
    recommendedAction: 'Verify physical signatures and execute periodic bank balance audit.',
    severity: fdr.riskCategory
  };

  const severityColor =
    activeIssue.severity === 'Critical'
      ? 'text-[#e74c3c] bg-[#e74c3c]/15 border-[#e74c3c]/30'
      : activeIssue.severity === 'High'
      ? 'text-[#e67e22] bg-[#e67e22]/15 border-[#e67e22]/30'
      : activeIssue.severity === 'Medium'
      ? 'text-[#f1c40f] bg-[#f1c40f]/15 border-[#f1c40f]/30'
      : 'text-[#2ecc71] bg-[#2ecc71]/15 border-[#2ecc71]/30';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-xl rounded-2xl bg-[#0e2a27] border border-[#d8be9a]/35 shadow-2xl text-[#fbf8f3] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-[#d8be9a]/20 bg-[#091a18]">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-[#143834] border border-[#d8be9a]/30 text-[#d8be9a]">
              <HelpCircle className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-[#fbf8f3]">Explainable AI Diagnostic</h3>
                <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full border ${severityColor}`}>
                  {activeIssue.severity} Risk
                </span>
              </div>
              <p className="text-xs text-[#d0c5b4]">
                Transparent reason analysis for FDR #{fdr.fdrNumber}
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

        {/* Content */}
        <div className="p-6 space-y-4 overflow-y-auto max-h-[75vh]">
          {/* Issue Title Box */}
          <div className="p-3.5 rounded-xl bg-[#091a18] border border-[#d8be9a]/20">
            <div className="text-xs text-[#d8be9a] font-semibold uppercase tracking-wider">
              1. Detected Issue
            </div>
            <div className="text-base font-semibold text-[#fbf8f3] mt-1">
              {activeIssue.title}
            </div>
            <div className="text-xs text-[#d0c5b4] mt-0.5">
              Impacted Field: <span className="font-mono text-[#d8be9a]">{activeIssue.field}</span>
            </div>
          </div>

          {/* Evidence */}
          <div className="p-3.5 rounded-xl bg-[#091a18] border border-[#d8be9a]/20">
            <div className="text-xs text-[#d8be9a] font-semibold uppercase tracking-wider flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5" />
              2. Supporting Evidence
            </div>
            <div className="text-sm text-[#e7d7c1] mt-1.5 leading-relaxed">
              {activeIssue.evidence}
            </div>
          </div>

          {/* Why It Matters */}
          <div className="p-3.5 rounded-xl bg-[#091a18] border border-[#d8be9a]/20">
            <div className="text-xs text-[#d8be9a] font-semibold uppercase tracking-wider flex items-center gap-1.5">
              <ShieldAlert className="w-3.5 h-3.5" />
              3. Why It Matters (Compliance Rationale)
            </div>
            <div className="text-sm text-[#e7d7c1] mt-1.5 leading-relaxed">
              {activeIssue.whyItMatters}
            </div>
          </div>

          {/* Recommended Next Action */}
          <div className="p-3.5 rounded-xl bg-[#143834] border border-[#d8be9a]/35">
            <div className="text-xs text-[#d8be9a] font-semibold uppercase tracking-wider flex items-center gap-1.5">
              <ArrowRight className="w-3.5 h-3.5" />
              4. Recommended Officer Action
            </div>
            <div className="text-sm text-[#fbf8f3] font-medium mt-1.5 leading-relaxed">
              {activeIssue.recommendedAction}
            </div>
          </div>

          {/* Human Decision Disclaimer */}
          <div className="p-3 rounded-lg bg-[#091a18]/60 border border-[#d8be9a]/15 text-[11px] text-[#a39a8c] italic">
            * Regulatory Standard: NoavaLogix AI performs explainable discrepancy analysis and risk scoring. In compliance with statutory guidelines, AI never automatically approves or rejects an FDR. The final legal authorization resides exclusively with the appointed Officer.
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-[#d8be9a]/20 bg-[#091a18] flex items-center justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-[#d8be9a] text-[#091a18] font-semibold text-xs uppercase tracking-wider hover:bg-[#c4a274] transition"
          >
            Acknowledge & Close
          </button>
        </div>
      </div>
    </div>
  );
};
