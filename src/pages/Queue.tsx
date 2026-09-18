import { useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  ArrowLeft, ArrowRight, BadgeCheck, BellRing, Building2, CalendarDays, CheckCircle2,
  ChevronRight, Clock, FileText, GraduationCap, HeartPulse, Landmark, MapPin, MonitorPlay,
  Phone, QrCode, Search, ShieldCheck, Star, Ticket as TicketIcon, Timer, User, Users, X,
} from 'lucide-react';
import { useApp, buildSlots } from '../lib/store';
import { BRANCHES, INSTITUTIONS, SERVICES, branchById, institutionById, serviceById } from '../lib/data';
import { addMinutesToTime, prettyDate, timeAgo, todayISO } from '../lib/utils';
import { cn } from '../lib/cn';
import { CopyButton, EmptyState, QrArt } from '../components/ui';
import { serviceIcon } from '../components/icons';
import type { InstitutionKind, Ticket } from '../types';

const KIND_META: Record<InstitutionKind | 'all', { label: string; Icon: typeof Landmark }> = {
  all: { label: 'All', Icon: Building2 },
  bank: { label: 'Banks', Icon: Landmark },
  school: { label: 'Schools', Icon: GraduationCap },
  civic: { label: 'Civic & Health', Icon: HeartPulse },
};

