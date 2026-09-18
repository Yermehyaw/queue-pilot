import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import type {
  BranchPost, DocRecord, DocStatus, InboxMessage, ScheduledPost, Ticket,
  TicketStatus, TimeSlot, ToastMsg, VaultItem, ContentIdea, DocType,
} from '../types';
import { BRANCHES, SERVICES, branchById, serviceById } from './data';
import { addMinutesToTime, hashStr, pseudoRandom, timeAgo, todayISO, uid } from './utils';

const HOUR = 3600_000;
const DAY = 24 * HOUR;
const NOW = Date.now();

/* ---------------------------------- seed tickets ---------------------------------- */
function seedLiveTickets(): Ticket[] {
  const tickets: Ticket[] = [];
  const names: [string, string][] = [
    ['Adaeze Okafor', '0803 214 8890'], ['Tunde Bakare', '0805 771 2231'], ['Fatima Bello', '0812 900 4455'],
    ['Chidi Eze', '0703 118 9920'], ['Ngozi Adeyemi', '0807 332 1109'], ['Emeka Nwosu', '0810 556 7743'],
    ['Aisha Garba', '0902 441 8832'], ['Segun Alabi', '0809 673 2210'], ['Blessing Udo', '0814 229 9901'],
    ['Kunle Ajayi', '0705 887 3341'], ['Halima Sani', '0806 112 5567'], ['Peter Obi Jr', '0813 990 2211'],
    ['Mariam Yusuf', '0708 334 7788'], ['David Etim', '0804 556 1122'], ['Grace Nwachukwu', '0811 778 3344'],
    ['Ibrahim Musa', '0903 221 5566'], ['Funke Adeleke', '0802 998 7711'], ['Victor Kanu', '0815 443 2299'],
  ];
  const pickBranches = ['br-victoria', 'br-lekki', 'br-ikeja', 'br-crest-main', 'br-civic', 'br-stmary'];
  let n = 0;
  for (const branchId of pickBranches) {
    const branch = branchById(branchId);
    const services = SERVICES.filter(s => s.institutionId === branch.institutionId);
    if (!services.length) continue;
    const rnd = pseudoRandom(hashStr(branchId));
    const total = 6 + Math.floor(rnd() * 5);
    for (let i = 0; i < total; i++) {
      const [name, phone] = names[(n + i * 3) % names.length];
      const service = services[Math.floor(rnd() * services.length)];
      const hour = 8 + Math.floor(rnd() * 7);
      const min = [0, 10, 20, 30, 40, 50][Math.floor(rnd() * 6)];
      const slot = `${String(hour).padStart(2, '0')}:${String(min).padStart(2, '0')}`;
      const statuses: TicketStatus[] = n + i < 4 ? ['serving', 'called'] : ['booked', 'checked-in', 'booked', 'checked-in', 'done', 'booked'];
      const status = statuses[Math.floor(rnd() * statuses.length)];
      tickets.push({
        id: uid('t'), code: `${branch.code}-${String(20 + i).padStart(3, '0')}`,
        institutionId: branch.institutionId, branchId, serviceId: service.id,
        dateISO: todayISO(0), slot, windowStart: addMinutesToTime(slot, -10), windowEnd: addMinutesToTime(slot, 20),
        name, phone, email: '', notes: '', status,
        createdAt: NOW - Math.floor(rnd() * 5) * HOUR,
        counter: status === 'serving' || status === 'called' ? 1 + Math.floor(rnd() * branch.counters) : undefined,
      });
      n++;
    }
  }
  return tickets;
}

