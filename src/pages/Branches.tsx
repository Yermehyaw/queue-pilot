import { useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  AlertTriangle, Award, Bookmark, BookmarkCheck, Download, FileText, Heart, Lightbulb,
  MessageSquare, Network, Paperclip, Plus, Rocket, Search, Send, ShieldCheck, Sparkles,
  TrendingUp, Trophy, X,
} from 'lucide-react';
import { useApp } from '../lib/store';
import { BRANCHES, branchById, institutionById } from '../lib/data';
import { timeAgo } from '../lib/utils';
import { cn } from '../lib/cn';
import { EmptyState } from '../components/ui';
import type { PostType, VaultItem } from '../types';

const TYPE_META: Record<PostType, { label: string; pill: string; Icon: typeof Rocket }> = {
  strategy: { label: 'Strategy', pill: 'bg-teal-100 text-teal-700', Icon: Rocket },
  lesson: { label: 'Lesson learned', pill: 'bg-amber-100 text-amber-700', Icon: Lightbulb },
  resource: { label: 'Resource', pill: 'bg-sky-100 text-sky-700', Icon: FileText },
  alert: { label: 'Alert', pill: 'bg-rose-100 text-rose-700', Icon: AlertTriangle },
  win: { label: 'Win', pill: 'bg-emerald-100 text-emerald-700', Icon: Trophy },
};

