import { Link } from "react-router-dom";
import { ArrowRight, Compass, Users, Building2, Sparkles, ShieldCheck, HandshakeIcon, Globe2 } from "lucide-react";

const members = [
  "Uganda RC", "Zambia RC", "Ethiopia RC", "Mali RC", "Sudan RC",
  "South Sudan RC", "Ivory Coast RC", "CAR RC", "Liberia RC", "Nigeria RC",
];
const partners = [
  "IFRC", "Netherlands RC", "Norway RC", "Switzerland RC",
  "French RC", "Swedish RC", "Kenya RC",
];

const mandates = [
  { title: "Grand Bargain", note: "& IFRC NSD Compact" },
  { title: "IFRC Strategy 2030", note: "& Agenda for Renewal" },
  { title: "Pan-African Conference", note: "PAC 2013 & 2017 commitments" },
];

const steeringGroup = [
  { role: "Chair", title: "President", ns: "Uganda Red Cross Society" },
  { role: "Member", title: "Deputy Secretary General", ns: "Ethiopian Red Cross Society" },
  { role: "Member", title: "Secretary General", ns: "Mali Red Cross Society" },
  { role: "Member", title: "Secretary General", ns: "Zambia Red Cross Society" },
  { role: "Member", title: "Deputy Secretary General", ns: "South Sudan Red Cross Society" },
  { role: "Member", title: "DSG, Programs", ns: "Kenya Red Cross Society" },
];

const pillars = [
  {
    name: "Leadership & Governance",
    color: "leadership",
    lead: "IFRC",
    desc: "Building integrity, good governance and effective, transparent leadership.",
  },
  {
    name: "Branch Development",
    color: "branch",
    lead: "IFRC",
    desc: "Strengthening branch frameworks, plans and locally generated income.",
  },
  {
    name: "Domestic Resource Mobilisation",
    color: "resource",
    lead: "Swiss RC & Netherlands RC",
    desc: "Diversifying income, including Workplace First Aid initiatives.",
  },
  {
    name: "Finance Development",
    color: "finance",
    lead: "Norwegian RC",
    desc: "Core cost coverage, robust finance systems and long-term resilience.",
  },
] as const;

const hubInitiatives = [
  {
    icon: Sparkles,
    title: "Digital Transformation & Innovation",
    desc: "Building this peer-to-peer learning platform and supporting systems strengthening across African NSs.",
  },
  {
    icon: Compass,
    title: "Impact & Measurement",
    desc: "Financial Sustainability Impact Studies and a measurement framework tailored to African contexts.",
  },
  {
    icon: Users,
    title: "Capacity Building",
    desc: "An NSD Working Group in Africa and peer-to-peer learning assessment tools.",
  },
];

const indicators = [
  {
    pillar: "Leadership",
    principle: "Integrity, governance, transparent leadership, NSD",
    items: ["Reduced integrity cases", "Membership policy", "Functional youth program", "Audited accounts", "PAYE & retirement remitted", "NSD plans with budget"],
  },
  {
    pillar: "Branch Development",
    principle: "Sustainable branches",
    items: ["Branch framework / manual", "Activities without donor funding", "Branch development plans", "Branch IGI"],
  },
  {
    pillar: "Resource Mobilisation",
    principle: "Robust mobilisation, increased income base",
    items: ["Profitable income sources", "Asset documentation & valuation", "Asset development"],
  },
  {
    pillar: "Finance Development",
    principle: "Core cost coverage & finance systems",
    items: ["Core cost policy implemented", "Effective finance system"],
  },
];

const principles = [
  { icon: HandshakeIcon, title: "Locally led decision-making", desc: "Mutual accountability across the Alliance." },
  { icon: Globe2, title: "Sustainability & peer-to-peer", desc: "Collaboration that endures beyond any single project." },
  { icon: ShieldCheck, title: "Institutional capacity", desc: "Strengthening leadership and governance." },
];

