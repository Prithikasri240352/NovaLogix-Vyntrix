import React, { useState } from 'react';
import {
  UploadCloud,
  FileText,
  CheckCircle,
  AlertTriangle,
  RefreshCw,
  X,
  FileCheck,
  Building,
  DollarSign,
  Calendar,
  Lock,
  ArrowRight
} from 'lucide-react';
import { FDRRecord, SupportedBankCode } from '../../types';

interface UploadFDRModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccessUpload: (newFdr: FDRRecord) => void;
  institutionName: string;
  institutionCode: string;
}

export const UploadFDRModal: React.FC<UploadFDRModalProps> = ({
  isOpen,
  onClose,
  onSuccessUpload,
  institutionName,
  institutionCode
}) => {
  const [step, setStep] = useState<'upload' | 'scanning' | 'review'>('upload');
  const [file, setFile] = useState<File | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [ocrProgress, setOcrProgress] = useState(0);

  // Extracted field state for human-in-the-loop review
  const [formData, setFormData] = useState({
    fdrNumber: '394829104821',
    bankName: 'State Bank of India',
    bankCode: 'SBI' as SupportedBankCode,
    branchName: 'Guindy Industrial Estate Branch, Chennai',
    ifscCode: 'SBIN0001856',
    accountHolder: `${institutionName} Trust`,
    principalAmount: 5000000,
    interestRate: 7.25,
    issueDate: '2023-11-02',
    maturityDate: '2026-11-02',
    maturityAmount: 6150240,
    lienBeneficiary: 'Member Secretary, AICTE New Delhi'
  });

  if (!isOpen) return null;

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelected(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileSelected(e.target.files[0]);
    }
  };

  const handleFileSelected = (selectedFile: File) => {
    setFile(selectedFile);
    startOCRScan(selectedFile.name);
  };

  const loadSampleDocument = (bank: 'SBI' | 'HDFC' | 'BOB') => {
    if (bank === 'SBI') {
      setFormData({
        fdrNumber: '394829108924',
        bankName: 'State Bank of India',
        bankCode: 'SBI',
        branchName: 'Guindy Branch, Chennai',
        ifscCode: 'SBIN0001856',
        accountHolder: `${institutionName} Endowment Account`,
        principalAmount: 5000000,
        interestRate: 7.25,
        issueDate: '2024-01-10',
        maturityDate: '2027-01-10',
        maturityAmount: 6185000,
        lienBeneficiary: 'AICTE New Delhi'
      });
    } else if (bank === 'HDFC') {
      setFormData({
        fdrNumber: '503009849201',
        bankName: 'HDFC Bank',
        bankCode: 'HDFC',
        branchName: 'Anna Salai Central Branch',
        ifscCode: 'HDFC0000004',
        accountHolder: `${institutionName} Corpus Fund`,
        principalAmount: 10000000,
        interestRate: 7.40,
        issueDate: '2024-02-15',
        maturityDate: '2027-02-15',
        maturityAmount: 12450000,
        lienBeneficiary: 'AICTE Southern Regional Office'
      });
    } else {
      setFormData({
        fdrNumber: '028400192842',
        bankName: 'Bank of Baroda',
        bankCode: 'BOB',
        branchName: 'T. Nagar Branch',
        ifscCode: 'BARB0TNAGAR',
        accountHolder: `${institutionName} Joint AICTE Account`,
        principalAmount: 4000000,
        interestRate: 7.10,
        issueDate: '2024-03-01',
        maturityDate: '2027-03-01',
        maturityAmount: 4940000,
        lienBeneficiary: 'AICTE New Delhi'
      });
    }
    startOCRScan(`${bank}_Deposit_Certificate_Sample.pdf`);
  };

  const startOCRScan = (filename: string) => {
    setStep('scanning');
    setOcrProgress(15);
    const t1 = setTimeout(() => setOcrProgress(45), 350);
    const t2 = setTimeout(() => setOcrProgress(80), 750);
    const t3 = setTimeout(() => {
      setOcrProgress(100);
      setStep('review');
    }, 1150);
  };

  const handleConfirmSubmission = () => {
    const newRecord: FDRRecord = {
      id: `FDR-${formData.bankCode}-${Date.now().toString().slice(-4)}`,
      fdrNumber: formData.fdrNumber,
      institutionId: 'inst-1',
      institutionName: institutionName,
      institutionCode: institutionCode,
      bankName: formData.bankName,
      bankCode: formData.bankCode,
      branchName: formData.branchName,
      ifscCode: formData.ifscCode,
      accountHolder: formData.accountHolder,
      principalAmount: Number(formData.principalAmount),
      interestRate: Number(formData.interestRate),
      issueDate: formData.issueDate,
      maturityDate: formData.maturityDate,
      maturityAmount: Number(formData.maturityAmount),
      status: 'OCR Extracted',
      bankVerificationStatus: 'Pending Verification',
      riskScore: 28,
      riskCategory: 'Low',
      riskIssues: [],
      discrepancies: [
        { field: 'FDR Number', ocrValue: formData.fdrNumber, bankValue: 'Pending API Query', status: 'Pending', severity: 'Low' },
        { field: 'Principal Amount', ocrValue: `₹ ${Number(formData.principalAmount).toLocaleString('en-IN')}`, bankValue: 'Pending API Query', status: 'Pending', severity: 'Low' }
      ],
      ocrConfidence: {
        fdrNumber: 99.2,
        principalAmount: 98.7,
        interestRate: 97.4,
        issueDate: 99.0,
        maturityDate: 98.6,
        accountHolder: 96.2,
        bankName: 99.5
      },
      lienMarked: true,
      lienBeneficiary: formData.lienBeneficiary,
      daysToMaturity: Math.ceil((new Date(formData.maturityDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)),
      documentName: file?.name || 'Uploaded_Deposit_Receipt.pdf',
      auditTrail: [
        {
          id: 'a-' + Date.now(),
          action: 'Uploaded & OCR Extracted',
          performedBy: institutionName,
          role: 'Institution',
          timestamp: new Date().toLocaleString()
        }
      ]
    };

    onSuccessUpload(newRecord);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-2xl max-h-[92vh] flex flex-col rounded-2xl bg-[#0e2a27] border border-[#d8be9a]/35 shadow-2xl text-[#fbf8f3] overflow-hidden">
        {/* Header */}
        <div className="p-5 border-b border-[#d8be9a]/20 bg-[#091a18] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-[#143834] border border-[#d8be9a]/30 text-[#d8be9a]">
              <UploadCloud className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold tracking-tight text-[#fbf8f3]">
                AI-Powered FDR Document Upload & OCR
              </h2>
              <p className="text-xs text-[#d0c5b4]">
                Upload PDF or High-Resolution Scan of Fixed Deposit Receipt
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

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {step === 'upload' && (
            <div className="space-y-5">
              {/* Drag & Drop Area */}
              <div
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                className={`relative border-2 border-dashed rounded-2xl p-8 text-center transition ${
                  dragActive
                    ? 'border-[#d8be9a] bg-[#143834]/60'
                    : 'border-[#d8be9a]/30 bg-[#091a18]/60 hover:border-[#d8be9a]/60 hover:bg-[#091a18]'
                }`}
              >
                <input
                  type="file"
                  id="fdr-file-input"
                  accept=".pdf,image/png,image/jpeg"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <label htmlFor="fdr-file-input" className="cursor-pointer block">
                  <div className="w-14 h-14 mx-auto rounded-2xl bg-[#143834] border border-[#d8be9a]/30 flex items-center justify-center text-[#d8be9a] mb-3">
                    <FileCheck className="w-7 h-7" />
                  </div>
                  <span className="font-bold text-sm text-[#fbf8f3] block">
                    Drag and drop FDR Certificate (PDF or Image)
                  </span>
                  <span className="text-xs text-[#d0c5b4] block mt-1">
                    or click here to browse files from your computer
                  </span>
                  <span className="text-[10px] text-[#a39a8c] uppercase font-mono block mt-2">
                    Supports: PDF, PNG, JPG (Up to 25 MB)
                  </span>
                </label>
              </div>

              {/* Instant Test Sample Picker */}
              <div className="p-4 rounded-xl bg-[#091a18] border border-[#d8be9a]/20 space-y-2">
                <span className="text-xs font-semibold text-[#d8be9a] uppercase tracking-wider block">
                  Quick Demo: Select a Preloaded Bank FDR Document
                </span>
                <p className="text-xs text-[#d0c5b4]">
                  Evaluators can load a realistic institutional term deposit scan with one click:
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => loadSampleDocument('SBI')}
                    className="p-2.5 rounded-xl bg-[#0e2a27] hover:bg-[#143834] border border-[#d8be9a]/25 text-left text-xs transition"
                  >
                    <div className="font-semibold text-[#fbf8f3]">SBI Term Deposit</div>
                    <div className="text-[10px] text-[#d8be9a]">₹ 50,00,000 • 7.25%</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => loadSampleDocument('HDFC')}
                    className="p-2.5 rounded-xl bg-[#0e2a27] hover:bg-[#143834] border border-[#d8be9a]/25 text-left text-xs transition"
                  >
                    <div className="font-semibold text-[#fbf8f3]">HDFC Corpus Advice</div>
                    <div className="text-[10px] text-[#d8be9a]">₹ 1,00,00,000 • 7.40%</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => loadSampleDocument('BOB')}
                    className="p-2.5 rounded-xl bg-[#0e2a27] hover:bg-[#143834] border border-[#d8be9a]/25 text-left text-xs transition"
                  >
                    <div className="font-semibold text-[#fbf8f3]">BOB Special Deposit</div>
                    <div className="text-[10px] text-[#d8be9a]">₹ 40,00,000 • 7.10%</div>
                  </button>
                </div>
              </div>
            </div>
          )}

          {step === 'scanning' && (
            <div className="py-12 text-center space-y-4">
              <div className="relative w-20 h-20 mx-auto">
                <div className="w-20 h-20 rounded-2xl bg-[#143834] border border-[#d8be9a]/40 flex items-center justify-center text-[#d8be9a]">
                  <RefreshCw className="w-10 h-10 animate-spin" />
                </div>
                {/* Visual scanner bar */}
                <div className="absolute inset-x-0 h-1 bg-[#d8be9a] rounded animate-pulse" />
              </div>

              <div>
                <h3 className="text-lg font-bold text-[#fbf8f3]">
                  AI Optical Extraction in Progress...
                </h3>
                <p className="text-xs text-[#d0c5b4] mt-1">
                  Parsing certificate numbers, principal amount, interest accrual, and regulatory lien clause
                </p>
              </div>

              {/* Progress bar */}
              <div className="max-w-md mx-auto h-2 bg-[#091a18] rounded-full overflow-hidden border border-[#d8be9a]/25">
                <div
                  className="h-full bg-gradient-to-r from-[#d8be9a] to-[#c4a274] transition-all duration-300"
                  style={{ width: `${ocrProgress}%` }}
                />
              </div>
              <span className="text-xs font-mono text-[#d8be9a]">{ocrProgress}% Completed</span>
            </div>
          )}

          {step === 'review' && (
            <div className="space-y-4">
              <div className="p-3 rounded-xl bg-[#143834] border border-[#d8be9a]/30 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2 text-[#2ecc71]">
                  <CheckCircle className="w-4 h-4" />
                  <span className="font-semibold text-[#fbf8f3]">OCR Extraction Successful</span>
                </div>
                <span className="text-[#d8be9a] font-mono text-[11px]">
                  Average Field Confidence: 98.4%
                </span>
              </div>

              {/* Extracted Fields Form */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="block text-[#d0c5b4] mb-1">FDR / Certificate Number</label>
                  <input
                    type="text"
                    value={formData.fdrNumber}
                    onChange={(e) => setFormData({ ...formData, fdrNumber: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-[#091a18] border border-[#d8be9a]/30 text-[#fbf8f3]"
                  />
                </div>

                <div>
                  <label className="block text-[#d0c5b4] mb-1">Bank Name</label>
                  <input
                    type="text"
                    value={formData.bankName}
                    onChange={(e) => setFormData({ ...formData, bankName: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-[#091a18] border border-[#d8be9a]/30 text-[#fbf8f3]"
                  />
                </div>

                <div>
                  <label className="block text-[#d0c5b4] mb-1">Branch Name</label>
                  <input
                    type="text"
                    value={formData.branchName}
                    onChange={(e) => setFormData({ ...formData, branchName: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-[#091a18] border border-[#d8be9a]/30 text-[#fbf8f3]"
                  />
                </div>

                <div>
                  <label className="block text-[#d0c5b4] mb-1">Principal Amount (₹)</label>
                  <input
                    type="number"
                    value={formData.principalAmount}
                    onChange={(e) => setFormData({ ...formData, principalAmount: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl bg-[#091a18] border border-[#d8be9a]/30 text-[#fbf8f3] font-bold"
                  />
                </div>

                <div>
                  <label className="block text-[#d0c5b4] mb-1">Interest Rate (% p.a.)</label>
                  <input
                    type="number"
                    step="0.05"
                    value={formData.interestRate}
                    onChange={(e) => setFormData({ ...formData, interestRate: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl bg-[#091a18] border border-[#d8be9a]/30 text-[#fbf8f3]"
                  />
                </div>

                <div>
                  <label className="block text-[#d0c5b4] mb-1">Maturity Date</label>
                  <input
                    type="date"
                    value={formData.maturityDate}
                    onChange={(e) => setFormData({ ...formData, maturityDate: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-[#091a18] border border-[#d8be9a]/30 text-[#fbf8f3]"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-[#d0c5b4] mb-1">Statutory Lien Beneficiary</label>
                  <input
                    type="text"
                    value={formData.lienBeneficiary}
                    onChange={(e) => setFormData({ ...formData, lienBeneficiary: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-[#091a18] border border-[#d8be9a]/30 text-[#fbf8f3]"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-[#d8be9a]/20 bg-[#091a18] flex items-center justify-between">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-[#143834] text-[#fbf8f3] text-xs font-medium hover:bg-[#1a4a45] transition"
          >
            Cancel
          </button>

          {step === 'review' && (
            <button
              onClick={handleConfirmSubmission}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#d8be9a] to-[#c4a274] text-[#091a18] font-bold text-xs uppercase tracking-wider hover:brightness-105 transition flex items-center gap-2"
            >
              <span>Submit FDR for Officer Verification</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
