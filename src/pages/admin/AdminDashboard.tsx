import React, { useState } from 'react';
import {
  Users,
  Building,
  ShieldCheck,
  Sliders,
  Settings,
  Activity,
  CheckCircle,
  AlertTriangle,
  Server,
  Bell,
  RefreshCw,
  Lock,
  Plus
} from 'lucide-react';
import { FDRRecord, UserProfile } from '../../types';
import { INITIAL_USERS } from '../../data/sampleFDRs';

interface AdminDashboardProps {
  currentUser: UserProfile;
  records: FDRRecord[];
  onOpenPushModal: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  currentUser,
  records,
  onOpenPushModal
}) => {
  const [activeAdminTab, setActiveAdminTab] = useState<'overview' | 'users' | 'rules' | 'health'>('overview');
  const [riskThreshold, setRiskThreshold] = useState(70);
  const [autoVerifyThreshold, setAutoVerifyThreshold] = useState(98);
  const [dualAuthRequiredAmount, setDualAuthRequiredAmount] = useState(2500000);
  const [savedSettingsNotice, setSavedSettingsNotice] = useState(false);

  const totalFDRs = records.length;
  const totalCorpus = records.reduce((s, r) => s + r.principalAmount, 0);

  const handleSaveRules = () => {
    setSavedSettingsNotice(true);
    setTimeout(() => setSavedSettingsNotice(false), 3000);
  };

  return (
    <div className="space-y-6">
      {/* Admin Header */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-[#0e2a27] via-[#143834] to-[#0e2a27] border border-[#d8be9a]/30 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#d8be9a] block">
            Regulatory Authority Command Center
          </span>
          <h1 className="text-xl sm:text-2xl font-bold text-[#fbf8f3] mt-1">
            System Administration & Governance
          </h1>
          <p className="text-xs text-[#d0c5b4] mt-0.5">
            AICTE & State Regulatory Coordination • 5 Registered Institutions • 8 Active Core Banking Connectors
          </p>
        </div>

        <button
          onClick={onOpenPushModal}
          className="px-4 py-2.5 rounded-xl bg-[#143834] text-[#d8be9a] border border-[#d8be9a]/30 text-xs font-semibold hover:bg-[#1b4b45] transition flex items-center gap-2"
        >
          <Bell className="w-4 h-4" />
          <span>Mobile Push & Email Hub</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-[#d8be9a]/20 bg-[#0e2a27] rounded-xl px-4 text-xs font-semibold">
        <button
          onClick={() => setActiveAdminTab('overview')}
          className={`py-3 px-4 border-b-2 transition ${
            activeAdminTab === 'overview' ? 'border-[#d8be9a] text-[#d8be9a]' : 'border-transparent text-[#d0c5b4]'
          }`}
        >
          Platform Analytics
        </button>
        <button
          onClick={() => setActiveAdminTab('users')}
          className={`py-3 px-4 border-b-2 transition ${
            activeAdminTab === 'users' ? 'border-[#d8be9a] text-[#d8be9a]' : 'border-transparent text-[#d0c5b4]'
          }`}
        >
          User & Role Management
        </button>
        <button
          onClick={() => setActiveAdminTab('rules')}
          className={`py-3 px-4 border-b-2 transition ${
            activeAdminTab === 'rules' ? 'border-[#d8be9a] text-[#d8be9a]' : 'border-transparent text-[#d0c5b4]'
          }`}
        >
          Risk Thresholds & Rules
        </button>
        <button
          onClick={() => setActiveAdminTab('health')}
          className={`py-3 px-4 border-b-2 transition ${
            activeAdminTab === 'health' ? 'border-[#d8be9a] text-[#d8be9a]' : 'border-transparent text-[#d0c5b4]'
          }`}
        >
          Backend Service Health
        </button>
      </div>

      {/* TAB 1: OVERVIEW */}
      {activeAdminTab === 'overview' && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
            <div className="p-4 rounded-xl bg-[#0e2a27] border border-[#d8be9a]/20">
              <span className="text-xs text-[#d0c5b4]">Total Institutions</span>
              <div className="text-2xl font-bold text-[#fbf8f3] mt-1">5</div>
              <span className="text-[10px] text-[#2ecc71] mt-1 block">All in good standing</span>
            </div>

            <div className="p-4 rounded-xl bg-[#0e2a27] border border-[#d8be9a]/20">
              <span className="text-xs text-[#d0c5b4]">Total Compliance Officers</span>
              <div className="text-2xl font-bold text-[#d8be9a] mt-1">3</div>
              <span className="text-[10px] text-gray-400 mt-1 block">Active on duty</span>
            </div>

            <div className="p-4 rounded-xl bg-[#0e2a27] border border-[#d8be9a]/20">
              <span className="text-xs text-[#d0c5b4]">Total FDR Portfolio</span>
              <div className="text-2xl font-bold text-[#fbf8f3] mt-1">₹ {(totalCorpus / 10000000).toFixed(2)} Cr</div>
              <span className="text-[10px] text-gray-400 mt-1 block">{totalFDRs} verified deposits</span>
            </div>

            <div className="p-4 rounded-xl bg-[#0e2a27] border border-[#d8be9a]/20">
              <span className="text-xs text-[#d0c5b4]">Bank Adapter Uptime</span>
              <div className="text-2xl font-bold text-[#2ecc71] mt-1">99.98%</div>
              <span className="text-[10px] text-emerald-400/80 mt-1 block">8 / 8 Adapters Online</span>
            </div>
          </div>

          {/* Institutional Compliance Health Matrix */}
          <div className="p-5 rounded-2xl bg-[#0e2a27] border border-[#d8be9a]/25 space-y-4">
            <h2 className="text-base font-bold text-[#fbf8f3]">
              Institutional FDR Compliance Ledger
            </h2>
            <div className="overflow-x-auto rounded-xl border border-[#d8be9a]/20 bg-[#091a18]">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#0b201e] border-b border-[#d8be9a]/20 text-[#d8be9a] uppercase text-[10px] tracking-wider">
                  <tr>
                    <th className="p-3.5">Institution</th>
                    <th className="p-3.5">Code</th>
                    <th className="p-3.5">Assigned Officer</th>
                    <th className="p-3.5">Deposits</th>
                    <th className="p-3.5">Corpus Volume</th>
                    <th className="p-3.5">Risk Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#d8be9a]/10">
                  <tr className="hover:bg-[#143834]/30">
                    <td className="p-3.5 font-semibold text-[#fbf8f3]">Apex Institute of Technology & Engineering</td>
                    <td className="p-3.5 font-mono text-[#d0c5b4]">INST-AICTE-TN-0492</td>
                    <td className="p-3.5 text-[#d8be9a]">Dr. Aravind Swaminathan</td>
                    <td className="p-3.5 font-mono">4 Deposits</td>
                    <td className="p-3.5 font-bold">₹ 2.55 Cr</td>
                    <td className="p-3.5"><span className="text-[10px] px-2 py-0.5 rounded bg-amber-500/15 text-amber-400">Review Required</span></td>
                  </tr>
                  <tr className="hover:bg-[#143834]/30">
                    <td className="p-3.5 font-semibold text-[#fbf8f3]">National Science & Research Institute</td>
                    <td className="p-3.5 font-mono text-[#d0c5b4]">INST-AICTE-KA-0128</td>
                    <td className="p-3.5 text-[#d8be9a]">Dr. Aravind Swaminathan</td>
                    <td className="p-3.5 font-mono">1 Deposit</td>
                    <td className="p-3.5 font-bold">₹ 35.00 Lakhs</td>
                    <td className="p-3.5"><span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-400">Compliant</span></td>
                  </tr>
                  <tr className="hover:bg-[#143834]/30">
                    <td className="p-3.5 font-semibold text-[#fbf8f3]">Southern Polytechnic University</td>
                    <td className="p-3.5 font-mono text-[#d0c5b4]">INST-AICTE-AP-0382</td>
                    <td className="p-3.5 text-[#d8be9a]">Dr. Aravind Swaminathan</td>
                    <td className="p-3.5 font-mono">1 Deposit</td>
                    <td className="p-3.5 font-bold">₹ 75.00 Lakhs</td>
                    <td className="p-3.5"><span className="text-[10px] px-2 py-0.5 rounded bg-red-500/15 text-red-400 font-bold">Critical Mismatch</span></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: USERS */}
      {activeAdminTab === 'users' && (
        <div className="p-5 rounded-2xl bg-[#0e2a27] border border-[#d8be9a]/25 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-[#fbf8f3]">Authorized Platform Users</h2>
            <button className="px-3 py-1.5 rounded-lg bg-[#d8be9a] text-[#091a18] font-bold text-xs flex items-center gap-1.5">
              <Plus className="w-3.5 h-3.5" /> Invite User
            </button>
          </div>

          <div className="space-y-2">
            {INITIAL_USERS.map((usr) => (
              <div key={usr.id} className="p-3.5 rounded-xl bg-[#091a18] border border-[#d8be9a]/20 flex items-center justify-between text-xs">
                <div className="flex items-center gap-3">
                  <img src={usr.avatar} alt={usr.name} className="w-9 h-9 rounded-full object-cover border border-[#d8be9a]/40" />
                  <div>
                    <div className="font-semibold text-sm text-[#fbf8f3]">{usr.name}</div>
                    <div className="text-[11px] text-[#d0c5b4]">{usr.email} • {usr.designation}</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded bg-[#143834] text-[#d8be9a] font-bold uppercase text-[10px]">
                    {usr.role}
                  </span>
                  <button className="px-2.5 py-1 rounded bg-[#0e2a27] text-gray-300 hover:text-white border border-[#d8be9a]/20">
                    Edit Permissions
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: RULES & THRESHOLDS */}
      {activeAdminTab === 'rules' && (
        <div className="p-6 rounded-2xl bg-[#0e2a27] border border-[#d8be9a]/25 space-y-6">
          <div>
            <h2 className="text-base font-bold text-[#fbf8f3]">Regulatory Risk Parameters & Thresholds</h2>
            <p className="text-xs text-[#d0c5b4] mt-0.5">
              Configure AI scoring cutoffs and mandatory dual-authorization requirements
            </p>
          </div>

          {savedSettingsNotice && (
            <div className="p-3 rounded-xl bg-emerald-950/60 border border-emerald-500/40 text-xs text-emerald-300 flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-400" />
              <span>Regulatory rule adjustments committed to database.</span>
            </div>
          )}

          <div className="space-y-5 max-w-xl text-xs">
            <div>
              <div className="flex justify-between font-semibold text-[#fbf8f3] mb-1">
                <span>Critical Risk Escalation Threshold</span>
                <span className="text-[#d8be9a] font-mono">{riskThreshold} / 100</span>
              </div>
              <input
                type="range"
                min="50"
                max="95"
                value={riskThreshold}
                onChange={(e) => setRiskThreshold(Number(e.target.value))}
                className="w-full accent-[#d8be9a]"
              />
              <span className="text-[11px] text-gray-400">
                Deposits with AI risk scores exceeding this threshold trigger mandatory freeze notices.
              </span>
            </div>

            <div>
              <div className="flex justify-between font-semibold text-[#fbf8f3] mb-1">
                <span>OCR High-Confidence Benchmark</span>
                <span className="text-[#d8be9a] font-mono">{autoVerifyThreshold}%</span>
              </div>
              <input
                type="range"
                min="80"
                max="99"
                value={autoVerifyThreshold}
                onChange={(e) => setAutoVerifyThreshold(Number(e.target.value))}
                className="w-full accent-[#d8be9a]"
              />
              <span className="text-[11px] text-gray-400">
                Extracted fields below this percentage are highlighted for human officer review.
              </span>
            </div>

            <div>
              <label className="block font-semibold text-[#fbf8f3] mb-1">
                RBI Dual-Authorization Limit (₹)
              </label>
              <input
                type="number"
                value={dualAuthRequiredAmount}
                onChange={(e) => setDualAuthRequiredAmount(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl bg-[#091a18] border border-[#d8be9a]/30 text-[#fbf8f3]"
              />
              <span className="text-[11px] text-gray-400 mt-1 block">
                Deposits equal or greater than this require physical branch token confirmation.
              </span>
            </div>

            <button
              onClick={handleSaveRules}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#d8be9a] to-[#c4a274] text-[#091a18] font-bold text-xs uppercase tracking-wider hover:brightness-105"
            >
              Save Configuration
            </button>
          </div>
        </div>
      )}

      {/* TAB 4: SERVICE HEALTH */}
      {activeAdminTab === 'health' && (
        <div className="p-6 rounded-2xl bg-[#0e2a27] border border-[#d8be9a]/25 space-y-4">
          <h2 className="text-base font-bold text-[#fbf8f3] flex items-center gap-2">
            <Server className="w-4 h-4 text-[#d8be9a]" />
            <span>Backend Services & Gateway Health</span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
            <div className="p-4 rounded-xl bg-[#091a18] border border-[#d8be9a]/20 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-[#fbf8f3]">Express Application Server</span>
                <span className="text-[10px] text-[#2ecc71] font-bold">200 OK</span>
              </div>
              <p className="text-[#d0c5b4]">Port 3000 • Process tsx server.ts • In-memory stores active</p>
            </div>

            <div className="p-4 rounded-xl bg-[#091a18] border border-[#d8be9a]/20 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-[#fbf8f3]">Web Push VAPID Service</span>
                <span className="text-[10px] text-[#2ecc71] font-bold">Configured</span>
              </div>
              <p className="text-[#d0c5b4]">VAPID public/private keypair loaded • Service worker /sw.js active</p>
            </div>

            <div className="p-4 rounded-xl bg-[#091a18] border border-[#d8be9a]/20 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-[#fbf8f3]">Multi-Bank Adapter Gateway</span>
                <span className="text-[10px] text-[#2ecc71] font-bold">8 / 8 Online</span>
              </div>
              <p className="text-[#d0c5b4]">SBI, Indian Bank, Canara, BOB, Union, HDFC, ICICI, Axis simulated endpoints operational</p>
            </div>

            <div className="p-4 rounded-xl bg-[#091a18] border border-[#d8be9a]/20 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-[#fbf8f3]">Automated Expiry Scheduler</span>
                <span className="text-[10px] text-[#2ecc71] font-bold">Listening</span>
              </div>
              <p className="text-[#d0c5b4]">Scanning 30d, 15d, 7d, 5d, 3d, 0d milestones • Push dispatch ready</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