/* ---------------------------------- seed documents ---------------------------------- */
function seedDocs(): DocRecord[] {
  const makers: { fn: string; type: DocType; owner: string; br: string; status: DocStatus; conf: number; ago: number; findings: string[]; revoked?: boolean }[] = [
    { fn: 'national-id_adaeze-okafor.pdf', type: 'National ID', owner: 'Adaeze Okafor', br: 'br-victoria', status: 'verified', conf: 98, ago: 2 * HOUR, findings: [] },
    { fn: 'transcript_chidi-eze_2024.pdf', type: 'Transcript', owner: 'Chidi Eze', br: 'br-crest-main', status: 'verified', conf: 96, ago: 5 * HOUR, findings: [] },
    { fn: 'passport_fatima-bello.pdf', type: 'Passport', owner: 'Fatima Bello', br: 'br-ikeja', status: 'flagged', conf: 71, ago: 7 * HOUR, findings: ['MRZ checksum mismatch on line 2', 'Photo region shows resampling artefacts'] },
    { fn: 'utility-bill_seg-un.pdf', type: 'Utility Bill', owner: 'Segun Alabi', br: 'br-yaba', status: 'verified', conf: 93, ago: 9 * HOUR, findings: [] },
    { fn: 'bank-statement_q2.pdf', type: 'Bank Statement', owner: 'Emeka Nwosu', br: 'br-lekki', status: 'rejected', conf: 34, ago: 12 * HOUR, findings: ['Balance column edited (font mismatch)', 'Missing bank digital seal', 'Statement period inconsistent with metadata'] },
    { fn: 'admission-letter_mariam.pdf', type: 'Admission Letter', owner: 'Mariam Yusuf', br: 'br-northgate', status: 'pending', conf: 0, ago: 1 * HOUR, findings: [] },
    { fn: 'cac-cert_harbor-vendors.pdf', type: 'CAC Certificate', owner: 'Harbor Vendors Ltd', br: 'br-civic', status: 'verifying', conf: 0, ago: 20 * 60_000, findings: [] },
    { fn: 'tax-clearance_2025.pdf', type: 'Tax Clearance', owner: 'Grace Nwachukwu', br: 'br-civic', status: 'pending', conf: 0, ago: 40 * 60_000, findings: [] },
  ];
  return makers.map(m => {
    const branch = branchById(m.br);
    const checks = makeChecks(m.status, m.conf);
    return {
      id: uid('d'), fileName: m.fn, docType: m.type, owner: m.owner,
      institutionId: branch.institutionId, branchId: m.br,
      uploadedAt: NOW - m.ago, sizeKB: 180 + hashStr(m.fn) % 2400,
      status: m.status, confidence: m.conf, checks, findings: m.findings,
      extracted: [
        { label: 'Full name', value: m.owner },
        { label: 'Document no.', value: `NG-${(hashStr(m.fn) % 900000 + 100000)}` },
        { label: 'Issue date', value: new Date(NOW - 300 * DAY).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) },
        { label: 'Issuer', value: issuerFor(m.type) },
      ],
      reviewerNote: m.status === 'rejected' ? 'Customer invited to re-upload an original scan at the branch.' : m.status === 'flagged' ? 'Held for supervisor review — customer notified by SMS.' : '',
    };
  });
}

function issuerFor(t: DocType): string {
  switch (t) {
    case 'National ID': return 'NIMC';
    case 'Passport': return 'Nigeria Immigration Service';
    case 'Transcript': return 'Crestview University Registry';
    case 'Utility Bill': return 'Eko Electricity';
    case 'Bank Statement': return 'MetroTrust Bank';
    case 'Admission Letter': return 'Northgate Polytechnic';
    case 'CAC Certificate': return 'Corporate Affairs Commission';
    case 'Tax Clearance': return 'Lagos State IRS';
  }
}

function makeChecks(status: DocStatus, conf: number) {
  const base = [
    { id: 'auth', label: 'Authenticity scan', detail: 'Security features, seals & microprint' },
    { id: 'tamper', label: 'Tamper detection', detail: 'Pixel-level forgery & edit analysis' },
    { id: 'data', label: 'Data consistency', detail: 'Cross-field & cross-record matching' },
    { id: 'issuer', label: 'Issuer verification', detail: 'Registry lookup with issuing authority' },
    { id: 'face', label: 'Identity match', detail: 'Portrait vs. registry photo comparison' },
  ];
  if (status === 'pending') return base.map(b => ({ ...b, status: 'idle' as const }));
  if (status === 'verifying') return base.map((b, i) => ({ ...b, status: (i < 2 ? 'pass' : i === 2 ? 'running' : 'idle') as 'pass' | 'running' | 'idle' }));
  if (status === 'verified') return base.map(b => ({ ...b, status: 'pass' as const }));
  if (status === 'flagged') return base.map((b, i) => ({ ...b, status: (i === 1 || i === 4 ? 'warn' : 'pass') as 'warn' | 'pass' }));
  return base.map((b, i) => ({ ...b, status: (i === 0 || i === 1 ? 'fail' : i === 3 ? 'warn' : 'pass') as 'fail' | 'warn' | 'pass' }));
}

