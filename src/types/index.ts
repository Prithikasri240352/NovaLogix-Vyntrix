export type UserRole = 'Institution' | 'Officer' | 'Administrator';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  designation: string;
  institutionName?: string;
  institutionCode?: string;
  avatar?: string;
}

export type FDRStatus =
  | 'Uploaded'
  | 'OCR Extracted'
  | 'Pending Verification'
  | 'Bank Verification'
  | 'Verified'
  | 'Active'
  | 'Approaching Maturity'
  | 'Matured'
  | 'Renewal / Release Processing'
  | 'Closed';

export type BankVerificationStatus =
  | 'Verified'
  | 'Pending Verification'
  | 'Mismatch Detected'
  | 'Confirmation Required'
  | 'Unable to Verify';

export type RiskCategory = 'Low' | 'Medium' | 'High' | 'Critical';

export type SupportedBankCode =
  | 'SBI'
  | 'INDIAN_BANK'
  | 'CANARA'
  | 'BOB'
  | 'UNION'
  | 'HDFC'
  | 'ICICI'
  | 'AXIS';

export interface BankDiscrepancy {
  field: string;
  ocrValue: string;
  bankValue: string;
  status: 'Match' | 'Mismatch' | 'Pending';
  severity: 'Low' | 'Medium' | 'Critical';
}

export interface RiskIssue {
  id: string;
  title: string;
  field: string;
  evidence: string;
  whyItMatters: string;
  recommendedAction: string;
  severity: RiskCategory;
}

export interface AuditRecord {
  id: string;
  action: string;
  performedBy: string;
  role: string;
  timestamp: string;
  note?: string;
}

export interface FDRRecord {
  id: string;
  fdrNumber: string;
  institutionId: string;
  institutionName: string;
  institutionCode: string;
  bankName: string;
  bankCode: SupportedBankCode;
  branchName: string;
  ifscCode: string;
  accountHolder: string;
  principalAmount: number;
  interestRate: number;
  issueDate: string;
  maturityDate: string;
  maturityAmount: number;
  status: FDRStatus;
  bankVerificationStatus: BankVerificationStatus;
  riskScore: number;
  riskCategory: RiskCategory;
  riskIssues: RiskIssue[];
  discrepancies: BankDiscrepancy[];
  ocrConfidence: {
    fdrNumber: number;
    principalAmount: number;
    interestRate: number;
    issueDate: number;
    maturityDate: number;
    accountHolder: number;
    bankName: number;
  };
  lienMarked: boolean;
  lienBeneficiary: string;
  daysToMaturity: number;
  documentUrl?: string;
  documentName?: string;
  auditTrail: AuditRecord[];
  renewalRequested?: boolean;
  releaseRequested?: boolean;
  officerRemarks?: string;
}

export interface PushNotificationPayload {
  title: string;
  body: string;
  fdrId?: string;
  url?: string;
  timestamp?: number;
}
