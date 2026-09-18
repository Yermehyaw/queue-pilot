import { motion } from 'framer-motion';
import {
  ArrowRight, BadgeCheck, BellRing, Building2, CalendarCheck, CheckCircle2, ChevronRight,
  Clock, FileCheck2, GraduationCap, HeartPulse, Landmark, Megaphone, Network, QrCode,
  ShieldCheck, Smartphone, Sparkles, Star, Ticket, TrendingUp, Users, Zap,
} from 'lucide-react';
import { useApp } from '../lib/store';
import { INSTITUTIONS, QUICK_ACTIONS } from '../lib/data';
import { QrArt } from '../components/ui';

const fadeUp = {
  hidden: { opacity: 0, y: 28 },
  show: (i: number = 0) => ({ opacity: 1, y: 0, transition: { delay: i * 0.08, duration: 0.6, ease: [0.22, 1, 0.36, 1] as const } }),
};

const MODULES = [
  {
    id: 'queue', icon: Ticket, title: 'Online Queuing & Timed Tickets',
    desc: 'Customers book a slot online and get a ticket telling them exactly when to arrive. No dawn queues, no wasted days.',
    points: ['Timed arrival windows', 'Live wait estimates', 'QR check-in at the door'],
    grad: 'from-teal-400 to-emerald-500', glow: 'group-hover:shadow-teal-500/20',
    role: 'customer' as const,
  },
  {
    id: 'verify', icon: FileCheck2, title: 'Document Verification',
    desc: 'Upload IDs, transcripts and statements from home. AI checks authenticity before the visit — arrive pre-cleared.',
    points: ['Forgery & tamper scan', 'Issuer registry lookup', 'Confidence scoring'],
    grad: 'from-violet-400 to-purple-600', glow: 'group-hover:shadow-violet-500/20',
    role: 'customer' as const,
  },
  {
    id: 'branches', icon: Network, title: 'Inter-Branch Collaboration',
    desc: 'Finance teams share playbooks, SOPs and hard-won lessons so no branch repeats another branch\'s mistakes.',
    points: ['Strategy & lessons feed', 'Shared resource vault', 'Fraud-watch alerts'],
    grad: 'from-amber-400 to-orange-500', glow: 'group-hover:shadow-amber-500/20',
    role: 'institution' as const,
  },
  {
    id: 'social', icon: Megaphone, title: 'Social Media Manager',
    desc: 'One inbox for every channel, instant AI-assisted replies, scheduling and a content idea engine for corporate teams.',
    points: ['Unified smart inbox', 'Post scheduling', 'AI content ideas'],
    grad: 'from-sky-400 to-blue-600', glow: 'group-hover:shadow-sky-500/20',
    role: 'institution' as const,
  },
];

const STATS = [
  { v: '480k+', l: 'Tickets issued' },
  { v: '11 min', l: 'Average wait' },
  { v: '94%', l: 'Arrive on time' },
  { v: '40+', l: 'Institutions live' },
];

const STEPS = [
  { Icon: CalendarCheck, t: 'Pick institution & service', d: 'Choose a bank, school or civic office, select the exact service you need.' },
  { Icon: Clock, t: 'Choose your arrival slot', d: 'See live availability and pick a timed window that fits your day.' },
  { Icon: QrCode, t: 'Get your online ticket', d: 'Instant ticket with QR code, counter guidance and SMS reminders.' },
  { Icon: BellRing, t: 'Walk in, get served', d: 'Arrive in your window, scan at the door, and get called on time.' },
];