/* ---------------------------------- seed branch feed ---------------------------------- */
function seedPosts(): BranchPost[] {
  const P = (p: Partial<BranchPost> & Pick<BranchPost, 'type' | 'title' | 'body' | 'author' | 'role' | 'branchId'>): BranchPost => ({
    id: uid('p'), createdAt: NOW - Math.floor(Math.random() * 60) * HOUR, tags: [], likes: 4 + Math.floor(Math.random() * 30),
    liked: false, bookmarked: false, comments: [], ...p,
  } as BranchPost);
  return [
    P({
      type: 'lesson', title: 'Why our Saturday queue collapsed — and the 2-counter fix',
      body: `Last month our Saturday pension queue spilled into the parking lot: 3-hour waits, two fainting scares, and a branch review score that tanked to 61.

Root cause: we kept weekday slot spacing (8 min) on Saturdays when the average pension service takes 19 min. We also funneled all pensioners to one "senior" counter.

The fix that worked: we split pension verification across two counters, stretched Saturday slots to 15 min, and opened a pre-check desk that confirms documents BEFORE a ticket is issued. Saturday wait is now 22 minutes average. Full playbook attached — please steal it.`,
      author: 'Mrs. Funke Adeleke', role: 'Branch Manager', branchId: 'br-yaba',
      tags: ['queues', 'weekend-ops', 'pension'], likes: 48, impact: 'Wait time −78% · CSAT 61 → 89',
      attachment: { name: 'saturday-pension-playbook.pdf', kind: 'SOP', size: '1.2 MB' },
      comments: [
        { id: uid('c'), author: 'T. Bakare', branchId: 'br-ikeja', text: 'Adopted the pre-check desk last week — no-show rate dropped immediately. Thank you!', createdAt: NOW - 5 * HOUR },
        { id: uid('c'), author: 'H. Sani', branchId: 'br-surulere', text: 'Did you need extra headcount for the second counter, or did you re-roster?', createdAt: NOW - 3 * HOUR },
      ],
    }),
    P({
      type: 'strategy', title: 'How Lekki hit 96: the "10-minute promise" playbook',
      body: `Our branch score went from 82 to 96 in one quarter. The single biggest lever: a public "10-minute promise" — any customer waiting more than 10 minutes past their slot window gets a supervisor callback the same day.

What made it real:
1. Live wallboard the whole floor can see (no hiding).
2. Float teller who opens only when the board turns amber.
3. End-of-day 5-minute huddle on every breach.

Callbacks feel expensive until you see what they do to Google reviews. Happy to walk any branch through our huddle format.`,
      author: 'Emeka Nwosu', role: 'Head of Service', branchId: 'br-lekki',
      tags: ['service-recovery', 'csat', 'huddles'], likes: 62, impact: 'Branch score 82 → 96 · Reviews 4.1 → 4.8',
    }),
    P({
      type: 'alert', title: 'Fraud pattern: edited bank statements at loan desks',
      body: `Heads up to all loan and account desks: in the last 10 days, three branches have seen bank statements with edited balance columns — same font mismatch, missing digital seal.

Please route ALL statements through Verify before approval, even for returning customers. Two cases are now with Risk. If you spot the pattern, tag #fraud-watch so we can track it centrally.`,
      author: 'Risk & Compliance Desk', role: 'Central Risk', branchId: 'br-victoria',
      tags: ['fraud-watch', 'verify', 'loans'], likes: 71,
      comments: [
        { id: uid('c'), author: 'A. Okafor', branchId: 'br-victoria', text: 'Caught one this morning thanks to this alert. Verify flagged it in seconds.', createdAt: NOW - 6 * HOUR },
      ],
    }),
    P({
      type: 'resource', title: 'Template: end-of-day queue report (auto-fills from QueuePilot)',
      body: `Sharing the one-page EOD report our supervisors use. It pulls served count, average wait, no-shows and breaches automatically — supervisors just add a one-line narrative.

Regional office now accepts this as the official daily return, so it replaces the old spreadsheet. Takes ~3 minutes to complete.`,
      author: 'Segun Alabi', role: 'Operations Lead', branchId: 'br-ikeja',
      tags: ['reporting', 'template'], likes: 35,
      attachment: { name: 'eod-queue-report-template.xlsx', kind: 'Template', size: '84 KB' },
    }),
    P({
      type: 'win', title: 'Crestview Registry cleared a 400-person backlog in 6 days',
      body: `Transcript season nearly broke us — 400+ students queued for verification letters. We moved the whole cohort to timed QueuePilot slots, verified documents the night before, and opened a collection-only window.

Result: backlog cleared in 6 working days, zero overnight queues, and the student union actually sent us a thank-you note. First time in school history, I believe.`,
      author: 'Dr. Ngozi Adeyemi', role: 'Registrar', branchId: 'br-crest-main',
      tags: ['transcripts', 'backlog'], likes: 89, impact: '400+ cleared · 0 overnight queues',
    }),
    P({
      type: 'strategy', title: 'Floating staff by live load, not by roster',
      body: `We stopped rostering counters a month ago. Instead, two "float" staff start each day on back-office work and open counters 7 and 8 only when live load hits amber. QueuePilot's load indicator is the trigger — no manager judgment call needed.

Counter-hours are down 11% while throughput is up. Biggest lesson: publish the float rules so staff don't feel ambushed.`,
      author: 'Kunle Ajayi', role: 'Branch Manager', branchId: 'br-lekki',
      tags: ['staffing', 'efficiency'], likes: 41,
    }),
    P({
      type: 'lesson', title: 'We turned off SMS reminders to save money. No-shows doubled.',
      body: `Cost-saving idea that backfired: we disabled SMS reminders for a fortnight. No-show rate went from 6% to 13%, and the "saved" SMS cost was wiped out many times over by idle counter time.

Reminders are back on, and we've switched to WhatsApp templates which cost 60% less. Lesson logged: never cut the reminder, cut the channel cost instead.`,
      author: 'Halima Sani', role: 'Service Supervisor', branchId: 'br-surulere',
      tags: ['no-shows', 'reminders', 'cost'], likes: 54, impact: 'No-shows 13% → 5% after WhatsApp switch',
    }),
  ];
}

