import type { Institution, Branch, Service } from '../types';

export const INSTITUTIONS: Institution[] = [
  { id: 'inst-metrotrust', name: 'MetroTrust Bank', short: 'MTB', kind: 'bank', tagline: 'Everyday banking without the banking hall wait', image: '/images/bank.jpg', color: '#0d9488', rating: 4.8, servedThisWeek: 12840 },
  { id: 'inst-harborline', name: 'Harborline Microfinance', short: 'HLM', kind: 'bank', tagline: 'Loans, savings & agent support on your schedule', image: '/images/bank.jpg', color: '#2563eb', rating: 4.6, servedThisWeek: 5210 },
  { id: 'inst-crestview', name: 'Crestview University', short: 'CVU', kind: 'school', tagline: 'Registry, bursary & records — book your visit', image: '/images/campus.jpg', color: '#7c3aed', rating: 4.7, servedThisWeek: 8430 },
  { id: 'inst-northgate', name: 'Northgate Polytechnic', short: 'NGP', kind: 'school', tagline: 'Admissions, transcripts & clearance, queued smartly', image: '/images/campus.jpg', color: '#db2777', rating: 4.5, servedThisWeek: 3960 },
  { id: 'inst-cityhall', name: 'City Civic Center', short: 'CCC', kind: 'civic', tagline: 'Permits, IDs & payments without the line', image: '/images/hospital.jpg', color: '#ea580c', rating: 4.4, servedThisWeek: 6720 },
  { id: 'inst-stmary', name: 'St. Mary Specialist Hospital', short: 'SMH', kind: 'civic', tagline: 'Clinics, labs & records with timed arrival slots', image: '/images/hospital.jpg', color: '#0891b2', rating: 4.9, servedThisWeek: 9840 },
];

export const BRANCHES: Branch[] = [
  { id: 'br-victoria', institutionId: 'inst-metrotrust', name: 'Victoria Island HQ', code: 'VI', address: '1204 Ahmadu Way, Victoria Island', openHours: '8:00 – 16:00', counters: 12, avgServiceMins: 9, performance: 94, load: 'busy' },
  { id: 'br-ikeja', institutionId: 'inst-metrotrust', name: 'Ikeja GRA Branch', code: 'IKJ', address: '45 Allen Avenue, Ikeja', openHours: '8:00 – 16:00', counters: 8, avgServiceMins: 11, performance: 88, load: 'moderate' },
  { id: 'br-lekki', institutionId: 'inst-metrotrust', name: 'Lekki Admiralty Branch', code: 'LKK', address: '21 Admiralty Way, Lekki', openHours: '8:00 – 17:00', counters: 10, avgServiceMins: 8, performance: 96, load: 'moderate' },
  { id: 'br-yaba', institutionId: 'inst-harborline', name: 'Yaba Main', code: 'YB', address: '300 Herbert Macaulay Rd, Yaba', openHours: '8:30 – 16:30', counters: 6, avgServiceMins: 12, performance: 81, load: 'low' },
  { id: 'br-surulere', institutionId: 'inst-harborline', name: 'Surulere Branch', code: 'SU', address: '88 Adeniran Ogunsanya, Surulere', openHours: '8:30 – 16:30', counters: 5, avgServiceMins: 10, performance: 85, load: 'moderate' },
  { id: 'br-crest-main', institutionId: 'inst-crestview', name: 'Registry Hall A', code: 'RG', address: 'Crestview University, Main Campus', openHours: '9:00 – 15:30', counters: 9, avgServiceMins: 14, performance: 90, load: 'busy' },
  { id: 'br-crest-bursary', institutionId: 'inst-crestview', name: 'Bursary Block C', code: 'BU', address: 'Crestview University, East Wing', openHours: '9:00 – 15:00', counters: 6, avgServiceMins: 10, performance: 86, load: 'moderate' },
  { id: 'br-northgate', institutionId: 'inst-northgate', name: 'Admissions Center', code: 'AD', address: 'Northgate Polytechnic, Gate 2', openHours: '9:00 – 16:00', counters: 7, avgServiceMins: 13, performance: 83, load: 'moderate' },
  { id: 'br-civic', institutionId: 'inst-cityhall', name: 'Civic Tower, Floor 2', code: 'CT', address: '1 Independence Blvd', openHours: '8:00 – 15:00', counters: 11, avgServiceMins: 12, performance: 78, load: 'busy' },
  { id: 'br-stmary', institutionId: 'inst-stmary', name: 'Outpatient Pavilion', code: 'OP', address: '14 Medical Road, Ikoyi', openHours: '7:30 – 17:00', counters: 14, avgServiceMins: 15, performance: 92, load: 'moderate' },
];

