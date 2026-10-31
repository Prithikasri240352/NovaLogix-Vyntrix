// Speech Service for NoavaLogix Expiry Voice Intelligence
import { FDRRecord } from '../types';

export interface VoiceBriefingData {
  text: string;
  expiringToday: number;
  expiring3Days: number;
  expiring5Days: number;
  expiring7Days: number;
  expiring15Days: number;
  expiring30Days: number;
  overdueMatured: number;
  awaitingVerification: number;
  criticalDiscrepancies: number;
  missingBankConfirmations: number;
  pendingRenewalRelease: number;
  topActionFdrId?: string;
}

export function generateOfficerBriefing(records: FDRRecord[], officerName: string): VoiceBriefingData {
  let expiringToday = 0;
  let expiring3Days = 0;
  let expiring5Days = 0;
  let expiring7Days = 0;
  let expiring15Days = 0;
  let expiring30Days = 0;
  let overdueMatured = 0;
  let awaitingVerification = 0;
  let criticalDiscrepancies = 0;
  let missingBankConfirmations = 0;
  let pendingRenewalRelease = 0;
  let topActionFdrId: string | undefined;

  for (const r of records) {
    if (r.daysToMaturity === 0) expiringToday++;
    else if (r.daysToMaturity > 0 && r.daysToMaturity <= 3) expiring3Days++;
    else if (r.daysToMaturity > 3 && r.daysToMaturity <= 5) expiring5Days++;
    else if (r.daysToMaturity > 5 && r.daysToMaturity <= 7) expiring7Days++;
    else if (r.daysToMaturity > 7 && r.daysToMaturity <= 15) expiring15Days++;
    else if (r.daysToMaturity > 15 && r.daysToMaturity <= 30) expiring30Days++;
    else if (r.daysToMaturity < 0 || r.status === 'Matured') overdueMatured++;

    if (r.status === 'Pending Verification' || r.bankVerificationStatus === 'Pending Verification') {
      awaitingVerification++;
    }
    if (r.bankVerificationStatus === 'Mismatch Detected' || r.riskCategory === 'Critical') {
      criticalDiscrepancies++;
      if (!topActionFdrId) topActionFdrId = r.id;
    }
    if (r.bankVerificationStatus === 'Confirmation Required') {
      missingBankConfirmations++;
    }
    if (r.renewalRequested || r.releaseRequested || r.status === 'Renewal / Release Processing') {
      pendingRenewalRelease++;
    }
  }

  if (!topActionFdrId && expiring3Days > 0) {
    const urgent = records.find(r => r.daysToMaturity > 0 && r.daysToMaturity <= 3);
    if (urgent) topActionFdrId = urgent.id;
  }

  const shortName = officerName.replace('Dr. ', '').split(' ')[0] || 'Officer';
  const urgentCount = expiringToday + expiring3Days + overdueMatured + criticalDiscrepancies;

  // Dynamically constructed natural language briefing text
  let briefing = `Welcome to NoavaLogix, ${officerName}. Your automated FDR compliance intelligence briefing is ready. `;
  
  const points: string[] = [];
  if (expiringToday > 0) {
    points.push(`${expiringToday} FDR is maturing today.`);
  }
  if (expiring3Days > 0) {
    points.push(`${expiring3Days} deposit reaches maturity within 3 days.`);
  }
  if (expiring5Days > 0) {
    points.push(`${expiring5Days} deposit reaches maturity within 5 days.`);
  }
  if (expiring7Days > 0) {
    points.push(`${expiring7Days} FDRs are approaching maturity within 7 days.`);
  }
  if (expiring15Days > 0) {
    points.push(`${expiring15Days} FDRs are scheduled for the 15-day milestone.`);
  }
  if (expiring30Days > 0) {
    points.push(`${expiring30Days} FDRs are in the 30-day advance window.`);
  }
  if (overdueMatured > 0) {
    points.push(`Critical notice: ${overdueMatured} deposit is overdue or past maturity without formal release.`);
  }
  if (criticalDiscrepancies > 0) {
    points.push(`Risk alert: ${criticalDiscrepancies} record has severe bank ledger discrepancies requiring immediate freeze.`);
  }
  if (missingBankConfirmations > 0) {
    points.push(`${missingBankConfirmations} record is awaiting physical branch token confirmation.`);
  }
  if (awaitingVerification > 0) {
    points.push(`${awaitingVerification} newly uploaded deposits are waiting in your verification queue.`);
  }

  briefing += points.join(' ');
  briefing += ` In total, ${urgentCount} records require priority action. Open Expiry Intelligence or the AI extension panel to review the details.`;

  return {
    text: briefing,
    expiringToday,
    expiring3Days,
    expiring5Days,
    expiring7Days,
    expiring15Days,
    expiring30Days,
    overdueMatured,
    awaitingVerification,
    criticalDiscrepancies,
    missingBankConfirmations,
    pendingRenewalRelease,
    topActionFdrId
  };
}