export default function Branches() {
  const { posts, vault, toggleLike, toggleBookmark, addComment, addPost, addVaultItem, toast } = useApp();
  const [tab, setTab] = useState<'feed' | 'vault' | 'leaderboard'>('feed');
  const [filter, setFilter] = useState<'all' | PostType | 'saved'>('all');
  const [query, setQuery] = useState('');
  const [composerOpen, setComposerOpen] = useState(false);
  const [vaultOpen, setVaultOpen] = useState(false);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [commentDrafts, setCommentDrafts] = useState<Record<string, string>>({});

  const feed = useMemo(() => posts.filter(p =>
    (filter === 'all' || (filter === 'saved' ? p.bookmarked : p.type === filter)) &&
    (query === '' || (p.title + p.body + p.tags.join(' ')).toLowerCase().includes(query.toLowerCase()))
  ), [posts, filter, query]);

  const leaderboard = useMemo(() => [...BRANCHES].sort((a, b) => b.performance - a.performance), []);
  const topPost = useMemo(() => [...posts].sort((a, b) => b.likes - a.likes)[0], [posts]);

  return (
    <div className="min-h-screen bg-paper pb-20 pt-[88px]">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="overflow-hidden rounded-[28px] bg-ink-900 p-6 text-white sm:p-8">
          <div className="grid items-center gap-6 lg:grid-cols-[1fr_320px]">
            <div>
              <p className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.16em] text-amber-300">
                <Network className="h-3.5 w-3.5" /> Inter-branch collaboration
              </p>
              <h1 className="mt-3 font-display text-2xl font-extrabold tracking-tight sm:text-3xl">
                One network. Shared brains. Zero repeated mistakes.
              </h1>
              <p className="mt-2 max-w-xl text-sm leading-relaxed text-white/60">
                Finance teams across every branch share strategies, post-mortems, templates and fraud alerts —
                so a lesson learned in Yaba saves a queue in Lekki the same week.
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                <button onClick={() => setComposerOpen(true)}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-amber-400 px-4 py-2.5 text-[13px] font-bold text-ink-950 transition hover:bg-amber-300">
                  <Plus className="h-4 w-4" /> Share with network
                </button>
                <div className="flex rounded-xl bg-white/10 p-1">
                  {([['feed', 'Feed'], ['vault', 'Vault'], ['leaderboard', 'Leaderboard']] as const).map(([id, l]) => (
                    <button key={id} onClick={() => setTab(id)}
                      className={cn('rounded-lg px-3.5 py-1.5 text-[13px] font-bold transition', tab === id ? 'bg-white text-ink-900' : 'text-white/60 hover:text-white')}>
                      {l}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <div className="hidden rounded-2xl bg-white/5 p-4 ring-1 ring-white/10 lg:block">
              <p className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.16em] text-amber-300"><Sparkles className="h-3.5 w-3.5" /> Top contributor post</p>
              {topPost && (
                <>
                  <p className="mt-2 line-clamp-2 text-sm font-bold text-white">{topPost.title}</p>
                  <p className="mt-1 text-xs text-white/55">{topPost.author} · {branchById(topPost.branchId).name}</p>
                  <p className="mt-2 inline-flex items-center gap-1 text-xs font-bold text-rose-300"><Heart className="h-3.5 w-3.5 fill-rose-300" /> {topPost.likes} appreciations</p>
                </>
              )}
            </div>
          </div>
        </div>

        {tab === 'feed' && (
          <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_320px]">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                {(['all', 'strategy', 'lesson', 'resource', 'alert', 'win', 'saved'] as const).map(f => (
                  <button key={f} onClick={() => setFilter(f)}
                    className={cn('rounded-full px-3 py-1.5 text-xs font-bold capitalize transition',
                      filter === f ? 'bg-ink-900 text-white shadow' : 'bg-white text-slate-500 ring-1 ring-slate-200 hover:ring-slate-300')}>
                    {f === 'all' ? 'All posts' : f}
                  </button>
                ))}
                <div className="relative ml-auto min-w-[180px] flex-1 sm:max-w-[240px]">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search strategies, tags…"
                    className="w-full rounded-full border-0 bg-white py-2 pl-9 pr-3 text-[13px] shadow-sm ring-1 ring-slate-200 outline-none focus:ring-2 focus:ring-amber-300" />
                </div>
              </div>

              <div className="mt-4 space-y-4">
                {feed.map(p => {
                  const M = TYPE_META[p.type];
                  const isOpen = expanded === p.id;
                  return (
                    <motion.article key={p.id} layout initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
                      className="overflow-hidden rounded-3xl bg-white shadow-sm ring-1 ring-slate-200/70">
                      <div className="p-5 sm:p-6">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className={cn('inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-bold', M.pill)}>
                            <M.Icon className="h-3 w-3.5" /> {M.label}
                          </span>
                          {p.tags.map(t => <span key={t} className="rounded-full bg-slate-100 px-2 py-1 text-[11px] font-bold text-slate-500">#{t}</span>)}
                          <span className="ml-auto text-[11px] font-semibold text-slate-400">{timeAgo(p.createdAt)}</span>
                        </div>
                        <h2 className="mt-3 font-display text-lg font-bold leading-snug text-ink-900">{p.title}</h2>
                        <p className={cn('mt-2 whitespace-pre-line text-sm leading-relaxed text-slate-600', !isOpen && 'line-clamp-3')}>{p.body}</p>
                        <button onClick={() => setExpanded(isOpen ? null : p.id)} className="mt-1.5 text-[13px] font-bold text-teal-600 hover:underline">
                          {isOpen ? 'Show less' : 'Read full post'}
                        </button>
                        {p.impact && (
                          <div className="mt-3 flex items-center gap-2 rounded-2xl bg-emerald-50 px-4 py-2.5 text-[13px] font-bold text-emerald-700 ring-1 ring-emerald-100">
                            <TrendingUp className="h-4 w-4" /> {p.impact}
                          </div>
                        )}
                        {p.attachment && (
                          <button onClick={() => toast({ title: 'Download started', desc: p.attachment!.name, tone: 'success' })}
                            className="mt-3 flex w-full items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50/60 p-3 text-left transition hover:border-teal-300 hover:bg-teal-50/50">
                            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-ink-900 text-amber-300"><Paperclip className="h-4 w-4" /></span>
                            <span className="min-w-0 flex-1">
                              <span className="block truncate text-[13px] font-bold text-ink-900">{p.attachment.name}</span>
                              <span className="text-[11px] text-slate-400">{p.attachment.kind} · {p.attachment.size}</span>
                            </span>
                            <Download className="h-4 w-4 text-slate-400" />
                          </button>
                        )}
                        <div className="mt-4 flex items-center gap-2 border-t border-slate-100 pt-4">
                          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-amber-400 to-orange-500 text-[13px] font-extrabold text-white">
                            {p.author.charAt(0)}
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-[13px] font-bold text-ink-900">{p.author} <span className="font-medium text-slate-400">· {p.role}</span></p>
                            <p className="text-[11px] text-slate-400">{institutionById(branchById(p.branchId).institutionId).short} · {branchById(p.branchId).name}</p>
                          </div>
                          <button onClick={() => toggleLike(p.id)}
                            className={cn('inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold transition',
                              p.liked ? 'bg-rose-100 text-rose-600' : 'bg-slate-100 text-slate-500 hover:bg-rose-50 hover:text-rose-500')}>
                            <Heart className={cn('h-3.5 w-3.5', p.liked && 'fill-rose-500 text-rose-500')} /> {p.likes}
                          </button>
                          <button onClick={() => setExpanded(p.id)}
                            className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1.5 text-xs font-bold text-slate-500 hover:bg-slate-200">
                            <MessageSquare className="h-3.5 w-3.5" /> {p.comments.length}
                          </button>
                          <button onClick={() => { toggleBookmark(p.id); toast({ title: p.bookmarked ? 'Removed from saved' : 'Saved to your library', tone: 'info' }); }}
                            className={cn('rounded-full p-2 transition', p.bookmarked ? 'bg-amber-100 text-amber-600' : 'bg-slate-100 text-slate-400 hover:text-amber-500')}>
                            {p.bookmarked ? <BookmarkCheck className="h-4 w-4" /> : <Bookmark className="h-4 w-4" />}
                          </button>
                        </div>
                      </div>
                      <AnimatePresence>
                        {isOpen && (
                          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
                            <div className="space-y-2.5 border-t border-slate-100 bg-slate-50/60 px-5 py-4 sm:px-6">
                              {p.comments.map(c => (
                                <div key={c.id} className="flex gap-2.5">
                                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-ink-900 text-[11px] font-bold text-white">{c.author.charAt(0)}</div>
                                  <div className="rounded-2xl rounded-tl-md bg-white px-3.5 py-2.5 shadow-sm ring-1 ring-slate-100">
                                    <p className="text-[11px] font-bold text-ink-900">{c.author} <span className="font-medium text-slate-400">· {branchById(c.branchId).code} · {timeAgo(c.createdAt)}</span></p>
                                    <p className="mt-0.5 text-[13px] text-slate-600">{c.text}</p>
                                  </div>
                                </div>
                              ))}
                              <div className="flex gap-2 pt-1">
                                <input value={commentDrafts[p.id] || ''} onChange={e => setCommentDrafts({ ...commentDrafts, [p.id]: e.target.value })}
                                  onKeyDown={e => { if (e.key === 'Enter' && commentDrafts[p.id]?.trim()) { addComment(p.id, commentDrafts[p.id].trim()); setCommentDrafts({ ...commentDrafts, [p.id]: '' }); } }}
                                  placeholder="Add a comment for the network…"
                                  className="flex-1 rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-[13px] outline-none focus:border-amber-400" />
                                <button onClick={() => { if (commentDrafts[p.id]?.trim()) { addComment(p.id, commentDrafts[p.id].trim()); setCommentDrafts({ ...commentDrafts, [p.id]: '' }); } }}
                                  className="rounded-xl bg-ink-900 px-4 text-white hover:bg-ink-700"><Send className="h-4 w-4" /></button>
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.article>
                  );
                })}
                {feed.length === 0 && <EmptyState icon={<Network className="h-5 w-5 text-slate-400" />} title="Nothing here yet" desc="Try another filter — or be the first to share with the network." action={<button onClick={() => setComposerOpen(true)} className="rounded-xl bg-ink-900 px-4 py-2.5 text-sm font-bold text-white">Share a post</button>} />}
              </div>
            </div>

            {/* right rail */}
            <aside className="space-y-4">
              <div className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-200/70">
                <p className="flex items-center gap-1.5 text-sm font-bold text-ink-900"><ShieldCheck className="h-4 w-4 text-rose-500" /> Fraud-watch radar</p>
                <p className="mt-1 text-xs text-slate-500">Live alerts from Risk & branches</p>
                <div className="mt-3 space-y-2">
                  {posts.filter(p => p.type === 'alert').map(a => (
                    <div key={a.id} className="rounded-2xl bg-rose-50 p-3 ring-1 ring-rose-100">
                      <p className="line-clamp-2 text-[13px] font-bold text-rose-800">{a.title}</p>
                      <p className="mt-1 text-[11px] text-rose-500">{branchById(a.branchId).code} · {timeAgo(a.createdAt)}</p>
                    </div>
                  ))}
                  <div className="rounded-2xl bg-slate-50 p-3 ring-1 ring-slate-100">
                    <p className="text-[13px] font-bold text-ink-900">Edited statements pattern</p>
                    <p className="mt-1 text-[11px] text-slate-500">3 branches · route all statements via Verify</p>
                  </div>
                </div>
              </div>
              <div className="rounded-3xl bg-gradient-to-br from-ink-900 to-ink-700 p-5 text-white shadow-lg">
                <p className="flex items-center gap-1.5 text-sm font-bold"><Award className="h-4 w-4 text-amber-300" /> Branch standings</p>
                <div className="mt-3 space-y-2">
                  {leaderboard.slice(0, 5).map((b, i) => (
                    <div key={b.id} className="flex items-center gap-2.5">
                      <span className={cn('flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[11px] font-extrabold',
                        i === 0 ? 'bg-amber-400 text-ink-950' : i === 1 ? 'bg-slate-300 text-ink-900' : i === 2 ? 'bg-orange-300 text-ink-900' : 'bg-white/10 text-white/60')}>{i + 1}</span>
                      <span className="min-w-0 flex-1 truncate text-[13px] font-semibold text-white/85">{b.name}</span>
                      <span className="font-mono text-[13px] font-bold text-teal-300">{b.performance}</span>
                    </div>
                  ))}
                </div>
                <button onClick={() => setTab('leaderboard')} className="mt-4 w-full rounded-xl bg-white/10 px-3 py-2 text-xs font-bold text-white hover:bg-white/15">Full leaderboard</button>
              </div>
            </aside>
          </div>
        )}

        {tab === 'vault' && <VaultTab vault={vault} onAdd={() => setVaultOpen(true)} />}
        {tab === 'leaderboard' && <LeaderboardTab />}
      </div>

      <AnimatePresence>
        {composerOpen && <ComposerModal onClose={() => setComposerOpen(false)} />}
        {vaultOpen && <VaultModal onClose={() => setVaultOpen(false)} onAdd={(v) => { addVaultItem(v); setVaultOpen(false); toast({ title: 'Added to vault', desc: v.name, tone: 'success' }); }} />}
      </AnimatePresence>
    </div>
  );
}

function VaultTab({ vault, onAdd }: { vault: VaultItem[]; onAdd: () => void }) {
  const { toast } = useApp();
  const [q, setQ] = useState('');
  const list = vault.filter(v => q === '' || v.name.toLowerCase().includes(q.toLowerCase()));
  const kinds = ['SOP', 'Template', 'Report', 'Training', 'Policy'] as const;
  return (
    <div className="mt-6 rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-200/70 sm:p-6">
      <div className="flex flex-wrap items-center gap-3">
        <div>
          <h2 className="font-display text-lg font-bold text-ink-900">Shared resource vault</h2>
          <p className="text-xs text-slate-500">SOPs, templates and runbooks every branch can reuse</p>
        </div>
        <div className="relative ml-auto min-w-[180px] flex-1 sm:max-w-[260px]">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input value={q} onChange={e => setQ(e.target.value)} placeholder="Search vault…"
            className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-9 pr-3 text-sm outline-none focus:border-amber-400 focus:bg-white" />
        </div>
        <button onClick={onAdd} className="inline-flex items-center gap-1.5 rounded-xl bg-ink-900 px-4 py-2.5 text-[13px] font-bold text-white hover:bg-ink-700">
          <Plus className="h-4 w-4" /> Upload resource
        </button>
      </div>
      <div className="mt-4 flex flex-wrap gap-1.5">
        {kinds.map(k => (
          <span key={k} className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-bold text-slate-500">
            {k} · {vault.filter(v => v.kind === k).length}
          </span>
        ))}
      </div>
      <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {list.map(v => (
          <div key={v.id} className="group rounded-2xl border border-slate-200 p-4 transition hover:border-amber-300 hover:shadow-md">
            <div className="flex items-start justify-between gap-2">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-100 text-amber-700"><FileText className="h-5 w-5" /></span>
              <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-500">{v.kind}</span>
            </div>
            <p className="mt-3 text-sm font-bold leading-snug text-ink-900">{v.name}</p>
            <p className="mt-1 text-[11px] text-slate-400">{branchById(v.branchId).name} · {v.size} · {v.downloads} downloads</p>
            <button onClick={() => toast({ title: 'Download started', desc: v.name, tone: 'success' })}
              className="mt-3 inline-flex w-full items-center justify-center gap-1.5 rounded-xl bg-slate-100 px-3 py-2 text-xs font-bold text-ink-900 transition hover:bg-ink-900 hover:text-white">
              <Download className="h-3.5 w-3.5" /> Download
            </button>
          </div>
        ))}
      </div>
      {list.length === 0 && <div className="mt-4"><EmptyState icon={<FileText className="h-5 w-5 text-slate-400" />} title="No resources" desc="Upload the first template or playbook for the network." /></div>}
    </div>
  );
}

function LeaderboardTab() {
  const leaderboard = useMemo(() => [...BRANCHES].sort((a, b) => b.performance - a.performance), []);
  const max = leaderboard[0]?.performance || 100;
  return (
    <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_340px]">
      <div className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-200/70 sm:p-6">
        <h2 className="font-display text-lg font-bold text-ink-900">Branch performance leaderboard</h2>
        <p className="text-xs text-slate-500">Composite of wait times, CSAT, no-show rate and verification speed</p>
        <div className="mt-5 space-y-3">
          {leaderboard.map((b, i) => (
            <div key={b.id} className={cn('rounded-2xl border p-4', i < 3 ? 'border-amber-200 bg-amber-50/50' : 'border-slate-100')}>
              <div className="flex items-center gap-3">
                <span className={cn('flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-extrabold',
                  i === 0 ? 'bg-amber-400 text-ink-950' : i === 1 ? 'bg-slate-300 text-ink-900' : i === 2 ? 'bg-orange-300 text-ink-900' : 'bg-slate-100 text-slate-500')}>{i + 1}</span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-bold text-ink-900">{b.name}</p>
                  <p className="text-[11px] text-slate-400">{institutionById(b.institutionId).name}</p>
                </div>
                <span className="font-display text-xl font-extrabold text-ink-900">{b.performance}</span>
              </div>
              <div className="ml-11 mt-2 h-2 overflow-hidden rounded-full bg-slate-100">
                <motion.div initial={{ width: 0 }} animate={{ width: `${(b.performance / max) * 100}%` }} transition={{ delay: i * 0.06, duration: 0.6 }}
                  className={cn('h-full rounded-full', i === 0 ? 'bg-gradient-to-r from-amber-400 to-orange-500' : 'bg-gradient-to-r from-teal-400 to-emerald-500')} />
              </div>
            </div>
          ))}
        </div>
      </div>
      <aside className="space-y-4">
        <div className="rounded-3xl bg-gradient-to-br from-amber-400 to-orange-500 p-5 text-ink-950 shadow-lg">
          <Trophy className="h-7 w-7" />
          <p className="mt-2 font-display text-base font-extrabold">Branch of the month</p>
          <p className="mt-1 text-[13px] font-semibold">Lekki Admiralty — 96 pts</p>
          <p className="mt-1 text-xs opacity-70">“10-minute promise” adopted by 6 branches</p>
        </div>
        <div className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-200/70">
          <p className="text-xs font-bold uppercase tracking-widest text-slate-400">How scoring works</p>
          <ul className="mt-3 space-y-2 text-[13px] text-slate-600">
            {[['On-time calls', '40%'], ['Customer rating', '25%'], ['No-show rate', '20%'], ['Doc pre-verification', '15%']].map(([k, v]) => (
              <li key={k} className="flex justify-between"><span>{k}</span><strong className="font-bold text-ink-900">{v}</strong></li>
            ))}
          </ul>
        </div>
      </aside>
    </div>
  );
}

