import React from 'react';
import {
  LayoutDashboard,
  ShieldCheck,
  Building,
  Clock,
  UploadCloud,
  FileCheck2,
  AlertTriangle,
  Users,
  Settings,
  Bell,
  Sliders,
  History,
  FileText
} from 'lucide-react';
import { UserRole } from '../../types';

interface SidebarProps {
  currentRole: UserRole;
  activeView: string;
  onNavigate: (viewId: string) => void;
  urgentExpiryCount?: number;
  pendingVerificationCount?: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentRole,
  activeView,
  onNavigate,
  urgentExpiryCount = 0,
  pendingVerificationCount = 0
}) => {
  const getNavItems = () => {
    if (currentRole === 'Officer') {
      return [
        { id: 'officer-workspace', label: 'Officer Workspace', icon: <LayoutDashboard className="w-4 h-4" /> },
        { id: 'expiry-intelligence', label: 'Expiry Intelligence', icon: <Clock className="w-4 h-4" />, badge: urgentExpiryCount },
        { id: 'multibank-hub', label: 'Multi-Bank Hub', icon: <Building className="w-4 h-4" /> },
        { id: 'ocr-upload', label: 'AI OCR Extractor', icon: <UploadCloud className="w-4 h-4" /> },
        { id: 'risk-discrepancies', label: 'Discrepancy Matrix', icon: <AlertTriangle className="w-4 h-4" /> },
        { id: 'audit-history', label: 'Regulatory Audit Log', icon: <History className="w-4 h-4" /> }
      ];
    }

    if (currentRole === 'Institution') {
      return [
        { id: 'institution-dashboard', label: 'Institution Dashboard', icon: <LayoutDashboard className="w-4 h-4" /> },
        { id: 'upload-fdr', label: 'Upload FDR Documents', icon: <UploadCloud className="w-4 h-4" /> },
        { id: 'my-fdrs', label: 'Submitted Deposits', icon: <FileCheck2 className="w-4 h-4" />, badge: pendingVerificationCount },
        { id: 'maturity-calendar', label: 'Maturity Calendar', icon: <Clock className="w-4 h-4" /> },
        { id: 'renewal-release', label: 'Renewal & Release Status', icon: <ShieldCheck className="w-4 h-4" /> }
      ];
    }

    // Administrator
    return [
      { id: 'admin-dashboard', label: 'System Overview', icon: <LayoutDashboard className="w-4 h-4" /> },
      { id: 'user-management', label: 'Users & Roles', icon: <Users className="w-4 h-4" /> },
      { id: 'institution-management', label: 'Institutions', icon: <Building className="w-4 h-4" /> },
      { id: 'officer-assignments', label: 'Officer Assignments', icon: <ShieldCheck className="w-4 h-4" /> },
      { id: 'system-rules', label: 'Verification Rules', icon: <Sliders className="w-4 h-4" /> },
      { id: 'service-health', label: 'Bank Adapters & Health', icon: <Settings className="w-4 h-4" /> }
    ];
  };

  const navItems = getNavItems();

  return (
    <aside className="w-64 bg-[#0e2a27]/90 border-r border-[#d8be9a]/20 flex flex-col shrink-0 min-h-[calc(100vh-4rem)]">
      {/* Role Banner */}
      <div className="p-4 border-b border-[#d8be9a]/15 bg-[#091a18]/60">
        <span className="text-[10px] font-bold uppercase tracking-wider text-[#d8be9a] block">
          Current Portal
        </span>
        <div className="text-sm font-semibold text-[#fbf8f3] mt-0.5">
          {currentRole} Console
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 p-3 space-y-1">
        {navItems.map((item) => {
          const isActive = activeView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-medium transition duration-150 ${
                isActive
                  ? 'bg-[#d8be9a] text-[#091a18] font-bold shadow-md shadow-black/20'
                  : 'text-[#d0c5b4] hover:bg-[#143834] hover:text-[#fbf8f3]'
              }`}
            >
              <div className="flex items-center gap-3">
                <span className={isActive ? 'text-[#091a18]' : 'text-[#d8be9a]'}>
                  {item.icon}
                </span>
                <span>{item.label}</span>
              </div>
              {typeof item.badge === 'number' && item.badge > 0 && (
                <span
                  className={`text-[10px] px-2 py-0.2 rounded-full font-bold ${
                    isActive ? 'bg-[#091a18] text-[#d8be9a]' : 'bg-amber-500/20 text-amber-400'
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Regulatory Compliance Badge in footer */}
      <div className="p-4 border-t border-[#d8be9a]/15 bg-[#091a18]/60 text-[10px] text-[#a39a8c] space-y-1">
        <div className="font-semibold text-[#d8be9a] flex items-center gap-1.5">
          <ShieldCheck className="w-3.5 h-3.5 text-[#2ecc71]" />
          <span>Statutory FDR Framework</span>
        </div>
        <p className="leading-tight">
          AICTE & UGC Endowment Security Directives. Encrypted CBS Telemetry.
        </p>
      </div>
    </aside>
  );
};
