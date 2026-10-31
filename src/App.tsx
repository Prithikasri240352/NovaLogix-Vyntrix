import React, { useState, useEffect } from 'react';
import { UserProfile, UserRole, FDRRecord, FDRStatus, BankVerificationStatus, RiskIssue } from './types';
import { INITIAL_USERS, INITIAL_FDR_RECORDS } from './data/sampleFDRs';
import { LoginPage } from './pages/auth/LoginPage';
import { Navbar } from './components/layout/Navbar';
import { Sidebar } from './components/layout/Sidebar';
import { OfficerWorkspace } from './pages/officer/OfficerWorkspace';
import { MultiBankHub } from './pages/officer/MultiBankHub';
import { ExpiryIntelligence } from './pages/officer/ExpiryIntelligence';
import { InstitutionDashboard } from './pages/institution/InstitutionDashboard';
import { UploadFDRModal } from './pages/institution/UploadFDRModal';
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { FDRDetailModal } from './components/common/FDRDetailModal';
import { ExplainWhyModal } from './components/common/ExplainWhyModal';
import { PushNotificationModal } from './components/common/PushNotificationModal';
import { EmailExpiryAlertModal } from './components/common/EmailExpiryAlertModal';
import { OfficerAIExtension } from './components/extension/OfficerAIExtension';
import { VoiceBriefingBar } from './components/voice/VoiceBriefingBar';
import { speechController, generateOfficerBriefing } from './services/speechService';
import { registerServiceWorker, sendExpiryEmailAlert } from './services/pushService';

