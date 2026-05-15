import { Users, TrendingUp, Building2, DollarSign, CheckCircle2, Lightbulb } from "lucide-react";
import { pillarColor } from "../../lib/site-data";

const pillars = [
  {
    name: "Leadership & Governance",
    color: "leadership",
    icon: Users,
    lead: "IFRC",
    description:
      "Strengthening National Society governance, leadership capacity and strategic planning — ensuring locally led decision-making and transparent, accountable structures.",
    objectives: [
      "Board and governance strengthening",
      "Strategic planning and organizational development",
      "Volunteer management and engagement",
      "Accountability frameworks and compliance",
    ],
  },
  {
    name: "Branch Development",
    color: "branch",
    icon: Building2,
    lead: "IFRC",
    description:
      "Building the capacity of National Society branches to deliver community-based services — from volunteer training to local service delivery and community engagement.",
    objectives: [
      "Branch capacity assessment and planning",
      "Community-based service delivery models",
      "Volunteer recruitment and retention",
      "Branch standards and quality frameworks",
    ],
  },
  {
    name: "Resource Mobilisation",
    color: "resource",
    icon: TrendingUp,
    lead: "Swiss & Netherlands RC",
    description:
      "Diversifying funding sources through domestic resource mobilisation, corporate partnerships and earned income — reducing dependency on international project funding.",
    objectives: [
      "Domestic donor engagement strategies",
      "Corporate partnership development",
      "Earned income and social enterprise models",
      "Membership and individual giving programmes",
    ],
  },
  {
    name: "Finance Development",
    color: "finance",
    icon: DollarSign,
    lead: "NorCross",
    description:
      "Modernising financial systems, controls and reporting — ensuring audit-ready, transparent financial management that meets international standards.",
    objectives: [
      "Financial systems and controls strengthening",
      "Audit readiness and compliance",
      "Multi-currency and project accounting",
      "Financial reporting and transparency",
    ],
  },
];

export default function Pillars() {
  return (
    <div className="min-h-full bg-gray-50">
      {/* Hero Section */}
      <div className="bg-white border-b border-gray-200">
        <div className="mx-auto max-w-7xl px-6 py-12">
          <div className="text-center max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-dash-red/10 text-dash-red text-xs font-semibold uppercase tracking-wider mb-4">
              <Lightbulb className="h-3.5 w-3.5" />
              Four Pillars
            </div>
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Building Self-Reliant National Societies
            </h1>
            <p className="text-lg text-gray-600 leading-relaxed">
              Each pillar represents a critical dimension of National Society strengthening, led by Consortium Partners with deep expertise in locally-led humanitarian action.
            </p>
          </div>
        </div>
      </div>

      {/* Pillars Grid */}
      <div className="mx-auto max-w-7xl px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {pillars.map((pillar) => {
            const Icon = pillar.icon;
            return (
              <div
                key={pillar.name}
                className="group bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-lg transition-all duration-300"
              >
                {/* Icon Header */}
                <div className={`relative h-32 ${pillarColor[pillar.color]} overflow-hidden`}>
                  <div
                    className="absolute inset-0 opacity-10"
                    style={{
                      backgroundImage: "radial-gradient(circle at 30% 50%, white 2px, transparent 2px)",
                      backgroundSize: "24px 24px",
                    }}
                  />
                  <div className="relative h-full flex items-center justify-center">
                    <div className="flex flex-col items-center gap-3">
                      <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-white/20 backdrop-blur-sm">
                        <Icon className="h-8 w-8 text-white" />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Content */}
                <div className="p-6">
                  <div className="flex items-start justify-between mb-3">
                    <h2 className="text-xl font-bold text-gray-900 leading-tight">
                      {pillar.name}
                    </h2>
                  </div>

                  <div className="inline-flex items-center gap-1.5 px-2 py-1 rounded bg-gray-100 text-gray-600 text-xs font-medium mb-4">
                    <Users className="h-3 w-3" />
                    Led by {pillar.lead}
                  </div>

                  <p className="text-sm text-gray-600 leading-relaxed mb-5">
                    {pillar.description}
                  </p>

                  <div className="border-t border-gray-100 pt-4">
                    <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-3">
                      Key Objectives
                    </h3>
                    <ul className="space-y-2">
                      {pillar.objectives.map((obj, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                          <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-green-600" />
                          <span>{obj}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Bottom Info Card */}
        <div className="mt-12 bg-gradient-to-br from-dash-navy to-blue-900 rounded-xl p-8 text-center relative overflow-hidden">
          <div
            className="absolute inset-0 opacity-5"
            style={{
              backgroundImage: "radial-gradient(circle at 30% 50%, white 2px, transparent 2px)",
              backgroundSize: "24px 24px",
            }}
          />
          <div className="relative">
            <h2 className="text-2xl font-bold text-white mb-3">
              Peer-to-Peer by Design
            </h2>
            <p className="mx-auto max-w-3xl text-white/90 leading-relaxed">
              Each pillar operates through working groups, peer exchanges and joint learning activities — ensuring knowledge flows directly between National Societies, building sustainable capacity through shared experience.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