function seedVault(): VaultItem[] {
  const V = (name: string, kind: VaultItem['kind'], branchId: string, agoDays: number, dl: number, size: string): VaultItem =>
    ({ id: uid('v'), name, kind, branchId, updatedAt: NOW - agoDays * DAY, downloads: dl, size });
  return [
    V('Saturday Pension Queue Playbook', 'SOP', 'br-yaba', 4, 132, '1.2 MB'),
    V('End-of-Day Queue Report Template', 'Template', 'br-ikeja', 9, 214, '84 KB'),
    V('10-Minute Promise Huddle Guide', 'Training', 'br-lekki', 12, 98, '2.4 MB'),
    V('Fraud-Watch: Edited Statement Red Flags', 'Report', 'br-victoria', 2, 187, '640 KB'),
    V('Float-Staff Trigger Rules', 'Policy', 'br-lekki', 16, 76, '210 KB'),
    V('Transcript Season Runbook', 'SOP', 'br-crest-main', 21, 143, '1.8 MB'),
    V('WhatsApp Reminder Template Pack', 'Template', 'br-surulere', 6, 167, '96 KB'),
  ];
}

/* ---------------------------------- seed social ---------------------------------- */
function seedInbox(): InboxMessage[] {
  const M = (m: Partial<InboxMessage> & Pick<InboxMessage, 'channel' | 'author' | 'authorHandle' | 'text' | 'sentiment' | 'intent'>): InboxMessage => ({
    id: uid('m'), receivedAt: NOW - Math.floor(Math.random() * 20) * HOUR, status: 'open', priority: 3, replies: [], ...m,
  } as InboxMessage);
  return [
    M({ channel: 'x', author: 'Daniel O.', authorHandle: '@daniel_o', text: 'Been waiting 2hrs at your Ikeja branch?? This is unacceptable. Ticket A118 and the board has not moved in 40 mins.', sentiment: 'urgent', intent: 'Complaint · queue delay', priority: 5 }),
    M({ channel: 'instagram', author: 'beautybyzara', authorHandle: '@beautybyzara', text: 'Hi! Do I need to book online before coming to open a student account, or can I just walk in? 🎓', sentiment: 'neutral', intent: 'Question · account opening', priority: 3 }),
    M({ channel: 'facebook', author: 'Musa Ibrahim', authorHandle: 'Musa Ibrahim', text: 'My mother is 74 and cannot stand in queues. Is there a priority window for elderly customers on pension days?', sentiment: 'neutral', intent: 'Question · accessibility', priority: 4 }),
    M({ channel: 'x', author: 'Tech Sis', authorHandle: '@techsis_ng', text: 'Shoutout to the Lekki branch — booked a slot for 10:40, got called at 10:43. This is how banking should work 👏', sentiment: 'positive', intent: 'Praise · service', priority: 2 }),
    M({ channel: 'linkedin', author: 'Chiamaka Eze', authorHandle: 'Chiamaka Eze', text: 'Interested in your SME loan clinic for our staff cooperative. Who can we speak with about a group session?', sentiment: 'neutral', intent: 'Lead · SME clinic', priority: 4 }),
    M({ channel: 'tiktok', author: 'campusvibes', authorHandle: '@campusvibes', text: 'POV: you booked your transcript slot online and walked past a 200-person line 😭🔥 best decision ever', sentiment: 'positive', intent: 'Praise · UGC mention', priority: 2 }),
    M({ channel: 'instagram', author: 'jide.fx', authorHandle: '@jide.fx', text: 'Your app says my document verification failed but I uploaded a clear scan. What exactly is wrong with it??', sentiment: 'negative', intent: 'Complaint · verification', priority: 5 }),
    M({ channel: 'facebook', author: 'Mrs. Okonkwo', authorHandle: 'Mrs. Okonkwo', text: 'Please what are your Saturday opening hours for the Yaba branch? And do pensioners need tickets?', sentiment: 'neutral', intent: 'Question · hours', priority: 3 }),
    M({ channel: 'x', author: 'Dele B.', authorHandle: '@dele_b', text: 'Third time this month your ATM at Allen is out of service. Fix it or stop advertising 24/7 banking.', sentiment: 'negative', intent: 'Complaint · ATM', priority: 4 }),
    M({ channel: 'linkedin', author: 'HR Collective', authorHandle: 'HR Collective', text: 'Great initiative on the financial literacy tour. Would love to partner for our Q4 staff wellness week.', sentiment: 'positive', intent: 'Partnership enquiry', priority: 3 }),
  ];
}

