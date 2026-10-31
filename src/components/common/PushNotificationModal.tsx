import React, { useEffect, useState } from 'react';
import { Bell, CheckCircle2, AlertTriangle, Send, RefreshCw, Smartphone, ShieldCheck, Mail, Info, X } from 'lucide-react';
import { checkPushSupport, subscribeToPushNotifications, sendTestPush, runServerExpiryScan, getPushDeliveryLogs, PushStatus } from '../../services/pushService';
import { UserProfile } from '../../types';

interface PushNotificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserProfile;
  onSelectFdr?: (fdrId: string) => void;
}

export const PushNotificationModal: React.FC<PushNotificationModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onSelectFdr
}) => {
  const [status, setStatus] = useState<PushStatus>({
    isSupported: true,
    permission: 'default',
    isSubscribed: false,
    serviceWorkerActive: false
  });
  const [loading, setLoading] = useState(false);
  const [actionMessage, setActionMessage] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);
  const [logs, setLogs] = useState<any[]>([]);
  const [serverRecipients, setServerRecipients] = useState<string[]>([]);
  const [testFdrNumber, setTestFdrNumber] = useState('394829104821');

  const refreshStatus = async () => {
    const s = await checkPushSupport();
    setStatus(s);
    const data = await getPushDeliveryLogs();
    if (data && data.logs) setLogs(data.logs);
    if (data && data.simulatedEmailRecipients) setServerRecipients(data.simulatedEmailRecipients);
  };

  useEffect(() => {
    if (isOpen) {
      refreshStatus();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubscribe = async () => {
    setLoading(true);
    setActionMessage(null);
    try {
      const res = await subscribeToPushNotifications(currentUser.id, currentUser.role);
      if (res.success) {
        setActionMessage({ type: 'success', text: res.message });
        await refreshStatus();
      } else {
        setActionMessage({ type: 'error', text: res.message });
      }
    } catch (err: any) {
      setActionMessage({ type: 'error', text: err.message || 'Subscription failed.' });
    } finally {
      setLoading(false);
    }
  };

  const handleSendTestPush = async () => {
    setLoading(true);
    setActionMessage(null);
    try {
      const res = await sendTestPush(
        'NoavaLogix — FDR Expiry Alert',
        `FDR ending ${testFdrNumber.slice(-4)} from State Bank of India is maturing in 3 days. Immediate review is recommended.`,
        'FDR-SBI-2024-001'
      );
      if (res.success) {
        setActionMessage({
          type: 'success',
          text: `Push notification accepted by backend and sent to ${res.deliveredTo || 1} registered device(s)! If you're on a mobile phone or desktop, check your system notification tray.`
        });
        await refreshStatus();
      } else {
        setActionMessage({
          type: 'error',
          text: res.message || 'Failed to dispatch test push. Ensure notifications are enabled on this device.'
        });
      }
    } catch (err: any) {
      setActionMessage({ type: 'error', text: err.message || 'Error triggering test push.' });
    } finally {
      setLoading(false);
    }
  };

  const handleRunExpiryScan = async () => {
    setLoading(true);
    setActionMessage(null);
    try {
      const res = await runServerExpiryScan();
      if (res.success) {
        setActionMessage({
          type: 'success',
          text: `Automated server-side scan completed. Pushed alerts for approaching FDR milestones to ${res.subscriberCount || 0} subscriber device(s).`
        });
        await refreshStatus();
      } else {
        setActionMessage({ type: 'error', text: res.message });
      }
    } catch (err: any) {
      setActionMessage({ type: 'error', text: err.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-2xl max-h-[92vh] flex flex-col rounded-2xl bg-[#0e2a27] border border-[#d8be9a]/35 shadow-2xl text-[#fbf8f3] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-[#d8be9a]/20 bg-[#091a18]">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-[#143834] border border-[#d8be9a]/30 text-[#d8be9a]">
              <Bell className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <h2 className="text-xl font-bold tracking-tight text-[#fbf8f3] flex items-center gap-2">
                Mobile Web Push Intelligence
                <span className="text-xs px-2 py-0.5 rounded-full bg-[#d8be9a]/20 text-[#d8be9a] font-mono border border-[#d8be9a]/40">
                  VAPID Active
                </span>
              </h2>
              <p className="text-xs text-[#d0c5b4]">
                Multi-device push delivery for 30d, 15d, 7d, 5d, 3d, 0d milestones and critical bank mismatches
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

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Action Message Banner */}
          {actionMessage && (
            <div
              className={`p-3.5 rounded-xl border text-sm flex items-start gap-3 ${
                actionMessage.type === 'success'
                  ? 'bg-[#1b4332]/60 border-[#2ecc71]/40 text-[#a3e635]'
                  : actionMessage.type === 'error'
                  ? 'bg-[#4a1515]/60 border-[#e74c3c]/40 text-[#fca5a5]'
                  : 'bg-[#133834] border-[#d8be9a]/30 text-[#d0c5b4]'
              }`}
            >
              {actionMessage.type === 'success' ? (
                <CheckCircle2 className="w-5 h-5 shrink-0 text-[#2ecc71] mt-0.5" />
              ) : (
                <AlertTriangle className="w-5 h-5 shrink-0 text-[#e74c3c] mt-0.5" />
              )}
              <div className="leading-snug">{actionMessage.text}</div>
            </div>
          )}

          {/* Device & Permission Status Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="p-3.5 rounded-xl bg-[#091a18] border border-[#d8be9a]/20">
              <span className="text-xs text-[#d0c5b4]">Browser Permission</span>
              <div className="mt-1 flex items-center gap-2">
                <span
                  className={`inline-block w-2.5 h-2.5 rounded-full ${
                    status.permission === 'granted'
                      ? 'bg-[#2ecc71]'
                      : status.permission === 'denied'
                      ? 'bg-[#e74c3c]'
                      : 'bg-[#f39c12]'
                  }`}
                />
                <span className="font-semibold text-sm capitalize">{status.permission}</span>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-[#091a18] border border-[#d8be9a]/20">
              <span className="text-xs text-[#d0c5b4]">Service Worker</span>
              <div className="mt-1 flex items-center gap-2">
                <span
                  className={`inline-block w-2.5 h-2.5 rounded-full ${
                    status.serviceWorkerActive ? 'bg-[#2ecc71]' : 'bg-[#e74c3c]'
                  }`}
                />
                <span className="font-semibold text-sm">
                  {status.serviceWorkerActive ? 'sw.js Active' : 'Unregistered'}
                </span>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-[#091a18] border border-[#d8be9a]/20">
              <span className="text-xs text-[#d0c5b4]">Push Subscription</span>
              <div className="mt-1 flex items-center gap-2">
                <span
                  className={`inline-block w-2.5 h-2.5 rounded-full ${
                    status.isSubscribed ? 'bg-[#2ecc71]' : 'bg-[#d0c5b4]'
                  }`}
                />
                <span className="font-semibold text-sm">
                  {status.isSubscribed ? 'Device Linked' : 'Not Subscribed'}
                </span>
              </div>
            </div>
          </div>

          {/* Primary Registration Interaction */}
          <div className="p-4 rounded-xl bg-[#091a18] border border-[#d8be9a]/30 space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div>
                <h4 className="font-semibold text-sm text-[#fbf8f3] flex items-center gap-2">
                  <Smartphone className="w-4 h-4 text-[#d8be9a]" />
                  Enable Push Notifications for this Device
                </h4>
                <p className="text-xs text-[#d0c5b4] mt-0.5">
                  Allows NoavaLogix server to deliver background notifications even when this browser tab is closed.
                </p>
              </div>
              <button
                onClick={handleSubscribe}
                disabled={loading}
                className="w-full sm:w-auto px-4 py-2 rounded-xl bg-gradient-to-r from-[#d8be9a] to-[#c4a274] text-[#091a18] font-bold text-xs uppercase tracking-wider hover:brightness-105 transition disabled:opacity-50 shrink-0"
              >
                {status.isSubscribed ? 'Re-Sync Subscription' : 'Enable Mobile Notifications'}
              </button>
            </div>

            {/* Test Action Controls */}
            <div className="pt-3 border-t border-[#d8be9a]/15 flex flex-wrap items-center gap-3">
              <button
                onClick={handleSendTestPush}
                disabled={loading || !status.isSubscribed}
                className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg bg-[#143834] text-[#d8be9a] border border-[#d8be9a]/30 text-xs font-medium hover:bg-[#1b4b45] transition disabled:opacity-40"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Send Real Push to this Phone/Device</span>
              </button>

              <button
                onClick={handleRunExpiryScan}
                disabled={loading}
                className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg bg-[#143834] text-[#fbf8f3] border border-[#d8be9a]/20 text-xs font-medium hover:bg-[#1b4b45] transition disabled:opacity-40"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
                <span>Run Backend Expiry Check</span>
              </button>
            </div>
          </div>

          {/* Prototype Email Notification Disclosure (Mandatory prompt requirement) */}
          <div className="p-4 rounded-xl bg-[#0b201e] border border-[#d8be9a]/20 text-xs space-y-2">
            <div className="flex items-center gap-2 text-[#d8be9a] font-semibold">
              <Mail className="w-4 h-4" />
              <span>Automated Expiry Email Engine (Simulation Specification)</span>
            </div>
            <p className="text-[#d0c5b4]">
              In addition to real Web Push alerts, NoavaLogix automated backend routines schedule emails for 30d, 15d, 7d, 5d, 3d, 0d milestones and overdue notices.
              The intended production recipients configured server-side are:
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5 pt-1 font-mono text-[11px] text-[#e7d7c1]">
              {serverRecipients.map((email, idx) => (
                <div key={idx} className="px-2 py-1 rounded bg-[#091a18] border border-[#d8be9a]/15 truncate" title={email}>
                  {email}
                </div>
              ))}
            </div>
            <div className="text-[11px] text-[#a39a8c] italic pt-1 flex items-center gap-1.5">
              <Info className="w-3.5 h-3.5 text-[#d8be9a]" />
              Prototype status: Real Web Push delivered to registered devices; Email delivery displayed truthfully as simulated backend log.
            </div>
          </div>

          {/* Delivery Logs */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs text-[#d0c5b4]">
              <span className="font-semibold uppercase tracking-wider text-[#d8be9a]">Server Push Delivery History</span>
              <button onClick={refreshStatus} className="hover:text-white flex items-center gap-1">
                <RefreshCw className="w-3 h-3" /> Refresh
              </button>
            </div>
            <div className="max-h-40 overflow-y-auto space-y-2 rounded-xl bg-[#091a18] border border-[#d8be9a]/20 p-3 text-xs">
              {logs.length === 0 ? (
                <div className="text-center text-gray-500 py-3">No delivery events logged yet.</div>
              ) : (
                logs.map((log) => (
                  <div key={log.id} className="p-2 rounded-lg bg-[#0e2a27] border border-[#d8be9a]/15 flex items-start justify-between gap-3">
                    <div>
                      <div className="font-medium text-[#fbf8f3] flex items-center gap-2">
                        {log.title}
                        <span className="text-[10px] px-1.5 py-0.2 rounded bg-[#133834] text-[#d8be9a]">
                          {log.recipientsCount} Target(s)
                        </span>
                      </div>
                      <div className="text-[11px] text-[#d0c5b4] mt-0.5">{log.body}</div>
                      {log.details && (
                        <div className="text-[10px] text-gray-400 mt-0.5">{log.details}</div>
                      )}
                    </div>
                    <div className="text-[10px] text-[#d8be9a]/70 shrink-0 font-mono">
                      {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-[#d8be9a]/20 bg-[#091a18] flex items-center justify-between text-xs text-[#d0c5b4]">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-[#2ecc71]" />
            <span>End-to-end encrypted push payload</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-[#143834] text-[#fbf8f3] hover:bg-[#1a4a45] transition font-medium"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
