export type InstitutionKind = 'bank' | 'school' | 'civic';

export interface Institution {
  id: string;
  name: string;
  short: string;
  kind: InstitutionKind;
  tagline: string;
  image: string;
  color: string;
  rating: number;
  servedThisWeek: number;
}

export interface Branch {
  id: string;
  institutionId: string;
  name: string;
  code: string;
  address: string;
  openHours: string;
  counters: number;
  avgServiceMins: number;
  performance: number;
  load: 'low' | 'moderate' | 'busy';
}

export interface Service {
  id: string;
  institutionId: string;
  name: string;
  description: string;
  durationMins: number;
  requiresDocs: string[];
  icon: string;
}

export type TicketStatus = 'booked' | 'checked-in' | 'called' | 'serving' | 'done' | 'noshow' | 'cancelled';

export interface Ticket {
  id: string;
  code: string;
  institutionId: string;
  branchId: string;
  serviceId: string;
  dateISO: string;
  slot: string;
  windowStart: string;
  windowEnd: string;
  name: string;
  phone: string;
  email: string;
  notes: string;
  status: TicketStatus;
  createdAt: number;
  calledAt?: number;
  servedAt?: number;
  counter?: number;
}

export interface TimeSlot {
  time: string;
  windowStart: string;
  windowEnd: string;
  capacity: number;
  booked: number;
  etaWaitMins: number;
}

export type DocType = 'National ID' | 'Passport' | 'Transcript' | 'Utility Bill' | 'Bank Statement' | 'Admission Letter' | 'CAC Certificate' | 'Tax Clearance';

export type DocStatus = 'pending' | 'verifying' | 'verified' | 'flagged' | 'rejected';

export interface VerificationCheck {
  id: string;
  label: string;
  detail: string;
  status: 'idle' | 'running' | 'pass' | 'warn' | 'fail';
}

export interface DocRecord {
  id: string;
  fileName: string;
  docType: DocType;
  owner: string;
  institutionId: string;
  branchId: string;
  uploadedAt: number;
  sizeKB: number;
  status: DocStatus;
  confidence: number;
  checks: VerificationCheck[];
  findings: string[];
  extracted: { label: string; value: string }[];
  reviewerNote: string;
}

export type PostType = 'strategy' | 'lesson' | 'resource' | 'alert' | 'win';

export interface BranchPost {
  id: string;
  type: PostType;
  title: string;
  body: string;
  author: string;
  role: string;
  branchId: string;
  createdAt: number;
  tags: string[];
  likes: number;
  liked: boolean;
  bookmarked: boolean;
  impact?: string;
  attachment?: { name: string; kind: string; size: string };
  comments: { id: string; author: string; branchId: string; text: string; createdAt: number }[];
}

export interface VaultItem {
  id: string;
  name: string;
  kind: 'SOP' | 'Template' | 'Report' | 'Training' | 'Policy';
  branchId: string;
  updatedAt: number;
  downloads: number;
  size: string;
}

export type SocialChannel = 'instagram' | 'x' | 'facebook' | 'linkedin' | 'tiktok';

export interface SocialAccount {
  channel: SocialChannel;
  handle: string;
  followers: number;
  growthPct: number;
  engagement: number;
}

export interface InboxMessage {
  id: string;
  channel: SocialChannel;
  author: string;
  authorHandle: string;
  text: string;
  receivedAt: number;
  sentiment: 'positive' | 'neutral' | 'negative' | 'urgent';
  intent: string;
  status: 'open' | 'snoozed' | 'resolved';
  assignee?: string;
  priority: number;
  replies: { id: string; author: string; text: string; createdAt: number; ai: boolean }[];
}

export interface ScheduledPost {
  id: string;
  channels: SocialChannel[];
  text: string;
  scheduledAt: number;
  status: 'scheduled' | 'published' | 'draft';
  author: string;
  likes?: number;
  comments?: number;
  shares?: number;
}

export interface ContentIdea {
  id: string;
  hook: string;
  caption: string;
  hashtags: string[];
  cta: string;
  bestTime: string;
  channel: SocialChannel;
}

export interface ToastMsg {
  id: string;
  title: string;
  desc?: string;
  tone: 'success' | 'info' | 'warn' | 'error';
}