function seedSchedule(): ScheduledPost[] {
  const S = (s: Partial<ScheduledPost> & Pick<ScheduledPost, 'channels' | 'text' | 'scheduledAt' | 'status' | 'author'>): ScheduledPost =>
    ({ id: uid('s'), ...s } as ScheduledPost);
  return [
    S({ channels: ['instagram', 'facebook', 'tiktok'], text: '⏰ PSA: Saturday pension queues are now timed slots! Book online, arrive 10 mins before your window, and skip the line entirely. Link in bio 👆 #NoMoreQueues', scheduledAt: NOW + 3 * HOUR, status: 'scheduled', author: 'Adaeze M.' }),
    S({ channels: ['x', 'linkedin'], text: 'Our Lekki branch just hit a 96 service score — with a public 10-minute promise to every customer. Here is the playbook our teams share across branches 🧵', scheduledAt: NOW + 9 * HOUR, status: 'scheduled', author: 'Tunde B.' }),
    S({ channels: ['instagram', 'x'], text: 'Behind the counters: meet Funke, who redesigned our Saturday pension queue and cut waits by 78%. 💚 #TeamSpotlight', scheduledAt: NOW + 1 * DAY, status: 'scheduled', author: 'Adaeze M.' }),
    S({ channels: ['linkedin'], text: 'Financial literacy tour: 2,400 students reached this quarter across 6 campuses. Q4 schedule is open for partner schools. 📚', scheduledAt: NOW - 1 * DAY, status: 'published', author: 'Tunde B.', likes: 214, comments: 31, shares: 42 }),
    S({ channels: ['instagram', 'facebook'], text: 'New! Verify your documents from home before your visit — get cleared in minutes and walk straight to your counter. ✅', scheduledAt: NOW - 2 * DAY, status: 'published', author: 'Adaeze M.', likes: 486, comments: 92, shares: 120 }),
    S({ channels: ['tiktok'], text: 'Draft: day-in-the-life of a teller during transcript season 🎬 (needs branch sign-off)', scheduledAt: NOW + 2 * DAY, status: 'draft', author: 'Adaeze M.' }),
  ];
}

/* ---------------------------------- slot engine ---------------------------------- */
export function buildSlots(branchId: string, serviceId: string, dateISO: string): TimeSlot[] {
  const branch = branchById(branchId);
  const service = serviceById(serviceId);
  const slots: TimeSlot[] = [];
  const startH = 8;
  const endH = 15;
  const step = Math.max(10, Math.round(service.durationMins / 2 / 5) * 5);
  const rnd = pseudoRandom(hashStr(branchId + serviceId + dateISO));
  for (let mins = startH * 60; mins <= endH * 60; mins += step) {
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    const time = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
    const capacity = Math.max(2, Math.round(branch.counters * 0.8));
    const peakBoost = (h >= 10 && h <= 12) ? 0.45 : (h >= 13 && h <= 14) ? 0.3 : 0;
    const booked = Math.min(capacity, Math.floor(rnd() * (capacity + 1) * (0.35 + peakBoost) + rnd() * 2));
    const fill = booked / capacity;
    slots.push({
      time, windowStart: addMinutesToTime(time, -10), windowEnd: addMinutesToTime(time, 20),
      capacity, booked, etaWaitMins: Math.round(branch.avgServiceMins * (0.4 + fill * 1.4)),
    });
  }
  return slots;
}

/* ---------------------------------- store ---------------------------------- */
interface AppState {
  view: string;
  setView: (v: string) => void;
  toasts: ToastMsg[];
  toast: (t: Omit<ToastMsg, 'id'>) => void;
  dismissToast: (id: string) => void;
  tickets: Ticket[];
  bookTicket: (t: Omit<Ticket, 'id' | 'code' | 'createdAt' | 'status'>) => Ticket;
  updateTicketStatus: (id: string, status: TicketStatus, extra?: Partial<Ticket>) => void;
  cancelTicket: (id: string) => void;
  queueNow: number;
  docs: DocRecord[];
  activeDocId: string | null;
  setActiveDocId: (id: string | null) => void;
  uploadDoc: (fileName: string, sizeKB: number, docType: DocType, owner: string, branchId: string) => DocRecord;
  runVerification: (id: string) => void;
  decideDoc: (id: string, status: DocStatus, note: string) => void;
  posts: BranchPost[];
  vault: VaultItem[];
  addPost: (p: Omit<BranchPost, 'id' | 'createdAt' | 'likes' | 'liked' | 'bookmarked' | 'comments'>) => void;
  toggleLike: (id: string) => void;
  toggleBookmark: (id: string) => void;
  addComment: (postId: string, text: string) => void;
  addVaultItem: (v: Omit<VaultItem, 'id' | 'updatedAt' | 'downloads'>) => void;
  inbox: InboxMessage[];
  schedule: ScheduledPost[];
  replyToMessage: (id: string, text: string, ai: boolean) => void;
  setMessageStatus: (id: string, status: InboxMessage['status']) => void;
  assignMessage: (id: string, assignee: string) => void;
  addScheduledPost: (p: Omit<ScheduledPost, 'id' | 'status'> & { status?: ScheduledPost['status'] }) => void;
  publishNow: (id: string) => void;
  ideas: ContentIdea[];
  generateIdeas: (topic: string, channel: ContentIdea['channel']) => void;
  useIdea: (id: string) => void;
  role: 'customer' | 'institution' | null;
  setRole: (r: 'customer' | 'institution' | null) => void;
}