export default function Queue() {
  const { tickets } = useApp();
  const [tab, setTab] = useState<'book' | 'mine' | 'live'>('book');
  const [kind, setKind] = useState<InstitutionKind | 'all'>('all');
  const [query, setQuery] = useState('');
  const [selInst, setSelInst] = useState<string | null>(null);
  const [selBranch, setSelBranch] = useState<string | null>(null);
  const [selService, setSelService] = useState<string | null>(null);
  const [dateISO, setDateISO] = useState(todayISO(1));
  const [selSlot, setSelSlot] = useState<string | null>(null);
  const [form, setForm] = useState({ name: '', phone: '', email: '', notes: '' });
  const [step, setStep] = useState(1);
  const [confirmed, setConfirmed] = useState<Ticket | null>(null);
  const [trackCode, setTrackCode] = useState('');
  const { bookTicket, toast, setView } = useApp();

  const filtered = useMemo(() => INSTITUTIONS.filter(i =>
    (kind === 'all' || i.kind === kind) &&
    (query === '' || i.name.toLowerCase().includes(query.toLowerCase()))
  ), [kind, query]);

  const branches = useMemo(() => BRANCHES.filter(b => b.institutionId === selInst), [selInst]);
  const services = useMemo(() => SERVICES.filter(s => s.institutionId === selInst), [selInst]);
  const slots = useMemo(() => (selBranch && selService ? buildSlots(selBranch, selService, dateISO) : []), [selBranch, selService, dateISO]);
  const branchTicketsToday = useMemo(() => tickets.filter(t => t.branchId === selBranch && t.dateISO === dateISO && t.status !== 'cancelled'), [tickets, selBranch, dateISO]);

  const myTickets = useMemo(() => [...tickets].sort((a, b) => b.createdAt - a.createdAt).slice(0, 12), [tickets]);
  const tracked = useMemo(() => trackCode.trim() === '' ? null :
    tickets.find(t => t.code.toLowerCase() === trackCode.trim().toLowerCase()) || 'missing', [trackCode, tickets]);

  const slotWithLive = useMemo(() => slots.map(s => {
    const extra = branchTicketsToday.filter(t => t.slot === s.time).length;
    return { ...s, booked: Math.min(s.capacity, s.booked + extra) };
  }), [slots, branchTicketsToday]);

  const canNext1 = selInst && selBranch && selService;
  const canNext2 = canNext1 && selSlot;
  const canBook = canNext2 && form.name.trim().length >= 2 && form.phone.trim().length >= 7;

  function resetWizard() {
    setSelInst(null); setSelBranch(null); setSelService(null); setSelSlot(null);
    setStep(1); setForm({ name: '', phone: '', email: '', notes: '' });
  }

  function confirmBooking() {
    if (!canBook || !selInst || !selBranch || !selService || !selSlot) return;
    const t = bookTicket({
      institutionId: selInst, branchId: selBranch, serviceId: selService, dateISO,
      slot: selSlot, windowStart: addMinutesToTime(selSlot, -10), windowEnd: addMinutesToTime(selSlot, 20),
      name: form.name.trim(), phone: form.phone.trim(), email: form.email.trim(), notes: form.notes.trim(),
    });
    setConfirmed(t);
    toast({ title: `Ticket ${t.code} confirmed`, desc: `Arrive ${t.windowStart} – ${t.windowEnd} on ${prettyDate(t.dateISO)}`, tone: 'success' });
  }

  return (
    <div className="min-h-screen bg-paper pb-20 pt-[88px]">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        {/* header */}
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-teal-600">Online queuing</p>
            <h1 className="mt-2 font-display text-3xl font-extrabold tracking-tight text-ink-900 sm:text-4xl">Get your ticket, skip the line</h1>
            <p className="mt-2 max-w-xl text-sm text-slate-500">Book a timed arrival window at any bank, school or civic office. Your ticket tells you exactly when to come.</p>
          </div>
          <div className="flex rounded-2xl bg-white p-1 shadow-sm ring-1 ring-slate-200">
            {([['book', 'Book a visit'], ['mine', 'My tickets'], ['live', 'Live boards']] as const).map(([id, label]) => (
              <button key={id} onClick={() => setTab(id)}
                className={cn('rounded-xl px-4 py-2 text-[13px] font-bold transition', tab === id ? 'bg-ink-900 text-white shadow' : 'text-slate-500 hover:text-ink-900')}>
                {label}
              </button>
            ))}
          </div>
        </div>

        {tab === 'book' && !confirmed && (
          <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_360px]">
            <div className="min-w-0">
              {/* stepper */}
              <div className="flex items-center gap-2 overflow-x-auto pb-1">
                {['Institution & service', 'Date & time', 'Your details'].map((s, i) => (
                  <div key={s} className="flex shrink-0 items-center gap-2">
                    <div className={cn('flex h-8 w-8 items-center justify-center rounded-full text-[13px] font-bold',
                      step > i + 1 ? 'bg-emerald-500 text-white' : step === i + 1 ? 'bg-ink-900 text-white' : 'bg-slate-200 text-slate-500')}>
                      {step > i + 1 ? <CheckCircle2 className="h-4 w-4" /> : i + 1}
                    </div>
                    <span className={cn('whitespace-nowrap text-[13px] font-bold', step === i + 1 ? 'text-ink-900' : 'text-slate-400')}>{s}</span>
                    {i < 2 && <ChevronRight className="ml-2 h-4 w-4 text-slate-300" />}
                  </div>
                ))}
              </div>

              {step === 1 && (
                <div className="mt-5 rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-200/70 sm:p-6">
                  <div className="flex flex-wrap items-center gap-2">
                    {(Object.keys(KIND_META) as (InstitutionKind | 'all')[]).map(k => (
                      <button key={k} onClick={() => setKind(k)}
                        className={cn('inline-flex items-center gap-1.5 rounded-full px-3.5 py-2 text-[12px] font-bold transition',
                          kind === k ? 'bg-ink-900 text-white' : 'bg-slate-100 text-slate-500 hover:bg-slate-200')}>
                        {(() => { const I = KIND_META[k].Icon; return <I className="h-3.5 w-3.5" />; })()}{KIND_META[k].label}
                      </button>
                    ))}
                    <div className="relative ml-auto min-w-[180px] flex-1 sm:max-w-[240px]">
                      <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                      <input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search institutions…"
                        className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-9 pr-3 text-sm outline-none transition focus:border-teal-400 focus:bg-white focus:ring-2 focus:ring-teal-100" />
                    </div>
                  </div>

                  <div className="mt-5 grid gap-4 sm:grid-cols-2">
                    {filtered.map(inst => {
                      const active = selInst === inst.id;
                      return (
                        <button key={inst.id} onClick={() => { setSelInst(inst.id); setSelBranch(null); setSelService(null); }}
                          className={cn('overflow-hidden rounded-2xl text-left ring-2 transition',
                            active ? 'ring-teal-500 shadow-lg shadow-teal-500/10' : 'ring-slate-200/70 hover:ring-slate-300')}>
                          <div className="relative h-28">
                            <img src={inst.image} alt={inst.name} className="h-full w-full object-cover" />
                            <div className="absolute inset-0 bg-gradient-to-t from-ink-950/80 via-ink-950/20 to-transparent" />
                            {active && <span className="absolute right-3 top-3 rounded-full bg-teal-400 p-1.5 text-ink-950"><CheckCircle2 className="h-4 w-4" /></span>}
                            <div className="absolute bottom-2.5 left-3 right-3">
                              <p className="font-display text-[15px] font-bold text-white">{inst.name}</p>
                              <p className="flex items-center gap-2 text-[11px] font-semibold text-white/70">
                                <span className="inline-flex items-center gap-0.5 text-amber-300"><Star className="h-3 w-3 fill-amber-300" />{inst.rating}</span>
                                · {(inst.servedThisWeek / 1000).toFixed(1)}k served/wk
                              </p>
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                  {filtered.length === 0 && <div className="mt-4"><EmptyState icon={<Search className="h-5 w-5 text-slate-400" />} title="No institutions found" desc="Try a different search or category." /></div>}

                  {selInst && (
                    <div className="mt-6 grid gap-6 md:grid-cols-2">
                      <div>
                        <p className="text-xs font-bold uppercase tracking-widest text-slate-400">1 · Choose branch</p>
                        <div className="mt-2.5 space-y-2">
                          {branches.map(b => (
                            <button key={b.id} onClick={() => setSelBranch(b.id)}
                              className={cn('w-full rounded-2xl border p-3.5 text-left transition',
                                selBranch === b.id ? 'border-teal-500 bg-teal-50/60 shadow-sm' : 'border-slate-200 hover:border-slate-300')}>
                              <div className="flex items-center justify-between gap-2">
                                <p className="text-sm font-bold text-ink-900">{b.name}</p>
                                <LoadPill load={b.load} />
                              </div>
                              <p className="mt-1 flex items-center gap-1 text-xs text-slate-500"><MapPin className="h-3 w-3" /> {b.address}</p>
                              <p className="mt-0.5 flex items-center gap-3 text-[11px] font-semibold text-slate-400">
                                <span className="inline-flex items-center gap-1"><Clock className="h-3 w-3" /> {b.openHours}</span>
                                <span className="inline-flex items-center gap-1"><Users className="h-3 w-3" /> {b.counters} counters</span>
                                <span className="inline-flex items-center gap-1"><Timer className="h-3 w-3" /> ~{b.avgServiceMins} min</span>
                              </p>
                            </button>
                          ))}
                        </div>
                      </div>
                      <div>
                        <p className="text-xs font-bold uppercase tracking-widest text-slate-400">2 · Choose service</p>
                        <div className="mt-2.5 space-y-2">
                          {services.map(s => {
                            const Icon = serviceIcon(s.icon);
                            return (
                              <button key={s.id} onClick={() => setSelService(s.id)}
                                className={cn('flex w-full items-start gap-3 rounded-2xl border p-3.5 text-left transition',
                                  selService === s.id ? 'border-teal-500 bg-teal-50/60 shadow-sm' : 'border-slate-200 hover:border-slate-300')}>
                                <span className={cn('flex h-10 w-10 shrink-0 items-center justify-center rounded-xl',
                                  selService === s.id ? 'bg-teal-500 text-white' : 'bg-slate-100 text-slate-500')}><Icon className="h-5 w-5" /></span>
                                <span className="min-w-0">
                                  <span className="block text-sm font-bold text-ink-900">{s.name}</span>
                                  <span className="mt-0.5 block text-xs text-slate-500">{s.description}</span>
                                  <span className="mt-1.5 flex flex-wrap gap-1.5">
                                    <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-500">~{s.durationMins} min</span>
                                    {s.requiresDocs.map(d => <span key={d} className="rounded-full bg-violet-100 px-2 py-0.5 text-[10px] font-bold text-violet-700">{d}</span>)}
                                  </span>
                                </span>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="mt-6 flex justify-end">
                    <button disabled={!canNext1} onClick={() => setStep(2)}
                      className="inline-flex items-center gap-2 rounded-2xl bg-ink-900 px-6 py-3 text-sm font-bold text-white transition enabled:hover:bg-ink-700 disabled:opacity-40">
                      Continue <ArrowRight className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              )}

              {step === 2 && selBranch && selService && (
                <div className="mt-5 rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-200/70 sm:p-6">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className="font-display text-base font-bold text-ink-900">{branchById(selBranch).name}</p>
                      <p className="text-xs text-slate-500">{serviceById(selService).name} · ~{serviceById(selService).durationMins} min per customer</p>
                    </div>
                    <label className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-semibold">
                      <CalendarDays className="h-4 w-4 text-teal-600" />
                      <input type="date" value={dateISO} min={todayISO(0)} max={todayISO(14)} onChange={e => { setDateISO(e.target.value); setSelSlot(null); }}
                        className="bg-transparent text-[13px] font-bold text-ink-900 outline-none" />
                    </label>
                  </div>
                  <div className="mt-4 flex flex-wrap gap-x-5 gap-y-1.5 rounded-2xl bg-slate-50 p-3 text-[11px] font-bold text-slate-500">
                    <span className="inline-flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-emerald-500" /> Plenty of space</span>
                    <span className="inline-flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-amber-400" /> Filling fast</span>
                    <span className="inline-flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-slate-300" /> Full</span>
                    <span className="ml-auto hidden sm:inline">All times are arrival windows (±10 min)</span>
                  </div>
                  <div className="mt-4 grid grid-cols-3 gap-2 sm:grid-cols-4 lg:grid-cols-5">
                    {slotWithLive.map(s => {
                      const full = s.booked >= s.capacity;
                      const fill = s.booked / s.capacity;
                      const active = selSlot === s.time;
                      return (
                        <button key={s.time} disabled={full} onClick={() => setSelSlot(s.time)}
                          className={cn('relative rounded-2xl border p-2.5 text-center transition',
                            active ? 'border-teal-500 bg-teal-500 text-white shadow-lg shadow-teal-500/25' :
                            full ? 'border-slate-100 bg-slate-50 opacity-50' : 'border-slate-200 hover:border-teal-400 hover:shadow-sm')}>
                          <p className={cn('font-mono text-[15px] font-bold', active ? 'text-white' : full ? 'text-slate-400 line-through' : 'text-ink-900')}>{s.time}</p>
                          <p className={cn('mt-0.5 text-[10px] font-bold', active ? 'text-teal-100' : 'text-slate-400')}>
                            {full ? 'Full' : `~${s.etaWaitMins} min wait`}
                          </p>
                          <div className="mx-auto mt-1.5 h-1 w-10 overflow-hidden rounded-full bg-black/10">
                            <div className={cn('h-full rounded-full', active ? 'bg-white' : fill > 0.7 ? 'bg-amber-400' : 'bg-emerald-500')} style={{ width: `${Math.round(fill * 100)}%` }} />
                          </div>
                        </button>
                      );
                    })}
                  </div>
                  <div className="mt-6 flex items-center justify-between">
                    <button onClick={() => setStep(1)} className="inline-flex items-center gap-1.5 rounded-2xl px-4 py-3 text-sm font-bold text-slate-500 hover:bg-slate-100">
                      <ArrowLeft className="h-4 w-4" /> Back
                    </button>
                    <button disabled={!selSlot} onClick={() => setStep(3)}
                      className="inline-flex items-center gap-2 rounded-2xl bg-ink-900 px-6 py-3 text-sm font-bold text-white transition enabled:hover:bg-ink-700 disabled:opacity-40">
                      Continue <ArrowRight className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              )}

              {step === 3 && selBranch && selService && selSlot && (
                <div className="mt-5 rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-200/70 sm:p-6">
                  <div className="grid gap-5 md:grid-cols-2">
                    <div className="space-y-3.5">
                      <Field icon={<User className="h-4 w-4" />} label="Full name *" value={form.name} onChange={v => setForm({ ...form, name: v })} placeholder="e.g. Adaeze Okafor" />
                      <Field icon={<Phone className="h-4 w-4" />} label="Phone (for SMS reminders) *" value={form.phone} onChange={v => setForm({ ...form, phone: v })} placeholder="0803 000 0000" />
                      <Field icon={<BellRing className="h-4 w-4" />} label="Email (optional)" value={form.email} onChange={v => setForm({ ...form, email: v })} placeholder="you@example.com" />
                      <div>
                        <label className="mb-1.5 block text-xs font-bold text-slate-600">Notes for the desk (optional)</label>
                        <textarea value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} rows={3} placeholder="Wheelchair access, interpreter needed…"
                          className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm outline-none transition focus:border-teal-400 focus:bg-white focus:ring-2 focus:ring-teal-100" />
                      </div>
                    </div>
                    <div className="h-fit rounded-2xl bg-ink-900 p-5 text-white">
                      <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-teal-300">Booking summary</p>
                      <p className="mt-2 font-display text-lg font-bold">{institutionById(selInst!).name}</p>
                      <p className="text-xs text-white/60">{branchById(selBranch).name}</p>
                      <div className="mt-4 space-y-2.5 text-[13px]">
                        <SummaryRow k="Service" v={serviceById(selService).name} />
                        <SummaryRow k="Date" v={prettyDate(dateISO)} />
                        <SummaryRow k="Arrive between" v={`${addMinutesToTime(selSlot, -10)} – ${addMinutesToTime(selSlot, 20)}`} hl />
                        <SummaryRow k="Est. wait" v={`~${slotWithLive.find(s => s.time === selSlot)?.etaWaitMins || 10} min`} />
                      </div>
                      <div className="mt-4 rounded-xl bg-white/5 p-3 text-[11px] leading-relaxed text-white/60">
                        <ShieldCheck className="mr-1 inline h-3.5 w-3.5 text-teal-300" />
                        Arrive inside your window and you keep priority. Running late? Your ticket stays valid for 30 min after the window.
                      </div>
                    </div>
                  </div>
                  <div className="mt-6 flex items-center justify-between">
                    <button onClick={() => setStep(2)} className="inline-flex items-center gap-1.5 rounded-2xl px-4 py-3 text-sm font-bold text-slate-500 hover:bg-slate-100">
                      <ArrowLeft className="h-4 w-4" /> Back
                    </button>
                    <button disabled={!canBook} onClick={confirmBooking}
                      className="inline-flex items-center gap-2 rounded-2xl bg-teal-500 px-7 py-3 text-sm font-bold text-white shadow-lg shadow-teal-500/25 transition enabled:hover:bg-teal-400 disabled:opacity-40">
                      <TicketIcon className="h-4 w-4" /> Confirm ticket
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* side rail */}
            <aside className="space-y-4">
              <div className="rounded-3xl bg-ink-900 p-5 text-white shadow-lg">
                <p className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.18em] text-teal-300">
                  <MonitorPlay className="h-4 w-4" /> Track a ticket
                </p>
                <p className="mt-2 text-[13px] text-white/60">Enter your ticket code to see live status.</p>
                <div className="mt-3 flex gap-2">
                  <input value={trackCode} onChange={e => setTrackCode(e.target.value.toUpperCase())} placeholder="e.g. VI-042"
                    className="w-full rounded-xl border border-white/15 bg-white/5 px-3 py-2.5 font-mono text-sm font-bold uppercase outline-none placeholder:font-sans placeholder:font-medium placeholder:normal-case focus:border-teal-400" />
                </div>
                {tracked && tracked !== 'missing' && <TrackedCard t={tracked} />}
                {tracked === 'missing' && <p className="mt-2 rounded-xl bg-rose-500/15 p-2.5 text-xs font-bold text-rose-300">No ticket with that code. Check and try again.</p>}
              </div>
              <div className="rounded-3xl bg-gradient-to-br from-violet-600 to-purple-700 p-5 text-white shadow-lg">
                <FileText className="h-7 w-7 opacity-80" />
                <p className="mt-3 font-display text-base font-bold">Verify docs before you visit</p>
                <p className="mt-1 text-[13px] text-white/75">Upload your ID or transcript tonight — arrive pre-cleared and skip the document desk.</p>
                <button onClick={() => setView('verify')} className="mt-4 w-full rounded-xl bg-white px-4 py-2.5 text-[13px] font-bold text-purple-700 transition hover:bg-purple-50">
                  Open verification
                </button>
              </div>
              <div className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-200/70">
                <p className="text-xs font-bold uppercase tracking-widest text-slate-400">Good to know</p>
                <ul className="mt-3 space-y-2.5 text-[13px] text-slate-600">
                  {[['SMS + WhatsApp reminders', 'Sent 24h and 2h before your window'], ['Free rescheduling', 'Move your slot up to 2h before'], ['Priority windows', 'Elderly, nursing & accessibility needs']].map(([t, d]) => (
                    <li key={t} className="flex gap-2.5">
                      <BadgeCheck className="mt-0.5 h-4 w-4 shrink-0 text-teal-500" />
                      <span><strong className="font-bold text-ink-900">{t}</strong><br /><span className="text-xs text-slate-500">{d}</span></span>
                    </li>
                  ))}
                </ul>
              </div>
            </aside>
          </div>
        )}

        {tab === 'book' && confirmed && (
          <Confirmation ticket={confirmed} onNew={() => { setConfirmed(null); resetWizard(); setTab('mine'); }} onClose={() => { setConfirmed(null); resetWizard(); }} />
        )}

        {tab === 'mine' && (
          <div className="mt-8">
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {myTickets.map(t => <TicketCard key={t.id} t={t} />)}
            </div>
            {myTickets.length === 0 && <EmptyState icon={<TicketIcon className="h-5 w-5 text-slate-400" />} title="No tickets yet" desc="Book your first visit and it will appear here." />}
          </div>
        )}

        {tab === 'live' && <LiveBoards />}
      </div>
    </div>
  );
}

function Field({ icon, label, value, onChange, placeholder }: { icon: React.ReactNode; label: string; value: string; onChange: (v: string) => void; placeholder: string }) {
  return (
    <div>
      <label className="mb-1.5 block text-xs font-bold text-slate-600">{label}</label>
      <div className="relative">
        <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">{icon}</span>
        <input value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
          className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-3 text-sm outline-none transition focus:border-teal-400 focus:bg-white focus:ring-2 focus:ring-teal-100" />
      </div>
    </div>
  );
}

function SummaryRow({ k, v, hl }: { k: string; v: string; hl?: boolean }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-white/50">{k}</span>
      <span className={cn('font-bold', hl ? 'rounded-lg bg-teal-400/15 px-2 py-0.5 font-mono text-teal-300' : 'text-white')}>{v}</span>
    </div>
  );
}

function LoadPill({ load }: { load: 'low' | 'moderate' | 'busy' }) {
  const map = { low: 'bg-emerald-100 text-emerald-700', moderate: 'bg-amber-100 text-amber-700', busy: 'bg-rose-100 text-rose-700' };
  return <span className={cn('shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide', map[load])}>{load}</span>;
}

export function StatusPill({ status }: { status: Ticket['status'] }) {
  const map: Record<Ticket['status'], string> = {
    booked: 'bg-sky-100 text-sky-700', 'checked-in': 'bg-violet-100 text-violet-700',
    called: 'bg-amber-100 text-amber-700', serving: 'bg-teal-100 text-teal-700',
    done: 'bg-emerald-100 text-emerald-700', noshow: 'bg-slate-200 text-slate-600', cancelled: 'bg-rose-100 text-rose-700',
  };
  return <span className={cn('rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide', map[status])}>{status}</span>;
}

function TrackedCard({ t }: { t: Ticket }) {
  const stages: Ticket['status'][] = ['booked', 'checked-in', 'called', 'serving', 'done'];
  const idx = stages.indexOf(t.status === 'noshow' || t.status === 'cancelled' ? 'booked' : t.status);
  return (
    <div className="mt-3 rounded-2xl bg-white/5 p-3.5 ring-1 ring-white/10">
      <div className="flex items-center justify-between">
        <p className="font-mono text-lg font-bold text-white">{t.code}</p>
        <StatusPill status={t.status} />
      </div>
      <p className="mt-1 text-xs text-white/60">{branchById(t.branchId).name} · {serviceById(t.serviceId).name}</p>
      <div className="mt-3 flex items-center gap-1">
        {stages.map((s, i) => (
          <div key={s} className="flex flex-1 items-center gap-1">
            <div className={cn('h-1.5 flex-1 rounded-full', i <= idx ? 'bg-teal-400' : 'bg-white/15')} />
          </div>
        ))}
      </div>
      <p className="mt-2 text-[11px] font-semibold text-white/60">
        {t.status === 'done' ? 'Visit completed. Thank you!' : t.status === 'called' ? `Please proceed to counter ${t.counter || '—'} now.` : t.status === 'serving' ? `Now serving at counter ${t.counter || '—'}.` : `Arrive ${t.windowStart} – ${t.windowEnd} · ${prettyDate(t.dateISO)}`}
      </p>
    </div>
  );
}

function Confirmation({ ticket, onNew, onClose }: { ticket: Ticket; onNew: () => void; onClose: () => void }) {
  const inst = institutionById(ticket.institutionId);
  const branch = branchById(ticket.branchId);
  const service = serviceById(ticket.serviceId);
  return (
    <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} className="mx-auto mt-8 max-w-2xl">
      <div className="overflow-hidden rounded-[28px] bg-white shadow-xl ring-1 ring-slate-200/70">
        <div className="bg-gradient-to-r from-teal-500 to-emerald-500 px-6 py-5 text-white">
          <p className="flex items-center gap-2 text-sm font-bold"><CheckCircle2 className="h-5 w-5" /> Ticket confirmed — see you soon, {ticket.name.split(' ')[0]}!</p>
          <p className="mt-1 text-xs text-white/80">A confirmation SMS and WhatsApp message are on the way to {ticket.phone}.</p>
        </div>
        <div className="grid gap-6 p-6 sm:grid-cols-[1fr_200px]">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-400">{inst.name} · {branch.name}</p>
            <p className="mt-1 font-display text-xl font-bold text-ink-900">{service.name}</p>
            <div className="mt-4 grid grid-cols-2 gap-3">
              <div className="rounded-2xl bg-slate-50 p-3">
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Date</p>
                <p className="mt-0.5 text-sm font-bold text-ink-900">{prettyDate(ticket.dateISO)}</p>
              </div>
              <div className="rounded-2xl bg-slate-50 p-3">
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Ticket</p>
                <p className="mt-0.5 font-mono text-sm font-bold text-ink-900">{ticket.code}</p>
              </div>
              <div className="col-span-2 rounded-2xl bg-teal-50 p-3 ring-1 ring-teal-200">
                <p className="text-[10px] font-bold uppercase tracking-widest text-teal-600">Arrive between</p>
                <p className="mt-0.5 font-display text-2xl font-extrabold text-teal-700">{ticket.windowStart} – {ticket.windowEnd}</p>
              </div>
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              <CopyButton text={`${inst.name} · Ticket ${ticket.code} · ${prettyDate(ticket.dateISO)} · Arrive ${ticket.windowStart}-${ticket.windowEnd} · ${branch.address}`} label="Copy details" />
              <span className="inline-flex items-center gap-1.5 rounded-lg bg-slate-100 px-2.5 py-1.5 text-xs font-semibold text-slate-500">
                <MapPin className="h-3.5 w-3.5" /> {branch.address}
              </span>
            </div>
          </div>
          <div className="flex flex-col items-center justify-center rounded-2xl bg-ink-900 p-5 text-center">
            <QrArt seed={ticket.code} size={130} />
            <p className="mt-3 font-mono text-base font-bold text-white">{ticket.code}</p>
            <p className="mt-1 text-[11px] text-white/50">Scan at the entrance</p>
          </div>
        </div>
        <div className="flex flex-wrap gap-3 border-t border-slate-100 bg-slate-50/60 px-6 py-4">
          <button onClick={onNew} className="inline-flex items-center gap-2 rounded-xl bg-ink-900 px-5 py-2.5 text-sm font-bold text-white hover:bg-ink-700">
            <TicketIcon className="h-4 w-4" /> View my tickets
          </button>
          <button onClick={onClose} className="rounded-xl px-5 py-2.5 text-sm font-bold text-slate-500 hover:bg-slate-100">Book another</button>
        </div>
      </div>
    </motion.div>
  );
}

function TicketCard({ t }: { t: Ticket }) {
  const { cancelTicket, toast } = useApp();
  const inst = institutionById(t.institutionId);
  const branch = branchById(t.branchId);
  const service = serviceById(t.serviceId);
  const [showQr, setShowQr] = useState(false);
  return (
    <div className="overflow-hidden rounded-3xl bg-white shadow-sm ring-1 ring-slate-200/70">
      <div className="flex items-center justify-between bg-ink-900 px-5 py-3">
        <p className="font-mono text-base font-bold text-white">{t.code}</p>
        <StatusPill status={t.status} />
      </div>
      <div className="p-5">
        <p className="font-display text-[15px] font-bold text-ink-900">{service.name}</p>
        <p className="mt-0.5 text-xs text-slate-500">{inst.name} · {branch.name}</p>
        <div className="mt-3 flex items-center gap-4 text-[13px] font-semibold text-slate-600">
          <span className="inline-flex items-center gap-1.5"><CalendarDays className="h-4 w-4 text-teal-500" /> {prettyDate(t.dateISO)}</span>
          <span className="inline-flex items-center gap-1.5"><Clock className="h-4 w-4 text-teal-500" /> {t.windowStart}–{t.windowEnd}</span>
        </div>
        <p className="mt-1.5 text-xs text-slate-400">{t.name} · booked {timeAgo(t.createdAt)}</p>
        <div className="mt-4 flex gap-2">
          <button onClick={() => setShowQr(!showQr)} className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-ink-900 px-3 py-2.5 text-xs font-bold text-white hover:bg-ink-700">
            <QrCode className="h-4 w-4" /> {showQr ? 'Hide code' : 'Show QR'}
          </button>
          {(t.status === 'booked' || t.status === 'checked-in') && (
            <button onClick={() => { cancelTicket(t.id); toast({ title: `Ticket ${t.code} cancelled`, tone: 'info' }); }}
              className="inline-flex items-center gap-1 rounded-xl border border-slate-200 px-3 py-2.5 text-xs font-bold text-slate-500 hover:border-rose-300 hover:text-rose-600">
              <X className="h-4 w-4" /> Cancel
            </button>
          )}
        </div>
        <AnimatePresence>
          {showQr && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
              <div className="mt-3 flex items-center gap-3 rounded-2xl bg-ink-900 p-3">
                <QrArt seed={t.code} size={76} />
                <p className="text-[11px] leading-relaxed text-white/60">Show this at the entrance scanner. Arrive between <strong className="text-teal-300">{t.windowStart} – {t.windowEnd}</strong> to keep priority.</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

function LiveBoards() {
  const { tickets, queueNow } = useApp();
  const [branchId, setBranchId] = useState('br-victoria');
  const branch = branchById(branchId);
  const list = tickets.filter(t => t.branchId === branchId && ['called', 'serving', 'checked-in', 'booked'].includes(t.status)).slice(0, 10);
  const nowServing = list.filter(t => t.status === 'serving' || t.status === 'called');
  return (
    <div className="mt-8 grid gap-6 lg:grid-cols-[320px_1fr]">
      <div className="h-fit rounded-3xl bg-white p-4 shadow-sm ring-1 ring-slate-200/70">
        <p className="px-1 text-xs font-bold uppercase tracking-widest text-slate-400">Select branch board</p>
        <div className="mt-2 max-h-[420px] space-y-1.5 overflow-y-auto">
          {BRANCHES.map(b => (
            <button key={b.id} onClick={() => setBranchId(b.id)}
              className={cn('w-full rounded-2xl p-3 text-left transition', branchId === b.id ? 'bg-ink-900 text-white shadow' : 'hover:bg-slate-50')}>
              <div className="flex items-center justify-between gap-2">
                <p className={cn('text-[13px] font-bold', branchId === b.id ? 'text-white' : 'text-ink-900')}>{institutionById(b.institutionId).short} · {b.name}</p>
                <LoadPill load={b.load} />
              </div>
              <p className={cn('mt-0.5 text-[11px]', branchId === b.id ? 'text-white/55' : 'text-slate-400')}>~{b.avgServiceMins} min avg · {b.counters} counters</p>
            </button>
          ))}
        </div>
      </div>
      <div className="overflow-hidden rounded-3xl bg-ink-950 shadow-xl">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 px-6 py-4">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-teal-300">Live now · {branch.name}</p>
            <p className="mt-0.5 font-display text-lg font-bold text-white">{institutionById(branch.institutionId).name}</p>
          </div>
          <span className="inline-flex items-center gap-2 rounded-full bg-emerald-400/10 px-3 py-1.5 text-xs font-bold text-emerald-300">
            <span className="relative h-2 w-2 rounded-full bg-emerald-400 live-dot" /> {queueNow} in queues network-wide
          </span>
        </div>
        <div className="grid gap-4 p-6 md:grid-cols-2">
          <div className="rounded-2xl bg-white/5 p-5 ring-1 ring-white/10">
            <p className="text-xs font-bold uppercase tracking-widest text-white/40">Now serving</p>
            <div className="mt-3 space-y-2.5">
              {nowServing.length === 0 && <p className="text-sm text-white/50">Counter turnover in progress — next call imminent.</p>}
              {nowServing.map(t => (
                <div key={t.id} className="flex items-center justify-between rounded-xl bg-teal-400/10 px-4 py-3 ring-1 ring-teal-400/25">
                  <span className="font-mono text-2xl font-bold text-teal-300">{t.code}</span>
                  <span className="text-xs font-bold text-white/70">Counter {t.counter || '—'}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="rounded-2xl bg-white/5 p-5 ring-1 ring-white/10">
            <p className="text-xs font-bold uppercase tracking-widest text-white/40">Up next</p>
            <div className="mt-3 space-y-2">
              {list.filter(t => t.status === 'booked' || t.status === 'checked-in').slice(0, 6).map((t, i) => (
                <div key={t.id} className="flex items-center justify-between rounded-xl bg-white/5 px-4 py-2.5">
                  <span className="font-mono text-base font-bold text-white/85">{t.code}</span>
                  <span className="text-[11px] font-bold text-white/45">{i === 0 ? 'ON DECK' : `~${(i + 1) * branch.avgServiceMins} min`}</span>
                </div>
              ))}
              {list.filter(t => t.status === 'booked').length === 0 && <p className="text-sm text-white/50">Queue is clear — great time to book.</p>}
            </div>
          </div>
        </div>
        <p className="border-t border-white/10 px-6 py-3 text-[11px] text-white/35">Boards refresh automatically · Ticket holders are called by code and SMS</p>
      </div>
    </div>
  );
}
