import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useFrappeGetCall } from "frappe-react-sdk";

/**
 * Auth — sign-in / sign-up screen with a sliding red panel.
 * Self-contained: all styles live inside the component.
 * Wire real auth by passing onSignIn / onSignUp handlers.
 */
interface AuthProps {
  onSignIn?: (credentials: { email: string; password: string }) => void;
  onSignUp?: (userData: {
    first_name: string;
    last_name: string;
    preferred_contact_email: string;
    phone_number: string;
    position: string;
    national_society: string;
    primary_language: string;
    gender: string;
  }) => void;
}

export default function Auth({ onSignIn, onSignUp }: AuthProps = {}) {
  const [isSignIn, setIsSignIn] = useState(true);
  const [isAnimating, setIsAnimating] = useState(false);

  // Fetch national societies
  const { data: nationalSocieties, isLoading: loadingSocieties } = useFrappeGetCall(
    "onerc_knowledge_hub.api.register.get_national_societies"
  );

  // Fetch languages
  const { data: languages, isLoading: loadingLanguages } = useFrappeGetCall(
    "onerc_knowledge_hub.api.register.get_languages"
  );

  // Fetch designations (positions)
  const { data: designations, isLoading: loadingDesignations } = useFrappeGetCall(
    "onerc_knowledge_hub.api.register.get_designations"
  );

  // Sign-up form state
  const [signUpData, setSignUpData] = useState({
    first_name: "",
    last_name: "",
    preferred_contact_email: "",
    phone_number: "",
    position: "",
    national_society: "",
    primary_language: "",
    gender: "",
  });

  // Sign-in form state
  const [signInData, setSignInData] = useState({
    email: "",
    password: "",
  });

  // Fonts are already loaded globally via index.html - no need to load again
  useEffect(() => {
    // Font loading is handled globally in index.html
  }, []);

  const toggleForm = (e?: React.MouseEvent<HTMLButtonElement>) => {
    e?.preventDefault();
    e?.stopPropagation();

    if (isAnimating) return; // Prevent multiple clicks during animation

    setIsAnimating(true);
    setTimeout(() => setIsAnimating(false), 1100);
    setIsSignIn((prev) => !prev);

    if (window.matchMedia("(max-width: 760px)").matches) {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handleSignUp = (e: React.FormEvent) => {
    e.preventDefault();
    if (typeof onSignUp === "function") {
      onSignUp(signUpData);
    }
  };

  const handleSignIn = (e: React.FormEvent) => {
    e.preventDefault();
    if (typeof onSignIn === "function") {
      onSignIn(signInData);
    }
  };

  return (
    <>
      <style>{css}</style>

      <div className="ma-root">
        {/* Editorial corner marks (hidden on mobile) */}
        <div className="ma-mark ma-mark--tl">Knowledge Hub&nbsp;/&nbsp;Est. 2026</div>
        <div className="ma-mark ma-mark--tr">Localization</div>
        <div className="ma-mark ma-mark--bl">Allways There</div>

        <div className={`ma-main ${isSignIn ? "is-signin" : ""}`}>
          {/* SIGN UP */}
          <div className={`ma-container ma-a ${isSignIn ? "is-shift" : ""}`}>
            <form className="ma-form" onSubmit={handleSignUp}>
              <div className="ma-eyebrow">01 &nbsp; Begin</div>
              <h2 className="ma-title">
                Create an <em>account</em>
              </h2>
              <p className="ma-sub">
                Submit your details below. Your account will be reviewed and activated upon approval.
              </p>

              <div className="ma-field">
                <label className="ma-label">
                  First Name
                </label>
                <input
                  className="ma-input"
                  type="text"
                  placeholder="Enter your first name"
                  value={signUpData.first_name}
                  onChange={(e) =>
                    setSignUpData({ ...signUpData, first_name: e.target.value })
                  }
                  required
                />
              </div>
              <div className="ma-field">
                <label className="ma-label">
                  Last Name
                </label>
                <input
                  className="ma-input"
                  type="text"
                  placeholder="Enter your last name"
                  value={signUpData.last_name}
                  onChange={(e) =>
                    setSignUpData({ ...signUpData, last_name: e.target.value })
                  }
                  required
                />
              </div>
              <div className="ma-field">
                <label className="ma-label">
                  Email
                </label>
                <input
                  className="ma-input"
                  type="email"
                  placeholder="you@somewhere.com"
                  value={signUpData.preferred_contact_email}
                  onChange={(e) =>
                    setSignUpData({ ...signUpData, preferred_contact_email: e.target.value })
                  }
                  required
                />
              </div>
              <div className="ma-field">
                <label className="ma-label">
                  Phone Number
                </label>
                <input
                  className="ma-input"
                  type="tel"
                  placeholder="+1234567890"
                  value={signUpData.phone_number}
                  onChange={(e) =>
                    setSignUpData({ ...signUpData, phone_number: e.target.value })
                  }
                  required
                />
              </div>
              <div className="ma-field">
                <label className="ma-label">
                  Position
                </label>
                <select
                  className="ma-input"
                  value={signUpData.position}
                  onChange={(e) =>
                    setSignUpData({ ...signUpData, position: e.target.value })
                  }
                  required
                  disabled={loadingDesignations}
                >
                  <option value="">Select your position</option>
                  {designations?.message?.map((designation: any) => (
                    <option key={designation.name} value={designation.name}>
                      {designation.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="ma-field">
                <label className="ma-label">
                  National Society
                </label>
                <select
                  className="ma-input"
                  value={signUpData.national_society}
                  onChange={(e) =>
                    setSignUpData({ ...signUpData, national_society: e.target.value })
                  }
                  required
                  disabled={loadingSocieties}
                >
                  <option value="">
                    {loadingSocieties ? "Loading..." : "Select your organization"}
                  </option>
                  {nationalSocieties?.message?.map((society: { name: string; full_official_name: string; short_name: string; country: string }) => (
                    <option key={society.name} value={society.name}>
                      {society.full_official_name} {society.country ? `(${society.country})` : ''}
                    </option>
                  ))}
                </select>
              </div>
              <div className="ma-field">
                <label className="ma-label">
                  Primary Language
                </label>
                <select
                  className="ma-input"
                  value={signUpData.primary_language}
                  onChange={(e) =>
                    setSignUpData({ ...signUpData, primary_language: e.target.value })
                  }
                  required
                  disabled={loadingLanguages}
                >
                  <option value="">Select your primary language</option>
                  {languages?.message?.map((lang: any) => (
                    <option key={lang.name} value={lang.name}>
                      {lang.language_name || lang.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="ma-field">
                <label className="ma-label">
                  Gender
                </label>
                <select
                  className="ma-input"
                  value={signUpData.gender}
                  onChange={(e) =>
                    setSignUpData({ ...signUpData, gender: e.target.value })
                  }
                  required
                >
                  <option value="">Select your gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                  <option value="Prefer not to say">Prefer not to say</option>
                </select>
              </div>

              <button className="ma-button" type="submit">
                <span className="ma-btn-label">Submit Registration</span>
                <span className="ma-btn-arrow">→</span>
              </button>
            </form>
          </div>

          {/* SIGN IN */}
          <div className={`ma-container ma-b ${isSignIn ? "is-shift is-z200" : ""}`}>
            <form className="ma-form" onSubmit={handleSignIn}>
              <div className="ma-eyebrow">Return &nbsp; ·</div>
              <h2 className="ma-title">
                Welcome <em>back</em>
              </h2>
              <p className="ma-sub">The room is as you left it. Sign in to continue.</p>

              <div className="ma-field">
                <label className="ma-label">
                  Email or Username
                </label>
                <input
                  className="ma-input"
                  type="text"
                  placeholder="you@somewhere.com or username"
                  value={signInData.email}
                  onChange={(e) =>
                    setSignInData({ ...signInData, email: e.target.value })
                  }
                  required
                />
              </div>
              <div className="ma-field">
                <label className="ma-label">
                  Password
                </label>
                <input
                  className="ma-input"
                  type="password"
                  placeholder="••••••••"
                  value={signInData.password}
                  onChange={(e) =>
                    setSignInData({ ...signInData, password: e.target.value })
                  }
                  required
                />
              </div>

              <div className="ma-row">
                <Link to="/forgot-password" className="ma-link">
                  Forgot your password?
                </Link>
              </div>

              <button className="ma-button" type="submit">
                <span className="ma-btn-label">Sign In</span>
                <span className="ma-btn-arrow">→</span>
              </button>
            </form>
          </div>

          {/* Red switch panel */}
          <div
            className={`ma-switch ${isSignIn ? "is-txr" : ""} ${
              isAnimating ? "is-gx" : ""
            }`}
          >
            <div className="ma-glyph">&amp;</div>

            <div className={`ma-switch-panel ${isSignIn ? "is-hidden" : ""}`}>
              <div className="ma-switch-index">Chapter I</div>
              <h2 className="ma-switch-title">
                Hello,<strong>Stranger.</strong>
              </h2>
              <p className="ma-switch-desc">
                <strong>Already a member? Step back through the door and we'll pick up where you left off.</strong>
              </p>
              <button className="ma-switch-btn" type="button" onClick={toggleForm}>
                <span>Sign In</span>
                <span>→</span>
              </button>
            </div>

            <div className={`ma-switch-panel ${!isSignIn ? "is-hidden" : ""}`}>
              <div className="ma-switch-index">Chapter II</div>
              <h2 className="ma-switch-title">
                Hello,<strong>Friend.</strong>
              </h2>
              <p className="ma-switch-desc">
                <strong>Not a member yet? Leave your details and we'll prepare a place for you.</strong>
              </p>
              <button className="ma-switch-btn" type="button" onClick={toggleForm}>
                <span>Sign Up</span>
                <span>→</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

/* ============================================================
 *  All styles. Class names are prefixed with ma- to avoid
 *  collisions with anything else on the page.
 * ============================================================ */
const css = `
  :root {
    --ma-paper: #fafaf7;
    --ma-ink: #1a1212;
    --ma-ink-soft: #5a4a4a;
    --ma-rule: #e8e2dd;
    --ma-red: #ee2435;
    --ma-red-deep: #b8181f;
    --ma-red-tint: #fef0f1;
    --ma-shadow-soft: 0 1px 2px rgba(26, 18, 18, 0.04),
      0 8px 24px -8px rgba(26, 18, 18, 0.08);
  }

  html, body {
    margin: 0;
  }

  .ma-root {
    width: 100%;
    min-height: 100vh;
    font-family: "Google Sans Flex", -apple-system, BlinkMacSystemFont, sans-serif;
    font-size: 14px;
    color: var(--ma-ink);
    background-color: var(--ma-paper);
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 24px;
    overflow: hidden;
    position: relative;
  }

  .ma-root::before {
    content: "";
    position: absolute;
    inset: 0;
    pointer-events: none;
    background-image: radial-gradient(
      circle at 1px 1px,
      rgba(26, 18, 18, 0.05) 1px,
      transparent 0
    );
    background-size: 3px 3px;
    opacity: 0.4;
    z-index: 1;
  }

  /* corner marks */
  .ma-mark {
    position: absolute;
    font-family: "Google Sans Flex", sans-serif;
    font-size: 10px;
    font-weight: 500;
    letter-spacing: 0.18em;
    text-transform: uppercase;
    color: var(--ma-ink-soft);
    z-index: 10;
  }
  .ma-mark--tl { top: 28px; left: 32px; }
  .ma-mark--tr { top: 28px; right: 32px; }
  .ma-mark--bl { bottom: 28px; left: 32px; }

  .ma-main {
    position: relative;
    width: 100%;
    max-width: 1400px;
    height: 720px;
    background-color: #ffffff;
    border: 1px solid var(--ma-rule);
    box-shadow: var(--ma-shadow-soft);
    overflow: hidden;
    z-index: 5;
    transition: max-width 1.1s cubic-bezier(0.7, 0, 0.3, 1);
  }

  .ma-main.is-signin {
    max-width: 1000px;
  }

  /* form containers */
  .ma-container {
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
    position: absolute;
    top: 0;
    width: 60%;
    height: 100%;
    padding: 40px clamp(32px, 6vw, 80px);
    background-color: #ffffff;
    transition: 1.1s cubic-bezier(0.7, 0, 0.3, 1);
    overflow-y: auto;
    overflow-x: hidden;
  }
  .ma-a { z-index: 100; left: 40%; }
  .ma-b { z-index: 0;   left: 40%; }

  .ma-form {
    display: flex;
    flex-direction: column;
    width: 100%;
  }

  /* Two-column grid for signup form */
  .ma-a .ma-form {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 0 24px;
  }

  .ma-a .ma-eyebrow,
  .ma-a .ma-title,
  .ma-a .ma-sub,
  .ma-a .ma-button,
  .ma-a .ma-link {
    grid-column: 1 / -1;
  }

  .ma-eyebrow {
    font-size: 10px;
    font-weight: 500;
    letter-spacing: 0.2em;
    text-transform: uppercase;
    color: var(--ma-red);
    margin-bottom: 14px;
    display: flex;
    align-items: center;
    gap: 12px;
  }
  .ma-eyebrow::after {
    content: "";
    flex: 1;
    height: 1px;
    background: var(--ma-rule);
  }

  .ma-title {
    font-family: "Google Sans Flex", sans-serif;
    font-weight: 600;
    font-size: clamp(34px, 4.5vw, 46px);
    line-height: 1.05;
    letter-spacing: -0.02em;
    color: var(--ma-ink);
    margin: 0 0 8px;
  }
  .ma-title em {
    font-style: normal;
    font-weight: 400;
    color: var(--ma-red);
  }

  .ma-sub {
    font-size: 13px;
    color: var(--ma-ink-soft);
    margin: 0 0 clamp(24px, 4vw, 36px);
    max-width: 360px;
    line-height: 1.5;
  }

  /* Full width subtitle for signup form */
  .ma-a .ma-sub {
    max-width: 100%;
  }

  .ma-field { position: relative; margin-bottom: 18px; }
  .ma-label {
    font-size: 10px;
    font-weight: 500;
    letter-spacing: 0.16em;
    text-transform: uppercase;
    color: var(--ma-ink-soft);
    display: block;
    margin-bottom: 6px;
  }
  .ma-input {
    width: 100%;
    height: 42px;
    padding: 0 0 6px 0;
    font-size: 16px;
    font-family: "Google Sans Flex", sans-serif;
    color: var(--ma-ink);
    background: transparent;
    border: none;
    border-bottom: 1px solid var(--ma-rule);
    outline: none;
    transition: border-color 0.3s ease;
  }
  .ma-input:focus { border-bottom-color: var(--ma-red); }
  .ma-input::placeholder { color: #c4bcb6; font-weight: 400; }

  .ma-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-top: 8px;
  }
  .ma-link {
    font-size: 12px;
    color: var(--ma-ink-soft);
    text-decoration: none;
    border-bottom: 1px solid transparent;
    padding-bottom: 1px;
    transition: 0.2s ease;
    cursor: pointer;
  }
  .ma-link:hover { color: var(--ma-red); border-bottom-color: var(--ma-red); }

  .ma-button {
    margin-top: clamp(24px, 4vw, 36px);
    height: 52px;
    padding: 0 32px;
    background-color: var(--ma-ink);
    color: #ffffff;
    font-family: "Google Sans Flex", sans-serif;
    font-size: 12px;
    font-weight: 500;
    letter-spacing: 0.22em;
    text-transform: uppercase;
    border: none;
    cursor: pointer;
    position: relative;
    overflow: hidden;
    transition: 0.4s cubic-bezier(0.4, 0, 0.2, 1);
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 14px;
    align-self: flex-start;
  }
  .ma-button::before {
    content: "";
    position: absolute;
    inset: 0;
    background: var(--ma-red);
    transform: translateX(-101%);
    transition: 0.5s cubic-bezier(0.7, 0, 0.3, 1);
  }
  .ma-button:hover::before { transform: translateX(0); }
  .ma-button:hover {
    transform: translateY(-1px);
    box-shadow: 0 8px 24px -8px rgba(238, 36, 53, 0.5);
  }
  .ma-btn-label, .ma-btn-arrow { position: relative; z-index: 1; }
  .ma-btn-arrow { transition: transform 0.4s ease; }
  .ma-button:hover .ma-btn-arrow { transform: translateX(4px); }

  /* approval notice */
  .ma-approval-notice {
    background-color: var(--ma-red-tint);
    border-left: 3px solid var(--ma-red);
    padding: 16px 20px;
    margin: 0 0 24px;
    font-size: 13px;
    line-height: 1.6;
    color: var(--ma-ink);
    border-radius: 4px;
  }
  .ma-approval-notice strong {
    color: var(--ma-red);
    font-weight: 600;
  }

  /* red switch panel */
  .ma-switch {
    position: absolute;
    top: 0;
    left: 0;
    width: 40%;
    height: 100%;
    padding: 60px clamp(24px, 4vw, 50px);
    background-color: var(--ma-red);
    color: #ffffff;
    z-index: 200;
    overflow: hidden;
    transition: 1.1s cubic-bezier(0.7, 0, 0.3, 1);
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    text-align: center;
  }
  .ma-switch::before {
    content: "";
    position: absolute;
    top: -120px; right: -120px;
    width: 320px; height: 320px;
    border: 1px solid rgba(255, 255, 255, 0.18);
    border-radius: 50%;
    transition: 1.1s cubic-bezier(0.7, 0, 0.3, 1);
  }
  .ma-switch::after {
    content: "";
    position: absolute;
    bottom: -160px; left: -160px;
    width: 420px; height: 420px;
    border: 1px solid rgba(255, 255, 255, 0.12);
    border-radius: 50%;
    transition: 1.1s cubic-bezier(0.7, 0, 0.3, 1);
  }

  .ma-glyph {
    position: absolute;
    top: 50%; left: 50%;
    transform: translate(-50%, -50%);
    font-family: "Fraunces", serif;
    font-style: italic;
    font-weight: 300;
    font-size: clamp(220px, 38vw, 420px);
    line-height: 1;
    color: rgba(255, 255, 255, 0.06);
    pointer-events: none;
    transition: 1.1s cubic-bezier(0.7, 0, 0.3, 1);
    user-select: none;
  }

  .ma-switch-panel {
    position: relative;
    z-index: 2;
    width: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    transition: 1.1s cubic-bezier(0.7, 0, 0.3, 1);
  }
  .ma-switch-panel.is-hidden {
    visibility: hidden;
    opacity: 0;
    position: absolute;
  }

  .ma-switch-index {
    font-size: 10px;
    font-weight: 500;
    letter-spacing: 0.24em;
    text-transform: uppercase;
    color: rgba(255, 255, 255, 0.65);
    margin-bottom: 28px;
    display: flex;
    align-items: center;
    gap: 12px;
  }
  .ma-switch-index::before,
  .ma-switch-index::after {
    content: "";
    width: 22px; height: 1px;
    background: rgba(255, 255, 255, 0.4);
  }

  .ma-switch-title {
    font-family: "Google Sans Flex", sans-serif;
    font-weight: 400;
    font-style: normal;
    font-size: clamp(40px, 6vw, 56px);
    line-height: 1;
    letter-spacing: -0.02em;
    margin: 0 0 24px;
  }
  .ma-switch-title strong {
    font-weight: 600;
    font-style: normal;
    display: block;
    letter-spacing: -0.03em;
  }

  .ma-switch-desc {
    font-size: 13.5px;
    line-height: 1.65;
    color: rgba(255, 255, 255, 0.85);
    max-width: 260px;
    margin: 0 0 40px;
  }

  .ma-switch-btn {
    background: transparent;
    color: #ffffff;
    border: 1px solid rgba(255, 255, 255, 0.5);
    padding: 0 36px;
    height: 52px;
    font-family: "Google Sans Flex", sans-serif;
    font-size: 12px;
    font-weight: 500;
    letter-spacing: 0.22em;
    text-transform: uppercase;
    cursor: pointer;
    position: relative;
    overflow: hidden;
    transition: 0.4s cubic-bezier(0.4, 0, 0.2, 1);
    display: inline-flex;
    align-items: center;
    gap: 14px;
  }
  .ma-switch-btn::before {
    content: "";
    position: absolute;
    inset: 0;
    background: #ffffff;
    transform: translateY(101%);
    transition: 0.45s cubic-bezier(0.7, 0, 0.3, 1);
  }
  .ma-switch-btn:hover::before { transform: translateY(0); }
  .ma-switch-btn:hover { color: var(--ma-red); border-color: #ffffff; }
  .ma-switch-btn span { position: relative; z-index: 1; }

  /* state */
  .is-txr { left: 60%; }
  .is-z200 { z-index: 200; }
  .ma-container.is-shift { left: 0; }

  .is-gx { animation: ma-gx 1.1s cubic-bezier(0.7, 0, 0.3, 1); }
  @keyframes ma-gx {
    0%, 10%, 100% { width: 40%; }
    30%, 50% { width: 50%; }
  }

  /* tablet */
  @media (max-width: 900px) and (min-width: 761px) {
    .ma-main { height: 560px; }
    .ma-container { padding: 48px 40px; }
    .ma-switch { padding: 48px 30px; }
    .ma-switch-desc { font-size: 12.5px; }
    .ma-mark--bl, .ma-mark--br { display: none; }

    /* Reduce gap on smaller tablets */
    .ma-a .ma-form {
      gap: 0 16px;
    }
  }

  /* mobile */
  @media (max-width: 760px) {
    /* Revert to single column on mobile */
    .ma-a .ma-form {
      display: flex;
      flex-direction: column;
      gap: 0;
    }

    .ma-root {
      padding: 0;
      align-items: stretch;
      overflow-y: auto;
      overflow-x: hidden;
    }
    .ma-mark { display: none; }

    .ma-main {
      width: 100%;
      max-width: 100%;
      height: auto;
      min-height: 100vh;
      border: none;
      box-shadow: none;
      display: flex;
      flex-direction: column;
    }

    .ma-switch {
      position: relative;
      width: 100%;
      height: 280px;
      left: 0 !important;
      padding: 36px 24px;
      flex-shrink: 0;
      order: 1;
    }
    .ma-switch::before {
      width: 220px; height: 220px;
      top: -70px; right: -70px;
    }
    .ma-switch::after {
      width: 280px; height: 280px;
      bottom: -140px; left: -140px;
    }
    .ma-glyph { font-size: 260px; }
    .ma-switch-index { margin-bottom: 16px; }
    .ma-switch-title { font-size: 42px; margin-bottom: 16px; }
    .ma-switch-desc {
      font-size: 13px;
      margin-bottom: 24px;
      max-width: 300px;
    }
    .ma-switch-btn { height: 48px; padding: 0 28px; }

    .ma-container {
      position: relative;
      width: 100%;
      height: auto;
      left: 0 !important;
      padding: 40px 24px 56px;
      order: 2;
      transition: opacity 0.3s ease;
    }
    .ma-b { display: none; }
    .ma-main.is-signin .ma-a { display: none; }
    .ma-main.is-signin .ma-b { display: flex; }

    .ma-title { font-size: 36px; }
    .ma-sub { margin-bottom: 24px; }
    .ma-button {
      width: 100%;
      max-width: none;
      align-self: stretch;
    }
    .is-gx { animation: none; }
  }

  @media (max-width: 380px) {
    .ma-switch { height: 250px; padding: 28px 20px; }
    .ma-switch-title { font-size: 36px; }
    .ma-container { padding: 32px 20px 48px; }
    .ma-title { font-size: 32px; }
  }
`;