const Ctx = createContext<AppState | null>(null);

export function serialCode(branchCode: string, seq: number): string {
  return `${branchCode}-${String(seq).padStart(3, '0')}`;
}

const IDEA_BANK: { hook: string; caption: string; hashtags: string[]; cta: string; bestTime: string }[] = [
  { hook: '“I waited 4 minutes. Total.” — real customer, yesterday', caption: 'Nobody believes it until they try it. Book your slot online, arrive 10 minutes early, and walk past the line. That is the whole trick — timing beats queuing, every single time.', hashtags: ['#NoMoreQueues', '#SmartBanking', '#LifeHacks'], cta: 'Book your slot — link in bio', bestTime: 'Tue · 8:15 AM' },
  { hook: '3 documents that delay 80% of visits (and how to fix it tonight)', caption: 'Most delays are not queues — they are missing papers. 1) A valid ID 2) Proof of address 3) Your reference printout. Upload them tonight with Verify and your visit becomes a 10-minute errand.', hashtags: ['#VerifyFirst', '#AdultingTips', '#HowTo'], cta: 'Verify your documents tonight', bestTime: 'Wed · 6:45 PM' },
  { hook: 'POV: pension day without the 5 AM queue', caption: 'Our Saturday pension slots mean Mama Nkechi arrives at 10:20 for her 10:30 window — sits down, gets served, goes home. Dignity is a scheduled slot. Share this with someone who still queues at dawn.', hashtags: ['#PensionDay', '#DignityFirst', '#Community'], cta: 'Share with a parent', bestTime: 'Fri · 7:30 AM' },
  { hook: 'Meet the team behind the 10-minute promise ⏱️', caption: 'Every branch now displays its live wait time — publicly. If you wait more than 10 minutes past your window, a supervisor calls you back the same day. Accountability you can see from the door.', hashtags: ['#TeamSpotlight', '#CustomerFirst'], cta: 'Meet us at your branch', bestTime: 'Mon · 12:00 PM' },
  { hook: 'Students: transcript season survival guide 🎓', caption: 'Step 1: book a Registry slot. Step 2: verify your documents the night before. Step 3: use the collection-only window. 400 students cleared their backlog in 6 days with this exact routine.', hashtags: ['#TranscriptSeason', '#StudentLife', '#UniHacks'], cta: 'Send this to your coursemate', bestTime: 'Thu · 9:00 AM' },
  { hook: 'What “float staff” means for your wait time', caption: 'When our live board turns amber, extra counters open automatically — no manager meeting required. It is why peak-hour waits fell 40% this quarter. Systems beat stress.', hashtags: ['#BehindTheScenes', '#Operations'], cta: 'See live wait times', bestTime: 'Tue · 1:15 PM' },
];

const REPLY_TEMPLATES = [
  'Thank you for reaching out — a specialist will respond within the hour. Your reference has been logged.',
  'We are sorry about this experience. Please share your ticket code or branch name so we can trace it immediately.',
  'Great question! Yes — you can book online in under a minute, and walk-ins are still welcome subject to availability.',
];

