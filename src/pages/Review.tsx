import { useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  BadgeCheck, CheckCircle2, ChevronRight, CircleDashed, ClipboardCheck, CloudUpload,
  FileCheck2, FileText, FileWarning, Hourglass, Loader2, ScanLine, Search, ShieldAlert,
  ShieldCheck, ShieldX, User, XCircle,
} from 'lucide-react';
import { useApp } from '../lib/store';
import { BRANCHES, institutionById, branchById } from '../lib/data';
import { fullDateTime, timeAgo } from '../lib/utils';
import { cn } from '../lib/cn';
import { EmptyState } from '../components/ui';
import type { DocRecord, DocStatus, DocType } from '../types';

const DOC_TYPES: DocType[] = ['National ID', 'Passport', 'Transcript', 'Utility Bill', 'Bank Statement', 'Admission Letter', 'CAC Certificate', 'Tax Clearance'];

const STATUS_META: Record<DocStatus, { label: string; pill: string; Icon: typeof Hourglass }> = {
  pending: { label: 'Awaiting check', pill: 'bg-slate-200 text-slate-600', Icon: Hourglass },
  verifying: { label: 'Verifying…', pill: 'bg-sky-100 text-sky-700', Icon: Loader2 },
  verified: { label: 'Verified', pill: 'bg-emerald-100 text-emerald-700', Icon: BadgeCheck },
  flagged: { label: 'Needs review', pill: 'bg-amber-100 text-amber-700', Icon: FileWarning },
  rejected: { label: 'Rejected', pill: 'bg-rose-100 text-rose-700', Icon: ShieldX },
};

