import { useState } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, Info, AlertTriangle, XCircle, X, Check } from 'lucide-react';
import { useApp } from '../lib/store';
import { cn } from '../lib/cn';

export function Toasts() {
  const { toasts, dismissToast } = useApp();
  const icons = { success: CheckCircle2, info: Info, warn: AlertTriangle, error: XCircle };
  const tones = {
    success: 'border-emerald-200 bg-emerald-50 text-emerald-900',
    info: 'border-sky-200 bg-sky-50 text-sky-900',
    warn: 'border-amber-200 bg-amber-50 text-amber-900',
    error: 'border-rose-200 bg-rose-50 text-rose-900',
  };
  const iconTones = { success: 'text-emerald-500', info: 'text-sky-500', warn: 'text-amber-500', error: 'text-rose-500' };
  return (
    <div className="fixed bottom-5 right-5 z-[100] flex w-[min(92vw,380px)] flex-col gap-2">
      {toasts.map(t => {
        const Icon = icons[t.tone];
        return (
          <motion.div key={t.id} initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }}
            className={cn('flex items-start gap-3 rounded-2xl border p-4 shadow-xl backdrop-blur', tones[t.tone])}>
            <Icon className={cn('mt-0.5 h-5 w-5 shrink-0', iconTones[t.tone])} />
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold">{t.title}</p>
              {t.desc && <p className="mt-0.5 text-xs opacity-80">{t.desc}</p>}
            </div>
            <button onClick={() => dismissToast(t.id)} className="rounded-lg p-1 hover:bg-black/5"><X className="h-4 w-4" /></button>
          </motion.div>
        );
      })}
    </div>
  );
}

export function StatusDot({ tone, pulse }: { tone: string; pulse?: boolean }) {
  return <span className={cn('relative inline-block h-2.5 w-2.5 rounded-full', tone, pulse && 'live-dot')} />;
}

export function CopyButton({ text, label }: { text: string; label?: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      onClick={() => { navigator.clipboard?.writeText(text).catch(() => {}); setCopied(true); setTimeout(() => setCopied(false), 1600); }}
      className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-600 transition hover:border-teal-300 hover:text-teal-700"
    >
      {copied ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : null}
      {copied ? 'Copied' : (label || 'Copy')}
    </button>
  );
}

export function EmptyState({ icon, title, desc, action }: { icon: React.ReactNode; title: string; desc: string; action?: React.ReactNode }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-slate-50/60 px-6 py-12 text-center">
      <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-white shadow-sm">{icon}</div>
      <p className="font-display text-sm font-bold text-slate-800">{title}</p>
      <p className="mt-1 max-w-xs text-xs text-slate-500">{desc}</p>
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

export function QrArt({ seed, size = 112 }: { seed: string; size?: number }) {
  // Deterministic decorative QR-style matrix
  let h = 7;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) % 9973;
  const cells: boolean[] = [];
  const n = 12;
  for (let i = 0; i < n * n; i++) {
    h = (h * 31 + i * 17) % 9973;
    cells.push(h % 10 < 4);
  }
  const finder = (r: number, c: number) =>
    (r < 3 && c < 3) || (r < 3 && c >= n - 3) || (r >= n - 3 && c < 3);
  return (
    <svg width={size} height={size} viewBox={`0 0 ${n} ${n}`} className="rounded-lg bg-white p-1">
      {cells.map((on, i) => {
        const r = Math.floor(i / n); const c = i % n;
        if (finder(r, c)) {
          const local = (r % (n - 3)) % 3; const localC = (c >= n - 3 ? c - (n - 3) : c) % 3;
          const edge = local === 0 || local === 2 || localC === 0 || localC === 2;
          const center = local === 1 && localC === 1;
          return <rect key={i} x={c} y={r} width={0.92} height={0.92} rx={0.15} fill={edge || center ? '#0a1628' : '#fff'} />;
        }
        return on ? <rect key={i} x={c} y={r} width={0.92} height={0.92} rx={0.15} fill="#0a1628" /> : null;
      })}
    </svg>
  );
}
