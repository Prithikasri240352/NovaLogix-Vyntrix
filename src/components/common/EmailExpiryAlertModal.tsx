import React, { useState } from 'react';
import { Mail, CheckCircle2, AlertTriangle, Send, X, Building, FileText, Calendar, DollarSign, ShieldAlert, Copy, Check } from 'lucide-react';
import { sendExpiryEmailAlert, ExpiryEmailPayload } from '../../services/pushService';

interface EmailExpiryAlertModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultCollegeName?: string;
  defaultFdrNumber?: string;
  onSuccess?: () => void;
}

export const EmailExpiryAlertModal: React.FC<EmailExpiryAlertModalProps> = ({
  isOpen,
  onClose,
  defaultCollegeName = 'Apex Institute of Technology & Engineering',
  defaultFdrNumber = '394829104821',
  onSuccess
}) => {
  const [recipient, setRecipient] = useState('240352.cs@rmkec.ac.in');
  const [collegeName, setCollegeName] = useState(defaultCollegeName);
  const [fdrNumber, setFdrNumber] = useState(defaultFdrNumber);
  const [bankName, setBankName] = useState('State Bank of India');
  const [principalAmount, setPrincipalAmount] = useState('₹ 50,00,000');
  const [daysToMaturity, setDaysToMaturity] = useState(3);
  const [maturityDate, setMaturityDate] = useState('02-Nov-2026');
  const [loading, setLoading] = useState(false);
  const [dispatchedRecord, setDispatchedRecord] = useState<any | null>(null);
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleSendEmailAlert = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setLoading(true);
    try {
      const res = await sendExpiryEmailAlert({
        recipientEmail: recipient,
        collegeName,
        fdrNumber,
        bankName,
        principalAmount,
        maturityDate,
        daysToMaturity
      });
      if (res.success) {
        setDispatchedRecord(res.emailRecord);
        if (onSuccess) onSuccess();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCopyBody = () => {
    if (dispatchedRecord?.body) {
      navigator.clipboard.writeText(dispatchedRecord.body);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-2xl max-h-[92vh] flex flex-col rounded-2xl bg-[#0e2a27] border border-[#d8be9a]/35 shadow-2xl text-[#fbf8f3] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-[#d8be9a]/20 bg-[#091a18]">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-[#143834] border border-[#d8be9a]/30 text-[#d8be9a]">
              <Mail className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <h2 className="text-xl font-bold tracking-tight text-[#fbf8f3]">
                FDR Expiry Email Alert Dispatcher
              </h2>
              <p className="text-xs text-[#d0c5b4]">
                Target Recipient: <span className="text-[#d8be9a] font-mono font-semibold">240352.cs@rmkec.ac.in</span>
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

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          {/* Status Banner when dispatched */}
          {dispatchedRecord ? (
            <div className="p-4 rounded-xl bg-[#1b4332]/80 border border-[#2ecc71]/40 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-[#a3e635] flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-[#2ecc71]" />
                  Official Expiry Notice Successfully Dispatched
                </span>
                <span className="text-[10px] font-mono text-[#d8be9a]">
                  {new Date(dispatchedRecord.timestamp).toLocaleTimeString()}
                </span>
              </div>
              <div className="text-xs text-[#fbf8f3] space-y-1">
                <div><strong>To:</strong> <span className="font-mono text-[#a3e635]">{dispatchedRecord.recipientEmail}</span></div>
                <div><strong>College / Institution:</strong> <span className="text-[#d8be9a]">{dispatchedRecord.collegeName}</span></div>
                <div><strong>Sample FDR Number:</strong> <span className="font-mono text-[#fbf8f3]">#{dispatchedRecord.fdrNumber}</span></div>
                <div><strong>Subject:</strong> {dispatchedRecord.subject}</div>
              </div>
            </div>
          ) : (
            <div className="p-3.5 rounded-xl bg-[#143834] border border-[#d8be9a]/30 text-xs text-[#d0c5b4] flex items-start gap-2.5">
              <ShieldAlert className="w-4 h-4 text-[#d8be9a] shrink-0 mt-0.5" />
              <span>
                Statutory expiry alerts automatically notify the institutional registrar and authorized email contacts that their recent FDR is reaching maturity, ensuring uninterrupted compliance liens.
              </span>
            </div>
          )}

          {/* Configuration Form */}
          <form onSubmit={handleSendEmailAlert} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block text-[#d0c5b4] font-medium mb-1">
                  Recipient Email Address
                </label>
                <input
                  type="email"
                  required
                  value={recipient}
                  onChange={(e) => setRecipient(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-[#091a18] border border-[#d8be9a]/30 text-[#fbf8f3] font-mono"
                />
              </div>

              <div>
                <label className="block text-[#d0c5b4] font-medium mb-1">
                  College / Institution Name (Any College)
                </label>
                <input
                  type="text"
                  required
                  value={collegeName}
                  onChange={(e) => setCollegeName(e.target.value)}
                  placeholder="e.g. R.M.K. Engineering College"
                  className="w-full px-3 py-2 rounded-xl bg-[#091a18] border border-[#d8be9a]/30 text-[#fbf8f3]"
                />
              </div>

              <div>
                <label className="block text-[#d0c5b4] font-medium mb-1">
                  Sample FDR Number
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    required
                    value={fdrNumber}
                    onChange={(e) => setFdrNumber(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-[#091a18] border border-[#d8be9a]/30 text-[#fbf8f3] font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[#d0c5b4] font-medium mb-1">
                  Depository Bank
                </label>
                <select
                  value={bankName}
                  onChange={(e) => setBankName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-[#091a18] border border-[#d8be9a]/30 text-[#d8be9a]"
                >
                  <option value="State Bank of India">State Bank of India (SBI)</option>
                  <option value="HDFC Bank">HDFC Bank</option>
                  <option value="Canara Bank">Canara Bank</option>
                  <option value="Bank of Baroda">Bank of Baroda</option>
                  <option value="Indian Bank">Indian Bank</option>
                  <option value="Union Bank of India">Union Bank of India</option>
                  <option value="ICICI Bank">ICICI Bank</option>
                  <option value="Axis Bank">Axis Bank</option>
                </select>
              </div>

              <div>
                <label className="block text-[#d0c5b4] font-medium mb-1">
                  Principal Amount
                </label>
                <input
                  type="text"
                  value={principalAmount}
                  onChange={(e) => setPrincipalAmount(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-[#091a18] border border-[#d8be9a]/30 text-[#fbf8f3] font-bold"
                />
              </div>

              <div>
                <label className="block text-[#d0c5b4] font-medium mb-1">
                  Days to Maturity
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min="0"
                    max="60"
                    value={daysToMaturity}
                    onChange={(e) => setDaysToMaturity(Number(e.target.value))}
                    className="w-24 px-3 py-2 rounded-xl bg-[#091a18] border border-[#d8be9a]/30 text-[#fbf8f3] font-mono font-bold"
                  />
                  <span className="text-gray-400">Date: {maturityDate}</span>
                </div>
              </div>
            </div>

            {/* Quick College Name presets */}
            <div className="pt-1">
              <span className="text-[10px] text-[#d0c5b4] uppercase font-semibold block mb-1.5">
                Quick College Name & FDR Presets:
              </span>
              <div className="flex flex-wrap gap-1.5 text-xs">
                {[
                  { name: 'R.M.K. Engineering College', fdr: '394829104821', bank: 'State Bank of India', amt: '₹ 50,00,000' },
                  { name: 'Apex Institute of Technology & Engineering', fdr: '503009218204', bank: 'HDFC Bank', amt: '₹ 1,20,00,000' },
                  { name: 'National Science & Research Institute', fdr: '189204857102', bank: 'Canara Bank', amt: '₹ 35,00,000' },
                  { name: 'Southern Polytechnic University', fdr: '028400109482', bank: 'Bank of Baroda', amt: '₹ 40,00,000' }
                ].map((item, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      setCollegeName(item.name);
                      setFdrNumber(item.fdr);
                      setBankName(item.bank);
                      setPrincipalAmount(item.amt);
                    }}
                    className="px-2.5 py-1 rounded-lg bg-[#091a18] border border-[#d8be9a]/25 text-[#d8be9a] hover:bg-[#143834] text-[11px] transition"
                  >
                    + {item.name.split(' ')[0]} ({item.fdr.slice(-4)})
                  </button>
                ))}
              </div>
            </div>

            {/* Email Preview Container */}
            <div className="p-4 rounded-xl bg-[#091a18] border border-[#d8be9a]/25 text-xs space-y-2">
              <div className="flex items-center justify-between pb-2 border-b border-[#d8be9a]/15 text-[#d8be9a]">
                <span className="font-semibold uppercase tracking-wider text-[10px]">
                  Generated Email Notice Content
                </span>
                <button
                  type="button"
                  onClick={handleCopyBody}
                  className="hover:text-white flex items-center gap-1 text-[11px]"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Copied' : 'Copy'}</span>
                </button>
              </div>

              <div className="font-mono text-[11px] text-[#e7d7c1] leading-relaxed whitespace-pre-wrap">
{`Subject: NoavaLogix Urgent Notice: Your Recent FDR is going to expire — ${collegeName}
To: ${recipient}
From: compliance-regulatory-alerts@noavalogix.org

Dear Administrator / Registrar,

This is an urgent compliance notification from the NoavaLogix FDR Intelligence System.

Your Recent FDR #${fdrNumber} for ${collegeName} deposited with ${bankName} (${principalAmount}) is going to expire in ${daysToMaturity} days on ${maturityDate}.

Under statutory AICTE and UGC regulatory guidelines, institutional endowment deposits must maintain an uninterrupted lien. Failure to renew or submit an approved encashment release prior to the maturity date will trigger a non-compliance breach notice.

Next Steps:
1. Contact ${bankName} to execute deposit renewal under the same regulatory lien code.
2. Upload the renewed FDR certificate on NoavaLogix for automated OCR validation.

Compliance Reference: AICTE-FDR-NOTIF-982412
Delivered to authorized recipient: ${recipient}`}
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl bg-[#143834] text-[#fbf8f3] text-xs font-medium hover:bg-[#1a4a45]"
              >
                Close
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#d8be9a] to-[#c4a274] text-[#091a18] font-bold text-xs uppercase tracking-wider hover:brightness-105 shadow-md flex items-center gap-2 disabled:opacity-50"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{loading ? 'Dispatching...' : `Send Expiry Alert to ${recipient}`}</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