export default function App() {
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(INITIAL_USERS[0]); // Default to Officer for instant preview
  const [records, setRecords] = useState<FDRRecord[]>(INITIAL_FDR_RECORDS);
  const [activeView, setActiveView] = useState<string>('officer-workspace');

  // Modals & Drawers
  const [selectedFdrId, setSelectedFdrId] = useState<string | null>(null);
  const [explainFdr, setExplainFdr] = useState<FDRRecord | null>(null);
  const [explainIssue, setExplainIssue] = useState<RiskIssue | null>(null);
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [isPushModalOpen, setIsPushModalOpen] = useState(false);
  const [isExtensionOpen, setIsExtensionOpen] = useState(false);
  const [isEmailAlertOpen, setIsEmailAlertOpen] = useState(false);
  const [emailAlertCollege, setEmailAlertCollege] = useState('Apex Institute of Technology & Engineering');
  const [emailAlertFdr, setEmailAlertFdr] = useState('394829104821');

  // Voice briefing state
  const [briefingText, setBriefingText] = useState('');
  const [showVoiceBanner, setShowVoiceBanner] = useState(false);
  const [autoplayBlocked, setAutoplayBlocked] = useState(false);

  // Initialize service worker on mount
  useEffect(() => {
    registerServiceWorker();

    // Listen to push notification clicks forwarded by service worker
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.addEventListener('message', (event) => {
        if (event.data && event.data.type === 'NOTIFICATION_NAVIGATE') {
          if (event.data.fdrId) {
            setSelectedFdrId(event.data.fdrId);
          }
        }
      });
    }
  }, []);

  // Trigger Officer-Only Voice Briefing immediately upon Officer login
  const triggerOfficerVoiceBriefing = (user: UserProfile) => {
    if (user.role !== 'Officer') {
      speechController.stop();
      setShowVoiceBanner(false);
      setIsExtensionOpen(false);
      return;
    }

    const briefing = generateOfficerBriefing(records, user.name);
    setBriefingText(briefing.text);
    setShowVoiceBanner(true);

    // Attempt playback immediately
    const started = speechController.speak(briefing.text, () => {
      // briefing ended
    });

    if (!started) {
      // Browser autoplay restriction detected
      setAutoplayBlocked(true);
    } else {
      setAutoplayBlocked(false);
    }

    // Automatically reveal floating extension launcher
    setIsExtensionOpen(true);
  };

  const handleLogin = (user: UserProfile) => {
    setCurrentUser(user);
    if (user.role === 'Officer') {
      setActiveView('officer-workspace');
      triggerOfficerVoiceBriefing(user);
    } else if (user.role === 'Institution') {
      setActiveView('institution-dashboard');
      speechController.stop();
      setShowVoiceBanner(false);
      setIsExtensionOpen(false);

      // Automated trigger required by user prompt:
      // "send epiry alert to 240352.cs@rmkec.ac.in that Your Recent FDR is going to expire and give sample FDR number while the institution log in and send alert email that any college name is going to expire"
      const college = user.institutionName || 'Apex Institute of Technology & Engineering';
      const sampleFdr = '394829104821';
      sendExpiryEmailAlert({
        recipientEmail: '240352.cs@rmkec.ac.in',
        collegeName: college,
        fdrNumber: sampleFdr,
        bankName: 'State Bank of India',
        principalAmount: '₹ 50,00,000',
        maturityDate: '02-Nov-2026',
        daysToMaturity: 3
      });
      setEmailAlertCollege(college);
      setEmailAlertFdr(sampleFdr);
      setIsEmailAlertOpen(true);
    } else {
      setActiveView('admin-dashboard');
      speechController.stop();
      setShowVoiceBanner(false);
      setIsExtensionOpen(false);
    }
  };

  const handleLogout = () => {
    speechController.stop();
    setCurrentUser(null);
    setShowVoiceBanner(false);
    setIsExtensionOpen(false);
  };

  const handleRoleChange = (role: UserRole) => {
    const userPreset = INITIAL_USERS.find(u => u.role === role) || {
      id: 'usr-' + role.toLowerCase(),
      name: role === 'Officer' ? 'Dr. Aravind Swaminathan' : role === 'Institution' ? 'Dr. Meenakshi Raman' : 'Vikram Malhotra',
      email: `${role.toLowerCase()}@noavalogix.org`,
      role: role,
      designation: `${role} Access`
    };
    handleLogin(userPreset);
  };

  // Synchronous State updates across the whole platform
  const handleUpdateFdrStatus = (
    fdrId: string,
    status: FDRStatus,
    bankStatus: BankVerificationStatus,
    note?: string
  ) => {
    setRecords(prev =>
      prev.map(r => {
        if (r.id !== fdrId) return r;
        const newAudit = {
          id: 'a-' + Date.now(),
          action: `Status updated to ${status} (${bankStatus})`,
          performedBy: currentUser?.name || 'Officer',
          role: currentUser?.role || 'Officer',
          timestamp: new Date().toLocaleDateString() + ' ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          note
        };
        return {
          ...r,
          status,
          bankVerificationStatus: bankStatus,
          riskCategory: bankStatus === 'Verified' ? 'Low' : bankStatus === 'Mismatch Detected' ? 'Critical' : r.riskCategory,
          riskScore: bankStatus === 'Verified' ? Math.min(r.riskScore, 20) : bankStatus === 'Mismatch Detected' ? 92 : r.riskScore,
          auditTrail: [newAudit, ...r.auditTrail]
        };
      })
    );
  };

  const handleAddNewFdr = (newFdr: FDRRecord) => {
    setRecords(prev => [newFdr, ...prev]);
  };

  const handleRequestRenewal = (fdrId: string) => {
    handleUpdateFdrStatus(fdrId, 'Renewal / Release Processing', 'Verified', 'Institution requested formal renewal authorization.');
  };

  const handleExplainWhy = (fdr: FDRRecord, issue?: RiskIssue) => {
    setExplainFdr(fdr);
    setExplainIssue(issue || null);
  };

  // If user is not logged in, render the luxury login experience with the user's uploaded background photograph
  if (!currentUser) {
    return <LoginPage onLogin={handleLogin} />;
  }

  const selectedFdr = records.find(r => r.id === selectedFdrId) || null;
  const urgentCount = records.filter(r => r.daysToMaturity >= 0 && r.daysToMaturity <= 7).length;
  const pendingCount = records.filter(r => r.status === 'Pending Verification' || r.status === 'OCR Extracted').length;

  return (
    <div className="min-h-screen bg-[#091a18] text-[#fbf8f3] font-['Poppins',sans-serif] flex flex-col antialiased selection:bg-[#d8be9a] selection:text-[#0b2220]">
      {/* 1. Header Navbar */}
      <Navbar
        currentUser={currentUser}
        onChangeRole={handleRoleChange}
        onLogout={handleLogout}
        onOpenPushModal={() => setIsPushModalOpen(true)}
        onOpenExtension={() => setIsExtensionOpen(true)}
        unreadAlertsCount={urgentCount}
      />

      {/* 2. Automatic Voice Briefing Notification Bar (Officer Only) */}
      {currentUser.role === 'Officer' && showVoiceBanner && (
        <VoiceBriefingBar
          briefingText={briefingText}
          autoplayBlocked={autoplayBlocked}
          onDismiss={() => setShowVoiceBanner(false)}
          onOpenExtension={() => setIsExtensionOpen(true)}
        />
      )}

      {/* 3. Main Workspace Area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Role-Specific Sidebar */}
        <Sidebar
          currentRole={currentUser.role}
          activeView={activeView}
          onNavigate={(viewId) => {
            if (viewId === 'upload-fdr' || viewId === 'ocr-upload') {
              setIsUploadOpen(true);
            } else {
              setActiveView(viewId);
            }
          }}
          urgentExpiryCount={urgentCount}
          pendingVerificationCount={pendingCount}
        />

        {/* Dynamic Page Views */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 bg-gradient-to-b from-[#091a18] via-[#0b201e] to-[#091a18]">
          {/* OFFICER VIEWS */}
          {currentUser.role === 'Officer' && (
            <>
              {activeView === 'officer-workspace' && (
                <OfficerWorkspace
                  currentUser={currentUser}
                  records={records}
                  onSelectFdr={(id) => setSelectedFdrId(id)}
                  onExplainWhy={handleExplainWhy}
                  onOpenExtension={() => setIsExtensionOpen(true)}
                  onVerifyBank={(id) => setSelectedFdrId(id)}
                />
              )}

              {activeView === 'expiry-intelligence' && (
                <ExpiryIntelligence
                  records={records}
                  onSelectFdr={(id) => setSelectedFdrId(id)}
                  onExplainWhy={handleExplainWhy}
                />
              )}

              {activeView === 'multibank-hub' && (
                <MultiBankHub
                  records={records}
                  onSelectFdr={(id) => setSelectedFdrId(id)}
                  onVerifyBank={(id) => setSelectedFdrId(id)}
                />
              )}

              {(activeView === 'ocr-upload' || activeView === 'risk-discrepancies' || activeView === 'audit-history') && (
                <OfficerWorkspace
                  currentUser={currentUser}
                  records={records}
                  onSelectFdr={(id) => setSelectedFdrId(id)}
                  onExplainWhy={handleExplainWhy}
                  onOpenExtension={() => setIsExtensionOpen(true)}
                  onVerifyBank={(id) => setSelectedFdrId(id)}
                />
              )}
            </>
          )}

          {/* INSTITUTION VIEWS */}
          {currentUser.role === 'Institution' && (
            <InstitutionDashboard
              currentUser={currentUser}
              records={records}
              onOpenUpload={() => setIsUploadOpen(true)}
              onSelectFdr={(id) => setSelectedFdrId(id)}
              onRequestRenewal={handleRequestRenewal}
              onOpenEmailAlert={(college, fdr) => {
                if (college) setEmailAlertCollege(college);
                if (fdr) setEmailAlertFdr(fdr);
                setIsEmailAlertOpen(true);
              }}
            />
          )}

          {/* ADMINISTRATOR VIEWS */}
          {currentUser.role === 'Administrator' && (
            <AdminDashboard
              currentUser={currentUser}
              records={records}
              onOpenPushModal={() => setIsPushModalOpen(true)}
            />
          )}
        </main>
      </div>

      {/* 4. Officer-Only Floating AI Extension Panel */}
      {currentUser.role === 'Officer' && (
        <OfficerAIExtension
          currentUser={currentUser}
          records={records}
          onSelectFdr={(id) => setSelectedFdrId(id)}
          onExplainWhy={handleExplainWhy}
          isOpen={isExtensionOpen}
          onToggle={() => setIsExtensionOpen(!isExtensionOpen)}
        />
      )}

      {/* 5. FDR Digital Twin & Detail Modal */}
      <FDRDetailModal
        isOpen={selectedFdrId !== null}
        onClose={() => setSelectedFdrId(null)}
        fdr={selectedFdr}
        onUpdateStatus={handleUpdateFdrStatus}
        onExplainWhy={handleExplainWhy}
        isOfficer={currentUser.role === 'Officer'}
      />

      {/* 6. Explainable AI "WHY?" Modal */}
      <ExplainWhyModal
        isOpen={explainFdr !== null}
        onClose={() => setExplainFdr(null)}
        fdr={explainFdr}
        issue={explainIssue}
      />

      {/* 7. AI OCR Upload Modal */}
      <UploadFDRModal
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        onSuccessUpload={handleAddNewFdr}
        institutionName={currentUser.institutionName || 'Apex Institute of Technology & Engineering'}
        institutionCode={currentUser.institutionCode || 'INST-AICTE-TN-0492'}
      />

      {/* 8. Real Mobile Web Push Notification Modal */}
      <PushNotificationModal
        isOpen={isPushModalOpen}
        onClose={() => setIsPushModalOpen(false)}
        currentUser={currentUser}
        onSelectFdr={(id) => {
          setIsPushModalOpen(false);
          setSelectedFdrId(id);
        }}
      />

      {/* 9. FDR Expiry Email Alert Modal (Target: 240352.cs@rmkec.ac.in) */}
      <EmailExpiryAlertModal
        isOpen={isEmailAlertOpen}
        onClose={() => setIsEmailAlertOpen(false)}
        defaultCollegeName={emailAlertCollege}
        defaultFdrNumber={emailAlertFdr}
      />
    </div>
  );
}
