import { useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  BarChart3, Bot, CalendarClock, CheckCheck, ChevronRight, Clock, Copy, Inbox,
  Lightbulb, Megaphone, Plus, Search, Send, SlidersHorizontal, Sparkles, TrendingUp,
  UserCheck, X,
} from 'lucide-react';
import { useApp, REPLY_TEMPLATES } from '../lib/store';
import { fullDateTime, timeAgo } from '../lib/utils';
import { cn } from '../lib/cn';
import { EmptyState } from '../components/ui';
import { CHANNEL_META } from '../components/icons';
import type { InboxMessage, SocialChannel } from '../types';

const TEAM = ['Adaeze M.', 'Tunde B.', 'Kemi A.', 'Ibrahim D.'];

const ACCOUNTS: { channel: SocialChannel; handle: string; followers: number; growthPct: number }[] = [
  { channel: 'instagram', handle: '@metrotrust', followers: 128400, growthPct: 4.2 },
  { channel: 'x', handle: '@metrotrust_ng', followers: 86200, growthPct: 2.8 },
  { channel: 'facebook', handle: 'MetroTrust Bank', followers: 214000, growthPct: 1.9 },
  { channel: 'linkedin', handle: 'MetroTrust Bank', followers: 48300, growthPct: 6.1 },
  { channel: 'tiktok', handle: '@metrotrust', followers: 96700, growthPct: 11.4 },
];

const SENTIMENT_META = {
  positive: { label: 'Positive', pill: 'bg-emerald-100 text-emerald-700' },
  neutral: { label: 'Neutral', pill: 'bg-slate-200 text-slate-600' },
  negative: { label: 'Negative', pill: 'bg-rose-100 text-rose-700' },
  urgent: { label: 'Urgent', pill: 'bg-red-500 text-white' },
};

export default function Social() {
  const { inbox } = useApp();
  const [tab, setTab] = useState<'inbox' | 'calendar' | 'ideas' | 'analytics'>('inbox');
  const openCount = inbox.filter(m => m.status === 'open').length;
  const urgentCount = inbox.filter(m => m.status === 'open' && (m.sentiment === 'urgent' || m.sentiment === 'negative')).length;

  return (
    <div className="min-h-screen bg-paper pb-20 pt-[88px]">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="overflow-hidden rounded-[28px] bg-gradient-to-br from-sky-600 via-blue-700 to-indigo-800 p-6 text-white sm:p-8">
          <div className="flex flex-wrap items-center gap-4">
            <div className="min-w-0 flex-1">
              <p className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.16em]">
                <Megaphone className="h-3.5 w-3.5" /> Social studio · MetroTrust Bank
              </p>
              <h1 className="mt-3 font-display text-2xl font-extrabold tracking-tight sm:text-3xl">
                Every channel. One inbox. Zero slow replies.
              </h1>
              <div className="mt-3 flex flex-wrap gap-2 text-xs font-bold">
                <span className="rounded-full bg-white/15 px-3 py-1.5">{openCount} open conversations</span>
                <span className="rounded-full bg-red-500/80 px-3 py-1.5">{urgentCount} need urgent care</span>
                <span className="rounded-full bg-white/15 px-3 py-1.5">Avg first response 4 min</span>
              </div>
            </div>
            <div className="flex rounded-2xl bg-white/15 p-1 backdrop-blur">
              {([['inbox', 'Inbox'], ['calendar', 'Calendar'], ['ideas', 'Ideas'], ['analytics', 'Analytics']] as const).map(([id, l]) => (
                <button key={id} onClick={() => setTab(id)}
                  className={cn('rounded-xl px-3.5 py-2 text-[13px] font-bold transition', tab === id ? 'bg-white text-blue-800 shadow' : 'text-white/70 hover:text-white')}>
                  {l}
                </button>
              ))}
            </div>
          </div>
          <div className="mt-5 grid grid-cols-2 gap-2 sm:grid-cols-5">
            {ACCOUNTS.map(a => {
              const M = CHANNEL_META[a.channel];
              return (
                <div key={a.channel} className="rounded-2xl bg-white/10 p-3 backdrop-blur">
                  <p className="flex items-center gap-1.5 text-[11px] font-bold text-white/80"><M.Icon className="h-3.5 w-3.5" /> {M.label}</p>
                  <p className="mt-1 font-display text-lg font-extrabold">{fmtFollowers(a.followers)}</p>
                  <p className="text-[11px] font-bold text-emerald-300">▲ {a.growthPct}% this month</p>
                </div>
              );
            })}
          </div>
        </div>

        {tab === 'inbox' && <InboxTab />}
        {tab === 'calendar' && <CalendarTab />}
        {tab === 'ideas' && <IdeasTab />}
        {tab === 'analytics' && <AnalyticsTab />}
      </div>
    </div>
  );
}