export default function Home() {
  const { setView, queueNow, setRole } = useApp();

  return (
    <div className="min-h-screen bg-ink-950">
      {/* HERO */}
      <section className="hero-mesh relative overflow-hidden pb-20 pt-[140px]">
        <div className="grid-pattern absolute inset-0" />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6">
          <div className="grid items-center gap-12 lg:grid-cols-[1.05fr_0.95fr]">
            <div>
              <motion.div variants={fadeUp} initial="hidden" animate="show" custom={0}
                className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-1.5 text-xs font-semibold text-teal-200 backdrop-blur">
                <span className="relative h-2 w-2 rounded-full bg-emerald-400 live-dot" />
                {queueNow} people in smart queues right now
              </motion.div>
              <motion.h1 variants={fadeUp} initial="hidden" animate="show" custom={1}
                className="mt-6 font-display text-4xl font-extrabold leading-[1.05] tracking-tight text-white sm:text-6xl">
                Integrated customer service.<br />
                <span className="bg-gradient-to-r from-teal-300 via-emerald-300 to-amber-200 bg-clip-text text-transparent">Never queue again</span><br />
                Keep your day.
              </motion.h1>
              <motion.p variants={fadeUp} initial="hidden" animate="show" custom={2}
                className="mt-5 max-w-xl text-[15px] leading-relaxed text-white/65 sm:text-lg">
                LUMA gives every bank, school and civic office an integrated customer service and timed-ticket system — The social handles are in one-place, customers arrive exactly when
                they should, documents verified from home. Plus branch collaboration and social care, built in.
              </motion.p>
              <motion.div variants={fadeUp} initial="hidden" animate="show" custom={3} className="mt-8 flex flex-wrap gap-3">
                <button onClick={() => { setRole('customer'); setView('queue'); }}
                  className="group inline-flex items-center gap-2 rounded-2xl bg-teal-400 px-6 py-3.5 text-sm font-bold text-ink-950 shadow-xl shadow-teal-500/30 transition hover:bg-teal-300">
                  <Ticket className="h-4 w-4" /> Get an online ticket
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </button>
                <button onClick={() => { setRole('customer'); setView('verify'); }}
                  className="inline-flex items-center gap-2 rounded-2xl border border-white/15 bg-white/5 px-6 py-3.5 text-sm font-bold text-white backdrop-blur transition hover:bg-white/10">
                  <FileCheck2 className="h-4 w-4 text-violet-300" /> Verify documents
                </button>
              </motion.div>
              <motion.div variants={fadeUp} initial="hidden" animate="show" custom={4} className="mt-10 grid grid-cols-4 gap-4">
                {STATS.map(s => (
                  <div key={s.l}>
                    <p className="font-display text-2xl font-extrabold text-white sm:text-3xl">{s.v}</p>
                    <p className="mt-1 text-[11px] font-semibold uppercase tracking-wider text-white/40">{s.l}</p>
                  </div>
                ))}
              </motion.div>
            </div>

            {/* Hero ticket card */}
            <motion.div initial={{ opacity: 0, y: 40, rotate: 2 }} animate={{ opacity: 1, y: 0, rotate: 0 }} transition={{ delay: 0.3, duration: 0.7 }}
              className="relative mx-auto w-full max-w-md">
              <div className="absolute -inset-6 rounded-[32px] bg-gradient-to-br from-teal-400/20 to-violet-500/20 blur-2xl" />
              <div className="relative overflow-hidden rounded-[24px] bg-white shadow-2xl">
                <div className="bg-ink-900 px-6 py-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-teal-300">MetroTrust Bank · VI HQ</p>
                      <p className="mt-1 font-display text-lg font-bold text-white">Account Opening & KYC</p>
                    </div>
                    <span className="rounded-full bg-emerald-400/15 px-3 py-1 text-[11px] font-bold text-emerald-300">CONFIRMED</span>
                  </div>
                </div>
                <div className="px-6 py-5">
                  <div className="flex items-end justify-between">
                    <div>
                      <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400">Arrive between</p>
                      <p className="mt-1 font-display text-3xl font-extrabold text-ink-900">10:30 – 11:00</p>
                      <p className="mt-1 text-xs font-semibold text-slate-500">Thu 18 Sep · Counter 4–6 · ~8 min wait</p>
                    </div>
                    <QrArt seed="MTB-VI-HERO" size={92} />
                  </div>
                  <div className="dashed-divider my-4" />
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400">Ticket</p>
                      <p className="font-mono text-xl font-bold text-ink-900">VI-A042</p>
                    </div>
                    <div className="text-right">
                      <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400">Docs</p>
                      <p className="inline-flex items-center gap-1 text-sm font-bold text-emerald-600"><BadgeCheck className="h-4 w-4" /> Verified</p>
                    </div>
                    <button onClick={() => { setRole('customer'); setView('queue'); }}
                      className="rounded-xl bg-ink-900 px-4 py-2.5 text-xs font-bold text-white transition hover:bg-ink-700">
                      Book yours
                    </button>
                  </div>
                </div>
              </div>
              {/* floating chips */}
              <motion.div animate={{ y: [0, -8, 0] }} transition={{ duration: 3, repeat: Infinity }}
                className="absolute -left-4 top-16 hidden items-center gap-2 rounded-2xl border border-white/20 bg-ink-900/80 px-3 py-2 text-xs font-bold text-white shadow-xl backdrop-blur sm:flex">
                <BellRing className="h-4 w-4 text-amber-300" /> Reminder sent · SMS
              </motion.div>
              <motion.div animate={{ y: [0, 8, 0] }} transition={{ duration: 3.6, repeat: Infinity }}
                className="absolute -right-3 bottom-20 hidden items-center gap-2 rounded-2xl border border-white/20 bg-ink-900/80 px-3 py-2 text-xs font-bold text-white shadow-xl backdrop-blur sm:flex">
                <Zap className="h-4 w-4 text-teal-300" /> Called in 6 min
              </motion.div>
            </motion.div>
          </div>
        </div>
        {/* marquee */}
        <div className="relative mt-16 overflow-hidden border-y border-white/10 bg-white/[0.03] py-3">
          <div className="animate-marquee flex w-max gap-10 whitespace-nowrap">
            {[...QUICK_ACTIONS, ...QUICK_ACTIONS, ...QUICK_ACTIONS, ...QUICK_ACTIONS].map((q, i) => (
              <span key={i} className="inline-flex items-center gap-2 text-[13px] font-medium text-white/60">
                <span className="h-1.5 w-1.5 rounded-full bg-teal-400" />
                <strong className="font-bold text-white/85">{q.from}:</strong> {q.text}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* MODULES */}
      <section className="bg-paper py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <motion.div variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true }} className="max-w-2xl">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-teal-600">One platform · four superpowers</p>
            <h2 className="mt-3 font-display text-3xl font-extrabold tracking-tight text-ink-900 sm:text-4xl">
              Everything an institution needs to respect people's time
            </h2>
          </motion.div>
          <div className="mt-10 grid gap-5 md:grid-cols-2">
            {MODULES.map((m, i) => (
              <motion.button key={m.id} variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true }} custom={i}
                onClick={() => { setRole(m.role); setView(m.id); }}
                className={`group rounded-3xl bg-white p-7 text-left shadow-sm ring-1 ring-slate-200/70 transition hover:-translate-y-1 hover:shadow-xl ${m.glow}`}>
                <div className={`inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br ${m.grad} text-white shadow-lg`}>
                  <m.icon className="h-6 w-6" />
                </div>
                <h3 className="mt-4 font-display text-xl font-bold text-ink-900">{m.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-500">{m.desc}</p>
                <div className="mt-4 flex flex-wrap gap-2">
                  {m.points.map(p => (
                    <span key={p} className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-bold text-slate-600">
                      <CheckCircle2 className="h-3 w-3 text-teal-500" /> {p}
                    </span>
                  ))}
                </div>
                <span className="mt-5 inline-flex items-center gap-1 text-sm font-bold text-teal-600">
                  Open module <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </span>
              </motion.button>
            ))}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="bg-white py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="grid gap-12 lg:grid-cols-[0.9fr_1.1fr]">
            <motion.div variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true }}>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-teal-600">How it works</p>
              <h2 className="mt-3 font-display text-3xl font-extrabold tracking-tight text-ink-900 sm:text-4xl">
                From 4-hour queue to 10-minute visit
              </h2>
              <p className="mt-4 text-[15px] leading-relaxed text-slate-500">
                The old way: arrive at dawn, take a paper number, wait all morning. The LUMA way: book in 60 seconds,
                verify documents from your couch, arrive in your window and get called on time.
              </p>
              <div className="mt-6 overflow-hidden rounded-3xl shadow-lg">
                <img src="/images/bank.jpg" alt="Modern bank lobby" className="h-56 w-full object-cover" />
              </div>
            </motion.div>
            <div className="grid gap-4 sm:grid-cols-2">
              {STEPS.map((s, i) => (
                <motion.div key={s.t} variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true }} custom={i}
                  className="relative rounded-3xl bg-paper p-6 ring-1 ring-slate-200/60">
                  <span className="absolute right-5 top-4 font-display text-4xl font-extrabold text-slate-200">0{i + 1}</span>
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-ink-900 text-teal-300">
                    <s.Icon className="h-5 w-5" />
                  </div>
                  <h3 className="mt-4 font-display text-[15px] font-bold text-ink-900">{s.t}</h3>
                  <p className="mt-1.5 text-[13px] leading-relaxed text-slate-500">{s.d}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* INSTITUTIONS */}
      <section className="bg-paper py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-teal-600">Live institutions</p>
              <h2 className="mt-3 font-display text-3xl font-extrabold tracking-tight text-ink-900 sm:text-4xl">Book a visit today</h2>
            </div>
            <button onClick={() => { setRole('customer'); setView('queue'); }} className="inline-flex items-center gap-1.5 rounded-2xl bg-ink-900 px-5 py-3 text-sm font-bold text-white transition hover:bg-ink-700">
              Browse all <ArrowRight className="h-4 w-4" />
            </button>
          </div>
          <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {INSTITUTIONS.map((inst, i) => (
              <motion.button key={inst.id} variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true }} custom={i % 3}
                onClick={() => { setRole('customer'); setView('queue'); }}
                className="group overflow-hidden rounded-3xl bg-white text-left shadow-sm ring-1 ring-slate-200/70 transition hover:-translate-y-1 hover:shadow-xl">
                <div className="relative h-40 overflow-hidden">
                  <img src={inst.image} alt={inst.name} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
                  <div className="absolute inset-0 bg-gradient-to-t from-ink-950/70 to-transparent" />
                  <span className="absolute left-4 top-4 inline-flex items-center gap-1 rounded-full bg-white/90 px-2.5 py-1 text-[11px] font-bold text-ink-900 backdrop-blur">
                    {inst.kind === 'bank' ? <Landmark className="h-3 w-3" /> : inst.kind === 'school' ? <GraduationCap className="h-3 w-3" /> : <HeartPulse className="h-3 w-3" />}
                    {inst.kind.toUpperCase()}
                  </span>
                  <span className="absolute bottom-3 right-4 inline-flex items-center gap-1 rounded-full bg-ink-950/70 px-2.5 py-1 text-[11px] font-bold text-amber-300 backdrop-blur">
                    <Star className="h-3 w-3 fill-amber-300" /> {inst.rating}
                  </span>
                </div>
                <div className="p-5">
                  <h3 className="font-display text-base font-bold text-ink-900">{inst.name}</h3>
                  <p className="mt-1 text-[13px] text-slate-500">{inst.tagline}</p>
                  <p className="mt-3 inline-flex items-center gap-1 text-[13px] font-bold text-teal-600">
                    {(inst.servedThisWeek / 1000).toFixed(1)}k served this week <ChevronRight className="h-4 w-4" />
                  </p>
                </div>
              </motion.button>
            ))}
          </div>
        </div>
      </section>

      {/* OPS / BRANCH / SOCIAL teasers */}
      <section className="bg-ink-950 py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <motion.div variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true }} className="mx-auto max-w-2xl text-center">
            <p className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/5 px-4 py-1.5 text-xs font-bold text-white/70">
              <Sparkles className="h-3.5 w-3.5 text-amber-300" /> For institutions & teams
            </p>
            <h2 className="mt-4 font-display text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
              Run the whole operation from one dashboard
            </h2>
          </motion.div>
          <div className="mt-10 grid gap-5 md:grid-cols-3">
            {[
              { id: 'ops', Icon: Users, img: '/images/team.jpg', t: 'Ops Console', d: 'Call tickets, manage counters, watch live load across every branch.', role: 'institution' as const },
              { id: 'branches', Icon: Network, img: '/images/team.jpg', t: 'Branch Network', d: 'Playbooks, lessons and fraud alerts shared between finance teams.', role: 'institution' as const },
              { id: 'social', Icon: Megaphone, img: '/images/social.jpg', t: 'Social Studio', d: 'Every DM in one inbox, instant replies and AI content ideas.', role: 'institution' as const },
            ].map((c, i) => (
              <motion.button key={c.t} variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true }} custom={i}
                onClick={() => { setRole(c.role); setView(c.id); }}
                className="group overflow-hidden rounded-3xl bg-ink-900 text-left ring-1 ring-white/10 transition hover:-translate-y-1 hover:ring-teal-400/40">
                <div className="relative h-44 overflow-hidden">
                  <img src={c.img} alt={c.t} className="h-full w-full object-cover opacity-80 transition-transform duration-500 group-hover:scale-105" />
                  <div className="absolute inset-0 bg-gradient-to-t from-ink-900 to-transparent" />
                </div>
                <div className="p-6 pt-2">
                  <h3 className="inline-flex items-center gap-2 font-display text-lg font-bold text-white"><c.Icon className="h-5 w-5 text-teal-300" /> {c.t}</h3>
                  <p className="mt-1.5 text-sm text-white/60">{c.d}</p>
                  <span className="mt-4 inline-flex items-center gap-1 text-sm font-bold text-teal-300">Explore <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" /></span>
                </div>
              </motion.button>
            ))}
          </div>
        </div>
      </section>

      {/* TESTIMONIALS + CTA */}
      <section className="bg-paper py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="grid gap-5 md:grid-cols-3">
            {[
              { q: 'I booked a 10:40 slot, arrived at 10:32, and was called at 10:43. I honestly did not know banking could feel like this.', n: 'Daniel Okafor', r: 'Customer · MetroTrust Lekki' },
              { q: 'Transcript season used to mean sleeping outside Registry. This year my daughter booked online and was done before lunch.', n: 'Mrs. Okonkwo', r: 'Parent · Crestview University' },
              { q: 'The Saturday pension playbook from Yaba branch saved us. We copied it in a week and our wait times fell off a cliff.', n: 'Halima Sani', r: 'Supervisor · Harborline Surulere' },
            ].map((t, i) => (
              <motion.figure key={i} variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true }} custom={i}
                className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200/70">
                <div className="flex gap-1">{[0, 1, 2, 3, 4].map(s => <Star key={s} className="h-4 w-4 fill-amber-400 text-amber-400" />)}</div>
                <blockquote className="mt-3 text-sm leading-relaxed text-slate-600">“{t.q}”</blockquote>
                <figcaption className="mt-4">
                  <p className="text-sm font-bold text-ink-900">{t.n}</p>
                  <p className="text-xs text-slate-500">{t.r}</p>
                </figcaption>
              </motion.figure>
            ))}
          </div>
          <motion.div variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true }}
            className="relative mt-10 overflow-hidden rounded-[32px] bg-ink-900 px-6 py-12 text-center sm:px-12">
            <div className="grid-pattern absolute inset-0" />
            <div className="relative">
              <Building2 className="mx-auto h-10 w-10 text-teal-300" />
              <h2 className="mx-auto mt-4 max-w-xl font-display text-2xl font-extrabold text-white sm:text-3xl">
                Run an institution? Give your customers their time back.
              </h2>
              <p className="mx-auto mt-3 max-w-lg text-sm text-white/60">
                Launch timed tickets, document pre-verification and live queue control for your branches in days — not months.
              </p>
              <div className="mt-6 flex flex-wrap justify-center gap-3">
                <button onClick={() => { setRole('institution'); setView('ops'); }} className="inline-flex items-center gap-2 rounded-2xl bg-teal-400 px-6 py-3 text-sm font-bold text-ink-950 transition hover:bg-teal-300">
                  <TrendingUp className="h-4 w-4" /> Tour the ops console
                </button>
                <button onClick={() => { setRole('customer'); setView('queue'); }} className="inline-flex items-center gap-2 rounded-2xl border border-white/15 bg-white/5 px-6 py-3 text-sm font-bold text-white transition hover:bg-white/10">
                  <Smartphone className="h-4 w-4" /> Try as a customer
                </button>
              </div>
              <p className="mt-5 inline-flex items-center gap-1.5 text-xs text-white/40"><ShieldCheck className="h-3.5 w-3.5" /> SOC 2-aligned · NDPR-ready · 99.9% uptime</p>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