function ComposerModal({ onClose }: { onClose: () => void }) {
  const { addPost, toast } = useApp();
  const [type, setType] = useState<PostType>('strategy');
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [tags, setTags] = useState('');
  const [impact, setImpact] = useState('');
  const [branchId, setBranchId] = useState('br-victoria');

  function submit() {
    if (title.trim().length < 4 || body.trim().length < 10) {
      toast({ title: 'Add a title and a little more detail', tone: 'warn' });
      return;
    }
    addPost({
      type, title: title.trim(), body: body.trim(), author: 'You (Ops Team)', role: 'Contributor',
      branchId, tags: tags.split(',').map(t => t.trim().toLowerCase().replace(/\s+/g, '-')).filter(Boolean).slice(0, 4),
      impact: impact.trim() || undefined,
    });
    toast({ title: 'Shared with the network', tone: 'success' });
    onClose();
  }

  return (
    <ModalShell onClose={onClose} title="Share with the network" subtitle="Strategies, lessons, resources, alerts and wins — every branch learns together.">
      <div className="flex flex-wrap gap-1.5">
        {(Object.keys(TYPE_META) as PostType[]).map(t => (
          <button key={t} onClick={() => setType(t)}
            className={cn('rounded-full px-3 py-1.5 text-xs font-bold capitalize transition', type === t ? 'bg-ink-900 text-white' : 'bg-slate-100 text-slate-500 hover:bg-slate-200')}>
            {TYPE_META[t].label}
          </button>
        ))}
      </div>
      <input value={title} onChange={e => setTitle(e.target.value)} placeholder="Give it a clear headline…"
        className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm font-bold outline-none focus:border-amber-400 focus:bg-white" />
      <textarea value={body} onChange={e => setBody(e.target.value)} rows={6}
        placeholder="What happened, what did you try, what worked? Be specific — branches will copy this."
        className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm outline-none focus:border-amber-400 focus:bg-white" />
      <div className="grid gap-2.5 sm:grid-cols-2">
        <input value={tags} onChange={e => setTags(e.target.value)} placeholder="Tags (comma separated)"
          className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm outline-none focus:border-amber-400 focus:bg-white" />
        <input value={impact} onChange={e => setImpact(e.target.value)} placeholder="Measured impact (e.g. Wait −40%)"
          className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm outline-none focus:border-amber-400 focus:bg-white" />
      </div>
      <select value={branchId} onChange={e => setBranchId(e.target.value)}
        className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm font-semibold outline-none focus:border-amber-400">
        {BRANCHES.map(b => <option key={b.id} value={b.id}>{institutionById(b.institutionId).short} · {b.name}</option>)}
      </select>
      <button onClick={submit} className="w-full rounded-xl bg-amber-400 px-4 py-3 text-sm font-bold text-ink-950 transition hover:bg-amber-300">
        Publish to network
      </button>
    </ModalShell>
  );
}

