export type NewsItem = {
  slug: string;
  tag: string;
  title: string;
  excerpt: string;
  body: string;
  date: string;
  place: string;
  color: "leadership" | "branch" | "resource" | "finance";
};

export type EventItem = {
  slug: string;
  day: string;
  month: string;
  year: string;
  title: string;
  type: string;
  time: string;
  location: string;
  description: string;
  format: "Webinar" | "In-person" | "Hybrid";
};

export const featured: NewsItem = {
  slug: "mali-rc-workplace-first-aid",
  tag: "Resource Mobilisation",
  title: "Mali RC launches workplace first-aid programme generating local income",
  excerpt:
    "Backed by the Netherlands Red Cross under the Resource Mobilisation pillar, the new initiative trains corporate teams while building sustainable revenue for community services.",
  body: "The Mali Red Cross Society has rolled out a nationwide workplace first-aid certification programme that trains corporate employees and reinvests revenue into branch operations. Developed with the Netherlands Red Cross under the Resource Mobilisation pillar, the model is designed to be replicated by peer National Societies across the Alliance.",
  date: "12 May 2026",
  place: "Bamako, Mali",
  color: "resource",
};

export const news: NewsItem[] = [
  featured,
  {
    slug: "steering-group-kampala",
    tag: "Leadership",
    title: "Steering Group convenes in Kampala to set 2026–27 agenda",
    excerpt: "Six National Society leaders aligned the Alliance's two-year roadmap focused on governance and financial autonomy.",
    body: "The Localisation Hub Steering Group, chaired by the Uganda Red Cross Society, met in Kampala for three days of strategic planning. The agenda set priorities for the next two years across all four pillars, with new commitments on transparent governance and locally generated income.",
    date: "08 May 2026",
    place: "Kampala, Uganda",
    color: "leadership",
  },
  {
    slug: "zambia-branch-income",
    tag: "Branch Development",
    title: "Zambia RC pilots branch-led income model across 4 provinces",
    excerpt: "A new framework empowers branches to design and run their own revenue-generating community services.",
    body: "Zambia Red Cross has launched a four-province pilot equipping branches with tools to identify, design and operate locally relevant income-generating activities — from health services to logistics support — under a shared accountability framework.",
    date: "02 May 2026",
    place: "Lusaka, Zambia",
    color: "branch",
  },
  {
    slug: "norcross-ethiopia-toolkit",
    tag: "Finance Development",
    title: "NorCross & Ethiopian RC publish joint financial systems toolkit",
    excerpt: "Open-source guidance helps National Societies modernise core finance, audit and reporting practices.",
    body: "A new open toolkit co-authored by the Norwegian Red Cross and the Ethiopian Red Cross Society distils five years of joint work on financial systems strengthening into practical templates, controls and dashboards for peer National Societies.",
    date: "28 Apr 2026",
    place: "Addis Ababa, Ethiopia",
    color: "finance",
  },
  {
    slug: "south-sudan-domestic-donor",
    tag: "Resource Mobilisation",
    title: "South Sudan RC secures multi-year domestic donor partnership",
    excerpt: "A landmark agreement with a national private-sector consortium will fund branch operations through 2029.",
    body: "South Sudan Red Cross has signed a multi-year partnership with a coalition of domestic private-sector donors, marking a major milestone in the National Society's diversification of funding away from international project cycles.",
    date: "21 Apr 2026",
    place: "Juba, South Sudan",
    color: "resource",
  },
  {
    slug: "ivory-coast-youth",
    tag: "Branch Development",
    title: "Ivory Coast RC trains 1,200 youth volunteers in community first response",
    excerpt: "A national rollout doubles community-based response capacity across 14 branches.",
    body: "The Ivory Coast Red Cross Society completed a six-month volunteer training programme certifying 1,200 youth responders. The cohort doubles community-based emergency response capacity across 14 branches and feeds directly into the Branch Development pillar's learning agenda.",
    date: "14 Apr 2026",
    place: "Abidjan, Ivory Coast",
    color: "branch",
  },
  {
    slug: "ifrc-governance-roundtable",
    tag: "Leadership",
    title: "IFRC hosts governance roundtable on Pan-African Conference commitments",
    excerpt: "National Society Presidents reviewed PAC 2017 progress and shaped the agenda for the next conference.",
    body: "An IFRC-hosted roundtable brought together Presidents and Secretary Generals from across the Alliance to assess progress against Pan-African Conference 2017 commitments and shape the agenda for the next PAC cycle.",
    date: "05 Apr 2026",
    place: "Geneva, Switzerland",
    color: "leadership",
  },
];

