import React from 'react';
import { Bell, Sparkles, LogOut, User, Shield, ChevronDown, RefreshCw } from 'lucide-react';
import { BrandLogo } from '../common/BrandLogo';
import { PWAInstallButton } from '../common/PWAInstallButton';
import { UserProfile, UserRole } from '../../types';

interface NavbarProps {
  currentUser: UserProfile;
  onChangeRole: (role: UserRole) => void;
  onLogout: () => void;
  onOpenPushModal: () => void;
  onOpenExtension?: () => void;
  unreadAlertsCount?: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentUser,
  onChangeRole,
  onLogout,
  onOpenPushModal,
  onOpenExtension,
  unreadAlertsCount = 2
}) => {
  return (
    <header className="sticky top-0 z-30 h-16 bg-[#091a18]/95 backdrop-blur-md border-b border-[#d8be9a]/25 px-4 lg:px-6 flex items-center justify-between">
      {/* Brand Logo strictly horizontal */}
      <div className="flex items-center gap-4">
        <BrandLogo size="md" showTagline={false} />
      </div>

      {/* Center / Right Actions */}
      <div className="flex items-center gap-2.5 sm:gap-3.5">
        {/* Role Quick Switcher (For demo convenience) */}
        <div className="hidden sm:flex items-center rounded-xl bg-[#0e2a27] p-1 border border-[#d8be9a]/25 text-xs">
          {(['Officer', 'Institution', 'Administrator'] as UserRole[]).map((r) => (
            <button
              key={r}
              onClick={() => onChangeRole(r)}
              className={`px-3 py-1 rounded-lg font-medium transition ${
                currentUser.role === r
                  ? 'bg-[#d8be9a] text-[#091a18] font-bold shadow-sm'
                  : 'text-[#d0c5b4] hover:text-[#fbf8f3] hover:bg-[#143834]'
              }`}
            >
              {r}
            </button>
          ))}
        </div>

        {/* PWA Install Button */}
        <PWAInstallButton compact />

        {/* Push Notification Center Trigger */}
        <button
          onClick={onOpenPushModal}
          className="relative p-2 rounded-xl bg-[#0e2a27] text-[#d8be9a] hover:bg-[#143834] border border-[#d8be9a]/25 transition"
          title="Mobile Push Notifications & Diagnostic Hub"
        >
          <Bell className="w-4 h-4" />
          {unreadAlertsCount > 0 && (
            <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-red-500 text-white font-bold text-[9px] flex items-center justify-center border-2 border-[#091a18]">
              {unreadAlertsCount}
            </span>
          )}
        </button>

        {/* Officer AI Extension Trigger Button (Officer Only) */}
        {currentUser.role === 'Officer' && onOpenExtension && (
          <button
            onClick={onOpenExtension}
            className="hidden md:inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-gradient-to-r from-[#143834] to-[#0e2a27] border border-[#d8be9a]/40 text-[#d8be9a] hover:brightness-110 text-xs font-semibold shadow-sm"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#d8be9a]" />
            <span>AI Extension</span>
          </button>
        )}

        {/* User Profile & Logout */}
        <div className="flex items-center gap-2.5 pl-2 border-l border-[#d8be9a]/20">
          <img
            src={currentUser.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&q=80'}
            alt={currentUser.name}
            className="w-8 h-8 rounded-full border border-[#d8be9a]/40 object-cover"
          />
          <div className="hidden xl:flex flex-col text-left">
            <span className="text-xs font-semibold text-[#fbf8f3] truncate max-w-[140px]">
              {currentUser.name}
            </span>
            <span className="text-[10px] text-[#d8be9a] capitalize">
              {currentUser.role}
            </span>
          </div>

          <button
            onClick={onLogout}
            className="p-1.5 rounded-lg text-gray-400 hover:text-red-400 hover:bg-[#143834] transition"
            title="Sign out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