function VaultModal({ onClose, onAdd }: { onClose: () => void; onAdd: (v: Omit<VaultItem, 'id' | 'updatedAt' | 'downloads'>) => void }) {
  const [name, setName] = useState('');
  const [kind, setKind] = useState<VaultItem['kind']>('SOP');
  const [branchId, setBranchId] = useState('br-victoria');
  return (
    <ModalShell onClose={onClose} title="Upload to vault" subtitle="Share a file the whole network can download and reuse.">
      <input value={name} onChange={e => setName(e.target.value)} placeholder="Resource name (e.g. Weekend staffing SOP)"
        className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm font-bold outline-none focus:border-amber-400 focus:bg-white" />
      <div className="grid gap-2.5 sm:grid-cols-2">
        <select value={kind} onChange={e => setKind(e.target.value as VaultItem['kind'])}
          className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm font-semibold outline-none focus:border-amber-400">
          {['SOP', 'Template', 'Report', 'Training', 'Policy'].map(k => <option key={k}>{k}</option>)}
        </select>
        <select value={branchId} onChange={e => setBranchId(e.target.value)}
          className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm font-semibold outline-none focus:border-amber-400">
          {BRANCHES.map(b => <option key={b.id} value={b.id}>{b.code} · {b.name}</option>)}
        </select>
      </div>
      <button onClick={() => name.trim() && onAdd({ name: name.trim(), kind, branchId, size: `${(0.4 + Math.random() * 2).toFixed(1)} MB` })}
        className="w-full rounded-xl bg-ink-900 px-4 py-3 text-sm font-bold text-white hover:bg-ink-700">
        Add to vault
      </button>
    </ModalShell>
  );
}

export function ModalShell({ onClose, title, subtitle, children }: { onClose: () => void; title: string; subtitle: string; children: React.ReactNode }) {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-[80] flex items-end justify-center bg-ink-950/60 p-0 backdrop-blur-sm sm:items-center sm:p-6" onClick={onClose}>
      <motion.div initial={{ y: 40, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 40, opacity: 0 }}
        onClick={e => e.stopPropagation()}
        className="max-h-[92vh] w-full max-w-lg overflow-y-auto rounded-t-3xl bg-white p-6 sm:rounded-3xl">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="font-display text-lg font-bold text-ink-900">{title}</h3>
            <p className="mt-0.5 text-xs text-slate-500">{subtitle}</p>
          </div>
          <button onClick={onClose} className="rounded-full bg-slate-100 p-2 text-slate-500 hover:bg-slate-200"><X className="h-4 w-4" /></button>
        </div>
        <div className="mt-4 space-y-3">{children}</div>
      </motion.div>
    </motion.div>
  );
}