export const events: EventItem[] = [
  {
    slug: "branch-income-webinar",
    day: "27", month: "MAY", year: "2026",
    title: "Peer Exchange: Branch-led Income Generation",
    type: "Webinar · Online",
    time: "14:00 EAT · 90 minutes",
    location: "Online",
    description: "A live peer exchange where Zambia, Mali and South Sudan Red Cross share their branch-led income generation models, followed by Q&A with Alliance partners.",
    format: "Webinar",
  },
  {
    slug: "pan-african-forum-2026",
    day: "11", month: "JUN", year: "2026",
    title: "Pan-African Localisation Forum 2026",
    type: "In-person · Nairobi, Kenya",
    time: "3 days · Full agenda",
    location: "Nairobi, Kenya",
    description: "The flagship convening of the Localisation Hub brings together National Society leadership, partners and the broader IFRC network for three days of dialogue, peer learning and strategy.",
    format: "In-person",
  },
  {
    slug: "finance-working-group-jun",
    day: "24", month: "JUN", year: "2026",
    title: "Finance Development Working Group",
    type: "Hybrid · Geneva + Online",
    time: "10:00 CET · Half-day",
    location: "Geneva, Switzerland (Hybrid)",
    description: "Quarterly working group session led by NorCross. Focus areas: audit readiness, multi-currency reporting and the new joint financial systems toolkit.",
    format: "Hybrid",
  },
  {
    slug: "leadership-masterclass-jul",
    day: "09", month: "JUL", year: "2026",
    title: "Leadership Masterclass: Governance Under Pressure",
    type: "Webinar · Online",
    time: "13:00 GMT · 2 hours",
    location: "Online",
    description: "An interactive masterclass for National Society Boards and Senior Leadership on navigating governance challenges during humanitarian crises.",
    format: "Webinar",
  },
  {
    slug: "resource-mob-summit-aug",
    day: "20", month: "AUG", year: "2026",
    title: "Resource Mobilisation Summit",
    type: "In-person · Amsterdam, Netherlands",
    time: "2 days",
    location: "Amsterdam, Netherlands",
    description: "Hosted by the Netherlands Red Cross — a working summit on domestic resource mobilisation, including the Workplace First Aid model and corporate partnerships.",
    format: "In-person",
  },
];

export const pillarColor: Record<string, string> = {
  leadership: "bg-pillar-leadership text-pillar-leadership-foreground",
  branch: "bg-pillar-branch text-pillar-branch-foreground",
  resource: "bg-pillar-resource text-pillar-resource-foreground",
  finance: "bg-pillar-finance text-pillar-finance-foreground",
};

export type Publication = {
  slug: string;
  title: string;
  description: string;
  category: "Toolkit" | "Report" | "Case Study" | "Guideline" | "Brief";
  pillar: "leadership" | "branch" | "resource" | "finance";
  fileType: "PDF" | "DOCX" | "XLSX" | "ZIP";
  size: string;
  pages?: number;
  date: string;
  author: string;
};

export type NationalSociety = {
  slug: string;
  name: string;
  shortName: string;
  country: string;
  region: string;
  flag: string; // emoji flag
  primaryPillar: "leadership" | "branch" | "resource" | "finance";
  pillars: Array<"leadership" | "branch" | "resource" | "finance">;
  established: number;
  members: number;
  branches: number;
  volunteers: number;
  status: "Active" | "Observer";
  description: string;
  highlights: string[];
  recentActivity: string;
  recentActivityDate: string;
  contactEmail: string;
  website: string;
  linkedNewsSlug?: string;
  keyStats: Array<{ label: string; value: string }>;
};

