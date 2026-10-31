import React, { useState } from 'react';
import { Shield, Lock, Mail, ArrowRight, CheckCircle2, UserCheck, Smartphone } from 'lucide-react';
import { BrandLogo } from '../../components/common/BrandLogo';
import { UserRole, UserProfile } from '../../types';
import { INITIAL_USERS } from '../../data/sampleFDRs';

interface LoginPageProps {
  onLogin: (user: UserProfile) => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onLogin }) => {
  const [selectedRole, setSelectedRole] = useState<UserRole>('Officer');
  const [email, setEmail] = useState('aravind.swaminathan@noavalogix.org');
  const [password, setPassword] = useState('••••••••••••');
  const [rememberMe, setRememberMe] = useState(true);

  const handleRoleSelect = (role: UserRole) => {
    setSelectedRole(role);
    const preset = INITIAL_USERS.find(u => u.role === role);
    if (preset) {
      setEmail(preset.email);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const user = INITIAL_USERS.find(u => u.role === selectedRole) || {
      id: 'usr-custom-' + Date.now(),
      name: email.split('@')[0],
      email: email,
      role: selectedRole,
      designation: `${selectedRole} Access Member`
    };
    onLogin(user);
  };

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center p-4 sm:p-6 overflow-hidden bg-[#091a18]">
      {/* 
        EXACT BACKGROUND PHOTOGRAPH REQUIRED BY USER:
        /assets/aistudio/sean-pollock-PhYq704ffdA-unsplash_0cc25703.jpg
      */}
      <div
        className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat scale-105 transform motion-safe:transition-transform motion-safe:duration-1000"
        style={{
          backgroundImage: `url('/assets/aistudio/sean-pollock-PhYq704ffdA-unsplash_0cc25703.jpg')`
        }}
      />

      {/* Elegant dark pine & champagne gold overlay from the brand palette */}
      <div className="absolute inset-0 z-0 bg-gradient-to-tr from-[#091a18]/94 via-[#0e2a27]/88 to-[#091a18]/92 backdrop-blur-[2px]" />

      {/* Ambient glowing radial light */}
      <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-[#d8be9a]/10 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 -right-32 w-96 h-96 rounded-full bg-[#1b4b45]/40 blur-3xl pointer-events-none" />

      {/* Main Authentication Card */}
      <div className="relative z-10 w-full max-w-lg rounded-3xl bg-[#0e2a27]/90 border border-[#d8be9a]/35 shadow-[0_25px_50px_-12px_rgba(0,0,0,0.85)] p-6 sm:p-8 backdrop-blur-xl text-[#fbf8f3]">
        {/* Horizontal Branding & Tagline */}
        <div className="text-center pb-6 border-b border-[#d8be9a]/20">
          <BrandLogo size="lg" showTagline={false} className="justify-center" />
          <p className="text-xs text-[#d8be9a] font-medium tracking-wide mt-2">
            Intelligent FDR Verification. Seamless Financial Compliance.
          </p>
        </div>

        {/* Role Selection Tabs */}
        <div className="mt-6">
          <label className="text-[11px] font-semibold uppercase tracking-wider text-[#d0c5b4] block mb-2">
            Select Workspace Role
          </label>
          <div className="grid grid-cols-3 gap-2 p-1 rounded-2xl bg-[#091a18]/80 border border-[#d8be9a]/25">
            {(['Officer', 'Institution', 'Administrator'] as UserRole[]).map((role) => (
              <button
                key={role}
                type="button"
                onClick={() => handleRoleSelect(role)}
                className={`py-2 px-1 rounded-xl text-xs font-semibold transition ${
                  selectedRole === role
                    ? 'bg-gradient-to-r from-[#d8be9a] to-[#c4a274] text-[#091a18] shadow-md shadow-black/30'
                    : 'text-[#d0c5b4] hover:text-[#fbf8f3] hover:bg-[#143834]'
                }`}
              >
                {role}
              </button>
            ))}
          </div>
          {selectedRole === 'Officer' && (
            <div className="mt-2 text-[11px] text-[#d8be9a] flex items-center justify-center gap-1.5 font-medium">
              <span>🎙️ Voice Briefing will automatically announce approaching maturities</span>
            </div>
          )}
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label className="block text-xs font-medium text-[#d0c5b4] mb-1.5">
              Authorized Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#d8be9a]" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="officer@noavalogix.org"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#091a18]/70 border border-[#d8be9a]/30 text-xs sm:text-sm text-[#fbf8f3] placeholder-gray-500 focus:outline-none focus:border-[#d8be9a] focus:ring-1 focus:ring-[#d8be9a] transition"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-medium text-[#d0c5b4]">
                Password
              </label>
              <a href="#reset" onClick={(e) => e.preventDefault()} className="text-[11px] text-[#d8be9a] hover:underline">
                Forgot password?
              </a>
            </div>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#d8be9a]" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#091a18]/70 border border-[#d8be9a]/30 text-xs sm:text-sm text-[#fbf8f3] placeholder-gray-500 focus:outline-none focus:border-[#d8be9a] focus:ring-1 focus:ring-[#d8be9a] transition"
              />
            </div>
          </div>

          <div className="flex items-center justify-between pt-1">
            <label className="flex items-center gap-2 cursor-pointer select-none text-xs text-[#d0c5b4]">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="rounded border-[#d8be9a]/40 bg-[#091a18] text-[#d8be9a] focus:ring-0"
              />
              <span>Remember this session</span>
            </label>
            <span className="text-[11px] text-[#2ecc71] font-medium flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" /> 256-bit SSL
            </span>
          </div>

          <button
            type="submit"
            className="w-full py-3 rounded-xl bg-gradient-to-r from-[#d8be9a] to-[#c4a274] text-[#091a18] font-bold text-xs uppercase tracking-wider hover:brightness-105 active:scale-[0.99] transition shadow-lg shadow-black/30 flex items-center justify-center gap-2 mt-2"
          >
            <span>Access {selectedRole} Portal</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Demo Fast Account Switcher for Evaluators */}
        <div className="mt-6 pt-5 border-t border-[#d8be9a]/15 text-center">
          <span className="text-[10px] uppercase font-bold tracking-wider text-[#d0c5b4]">
            Evaluator Fast Access
          </span>
          <div className="mt-2.5 grid grid-cols-1 gap-2">
            {INITIAL_USERS.map((usr) => (
              <button
                key={usr.id}
                type="button"
                onClick={() => {
                  setSelectedRole(usr.role);
                  setEmail(usr.email);
                  onLogin(usr);
                }}
                className="p-2.5 rounded-xl bg-[#091a18]/80 hover:bg-[#143834] border border-[#d8be9a]/20 transition flex items-center justify-between text-left text-xs"
              >
                <div className="flex items-center gap-2.5">
                  <UserCheck className="w-4 h-4 text-[#d8be9a]" />
                  <div>
                    <span className="font-semibold text-[#fbf8f3] block">{usr.name}</span>
                    <span className="text-[10px] text-[#d0c5b4]">{usr.designation}</span>
                  </div>
                </div>
                <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-[#133834] text-[#d8be9a]">
                  {usr.role}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Regulatory & Security Badges */}
        <div className="mt-5 pt-4 border-t border-[#d8be9a]/15 flex items-center justify-center gap-4 text-[10px] text-[#a39a8c]">
          <span className="flex items-center gap-1">
            <Shield className="w-3 h-3 text-[#d8be9a]" /> AICTE / UGC Compliant
          </span>
          <span>•</span>
          <span className="flex items-center gap-1">
            <Smartphone className="w-3 h-3 text-[#2ecc71]" /> PWA & Push Enabled
          </span>
        </div>
      </div>
    </div>
  );
};