function fmtFollowers(n: number) {
  return n >= 1000 ? `${(n / 1000).toFixed(1).replace(/\.0$/, '')}k` : `${n}`;
}

/* ---------------------------------- inbox ---------------------------------- */
function InboxTab() {
  const { inbox, replyToMessage, setMessageStatus, assignMessage, toast } = useApp();
  const [filter, setFilter] = useState<'all' | 'open' | 'urgent' | 'resolved'>('all');
  const [channel, setChannel] = useState<'all' | SocialChannel>('all');
  const [query, setQuery] = useState('');
  const [activeId, setActiveId] = useState<string | null>(null);
  const [draft, setDraft] = useState('');
  const [aiThinking, setAiThinking] = useState(false);

  const list = useMemo(() => {
    let arr = [...inbox].sort((a, b) => b.priority - a.priority || b.receivedAt - a.receivedAt);
    if (filter === 'open') arr = arr.filter(m => m.status === 'open');
    if (filter === 'resolved') arr = arr.filter(m => m.status === 'resolved');
    if (filter === 'urgent') arr = arr.filter(m => m.sentiment === 'urgent' || m.sentiment === 'negative');
    if (channel !== 'all') arr = arr.filter(m => m.channel === channel);
    if (query) arr = arr.filter(m => (m.text + m.author + m.intent).toLowerCase().includes(query.toLowerCase()));
    return arr;
  }, [inbox, filter, channel, query]);

  const active: InboxMessage | undefined = inbox.find(m => m.id === (activeId || list[0]?.id));

  function aiDraft(m: InboxMessage) {
    setAiThinking(true);
    setTimeout(() => {
      setAiThinking(false);
      const name = m.author.split(' ')[0].replace('@', '');
      let text = '';
      if (m.sentiment === 'urgent' || m.sentiment === 'negative') {
        text = `Hi ${name}, thank you for flagging this — I completely understand the frustration, and I'm sorry. I've escalated this to the branch team right now with priority. Could you share your ticket code or branch name so I can trace it personally and update you within the hour? — Adaeze, Customer Care`;
      } else if (m.intent.toLowerCase().includes('question')) {
        text = `Hello ${name}! Great question — yes, you can book a timed slot online in under a minute (link in bio), and walk-ins are still welcome subject to availability. Booking ahead guarantees your window and usually means under 10 minutes on site. Anything else I can help with?`;
      } else if (m.sentiment === 'positive') {
        text = `This made our whole team's day, ${name}! Thank you for sharing — I've passed your kind words to the branch crew. See you next visit!`;
      } else {
        text = `Hello ${name}, thanks for reaching out! I've logged your message and a specialist will respond within the hour. If it's urgent, you can also book a timed slot online and speak with the team in person.`;
      }
      setDraft(text);
      toast({ title: 'AI draft ready', desc: 'Review, edit and send', tone: 'info' });
    }, 1400);
  }

  function send(ai: boolean) {
    if (!active || !draft.trim()) return;
    replyToMessage(active.id, draft.trim(), ai);
    setDraft('');
    toast({ title: 'Reply sent & resolved', desc: `${CHANNEL_META[active.channel].label} · ${active.authorHandle}`, tone: 'success' });
  }

  return (
    <div className="mt-6 grid gap-5 lg:grid-cols-[360px_1fr]">
      <div className="overflow-hidden rounded-3xl bg-white shadow-sm ring-1 ring-slate-200/70">
        <div className="border-b border-slate-100 p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search messages…"
              className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-9 pr-3 text-sm outline-none focus:border-sky-400 focus:bg-white" />
          </div>
          <div className="mt-2.5 flex flex-wrap gap-1.5">
            {(['all', 'open', 'urgent', 'resolved'] as const).map(f => (
              <button key={f} onClick={() => setFilter(f)}
                className={cn('rounded-full px-2.5 py-1 text-[11px] font-bold capitalize', filter === f ? 'bg-ink-900 text-white' : 'bg-slate-100 text-slate-500 hover:bg-slate-200')}>
                {f}
              </button>
            ))}
          </div>
          <div className="mt-2 flex gap-1.5 overflow-x-auto pb-1">
            <ChannelChip id="all" active={channel === 'all'} onClick={() => setChannel('all')} label="All" />
            {(Object.keys(CHANNEL_META) as SocialChannel[]).map(c => (
              <ChannelChip key={c} id={c} active={channel === c} onClick={() => setChannel(c)} label={CHANNEL_META[c].label} />
            ))}
          </div>
        </div>
        <div className="max-h-[560px] space-y-1.5 overflow-y-auto p-3">
          {list.map(m => {
            const M = CHANNEL_META[m.channel];
            const S = SENTIMENT_META[m.sentiment];
            const isActive = active?.id === m.id;
            return (
              <button key={m.id} onClick={() => { setActiveId(m.id); setDraft(''); }}
                className={cn('w-full rounded-2xl p-3 text-left transition', isActive ? 'bg-sky-50 ring-2 ring-sky-400' : 'hover:bg-slate-50')}>
                <div className="flex items-center gap-2">
                  <span className={cn('flex h-7 w-7 items-center justify-center rounded-lg', M.bg)}><M.Icon className={cn('h-3.5 w-3.5', M.color)} /></span>
                  <p className="min-w-0 flex-1 truncate text-[13px] font-bold text-ink-900">{m.author} <span className="font-medium text-slate-400">{m.authorHandle}</span></p>
                  <span className="shrink-0 text-[10px] font-bold text-slate-400">{timeAgo(m.receivedAt)}</span>
                </div>
                <p className="mt-1.5 line-clamp-2 text-[13px] leading-snug text-slate-600">{m.text}</p>
                <div className="mt-2 flex items-center gap-1.5">
                  <span className={cn('rounded-full px-2 py-0.5 text-[10px] font-bold', S.pill)}>{S.label}</span>
                  <span className="truncate rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-500">{m.intent}</span>
                  {m.status === 'resolved' && <CheckCheck className="ml-auto h-4 w-4 text-emerald-500" />}
                  {m.status === 'open' && <span className="ml-auto flex gap-0.5">{[0, 1, 2, 3, 4].slice(0, m.priority).map(i => <span key={i} className="h-1.5 w-1.5 rounded-full bg-rose-400" />)}</span>}
                </div>
              </button>
            );
          })}
          {list.length === 0 && <div className="p-2"><EmptyState icon={<Inbox className="h-5 w-5 text-slate-400" />} title="Inbox zero" desc="No messages match these filters." /></div>}
        </div>
      </div>

      <div className="min-h-[480px] overflow-hidden rounded-3xl bg-white shadow-sm ring-1 ring-slate-200/70">
        {!active && <div className="p-6"><EmptyState icon={<Inbox className="h-5 w-5 text-slate-400" />} title="Select a conversation" desc="Pick a message to read and reply." /></div>}
        {active && (() => {
          const M = CHANNEL_META[active.channel];
          const S = SENTIMENT_META[active.sentiment];
          return (
            <div className="flex h-full flex-col">
              <div className="flex flex-wrap items-center gap-3 border-b border-slate-100 px-5 py-4">
                <span className={cn('flex h-10 w-10 items-center justify-center rounded-xl', M.bg)}><M.Icon className={cn('h-5 w-5', M.color)} /></span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-bold text-ink-900">{active.author} <span className="font-medium text-slate-400">{active.authorHandle}</span></p>
                  <p className="text-[11px] text-slate-400">{M.label} · {fullDateTime(active.receivedAt)} · {active.intent}</p>
                </div>
                <span className={cn('rounded-full px-2.5 py-1 text-[11px] font-bold', S.pill)}>{S.label}</span>
                <select value={active.assignee || ''} onChange={e => { assignMessage(active.id, e.target.value); toast({ title: e.target.value ? `Assigned to ${e.target.value}` : 'Unassigned', tone: 'info' }); }}
                  className="rounded-xl border border-slate-200 bg-slate-50 px-2.5 py-2 text-xs font-bold outline-none focus:border-sky-400">
                  <option value="">Unassigned</option>
                  {TEAM.map(t => <option key={t}>{t}</option>)}
                </select>
              </div>

              <div className="flex-1 space-y-3 overflow-y-auto bg-slate-50/60 p-5">
                <div className="max-w-[85%] rounded-2xl rounded-tl-md bg-white px-4 py-3 shadow-sm ring-1 ring-slate-100">
                  <p className="text-sm leading-relaxed text-slate-700">{active.text}</p>
                  <p className="mt-1.5 text-[10px] font-bold text-slate-400">{timeAgo(active.receivedAt)}</p>
                </div>
                {active.replies.map(r => (
                  <div key={r.id} className="ml-auto max-w-[85%] rounded-2xl rounded-tr-md bg-ink-900 px-4 py-3 text-white shadow">
                    {r.ai && <p className="mb-1 flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest text-sky-300"><Bot className="h-3 w-3" /> Sent with AI assist</p>}
                    <p className="text-sm leading-relaxed">{r.text}</p>
                    <p className="mt-1.5 text-[10px] font-bold text-white/40">{r.author} · {timeAgo(r.createdAt)}</p>
                  </div>
                ))}
                {active.status === 'resolved' && <p className="flex items-center justify-center gap-1.5 pt-1 text-xs font-bold text-emerald-600"><CheckCheck className="h-4 w-4" /> Resolved</p>}
              </div>

              <div className="border-t border-slate-100 p-4">
                <div className="mb-2.5 flex flex-wrap gap-1.5">
                  <button onClick={() => active && aiDraft(active)} disabled={aiThinking}
                    className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-violet-500 to-purple-600 px-3 py-1.5 text-[11px] font-bold text-white shadow transition hover:opacity-90 disabled:opacity-60">
                    <Sparkles className="h-3.5 w-3.5" /> {aiThinking ? 'Drafting…' : 'Draft with AI'}
                  </button>
                  {REPLY_TEMPLATES.map((t, i) => (
                    <button key={i} onClick={() => setDraft(t)} className="rounded-full bg-slate-100 px-3 py-1.5 text-[11px] font-bold text-slate-500 hover:bg-slate-200">
                      Template {i + 1}
                    </button>
                  ))}
                </div>
                <div className="flex gap-2">
                  <textarea value={draft} onChange={e => setDraft(e.target.value)} rows={3}
                    placeholder="Write a reply… (AI drafts match tone & policy)"
                    className="flex-1 resize-none rounded-2xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm outline-none focus:border-sky-400 focus:bg-white" />
                </div>
                <div className="mt-2.5 flex flex-wrap items-center gap-2">
                  <button onClick={() => send(false)} disabled={!draft.trim()}
                    className="inline-flex items-center gap-1.5 rounded-xl bg-ink-900 px-5 py-2.5 text-[13px] font-bold text-white transition hover:bg-ink-700 disabled:opacity-40">
                    <Send className="h-3.5 w-3.5" /> Send & resolve
                  </button>
                  <button onClick={() => send(true)} disabled={!draft.trim()}
                    className="inline-flex items-center gap-1.5 rounded-xl bg-sky-500 px-4 py-2.5 text-[13px] font-bold text-white transition hover:bg-sky-400 disabled:opacity-40">
                    <Bot className="h-3.5 w-3.5" /> Send as AI-assisted
                  </button>
                  {active.status === 'open' ? (
                    <button onClick={() => { setMessageStatus(active.id, 'snoozed'); toast({ title: 'Snoozed for 3 hours', tone: 'info' }); }}
                      className="ml-auto inline-flex items-center gap-1.5 rounded-xl px-3 py-2.5 text-[13px] font-bold text-slate-400 hover:bg-slate-100">
                      <Clock className="h-4 w-4" /> Snooze
                    </button>
                  ) : (
                    <button onClick={() => setMessageStatus(active.id, 'open')}
                      className="ml-auto rounded-xl px-3 py-2.5 text-[13px] font-bold text-slate-400 hover:bg-slate-100">
                      Reopen
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })()}
      </div>
    </div>
  );
}

function ChannelChip({ active, onClick, label }: { id: string; active: boolean; onClick: () => void; label: string }) {
  return (
    <button onClick={onClick} className={cn('shrink-0 rounded-full px-2.5 py-1 text-[11px] font-bold', active ? 'bg-sky-500 text-white' : 'bg-slate-100 text-slate-500 hover:bg-slate-200')}>
      {label}
    </button>
  );
}

/* ---------------------------------- calendar ---------------------------------- */
function CalendarTab() {
  const { schedule, addScheduledPost, publishNow, toast } = useApp();
  const [composerOpen, setComposerOpen] = useState(false);
  const [filter, setFilter] = useState<'all' | 'scheduled' | 'published' | 'draft'>('all');
  const list = useMemo(() => schedule.filter(s => filter === 'all' || s.status === filter), [schedule, filter]);
  const upcoming = schedule.filter(s => s.status === 'scheduled').length;

  return (
    <div className="mt-6 rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-200/70 sm:p-6">
      <div className="flex flex-wrap items-center gap-3">
        <div>
          <h2 className="flex items-center gap-2 font-display text-lg font-bold text-ink-900"><CalendarClock className="h-5 w-5 text-sky-600" /> Content calendar</h2>
          <p className="text-xs text-slate-500">{upcoming} posts scheduled · best times pre-filled by AI</p>
        </div>
        <div className="ml-auto flex gap-2">
          <div className="flex rounded-xl bg-slate-100 p-1">
            {(['all', 'scheduled', 'published', 'draft'] as const).map(f => (
              <button key={f} onClick={() => setFilter(f)} className={cn('rounded-lg px-3 py-1.5 text-xs font-bold capitalize', filter === f ? 'bg-white shadow' : 'text-slate-500')}>{f}</button>
            ))}
          </div>
          <button onClick={() => setComposerOpen(true)} className="inline-flex items-center gap-1.5 rounded-xl bg-ink-900 px-4 py-2.5 text-[13px] font-bold text-white hover:bg-ink-700">
            <Plus className="h-4 w-4" /> Compose
          </button>
        </div>
      </div>
      <div className="mt-5 grid gap-3 lg:grid-cols-2">
        {list.map(s => (
          <div key={s.id} className="rounded-2xl border border-slate-200 p-4 transition hover:border-sky-300 hover:shadow-sm">
            <div className="flex items-center gap-1.5">
              {s.channels.map(c => {
                const M = CHANNEL_META[c];
                return <span key={c} title={M.label} className={cn('flex h-7 w-7 items-center justify-center rounded-lg', M.bg)}><M.Icon className={cn('h-3.5 w-3.5', M.color)} /></span>;
              })}
              <span className={cn('ml-auto rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide',
                s.status === 'published' ? 'bg-emerald-100 text-emerald-700' : s.status === 'scheduled' ? 'bg-sky-100 text-sky-700' : 'bg-slate-200 text-slate-500')}>{s.status}</span>
            </div>
            <p className="mt-2.5 whitespace-pre-line text-[13px] leading-relaxed text-slate-700">{s.text}</p>
            <div className="mt-3 flex items-center gap-2 border-t border-slate-100 pt-3">
              <span className="text-[11px] font-bold text-slate-400">{s.status === 'published' ? `Published ${timeAgo(s.scheduledAt)}` : `Goes live ${fullDateTime(s.scheduledAt)}`} · by {s.author}</span>
              {s.status === 'published' && s.likes !== undefined && (
                <span className="ml-auto text-[11px] font-bold text-slate-500">♥ {s.likes} · 💬 {s.comments} · ↗ {s.shares}</span>
              )}
              {s.status !== 'published' && (
                <button onClick={() => { publishNow(s.id); toast({ title: 'Published now', tone: 'success' }); }}
                  className="ml-auto rounded-lg bg-emerald-500 px-3 py-1.5 text-[11px] font-bold text-white hover:bg-emerald-400">Publish now</button>
              )}
            </div>
          </div>
        ))}
      </div>
      {list.length === 0 && <div className="mt-4"><EmptyState icon={<CalendarClock className="h-5 w-5 text-slate-400" />} title="Nothing scheduled" desc="Compose a post or generate ideas to fill the calendar." /></div>}
      <AnimatePresence>
        {composerOpen && <ComposerModal onClose={() => setComposerOpen(false)} onSave={(p) => { addScheduledPost(p); setComposerOpen(false); toast({ title: p.status === 'draft' ? 'Saved as draft' : 'Post scheduled', tone: 'success' }); }} />}
      </AnimatePresence>
    </div>
  );
}

function ComposerModal({ onClose, onSave }: { onClose: () => void; onSave: (p: { channels: SocialChannel[]; text: string; scheduledAt: number; author: string; status: 'scheduled' | 'draft' }) => void }) {
  const [text, setText] = useState('');
  const [channels, setChannels] = useState<SocialChannel[]>(['instagram', 'x']);
  const [when, setWhen] = useState('tomorrow-9');
  const [author] = useState('You');

  function toggle(c: SocialChannel) {
    setChannels(prev => prev.includes(c) ? prev.filter(x => x !== c) : [...prev, c]);
  }
  function scheduledAt(): number {
    const d = new Date();
    if (when === 'tomorrow-9') { d.setDate(d.getDate() + 1); d.setHours(9, 0, 0, 0); }
    else if (when === 'friday-730') { d.setDate(d.getDate() + ((5 - d.getDay() + 7) % 7 || 7)); d.setHours(7, 30, 0, 0); }
    else { d.setHours(d.getHours() + 3); }
    return d.getTime();
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-[80] flex items-end justify-center bg-ink-950/60 backdrop-blur-sm sm:items-center sm:p-6" onClick={onClose}>
      <motion.div initial={{ y: 40 }} animate={{ y: 0 }} exit={{ y: 40 }} onClick={e => e.stopPropagation()}
        className="max-h-[92vh] w-full max-w-lg overflow-y-auto rounded-t-3xl bg-white p-6 sm:rounded-3xl">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="font-display text-lg font-bold text-ink-900">Compose post</h3>
            <p className="text-xs text-slate-500">One draft, many channels</p>
          </div>
          <button onClick={onClose} className="rounded-full bg-slate-100 p-2 text-slate-500"><X className="h-4 w-4" /></button>
        </div>
        <div className="mt-4 flex flex-wrap gap-1.5">
          {(Object.keys(CHANNEL_META) as SocialChannel[]).map(c => {
            const M = CHANNEL_META[c];
            const on = channels.includes(c);
            return (
              <button key={c} onClick={() => toggle(c)}
                className={cn('inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold transition', on ? 'bg-ink-900 text-white' : 'bg-slate-100 text-slate-500')}>
                <M.Icon className="h-3.5 w-3.5" /> {M.label}
              </button>
            );
          })}
        </div>
        <textarea value={text} onChange={e => setText(e.target.value)} rows={6} placeholder="Write your post… hooks first, hashtags last."
          className="mt-3 w-full rounded-2xl border border-slate-200 bg-slate-50 px-3.5 py-3 text-sm outline-none focus:border-sky-400 focus:bg-white" />
        <div className="mt-1 flex justify-between text-[11px] font-bold text-slate-400">
          <span>{text.length} characters</span>
          <span>{text.trim() ? text.trim().split(/\s+/).length : 0} words</span>
        </div>
        {/* live preview */}
        <div className="mt-3 rounded-2xl bg-ink-900 p-4 text-white">
          <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-white/40">Preview</p>
          <p className="mt-1.5 whitespace-pre-line text-[13px] leading-relaxed">{text || 'Your post preview appears here…'}</p>
        </div>
        <label className="mt-3 block text-xs font-bold text-slate-600">Schedule for
          <select value={when} onChange={e => setWhen(e.target.value)}
            className="mt-1.5 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm font-semibold outline-none focus:border-sky-400">
            <option value="tomorrow-9">Tomorrow · 9:00 AM (peak)</option>
            <option value="in-3h">In 3 hours</option>
            <option value="friday-730">Friday · 7:30 AM (peak)</option>
          </select>
        </label>
        <div className="mt-4 flex gap-2">
          <button onClick={() => text.trim() && channels.length && onSave({ channels, text: text.trim(), scheduledAt: scheduledAt(), author, status: 'scheduled' })}
            className="flex-1 rounded-xl bg-sky-500 px-4 py-3 text-sm font-bold text-white hover:bg-sky-400">Schedule post</button>
          <button onClick={() => text.trim() && onSave({ channels, text: text.trim(), scheduledAt: Date.now(), author, status: 'draft' })}
            className="rounded-xl border border-slate-200 px-4 py-3 text-sm font-bold text-slate-600 hover:bg-slate-50">Save draft</button>
        </div>
      </motion.div>
    </motion.div>
  );
}

/* ---------------------------------- ideas ---------------------------------- */
function IdeasTab() {
  const { ideas, generateIdeas, useIdea, toast } = useApp();
  const [topic, setTopic] = useState('');
  const [channel, setChannel] = useState<SocialChannel>('instagram');
  const [loading, setLoading] = useState(false);

  function generate() {
    setLoading(true);
    setTimeout(() => { generateIdeas(topic, channel); setLoading(false); }, 1200);
  }

  return (
    <div className="mt-6 grid gap-5 lg:grid-cols-[340px_1fr]">
      <div className="h-fit rounded-3xl bg-ink-900 p-6 text-white shadow-lg">
        <p className="flex items-center gap-2 text-sm font-bold"><Lightbulb className="h-4 w-4 text-amber-300" /> AI content idea engine</p>
        <p className="mt-1.5 text-[13px] leading-relaxed text-white/60">Describe a theme — product, event, customer story — and get hooks, captions, hashtags and best times.</p>
        <label className="mt-4 block text-xs font-bold text-white/70">Theme or topic
          <input value={topic} onChange={e => setTopic(e.target.value)} placeholder="e.g. pension-day slots, student accounts…"
            className="mt-1.5 w-full rounded-xl border border-white/15 bg-white/5 px-3.5 py-2.5 text-sm outline-none placeholder:text-white/30 focus:border-amber-300" />
        </label>
        <label className="mt-3 block text-xs font-bold text-white/70">Target channel
          <div className="mt-1.5 flex flex-wrap gap-1.5">
            {(Object.keys(CHANNEL_META) as SocialChannel[]).map(c => {
              const M = CHANNEL_META[c];
              return (
                <button key={c} onClick={() => setChannel(c)}
                  className={cn('inline-flex items-center gap-1 rounded-full px-2.5 py-1.5 text-[11px] font-bold', channel === c ? 'bg-amber-400 text-ink-950' : 'bg-white/10 text-white/70 hover:bg-white/15')}>
                  <M.Icon className="h-3 w-3" /> {M.label}
                </button>
              );
            })}
          </div>
        </label>
        <button onClick={generate} disabled={loading}
          className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-amber-400 px-4 py-3 text-sm font-bold text-ink-950 transition hover:bg-amber-300 disabled:opacity-60">
          <Sparkles className="h-4 w-4" /> {loading ? 'Generating…' : 'Generate 3 ideas'}
        </button>
        <div className="mt-3 flex flex-wrap gap-1.5">
          {['Pension day', 'Student accounts', 'Fraud awareness', 'Staff spotlight'].map(s => (
            <button key={s} onClick={() => setTopic(s)} className="rounded-full bg-white/10 px-2.5 py-1 text-[11px] font-bold text-white/70 hover:bg-white/15">{s}</button>
          ))}
        </div>
      </div>
      <div className="space-y-4">
        {loading && [0, 1, 2].map(i => (
          <div key={i} className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200/70">
            <div className="shimmer h-5 w-2/3 rounded-lg" />
            <div className="shimmer mt-3 h-4 w-full rounded-lg" />
            <div className="shimmer mt-2 h-4 w-5/6 rounded-lg" />
          </div>
        ))}
        {!loading && ideas.length === 0 && (
          <EmptyState icon={<Lightbulb className="h-5 w-5 text-slate-400" />} title="No ideas yet" desc="Pick a theme and hit generate — fresh, on-brand concepts in seconds." />
        )}
        {!loading && ideas.map(idea => {
          const M = CHANNEL_META[idea.channel];
          return (
            <motion.div key={idea.id} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
              className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200/70">
              <div className="flex items-center gap-2">
                <span className={cn('inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-bold', M.bg, M.color)}>
                  <M.Icon className="h-3 w-3" /> {M.label}
                </span>
                <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2.5 py-1 text-[11px] font-bold text-amber-700">
                  <Clock className="h-3 w-3" /> Post {idea.bestTime}
                </span>
              </div>
              <h3 className="mt-3 font-display text-lg font-bold leading-snug text-ink-900">{idea.hook}</h3>
              <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-slate-600">{idea.caption}</p>
              <p className="mt-2 text-[13px] font-bold text-sky-600">{idea.hashtags.join(' ')}</p>
              <div className="mt-3 flex items-center gap-2 rounded-2xl bg-slate-50 p-3 text-[13px] ring-1 ring-slate-100">
                <ChevronRight className="h-4 w-4 text-slate-400" />
                <span className="font-bold text-ink-900">CTA:</span> <span className="text-slate-600">{idea.cta}</span>
              </div>
              <div className="mt-3 flex gap-2">
                <button onClick={() => { useIdea(idea.id); toast({ title: 'Added to calendar as draft', tone: 'success' }); }}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-ink-900 px-4 py-2 text-[13px] font-bold text-white hover:bg-ink-700">
                  <Plus className="h-4 w-4" /> Use this idea
                </button>
                <button onClick={() => { navigator.clipboard?.writeText(`${idea.hook}\n\n${idea.caption}\n\n${idea.hashtags.join(' ')}`).catch(() => {}); toast({ title: 'Copied to clipboard', tone: 'info' }); }}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 px-4 py-2 text-[13px] font-bold text-slate-600 hover:bg-slate-50">
                  <Copy className="h-3.5 w-3.5" /> Copy
                </button>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

/* ---------------------------------- analytics ---------------------------------- */
function AnalyticsTab() {
  const { inbox, schedule } = useApp();
  const resolved = inbox.filter(m => m.status === 'resolved').length;
  const published = schedule.filter(s => s.status === 'published');
  const totalEng = published.reduce((a, s) => a + (s.likes || 0) + (s.comments || 0) + (s.shares || 0), 0);
  const bars = [
    { d: 'Mon', v: 42 }, { d: 'Tue', v: 68 }, { d: 'Wed', v: 55 }, { d: 'Thu', v: 80 }, { d: 'Fri', v: 96 }, { d: 'Sat', v: 61 }, { d: 'Sun', v: 38 },
  ];
  const max = Math.max(...bars.map(b => b.v));
  return (
    <div className="mt-6 grid gap-5 lg:grid-cols-[1fr_340px]">
      <div className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-200/70 sm:p-6">
        <h2 className="flex items-center gap-2 font-display text-lg font-bold text-ink-900"><BarChart3 className="h-5 w-5 text-sky-600" /> Engagement this week</h2>
        <p className="text-xs text-slate-500">Likes, comments, shares & mentions across all channels</p>
        <div className="mt-6 flex h-52 items-end gap-2.5 sm:gap-3">
          {bars.map((b, i) => (
            <div key={b.d} className="flex flex-1 flex-col items-center gap-2">
              <motion.div initial={{ height: 0 }} animate={{ height: `${(b.v / max) * 100}%` }} transition={{ delay: i * 0.06, duration: 0.5 }}
                className={cn('w-full rounded-t-xl', b.d === 'Fri' ? 'bg-gradient-to-t from-amber-400 to-orange-400' : 'bg-gradient-to-t from-sky-500 to-blue-400')} />
              <span className="text-[11px] font-bold text-slate-400">{b.d}</span>
            </div>
          ))}
        </div>
        <div className="mt-6 grid gap-3 sm:grid-cols-3">
          {[
            { Icon: TrendingUp, k: 'Reach', v: '412k', d: '+18% vs last week', c: 'text-sky-600 bg-sky-50' },
            { Icon: UserCheck, k: 'Response rate', v: `${Math.round((resolved / Math.max(1, inbox.length)) * 100)}%`, d: `${resolved} of ${inbox.length} resolved`, c: 'text-emerald-600 bg-emerald-50' },
            { Icon: SlidersHorizontal, k: 'Total engagement', v: totalEng.toLocaleString(), d: 'On published posts', c: 'text-violet-600 bg-violet-50' },
          ].map(s => (
            <div key={s.k} className="rounded-2xl bg-slate-50 p-4 ring-1 ring-slate-100">
              <span className={cn('inline-flex h-9 w-9 items-center justify-center rounded-xl', s.c)}><s.Icon className="h-4 w-4" /></span>
              <p className="mt-2 font-display text-2xl font-extrabold text-ink-900">{s.v}</p>
              <p className="text-xs font-bold text-slate-500">{s.k}</p>
              <p className="mt-0.5 text-[11px] text-slate-400">{s.d}</p>
            </div>
          ))}
        </div>
      </div>
      <aside className="space-y-4">
        <div className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-200/70">
          <p className="text-xs font-bold uppercase tracking-widest text-slate-400">Sentiment mix</p>
          <div className="mt-3 space-y-2.5">
            {(['positive', 'neutral', 'negative', 'urgent'] as const).map(s => {
              const n = inbox.filter(m => m.sentiment === s).length;
              const pct = Math.round((n / Math.max(1, inbox.length)) * 100);
              return (
                <div key={s}>
                  <div className="flex justify-between text-xs font-bold"><span className="capitalize text-slate-600">{s}</span><span className="text-ink-900">{pct}%</span></div>
                  <div className="mt-1 h-2 overflow-hidden rounded-full bg-slate-100">
                    <motion.div initial={{ width: 0 }} animate={{ width: `${pct}%` }} className={cn('h-full rounded-full',
                      s === 'positive' ? 'bg-emerald-500' : s === 'neutral' ? 'bg-slate-400' : s === 'negative' ? 'bg-rose-400' : 'bg-red-500')} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        <div className="rounded-3xl bg-gradient-to-br from-violet-600 to-purple-700 p-5 text-white shadow-lg">
          <Sparkles className="h-6 w-6 opacity-80" />
          <p className="mt-2 text-sm font-bold">AI insight</p>
          <p className="mt-1 text-[13px] leading-relaxed text-white/80">Friday 7:30 AM posts earn 2.4× reach. Queue-win stories outperform promos 3-to-1 — post one customer story weekly.</p>
        </div>
      </aside>
    </div>
  );
}
