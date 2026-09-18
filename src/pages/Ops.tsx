import { useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  AlarmClock, ArrowRight, BellRing, CheckCircle2, ChevronRight, Clock, Megaphone,
  MonitorPlay, PhoneCall, Search, ShieldCheck, SkipForward, Timer, UserCheck, Users, XCircle,
} from 'lucide-react';
import { useApp } from '../lib/store';
import { BRANCHES, branchById, institutionById, serviceById } from '../lib/data';
import { prettyDate, timeAgo, todayISO } from '../lib/utils';
import { cn } from '../lib/cn';
import { EmptyState, StatusDot } from '../components/ui';
import { StatusPill } from './Queue';
import type { Ticket, TicketStatus } from '../types';

export default function Ops() {
  const { tickets, updateTicketStatus, queueNow, toast, setView } = useApp();
  const [branchId, setBranchId] = useState('br-victoria');
  const [dateISO, setDateISO] = useState(todayISO(0));
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | TicketStatus>('all');
  const [announce, setAnnounce] = useState('');
  const [announcements, setAnnouncements] = useState<{ text: string; at: number }[]>([
    { text: 'Counters 4–6 now open for SME deposits', at: Date.now() - 42 * 60000 },
  ]);
  const [lastCalled, setLastCalled] = useState<Ticket | null>(null);
  const audioOn = useRef(true);

  const branch = branchById(branchId);
  const list = useMemo(() => tickets
    .filter(t => t.branchId === branchId && t.dateISO === dateISO)
    .filter(t => statusFilter === 'all' || t.status === statusFilter)
    .filter(t => query === '' || (t.code + t.name + t.phone).toLowerCase().includes(query.toLowerCase()))
    .sort((a, b) => a.slot.localeCompare(b.slot)),
    [tickets, branchId, dateISO, statusFilter, query]);

  const stats = useMemo(() => {
    const all = tickets.filter(t => t.branchId === branchId && t.dateISO === dateISO);
    const done = all.filter(t => t.status === 'done').length;
    const waiting = all.filter(t => ['booked', 'checked-in'].includes(t.status)).length;
    const active = all.filter(t => ['called', 'serving'].includes(t.status)).length;
    const noshow = all.filter(t => t.status === 'noshow' || t.status === 'cancelled').length;
    return { total: all.length, done, waiting, active, noshow, progress: all.length ? Math.round((done / all.length) * 100) : 0 };
  }, [tickets, branchId, dateISO]);

  const nextUp = useMemo(() => tickets
    .filter(t => t.branchId === branchId && t.dateISO === dateISO && ['booked', 'checked-in'].includes(t.status))
    .sort((a, b) => a.slot.localeCompare(b.slot))[0], [tickets, branchId, dateISO]);

  function callNext() {
    if (!nextUp) { toast({ title: 'Queue is clear', desc: 'No waiting tickets', tone: 'info' }); return; }
    const counter = 1 + Math.floor(Math.random() * branch.counters);
    updateTicketStatus(nextUp.id, 'called', { calledAt: Date.now(), counter });
    setLastCalled({ ...nextUp, status: 'called', counter });
    if (audioOn.current && 'speechSynthesis' in window) {
      try {
        const u = new SpeechSynthesisUtterance(`Ticket ${nextUp.code}. Please proceed to counter ${counter}.`);
        u.rate = 0.95;
        window.speechSynthesis.cancel();
        window.speechSynthesis.speak(u);
      } catch { /* noop */ }
    }
    toast({ title: `Calling ${nextUp.code}`, desc: `Counter ${counter} · ${nextUp.name}`, tone: 'success' });
  }

  function advance(id: string, to: TicketStatus) {
    const t = tickets.find(x => x.id === id);
    if (!t) return;
    updateTicketStatus(id, to, to === 'serving' ? { counter: t.counter || 1 } : to === 'done' ? { servedAt: Date.now() } : {});
    if (to === 'done') toast({ title: `${t.code} completed`, tone: 'success' });
  }

  function broadcast() {
    if (!announce.trim()) return;
    setAnnouncements(prev => [{ text: announce.trim(), at: Date.now() }, ...prev].slice(0, 5));
    setAnnounce('');
    toast({ title: 'Broadcast to branch displays', tone: 'success' });
  }

  return (
    <div className="min-h-screen bg-ink-950 pb-20 pt-[88px]">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-teal-300">
              <MonitorPlay className="h-4 w-4" /> Operations console
            </p>
            <h1 className="mt-2 font-display text-3xl font-extrabold tracking-tight text-white sm:text-4xl">Run today's queues</h1>
            <p className="mt-2 max-w-xl text-sm text-white/50">Call tickets, manage counters and keep every branch flowing — with voice announcements built in.</p>
          </div>
          <div className="flex items-center gap-2">
            <select value={branchId} onChange={e => setBranchId(e.target.value)}
              className="rounded-xl border border-white/15 bg-white/5 px-3.5 py-2.5 text-[13px] font-bold text-white outline-none focus:border-teal-400 [&>option]:text-slate-900">
              {BRANCHES.map(b => <option key={b.id} value={b.id}>{institutionById(b.institutionId).short} · {b.name}</option>)}
            </select>
            <input type="date" value={dateISO} onChange={e => setDateISO(e.target.value)}
              className="rounded-xl border border-white/15 bg-white/5 px-3.5 py-2.5 text-[13px] font-bold text-white outline-none focus:border-teal-400 [color-scheme:dark]" />
          </div>
        </div>

        {/* stat strip */}
        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {[
            { k: 'Scheduled', v: stats.total, s: 'tickets today', c: 'text-white' },
            { k: 'Waiting', v: stats.waiting, s: 'in queue', c: 'text-amber-300' },
            { k: 'At counters', v: stats.active, s: 'called + serving', c: 'text-sky-300' },
            { k: 'Served', v: stats.done, s: `${stats.progress}% complete`, c: 'text-emerald-300' },
            { k: 'No-show', v: stats.noshow, s: 'missed / cancelled', c: 'text-rose-300' },
            { k: 'Network live', v: queueNow, s: 'across branches', c: 'text-teal-300' },
          ].map(s => (
            <div key={s.k} className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur">
              <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-white/40">{s.k}</p>
              <p className={cn('mt-1 font-display text-2xl font-extrabold', s.c)}>{s.v}</p>
              <p className="text-[11px] text-white/40">{s.s}</p>
            </div>
          ))}
        </div>

        <div className="mt-5 grid gap-5 lg:grid-cols-[1fr_360px]">
          {/* caller panel */}
          <div className="space-y-5">
            <div className="grid gap-5 md:grid-cols-2">
              <div className="rounded-3xl bg-gradient-to-br from-teal-400 to-emerald-500 p-6 text-ink-950 shadow-xl shadow-teal-500/20">
                <p className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.18em] text-ink-900/60"><PhoneCall className="h-4 w-4" /> Next up</p>
                {nextUp ? (
                  <>
                    <p className="mt-2 font-mono text-5xl font-extrabold tracking-tight">{nextUp.code}</p>
                    <p className="mt-1 text-sm font-bold">{nextUp.name} · {serviceById(nextUp.serviceId).name}</p>
                    <p className="text-xs font-semibold opacity-70">Slot {nextUp.slot} · window {nextUp.windowStart}–{nextUp.windowEnd}</p>
                    <button onClick={callNext}
                      className="mt-4 flex w-full items-center justify-center gap-2 rounded-2xl bg-ink-950 px-4 py-3.5 text-sm font-bold text-white transition hover:bg-ink-900">
                      <BellRing className="h-4 w-4" /> Call this ticket
                    </button>
                  </>
                ) : (
                  <>
                    <p className="mt-2 font-display text-2xl font-extrabold">Queue clear 🎉</p>
                    <p className="mt-1 text-sm font-semibold opacity-70">No waiting tickets for {prettyDate(dateISO)}</p>
                    <button onClick={() => setView('queue')} className="mt-4 flex w-full items-center justify-center gap-2 rounded-2xl bg-ink-950/90 px-4 py-3.5 text-sm font-bold text-white">
                      Open booking <ArrowRight className="h-4 w-4" />
                    </button>
                  </>
                )}
              </div>
              <div className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur">
                <p className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.18em] text-white/40"><Megaphone className="h-4 w-4" /> Branch announcements</p>
                <div className="mt-3 flex gap-2">
                  <input value={announce} onChange={e => setAnnounce(e.target.value)} placeholder="e.g. Counter 3 closed for 15 min…"
                    onKeyDown={e => e.key === 'Enter' && broadcast()}
                    className="flex-1 rounded-xl border border-white/15 bg-white/5 px-3.5 py-2.5 text-sm text-white outline-none placeholder:text-white/30 focus:border-teal-400" />
                  <button onClick={broadcast} className="rounded-xl bg-teal-400 px-4 text-sm font-bold text-ink-950 hover:bg-teal-300">Send</button>
                </div>
                <div className="mt-3 space-y-2">
                  {announcements.map((a, i) => (
                    <div key={i} className="rounded-xl bg-white/5 px-3.5 py-2.5 ring-1 ring-white/10">
                      <p className="text-[13px] font-semibold text-white/85">{a.text}</p>
                      <p className="mt-0.5 text-[11px] text-white/35">Broadcast {timeAgo(a.at)} · displays + SMS</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* ticket table */}
            <div className="overflow-hidden rounded-3xl border border-white/10 bg-white/[0.03] backdrop-blur">
              <div className="flex flex-wrap items-center gap-2 border-b border-white/10 p-4">
                <div className="relative min-w-[180px] flex-1 sm:max-w-[260px]">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/30" />
                  <input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search code, name, phone…"
                    className="w-full rounded-xl border border-white/15 bg-white/5 py-2.5 pl-9 pr-3 text-sm text-white outline-none placeholder:text-white/30 focus:border-teal-400" />
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {(['all', 'booked', 'checked-in', 'called', 'serving', 'done'] as const).map(f => (
                    <button key={f} onClick={() => setStatusFilter(f)}
                      className={cn('rounded-full px-2.5 py-1.5 text-[11px] font-bold capitalize',
                        statusFilter === f ? 'bg-teal-400 text-ink-950' : 'bg-white/5 text-white/55 hover:bg-white/10')}>{f}</button>
                  ))}
                </div>
              </div>
              <div className="max-h-[520px] divide-y divide-white/5 overflow-y-auto dark-scroll">
                {list.map(t => <OpsRow key={t.id} t={t} onAdvance={advance} />)}
                {list.length === 0 && (
                  <div className="p-6"><EmptyState icon={<Users className="h-5 w-5 text-slate-400" />} title="No tickets here" desc="Adjust filters or pick another date." /></div>
                )}
              </div>
            </div>
          </div>

          {/* side: counters + verify nudge */}
          <aside className="space-y-5">
            <CounterPanel branchId={branchId} />
            <div className="rounded-3xl bg-white p-5 text-ink-900 shadow-lg">
              <p className="flex items-center gap-1.5 text-sm font-bold"><ShieldCheck className="h-4 w-4 text-violet-600" /> Document desk</p>
              <p className="mt-1 text-[13px] text-slate-500">3 customers waiting on verification. Clear them before their windows.</p>
              <button onClick={() => setView('verify')} className="mt-3 inline-flex items-center gap-1 text-[13px] font-bold text-violet-600 hover:underline">
                Open verification <ChevronRight className="h-4 w-4" />
              </button>
            </div>
            <div className="rounded-3xl border border-white/10 bg-white/5 p-5 backdrop-blur">
              <p className="flex items-center gap-1.5 text-sm font-bold text-white"><Timer className="h-4 w-4 text-amber-300" /> Today's pace</p>
              <div className="mt-3 h-3 overflow-hidden rounded-full bg-white/10">
                <motion.div initial={{ width: 0 }} animate={{ width: `${stats.progress}%` }} className="h-full rounded-full bg-gradient-to-r from-teal-400 to-emerald-400" />
              </div>
              <p className="mt-2 text-xs text-white/50">{stats.done} of {stats.total} served · avg wait ~{branch.avgServiceMins} min · {branch.openHours}</p>
            </div>
          </aside>
        </div>
      </div>

      {/* now-calling overlay toast */}
      <AnimatePresence>
        {lastCalled && (
          <motion.div initial={{ opacity: 0, y: 30, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 30, scale: 0.95 }}
            className="fixed bottom-6 left-1/2 z-[90] w-[min(92vw,480px)] -translate-x-1/2 overflow-hidden rounded-3xl bg-white shadow-2xl">
            <div className="flex items-center gap-4 bg-ink-900 px-5 py-4">
              <span className="relative flex h-11 w-11 items-center justify-center rounded-2xl bg-teal-400 text-ink-950"><BellRing className="h-5 w-5" /></span>
              <div className="flex-1">
                <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-teal-300">Now calling</p>
                <p className="font-mono text-2xl font-extrabold text-white">{lastCalled.code} <span className="font-sans text-sm font-bold text-white/60">→ Counter {lastCalled.counter}</span></p>
              </div>
              <button onClick={() => setLastCalled(null)} className="rounded-full bg-white/10 p-2 text-white/60 hover:bg-white/20"><XCircle className="h-4 w-4" /></button>
            </div>
            <div className="flex gap-2 px-5 py-3">
              <button onClick={() => { advance(lastCalled.id, 'serving'); setLastCalled(null); }} className="flex-1 rounded-xl bg-teal-500 px-3 py-2.5 text-[13px] font-bold text-white hover:bg-teal-400">Start serving</button>
              <button onClick={() => { advance(lastCalled.id, 'noshow'); setLastCalled(null); }} className="rounded-xl border border-slate-200 px-4 py-2.5 text-[13px] font-bold text-slate-500 hover:bg-slate-50">No-show</button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function OpsRow({ t, onAdvance }: { t: Ticket; onAdvance: (id: string, to: TicketStatus) => void }) {
  return (
    <div className="flex flex-wrap items-center gap-3 px-4 py-3 transition hover:bg-white/[0.04]">
      <div className="min-w-[86px]">
        <p className="font-mono text-base font-bold text-white">{t.code}</p>
        <p className="flex items-center gap-1 text-[11px] text-white/40"><Clock className="h-3 w-3" /> {t.slot}</p>
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-[13px] font-bold text-white/90">{t.name}</p>
        <p className="truncate text-[11px] text-white/40">{serviceById(t.serviceId).name} · {t.phone}</p>
      </div>
      <StatusPill status={t.status} />
      <div className="flex gap-1.5">
        {t.status === 'booked' && (
          <RowBtn onClick={() => onAdvance(t.id, 'checked-in')} icon={<UserCheck className="h-3.5 w-3.5" />} label="Check in" />
        )}
        {t.status === 'checked-in' && (
          <RowBtn onClick={() => onAdvance(t.id, 'called')} icon={<BellRing className="h-3.5 w-3.5" />} label="Call" primary />
        )}
        {t.status === 'called' && (
          <>
            <RowBtn onClick={() => onAdvance(t.id, 'serving')} icon={<CheckCircle2 className="h-3.5 w-3.5" />} label={`Serve${t.counter ? ` · C${t.counter}` : ''}`} primary />
            <RowBtn onClick={() => onAdvance(t.id, 'noshow')} icon={<SkipForward className="h-3.5 w-3.5" />} label="Skip" />
          </>
        )}
        {t.status === 'serving' && (
          <RowBtn onClick={() => onAdvance(t.id, 'done')} icon={<CheckCircle2 className="h-3.5 w-3.5" />} label="Complete" primary />
        )}
        {(t.status === 'booked' || t.status === 'checked-in') && (
          <RowBtn onClick={() => onAdvance(t.id, 'noshow')} icon={<AlarmClock className="h-3.5 w-3.5" />} label="No-show" />
        )}
      </div>
    </div>
  );
}

function RowBtn({ onClick, icon, label, primary }: { onClick: () => void; icon: React.ReactNode; label: string; primary?: boolean }) {
  return (
    <button onClick={onClick}
      className={cn('inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-[11px] font-bold transition',
        primary ? 'bg-teal-400 text-ink-950 hover:bg-teal-300' : 'bg-white/10 text-white/70 hover:bg-white/15 hover:text-white')}>
      {icon} {label}
    </button>
  );
}

function CounterPanel({ branchId }: { branchId: string }) {
  const branch = branchById(branchId);
  const { tickets } = useApp();
  const [open, setOpen] = useState<Record<number, boolean>>(() => {
    const o: Record<number, boolean> = {};
    for (let i = 1; i <= branch.counters; i++) o[i] = i <= Math.ceil(branch.counters * 0.7);
    return o;
  });
  useEffect(() => {
    const o: Record<number, boolean> = {};
    for (let i = 1; i <= branch.counters; i++) o[i] = i <= Math.ceil(branch.counters * 0.7);
    setOpen(o);
  }, [branchId, branch.counters]);

  const servingByCounter = useMemo(() => {
    const m: Record<number, Ticket | undefined> = {};
    tickets.filter(t => t.branchId === branchId && (t.status === 'serving' || t.status === 'called')).forEach(t => {
      if (t.counter) m[t.counter] = t;
    });
    return m;
  }, [tickets, branchId]);

  const openCount = Object.values(open).filter(Boolean).length;

  return (
    <div className="rounded-3xl border border-white/10 bg-white/5 p-5 backdrop-blur">
      <div className="flex items-center justify-between">
        <p className="flex items-center gap-1.5 text-sm font-bold text-white"><Users className="h-4 w-4 text-teal-300" /> Counters</p>
        <span className="text-xs font-bold text-white/50">{openCount}/{branch.counters} open</span>
      </div>
      <div className="mt-3 grid grid-cols-2 gap-2">
        {Array.from({ length: branch.counters }, (_, i) => i + 1).map(n => {
          const t = servingByCounter[n];
          const isOpen = open[n];
          return (
            <button key={n} onClick={() => setOpen({ ...open, [n]: !isOpen })}
              className={cn('rounded-2xl p-3 text-left ring-1 transition',
                !isOpen ? 'bg-white/[0.03] ring-white/5 opacity-50' : t ? 'bg-teal-400/10 ring-teal-400/30' : 'bg-white/5 ring-white/10 hover:ring-teal-400/40')}>
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-widest text-white/40">C{n}</span>
                <StatusDot tone={t ? 'bg-teal-400' : isOpen ? 'bg-emerald-400' : 'bg-white/20'} pulse={!!t} />
              </div>
              <p className={cn('mt-1 font-mono text-sm font-bold', t ? 'text-teal-300' : 'text-white/60')}>{t ? t.code : isOpen ? 'Ready' : 'Closed'}</p>
              <p className="truncate text-[10px] text-white/35">{t ? t.name : 'tap to toggle'}</p>
            </button>
          );
        })}
      </div>
    </div>
  );
}

export function useInterval() {
  return null;
}
