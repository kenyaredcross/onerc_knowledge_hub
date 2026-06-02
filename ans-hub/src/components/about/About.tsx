import { Link } from "react-router-dom";
import { ArrowRight, Compass, Users, Building2, Sparkles, ShieldCheck, HandshakeIcon, Globe2, User, X, Menu, Mail, Phone, ExternalLink } from "lucide-react";
import { useFrappeAuth, useFrappeGetCall } from "frappe-react-sdk";
import { useMemo, useState } from "react";

// Removed hardcoded partners array - now fetched from database

const mandates = [
  { title: "Grand Bargain", note: "& IFRC NSD Compact" },
  { title: "IFRC Strategy 2030", note: "& Agenda for Renewal" },
  { title: "Pan-African Conference", note: "PAC 2013 & 2017 commitments" },
];

// Removed hardcoded steering group - now fetched from database

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
  const { currentUser } = useFrappeAuth();
  const [selectedMember, setSelectedMember] = useState<any>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Fetch only Member National Societies from database
  const { data: memberSocietiesData } = useFrappeGetCall(
    "onerc_knowledge_hub.api.national_society.get_member_societies",
    {}
  );

  // Fetch all National Societies for partners and non-members
  const { data: allSocietiesData } = useFrappeGetCall(
    "onerc_knowledge_hub.api.national_society.get_national_societies_list",
    {}
  );

  // Fetch Steering Group members from database
  const { data: steeringGroupData } = useFrappeGetCall(
    "onerc_knowledge_hub.api.user.get_steering_group_members",
    {}
  );

  // Fetch organization settings from onerc_core
  const { data: orgData } = useFrappeGetCall(
    "onerc_core.api.organization.get_organization_settings",
    {}
  );

  const orgSettings = orgData?.message || orgData || {};
  const organizationName = orgSettings.organization_name || "";

  // Get member societies with full data including logos
  const members = useMemo(() => {
    const societies = memberSocietiesData?.message || [];
    return societies;
  }, [memberSocietiesData]);

  // Filter partners and non-members from all societies
  const nonMembers = useMemo(() => {
    const societies = allSocietiesData?.message || [];
    return societies
      .filter((s: any) => s.type === "Non-member")
      .map((s: any) => s.national_society_name);
  }, [allSocietiesData]);

  const partners = useMemo(() => {
    const societies = allSocietiesData?.message || [];
    return societies
      .filter((s: any) => s.type === "Consortium Partner")
      .map((s: any) => s.national_society_name);
  }, [allSocietiesData]);

  // Process steering group members
  const steeringGroup = useMemo(() => {
    // Handle both wrapped and unwrapped API responses
    const members = steeringGroupData?.message || steeringGroupData || [];
    console.log('Steering Group Data:', steeringGroupData);
    console.log('Processed Members:', members);
    return members.map((member: any) => ({
      name: member.full_name,
      title: member.position_name || "Member",
      ns: member.national_society_name || "",
      image: member.image,
      bio: member.bio,
      email: member.company_email,
      prefered_email: member.prefered_contact_email,
      phone: member.phone_number,
      social_media: member.social_media || []
    }));
  }, [steeringGroupData]);

  // Calculate dynamic statistics
  const memberCount = members.length;
  const partnerCount = partners.length;

  return (
    <main className="min-h-screen bg-background text-foreground">
      {/* Nav */}
      <header className="border-b border-border/60 bg-background/80 backdrop-blur sticky top-0 z-30">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <Link to="/" className="flex items-center gap-3">
            {orgSettings.logo ? (
              <img
                src={orgSettings.logo}
                alt="Logo"
                className="h-8 w-8 object-contain"
              />
            ) : null}
            <div className="font-display text-lg font-semibold tracking-tight">
              {organizationName}
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-6">
            <nav className="flex gap-6 text-sm text-muted-foreground">
              <Link to="/home" className="text-foreground font-medium">Home</Link>
            </nav>
            <div className="flex items-center gap-3">
              {currentUser ? (
                <>
                  <div className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-foreground">
                    <User className="h-4 w-4" />
                    <span>{currentUser}</span>
                  </div>
                  <Link
                    to="/home"
                    className="px-4 py-2 text-sm font-medium bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity"
                  >
                    Go to Dashboard
                  </Link>
                </>
              ) : (
                <>
                  <Link
                    to="/login"
                    className="px-4 py-2 text-sm font-medium text-foreground hover:text-foreground/80 transition-colors"
                  >
                    Login
                  </Link>
                  <Link
                    to="/login?signup=true"
                    className="px-4 py-2 text-sm font-medium bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity"
                  >
                    Sign Up
                  </Link>
                </>
              )}
            </div>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden flex items-center justify-center p-2 text-foreground hover:bg-muted rounded-lg transition-colors"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-border/60 bg-background">
            <nav className="flex flex-col px-6 py-4 space-y-3">
              <Link
                to="/home"
                className="text-sm font-medium text-foreground hover:text-foreground/80 transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                Home
              </Link>
              {currentUser ? (
                <>
                  <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground py-2 border-t border-border/60">
                    <User className="h-4 w-4" />
                    <span>{currentUser}</span>
                  </div>
                  <Link
                    to="/home"
                    className="w-full px-4 py-2 text-sm font-medium bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity text-center"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Go to Dashboard
                  </Link>
                </>
              ) : (
                <>
                  <Link
                    to="/login"
                    className="text-sm font-medium text-foreground hover:text-foreground/80 transition-colors"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Login
                  </Link>
                  <Link
                    to="/login?signup=true"
                    className="w-full px-4 py-2 text-sm font-medium bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity text-center"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Sign Up
                  </Link>
                </>
              )}
            </nav>
          </div>
        )}
      </header>

      {/* Hero */}
      <section
        className="relative overflow-hidden"
        style={{
          backgroundImage: 'url(/assets/onerc_knowledge_hub/profile-cover.jpeg)',
          backgroundSize: 'cover',
          backgroundPosition: 'center 20%',
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
        <div className="text-center mb-12">
          <p className="text-xs font-semibold uppercase tracking-widest text-accent">Membership</p>

          {/* Stats in separate lines */}
          <div className="mt-8 space-y-3 text-3xl md:text-4xl font-semibold text-foreground">
            <div>{memberCount} Localisation Alliance Members</div>
            <div>{partnerCount} Consortium Partners</div>
          </div>

          {/* One Alliance heading */}
          <h2 className="mt-8 text-5xl md:text-6xl font-bold text-primary">
            One Alliance
          </h2>

          <p className="mt-6 text-muted-foreground max-w-2xl mx-auto">
            Aligned leadership and coordinated action accelerating localisation across the continent.
          </p>
        </div>

        {/* National Societies Carousel */}
        {members.length > 0 && (
          <div className="mt-12">
            <h3 className="mb-6 text-center text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              African National Societies
            </h3>
            <div className="relative overflow-hidden">
              <div className="flex gap-6 animate-scroll-slow pb-4">
                {/* Duplicate members for seamless loop */}
                {[...members, ...members].map((m: any, idx: number) => (
                  <div
                    key={`${m.name}-${idx}`}
                    className="group relative flex items-center justify-center flex-shrink-0"
                    title={m.national_society_name}
                  >
                    {m.logo ? (
                      <div className="h-24 w-24 rounded-lg bg-card p-3 shadow-sm hover:shadow-md transition-all flex items-center justify-center overflow-hidden">
                        <img
                          src={m.logo}
                          alt={m.national_society_name}
                          className="h-full w-full object-contain"
                        />
                      </div>
                    ) : (
                      <div className="h-24 w-24 rounded-lg flex items-center justify-center bg-primary/10 shadow-sm hover:shadow-md transition-all">
                        <span className="text-xs font-bold text-primary text-center px-2">
                          {m.abbreviation || m.national_society_name}
                        </span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

     
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

          <div className="mt-12 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {steeringGroup.map((s: any, i: number) => (
              <button
                key={s.name || i}
                onClick={() => setSelectedMember(s)}
                className="group relative overflow-hidden rounded-lg border border-border bg-card transition-all duration-300 hover:shadow-md hover:border-primary/50 text-left w-full cursor-pointer"
              >
                <div className="p-4">
                  {/* Header with avatar placeholder */}
                  <div className="flex items-start gap-3 mb-3">
                    <div className="flex-shrink-0">
                      {s.image ? (
                        <img
                          src={s.image}
                          alt={s.name}
                          className="h-12 w-12 rounded-full object-cover ring-2 ring-border"
                        />
                      ) : (
                        <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center ring-2 ring-border">
                          <span className="text-base font-bold text-primary">
                            {s.name?.split(' ').map((n: string) => n[0]).join('').slice(0, 2)}
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-display text-base font-semibold text-foreground group-hover:text-primary transition-colors truncate">
                        {s.name}
                      </h3>
                      <p className="text-xs font-medium text-primary mt-0.5">
                        {s.title}
                      </p>
                    </div>
                  </div>

                  {/* National Society */}
                  <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
                    <Building2 className="h-3.5 w-3.5 flex-shrink-0" />
                    <span className="truncate">{s.ns}</span>
                  </div>

                  {/* Bio */}
                  {s.bio && (
                    <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                      {s.bio}
                    </p>
                  )}

                  {/* Decorative element */}
                  <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-br from-primary/5 to-transparent rounded-bl-full opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </button>
            ))}
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
          to="/home"
          className="mt-10 inline-flex items-center gap-2 rounded-full bg-primary px-7 py-3.5 text-sm font-semibold text-primary-foreground shadow-[var(--shadow-elegant)] transition hover:opacity-90"
        >
          Explore the platform <ArrowRight className="h-4 w-4" />
        </Link>
      </section>

      <footer className="border-t border-border bg-secondary/40">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-center gap-4 px-6 py-8 text-sm text-muted-foreground">
          <p>© {new Date().getFullYear()} {organizationName}</p>
        </div>
      </footer>

      {/* Steering Group Member Modal */}
      {selectedMember && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
          onClick={() => setSelectedMember(null)}
        >
          <div
            className="relative max-w-2xl w-full bg-card rounded-lg shadow-xl overflow-hidden max-h-[90vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              onClick={() => setSelectedMember(null)}
              className="absolute top-4 right-4 p-2 rounded-full bg-background/80 hover:bg-background transition-colors z-10"
            >
              <X className="h-5 w-5" />
            </button>

            {/* Header with Image - Fixed at top */}
            <div className="bg-gradient-to-br from-primary/10 to-primary/5 p-8 pb-6 flex-shrink-0">
              <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
                {selectedMember.image ? (
                  <img
                    src={selectedMember.image}
                    alt={selectedMember.name}
                    className="h-24 w-24 rounded-full object-cover ring-4 ring-background shadow-lg"
                  />
                ) : (
                  <div className="h-24 w-24 rounded-full bg-primary/20 flex items-center justify-center ring-4 ring-background shadow-lg">
                    <span className="text-3xl font-bold text-primary">
                      {selectedMember.name?.split(' ').map((n: string) => n[0]).join('').slice(0, 2)}
                    </span>
                  </div>
                )}
                <div className="flex-1 text-center sm:text-left">
                  <h2 className="text-2xl font-bold text-foreground">
                    {selectedMember.name}
                  </h2>
                  <p className="text-lg text-primary font-medium mt-1">
                    {selectedMember.title}
                  </p>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mt-2 justify-center sm:justify-start">
                    <Building2 className="h-4 w-4" />
                    <span>{selectedMember.ns}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Scrollable Content */}
            <div className="overflow-y-auto flex-1 p-8 space-y-6">
              {/* Contact Information */}
              {(selectedMember.email || selectedMember.phone || selectedMember.prefered_email) && (
                <div>
                  <h3 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground mb-3">
                    Contact
                  </h3>
                  <div className="space-y-2">
                    {selectedMember.email && (
                      <a
                        href={`mailto:${selectedMember.email}`}
                        className="flex items-center gap-2 text-foreground hover:text-primary transition-colors"
                      >
                        <Mail className="h-4 w-4" />
                        <span className="text-sm">{selectedMember.email}</span>
                      </a>
                    )}
                    {selectedMember.prefered_email && selectedMember.prefered_email !== selectedMember.email && (
                      <a
                        href={`mailto:${selectedMember.prefered_email}`}
                        className="flex items-center gap-2 text-foreground hover:text-primary transition-colors"
                      >
                        <Mail className="h-4 w-4" />
                        <span className="text-sm">{selectedMember.prefered_email}</span>
                      </a>
                    )}
                    {selectedMember.phone && (
                      <a
                        href={`tel:${selectedMember.phone}`}
                        className="flex items-center gap-2 text-foreground hover:text-primary transition-colors"
                      >
                        <Phone className="h-4 w-4" />
                        <span className="text-sm">{selectedMember.phone}</span>
                      </a>
                    )}
                  </div>
                </div>
              )}

              {/* Social Media Links */}
              {selectedMember.social_media && selectedMember.social_media.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground mb-3">
                    Connect
                  </h3>
                  <div className="flex flex-wrap gap-3">
                    {selectedMember.social_media.map((social: any, idx: number) => (
                      <a
                        key={idx}
                        href={social.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 px-3 py-2 rounded-lg bg-primary/10 hover:bg-primary/20 text-primary transition-colors"
                        title={social.social_media_site}
                      >
                        {social.icon ? (
                          social.icon.startsWith('<') ? (
                            <span className="h-4 w-4 flex items-center justify-center" dangerouslySetInnerHTML={{ __html: social.icon }} />
                          ) : (
                            <img src={social.icon} alt={social.social_media_site} className="h-4 w-4 object-contain" />
                          )
                        ) : (
                          <ExternalLink className="h-4 w-4" />
                        )}
                        <span className="text-sm font-medium">{social.social_media_site}</span>
                      </a>
                    ))}
                  </div>
                </div>
              )}

              {/* Biography */}
              {selectedMember.bio ? (
                <div>
                  <h3 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground mb-3">
                    Biography
                  </h3>
                  <p className="text-foreground leading-relaxed whitespace-pre-line">
                    {selectedMember.bio}
                  </p>
                </div>
              ) : (
                <p className="text-muted-foreground italic">
                  No biography available
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
