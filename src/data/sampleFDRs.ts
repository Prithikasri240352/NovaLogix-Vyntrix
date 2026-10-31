import { FDRRecord, UserProfile } from '../types';

export const INITIAL_USERS: UserProfile[] = [
  {
    id: 'usr-officer-1',
    name: 'Dr. Aravind Swaminathan',
    email: 'aravind.swaminathan@noavalogix.org',
    role: 'Officer',
    designation: 'Senior FDR Compliance Officer',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&q=80'
  },
  {
    id: 'usr-inst-1',
    name: 'Dr. Meenakshi Raman',
    email: 'registrar@nittech.edu.in',
    role: 'Institution',
    designation: 'Registrar & Finance Trustee',
    institutionName: 'Apex Institute of Technology & Engineering',
    institutionCode: 'INST-AICTE-TN-0492',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=256&q=80'
  },
  {
    id: 'usr-admin-1',
    name: 'Vikram Malhotra',
    email: 'vikram.malhotra@noavalogix.gov.in',
    role: 'Administrator',
    designation: 'Chief Regulatory Administrator',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=256&q=80'
  }
];

export const INITIAL_FDR_RECORDS: FDRRecord[] = [
  {
    id: 'FDR-SBI-2024-001',
    fdrNumber: '394829104821',
    institutionId: 'inst-1',
    institutionName: 'Apex Institute of Technology & Engineering',
    institutionCode: 'INST-AICTE-TN-0492',
    bankName: 'State Bank of India',
    bankCode: 'SBI',
    branchName: 'Guindy Industrial Estate Branch, Chennai',
    ifscCode: 'SBIN0001856',
    accountHolder: 'Apex Institute of Technology & Engineering Trust',
    principalAmount: 5000000,
    interestRate: 7.25,
    issueDate: '2023-11-02',
    maturityDate: '2026-11-02', // 3 days from local reference date 2026-10-30
    maturityAmount: 6150240,
    status: 'Approaching Maturity',
    bankVerificationStatus: 'Verified',
    riskScore: 68,
    riskCategory: 'High',
    riskIssues: [
      {
        id: 'r1',
        title: 'Maturity Imminent (3 Days Remaining)',
        field: 'Maturity Date (02-Nov-2026)',
        evidence: 'Official maturity date extracted from Term Deposit Certificate and verified against SBI CBS Gateway.',
        whyItMatters: 'Statutory AICTE endowment lien will lapse unless renewal certificate or formal encashment authorization is executed prior to maturity date.',
        recommendedAction: 'Issue immediate renewal notice to institution Registrar and flag for priority officer review.',
        severity: 'High'
      }
    ],
    discrepancies: [
      { field: 'FDR Number', ocrValue: '394829104821', bankValue: '394829104821', status: 'Match', severity: 'Low' },
      { field: 'Principal Amount', ocrValue: '₹ 50,00,000', bankValue: '₹ 50,00,000', status: 'Match', severity: 'Low' },
      { field: 'Lien Beneficiary', ocrValue: 'AICTE New Delhi', bankValue: 'AICTE New Delhi', status: 'Match', severity: 'Low' }
    ],
    ocrConfidence: {
      fdrNumber: 99.4,
      principalAmount: 98.8,
      interestRate: 97.2,
      issueDate: 99.1,
      maturityDate: 98.5,
      accountHolder: 96.0,
      bankName: 99.5
    },
    lienMarked: true,
    lienBeneficiary: 'AICTE New Delhi (Member Secretary)',
    daysToMaturity: 3,
    documentName: 'SBI_Special_Term_Deposit_Receipt_394821.pdf',
    auditTrail: [
      { id: 'a1', action: 'Uploaded by Institution', performedBy: 'Dr. Meenakshi Raman', role: 'Institution', timestamp: '2024-01-15 10:20 AM' },
      { id: 'a2', action: 'OCR Extraction Completed', performedBy: 'NoavaLogix AI Engine v4.2', role: 'System', timestamp: '2024-01-15 10:22 AM' },
      { id: 'a3', action: 'Bank Verification Confirmed', performedBy: 'SBI CBS Direct Connector', role: 'Bank Adapter', timestamp: '2024-01-15 11:05 AM' },
      { id: 'a4', action: 'Verified & Lien Activated', performedBy: 'Dr. Aravind Swaminathan', role: 'Officer', timestamp: '2024-01-16 02:40 PM' }
    ],
    renewalRequested: false
  },
  {
    id: 'FDR-HDFC-2024-003',
    fdrNumber: '503009218204',
    institutionId: 'inst-1',
    institutionName: 'Apex Institute of Technology & Engineering',
    institutionCode: 'INST-AICTE-TN-0492',
    bankName: 'HDFC Bank',
    bankCode: 'HDFC',
    branchName: 'Anna Salai Central Branch, Chennai',
    ifscCode: 'HDFC0000004',
    accountHolder: 'Apex Institute of Technology Corpus Fund',
    principalAmount: 12000000,
    interestRate: 7.40,
    issueDate: '2023-11-04',
    maturityDate: '2026-11-04', // 5 days from local date
    maturityAmount: 14890000,
    status: 'Approaching Maturity',
    bankVerificationStatus: 'Verified',
    riskScore: 55,
    riskCategory: 'Medium',
    riskIssues: [
      {
        id: 'r2',
        title: 'Corpus Deposit Expiring in 5 Days',
        field: 'Maturity Date (04-Nov-2026)',
        evidence: 'HDFC CBS ledger confirms principal ₹1.2 Cr maturity in 5 calendar days.',
        whyItMatters: 'Substantial statutory corpus fund. Failure to renew triggers non-compliance under Chapter IV AICTE approval handbook.',
        recommendedAction: 'Dispatch automated 5-day reminder to institution and bank relationship manager.',
        severity: 'Medium'
      }
    ],
    discrepancies: [
      { field: 'FDR Number', ocrValue: '503009218204', bankValue: '503009218204', status: 'Match', severity: 'Low' },
      { field: 'Principal Amount', ocrValue: '₹ 1,20,00,000', bankValue: '₹ 1,20,00,000', status: 'Match', severity: 'Low' }
    ],
    ocrConfidence: {
      fdrNumber: 99.1,
      principalAmount: 98.4,
      interestRate: 96.9,
      issueDate: 98.2,
      maturityDate: 97.9,
      accountHolder: 95.8,
      bankName: 99.8
    },
    lienMarked: true,
    lienBeneficiary: 'AICTE New Delhi',
    daysToMaturity: 5,
    documentName: 'HDFC_Fixed_Deposit_Advise_503009.pdf',
    auditTrail: [
      { id: 'a5', action: 'Uploaded by Institution', performedBy: 'Dr. Meenakshi Raman', role: 'Institution', timestamp: '2024-02-10 11:15 AM' },
      { id: 'a6', action: 'Bank Verified via HDFC Gateway', performedBy: 'HDFC Adapter v2.4', role: 'Bank Adapter', timestamp: '2024-02-10 11:20 AM' }
    ]
  },
  {
    id: 'FDR-CANARA-2024-002',
    fdrNumber: '189204857102',
    institutionId: 'inst-2',
    institutionName: 'National Science & Research Institute',
    institutionCode: 'INST-AICTE-KA-0128',
    bankName: 'Canara Bank',
    bankCode: 'CANARA',
    branchName: 'Malleshwaram 8th Cross, Bengaluru',
    ifscCode: 'CNRB0000412',
    accountHolder: 'National Science Research Foundation',
    principalAmount: 3500000,
    interestRate: 7.10,
    issueDate: '2023-11-06',
    maturityDate: '2026-11-06', // 7 days from local date
    maturityAmount: 4305000,
    status: 'Approaching Maturity',
    bankVerificationStatus: 'Verified',
    riskScore: 42,
    riskCategory: 'Medium',
    riskIssues: [
      {
        id: 'r3',
        title: 'Approaching Maturity Milestone (7 Days)',
        field: 'Maturity Date (06-Nov-2026)',
        evidence: 'Canara Bank verification record dated 2024-03-01.',
        whyItMatters: 'Mandatory 7-day milestone alert for regulatory oversight committee.',
        recommendedAction: 'Send automated email notification to designated administrators.',
        severity: 'Medium'
      }
    ],
    discrepancies: [
      { field: 'FDR Number', ocrValue: '189204857102', bankValue: '189204857102', status: 'Match', severity: 'Low' },
      { field: 'Principal Amount', ocrValue: '₹ 35,00,000', bankValue: '₹ 35,00,000', status: 'Match', severity: 'Low' }
    ],
    ocrConfidence: {
      fdrNumber: 98.7,
      principalAmount: 97.9,
      interestRate: 98.1,
      issueDate: 99.0,
      maturityDate: 98.3,
      accountHolder: 94.2,
      bankName: 99.2
    },
    lienMarked: true,
    lienBeneficiary: 'AICTE / UGC Joint Directorate',
    daysToMaturity: 7,
    documentName: 'Canara_KDR_Certificate_189204.pdf',
    auditTrail: [
      { id: 'a7', action: 'Uploaded by Institution', performedBy: 'Finance Officer Suresh', role: 'Institution', timestamp: '2024-03-01 09:30 AM' }
    ]
  },
  {
    id: 'FDR-AXIS-2024-008',
    fdrNumber: '921020084729-MISMATCH',
    institutionId: 'inst-3',
    institutionName: 'Southern Polytechnic University',
    institutionCode: 'INST-AICTE-AP-0382',
    bankName: 'Axis Bank',
    bankCode: 'AXIS',
    branchName: 'Banjara Hills Road No 12, Hyderabad',
    ifscCode: 'UTIB0000008',
    accountHolder: 'Southern Polytechnic Education Society',
    principalAmount: 7500000,
    interestRate: 7.35,
    issueDate: '2024-05-12',
    maturityDate: '2027-05-12',
    maturityAmount: 9320000,
    status: 'Bank Verification',
    bankVerificationStatus: 'Mismatch Detected',
    riskScore: 92,
    riskCategory: 'Critical',
    riskIssues: [
      {
        id: 'r4',
        title: 'Critical Principal Amount Mismatch Detected',
        field: 'Principal Amount',
        evidence: 'Uploaded FDR scan specifies ₹ 75,00,000, but Axis Bank CBS API reports actual ledger amount of ₹ 65,00,000.',
        whyItMatters: '₹ 10,00,000 deficit in mandatory institutional reserve. Potential fraudulent document alteration or mismatched receipt.',
        recommendedAction: 'Freeze verification approval immediately. Require physical branch manager confirmation letter with wet ink stamp.',
        severity: 'Critical'
      },
      {
        id: 'r5',
        title: 'Lien Clause Unconfirmed in Core Banking Ledger',
        field: 'Lien Status',
        evidence: 'Axis Bank CBS returns "Lien: None" while uploaded document shows manual rubber stamp.',
        whyItMatters: 'Without core system lien marking, the institution can prematurely encash the deposit without regulatory sanction.',
        recommendedAction: 'Request bank zonal officer to input lien code AICTE-SEC-2024 into core banking.',
        severity: 'Critical'
      }
    ],
    discrepancies: [
      { field: 'Principal Amount', ocrValue: '₹ 75,00,000', bankValue: '₹ 65,00,000', status: 'Mismatch', severity: 'Critical' },
      { field: 'Lien Status', ocrValue: 'Marked (Manual Stamp)', bankValue: 'Unencumbered / No Lien in CBS', status: 'Mismatch', severity: 'Critical' },
      { field: 'Account Holder', ocrValue: 'Southern Polytechnic Education Society', bankValue: 'Southern Polytechnic Trust', status: 'Pending', severity: 'Medium' }
    ],
    ocrConfidence: {
      fdrNumber: 99.2,
      principalAmount: 78.4, // Flagged for review
      interestRate: 98.1,
      issueDate: 99.0,
      maturityDate: 98.6,
      accountHolder: 82.5,
      bankName: 99.4
    },
    lienMarked: false,
    lienBeneficiary: 'Pending Regulatory Confirmation',
    daysToMaturity: 560,
    documentName: 'Axis_Bank_Term_Deposit_Advice_921020.pdf',
    auditTrail: [
      { id: 'a8', action: 'Uploaded by Institution', performedBy: 'Accountant Ramesh', role: 'Institution', timestamp: '2024-05-14 03:10 PM' },
      { id: 'a9', action: 'OCR Extracted with Low Confidence Flag', performedBy: 'NoavaLogix AI Engine', role: 'System', timestamp: '2024-05-14 03:12 PM' },
      { id: 'a10', action: 'Bank Verification: Discrepancy Found', performedBy: 'Axis Bank Adapter', role: 'Bank Adapter', timestamp: '2024-05-14 04:30 PM' }
    ]
  },
  {
    id: 'FDR-BOB-2023-019',
    fdrNumber: '028400109482',
    institutionId: 'inst-1',
    institutionName: 'Apex Institute of Technology & Engineering',
    institutionCode: 'INST-AICTE-TN-0492',
    bankName: 'Bank of Baroda',
    bankCode: 'BOB',
    branchName: 'T. Nagar Branch, Chennai',
    ifscCode: 'BARB0TNAGAR',
    accountHolder: 'Apex Institute Endowment Account',
    principalAmount: 4000000,
    interestRate: 6.90,
    issueDate: '2022-10-15',
    maturityDate: '2026-10-15', // 15 days ago (Overdue / Matured)
    maturityAmount: 5214000,
    status: 'Matured',
    bankVerificationStatus: 'Verified',
    riskScore: 88,
    riskCategory: 'Critical',
    riskIssues: [
      {
        id: 'r6',
        title: 'Overdue Matured Deposit (15 Days Past Maturity)',
        field: 'Maturity Date (15-Oct-2026)',
        evidence: 'Maturity passed 15 days ago without renewal receipt or formal release processing.',
        whyItMatters: 'Deposit is currently earning non-contractual savings interest. Statutory compliance guarantee has technically lapsed.',
        recommendedAction: 'Issue formal Notice of Compliance Breach. Require institution to upload renewal FDR within 48 hours.',
        severity: 'Critical'
      }
    ],
    discrepancies: [
      { field: 'FDR Number', ocrValue: '028400109482', bankValue: '028400109482', status: 'Match', severity: 'Low' }
    ],
    ocrConfidence: {
      fdrNumber: 99.0,
      principalAmount: 99.1,
      interestRate: 98.7,
      issueDate: 99.3,
      maturityDate: 99.2,
      accountHolder: 97.4,
      bankName: 99.6
    },
    lienMarked: true,
    lienBeneficiary: 'AICTE New Delhi',
    daysToMaturity: -15, // Overdue
    documentName: 'BOB_Fixed_Deposit_Receipt_028400.pdf',
    auditTrail: [
      { id: 'a11', action: 'Uploaded by Institution', performedBy: 'Dr. Meenakshi Raman', role: 'Institution', timestamp: '2022-10-20 10:00 AM' },
      { id: 'a12', action: 'Overdue Notification Auto-Triggered', performedBy: 'NoavaLogix Expiry Engine', role: 'System', timestamp: '2026-10-16 00:05 AM' }
    ],
    renewalRequested: true
  },
  {
    id: 'FDR-INDIAN-2024-004',
    fdrNumber: '682910482019',
    institutionId: 'inst-4',
    institutionName: 'Coimbatore Institute of Science & Marine Studies',
    institutionCode: 'INST-AICTE-TN-0814',
    bankName: 'Indian Bank',
    bankCode: 'INDIAN_BANK',
    branchName: 'RS Puram Branch, Coimbatore',
    ifscCode: 'IDIB000R021',
    accountHolder: 'Coimbatore Marine Institute Trust',
    principalAmount: 6000000,
    interestRate: 7.20,
    issueDate: '2023-11-14',
    maturityDate: '2026-11-14', // 15 days from local date
    maturityAmount: 7420000,
    status: 'Approaching Maturity',
    bankVerificationStatus: 'Verified',
    riskScore: 35,
    riskCategory: 'Low',
    riskIssues: [
      {
        id: 'r7',
        title: 'Maturity Approaching in 15 Days',
        field: 'Maturity Date (14-Nov-2026)',
        evidence: 'Indian Bank CBS confirms status Active, maturing in 15 days.',
        whyItMatters: 'Standard regulatory advance notice window (15-day milestone).',
        recommendedAction: 'Automated notification scheduled to be queued.',
        severity: 'Low'
      }
    ],
    discrepancies: [
      { field: 'FDR Number', ocrValue: '682910482019', bankValue: '682910482019', status: 'Match', severity: 'Low' }
    ],
    ocrConfidence: {
      fdrNumber: 99.5,
      principalAmount: 98.9,
      interestRate: 98.0,
      issueDate: 99.2,
      maturityDate: 98.8,
      accountHolder: 97.1,
      bankName: 99.8
    },
    lienMarked: true,
    lienBeneficiary: 'AICTE Southern Regional Office',
    daysToMaturity: 15,
    documentName: 'IndianBank_Term_Deposit_Receipt_682910.pdf',
    auditTrail: [
      { id: 'a13', action: 'Verified & Active', performedBy: 'Dr. Aravind Swaminathan', role: 'Officer', timestamp: '2024-01-20 04:00 PM' }
    ]
  },
  {
    id: 'FDR-UNION-2024-006',
    fdrNumber: '492019384729-PENDING',
    institutionId: 'inst-1',
    institutionName: 'Apex Institute of Technology & Engineering',
    institutionCode: 'INST-AICTE-TN-0492',
    bankName: 'Union Bank of India',
    bankCode: 'UNION',
    branchName: 'Mount Road Main Branch, Chennai',
    ifscCode: 'UBIN0531235',
    accountHolder: 'Apex Institute of Technology Joint FDR',
    principalAmount: 4500000,
    interestRate: 7.15,
    issueDate: '2024-06-01',
    maturityDate: '2027-06-01',
    maturityAmount: 5560000,
    status: 'Pending Verification',
    bankVerificationStatus: 'Confirmation Required',
    riskScore: 62,
    riskCategory: 'Medium',
    riskIssues: [
      {
        id: 'r8',
        title: 'Branch Physical Dual-Sign Token Pending',
        field: 'Branch Authorization Token',
        evidence: 'Union Bank API indicates electronic handshake complete, but physical ledger confirmation token is unconfirmed at zonal clearing.',
        whyItMatters: 'Dual authorization required for deposits exceeding ₹25 Lakhs per Reserve Bank of India circular RBI/2023/18.',
        recommendedAction: 'Trigger automated branch reminder request or accept physical token upload from institution.',
        severity: 'Medium'
      }
    ],
    discrepancies: [
      { field: 'Branch Dual-Auth Token', ocrValue: 'Stamped on Verso', bankValue: 'Pending Zonal Entry', status: 'Pending', severity: 'Medium' }
    ],
    ocrConfidence: {
      fdrNumber: 98.4,
      principalAmount: 99.0,
      interestRate: 97.5,
      issueDate: 98.8,
      maturityDate: 98.2,
      accountHolder: 96.5,
      bankName: 99.1
    },
    lienMarked: true,
    lienBeneficiary: 'AICTE New Delhi',
    daysToMaturity: 580,
    documentName: 'UBI_Deposit_Receipt_492019.pdf',
    auditTrail: [
      { id: 'a14', action: 'Uploaded by Institution', performedBy: 'Dr. Meenakshi Raman', role: 'Institution', timestamp: '2024-06-05 02:15 PM' },
      { id: 'a15', action: 'Awaiting Bank Zonal Confirmation', performedBy: 'Union Bank Adapter', role: 'Bank Adapter', timestamp: '2024-06-05 02:40 PM' }
    ]
  },
  {
    id: 'FDR-ICICI-2024-007',
    fdrNumber: '001928472910',
    institutionId: 'inst-5',
    institutionName: 'Bengaluru Institute of Artificial Intelligence',
    institutionCode: 'INST-AICTE-KA-0919',
    bankName: 'ICICI Bank',
    bankCode: 'ICICI',
    branchName: 'Koramangala 4th Block, Bengaluru',
    ifscCode: 'ICIC0000047',
    accountHolder: 'Bengaluru AI Research Foundation',
    principalAmount: 8500000,
    interestRate: 7.30,
    issueDate: '2023-11-29',
    maturityDate: '2026-11-29', // 30 days from local date
    maturityAmount: 10520000,
    status: 'Approaching Maturity',
    bankVerificationStatus: 'Verified',
    riskScore: 25,
    riskCategory: 'Low',
    riskIssues: [
      {
        id: 'r9',
        title: '30-Day Advance Maturity Window',
        field: 'Maturity Date (29-Nov-2026)',
        evidence: 'ICICI Corporate Banking API verifies pristine standing and lien record.',
        whyItMatters: 'First tier automated notification threshold.',
        recommendedAction: 'Automated 30-day email notification queued.',
        severity: 'Low'
      }
    ],
    discrepancies: [
      { field: 'FDR Number', ocrValue: '001928472910', bankValue: '001928472910', status: 'Match', severity: 'Low' }
    ],
    ocrConfidence: {
      fdrNumber: 99.8,
      principalAmount: 99.4,
      interestRate: 98.9,
      issueDate: 99.6,
      maturityDate: 99.5,
      accountHolder: 98.7,
      bankName: 99.9
    },
    lienMarked: true,
    lienBeneficiary: 'AICTE New Delhi',
    daysToMaturity: 30,
    documentName: 'ICICI_Fixed_Deposit_Advice_001928.pdf',
    auditTrail: [
      { id: 'a16', action: 'Verified & Active', performedBy: 'Dr. Aravind Swaminathan', role: 'Officer', timestamp: '2023-12-05 11:30 AM' }
    ]
  }
];

