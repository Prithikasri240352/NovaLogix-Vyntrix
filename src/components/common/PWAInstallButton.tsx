import React, { useEffect, useState } from 'react';
import { Download, Smartphone, X, CheckCircle } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}

export const PWAInstallButton: React.FC<{ compact?: boolean }> = ({ compact = false }) => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [showIOSModal, setShowIOSModal] = useState(false);
  const [justInstalled, setJustInstalled] = useState(false);

  useEffect(() => {
    // Check if in standalone mode
    const standalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as any).standalone === true;
    setIsInstalled(standalone);

    // Detect iOS
    const ua = window.navigator.userAgent.toLowerCase();
    const iosDevice = /iphone|ipad|ipod/.test(ua);
    setIsIOS(iosDevice);

    const handlePrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
      setJustInstalled(true);
      setDeferredPrompt(null);
      setTimeout(() => setJustInstalled(false), 5000);
    };

    window.addEventListener('beforeinstallprompt', handlePrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handlePrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      await deferredPrompt.prompt();
      const choice = await deferredPrompt.userChoice;
      if (choice.outcome === 'accepted') {
        setIsInstalled(true);
        setJustInstalled(true);
        setDeferredPrompt(null);
      }
    } else if (isIOS) {
      setShowIOSModal(true);
    } else {
      // Guide non-iOS desktop/android when prompt not available
      alert('PWA is active! To install NoavaLogix, tap the Install icon in your browser address bar or menu.');
    }
  };

  if (isInstalled && !justInstalled) {
    return (
      <span className="hidden lg:inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-full bg-[#133834] text-[#d8be9a] border border-[#d8be9a]/20">
        <CheckCircle className="w-3.5 h-3.5 text-[#2ecc71]" />
        PWA Installed
      </span>
    );
  }

  return (
    <>
      <button
        onClick={handleInstallClick}
        className={`inline-flex items-center gap-2 rounded-lg font-medium transition duration-150 ${
          compact
            ? 'px-2.5 py-1.5 text-xs bg-[#133834] text-[#d8be9a] hover:bg-[#1a4a45] border border-[#d8be9a]/30'
            : 'px-3.5 py-2 text-sm bg-gradient-to-r from-[#d8be9a] to-[#c4a274] text-[#091a18] font-semibold hover:brightness-105 shadow-md shadow-black/20'
        }`}
        title="Install NoavaLogix as Progressive Web App"
      >
        <Smartphone className="w-4 h-4" />
        <span>{compact ? 'Install PWA' : 'Install Mobile App'}</span>
      </button>

      {/* iOS Installation Guided Drawer / Modal */}
      {showIOSModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="w-full max-w-sm rounded-2xl bg-[#0e2a27] border border-[#d8be9a]/40 p-6 text-[#fbf8f3] shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-[#d8be9a]/20">
              <div className="flex items-center gap-2">
                <Smartphone className="w-5 h-5 text-[#d8be9a]" />
                <h3 className="font-semibold text-lg">Install on iOS Safari</h3>
              </div>
              <button
                onClick={() => setShowIOSModal(false)}
                className="text-gray-400 hover:text-white p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="mt-4 space-y-3 text-sm text-[#d0c5b4]">
              <div className="flex items-start gap-3 p-2.5 rounded-lg bg-[#091a18]/70 border border-[#d8be9a]/15">
                <span className="flex items-center justify-center w-6 h-6 rounded-full bg-[#d8be9a] text-[#091a18] font-bold text-xs shrink-0">1</span>
                <span>Tap the <strong>Share</strong> button (box with upward arrow) at the bottom toolbar of Safari.</span>
              </div>
              <div className="flex items-start gap-3 p-2.5 rounded-lg bg-[#091a18]/70 border border-[#d8be9a]/15">
                <span className="flex items-center justify-center w-6 h-6 rounded-full bg-[#d8be9a] text-[#091a18] font-bold text-xs shrink-0">2</span>
                <span>Scroll down and select <strong>"Add to Home Screen"</strong>.</span>
              </div>
              <div className="flex items-start gap-3 p-2.5 rounded-lg bg-[#091a18]/70 border border-[#d8be9a]/15">
                <span className="flex items-center justify-center w-6 h-6 rounded-full bg-[#d8be9a] text-[#091a18] font-bold text-xs shrink-0">3</span>
                <span>Tap <strong>Add</strong> in the top-right corner to enjoy real mobile push alerts and full-screen experience!</span>
              </div>
            </div>

            <button
              onClick={() => setShowIOSModal(false)}
              className="mt-5 w-full py-2.5 rounded-xl bg-[#d8be9a] text-[#091a18] font-semibold text-sm hover:bg-[#c4a274] transition"
            >
              Got It
            </button>
          </div>
        </div>
      )}
    </>
  );
};