function PillarSwatch({ color }: { color: typeof pillars[number]["color"] }) {
  const map = {
    leadership: "bg-pillar-leadership",
    branch: "bg-pillar-branch",
    resource: "bg-pillar-resource",
    finance: "bg-pillar-finance",
  } as const;
  return <span className={`inline-block h-3 w-3 rounded-full ${map[color]}`} />;
}

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      {/* Nav */}
      <header className="border-b border-border/60 bg-background/80 backdrop-blur sticky top-0 z-30">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <Link to="/" className="font-display text-lg font-semibold tracking-tight">
            Localisation Hub
          </Link>
          <nav className="hidden gap-6 text-sm text-muted-foreground md:flex">
            <Link to="/" className="hover:text-foreground">Home</Link>
            <Link to="/about" className="text-foreground font-medium">About</Link>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section
        className="relative overflow-hidden"
        style={{
          backgroundImage: 'url(/assets/onerc_knowledge_hub/profile-cover.jpeg)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        {/* Dark shadow overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/45 to-black/55" />

        <div className="relative mx-auto max-w-7xl px-6 py-32 md:py-40">
          <p className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-xs font-medium uppercase tracking-widest text-white/90 backdrop-blur">
            About the Alliance
          </p>
          <h1 className="max-w-4xl font-display text-5xl font-semibold leading-[1.05] tracking-tight text-white md:text-7xl">
            A journey toward National Society <em className="not-italic text-accent">self-reliance.</em>
          </h1>
          <p className="mt-8 max-w-2xl text-lg text-white/85 md:text-xl">
            The Localisation Hub brings together African National Societies committed to
            stronger, locally led humanitarian and development systems — through aligned
            leadership, shared vision, and coordinated action.
          </p>
          <div className="mt-10 flex flex-wrap gap-3">
            {mandates.map((m) => (
              <div key={m.title} className="rounded-lg border border-white/20 bg-white/10 px-4 py-3 backdrop-blur">
                <p className="text-sm font-semibold text-white">{m.title}</p>
                <p className="text-xs text-white/70">{m.note}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Membership */}
      <section className="mx-auto max-w-7xl px-6 py-20 md:py-28">
        <div className="grid gap-12 md:grid-cols-[1fr_2fr]">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-accent">Membership</p>
            <h2 className="mt-3 text-4xl font-semibold md:text-5xl">10 National Societies. 7 Partners. One Alliance.</h2>
            <p className="mt-5 text-muted-foreground">
              Aligned leadership and coordinated action accelerating localisation across the continent.
            </p>
          </div>
          <div className="space-y-8">
            <div>
              <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                African National Societies
              </h3>
              <div className="flex flex-wrap gap-2">
                {members.map((m) => (
                  <span key={m} className="rounded-full border border-border bg-card px-4 py-2 text-sm font-medium shadow-sm">
                    {m}
                  </span>
                ))}
              </div>
            </div>
            <div>
              <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                Consortium Partners
              </h3>
              <div className="flex flex-wrap gap-2">
                {partners.map((p) => (
                  <span key={p} className="rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground">
                    {p}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Steering Group */}
      <section className="bg-secondary/40 border-y border-border">
        <div className="mx-auto max-w-7xl px-6 py-20 md:py-28">
          <div className="max-w-3xl">
            <p className="text-xs font-semibold uppercase tracking-widest text-accent">Governance</p>
            <h2 className="mt-3 text-4xl font-semibold md:text-5xl">Steering Group & Leadership</h2>
            <p className="mt-5 text-muted-foreground">
              The Alliance operates through a Steering Group of volunteer leaders from
              participating National Societies, providing strategic direction, coordination
              and oversight.
            </p>
          </div>

          <div className="mt-12 grid gap-4 md:grid-cols-3">
            {steeringGroup.map((s, i) => (
              <div
                key={s.ns}
                className={`relative rounded-2xl border border-border bg-card p-6 shadow-sm transition hover:shadow-[var(--shadow-elegant)] ${
                  i === 0 ? "md:col-span-3 bg-primary text-primary-foreground border-primary" : ""
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className={`text-xs font-semibold uppercase tracking-widest ${i === 0 ? "text-accent" : "text-muted-foreground"}`}>
                    {s.role}
                  </span>
                  {i === 0 && <span className="rounded-full bg-accent px-3 py-1 text-xs font-semibold text-accent-foreground">Chair</span>}
                </div>
                <p className="mt-4 font-display text-xl font-semibold">{s.title}</p>
                <p className={`mt-1 text-sm ${i === 0 ? "text-primary-foreground/80" : "text-muted-foreground"}`}>{s.ns}</p>
              </div>
            ))}
          </div>

          <div className="mt-8 rounded-2xl border border-dashed border-border bg-background p-6">
            <p className="text-sm">
              <span className="font-semibold">Secretariat support</span> is provided by the{" "}
              <span className="text-foreground">Netherlands Red Cross Society (NLRC)</span> and the{" "}
              <span className="text-foreground">IFRC</span> — ensuring transparency, accountability,
              and collective decision-making.
            </p>
          </div>
        </div>
      </section>

      {/* Localisation Hub */}
      <section className="mx-auto max-w-7xl px-6 py-20 md:py-28">
        <div className="grid gap-12 md:grid-cols-2 md:items-start">
          <div className="md:sticky md:top-24">
            <p className="text-xs font-semibold uppercase tracking-widest text-accent">Implementing Arm</p>
            <h2 className="mt-3 text-4xl font-semibold md:text-5xl">The Localisation Hub</h2>
            <p className="mt-5 text-lg text-muted-foreground">
              Hosted by the <span className="text-foreground font-medium">Kenya Red Cross Society (KRCS)</span>,
              the Hub translates the Alliance's vision into practice through coordination,
              technical support, learning facilitation and project implementation — including
              the development and hosting of this platform.
            </p>
          </div>
          <div className="space-y-4">
            {hubInitiatives.map((h) => (
              <div key={h.title} className="group rounded-2xl border border-border bg-card p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-[var(--shadow-elegant)]">
                <div className="flex items-start gap-4">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-accent/20 text-accent-foreground">
                    <h.icon className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-display text-xl font-semibold">{h.title}</h3>
                    <p className="mt-2 text-sm text-muted-foreground">{h.desc}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Four Pillars */}
      <section className="border-y border-border" style={{ background: "var(--gradient-earth)" }}>
        <div className="mx-auto max-w-7xl px-6 py-20 md:py-28">
          <div className="max-w-3xl">
            <p className="text-xs font-semibold uppercase tracking-widest text-accent">Four-Pillar Framework</p>
            <h2 className="mt-3 text-4xl font-semibold md:text-5xl">A holistic journey to self-reliance</h2>
            <p className="mt-5 text-muted-foreground">
              The Alliance's work is organised into four technical pillars, each led by a
              specific partner. The platform's resources, tools and updates are categorised
              by pillar colour for a consistent experience.
            </p>
          </div>

          <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {pillars.map((p) => {
              const styles = {
                leadership: { background: "linear-gradient(to bottom right, oklch(0.45 0.18 300 / 0.9), oklch(0.45 0.18 300))" },
                branch: { background: "linear-gradient(to bottom right, oklch(0.605 0.232 27 / 0.9), oklch(0.605 0.232 27))" },
                resource: { background: "linear-gradient(to bottom right, oklch(0.221 0.067 257 / 0.9), oklch(0.221 0.067 257))" },
                finance: { background: "linear-gradient(to bottom right, oklch(0.5 0.14 155 / 0.9), oklch(0.5 0.14 155))" },
              } as const;
              return (
                <div
                  key={p.name}
                  className="relative overflow-hidden rounded-2xl p-6 text-white shadow-[var(--shadow-pillar)] transition hover:-translate-y-1"
                  style={styles[p.color]}
                >
                  <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-white/80">
                    <span className="h-2 w-2 rounded-full bg-white" />
                    {p.color} pillar
                  </div>
                  <h3 className="mt-6 font-display text-2xl font-semibold leading-tight">{p.name}</h3>
                  <p className="mt-3 text-sm text-white/85">{p.desc}</p>
                  <div className="mt-8 border-t border-white/20 pt-4">
                    <p className="text-xs uppercase tracking-wider text-white/70">Technical Lead</p>
                    <p className="mt-1 text-sm font-semibold">{p.lead}</p>
                  </div>
                </div>
              );
            })}
          </div>

          <p className="mt-8 text-sm text-muted-foreground">
            Note: Resource Mobilisation includes <span className="text-foreground font-medium">Workplace First Aid</span> initiatives supported by the Netherlands Red Cross.
          </p>
        </div>
      </section>

      {/* Indicators */}
      <section className="mx-auto max-w-7xl px-6 py-20 md:py-28">
        <div className="max-w-3xl">
          <p className="text-xs font-semibold uppercase tracking-widest text-accent">Indicator Tracking</p>
          <h2 className="mt-3 text-4xl font-semibold md:text-5xl">Financial Sustainability Indicators</h2>
          <p className="mt-5 text-muted-foreground">
            The platform is designed to integrate the Alliance's financial sustainability
            indicators — from audited accounts to NSD plans and asset documentation.
          </p>
        </div>

        <div className="mt-12 overflow-hidden rounded-2xl border border-border bg-card">
          <div className="grid grid-cols-12 border-b border-border bg-secondary/60 px-6 py-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            <div className="col-span-3">Pillar</div>
            <div className="col-span-4">Principle to measure</div>
            <div className="col-span-5">Indicators</div>
          </div>
          {indicators.map((row, i) => (
            <div key={row.pillar} className={`grid grid-cols-12 gap-4 px-6 py-6 ${i !== indicators.length - 1 ? "border-b border-border" : ""}`}>
              <div className="col-span-12 md:col-span-3">
                <div className="flex items-center gap-2">
                  <PillarSwatch color={(["leadership","branch","resource","finance"] as const)[i]} />
                  <p className="font-display text-lg font-semibold">{row.pillar}</p>
                </div>
              </div>
              <div className="col-span-12 text-sm text-muted-foreground md:col-span-4">{row.principle}</div>
              <div className="col-span-12 md:col-span-5">
                <ul className="flex flex-wrap gap-2">
                  {row.items.map((it) => (
                    <li key={it} className="rounded-md border border-border bg-background px-3 py-1.5 text-xs">
                      {it}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Principles & Focus */}
      <section className="bg-primary text-primary-foreground">
        <div className="mx-auto max-w-7xl px-6 py-20 md:py-28">
          <div className="grid gap-16 md:grid-cols-2">
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-accent">Guiding Principles</p>
              <h2 className="mt-3 font-display text-4xl font-semibold md:text-5xl">Anchored in shared values.</h2>
              <div className="mt-10 space-y-6">
                {principles.map((p) => (
                  <div key={p.title} className="flex gap-4 border-t border-primary-foreground/15 pt-6">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-accent text-accent-foreground">
                      <p.icon className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="font-display text-xl font-semibold">{p.title}</h3>
                      <p className="mt-1 text-sm text-primary-foreground/75">{p.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-accent">Primary Focus Areas</p>
              <h2 className="mt-3 font-display text-4xl font-semibold md:text-5xl">Where we direct our energy.</h2>
              <div className="mt-10 space-y-4">
                {[
                  { n: "01", t: "Financial Sustainability", d: "Resource mobilisation, diversification and long-term resilience." },
                  { n: "02", t: "Institutional Development", d: "Strengthening leadership, governance and digital transformation." },
                  { n: "03", t: "Knowledge Sharing", d: "Regional learning and documentation of developed tools." },
                ].map((f) => (
                  <div key={f.n} className="flex gap-6 rounded-2xl border border-primary-foreground/15 bg-primary-foreground/5 p-6 backdrop-blur">
                    <span className="font-display text-3xl font-semibold text-accent">{f.n}</span>
                    <div>
                      <h3 className="font-display text-xl font-semibold">{f.t}</h3>
                      <p className="mt-1 text-sm text-primary-foreground/75">{f.d}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-7xl px-6 py-24 text-center">
        <Building2 className="mx-auto h-10 w-10 text-accent" />
        <h2 className="mx-auto mt-6 max-w-3xl font-display text-4xl font-semibold md:text-5xl">
          More than a project — a movement toward locally led humanitarian action.
        </h2>
        <Link
          to="/"
          className="mt-10 inline-flex items-center gap-2 rounded-full bg-primary px-7 py-3.5 text-sm font-semibold text-primary-foreground shadow-[var(--shadow-elegant)] transition hover:opacity-90"
        >
          Explore the platform <ArrowRight className="h-4 w-4" />
        </Link>
      </section>

      <footer className="border-t border-border bg-secondary/40">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-6 py-8 text-sm text-muted-foreground md:flex-row">
          <p>© {new Date().getFullYear()} The Localisation Hub</p>
          <p>Hosted by the Kenya Red Cross Society · Secretariat: NLRC</p>
        </div>
      </footer>
    </main>
  );
}