export const MOCK_BANKS_INFO = [
  { code: 'SBI', name: 'State Bank of India', icon: '🏛️', status: 'Active (Online)', latency: '42ms', verifiedCount: 420, activeFDRs: 142 },
  { code: 'INDIAN_BANK', name: 'Indian Bank', icon: '🏦', status: 'Active (Online)', latency: '58ms', verifiedCount: 280, activeFDRs: 98 },
  { code: 'CANARA', name: 'Canara Bank', icon: '🏢', status: 'Active (Online)', latency: '65ms', verifiedCount: 310, activeFDRs: 112 },
  { code: 'BOB', name: 'Bank of Baroda', icon: '🏛️', status: 'Active (Online)', latency: '72ms', verifiedCount: 195, activeFDRs: 64 },
  { code: 'UNION', name: 'Union Bank of India', icon: '🏢', status: 'Active (Online)', latency: '81ms', verifiedCount: 160, activeFDRs: 53 },
  { code: 'HDFC', name: 'HDFC Bank', icon: '🏦', status: 'Active (Online)', latency: '35ms', verifiedCount: 540, activeFDRs: 180 },
  { code: 'ICICI', name: 'ICICI Bank', icon: '🏢', status: 'Active (Online)', latency: '38ms', verifiedCount: 490, activeFDRs: 165 },
  { code: 'AXIS', name: 'Axis Bank', icon: '🏛️', status: 'Active (Online)', latency: '46ms', verifiedCount: 380, activeFDRs: 124 }
];