export const nationalSocieties: NationalSociety[] = [
  {
    slug: "mali-rc",
    name: "Mali Red Cross Society",
    shortName: "Mali RC",
    country: "Mali",
    region: "West Africa",
    flag: "🇲🇱",
    primaryPillar: "resource",
    pillars: ["resource", "branch"],
    established: 1965,
    members: 12400,
    branches: 54,
    volunteers: 8700,
    status: "Active",
    description:
      "The Mali Red Cross Society is a leading National Society in the Localisation Hub, recognised for its pioneering workplace first-aid revenue model that funds community health services across 54 branches.",
    highlights: [
      "Launched nationwide workplace first-aid certification programme generating sustainable local income",
      "Trained 3,200 corporate employees across Bamako, Mopti and Sikasso in 2025",
      "Revenue reinvested into 12 rural branch operations",
      "Partnership with Netherlands Red Cross under Resource Mobilisation pillar",
    ],
    recentActivity: "Workplace first-aid programme generating local income",
    recentActivityDate: "12 May 2026",
    contactEmail: "secretariat@croixrougemali.org",
    website: "https://www.croixrougemali.org",
    linkedNewsSlug: "mali-rc-workplace-first-aid",
    keyStats: [
      { label: "Branches", value: "54" },
      { label: "Volunteers", value: "8,700" },
      { label: "Annual Budget", value: "$2.1M" },
      { label: "Communities Served", value: "320" },
    ],
  },
  {
    slug: "uganda-rc",
    name: "Uganda Red Cross Society",
    shortName: "Uganda RC",
    country: "Uganda",
    region: "East Africa",
    flag: "🇺🇬",
    primaryPillar: "leadership",
    pillars: ["leadership", "finance"],
    established: 1964,
    members: 18900,
    branches: 112,
    volunteers: 14200,
    status: "Active",
    description:
      "Uganda Red Cross Society chairs the Alliance Steering Group, hosting the 2026 Kampala convening that set the two-year strategic roadmap. The Society is a model for transparent governance and locally accountable leadership structures.",
    highlights: [
      "Chairs the Localisation Hub Steering Group since 2024",
      "Hosted the 2026 Kampala strategic planning convening",
      "Pioneered a Board accountability framework adopted across 4 member societies",
      "Established the first national volunteer insurance scheme funded domestically",
    ],
    recentActivity: "Steering Group convenes in Kampala to set 2026–27 agenda",
    recentActivityDate: "08 May 2026",
    contactEmail: "info@urcs.or.ug",
    website: "https://www.urcs.or.ug",
    linkedNewsSlug: "steering-group-kampala",
    keyStats: [
      { label: "Branches", value: "112" },
      { label: "Volunteers", value: "14,200" },
      { label: "Annual Budget", value: "$5.8M" },
      { label: "Governance Score", value: "94/100" },
    ],
  },
  {
    slug: "zambia-rc",
    name: "Zambia Red Cross Society",
    shortName: "Zambia RC",
    country: "Zambia",
    region: "Southern Africa",
    flag: "🇿🇲",
    primaryPillar: "branch",
    pillars: ["branch", "resource"],
    established: 1966,
    members: 9800,
    branches: 72,
    volunteers: 6500,
    status: "Active",
    description:
      "The Zambia Red Cross Society is piloting a transformative branch-led income model across four provinces, empowering local branches to design and operate their own revenue-generating community services independently.",
    highlights: [
      "Launched 4-province pilot for branch-led income generation",
      "Equipped 72 branches with income-design toolkits",
      "Health services and logistics support generating branch revenue",
      "Framework adopted by Ivory Coast RC and Kenya RC",
    ],
    recentActivity: "Branch-led income model pilot across 4 provinces",
    recentActivityDate: "02 May 2026",
    contactEmail: "zrcs@zambiaredcross.org",
    website: "https://www.zambiaredcross.org",
    linkedNewsSlug: "zambia-branch-income",
    keyStats: [
      { label: "Branches", value: "72" },
      { label: "Volunteers", value: "6,500" },
      { label: "Annual Budget", value: "$1.7M" },
      { label: "Income Pilots", value: "4 provinces" },
    ],
  },
  {
    slug: "ethiopia-rc",
    name: "Ethiopian Red Cross Society",
    shortName: "Ethiopian RC",
    country: "Ethiopia",
    region: "East Africa",
    flag: "🇪🇹",
    primaryPillar: "finance",
    pillars: ["finance", "leadership"],
    established: 1935,
    members: 31000,
    branches: 220,
    volunteers: 24000,
    status: "Active",
    description:
      "The Ethiopian Red Cross Society, one of Africa's oldest humanitarian organisations, co-authored the Joint Financial Systems Toolkit with NorCross — now used by seven National Societies to modernise audit, reporting and financial controls.",
    highlights: [
      "Co-authored the open-source Joint Financial Systems Toolkit with NorCross",
      "220 branches with a fully digitised financial reporting system",
      "Audit readiness score improved from 61% to 89% over two years",
      "Hosts the East Africa Finance Development Working Group",
    ],
    recentActivity: "Joint financial systems toolkit published with NorCross",
    recentActivityDate: "28 Apr 2026",
    contactEmail: "info@ercs.org.et",
    website: "https://www.ercs.org.et",
    linkedNewsSlug: "norcross-ethiopia-toolkit",
    keyStats: [
      { label: "Branches", value: "220" },
      { label: "Volunteers", value: "24,000" },
      { label: "Annual Budget", value: "$9.4M" },
      { label: "Audit Score", value: "89%" },
    ],
  },
  {
    slug: "south-sudan-rc",
    name: "South Sudan Red Cross",
    shortName: "SSRC",
    country: "South Sudan",
    region: "East Africa",
    flag: "🇸🇸",
    primaryPillar: "resource",
    pillars: ["resource", "finance"],
    established: 2011,
    members: 4200,
    branches: 31,
    volunteers: 3100,
    status: "Active",
    description:
      "South Sudan Red Cross, established alongside the nation's independence, has achieved a landmark multi-year domestic donor partnership — a defining step toward funding diversification away from international project cycles.",
    highlights: [
      "Secured multi-year domestic private-sector donor consortium through 2029",
      "First National Society in the Hub to achieve majority domestic funding",
      "31 operational branches in conflict-affected areas",
      "Launched community-based psychosocial support programme in 2025",
    ],
    recentActivity: "Secured multi-year domestic donor partnership through 2029",
    recentActivityDate: "21 Apr 2026",
    contactEmail: "info@southsudanredcross.org",
    website: "https://www.southsudanredcross.org",
    linkedNewsSlug: "south-sudan-domestic-donor",
    keyStats: [
      { label: "Branches", value: "31" },
      { label: "Volunteers", value: "3,100" },
      { label: "Domestic Funding", value: "55%" },
      { label: "Partner Consortium", value: "12 firms" },
    ],
  },
  {
    slug: "ivory-coast-rc",
    name: "Ivory Coast Red Cross Society",
    shortName: "Ivory Coast RC",
    country: "Ivory Coast",
    region: "West Africa",
    flag: "🇨🇮",
    primaryPillar: "branch",
    pillars: ["branch", "resource"],
    established: 1959,
    members: 15600,
    branches: 88,
    volunteers: 11200,
    status: "Active",
    description:
      "The Ivory Coast Red Cross Society has doubled its community emergency response capacity through a national youth volunteer programme — certifying 1,200 responders across 14 branches, becoming a model for branch-level capability building.",
    highlights: [
      "Trained 1,200 youth volunteers in community first response",
      "Doubled emergency response capacity across 14 branches",
      "Community-based response model recognised by IFRC as best practice",
      "Developing a volunteer retention programme with 88% 2-year retention rate",
    ],
    recentActivity: "1,200 youth volunteers trained in community first response",
    recentActivityDate: "14 Apr 2026",
    contactEmail: "info@croixrougeci.org",
    website: "https://www.croixrougeci.org",
    linkedNewsSlug: "ivory-coast-youth",
    keyStats: [
      { label: "Branches", value: "88" },
      { label: "Volunteers", value: "11,200" },
      { label: "Youth Certified", value: "1,200" },
      { label: "Retention Rate", value: "88%" },
    ],
  },
  {
    slug: "kenya-rc",
    name: "Kenya Red Cross Society",
    shortName: "Kenya RC",
    country: "Kenya",
    region: "East Africa",
    flag: "🇰🇪",
    primaryPillar: "leadership",
    pillars: ["leadership", "branch", "finance"],
    established: 1965,
    members: 24700,
    branches: 147,
    volunteers: 19000,
    status: "Active",
    description:
      "Kenya Red Cross Society is the host for the Pan-African Localisation Forum 2026 in Nairobi. As one of Africa's most operationally mature National Societies, it anchors the Hub's East Africa cluster and peer-learning network.",
    highlights: [
      "Host of Pan-African Localisation Forum 2026, Nairobi",
      "147 branches with a unified digital volunteer management system",
      "Hub's lead facilitator for cross-society governance peer learning",
      "Operates Kenya's largest first-responder training academy",
    ],
    recentActivity: "Hosting Pan-African Localisation Forum 2026 in Nairobi",
    recentActivityDate: "11 Jun 2026",
    contactEmail: "info@redcross.or.ke",
    website: "https://www.redcross.or.ke",
    keyStats: [
      { label: "Branches", value: "147" },
      { label: "Volunteers", value: "19,000" },
      { label: "Annual Budget", value: "$11.2M" },
      { label: "Training Graduates", value: "4,800" },
    ],
  },
  {
    slug: "senegal-rc",
    name: "Senegalese Red Cross Society",
    shortName: "Senegal RC",
    country: "Senegal",
    region: "West Africa",
    flag: "🇸🇳",
    primaryPillar: "finance",
    pillars: ["finance", "resource"],
    established: 1963,
    members: 8300,
    branches: 45,
    volunteers: 5900,
    status: "Active",
    description:
      "The Senegalese Red Cross Society is piloting a microfinance lending model for community health workers — a novel approach to finance development that creates self-sustaining local health networks independent of project funding.",
    highlights: [
      "Piloting microfinance lending model for community health workers",
      "Partnership with 3 domestic commercial banks under the Finance pillar",
      "45 branches with certified finance officers trained by NorCross",
      "First ECOWAS National Society to pass external audit with zero findings",
    ],
    recentActivity: "Microfinance pilot for community health workers launched",
    recentActivityDate: "05 Apr 2026",
    contactEmail: "info@croixrougesenegalaise.org",
    website: "https://www.croixrougesenegalaise.org",
    keyStats: [
      { label: "Branches", value: "45" },
      { label: "Volunteers", value: "5,900" },
      { label: "Audit Findings", value: "0 (2025)" },
      { label: "Bank Partners", value: "3" },
    ],
  },
  {
    slug: "mozambique-rc",
    name: "Mozambique Red Cross Society",
    shortName: "Cruz Vermelha MZ",
    country: "Mozambique",
    region: "Southern Africa",
    flag: "🇲🇿",
    primaryPillar: "branch",
    pillars: ["branch", "leadership"],
    established: 1981,
    members: 7100,
    branches: 38,
    volunteers: 5200,
    status: "Active",
    description:
      "Cruz Vermelha de Moçambique operates in one of the world's most climate-exposed nations. The Society leads the Hub's climate-resilience integration workstream, embedding disaster risk reduction into all branch activities.",
    highlights: [
      "Leads the Hub's climate resilience integration workstream",
      "Early warning systems deployed across 24 climate-exposed branches",
      "Community-based disaster risk reduction in 3 coastal provinces",
      "Developed cyclone-readiness standard adopted by 4 peer societies",
    ],
    recentActivity: "Climate resilience workstream launched with 24 branches",
    recentActivityDate: "18 Mar 2026",
    contactEmail: "secretariado@crvm.org.mz",
    website: "https://www.crvm.org.mz",
    keyStats: [
      { label: "Branches", value: "38" },
      { label: "Volunteers", value: "5,200" },
      { label: "Climate-ready Branches", value: "24" },
      { label: "DRR Communities", value: "180" },
    ],
  },
  {
    slug: "tanzania-rc",
    name: "Tanzania Red Cross Society",
    shortName: "Tanzania RC",
    country: "Tanzania",
    region: "East Africa",
    flag: "🇹🇿",
    primaryPillar: "resource",
    pillars: ["resource", "branch", "leadership"],
    established: 1962,
    members: 16500,
    branches: 98,
    volunteers: 13000,
    status: "Observer",
    description:
      "Tanzania Red Cross Society holds observer status while completing its governance alignment process. The Society operates a respected community-health enterprise model and is on track for full Alliance membership by Q3 2026.",
    highlights: [
      "Observer status — expected full membership Q3 2026",
      "Community health enterprise model generating 40% of branch income",
      "Governance restructuring supported by Uganda RC mentorship",
      "98 branches with volunteer management system fully operational",
    ],
    recentActivity: "Governance alignment on track for full membership Q3 2026",
    recentActivityDate: "10 Feb 2026",
    contactEmail: "info@tanzaniaredcross.or.tz",
    website: "https://www.tanzaniaredcross.or.tz",
    keyStats: [
      { label: "Branches", value: "98" },
      { label: "Volunteers", value: "13,000" },
      { label: "Local Income Share", value: "40%" },
      { label: "Status", value: "Observer" },
    ],
  },
];

