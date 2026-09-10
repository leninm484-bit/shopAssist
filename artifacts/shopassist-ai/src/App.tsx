import { type FormEvent, type ReactNode, useMemo, useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ErrorBoundary } from '@/components/error-boundary';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import {
  Activity, ArrowLeft, ArrowRight, BarChart3, Bell, Bot, Check, ChevronDown,
  ChevronRight, CircleHelp, Clock3, Command, CreditCard, ExternalLink, Filter, Headphones,
  LayoutDashboard, LifeBuoy, Menu, MessageCircle, Package, PackageCheck, RefreshCw, RotateCcw,
  Search, Send, Settings2, ShieldCheck, ShoppingBag, Sparkles, Star, Tag, TrendingUp, Truck,
  Users, Wrench, X, Zap,
} from 'lucide-react';
import {
  getGetCustomerProfileQueryKey, getGetDashboardQueryKey, getGetOrderQueryKey,
  getListOrdersQueryKey, getListProductsQueryKey, getListReturnsQueryKey, useCreateReturn, useGetCustomerProfile,
  useGetDashboard, useGetOrder, useListOrders, useListProducts, useListReturns,
  useSendSupportMessage,
} from '@workspace/api-client-react';
import { Link, Route, Switch, useLocation, useParams } from 'wouter';

const queryClient = new QueryClient();

const navItems = [
  { href: '/dashboard', label: 'Overview', icon: LayoutDashboard },
  { href: '/support', label: 'Support inbox', icon: Headphones },
  { href: '/orders', label: 'Orders', icon: Package },
  { href: '/products', label: 'Product catalog', icon: ShoppingBag },
  { href: '/returns', label: 'Returns', icon: RotateCcw },
];

function Logo({ light = false }: { light?: boolean }) {
  return (
    <Link href="/" data-testid="link-logo" className="flex items-center gap-3">
      <span className={`grid h-9 w-9 place-items-center rounded-xl ${light ? 'bg-primary text-primary-foreground' : 'bg-[#ef775b] text-[#fff9f0]'}`}>
        <Sparkles size={18} strokeWidth={2.7} />
      </span>
      <span className={`font-display text-lg font-bold tracking-[-.04em] ${light ? 'text-sidebar-foreground' : 'text-foreground'}`}>ShopAssist<span className="text-primary">.ai</span></span>
    </Link>
  );
}

function AppSidebar() {
  const [location] = useLocation();
  return (
    <aside className="hidden w-[248px] shrink-0 flex-col bg-sidebar px-4 py-5 text-sidebar-foreground lg:flex">
      <div className="px-3"><Logo light /></div>
      <div className="mt-10 px-3 text-[10px] font-bold uppercase tracking-[.18em] text-sidebar-foreground/45">Workspace</div>
      <nav className="mt-3 space-y-1" aria-label="Workspace navigation">
        {navItems.map(({ href, label, icon: Icon }) => {
          const active = location === href || (href === '/orders' && location.startsWith('/orders/'));
          return (
            <Link key={href} href={href} data-testid={`link-nav-${label.toLowerCase().replaceAll(' ', '-')}`} className={`group flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold ${active ? 'bg-sidebar-accent text-sidebar-accent-foreground' : 'text-sidebar-foreground/62 hover:bg-sidebar-accent/65 hover:text-sidebar-foreground'}`}>
              <Icon size={17} className={active ? 'text-primary' : 'text-sidebar-foreground/55'} />
              {label}
              {label === 'Support inbox' && <span className="ml-auto rounded-full bg-primary px-1.5 py-0.5 text-[10px] text-primary-foreground">4</span>}
            </Link>
          );
        })}
      </nav>
      <div className="mt-auto rounded-2xl border border-sidebar-border bg-sidebar-accent/50 p-4">
        <div className="flex items-center gap-2 text-xs font-semibold"><span className="h-2 w-2 rounded-full bg-[#8ee2bb]" /> Agent is online</div>
        <p className="mt-2 text-xs leading-relaxed text-sidebar-foreground/50">ShopAssist is handling customer conversations and watching your tools.</p>
        <Link href="/support" data-testid="link-sidebar-open-inbox" className="mt-3 inline-flex items-center gap-1.5 text-xs font-bold text-primary hover:gap-2.5">Open inbox <ArrowRight size={13} /></Link>
      </div>
      <div className="mt-4 flex items-center gap-3 rounded-xl px-3 py-3">
        <span className="grid h-8 w-8 place-items-center rounded-full bg-[#f3c77a] text-xs font-bold text-[#4e3619]">JR</span>
        <div className="min-w-0"><div className="truncate text-xs font-bold">Jordan Reed</div><div className="truncate text-[11px] text-sidebar-foreground/45">Operations lead</div></div>
        <Settings2 size={15} className="ml-auto text-sidebar-foreground/40" />
      </div>
    </aside>
  );
}

function Topbar({ title, eyebrow }: { title: string; eyebrow?: string }) {
  return (
    <header className="border-b border-border bg-background/80 px-5 py-4 backdrop-blur md:px-8">
      <div className="flex min-h-[38px] items-center justify-between">
        <div className="flex items-center gap-3 lg:hidden"><Menu size={19} /><Logo /></div>
        <div className="hidden lg:block">
          {eyebrow && <div className="font-mono-ui text-[10px] font-medium uppercase tracking-[.18em] text-muted-foreground">{eyebrow}</div>}
          <h1 className="font-display text-xl font-bold tracking-[-.04em]">{title}</h1>
        </div>
        <div className="flex items-center gap-2">
          <button type="button" data-testid="button-command-menu" className="hidden items-center gap-2 rounded-lg border border-border bg-card px-3 py-2 text-xs text-muted-foreground hover:border-primary/50 sm:flex"><Command size={14} /> Quick find <kbd className="rounded bg-muted px-1.5 py-0.5 font-mono-ui text-[10px]">⌘ K</kbd></button>
          <button type="button" data-testid="button-notifications" className="relative rounded-lg border border-border bg-card p-2.5 text-muted-foreground hover:text-foreground"><Bell size={16} /><span className="absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full bg-primary" /></button>
          <span className="hidden h-8 w-px bg-border sm:block" />
          <span className="grid h-8 w-8 place-items-center rounded-full bg-[#f3c77a] text-xs font-bold text-[#4e3619]">JR</span>
        </div>
      </div>
      <nav className="mt-4 flex gap-2 overflow-x-auto lg:hidden" aria-label="Mobile workspace navigation">
        {navItems.map(({ href, label }) => <Link key={href} href={href} data-testid={`link-mobile-nav-${label.toLowerCase().replaceAll(' ', '-')}`} className="shrink-0 rounded-full border border-border bg-card px-3 py-1.5 text-[11px] font-bold text-muted-foreground hover:border-primary/50 hover:text-foreground">{label}</Link>)}
      </nav>
    </header>
  );
}

function Shell({ children, title, eyebrow }: { children: ReactNode; title: string; eyebrow?: string }) {
  return <div className="noise flex min-h-[100dvh] bg-background"><AppSidebar /><div className="min-w-0 flex-1"><Topbar title={title} eyebrow={eyebrow} /><main className="mx-auto max-w-[1440px] p-5 md:p-8">{children}</main></div></div>;
}