export default function Review() {
  const { docs, activeDocId, setActiveDocId, runVerification, decideDoc, toast } = useApp();
  const [filter, setFilter] = useState<'all' | DocStatus>('all');
  const [query, setQuery] = useState('');
  const [reviewNote, setReviewNote] = useState('');

  const filtered = useMemo(() => docs.filter(d =>
    (filter === 'all' || d.status === filter) &&
    (query === '' || d.fileName.toLowerCase().includes(query.toLowerCase()) || d.owner.toLowerCase().includes(query.toLowerCase()))
  ), [docs, filter, query]);

  const active = docs.find(d => d.id === activeDocId) || filtered[0] || docs[0];

  useEffect(() => {
    if (active && activeDocId !== active.id) setActiveDocId(active.id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filtered.length]);

  useEffect(() => { setReviewNote(active?.reviewerNote || ''); }, [active?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  const counts = useMemo(() => ({
    all: docs.length,
    verified: docs.filter(d => d.status === 'verified').length,
    flagged: docs.filter(d => d.status === 'flagged').length,
    verifying: docs.filter(d => d.status === 'verifying' || d.status === 'pending').length,
    rejected: docs.filter(d => d.status === 'rejected').length,
  }), [docs]);

  return (
    <div className="min-h-screen bg-paper pb-20 pt-[88px]">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-violet-600">Document Review</p>
            <h1 className="mt-2 font-display text-3xl font-extrabold tracking-tight text-ink-900 sm:text-4xl">Review and approve uploaded documents</h1>
            <p className="mt-2 max-w-xl text-sm text-slate-500">Monitor all documents submitted by customers, review system-flagged anomalies, and issue final approvals.</p>
          </div>
          <div className="flex gap-2">
            {[['verified', counts.verified, 'text-emerald-600'], ['flagged', counts.flagged, 'text-amber-600'], ['verifying', counts.verifying, 'text-sky-600']].map(([k, v, c]) => (
              <div key={k as string} className="rounded-2xl bg-white px-4 py-2 text-center shadow-sm ring-1 ring-slate-200">
                <p className={cn('font-display text-xl font-extrabold', c as string)}>{v as number}</p>
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">{k as string}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-[380px_1fr]">
          {/* left: list */}
          <div className="space-y-4">

            <div className="rounded-3xl bg-white p-4 shadow-sm ring-1 ring-slate-200/70">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search files or owners…"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-9 pr-3 text-sm outline-none focus:border-violet-400 focus:bg-white" />
              </div>
              <div className="mt-2.5 flex flex-wrap gap-1.5">
                {(['all', 'pending', 'verifying', 'verified', 'flagged', 'rejected'] as const).map(f => (
                  <button key={f} onClick={() => setFilter(f)}
                    className={cn('rounded-full px-2.5 py-1 text-[11px] font-bold capitalize transition',
                      filter === f ? 'bg-ink-900 text-white' : 'bg-slate-100 text-slate-500 hover:bg-slate-200')}>
                    {f} {f === 'all' ? `(${counts.all})` : ''}
                  </button>
                ))}
              </div>
              <div className="mt-3 max-h-[380px] space-y-2 overflow-y-auto pr-1">
                {filtered.map(d => {
                  const M = STATUS_META[d.status];
                  const isActive = active?.id === d.id;
                  return (
                    <button key={d.id} onClick={() => setActiveDocId(d.id)}
                      className={cn('w-full rounded-2xl border p-3 text-left transition',
                        isActive ? 'border-violet-500 bg-violet-50/60 shadow-sm' : 'border-slate-100 hover:border-slate-300')}>
                      <div className="flex items-center justify-between gap-2">
                        <p className="flex min-w-0 items-center gap-1.5 text-[13px] font-bold text-ink-900">
                          <FileText className="h-4 w-4 shrink-0 text-slate-400" />
                          <span className="truncate">{d.fileName}</span>
                        </p>
                        <ChevronRight className="h-4 w-4 shrink-0 text-slate-300" />
                      </div>
                      <div className="mt-2 flex items-center justify-between">
                        <span className="text-[11px] font-semibold text-slate-400">{d.docType} · {d.owner}</span>
                        <span className={cn('inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold', M.pill)}>
                          <M.Icon className={cn('h-3 w-3', d.status === 'verifying' && 'animate-spin')} /> {M.label}
                        </span>
                      </div>
                    </button>
                  );
                })}
                {filtered.length === 0 && <EmptyState icon={<FileText className="h-5 w-5 text-slate-400" />} title="No documents" desc="Upload a file above to start verification." />}
              </div>
            </div>
          </div>

          {/* right: detail */}
          <div>
            {active ? <DocDetail doc={active} reviewNote={reviewNote} setReviewNote={setReviewNote} /> : (
              <EmptyState icon={<FileCheck2 className="h-6 w-6 text-slate-400" />} title="Select a document" desc="Choose a file from the queue to inspect verification results." />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function DocDetail({ doc, reviewNote, setReviewNote }: { doc: DocRecord; reviewNote: string; setReviewNote: (v: string) => void }) {
  const { runVerification, decideDoc, toast } = useApp();
  const M = STATUS_META[doc.status];
  const confColor = doc.confidence >= 90 ? 'text-emerald-600' : doc.confidence >= 65 ? 'text-amber-600' : 'text-rose-600';
  const ring = doc.confidence >= 90 ? 'stroke-emerald-500' : doc.confidence >= 65 ? 'stroke-amber-400' : 'stroke-rose-500';

  return (
    <motion.div key={doc.id} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="overflow-hidden rounded-3xl bg-white shadow-sm ring-1 ring-slate-200/70">
      <div className="flex flex-wrap items-start justify-between gap-3 bg-ink-900 px-6 py-5">
        <div className="min-w-0">
          <p className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.18em] text-violet-300">
            <FileCheck2 className="h-4 w-4" /> {doc.docType}
          </p>
          <h2 className="mt-1 truncate font-display text-lg font-bold text-white">{doc.fileName}</h2>
          <p className="mt-1 text-xs text-white/55">
            {doc.owner} · {institutionById(doc.institutionId).short} {branchById(doc.branchId).code} · {(doc.sizeKB / 1024).toFixed(1)} MB · uploaded {timeAgo(doc.uploadedAt)} ({fullDateTime(doc.uploadedAt)})
          </p>
        </div>
        <span className={cn('inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold', M.pill)}>
          <M.Icon className={cn('h-4 w-4', doc.status === 'verifying' && 'animate-spin')} /> {M.label}
        </span>
      </div>

      <div className="grid gap-6 p-6 lg:grid-cols-[1fr_260px]">
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-slate-400">Verification checks</p>
          <div className="mt-3 space-y-2.5">
            {doc.checks.map(c => (
              <CheckRow key={c.id} label={c.label} detail={c.detail} status={c.status} />
            ))}
          </div>

          <AnimatePresence>
            {doc.findings.length > 0 && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="overflow-hidden">
                <div className={cn('mt-4 rounded-2xl p-4', doc.status === 'rejected' ? 'bg-rose-50 ring-1 ring-rose-200' : 'bg-amber-50 ring-1 ring-amber-200')}>
                  <p className={cn('flex items-center gap-1.5 text-[13px] font-bold', doc.status === 'rejected' ? 'text-rose-700' : 'text-amber-700')}>
                    <ShieldAlert className="h-4 w-4" /> Findings ({doc.findings.length})
                  </p>
                  <ul className="mt-2 space-y-1.5">
                    {doc.findings.map((f, i) => (
                      <li key={i} className={cn('flex gap-2 text-[13px]', doc.status === 'rejected' ? 'text-rose-600' : 'text-amber-700')}>
                        <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-current" /> {f}
                      </li>
                    ))}
                  </ul>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <p className="mt-5 text-xs font-bold uppercase tracking-widest text-slate-400">Extracted data</p>
          <div className="mt-2.5 grid gap-2 sm:grid-cols-2">
            {doc.extracted.map(e => (
              <div key={e.label} className="rounded-xl bg-slate-50 px-3.5 py-2.5 ring-1 ring-slate-100">
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">{e.label}</p>
                <p className="mt-0.5 text-[13px] font-bold text-ink-900">{e.value}</p>
              </div>
            ))}
          </div>

          {/* reviewer actions */}
          <div className="mt-5 rounded-2xl bg-slate-50 p-4 ring-1 ring-slate-200/60">
            <p className="flex items-center gap-1.5 text-[13px] font-bold text-ink-900"><ClipboardCheck className="h-4 w-4 text-teal-600" /> Reviewer decision</p>
            <textarea value={reviewNote} onChange={e => setReviewNote(e.target.value)} rows={2}
              placeholder="Add a note for the customer or audit trail…"
              className="mt-2.5 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-[13px] outline-none focus:border-teal-400" />
            <div className="mt-2.5 flex flex-wrap gap-2">
              <button onClick={() => { decideDoc(doc.id, 'verified', reviewNote); toast({ title: 'Marked as verified', tone: 'success' }); }}
                className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-500 px-4 py-2 text-[13px] font-bold text-white hover:bg-emerald-400">
                <CheckCircle2 className="h-4 w-4" /> Approve
              </button>
              <button onClick={() => { decideDoc(doc.id, 'flagged', reviewNote); toast({ title: 'Flagged for supervisor review', tone: 'warn' }); }}
                className="inline-flex items-center gap-1.5 rounded-xl bg-amber-400 px-4 py-2 text-[13px] font-bold text-ink-950 hover:bg-amber-300">
                <FileWarning className="h-4 w-4" /> Flag
              </button>
              <button onClick={() => { decideDoc(doc.id, 'rejected', reviewNote); toast({ title: 'Document rejected', desc: 'Customer notified to re-upload', tone: 'error' }); }}
                className="inline-flex items-center gap-1.5 rounded-xl bg-rose-500 px-4 py-2 text-[13px] font-bold text-white hover:bg-rose-400">
                <XCircle className="h-4 w-4" /> Reject
              </button>
              {(doc.status === 'pending' || doc.status === 'flagged' || doc.status === 'rejected') && (
                <button onClick={() => runVerification(doc.id)}
                  className="ml-auto inline-flex items-center gap-1.5 rounded-xl border border-slate-300 px-4 py-2 text-[13px] font-bold text-slate-600 hover:border-violet-400 hover:text-violet-700">
                  <ScanLine className="h-4 w-4" /> Re-run checks
                </button>
              )}
            </div>
          </div>
        </div>

        {/* score rail */}
        <div className="space-y-4">
          <div className="rounded-2xl bg-ink-900 p-5 text-center text-white">
            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-white/45">Confidence score</p>
            <div className="relative mx-auto mt-3 h-32 w-32">
              <svg viewBox="0 0 120 120" className="h-full w-full -rotate-90">
                <circle cx="60" cy="60" r="52" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="10" />
                <motion.circle cx="60" cy="60" r="52" fill="none" strokeWidth="10" strokeLinecap="round"
                  className={doc.status === 'pending' || doc.status === 'verifying' ? 'stroke-sky-400' : ring}
                  strokeDasharray={2 * Math.PI * 52}
                  initial={false}
                  animate={{ strokeDashoffset: 2 * Math.PI * 52 * (1 - (doc.status === 'pending' ? 0 : doc.status === 'verifying' ? 0.35 : doc.confidence / 100)) }}
                  transition={{ duration: 0.8 }} />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                {doc.status === 'pending' ? <CircleDashed className="h-7 w-7 text-white/30" /> :
                  doc.status === 'verifying' ? <Loader2 className="h-7 w-7 animate-spin text-sky-300" /> :
                  <span className={cn('font-display text-3xl font-extrabold', doc.confidence >= 90 ? 'text-emerald-300' : doc.confidence >= 65 ? 'text-amber-300' : 'text-rose-300')}>{doc.confidence}</span>}
                <span className="text-[10px] font-bold uppercase tracking-widest text-white/40">
                  {doc.status === 'pending' ? 'not run' : doc.status === 'verifying' ? 'scanning' : 'out of 100'}
                </span>
              </div>
            </div>
            {doc.status === 'pending' && (
              <button onClick={() => runVerification(doc.id)}
                className="mt-4 w-full rounded-xl bg-violet-500 px-4 py-2.5 text-[13px] font-bold text-white transition hover:bg-violet-400">
                Run verification
              </button>
            )}
            <p className={cn('mt-3 text-[11px] font-bold', confColor === 'text-emerald-600' ? 'text-emerald-300' : 'text-white/40')}>
              {doc.status === 'verified' ? 'Cleared — customer may skip the document desk' :
                doc.status === 'flagged' ? 'Hold — confirm findings before clearing' :
                doc.status === 'rejected' ? 'Blocked — do not accept this document' :
                doc.status === 'verifying' ? 'Checks running — hold on…' : 'Awaiting verification run'}
            </p>
          </div>
          <div className="rounded-2xl bg-white p-4 ring-1 ring-slate-200/70">
            <p className="flex items-center gap-1.5 text-xs font-bold text-ink-900"><User className="h-3.5 w-3.5 text-slate-400" /> Document owner</p>
            <p className="mt-1 text-sm font-bold text-ink-900">{doc.owner}</p>
            <p className="text-xs text-slate-500">{institutionById(doc.institutionId).name} · {branchById(doc.branchId).name}</p>
            <div className="mt-3 flex items-center gap-1.5 rounded-xl bg-emerald-50 p-2.5 text-[11px] font-semibold text-emerald-700 ring-1 ring-emerald-100">
              <ShieldCheck className="h-4 w-4 shrink-0" /> Files are encrypted at rest · full audit trail kept
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function CheckRow({ label, detail, status }: { label: string; detail: string; status: 'idle' | 'running' | 'pass' | 'warn' | 'fail' }) {
  const meta = {
    idle: { bg: 'bg-slate-50 ring-slate-100', Icon: CircleDashed, c: 'text-slate-300', t: 'Queued' },
    running: { bg: 'bg-sky-50 ring-sky-200', Icon: Loader2, c: 'text-sky-500 animate-spin', t: 'Running…' },
    pass: { bg: 'bg-emerald-50/70 ring-emerald-100', Icon: CheckCircle2, c: 'text-emerald-500', t: 'Passed' },
    warn: { bg: 'bg-amber-50 ring-amber-200', Icon: FileWarning, c: 'text-amber-500', t: 'Attention' },
    fail: { bg: 'bg-rose-50 ring-rose-200', Icon: XCircle, c: 'text-rose-500', t: 'Failed' },
  }[status];
  return (
    <div className={cn('flex items-center gap-3 rounded-2xl p-3 ring-1', meta.bg)}>
      <meta.Icon className={cn('h-5 w-5 shrink-0', meta.c)} />
      <div className="min-w-0 flex-1">
        <p className="text-[13px] font-bold text-ink-900">{label}</p>
        <p className="truncate text-[11px] text-slate-500">{detail}</p>
      </div>
      {status === 'running' ? <div className="shimmer h-6 w-16 rounded-lg" /> : (
        <span className="shrink-0 text-[11px] font-bold text-slate-400">{meta.t}</span>
      )}
    </div>
  );
}
