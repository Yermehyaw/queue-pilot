import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowRight, LayoutDashboard, Menu, Ticket, FileCheck2, Network, Megaphone, X } from 'lucide-react';
import { useApp } from '../lib/store';
import { cn } from '../lib/cn';

const BASE_LINKS = [
  { id: 'home', label: 'Home', Icon: LayoutDashboard, role: 'all' },
  { id: 'queue', label: 'Queue & Tickets', Icon: Ticket, role: 'customer' },
  { id: 'verify', label: 'Verify Docs', Icon: FileCheck2, role: 'customer' },
  { id: 'social', label: 'Social Studio', Icon: Megaphone, role: 'institution' },
  { id: 'review', label: 'Review Docs', Icon: FileCheck2, role: 'institution' },
  { id: 'branches', label: 'Branch Network', Icon: Network, role: 'institution' },
  { id: 'ops', label: 'Ops Console', Icon: LayoutDashboard, role: 'institution' },
];

export function Logo({ dark }: { dark?: boolean }) {
  return (
    <div className="flex items-center gap-2.5">
      <div className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-teal-400 to-emerald-600 shadow-lg shadow-teal-500/30">
        <Ticket className="h-5 w-5 text-white" />
        <span className="absolute -right-1 -top-1 h-3 w-3 rounded-full border-2 border-white bg-amber-400" />
      </div>
      <div className="leading-none">
        <p className={cn('font-display text-lg font-extrabold tracking-tight', dark ? 'text-white' : 'text-ink-900')}>LUMA</p>
        <p className={cn('text-[8px] font-semibold uppercase tracking-[0.18em]', dark ? 'text-teal-300' : 'text-teal-600')}>Customers Satisfied</p>
      </div>
    </div>
  );
}

export default function Navbar() {
  const { view, setView, queueNow, role, setRole } = useApp();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const dark = view === 'home';

  const LINKS = BASE_LINKS.filter(l => l.role === 'all' || l.role === role);

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 24);
    fn();
    window.addEventListener('scroll', fn);
    return () => window.removeEventListener('scroll', fn);
  }, []);

  useEffect(() => setOpen(false), [view]);

  return (
    <header className={cn('fixed inset-x-0 top-0 z-50 transition-all', scrolled || !dark ? 'bg-ink-950/90 shadow-lg shadow-black/10 backdrop-blur-xl' : 'bg-transparent')}>
      <div className="mx-auto flex h-[68px] max-w-7xl items-center justify-between gap-4 px-4 sm:px-6">
        <button onClick={() => { setView('home'); setRole(null); }} className="shrink-0"><Logo dark /></button>
        <nav className="hidden items-center gap-1 lg:flex">
          {LINKS.map(l => (
            <button key={l.id} onClick={() => setView(l.id)}
              className={cn('rounded-full px-3.5 py-2 text-[13px] font-semibold transition',
                view === l.id ? 'bg-white/10 text-white shadow-inner' : 'text-white/60 hover:bg-white/5 hover:text-white')}>
              {l.label}
            </button>
          ))}
        </nav>
        <div className="hidden items-center gap-3 lg:flex">
          <div className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5">
            <span className="relative h-2 w-2 rounded-full bg-emerald-400 live-dot" />
            <span className="text-xs font-semibold text-white/80">{queueNow} in queues live</span>
          </div>
          {role === 'customer' || !role ? (
            <button onClick={() => { setRole('customer'); setView('queue'); }}
              className="group inline-flex items-center gap-1.5 rounded-full bg-teal-400 px-4 py-2 text-[13px] font-bold text-ink-950 transition hover:bg-teal-300">
              Get a ticket <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </button>
          ) : null}
        </div>
        <button onClick={() => setOpen(!open)} className="rounded-xl p-2 text-white hover:bg-white/10 lg:hidden">
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>
      <AnimatePresence>
        {open && (
          <motion.nav initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden border-t border-white/10 bg-ink-950/95 backdrop-blur-xl lg:hidden">
            <div className="space-y-1 px-4 py-4">
              {LINKS.map(l => (
                <button key={l.id} onClick={() => setView(l.id)}
                  className={cn('flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold',
                    view === l.id ? 'bg-teal-400/15 text-teal-300' : 'text-white/70 hover:bg-white/5')}>
                  <l.Icon className="h-4 w-4" /> {l.label}
                </button>
              ))}
              {role === 'customer' || !role ? (
                <button onClick={() => { setRole('customer'); setView('queue'); }}
                  className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-teal-400 px-3 py-3 text-sm font-bold text-ink-950">
                  Get a ticket <ArrowRight className="h-4 w-4" />
                </button>
              ) : null}
            </div>
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  );
}