function Landing() {
  const [, setLocation] = useLocation();
  return (
    <div className="noise min-h-[100dvh] overflow-hidden bg-background">
      <nav className="relative z-10 mx-auto flex max-w-7xl items-center justify-between px-5 py-5 md:px-8">
        <Logo />
        <div className="hidden items-center gap-6 text-sm font-semibold text-muted-foreground md:flex">
          <a href="#how-it-works" data-testid="link-how-it-works" className="hover:text-foreground">How it works</a>
          <a href="#capabilities" data-testid="link-capabilities" className="hover:text-foreground">Capabilities</a>
          <Link href="/support" data-testid="link-support-workspace" className="hover:text-foreground">Support</Link>
          <Link href="/orders" data-testid="link-orders-workspace" className="hover:text-foreground">Orders</Link>
          <Link href="/dashboard" data-testid="link-operator-view" className="hover:text-foreground">Operator view</Link>
        </div>
        <button type="button" onClick={() => setLocation('/support')} data-testid="button-start-demo" className="rounded-full bg-foreground px-4 py-2.5 text-sm font-bold text-background hover:-translate-y-0.5">Open the demo <ArrowRight className="ml-1 inline" size={15} /></button>
      </nav>
      <section className="relative mx-auto grid max-w-7xl items-center gap-14 px-5 pb-20 pt-16 md:grid-cols-[1.1fr_.9fr] md:px-8 md:pb-28 md:pt-24">
        <div className="absolute -left-24 top-12 -z-0 h-72 w-72 rounded-full bg-[#f7c36b]/30 blur-3xl" />
        <div className="relative z-10 animate-rise-in">
          <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-[#b8ded4] bg-secondary/60 px-3 py-1.5 text-xs font-bold text-secondary-foreground"><span className="h-1.5 w-1.5 rounded-full bg-[#36a884]" /> Customer support, with a point of view</div>
          <h1 className="max-w-3xl font-display text-[clamp(3.4rem,7vw,7.2rem)] font-extrabold leading-[.91] tracking-[-.075em]">Helpful feels<br /><span className="text-primary">different</span> now.</h1>
          <p className="mt-8 max-w-lg text-lg leading-relaxed text-muted-foreground">ShopAssist AI turns “where is my order?” into a thoughtful answer, a useful action, and a customer who wants to come back.</p>
          <div className="mt-9 flex flex-wrap items-center gap-3">
            <button type="button" onClick={() => setLocation('/support')} data-testid="button-try-concierge" className="rounded-xl bg-primary px-5 py-3.5 text-sm font-bold text-primary-foreground shadow-[0_8px_24px_hsl(var(--primary)/.2)] hover:-translate-y-0.5">Try the AI concierge <ArrowRight className="ml-1 inline" size={16} /></button>
            <Link href="/dashboard" data-testid="link-see-operator-view" className="rounded-xl border border-border bg-card px-5 py-3.5 text-sm font-bold hover:-translate-y-0.5 hover:border-primary/50">See operator view</Link>
          </div>
          <div className="mt-12 flex items-center gap-5 text-xs text-muted-foreground"><div className="flex -space-x-2"><span className="grid h-8 w-8 place-items-center rounded-full border-2 border-background bg-[#f3c77a] text-[10px] font-bold">AM</span><span className="grid h-8 w-8 place-items-center rounded-full border-2 border-background bg-[#9cd6ca] text-[10px] font-bold">RK</span><span className="grid h-8 w-8 place-items-center rounded-full border-2 border-background bg-[#eaa494] text-[10px] font-bold">SL</span></div><span><strong className="text-foreground">2,400+</strong> conversations ready for help</span></div>
        </div>
        <div className="relative min-h-[420px] animate-rise-in [animation-delay:120ms]">
          <div className="absolute right-0 top-4 h-[390px] w-[92%] rotate-2 rounded-[2rem] bg-[#173047] shadow-2xl shadow-[#173047]/20" />
          <div className="absolute right-4 top-0 w-[92%] rounded-[2rem] border border-border bg-card p-5 shadow-2xl shadow-[#173047]/10 md:p-6">
            <div className="flex items-center justify-between border-b border-border pb-4"><div className="flex items-center gap-2"><span className="grid h-8 w-8 place-items-center rounded-lg bg-secondary text-secondary-foreground"><Bot size={16} /></span><div><div className="text-xs font-bold">ShopAssist</div><div className="font-mono-ui text-[9px] text-[#36a884]">● online now</div></div></div><span className="rounded-full bg-[#fff0df] px-2 py-1 text-[9px] font-bold text-[#aa5c32]">CONCIERGE MODE</span></div>
            <div className="space-y-4 py-5"><div className="ml-auto max-w-[80%] rounded-2xl rounded-tr-sm bg-foreground px-4 py-3 text-sm text-background">Can I change the size on my new jacket?</div><div className="max-w-[88%] rounded-2xl rounded-tl-sm bg-secondary/70 px-4 py-3 text-sm leading-relaxed text-secondary-foreground">Absolutely. I found your order and the medium is still in stock. I can set that up for you now.</div><div className="rounded-xl border border-[#ead9b8] bg-[#fff9ea] p-3"><div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-[#a5762c]"><Wrench size={12} /> Tool used · order lookup</div><div className="mt-1 text-xs text-[#6e5832]">Order SA-29481 · exchange eligible</div></div></div>
            <div className="flex items-center gap-2 rounded-xl border border-border px-3 py-3 text-xs text-muted-foreground"><span>Reply to Alex…</span><Send className="ml-auto text-primary" size={15} /></div>
          </div>
          <div className="absolute -bottom-4 -left-4 rounded-2xl border border-border bg-card p-4 shadow-xl"><div className="flex items-center gap-2 text-xs font-bold"><span className="grid h-7 w-7 place-items-center rounded-lg bg-[#e3f5ed] text-[#2a9877]"><Check size={15} /></span> Resolved by AI</div><div className="mt-2 font-display text-2xl font-bold">47.2%</div><div className="text-[10px] text-muted-foreground">this week</div></div>
        </div>
      </section>
      <section id="how-it-works" className="border-y border-border bg-card/55 px-5 py-20 md:px-8">
        <div className="mx-auto max-w-7xl"><div className="mb-12 max-w-lg"><div className="font-mono-ui text-xs font-medium uppercase tracking-[.18em] text-primary">A better handoff</div><h2 className="mt-3 font-display text-4xl font-bold tracking-[-.06em] md:text-5xl">Every answer has a next step.</h2></div>
          <div className="grid gap-px overflow-hidden rounded-3xl border border-border bg-border md:grid-cols-3">{[['01','Ask','A customer says what they need in their own words.','“My package looks stuck.”'],['02','AI understands','Intent, context, and history come together in a second.','Delivery concern · Alex Kumar'],['03','Action','The right tool does the useful thing, then explains it.','Checked carrier · ETA tomorrow']].map(([num,title,desc,quote]) => <div key={num} className="bg-background p-7 md:p-9"><span className="font-mono-ui text-xs text-primary">{num}</span><h3 className="mt-16 font-display text-2xl font-bold">{title}</h3><p className="mt-3 text-sm leading-relaxed text-muted-foreground">{desc}</p><div className="mt-7 border-l-2 border-primary/50 pl-3 text-xs font-semibold text-foreground">{quote}</div></div>)}</div>
        </div>
      </section>
       <section id="capabilities" className="mx-auto max-w-7xl px-5 py-20 md:px-8"><div className="grid gap-12 md:grid-cols-[.8fr_1.2fr]"><div><div className="font-mono-ui text-xs uppercase tracking-[.18em] text-primary">Designed for the whole team</div><h2 className="mt-3 font-display text-4xl font-bold tracking-[-.06em] md:text-5xl">Warm on the front.<br />Clear on the back.</h2></div><div className="grid gap-4 sm:grid-cols-2"><Feature icon={MessageCircle} title="AI support" body="Suggested replies, customer context, and real actions in one calm workspace." /><Feature icon={Truck} title="Order tracking" body="Give customers a clear answer about where every package is right now." /><Feature icon={ShoppingBag} title="Product discovery" body="Search the catalog and turn browsing questions into useful recommendations." /><Feature icon={RotateCcw} title="Returns" body="Make aftercare visible from the first request through pickup and refund." /><Feature icon={Users} title="Customer memory" body="Preference-aware help that remembers Alex without being creepy about it." /><Feature icon={BarChart3} title="Agent analytics" body="Spot issue patterns and agent performance before they become tickets." /></div></div></section>
      <footer className="mx-auto flex max-w-7xl flex-col gap-5 border-t border-border px-5 py-8 text-xs text-muted-foreground md:flex-row md:items-center md:justify-between md:px-8"><Logo /><span>Support that feels like someone thought about it.</span></footer>
    </div>
  );
}

function Feature({ icon: Icon, title, body }: { icon: typeof Sparkles; title: string; body: string }) {
  return <div className="rounded-2xl border border-border bg-card p-5"><span className="grid h-9 w-9 place-items-center rounded-xl bg-secondary text-secondary-foreground"><Icon size={17} /></span><h3 className="mt-4 font-bold">{title}</h3><p className="mt-2 text-sm leading-relaxed text-muted-foreground">{body}</p></div>;
}

function PageIntro({ kicker, title, body, action }: { kicker: string; title: string; body: string; action?: ReactNode }) {
  return <div className="mb-8 flex flex-col justify-between gap-5 md:flex-row md:items-end"><div><div className="font-mono-ui text-[10px] font-medium uppercase tracking-[.18em] text-primary">{kicker}</div><h2 className="mt-2 font-display text-3xl font-bold tracking-[-.055em] md:text-4xl">{title}</h2><p className="mt-2 max-w-2xl text-sm text-muted-foreground">{body}</p></div>{action}</div>;
}

function EmptyState({ icon: Icon, title, body, action }: { icon: typeof Package; title: string; body: string; action?: ReactNode }) {
  return <div className="rounded-2xl border border-dashed border-border bg-card/50 p-12 text-center"><span className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-secondary text-secondary-foreground"><Icon size={21} /></span><h3 className="mt-4 font-display text-lg font-bold">{title}</h3><p className="mx-auto mt-2 max-w-sm text-sm text-muted-foreground">{body}</p>{action && <div className="mt-5">{action}</div>}</div>;
}

function QueryError({ retry }: { retry: () => void }) {
  return <div className="rounded-2xl border border-[#efc1b8] bg-[#fff5f2] p-6 text-center"><CircleHelp className="mx-auto text-primary" size={22} /><p className="mt-2 text-sm font-semibold">That didn’t load as planned.</p><p className="mt-1 text-xs text-muted-foreground">Try again and we’ll reconnect the workspace.</p><button type="button" onClick={retry} data-testid="button-retry" className="mt-4 rounded-lg bg-primary px-3 py-2 text-xs font-bold text-primary-foreground">Retry</button></div>;
}

function SupportPage() {
  const [location] = useLocation();
  const profileQuery = useGetCustomerProfile({ query: { queryKey: getGetCustomerProfileQueryKey() } });
  const profile = profileQuery.data;
  const sendMessage = useSendSupportMessage();
  const promptFromCatalog = new URLSearchParams(location.split('?')[1] ?? '').get('prompt') ?? '';
  const [message, setMessage] = useState(promptFromCatalog);
  const [selected, setSelected] = useState('alex');
  const [history, setHistory] = useState<Array<{ user?: string; response?: any }>>([]);
  const prompts = [
    ['Track my order', 'Where is my order #QC1024?'],
    ['Return an order', 'I want to return #QC1024 because it is damaged.'],
    ['Check refund', 'Has my refund arrived for #QC1024?'],
    ['Find a product', 'Find running shoes under ₹5000.'],
    ['Recommend something', 'Recommend something for my running routine.'],
  ] as const;
  const handleSend = (value = message) => {
    if (!value.trim() || sendMessage.isPending) return;
    setMessage('');
    sendMessage.mutate({ data: { message: value } }, { onSuccess: (response) => setHistory((items) => [...items, { user: value, response }]) });
  };
  return (
    <Shell title="Support inbox" eyebrow="Live workspace">
      <div className="mb-6 flex items-center justify-between gap-3"><div className="flex items-center gap-2 text-xs text-muted-foreground"><span className="h-2 w-2 rounded-full bg-[#35ad83]" /> 6 agents online <span className="text-border">/</span> 4 conversations waiting</div><button type="button" data-testid="button-new-conversation" onClick={() => { setHistory([]); setMessage(''); }} className="rounded-lg border border-border bg-card px-3 py-2 text-xs font-bold hover:border-primary/50"><MessageCircle size={14} className="mr-1.5 inline" /> New conversation</button></div>
      <div className="grid min-h-[calc(100dvh-190px)] gap-4 xl:grid-cols-[260px_minmax(420px,1fr)_300px]">
        <section className="rounded-2xl border border-border bg-card p-3"><div className="flex items-center justify-between px-2 py-2"><h2 className="font-display text-sm font-bold">Conversations</h2><span className="font-mono-ui text-[10px] text-muted-foreground">4 open</span></div><div className="my-2 flex items-center gap-2 rounded-lg border border-border px-2.5 py-2 text-xs text-muted-foreground"><Search size={14} /><input aria-label="Search conversations" data-testid="input-search-conversations" className="w-full bg-transparent outline-none placeholder:text-muted-foreground" placeholder="Search" /></div><div className="space-y-1">{[['alex','Alex Kumar','Can I change the size…','2m','AK'],['maya','Maya Singh','Package arrived early!','18m','MS'],['liam','Liam Chen','I was charged twice','1h','LC'],['sarah','Sarah Okafor','Thanks for sorting this','3h','SO']].map(([id,name,preview,time,initials], index) => <button type="button" key={id} onClick={() => setSelected(id)} data-testid={`button-conversation-${id}`} className={`flex w-full items-start gap-3 rounded-xl p-3 text-left ${selected === id ? 'bg-secondary' : 'hover:bg-muted'}`}><span className={`grid h-8 w-8 shrink-0 place-items-center rounded-full text-[10px] font-bold ${index % 2 ? 'bg-[#e7b8a7]' : 'bg-[#f3c77a]'}`}>{initials}</span><span className="min-w-0 flex-1"><span className="flex items-center justify-between"><strong className="truncate text-xs">{name}</strong><span className="font-mono-ui text-[9px] text-muted-foreground">{time}</span></span><span className="mt-1 block truncate text-[11px] text-muted-foreground">{preview}</span></span>{index === 0 && <span className="mt-1 h-1.5 w-1.5 rounded-full bg-primary" />}</button>)}</div></section>
        <section className="flex min-h-[560px] flex-col overflow-hidden rounded-2xl border border-border bg-card"><div className="flex items-center justify-between border-b border-border px-5 py-4"><div className="flex items-center gap-3"><span className="grid h-9 w-9 place-items-center rounded-full bg-[#f3c77a] text-xs font-bold">AK</span><div><h2 className="text-sm font-bold">{selected === 'alex' ? 'Alex Kumar' : 'Customer conversation'}</h2><p className="text-[11px] text-muted-foreground">Customer since Oct 2023 · <span className="text-[#26966f]">online</span></p></div></div><div className="flex items-center gap-1.5"><button type="button" data-testid="button-mark-resolved" className="rounded-lg border border-border p-2 text-muted-foreground hover:text-[#25946c]" title="Mark resolved"><Check size={15} /></button><button type="button" data-testid="button-more-conversation" className="rounded-lg border border-border p-2 text-muted-foreground"><Activity size={15} /></button></div></div><div className="flex-1 space-y-5 overflow-y-auto p-5"><div className="text-center font-mono-ui text-[9px] uppercase tracking-widest text-muted-foreground">Today · 10:42 AM</div><div className="ml-auto max-w-[78%] rounded-2xl rounded-tr-sm bg-foreground px-4 py-3 text-sm text-background">Can I change the size on my new jacket?</div><ActivityCard step="Analyzing request" icon={Sparkles} tone="teal">Looking at Alex’s recent order and exchange policy.</ActivityCard><ActivityCard step="Tool used" icon={Wrench} tone="gold">Order lookup <span className="ml-1 font-mono-ui text-[10px]">SA-29481</span></ActivityCard><ActivityCard step="Result" icon={Check} tone="green">Medium is in stock · exchange eligible until Jan 24</ActivityCard><div className="max-w-[84%] rounded-2xl rounded-tl-sm bg-secondary/70 px-4 py-3 text-sm leading-relaxed text-secondary-foreground">Absolutely. I found your order and the medium is still in stock. I can set that up for you now.</div>{history.map((item, i) => <div key={i} className="space-y-3"><div className="ml-auto max-w-[78%] rounded-2xl rounded-tr-sm bg-foreground px-4 py-3 text-sm text-background">{item.user}</div>{sendMessage.isPending && i === history.length - 1 ? <ActivityCard step="Thinking" icon={Sparkles} tone="teal">Checking order context and choosing the right next step…</ActivityCard> : item.response && <><ActivityCard step={item.response.toolLabel || 'Tool used'} icon={Wrench} tone="gold">{item.response.resultSummary || 'Agent tool completed'}</ActivityCard><div className="max-w-[84%] rounded-2xl rounded-tl-sm bg-secondary/70 px-4 py-3 text-sm leading-relaxed text-secondary-foreground">{item.response.reply}</div></>}</div>)}</div><div className="border-t border-border p-4"><div className="mb-3 flex gap-2 overflow-x-auto">{prompts.map(([label, prompt]) => <button type="button" key={label} onClick={() => { setMessage(prompt); }} data-testid={`button-prompt-${label.toLowerCase().replaceAll(' ', '-')}`} className="shrink-0 rounded-full border border-border px-3 py-1.5 text-[11px] font-semibold text-muted-foreground hover:border-primary/50 hover:text-foreground">{label}</button>)}</div><form onSubmit={(e) => { e.preventDefault(); handleSend(); }} className="flex items-center gap-2 rounded-xl border border-border bg-background px-3 py-2"><input value={message} onChange={(e) => setMessage(e.target.value)} data-testid="input-support-message" className="min-w-0 flex-1 bg-transparent py-2 text-sm outline-none placeholder:text-muted-foreground" placeholder="Ask ShopAssist to help Alex…" /><button type="submit" disabled={!message.trim() || sendMessage.isPending} data-testid="button-send-support-message" className="grid h-9 w-9 place-items-center rounded-lg bg-primary text-primary-foreground disabled:opacity-40"><Send size={15} /></button></form></div></section>
        <aside className="space-y-4"><section className="rounded-2xl border border-border bg-card p-5">{profileQuery.isLoading ? <Skeleton lines={4} /> : profileQuery.isError ? <QueryError retry={() => profileQuery.refetch()} /> : profile ? <><div className="flex items-center justify-between"><h2 className="font-display text-sm font-bold">Customer memory</h2><button type="button" data-testid="button-edit-memory" className="text-muted-foreground hover:text-foreground"><Settings2 size={15} /></button></div><div className="mt-5 flex items-center gap-3"><span className="grid h-12 w-12 place-items-center rounded-full bg-[#f3c77a] font-display text-lg font-bold text-[#4e3619]">{profile.initials}</span><div><div data-testid="text-customer-name" className="font-bold">{profile.name}</div><div className="text-xs text-muted-foreground">{profile.email}</div></div></div><div className="mt-5 space-y-3 border-t border-border pt-4"><MemoryRow label="Prefers" value={profile.preferredCategory} /><MemoryRow label="Last purchase" value={profile.lastPurchase} /><MemoryRow label="Support style" value={profile.supportPreference} /><MemoryRow label="Orders" value={`${profile.pastOrders} completed`} /></div><div className="mt-5 rounded-xl bg-[#fff7e7] p-3 text-xs leading-relaxed text-[#795c2c]"><Star size={13} className="mb-1 inline fill-[#d39b42] text-[#d39b42]" /> Alex usually shops on mobile and appreciates options, not apologies.</div></> : null}</section><section className="rounded-2xl border border-border bg-card p-5"><div className="flex items-center justify-between"><h2 className="font-display text-sm font-bold">Conversation details</h2><span className="rounded-full bg-[#e6f5ef] px-2 py-1 text-[10px] font-bold text-[#268c6a]">AI assisted</span></div><div className="mt-4 space-y-3 text-xs"><div className="flex justify-between"><span className="text-muted-foreground">Category</span><span className="font-semibold">Exchange</span></div><div className="flex justify-between"><span className="text-muted-foreground">Priority</span><span className="font-semibold">Normal</span></div><div className="flex justify-between"><span className="text-muted-foreground">First response</span><span className="font-mono-ui">18 sec</span></div></div></section></aside>
      </div>
    </Shell>
  );
}

function ActivityCard({ step, icon: Icon, tone, children }: { step: string; icon: typeof Sparkles; tone: 'teal' | 'gold' | 'green'; children: ReactNode }) {
  const tones = { teal: 'border-[#b8ded4] bg-[#f1fbf8] text-[#277e6a]', gold: 'border-[#ead9b8] bg-[#fff9ea] text-[#966c26]', green: 'border-[#b9dfc8] bg-[#f1fbf4] text-[#2b8157]' };
  return <div className={`flex items-center gap-3 rounded-xl border px-3 py-2.5 text-xs ${tones[tone]}`}><Icon size={14} /><span><strong className="mr-1 font-mono-ui text-[9px] uppercase tracking-wider">{step}</strong>{children}</span></div>;
}
function MemoryRow({ label, value }: { label: string; value: string }) { return <div className="flex items-start justify-between gap-3 text-xs"><span className="text-muted-foreground">{label}</span><span className="text-right font-semibold">{value}</span></div>; }
function Skeleton({ lines = 3 }: { lines?: number }) { return <div className="space-y-3 animate-pulse-soft">{Array.from({ length: lines }).map((_, i) => <div key={i} className={`h-3 rounded bg-muted ${i === lines - 1 ? 'w-2/3' : 'w-full'}`} />)}</div>; }

function OrdersPage() {
  const ordersQuery = useListOrders({ query: { queryKey: getListOrdersQueryKey() } });
  const orders = ordersQuery.data ?? [];
  const [search, setSearch] = useState('');
  const filtered = orders.filter((order) => `${order.id} ${order.product} ${order.customer}`.toLowerCase().includes(search.toLowerCase()));
  return <Shell title="Orders" eyebrow="Commerce operations"><PageIntro kicker="Order desk" title="Every package, accounted for." body="Search customer orders, check delivery status, and jump into the full timeline." action={<button type="button" data-testid="button-export-orders" className="rounded-lg border border-border bg-card px-3 py-2.5 text-xs font-bold hover:border-primary/50"><ExternalLink size={14} className="mr-1.5 inline" /> Export view</button>} /><div className="mb-5 flex flex-wrap gap-2"><div className="flex min-w-[240px] flex-1 items-center gap-2 rounded-xl border border-border bg-card px-3.5 py-3"><Search size={16} className="text-muted-foreground" /><input value={search} onChange={(e) => setSearch(e.target.value)} data-testid="input-search-orders" className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground" placeholder="Search by order, product, or customer" /></div><button type="button" data-testid="button-filter-orders" className="rounded-xl border border-border bg-card px-4 text-sm font-semibold hover:border-primary/50"><Filter size={15} className="mr-2 inline" /> Filters <ChevronDown size={14} className="ml-2 inline" /></button></div>{ordersQuery.isLoading ? <div className="rounded-2xl border border-border bg-card p-7"><Skeleton lines={8} /></div> : ordersQuery.isError ? <QueryError retry={() => ordersQuery.refetch()} /> : filtered.length === 0 ? <EmptyState icon={Package} title="No orders found" body="Try a different search term or clear the filter." action={<button type="button" onClick={() => setSearch('')} data-testid="button-clear-order-search" className="rounded-lg bg-primary px-3 py-2 text-xs font-bold text-primary-foreground">Clear search</button>} /> : <div className="overflow-hidden rounded-2xl border border-border bg-card"><div className="hidden grid-cols-[1.5fr_1fr_1fr_.8fr_.8fr_28px] gap-4 border-b border-border px-5 py-3 font-mono-ui text-[9px] uppercase tracking-wider text-muted-foreground md:grid"><span>Order</span><span>Customer</span><span>Placed</span><span>Status</span><span>Amount</span><span /></div>{filtered.map((order) => <Link href={`/orders/${order.id}`} key={order.id} data-testid={`link-order-${order.id}`} className="grid grid-cols-1 gap-2 border-b border-border px-5 py-4 last:border-0 hover:bg-muted/40 md:grid-cols-[1.5fr_1fr_1fr_.8fr_.8fr_28px] md:items-center md:gap-4"><div className="flex items-center gap-3"><img src={order.productImage} alt="" className="h-10 w-10 rounded-lg object-cover bg-muted" /><div><div className="text-sm font-bold">{order.product}</div><div className="font-mono-ui text-[10px] text-muted-foreground">{order.id}</div></div></div><div className="text-xs text-muted-foreground md:text-sm md:text-foreground">{order.customer}</div><div className="text-xs text-muted-foreground">{order.date}</div><div><StatusPill status={order.status} /></div><div className="text-sm font-bold">${order.amount.toFixed(2)}</div><ChevronRight size={16} className="hidden text-muted-foreground md:block" /></Link>)}</div>}</Shell>;
}

function OrdersPageFixed() {
  const ordersQuery = useListOrders({ query: { queryKey: getListOrdersQueryKey() } });
  const orders = ordersQuery.data ?? [];
  const [search, setSearch] = useState('');
  const filtered = orders.filter((order) => `${order.id} ${order.product} ${order.customer}`.toLowerCase().includes(search.toLowerCase()));

  return (
    <Shell title="Orders" eyebrow="Commerce operations">
      <PageIntro kicker="Order desk" title="Every package, accounted for." body="Search customer orders, check delivery status, and jump into the full timeline." />
      <div className="mb-5 flex items-center gap-2 rounded-xl border border-border bg-card px-3.5 py-3">
        <Search size={16} className="text-muted-foreground" />
        <input value={search} onChange={(event) => setSearch(event.target.value)} data-testid="input-search-orders" className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground" placeholder="Search by order, product, or customer" />
      </div>
      {ordersQuery.isLoading ? <div className="rounded-2xl border border-border bg-card p-7"><Skeleton lines={8} /></div> : ordersQuery.isError ? <QueryError retry={() => ordersQuery.refetch()} /> : filtered.length === 0 ? <EmptyState icon={Package} title="No orders found" body="Try a different search term or clear the filter." /> : (
        <div className="overflow-hidden rounded-2xl border border-border bg-card">
          <div className="hidden grid-cols-[1.5fr_1fr_1fr_.8fr_.8fr_28px] gap-4 border-b border-border px-5 py-3 font-mono-ui text-[9px] uppercase tracking-wider text-muted-foreground md:grid"><span>Order</span><span>Customer</span><span>Placed</span><span>Status</span><span>Amount</span><span /></div>
          {filtered.map((order) => <Link href={`/orders/${encodeURIComponent(order.id)}`} key={order.id} data-testid={`link-order-${order.id}`} className="grid grid-cols-1 gap-2 border-b border-border px-5 py-4 last:border-0 hover:bg-muted/40 md:grid-cols-[1.5fr_1fr_1fr_.8fr_.8fr_28px] md:items-center md:gap-4"><div className="flex items-center gap-3"><img src={order.productImage} alt="" className="h-10 w-10 rounded-lg object-cover bg-muted" /><div><div className="text-sm font-bold">{order.product}</div><div className="font-mono-ui text-[10px] text-muted-foreground">{order.id}</div></div></div><div className="text-xs text-muted-foreground md:text-sm md:text-foreground">{order.customer}</div><div className="text-xs text-muted-foreground">{order.date}</div><div><StatusPill status={order.status} /></div><div className="text-sm font-bold">₹{order.amount.toLocaleString('en-IN')}</div><ChevronRight size={16} className="hidden text-muted-foreground md:block" /></Link>)}
        </div>
      )}
    </Shell>
  );
}

function StatusPill({ status }: { status: string }) {
  const normalized = status.toLowerCase();
  const cls = normalized.includes('deliver') || normalized.includes('complete') ? 'bg-[#e6f5ef] text-[#268c6a]' : normalized.includes('transit') ? 'bg-[#eaf2fb] text-[#41709c]' : normalized.includes('return') ? 'bg-[#fff2e8] text-[#ad663e]' : 'bg-muted text-muted-foreground';
  return <span data-testid={`status-${status.replaceAll(' ', '-').toLowerCase()}`} className={`inline-flex rounded-full px-2 py-1 text-[10px] font-bold ${cls}`}>{status}</span>;
}

function OrderDetailPage() {
  const { id = '' } = useParams<{ id: string }>();
  const orderQuery = useGetOrder(id, { query: { queryKey: getGetOrderQueryKey(id), enabled: !!id } });
  const order = orderQuery.data;
  return <Shell title="Order detail" eyebrow="Order desk"><Link href="/orders" data-testid="link-back-orders" className="mb-6 inline-flex items-center gap-2 text-xs font-bold text-muted-foreground hover:text-foreground"><ArrowLeft size={15} /> Back to orders</Link>{orderQuery.isLoading ? <div className="rounded-2xl border border-border bg-card p-8"><Skeleton lines={7} /></div> : orderQuery.isError ? <QueryError retry={() => orderQuery.refetch()} /> : order ? <div className="grid gap-5 lg:grid-cols-[1fr_340px]"><div className="space-y-5"><section className="rounded-2xl border border-border bg-card p-6"><div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start"><div><div className="font-mono-ui text-xs text-muted-foreground">{order.id}</div><h2 className="mt-1 font-display text-2xl font-bold tracking-[-.05em]">{order.product}</h2><p className="mt-1 text-sm text-muted-foreground">Placed {order.date} by {order.customer}</p></div><StatusPill status={order.status} /></div><div className="mt-7 flex items-center gap-4 rounded-xl bg-muted/60 p-4"><img src={order.productImage} alt="" className="h-16 w-16 rounded-xl object-cover" /><div className="flex-1"><div className="text-xs font-bold">Expected delivery</div><div className="mt-1 font-display text-xl font-bold">{order.expectedDelivery}</div><div className="mt-1 font-mono-ui text-[10px] text-muted-foreground">{order.trackingNumber}</div></div><Truck className="text-primary" size={24} /></div></section><section className="rounded-2xl border border-border bg-card p-6"><h3 className="font-display text-lg font-bold">Delivery timeline</h3><div className="mt-6 space-y-0">{order.timeline.map((step, i) => <div key={`${step.label}-${i}`} className="relative flex gap-4 pb-6 last:pb-0"><div className="relative z-10 grid h-7 w-7 shrink-0 place-items-center rounded-full border-2 border-card bg-muted">{step.completed ? <Check size={14} className="text-[#268c6a]" /> : <span className={`h-2 w-2 rounded-full ${step.current ? 'bg-primary' : 'bg-border'}`} />}</div>{i < order.timeline.length - 1 && <span className={`absolute left-[13px] top-7 h-full w-px ${step.completed ? 'bg-[#a9d7c3]' : 'bg-border'}`} />}<div><div className={`text-sm font-bold ${step.current ? 'text-primary' : ''}`}>{step.label}</div><div className="mt-1 text-xs text-muted-foreground">{step.date}</div></div></div>)}</div></section></div><aside className="space-y-5"><section className="rounded-2xl border border-border bg-card p-5"><h3 className="font-display text-sm font-bold">Order summary</h3><div className="mt-4 space-y-3 text-sm"><div className="flex justify-between text-muted-foreground"><span>Item</span><span className="font-semibold text-foreground">₹{order.amount.toLocaleString('en-IN')}</span></div><div className="flex justify-between text-muted-foreground"><span>Shipping</span><span className="font-semibold text-[#268c6a]">Included</span></div><div className="border-t border-border pt-3"><div className="flex justify-between font-bold"><span>Total</span><span>₹{order.amount.toLocaleString('en-IN')}</span></div></div></div></section><section className="rounded-2xl border border-border bg-card p-5"><h3 className="font-display text-sm font-bold">Customer</h3><div className="mt-4 flex items-center gap-3"><span className="grid h-9 w-9 place-items-center rounded-full bg-[#f3c77a] text-xs font-bold">{order.customer.split(' ').map((n) => n[0]).join('')}</span><div><div className="text-sm font-bold">{order.customer}</div><div className="text-xs text-muted-foreground">Customer profile</div></div></div><Link href="/support" data-testid="link-help-customer" className="mt-4 block rounded-lg border border-border px-3 py-2.5 text-center text-xs font-bold hover:border-primary/50">Open support conversation</Link></section></aside></div> : null}</Shell>;
}

function ProductsPage() {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const params = useMemo(() => ({ q: search || undefined, category: category === 'All' ? undefined : category }), [search, category]);
  const productsQuery = useListProducts(params, { query: { queryKey: getListProductsQueryKey(params) } });
  const products = productsQuery.data ?? [];
  const categories = ['All', ...Array.from(new Set(products.map((product) => product.category)))];
  return <Shell title="Product catalog" eyebrow="Commerce operations"><PageIntro kicker="Catalog intelligence" title="Know what customers are asking for." body="Search the catalog, spot what is available, and hand a product question to ShopAssist." /><div className="mb-7 flex flex-col gap-3 md:flex-row"><div className="flex flex-1 items-center gap-2 rounded-xl border border-border bg-card px-3.5 py-3"><Search size={16} className="text-muted-foreground" /><input value={search} onChange={(e) => setSearch(e.target.value)} data-testid="input-search-products" className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground" placeholder="Search products or descriptions" /></div><div className="flex gap-2 overflow-x-auto">{categories.map((item) => <button type="button" key={item} onClick={() => setCategory(item)} data-testid={`button-category-${item.toLowerCase().replaceAll(' ', '-')}`} className={`shrink-0 rounded-xl px-4 py-2.5 text-xs font-bold ${category === item ? 'bg-foreground text-background' : 'border border-border bg-card text-muted-foreground hover:text-foreground'}`}>{item}</button>)}</div></div>{productsQuery.isLoading ? <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{Array.from({ length: 8 }).map((_, i) => <div key={i} className="rounded-2xl border border-border bg-card p-3"><div className="h-48 animate-pulse-soft rounded-xl bg-muted" /><div className="mt-4 h-4 w-2/3 animate-pulse-soft rounded bg-muted" /><div className="mt-3 h-3 w-1/3 animate-pulse-soft rounded bg-muted" /></div>)}</div> : productsQuery.isError ? <QueryError retry={() => productsQuery.refetch()} /> : products.length === 0 ? <EmptyState icon={ShoppingBag} title="No products match" body="Try another search or browse every category." action={<button type="button" onClick={() => { setSearch(''); setCategory('All'); }} data-testid="button-reset-products" className="rounded-lg bg-primary px-3 py-2 text-xs font-bold text-primary-foreground">Reset catalog</button>} /> : <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{products.map((product) => <article key={product.id} data-testid={`card-product-${product.id}`} className="group rounded-2xl border border-border bg-card p-3 hover:-translate-y-1 hover:shadow-lg hover:shadow-[#173047]/5"><div className="relative overflow-hidden rounded-xl bg-muted"><img src={product.image} alt={product.name} className="h-52 w-full object-cover transition-transform duration-500 group-hover:scale-105" /><span className="absolute left-3 top-3 rounded-full bg-background/90 px-2 py-1 font-mono-ui text-[9px] uppercase tracking-wider backdrop-blur">{product.category}</span><span className={`absolute right-3 top-3 rounded-full px-2 py-1 text-[9px] font-bold ${product.stock > 10 ? 'bg-[#e5f6ee] text-[#268c6a]' : 'bg-[#fff0df] text-[#a15e34]'}`}>{product.stock} in stock</span></div><div className="px-1 pt-4"><div className="flex items-start justify-between gap-2"><h3 className="text-sm font-bold">{product.name}</h3><span className="shrink-0 font-display text-lg font-bold">₹{product.price.toLocaleString('en-IN')}</span></div><p className="mt-2 line-clamp-2 text-xs leading-relaxed text-muted-foreground">{product.description}</p><div className="mt-4 flex items-center justify-between"><span className="flex items-center gap-1 text-xs font-semibold"><Star size={13} className="fill-[#e7a83d] text-[#e7a83d]" /> {product.rating}</span><Link href={`/support?prompt=${encodeURIComponent(`Is ${product.name} suitable for me?`)}`} data-testid={`link-ask-ai-${product.id}`} className="rounded-lg bg-foreground px-3 py-2 text-[10px] font-bold text-background hover:bg-primary hover:text-primary-foreground">Ask AI <ArrowRight size={12} className="ml-1 inline" /></Link></div></div></article>)}</div>}</Shell>;
}

function ReturnsPage() {
  const returnsQuery = useListReturns({ query: { queryKey: getListReturnsQueryKey() } });
  const ordersQuery = useListOrders({ query: { queryKey: getListOrdersQueryKey() } });
  const createReturn = useCreateReturn();
  const [open, setOpen] = useState(false);
  const [orderId, setOrderId] = useState('');
  const [reason, setReason] = useState('');
  const returns = returnsQuery.data ?? [];
  const submitReturn = (e: FormEvent) => { e.preventDefault(); if (!orderId || !reason) return; createReturn.mutate({ data: { orderId, reason } }, { onSuccess: () => { setOpen(false); setOrderId(''); setReason(''); returnsQuery.refetch(); } }); };
  return <Shell title="Returns" eyebrow="Commerce operations"><PageIntro kicker="Aftercare" title="Returns without the runaround." body="Keep every request visible, from first reason to final refund." action={<button type="button" onClick={() => setOpen(true)} data-testid="button-start-return" className="rounded-xl bg-primary px-4 py-3 text-xs font-bold text-primary-foreground hover:-translate-y-0.5"><RotateCcw size={14} className="mr-1.5 inline" /> Start a return</button>} />{open && <div className="mb-6 rounded-2xl border border-primary/30 bg-[#fff9ea] p-5"><div className="flex items-start justify-between"><div><h2 className="font-display text-lg font-bold">Start a return</h2><p className="mt-1 text-xs text-muted-foreground">ShopAssist will keep the request linked to the original order.</p></div><button type="button" onClick={() => setOpen(false)} data-testid="button-close-return-form" className="text-muted-foreground"><X size={18} /></button></div><form onSubmit={submitReturn} className="mt-5 grid gap-3 md:grid-cols-[1fr_1.4fr_auto] md:items-end"><label className="text-xs font-bold">Order<select value={orderId} onChange={(e) => setOrderId(e.target.value)} data-testid="select-return-order" className="mt-2 w-full rounded-lg border border-border bg-card px-3 py-2.5 text-sm outline-none"><option value="">Select an order</option>{(ordersQuery.data ?? []).map((order) => <option key={order.id} value={order.id}>{order.id} · {order.product}</option>)}</select></label><label className="text-xs font-bold">Reason<input value={reason} onChange={(e) => setReason(e.target.value)} data-testid="input-return-reason" className="mt-2 w-full rounded-lg border border-border bg-card px-3 py-2.5 text-sm outline-none" placeholder="Tell us what went wrong" /></label><button disabled={createReturn.isPending} type="submit" data-testid="button-submit-return" className="rounded-lg bg-foreground px-4 py-3 text-xs font-bold text-background disabled:opacity-50">{createReturn.isPending ? 'Submitting…' : 'Submit request'}</button></form></div>}{returnsQuery.isLoading ? <div className="rounded-2xl border border-border bg-card p-7"><Skeleton lines={7} /></div> : returnsQuery.isError ? <QueryError retry={() => returnsQuery.refetch()} /> : returns.length === 0 ? <EmptyState icon={RotateCcw} title="No returns yet" body="When a customer needs a little aftercare, their request will show up here." /> : <div className="overflow-hidden rounded-2xl border border-border bg-card"><div className="hidden grid-cols-[1fr_1.6fr_1.2fr_1fr_1fr_1fr] gap-4 border-b border-border px-5 py-3 font-mono-ui text-[9px] uppercase tracking-wider text-muted-foreground md:grid"><span>Return</span><span>Product</span><span>Reason</span><span>Status</span><span>Pickup</span><span>Refund</span></div>{returns.map((item) => <div key={item.id} data-testid={`row-return-${item.id}`} className="grid gap-2 border-b border-border px-5 py-4 last:border-0 md:grid-cols-[1fr_1.6fr_1.2fr_1fr_1fr_1fr] md:items-center md:gap-4"><div><div className="font-mono-ui text-xs">{item.id}</div><div className="mt-1 text-[10px] text-muted-foreground">{item.orderId}</div></div><div className="text-sm font-bold">{item.product}</div><div className="text-xs text-muted-foreground">{item.reason}</div><div><StatusPill status={item.status} /></div><div className="text-xs text-muted-foreground">{item.pickupDate}</div><div className="text-xs font-bold text-[#268c6a]">{item.refundStatus}</div></div>)}</div>}</Shell>;
}

function DashboardPage() {
  const dashboardQuery = useGetDashboard({ query: { queryKey: getGetDashboardQueryKey() } });
  const dashboard = dashboardQuery.data;
  return <Shell title="Overview" eyebrow="Agent command center">{dashboardQuery.isLoading ? <div className="space-y-5"><div className="grid gap-4 md:grid-cols-4">{Array.from({ length: 4 }).map((_, i) => <div className="h-28 animate-pulse-soft rounded-2xl bg-muted" key={i} />)}</div><div className="h-72 animate-pulse-soft rounded-2xl bg-muted" /></div> : dashboardQuery.isError ? <QueryError retry={() => dashboardQuery.refetch()} /> : dashboard ? <><PageIntro kicker="Monday, Jan 15 · live signals" title="The agent is having a good day." body="A clear read on what customers need and how ShopAssist is responding." action={<button type="button" data-testid="button-refresh-dashboard" onClick={() => dashboardQuery.refetch()} className="rounded-lg border border-border bg-card p-2.5 text-muted-foreground hover:text-foreground"><RefreshCw size={16} /></button>} /><div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4"><Metric icon={MessageCircle} label="Conversations" value={dashboard.totalConversations.toLocaleString()} delta="+12.4%" tone="coral" /><Metric icon={ShieldCheck} label="Resolved by AI" value={`${dashboard.resolvedByAi}%`} delta="+5.8%" tone="teal" /><Metric icon={Clock3} label="Avg response time" value={`${dashboard.avgResponseTime}s`} delta="-2.1s" tone="gold" /><Metric icon={Users} label="Active customers" value={dashboard.activeCustomers.toLocaleString()} delta="+8.2%" tone="navy" /></div><div className="mt-5 grid gap-5 xl:grid-cols-[1.35fr_.65fr]"><section className="rounded-2xl border border-border bg-card p-5 md:p-6"><div className="flex items-start justify-between"><div><h2 className="font-display text-lg font-bold">Conversation volume</h2><p className="mt-1 text-xs text-muted-foreground">Daily conversations · last 7 days</p></div><span className="flex items-center gap-1 text-xs font-bold text-[#268c6a]"><TrendingUp size={14} /> 18.6%</span></div><div className="mt-8 flex h-48 items-end gap-2 sm:gap-4">{dashboard.conversationTrend.map((point, i) => { const max = Math.max(...dashboard.conversationTrend.map((p) => p.value)); return <div key={point.label} className="flex h-full flex-1 flex-col items-center justify-end gap-2"><span className="font-mono-ui text-[9px] text-muted-foreground">{point.value}</span><div className={`w-full max-w-12 rounded-t-lg ${i === dashboard.conversationTrend.length - 1 ? 'bg-primary' : 'bg-secondary'}`} style={{ height: `${Math.max(12, (point.value / max) * 78)}%` }} /><span className="font-mono-ui text-[9px] text-muted-foreground">{point.label}</span></div> })}</div></section><section className="rounded-2xl border border-border bg-card p-5 md:p-6"><div className="flex items-start justify-between"><div><h2 className="font-display text-lg font-bold">Issue categories</h2><p className="mt-1 text-xs text-muted-foreground">What people need help with</p></div><Tag size={17} className="text-primary" /></div><div className="mt-6 space-y-4">{dashboard.issueCategories.map((item) => <div key={item.label}><div className="mb-1.5 flex justify-between text-xs"><span className="font-semibold">{item.label}</span><span className="font-mono-ui text-muted-foreground">{item.value}%</span></div><div className="h-2 overflow-hidden rounded-full bg-muted"><div className="h-full rounded-full" style={{ width: `${item.value}%`, backgroundColor: item.color }} /></div></div>)}</div></section></div><div className="mt-5 grid gap-5 xl:grid-cols-[.8fr_1.2fr]"><section className="rounded-2xl border border-border bg-card p-5 md:p-6"><div className="flex items-start justify-between"><div><h2 className="font-display text-lg font-bold">Tool usage</h2><p className="mt-1 text-xs text-muted-foreground">Agent actions this week</p></div><Wrench size={17} className="text-primary" /></div><div className="mt-5 space-y-4">{dashboard.toolUsage.map((tool) => <div key={tool.name} className="flex items-center gap-3"><span className="grid h-8 w-8 place-items-center rounded-lg bg-muted"><Wrench size={14} className="text-muted-foreground" /></span><div className="min-w-0 flex-1"><div className="flex justify-between text-xs"><span className="truncate font-semibold">{tool.name}</span><span className="font-mono-ui text-muted-foreground">{tool.calls}</span></div><div className="mt-1.5 h-1.5 rounded-full bg-muted"><div className="h-full rounded-full bg-primary" style={{ width: `${tool.share}%` }} /></div></div></div>)}</div></section><section className="rounded-2xl border border-border bg-card p-5 md:p-6"><div className="flex items-start justify-between"><div><h2 className="font-display text-lg font-bold">Live activity</h2><p className="mt-1 text-xs text-muted-foreground">A transparent trail of agent decisions</p></div><span className="flex items-center gap-1.5 font-mono-ui text-[10px] text-[#268c6a]"><span className="h-1.5 w-1.5 rounded-full bg-[#35ad83]" /> LIVE</span></div><div className="mt-5 divide-y divide-border">{dashboard.activity.map((item) => <div key={item.id} data-testid={`activity-${item.id}`} className="flex items-start gap-3 py-3 first:pt-0 last:pb-0"><span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-secondary text-secondary-foreground"><Zap size={14} /></span><div className="min-w-0 flex-1"><div className="flex flex-wrap items-center gap-2"><span className="text-xs font-bold">{item.title}</span><span className="rounded bg-muted px-1.5 py-0.5 font-mono-ui text-[9px] text-muted-foreground">{item.tool}</span></div><p className="mt-1 text-xs text-muted-foreground">{item.detail}</p></div><span className="shrink-0 font-mono-ui text-[9px] text-muted-foreground">{item.time}</span></div>)}</div></section></div></> : null}</Shell>;
}

function Metric({ icon: Icon, label, value, delta, tone }: { icon: typeof MessageCircle; label: string; value: string; delta: string; tone: 'coral' | 'teal' | 'gold' | 'navy' }) {
  const tones = { coral: 'bg-[#fff0ea] text-[#c45d46]', teal: 'bg-[#e5f6ef] text-[#268c6a]', gold: 'bg-[#fff7df] text-[#a47622]', navy: 'bg-[#e9eff7] text-[#426789]' };
  return <div className="rounded-2xl border border-border bg-card p-5"><div className="flex items-center justify-between"><span className={`grid h-9 w-9 place-items-center rounded-xl ${tones[tone]}`}><Icon size={17} /></span><span className="rounded-full bg-[#e5f6ef] px-2 py-1 font-mono-ui text-[9px] font-medium text-[#268c6a]">{delta}</span></div><div className="mt-5 font-display text-3xl font-bold tracking-[-.05em]" data-testid={`metric-${label.toLowerCase().replaceAll(' ', '-')}`}>{value}</div><div className="mt-1 text-xs font-semibold text-muted-foreground">{label}</div></div>;
}

function NotFound() {
  return <div className="grid min-h-[100dvh] place-items-center bg-background p-5"><div className="max-w-md text-center"><div className="font-mono-ui text-xs text-primary">404 / not found</div><h1 className="mt-3 font-display text-5xl font-bold tracking-[-.07em]">Wrong aisle.</h1><p className="mt-3 text-sm text-muted-foreground">This page wandered off. Let’s get you back to the useful stuff.</p><Link href="/" data-testid="link-back-home" className="mt-6 inline-block rounded-xl bg-primary px-4 py-3 text-sm font-bold text-primary-foreground">Back home</Link></div></div>;
}

function Router() {
  const [location] = useLocation();
  return <ErrorBoundary resetKey={location}><Switch><Route path="/" component={Landing} /><Route path="/support" component={SupportPage} /><Route path="/orders/:id" component={OrderDetailPage} /><Route path="/orders" component={OrdersPageFixed} /><Route path="/products" component={ProductsPage} /><Route path="/returns" component={ReturnsPage} /><Route path="/dashboard" component={DashboardPage} /><Route component={NotFound} /></Switch></ErrorBoundary>;
}

function App() {
  return <QueryClientProvider client={queryClient}><TooltipProvider><Router /><Toaster /></TooltipProvider></QueryClientProvider>;
}

export default App;