export const SERVICES: Service[] = [
  { id: 'sv-cash', institutionId: 'inst-metrotrust', name: 'Cash deposit & withdrawal', description: 'Teller transactions above teller-machine limits', durationMins: 8, requiresDocs: ['National ID'], icon: 'banknote' },
  { id: 'sv-account', institutionId: 'inst-metrotrust', name: 'Account opening & KYC', description: 'New accounts, upgrades and mandate updates', durationMins: 22, requiresDocs: ['National ID', 'Utility Bill', 'Passport'], icon: 'idcard' },
  { id: 'sv-loan', institutionId: 'inst-metrotrust', name: 'Loans & advisory desk', description: 'Personal, SME and mortgage consultations', durationMins: 30, requiresDocs: ['National ID', 'Bank Statement'], icon: 'chart' },
  { id: 'sv-cards', institutionId: 'inst-metrotrust', name: 'Cards & e-channels', description: 'ATM cards, token reset, mobile & internet banking', durationMins: 12, requiresDocs: ['National ID'], icon: 'card' },
  { id: 'sv-hb-loan', institutionId: 'inst-harborline', name: 'Micro-loan application', description: 'Group and individual loan onboarding', durationMins: 25, requiresDocs: ['National ID', 'Utility Bill'], icon: 'chart' },
  { id: 'sv-hb-savings', institutionId: 'inst-harborline', name: 'Savings & thrift desk', description: 'Daily contributions, withdrawals and statements', durationMins: 10, requiresDocs: ['National ID'], icon: 'banknote' },
  { id: 'sv-reg', institutionId: 'inst-crestview', name: 'Registry & records', description: 'Transcripts, verification letters, corrections', durationMins: 18, requiresDocs: ['Transcript', 'National ID'], icon: 'file' },
  { id: 'sv-bursary', institutionId: 'inst-crestview', name: 'Bursary & fees', description: 'Tuition payment, receipts and clearance', durationMins: 12, requiresDocs: ['Admission Letter'], icon: 'banknote' },
  { id: 'sv-admit', institutionId: 'inst-northgate', name: 'Admissions & clearance', description: 'Screening, acceptance and departmental clearance', durationMins: 20, requiresDocs: ['Admission Letter', 'Transcript'], icon: 'grad' },
  { id: 'sv-permit', institutionId: 'inst-cityhall', name: 'Permits & licensing', description: 'Business premises, signage and renewals', durationMins: 16, requiresDocs: ['CAC Certificate', 'Tax Clearance'], icon: 'file' },
  { id: 'sv-civic-id', institutionId: 'inst-cityhall', name: 'Resident ID & records', description: 'Registration, renewals and corrections', durationMins: 14, requiresDocs: ['National ID', 'Utility Bill'], icon: 'idcard' },
  { id: 'sv-clinic', institutionId: 'inst-stmary', name: 'General clinic visit', description: 'Consultation with triage and vitals', durationMins: 20, requiresDocs: ['National ID'], icon: 'cross' },
  { id: 'sv-lab', institutionId: 'inst-stmary', name: 'Lab & imaging', description: 'Sample collection, scans and result pickup', durationMins: 15, requiresDocs: [], icon: 'flask' },
];

export const QUICK_ACTIONS = [
  { from: 'MetroTrust · Victoria Island', text: 'Tellers 4–6 now open for SME deposits — book before 13:00', time: '2m' },
  { from: 'Crestview Registry', text: 'Transcript counter wait down to ~12 min for 11:40 slots', time: '18m' },
  { from: 'Civic Tower', text: 'New express window for renewals with verified documents', time: '1h' },
];

export function institutionById(id: string) { return INSTITUTIONS.find(i => i.id === id)!; }
export function branchById(id: string) { return BRANCHES.find(b => b.id === id)!; }
export function serviceById(id: string) { return SERVICES.find(s => s.id === id)!; }
