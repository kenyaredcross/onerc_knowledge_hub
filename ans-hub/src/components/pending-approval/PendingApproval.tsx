import { Link, useSearchParams, useNavigate } from "react-router-dom";
import { Check, Clock, Mail, ShieldCheck, LogOut, HelpCircle, XCircle } from "lucide-react";
import { useFrappePostCall } from "frappe-react-sdk";
import { useEffect, useState } from "react";

export default function PendingApprovalPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const email = searchParams.get("email") || "your-email@example.com";

  const [registrationStatus, setRegistrationStatus] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { call: checkStatus } = useFrappePostCall(
    "onerc_knowledge_hub.api.register.check_registration_status"
  );

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const result = await checkStatus({ email });
        setRegistrationStatus(result);

        // If approved and user account is enabled, redirect to set password page
        if (result?.status === "Approved" && result?.has_user_account && !result?.user_enabled) {
          // User should set password
          navigate(`/set-password?key=${result.name}`);
        } else if (result?.status === "Approved" && result?.user_enabled) {
          // User is already activated, redirect to login
          navigate("/login");
        }
      } catch (error) {
        console.error("Error fetching status:", error);
      } finally {
        setIsLoading(false);
      }
    };

    if (email && email !== "your-email@example.com") {
      fetchStatus();
      // Poll every 30 seconds for status updates
      const interval = setInterval(fetchStatus, 30000);
      return () => clearInterval(interval);
    } else {
      setIsLoading(false);
    }
  }, [email, checkStatus, navigate]);

  const getSteps = () => {
    const status = registrationStatus?.status || "Pending";

    return [
      {
        n: "01",
        icon: Check,
        title: "Registration submitted",
        desc: "Your credentials and organisational details have been received.",
        status: "Completed",
        state: "done" as const,
      },
      {
        n: "02",
        icon: status === "Rejected" ? XCircle : Clock,
        title: status === "Rejected" ? "Application rejected" : "Identity & affiliation check",
        desc: status === "Rejected"
          ? "Your application was not approved. Please contact support for more information."
          : "Our team is verifying your identity and National Society affiliation.",
        status: status === "Pending"
          ? "In progress · Est. 1–2 business days"
          : status === "Approved"
          ? "Completed"
          : "Rejected",
        state: status === "Pending"
          ? ("active" as const)
          : status === "Approved"
          ? ("done" as const)
          : ("rejected" as const),
      },
      {
        n: "03",
        icon: ShieldCheck,
        title: "Activation email sent",
        desc: status === "Approved"
          ? "Check your email for the activation link to set your password."
          : "Once approved, you'll receive an email with a link to set your password and activate your account.",
        status: status === "Approved" ? "Completed" : "Waiting",
        state: status === "Approved" ? ("done" as const) : ("pending" as const),
      },
    ];
  };

  const steps = getSteps();

  return (
    <main className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="border-b border-border/60 bg-background/80 backdrop-blur sticky top-0 z-30">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <Link to="/" className="flex items-center gap-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-md bg-accent font-display text-sm font-bold text-accent-foreground">
              +
            </span>
            <span className="leading-tight">
              <span className="block font-display text-base font-semibold">Localisation Hub</span>
            </span>
          </Link>
          <div className="flex items-center gap-3 text-sm text-muted-foreground">
            {!isLoading && (
              <span className={`hidden items-center gap-2 rounded-full px-3 py-1.5 text-xs font-medium sm:inline-flex ${
                registrationStatus?.status === "Approved"
                  ? "bg-green-500/10 text-green-600"
                  : registrationStatus?.status === "Rejected"
                  ? "bg-red-500/10 text-red-600"
                  : "bg-secondary text-secondary-foreground"
              }`}>
                {registrationStatus?.status === "Pending" && (
                  <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-accent" />
                )}
                {registrationStatus?.status === "Approved"
                  ? "Application approved"
                  : registrationStatus?.status === "Rejected"
                  ? "Application rejected"
                  : "Account pending review"}
              </span>
            )}
            <Link to="/about" className="hover:text-foreground">About</Link>
            <button className="inline-flex items-center gap-1.5 rounded-md border border-border px-3 py-1.5 text-xs font-medium hover:bg-secondary">
              <LogOut className="h-3.5 w-3.5" /> Sign out
            </button>
          </div>
        </div>
      </header>

      <section className="mx-auto max-w-3xl px-6 py-16 md:py-24">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="h-12 w-12 animate-spin rounded-full border-4 border-accent/30 border-t-accent"></div>
            <p className="mt-4 text-sm text-muted-foreground">Checking your registration status...</p>
          </div>
        ) : (
          <>
            {/* Status badge */}
            <div className="flex flex-col items-center text-center">
              <span className={`inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-xs font-semibold uppercase tracking-widest ${
                registrationStatus?.status === "Approved"
                  ? "border-green-500/30 bg-green-500/10 text-green-600"
                  : registrationStatus?.status === "Rejected"
                  ? "border-red-500/30 bg-red-500/10 text-red-600"
                  : "border-accent/30 bg-accent/10 text-accent"
              }`}>
                {registrationStatus?.status === "Approved" ? (
                  <>
                    <Check className="h-3.5 w-3.5" />
                    Application Approved
                  </>
                ) : registrationStatus?.status === "Rejected" ? (
                  <>
                    <XCircle className="h-3.5 w-3.5" />
                    Application Rejected
                  </>
                ) : (
                  <>
                    <Clock className="h-3.5 w-3.5" />
                    Access under review
                  </>
                )}
              </span>

              <h1 className="mt-8 font-display text-4xl font-semibold leading-tight tracking-tight md:text-5xl">
                {registrationStatus?.status === "Approved"
                  ? "Your application has been approved!"
                  : registrationStatus?.status === "Rejected"
                  ? "Application status update"
                  : "Thank you for registering with the Africa Localisation Hub."}
              </h1>
              <p className="mt-5 max-w-xl text-base text-muted-foreground md:text-lg">
                {registrationStatus?.status === "Approved"
                  ? "Check your email for the activation link to set your password and access your account."
                  : registrationStatus?.status === "Rejected"
                  ? "Unfortunately, your application was not approved. Please contact support for more information."
                  : "Your details are being verified by our team — you will be notified by email once access has been granted."}
              </p>
            </div>
          </>
        )}

        {!isLoading && (
          <>
            {/* Email confirmation */}
            <div className="mt-10 flex items-start gap-4 rounded-2xl border border-border bg-card p-5 shadow-sm">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-secondary text-primary">
                <Mail className="h-5 w-5" />
              </div>
              <div className="text-sm">
                <p className="text-foreground">
                  A confirmation was sent to{" "}
                  <span className="font-semibold text-primary">{email}</span>.
                </p>
                <p className="mt-1 text-muted-foreground">
                  Check your inbox — including your spam folder.
                </p>
              </div>
            </div>

            {/* Approval process */}
            <div className="mt-12">
              <p className="text-xs font-semibold uppercase tracking-widest text-accent">Approval process</p>
              <h2 className="mt-2 font-display text-2xl font-semibold">What happens next</h2>

              <ol className="mt-8 space-y-4">
                {steps.map((s) => {
                  const isDone = s.state === "done";
                  const isActive = s.state === "active";
                  const isRejected = s.state === "rejected";
                  return (
                    <li
                      key={s.n}
                      className={`relative flex gap-5 rounded-2xl border p-6 transition ${
                        isActive
                          ? "border-accent/40 bg-accent/5 shadow-[var(--shadow-elegant)]"
                          : isRejected
                          ? "border-red-500/40 bg-red-500/5"
                          : "border-border bg-card"
                      }`}
                    >
                      <div
                        className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl font-display text-sm font-semibold ${
                          isDone
                            ? "bg-primary text-primary-foreground"
                            : isActive
                            ? "bg-accent text-accent-foreground"
                            : isRejected
                            ? "bg-red-500 text-white"
                            : "bg-secondary text-muted-foreground"
                        }`}
                      >
                        {isDone || isRejected ? <s.icon className="h-5 w-5" /> : s.n}
                      </div>
                      <div className="flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="font-display text-lg font-semibold">{s.title}</h3>
                          {isActive && (
                            <span className="inline-flex items-center gap-1.5 rounded-full bg-accent/15 px-2.5 py-0.5 text-xs font-medium text-accent">
                              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-accent" />
                              In progress
                            </span>
                          )}
                        </div>
                        <p className="mt-1.5 text-sm text-muted-foreground">{s.desc}</p>
                        <p
                          className={`mt-3 text-xs font-medium ${
                            isDone
                              ? "text-primary"
                              : isActive
                              ? "text-accent"
                              : isRejected
                              ? "text-red-600"
                              : "text-muted-foreground"
                          }`}
                        >
                          {s.status}
                        </p>
                      </div>
                    </li>
                  );
                })}
              </ol>
            </div>
          </>
        )}

        {/* Footer help */}
        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-border pt-8 text-sm text-muted-foreground sm:flex-row">
          <a
            href="mailto:support@ifrc.org"
            className="inline-flex items-center gap-2 font-medium text-foreground hover:text-accent"
          >
            <HelpCircle className="h-4 w-4" />
            Questions? Contact support
          </a>
          <div className="flex items-center gap-5">
            <Link to="/about" className="hover:text-foreground">About</Link>
            <button className="inline-flex items-center gap-1.5 hover:text-foreground">
              <LogOut className="h-3.5 w-3.5" /> Sign out
            </button>
          </div>
        </div>
      </section>
    </main>
  );
}