export function timeAgoLive(ts: number): string { return timeAgo(ts); }
export { REPLY_TEMPLATES };

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [view, setView] = useState('home');
  const [role, setRole] = useState<'customer' | 'institution' | null>(null);
  const [toasts, setToasts] = useState<ToastMsg[]>([]);
  const [tickets, setTickets] = useState<Ticket[]>(seedLiveTickets);
  const [docs, setDocs] = useState<DocRecord[]>(seedDocs);
  const [activeDocId, setActiveDocId] = useState<string | null>(null);
  const [posts, setPosts] = useState<BranchPost[]>(seedPosts);
  const [vault, setVault] = useState<VaultItem[]>(seedVault);
  const [inbox, setInbox] = useState<InboxMessage[]>(seedInbox);
  const [schedule, setSchedule] = useState<ScheduledPost[]>(seedSchedule);
  const [ideas, setIdeas] = useState<ContentIdea[]>([]);
  const [queueNow, setQueueNow] = useState(() => 120 + Math.floor(Math.random() * 40));
  const verifyTimers = useRef<Record<string, ReturnType<typeof setTimeout>[]>>({});

  useEffect(() => {
    const t = setInterval(() => setQueueNow(q => Math.max(80, Math.min(240, q + Math.floor(Math.random() * 11) - 5))), 4000);
    return () => clearInterval(t);
  }, []);

  const toast = useCallback((t: Omit<ToastMsg, 'id'>) => {
    const id = uid('toast');
    setToasts(prev => [...prev.slice(-3), { ...t, id }]);
    setTimeout(() => setToasts(prev => prev.filter(x => x.id !== id)), 4200);
  }, []);

  const dismissToast = useCallback((id: string) => setToasts(prev => prev.filter(x => x.id !== id)), []);

  const bookTicket: AppState['bookTicket'] = useCallback((t) => {
    const branch = branchById(t.branchId);
    const existing = tickets.filter(x => x.branchId === t.branchId && x.dateISO === t.dateISO).length;
    const ticket: Ticket = { ...t, id: uid('t'), code: serialCode(branch.code, 41 + existing), createdAt: Date.now(), status: 'booked' };
    setTickets(prev => [ticket, ...prev]);
    return ticket;
  }, [tickets]);

  const updateTicketStatus = useCallback((id: string, status: TicketStatus, extra?: Partial<Ticket>) => {
    setTickets(prev => prev.map(t => t.id === id ? { ...t, status, ...extra } : t));
  }, []);

  const cancelTicket = useCallback((id: string) => {
    setTickets(prev => prev.map(t => t.id === id ? { ...t, status: 'cancelled' } : t));
  }, []);

  const uploadDoc: AppState['uploadDoc'] = useCallback((fileName, sizeKB, docType, owner, branchId) => {
    const branch = branchById(branchId);
    const rec: DocRecord = {
      id: uid('d'), fileName, docType, owner, institutionId: branch.institutionId, branchId,
      uploadedAt: Date.now(), sizeKB, status: 'pending', confidence: 0,
      checks: makeChecks('pending', 0), findings: [],
      extracted: [
        { label: 'Full name', value: owner || '—' },
        { label: 'Document no.', value: `NG-${100000 + Math.floor(Math.random() * 900000)}` },
        { label: 'Issue date', value: new Date(Date.now() - 300 * DAY).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) },
        { label: 'Issuer', value: issuerFor(docType) },
      ],
      reviewerNote: '',
    };
    setDocs(prev => [rec, ...prev]);
    setActiveDocId(rec.id);
    return rec;
  }, []);

  const runVerification = useCallback((id: string) => {
    setDocs(prev => prev.map(d => d.id === id ? { ...d, status: 'verifying', checks: d.checks.map(c => ({ ...c, status: 'idle' as const })) } : d));
    const timers = verifyTimers.current[id] || [];
    timers.forEach(clearTimeout);
    const steps: ReturnType<typeof setTimeout>[] = [];
    const h = hashStr(id + Date.now());
    const outcome: DocStatus = h % 10 < 7 ? 'verified' : h % 10 < 9 ? 'flagged' : 'rejected';
    const conf = outcome === 'verified' ? 91 + (h % 8) : outcome === 'flagged' ? 62 + (h % 14) : 28 + (h % 18);
    const findings = outcome === 'verified' ? [] : outcome === 'flagged'
      ? ['Inconsistent font weight in holder name field', 'Issuer seal partially obscured — manual confirm advised']
      : ['Balance column shows edit artefacts', 'Missing issuer digital seal', 'Metadata date conflicts with stated issue date'];
    for (let i = 0; i < 5; i++) {
      steps.push(setTimeout(() => {
        setDocs(prev => prev.map(d => {
          if (d.id !== id) return d;
          const checks = d.checks.map((c, j) => {
            if (j < i) return { ...c, status: checkOutcomeFor(outcome, j) };
            if (j === i) return { ...c, status: 'running' as const };
            return c;
          });
          return { ...d, checks };
        }));
      }, 500 * i + 200));
    }
    steps.push(setTimeout(() => {
      setDocs(prev => prev.map(d => d.id === id
        ? { ...d, status: outcome, confidence: conf, findings, checks: d.checks.map((c, j) => ({ ...c, status: checkOutcomeFor(outcome, j) })) }
        : d));
    }, 500 * 5 + 400));
    verifyTimers.current[id] = steps;
  }, []);

  const decideDoc = useCallback((id: string, status: DocStatus, note: string) => {
    setDocs(prev => prev.map(d => d.id === id ? { ...d, status, reviewerNote: note } : d));
  }, []);

  const addPost: AppState['addPost'] = useCallback((p) => {
    setPosts(prev => [{ ...p, id: uid('p'), createdAt: Date.now(), likes: 0, liked: false, bookmarked: false, comments: [] }, ...prev]);
  }, []);
  const toggleLike = useCallback((id: string) => {
    setPosts(prev => prev.map(p => p.id === id ? { ...p, liked: !p.liked, likes: p.likes + (p.liked ? -1 : 1) } : p));
  }, []);
  const toggleBookmark = useCallback((id: string) => {
    setPosts(prev => prev.map(p => p.id === id ? { ...p, bookmarked: !p.bookmarked } : p));
  }, []);
  const addComment = useCallback((postId: string, text: string) => {
    setPosts(prev => prev.map(p => p.id === postId
      ? { ...p, comments: [...p.comments, { id: uid('c'), author: 'You', branchId: 'br-victoria', text, createdAt: Date.now() }] }
      : p));
  }, []);
  const addVaultItem: AppState['addVaultItem'] = useCallback((v) => {
    setVault(prev => [{ ...v, id: uid('v'), updatedAt: Date.now(), downloads: 0 }, ...prev]);
  }, []);

  const replyToMessage = useCallback((id: string, text: string, ai: boolean) => {
    setInbox(prev => prev.map(m => m.id === id
      ? { ...m, status: 'resolved', replies: [...m.replies, { id: uid('r'), author: ai ? 'Pulse AI' : 'You', text, createdAt: Date.now(), ai }] }
      : m));
  }, []);
  const setMessageStatus = useCallback((id: string, status: InboxMessage['status']) => {
    setInbox(prev => prev.map(m => m.id === id ? { ...m, status } : m));
  }, []);
  const assignMessage = useCallback((id: string, assignee: string) => {
    setInbox(prev => prev.map(m => m.id === id ? { ...m, assignee } : m));
  }, []);
  const addScheduledPost: AppState['addScheduledPost'] = useCallback((p) => {
    setSchedule(prev => [{ ...p, id: uid('s'), status: p.status || 'scheduled' }, ...prev].sort((a, b) => b.scheduledAt - a.scheduledAt));
  }, []);
  const publishNow = useCallback((id: string) => {
    setSchedule(prev => prev.map(s => s.id === id
      ? { ...s, status: 'published', likes: 12 + Math.floor(Math.random() * 200), comments: 3 + Math.floor(Math.random() * 40), shares: 2 + Math.floor(Math.random() * 60) }
      : s));
  }, []);

  const generateIdeas = useCallback((topic: string, channel: ContentIdea['channel']) => {
    const h = hashStr(topic + channel + Date.now());
    const pick = [0, 1, 2].map(i => IDEA_BANK[(h + i * 2) % IDEA_BANK.length]);
    const topicLine = topic.trim();
    setIdeas(pick.map((b, i) => ({
      id: uid('idea'),
      hook: topicLine ? `${b.hook}` : b.hook,
      caption: topicLine ? `${b.caption}\n\nAngle: ${topicLine}.` : b.caption,
      hashtags: b.hashtags, cta: b.cta, bestTime: b.bestTime, channel,
    })));
  }, []);

  const useIdea = useCallback((id: string) => {
    const idea = ideas.find(i => i.id === id);
    if (!idea) return;
    addScheduledPost({
      channels: [idea.channel],
      text: `${idea.hook}\n\n${idea.caption}\n\n${idea.hashtags.join(' ')}`,
      scheduledAt: Date.now() + 2 * HOUR, author: 'You', status: 'draft',
    });
  }, [ideas, addScheduledPost]);

  const value = useMemo<AppState>(() => ({
    view, setView, role, setRole, toasts, toast, dismissToast, tickets, bookTicket, updateTicketStatus,
    cancelTicket, queueNow, docs, activeDocId, setActiveDocId, uploadDoc, runVerification,
    decideDoc, posts, vault, addPost, toggleLike, toggleBookmark, addComment, addVaultItem,
    inbox, schedule, replyToMessage, setMessageStatus, assignMessage, addScheduledPost,
    publishNow, ideas, generateIdeas, useIdea,
  }), [view, role, toasts, toast, dismissToast, tickets, queueNow, docs, activeDocId, posts, vault, inbox, schedule, ideas,
    bookTicket, updateTicketStatus, cancelTicket, uploadDoc, runVerification, decideDoc, addPost, toggleLike,
    toggleBookmark, addComment, addVaultItem, replyToMessage, setMessageStatus, assignMessage, addScheduledPost, publishNow, generateIdeas, useIdea]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

function checkOutcomeFor(outcome: DocStatus, j: number): 'pass' | 'warn' | 'fail' {
  if (outcome === 'verified') return 'pass';
  if (outcome === 'flagged') return (j === 1 || j === 4) ? 'warn' : 'pass';
  return (j === 0 || j === 1) ? 'fail' : j === 3 ? 'warn' : 'pass';
}

export function useApp(): AppState {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
