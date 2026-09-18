import { Ticket, ShieldCheck, Clock, Globe } from 'lucide-react';
import { useApp } from '../lib/store';
import { Logo } from './Navbar';

export default function Footer() {
  const { setView } = useApp();
  const cols = [
    { title: 'Customers', links: [{ l: 'Book a ticket', v: 'queue' }, { l: 'Verify documents', v: 'verify' }, { l: 'Track my ticket', v: 'queue' }, { l: 'Find a branch', v: 'queue' }] },
    { title: 'Institutions', links: [{ l: 'Operations console', v: 'ops' }, { l: 'Branch network', v: 'branches' }, { l: 'Social studio', v: 'social' }, { l: 'Verification desk', v: 'verify' }] },
    { title: 'Company', links: [{ l: 'Home', v: 'home' }, { l: 'Queue & tickets', v: 'queue' }, { l: 'Branch network', v: 'branches' }, { l: 'Social studio', v: 'social' }] },
  ];
  return (
    <footer className="bg-ink-950 text-white">
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6">
        <div className="grid gap-10 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
          <div>
            <Logo dark />
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-white/55">
              The all-in-one platform for institutions that respect people's time — timed tickets, home document verification, branch collaboration and social care.
            </p>
            <div className="mt-5 flex flex-wrap gap-2">
              {[{ Icon: Clock, t: 'Avg wait 11 min' }, { Icon: ShieldCheck, t: 'Bank-grade security' }, { Icon: Globe, t: '40+ institutions' }].map((b, i) => (
                <span key={i} className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-semibold text-white/70">
                  <b.Icon className="h-3.5 w-3.5 text-teal-300" /> {b.t}
                </span>
              ))}
            </div>
          </div>
          {cols.map(c => (
            <div key={c.title}>
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-white/40">{c.title}</p>
              <ul className="mt-4 space-y-2.5">
                {c.links.map(x => (
                  <li key={x.l}><button onClick={() => setView(x.v)} className="text-sm text-white/65 transition hover:text-teal-300">{x.l}</button></li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="mt-12 flex flex-col items-center justify-between gap-3 border-t border-white/10 pt-6 text-xs text-white/40 sm:flex-row">
          <p className="inline-flex items-center gap-1.5"><Ticket className="h-3.5 w-3.5" /> LUMA — All-in-one customer service experience.</p>
          <p>Demo experience · All data is illustrative</p>
        </div>
      </div>
    </footer>
  );
}
