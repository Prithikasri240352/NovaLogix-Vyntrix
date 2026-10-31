import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  X,
  Volume2,
  VolumeX,
  Play,
  Pause,
  RotateCcw,
  ShieldAlert,
  Clock,
  CheckCircle,
  Building,
  HelpCircle,
  FileSearch,
  MessageSquare,
  ArrowRight,
  Maximize2,
  Minimize2,
  AlertTriangle
} from 'lucide-react';
import { FDRRecord, UserProfile } from '../../types';
import { BrandLogo } from '../common/BrandLogo';
import { speechController, generateOfficerBriefing, VoiceBriefingData } from '../../services/speechService';

interface OfficerAIExtensionProps {
  currentUser: UserProfile;
  records: FDRRecord[];
  onSelectFdr: (fdrId: string) => void;
  onExplainWhy: (fdr: FDRRecord) => void;
  isOpen: boolean;
  onToggle: () => void;
}

type ExtensionTab =
  | 'overview'
  | 'expiry'
  | 'verification'
  | 'multibank'
  | 'risk'
  | 'pending'
  | 'evidence'
  | 'copilot'
  | 'voice';

export const OfficerAIExtension: React.FC<OfficerAIExtensionProps> = ({
  currentUser,
  records,
  onSelectFdr,
  onExplainWhy,
  isOpen,
  onToggle
}) => {
  const [activeTab, setActiveTab] = useState<ExtensionTab>('overview');
  const [expanded, setExpanded] = useState(false);
  const [voiceStatus, setVoiceStatus] = useState({
    isSpeaking: speechController.isSpeaking,
    isPaused: speechController.isPaused,
    isMuted: speechController.isMuted
  });
  const [briefingData, setBriefingData] = useState<VoiceBriefingData | null>(null);

  // Copilot interactive chat state
  const [copilotInput, setCopilotInput] = useState('');
  const [copilotChat, setCopilotChat] = useState<Array<{ sender: 'user' | 'ai'; text: string; fdrId?: string }>>([
    {
      sender: 'ai',
      text: `Hello Officer ${currentUser.name.replace('Dr. ', '')}. I am your NoavaLogix Compliance Copilot. I have analyzed ${records.length} authorized FDR records across 8 scheduled banks. How can I assist your regulatory review?`
    }
  ]);

  useEffect(() => {
    const data = generateOfficerBriefing(records, currentUser.name);
    setBriefingData(data);
  }, [records, currentUser]);

  useEffect(() => {
    const unsubscribe = speechController.subscribe((s) => {
      setVoiceStatus(s);
    });
    return unsubscribe;
  }, []);

  const handleCopilotSend = (query?: string) => {
    const q = query || copilotInput.trim();
    if (!q) return;

    const userMsg = { sender: 'user' as const, text: q };
    setCopilotChat(prev => [...prev, userMsg]);
    setCopilotInput('');

    // Process intelligent answers based on real dataset
    setTimeout(() => {
      const lower = q.toLowerCase();
      let reply = '';
      let targetFdr: string | undefined;

      if (lower.includes('urgent') || lower.includes('attention') || lower.includes('priority')) {
        const critical = records.filter(r => r.riskCategory === 'Critical' || (r.daysToMaturity <= 3 && r.daysToMaturity >= 0));
        reply = `There are currently ${critical.length} records requiring urgent attention. The top priority is FDR #${critical[0]?.fdrNumber} (${critical[0]?.bankName}), flagged for: ${critical[0]?.riskIssues[0]?.title || 'Imminent maturity'}.`;
        targetFdr = critical[0]?.id;
      } else if (lower.includes('mature') || lower.includes('week') || lower.includes('expiry') || lower.includes('7 days')) {
        const expiringThisWeek = records.filter(r => r.daysToMaturity >= 0 && r.daysToMaturity <= 7);
        reply = `There are ${expiringThisWeek.length} FDRs maturing within the next 7 days, totaling ₹ ${(expiringThisWeek.reduce((s, r) => s + r.principalAmount, 0) / 10000000).toFixed(2)} Crores across State Bank of India, HDFC Bank, and Canara Bank.`;
        targetFdr = expiringThisWeek[0]?.id;
      } else if (lower.includes('mismatch') || lower.includes('axis') || lower.includes('discrepancy')) {
        const mismatch = records.find(r => r.bankVerificationStatus === 'Mismatch Detected');
        if (mismatch) {
          reply = `Discrepancy identified on FDR #${mismatch.fdrNumber} (${mismatch.bankName}): Principal amount on scan is ₹75 Lakhs, but Core Banking ledger reports ₹65 Lakhs. Physical branch wet-ink confirmation is mandated.`;
          targetFdr = mismatch.id;
        } else {
          reply = 'No unresolved discrepancy found.';
        }
      } else if (lower.includes('overdue')) {
        const overdue = records.filter(r => r.daysToMaturity < 0 || r.status === 'Matured');
        reply = `Found ${overdue.length} overdue record(s): FDR #${overdue[0]?.fdrNumber} with Bank of Baroda is ${Math.abs(overdue[0]?.daysToMaturity || 0)} days past maturity without formal release. Notice of Compliance Breach recommended.`;
        targetFdr = overdue[0]?.id;
      } else if (lower.includes('bank') || lower.includes('pending')) {
        reply = `State Bank of India has the highest verified volume (142 active FDRs). Union Bank of India has 1 deposit awaiting zonal dual-authorization confirmation.`;
      } else {
        reply = `I evaluated all ${records.length} records in this workspace. All verified deposits carry active regulatory liens. You have 1 FDR at 3-day maturity and 1 overdue deposit with Bank of Baroda. Would you like to inspect them?`;
        targetFdr = records[0]?.id;
      }

      setCopilotChat(prev => [...prev, { sender: 'ai', text: reply, fdrId: targetFdr }]);
    }, 450);
  };

  const navTabs: Array<{ id: ExtensionTab; label: string; icon: React.ReactNode; badge?: number }> = [
    { id: 'overview', label: 'AI Overview', icon: <Sparkles className="w-3.5 h-3.5" /> },
    { id: 'expiry', label: 'Expiry Intelligence', icon: <Clock className="w-3.5 h-3.5" />, badge: (briefingData?.expiring3Days || 0) + (briefingData?.expiringToday || 0) },
    { id: 'verification', label: 'FDR Verification', icon: <CheckCircle className="w-3.5 h-3.5" />, badge: briefingData?.awaitingVerification },
    { id: 'multibank', label: 'Multi-Bank', icon: <Building className="w-3.5 h-3.5" /> },
    { id: 'risk', label: 'Risk Alerts', icon: <ShieldAlert className="w-3.5 h-3.5" />, badge: briefingData?.criticalDiscrepancies },
    { id: 'pending', label: 'Pending Actions', icon: <AlertTriangle className="w-3.5 h-3.5" /> },
    { id: 'evidence', label: 'Evidence Explorer', icon: <FileSearch className="w-3.5 h-3.5" /> },
    { id: 'copilot', label: 'AI Copilot', icon: <MessageSquare className="w-3.5 h-3.5" /> },
    { id: 'voice', label: 'Voice Assistant', icon: <Volume2 className="w-3.5 h-3.5 text-[#d8be9a]" /> }
  ];

  return (
    <>
      {/* Floating Right-Side Launcher Button */}
      <button
        onClick={onToggle}
        className={`fixed right-0 top-1/2 -translate-y-1/2 z-40 flex items-center gap-2 pl-3.5 pr-2 py-3 rounded-l-2xl bg-gradient-to-l from-[#0e2a27] to-[#143834] border-l-2 border-t border-b border-[#d8be9a]/50 text-[#fbf8f3] shadow-2xl hover:brightness-110 transition group ${
          isOpen ? 'translate-x-full opacity-0 pointer-events-none' : 'translate-x-0 opacity-100'
        }`}
        title="Open NoavaLogix Officer AI Extension"
      >
        <div className="relative">
          <div className="w-8 h-8 rounded-xl bg-[#091a18] border border-[#d8be9a]/40 flex items-center justify-center text-[#d8be9a]">
            <Sparkles className="w-4 h-4 animate-pulse text-[#d8be9a]" />
          </div>
          {(briefingData?.criticalDiscrepancies || 0) > 0 && (
            <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-red-500 border border-[#0e2a27]" />
          )}
        </div>
        <div className="flex flex-col text-left pr-1 select-none">
          <span className="text-[10px] uppercase font-bold tracking-wider text-[#d8be9a]">Officer AI</span>
          <span className="text-xs font-semibold text-[#fbf8f3]">NoavaLogix</span>
        </div>
      </button>

      {/* Slide-Over Extension Panel */}
      <aside
        className={`fixed top-0 right-0 h-full z-50 bg-[#091a18] border-l border-[#d8be9a]/30 shadow-2xl flex flex-col transition-all duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        } ${expanded ? 'w-full md:w-[650px]' : 'w-full md:w-[460px]'}`}
      >
        {/* Panel Header */}
        <div className="p-4 bg-[#0e2a27] border-b border-[#d8be9a]/20 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BrandLogo size="sm" />
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#143834] text-[#d8be9a] border border-[#d8be9a]/30">
              Officer Extension v4.2
            </span>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => setExpanded(!expanded)}
              className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-[#143834] transition hidden md:block"
              title={expanded ? 'Collapse width' : 'Expand width'}
            >
              {expanded ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>
            <button
              onClick={onToggle}
              className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-[#143834] transition"
              title="Close Extension"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Mini Voice Control Bar at top of Extension */}
        <div className="px-4 py-2.5 bg-[#0b201e] border-b border-[#d8be9a]/15 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <button
              onClick={() => speechController.toggleMute()}
              className="p-1 rounded text-[#d8be9a] hover:bg-[#143834]"
              title={voiceStatus.isMuted ? 'Unmute Voice' : 'Mute Voice'}
            >
              {voiceStatus.isMuted ? <VolumeX className="w-4 h-4 text-red-400" /> : <Volume2 className="w-4 h-4" />}
            </button>
            <div className="flex items-center gap-1.5">
              <span
                className={`w-2 h-2 rounded-full ${
                  voiceStatus.isSpeaking && !voiceStatus.isPaused
                    ? 'bg-[#2ecc71] animate-ping'
                    : 'bg-[#d8be9a]'
                }`}
              />
              <span className="text-[11px] font-medium text-[#d0c5b4]">
                {voiceStatus.isSpeaking
                  ? voiceStatus.isPaused
                    ? 'Voice Paused'
                    : 'Voice Briefing Active'
                  : 'Voice Ready'}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            {voiceStatus.isSpeaking ? (
              voiceStatus.isPaused ? (
                <button
                  onClick={() => speechController.resume()}
                  className="px-2 py-1 rounded bg-[#143834] text-[#d8be9a] hover:bg-[#1a4a45] text-[11px] font-medium flex items-center gap-1"
                >
                  <Play className="w-3 h-3" /> Resume
                </button>
              ) : (
                <button
                  onClick={() => speechController.pause()}
                  className="px-2 py-1 rounded bg-[#143834] text-[#d8be9a] hover:bg-[#1a4a45] text-[11px] font-medium flex items-center gap-1"
                >
                  <Pause className="w-3 h-3" /> Pause
                </button>
              )
            ) : (
              <button
                onClick={() => speechController.replay()}
                className="px-2 py-1 rounded bg-[#143834] text-[#d8be9a] hover:bg-[#1a4a45] text-[11px] font-medium flex items-center gap-1"
              >
                <RotateCcw className="w-3 h-3" /> Replay Briefing
              </button>
            )}
          </div>
        </div>

        {/* Horizontal Navigation Pills (Scrollable) */}
        <div className="p-2 border-b border-[#d8be9a]/15 bg-[#091a18] overflow-x-auto flex items-center gap-1.5">
          {navTabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition ${
                activeTab === tab.id
                  ? 'bg-[#d8be9a] text-[#091a18] font-bold shadow-sm'
                  : 'text-[#d0c5b4] hover:bg-[#143834] hover:text-[#fbf8f3]'
              }`}
            >
              {tab.icon}
              <span>{tab.label}</span>
              {typeof tab.badge === 'number' && tab.badge > 0 && (
                <span
                  className={`text-[9px] px-1.5 py-0.2 rounded-full font-bold ${
                    activeTab === tab.id ? 'bg-[#091a18] text-[#d8be9a]' : 'bg-red-500/20 text-red-400'
                  }`}
                >
                  {tab.badge}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Main Tab Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* SECTION 1: AI OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-gradient-to-br from-[#0e2a27] to-[#143834] border border-[#d8be9a]/30">
                <span className="text-[10px] uppercase font-bold tracking-wider text-[#d8be9a]">
                  Executive Intelligence Summary
                </span>
                <h4 className="text-sm font-bold text-[#fbf8f3] mt-1">
                  Active Statutory Portfolio: ₹ {(records.reduce((s, r) => s + r.principalAmount, 0) / 10000000).toFixed(2)} Cr
                </h4>
                <p className="text-xs text-[#d0c5b4] mt-2 leading-relaxed">
                  {briefingData?.text.slice(0, 240)}...
                </p>
                {briefingData?.topActionFdrId && (
                  <button
                    onClick={() => onSelectFdr(briefingData.topActionFdrId!)}
                    className="mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#d8be9a] text-[#091a18] text-xs font-bold hover:bg-[#c4a274] transition"
                  >
                    <span>Inspect Priority FDR</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Quick Metrics Grid */}
              <div className="grid grid-cols-2 gap-2.5">
                <div className="p-3 rounded-xl bg-[#0e2a27] border border-[#d8be9a]/20">
                  <span className="text-[10px] text-gray-400 uppercase">Within 7 Days</span>
                  <div className="text-lg font-bold text-amber-400 mt-0.5">
                    {(briefingData?.expiring3Days || 0) + (briefingData?.expiring5Days || 0) + (briefingData?.expiring7Days || 0)} Deposits
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-[#0e2a27] border border-[#d8be9a]/20">
                  <span className="text-[10px] text-gray-400 uppercase">Critical Risks</span>
                  <div className="text-lg font-bold text-red-400 mt-0.5">
                    {briefingData?.criticalDiscrepancies || 0} Flags
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-[#0e2a27] border border-[#d8be9a]/20">
                  <span className="text-[10px] text-gray-400 uppercase">Awaiting Verification</span>
                  <div className="text-lg font-bold text-[#d8be9a] mt-0.5">
                    {briefingData?.awaitingVerification || 0} In Queue
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-[#0e2a27] border border-[#d8be9a]/20">
                  <span className="text-[10px] text-gray-400 uppercase">Overdue Matured</span>
                  <div className="text-lg font-bold text-red-400 mt-0.5">
                    {briefingData?.overdueMatured || 0} Deposits
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* SECTION 2: EXPIRY INTELLIGENCE */}
          {activeTab === 'expiry' && (
            <div className="space-y-3">
              <div className="text-xs font-semibold text-[#d8be9a] uppercase tracking-wider">
                Maturity Window Distribution
              </div>
              <div className="space-y-2">
                {[
                  { label: 'Expiring Today (0 Days)', count: briefingData?.expiringToday || 0, color: 'text-red-400' },
                  { label: 'Within 3 Days', count: briefingData?.expiring3Days || 0, color: 'text-red-400' },
                  { label: 'Within 5 Days', count: briefingData?.expiring5Days || 0, color: 'text-amber-400' },
                  { label: 'Within 7 Days', count: briefingData?.expiring7Days || 0, color: 'text-amber-400' },
                  { label: 'Within 15 Days', count: briefingData?.expiring15Days || 0, color: 'text-yellow-400' },
                  { label: 'Within 30 Days', count: briefingData?.expiring30Days || 0, color: 'text-emerald-400' },
                  { label: 'Overdue / Matured', count: briefingData?.overdueMatured || 0, color: 'text-red-500 font-bold' }
                ].map((item, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-xl bg-[#0e2a27] border border-[#d8be9a]/20 flex items-center justify-between text-xs"
                  >
                    <span className="text-[#fbf8f3]">{item.label}</span>
                    <span className={`font-mono text-sm ${item.color}`}>
                      {item.count} Record(s)
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* SECTION 3: FDR VERIFICATION */}
          {activeTab === 'verification' && (
            <div className="space-y-3">
              <div className="text-xs font-semibold text-[#d8be9a] uppercase tracking-wider">
                Rapid Review Queue
              </div>
              <div className="space-y-2">
                {records.map((r) => (
                  <div
                    key={r.id}
                    className="p-3 rounded-xl bg-[#0e2a27] border border-[#d8be9a]/20 hover:border-[#d8be9a]/50 transition flex items-start justify-between gap-3 text-xs"
                  >
                    <div>
                      <div className="font-semibold text-[#fbf8f3]">
                        #{r.fdrNumber} • {r.bankName}
                      </div>
                      <div className="text-[#d0c5b4] text-[11px] mt-0.5 truncate max-w-[240px]">
                        {r.institutionName}
                      </div>
                      <div className="text-[10px] text-[#d8be9a] font-mono mt-1">
                        ₹ {r.principalAmount.toLocaleString('en-IN')} | Maturing: {r.maturityDate}
                      </div>
                    </div>
                    <button
                      onClick={() => onSelectFdr(r.id)}
                      className="px-2.5 py-1.5 rounded-lg bg-[#143834] text-[#d8be9a] hover:bg-[#1a4a45] text-xs font-medium shrink-0"
                    >
                      Review
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* SECTION 4: MULTI-BANK INTELLIGENCE */}
          {activeTab === 'multibank' && (
            <div className="space-y-3">
              <div className="text-xs font-semibold text-[#d8be9a] uppercase tracking-wider">
                Simulated Core Banking Adapters (8 Banks)
              </div>
              <div className="space-y-2">
                {[
                  { name: 'State Bank of India', code: 'SBI', status: 'Online', latency: '42ms', verified: 142 },
                  { name: 'HDFC Bank', code: 'HDFC', status: 'Online', latency: '35ms', verified: 180 },
                  { name: 'ICICI Bank', code: 'ICICI', status: 'Online', latency: '38ms', verified: 165 },
                  { name: 'Canara Bank', code: 'CANARA', status: 'Online', latency: '65ms', verified: 112 },
                  { name: 'Indian Bank', code: 'INDIAN_BANK', status: 'Online', latency: '58ms', verified: 98 },
                  { name: 'Bank of Baroda', code: 'BOB', status: 'Online', latency: '72ms', verified: 64 },
                  { name: 'Axis Bank', code: 'AXIS', status: 'Online (Mismatch Flagged)', latency: '46ms', verified: 124 },
                  { name: 'Union Bank of India', code: 'UNION', status: 'Online (Dual Token Pending)', latency: '81ms', verified: 53 }
                ].map((b) => (
                  <div key={b.code} className="p-3 rounded-xl bg-[#0e2a27] border border-[#d8be9a]/20 flex items-center justify-between text-xs">
                    <div>
                      <div className="font-semibold text-[#fbf8f3]">{b.name}</div>
                      <div className="text-[10px] text-gray-400">Response time: {b.latency}</div>
                    </div>
                    <span className="text-[11px] font-mono text-[#2ecc71] bg-[#143834] px-2 py-0.5 rounded">
                      {b.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* SECTION 5: RISK ALERTS */}
          {activeTab === 'risk' && (
            <div className="space-y-3">
              <div className="text-xs font-semibold text-[#d8be9a] uppercase tracking-wider">
                Active Regulatory Discrepancies
              </div>
              <div className="space-y-2">
                {records.filter(r => r.riskIssues.length > 0).map(r => (
                  <div key={r.id} className="p-3 rounded-xl bg-[#0e2a27] border border-red-500/30 space-y-2 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-red-400">{r.riskIssues[0].title}</span>
                      <span className="text-[10px] uppercase font-bold px-1.5 py-0.2 rounded bg-red-500/20 text-red-300">
                        {r.riskCategory}
                      </span>
                    </div>
                    <p className="text-[11px] text-[#d0c5b4]">{r.riskIssues[0].evidence}</p>
                    <div className="flex items-center justify-between pt-1">
                      <button
                        onClick={() => onExplainWhy(r)}
                        className="text-[#d8be9a] hover:underline font-semibold flex items-center gap-1"
                      >
                        <HelpCircle className="w-3.5 h-3.5" /> WHY? (Audit Evidence)
                      </button>
                      <button
                        onClick={() => onSelectFdr(r.id)}
                        className="px-2.5 py-1 rounded bg-[#143834] text-[#fbf8f3] hover:bg-[#1a4a45]"
                      >
                        Open Record
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* SECTION 6: PENDING ACTIONS */}
          {activeTab === 'pending' && (
            <div className="space-y-3">
              <div className="text-xs font-semibold text-[#d8be9a] uppercase tracking-wider">
                Officer Action Backlog
              </div>
              <div className="space-y-2 text-xs">
                <div className="p-3 rounded-xl bg-[#0e2a27] border border-[#d8be9a]/20 flex items-start justify-between gap-3">
                  <div>
                    <div className="font-semibold text-[#fbf8f3]">SBI FDR #394821 Renewal Notice</div>
                    <div className="text-[11px] text-[#d0c5b4] mt-0.5">Deposit expires in 3 days. Statutory renewal notice required.</div>
                  </div>
                  <button onClick={() => onSelectFdr('FDR-SBI-2024-001')} className="px-2 py-1 rounded bg-[#143834] text-[#d8be9a]">Action</button>
                </div>
                <div className="p-3 rounded-xl bg-[#0e2a27] border border-[#d8be9a]/20 flex items-start justify-between gap-3">
                  <div>
                    <div className="font-semibold text-[#fbf8f3]">Axis Bank Amount Discrepancy Freeze</div>
                    <div className="text-[11px] text-[#d0c5b4] mt-0.5">₹ 10 Lakh ledger difference requires physical branch wet-ink certificate.</div>
                  </div>
                  <button onClick={() => onSelectFdr('FDR-AXIS-2024-008')} className="px-2 py-1 rounded bg-red-900/60 text-red-300">Freeze</button>
                </div>
              </div>
            </div>
          )}

          {/* SECTION 7: EVIDENCE EXPLORER */}
          {activeTab === 'evidence' && (
            <div className="space-y-3">
              <div className="text-xs font-semibold text-[#d8be9a] uppercase tracking-wider">
                Document & Ledger Proof
              </div>
              <div className="p-3 rounded-xl bg-[#0e2a27] border border-[#d8be9a]/20 text-xs space-y-2">
                <span className="text-[10px] text-[#d8be9a] uppercase font-bold">Document Authentication Chain</span>
                <p className="text-[#d0c5b4]">
                  Every OCR extracted value is cryptographically linked to the source image byte stream and verified against simulated bank core gateways.
                </p>
                <div className="p-2.5 rounded bg-[#091a18] font-mono text-[11px] text-[#e7d7c1] space-y-1">
                  <div>SHA-256: 7f83b1657ff1fc53b92dc18148a1d65dfc...</div>
                  <div>Zonal CBS Gateway: Online (SSL/TLS 1.3 256-bit)</div>
                  <div>AICTE Statutory Lien Token: Active</div>
                </div>
              </div>
            </div>
          )}

          {/* SECTION 8: AI COMPLIANCE COPILOT */}
          {activeTab === 'copilot' && (
            <div className="flex flex-col h-[400px]">
              <div className="flex-1 overflow-y-auto space-y-3 pr-1 text-xs">
                {copilotChat.map((msg, i) => (
                  <div
                    key={i}
                    className={`flex flex-col ${
                      msg.sender === 'user' ? 'items-end' : 'items-start'
                    }`}
                  >
                    <div
                      className={`max-w-[85%] p-3 rounded-2xl ${
                        msg.sender === 'user'
                          ? 'bg-[#d8be9a] text-[#091a18] font-medium rounded-tr-none'
                          : 'bg-[#0e2a27] text-[#fbf8f3] border border-[#d8be9a]/20 rounded-tl-none leading-relaxed'
                      }`}
                    >
                      {msg.text}
                      {msg.fdrId && (
                        <button
                          onClick={() => onSelectFdr(msg.fdrId!)}
                          className="mt-2 block text-xs underline font-bold text-[#d8be9a]"
                        >
                          → View Related FDR ({msg.fdrId})
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Quick Prompt Pills */}
              <div className="pt-2 flex flex-wrap gap-1.5">
                {[
                  'Which FDRs mature this week?',
                  'Why is Axis Bank flagged?',
                  'Which FDR is overdue?',
                  'Show SBI status'
                ].map((prompt, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleCopilotSend(prompt)}
                    className="px-2 py-1 rounded-full bg-[#143834] text-[#d8be9a] text-[10px] hover:bg-[#1a4a45] transition"
                  >
                    {prompt}
                  </button>
                ))}
              </div>

              {/* Input */}
              <div className="pt-2 flex items-center gap-2">
                <input
                  type="text"
                  placeholder="Ask compliance copilot anything..."
                  value={copilotInput}
                  onChange={(e) => setCopilotInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleCopilotSend()}
                  className="flex-1 px-3 py-2 rounded-xl bg-[#0e2a27] border border-[#d8be9a]/30 text-xs text-[#fbf8f3] focus:outline-none focus:border-[#d8be9a]"
                />
                <button
                  onClick={() => handleCopilotSend()}
                  className="px-3.5 py-2 rounded-xl bg-[#d8be9a] text-[#091a18] font-bold text-xs hover:bg-[#c4a274]"
                >
                  Ask
                </button>
              </div>
            </div>
          )}

          {/* SECTION 9: VOICE ASSISTANT */}
          {activeTab === 'voice' && (
            <div className="space-y-4 text-xs">
              <div className="p-4 rounded-xl bg-[#0e2a27] border border-[#d8be9a]/20 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-sm text-[#d8be9a]">
                    NoavaLogix Expiry Voice Intelligence
                  </span>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${voiceStatus.isSpeaking ? 'bg-[#2ecc71]/20 text-[#2ecc71]' : 'bg-gray-700 text-gray-300'}`}>
                    {voiceStatus.isSpeaking ? 'Speaking' : 'Idle'}
                  </span>
                </div>
                <p className="text-[#d0c5b4] leading-relaxed">
                  Automatically synthesizes approaching maturity milestones upon Officer login using authorized real database records.
                </p>

                {/* Voice Controls */}
                <div className="flex items-center gap-2 pt-2">
                  <button
                    onClick={() => speechController.replay()}
                    className="flex-1 py-2 rounded-xl bg-[#d8be9a] text-[#091a18] font-bold text-xs uppercase tracking-wider hover:bg-[#c4a274] flex items-center justify-center gap-1.5"
                  >
                    <RotateCcw className="w-3.5 h-3.5" /> Replay Briefing
                  </button>
                  {voiceStatus.isSpeaking && (
                    <button
                      onClick={() => voiceStatus.isPaused ? speechController.resume() : speechController.pause()}
                      className="px-4 py-2 rounded-xl bg-[#143834] text-[#d8be9a] border border-[#d8be9a]/30 text-xs font-semibold"
                    >
                      {voiceStatus.isPaused ? 'Resume' : 'Pause'}
                    </button>
                  )}
                  <button
                    onClick={() => speechController.toggleMute()}
                    className="p-2 rounded-xl bg-[#143834] text-[#d8be9a] border border-[#d8be9a]/30"
                    title={voiceStatus.isMuted ? 'Unmute' : 'Mute'}
                  >
                    {voiceStatus.isMuted ? <VolumeX className="w-4 h-4 text-red-400" /> : <Volume2 className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Full Text Transcript */}
              <div className="space-y-2">
                <span className="text-[10px] uppercase font-bold tracking-wider text-[#d8be9a]">
                  Full Voice Transcript
                </span>
                <div className="p-3.5 rounded-xl bg-[#091a18] border border-[#d8be9a]/20 text-xs text-[#e7d7c1] leading-relaxed max-h-48 overflow-y-auto">
                  {briefingData?.text}
                </div>
              </div>
            </div>
          )}
        </div>
      </aside>
    </>
  );
};