class SpeechController {
  private currentUtterance: SpeechSynthesisUtterance | null = null;
  public isSpeaking = false;
  public isPaused = false;
  public isMuted = false;
  public rate = 1.0;
  public lastBriefingText = '';
  private onStatusChangeListeners: Array<(status: { isSpeaking: boolean; isPaused: boolean; isMuted: boolean }) => void> = [];

  public subscribe(cb: (status: { isSpeaking: boolean; isPaused: boolean; isMuted: boolean }) => void) {
    this.onStatusChangeListeners.push(cb);
    return () => {
      this.onStatusChangeListeners = this.onStatusChangeListeners.filter(l => l !== cb);
    };
  }

  private notify() {
    this.onStatusChangeListeners.forEach(cb =>
      cb({ isSpeaking: this.isSpeaking, isPaused: this.isPaused, isMuted: this.isMuted })
    );
  }

  public speak(text: string, onEnd?: () => void): boolean {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      console.warn('[Speech] Web Speech API not supported in this browser environment');
      return false;
    }

    this.lastBriefingText = text;
    if (this.isMuted) {
      console.log('[Speech] Muted, skipping audio playback');
      return false;
    }

    try {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = this.rate;
      utterance.pitch = 1.0;

      // Select an English voice if available
      const voices = window.speechSynthesis.getVoices();
      const preferredVoice = voices.find(v => v.lang.startsWith('en') && (v.name.includes('Natural') || v.name.includes('Google') || v.name.includes('Samantha') || v.name.includes('Daniel')));
      if (preferredVoice) {
        utterance.voice = preferredVoice;
      }

      utterance.onstart = () => {
        this.isSpeaking = true;
        this.isPaused = false;
        this.notify();
      };

      utterance.onpause = () => {
        this.isPaused = true;
        this.notify();
      };

      utterance.onresume = () => {
        this.isPaused = false;
        this.notify();
      };

      utterance.onend = () => {
        this.isSpeaking = false;
        this.isPaused = false;
        this.notify();
        if (onEnd) onEnd();
      };

      utterance.onerror = (e) => {
        console.warn('[Speech] Playback notice or autoplay restriction:', e.error);
        this.isSpeaking = false;
        this.isPaused = false;
        this.notify();
      };

      this.currentUtterance = utterance;
      window.speechSynthesis.speak(utterance);
      return true;
    } catch (err) {
      console.error('[Speech] Error speaking:', err);
      this.isSpeaking = false;
      this.notify();
      return false;
    }
  }

  public pause() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.pause();
      this.isPaused = true;
      this.notify();
    }
  }

  public resume() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      if (this.isPaused) {
        window.speechSynthesis.resume();
        this.isPaused = false;
        this.notify();
      } else if (!this.isSpeaking && this.lastBriefingText) {
        this.speak(this.lastBriefingText);
      }
    }
  }

  public replay() {
    if (this.lastBriefingText) {
      this.speak(this.lastBriefingText);
    }
  }

  public stop() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      this.isSpeaking = false;
      this.isPaused = false;
      this.notify();
    }
  }

  public toggleMute() {
    this.isMuted = !this.isMuted;
    if (this.isMuted && this.isSpeaking) {
      this.stop();
    }
    this.notify();
    return this.isMuted;
  }
}

export const speechController = new SpeechController();