export const publications: Publication[] = [
  {
    slug: "financial-systems-toolkit-2026",
    title: "Joint Financial Systems Toolkit",
    description: "Open-source templates, controls, dashboards and audit checklists co-authored by NorCross and the Ethiopian Red Cross.",
    category: "Toolkit",
    pillar: "finance",
    fileType: "ZIP",
    size: "12.4 MB",
    date: "28 Apr 2026",
    author: "NorCross & Ethiopian RC",
  },
  {
    slug: "branch-led-income-playbook",
    title: "Branch-led Income Generation Playbook",
    description: "A practical playbook for designing and operating branch-level income initiatives, drawn from the Zambia RC pilot.",
    category: "Guideline",
    pillar: "branch",
    fileType: "PDF",
    size: "4.1 MB",
    pages: 64,
    date: "02 May 2026",
    author: "Zambia Red Cross",
  },
  {
    slug: "workplace-first-aid-model",
    title: "Workplace First Aid: Operating Model",
    description: "Mali RC's revenue-generating workplace first-aid programme — pricing, partnerships and training curriculum.",
    category: "Case Study",
    pillar: "resource",
    fileType: "PDF",
    size: "2.8 MB",
    pages: 32,
    date: "12 May 2026",
    author: "Mali RC & Netherlands RC",
  },
  {
    slug: "governance-under-pressure",
    title: "Governance Under Pressure: Board Brief",
    description: "Brief for National Society Boards on navigating governance in protracted humanitarian crises.",
    category: "Brief",
    pillar: "leadership",
    fileType: "PDF",
    size: "1.2 MB",
    pages: 14,
    date: "20 Apr 2026",
    author: "IFRC",
  },
  {
    slug: "alliance-annual-report-2025",
    title: "Localisation Hub Annual Report 2025",
    description: "Full-year results across the four pillars, with country-level highlights and 2026 outlook.",
    category: "Report",
    pillar: "leadership",
    fileType: "PDF",
    size: "8.7 MB",
    pages: 96,
    date: "15 Mar 2026",
    author: "Localisation Hub Secretariat",
  },
  {
    slug: "domestic-resource-mobilisation-guide",
    title: "Domestic Resource Mobilisation: Field Guide",
    description: "Tactics for diversifying funding through domestic donors, corporate partnerships and earned income.",
    category: "Guideline",
    pillar: "resource",
    fileType: "PDF",
    size: "3.5 MB",
    pages: 48,
    date: "10 Feb 2026",
    author: "Swiss RC & Netherlands RC",
  },
  {
    slug: "branch-standards-framework",
    title: "Branch Standards Framework v2",
    description: "Updated branch standards covering volunteer engagement, community services and accountability.",
    category: "Toolkit",
    pillar: "branch",
    fileType: "DOCX",
    size: "0.9 MB",
    date: "05 Feb 2026",
    author: "IFRC",
  },
  {
    slug: "audit-readiness-workbook",
    title: "Audit Readiness Workbook",
    description: "Self-assessment workbook for finance teams preparing for external audit cycles.",
    category: "Toolkit",
    pillar: "finance",
    fileType: "XLSX",
    size: "1.1 MB",
    date: "22 Jan 2026",
    author: "NorCross",
  },
];
