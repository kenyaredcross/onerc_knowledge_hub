/** @type {import('tailwindcss').Config} */
export default {
	content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
	theme: {
		extend: {
			borderRadius: {
				sm: "calc(var(--radius) - 4px)",
				md: "calc(var(--radius) - 2px)",
				lg: "var(--radius)",
				xl: "calc(var(--radius) + 4px)",
			},
			colors: {
				background: "oklch(1 0 0)",
				foreground: "oklch(0.15 0.05 260)",
				card: {
					DEFAULT: "oklch(1 0 0)",
					foreground: "oklch(0.15 0.05 260)",
				},
				popover: {
					DEFAULT: "oklch(1 0 0)",
					foreground: "oklch(0.15 0.05 260)",
				},
				primary: {
					DEFAULT: "oklch(0.221 0.067 257)",
					foreground: "oklch(1 0 0)",
				},
				secondary: {
					DEFAULT: "oklch(0.96 0.01 250)",
					foreground: "oklch(0.221 0.067 257)",
				},
				muted: {
					DEFAULT: "oklch(0.965 0.005 250)",
					foreground: "oklch(0.45 0.03 257)",
				},
				accent: {
					DEFAULT: "oklch(0.605 0.232 27)",
					foreground: "oklch(1 0 0)",
				},
				destructive: {
					DEFAULT: "oklch(0.605 0.232 27)",
					foreground: "oklch(1 0 0)",
				},
				border: "oklch(0.9 0.012 250)",
				input: "oklch(0.92 0.012 250)",
				ring: "oklch(0.605 0.232 27)",
				/* ── Dashboard tokens ── */
				"dash-navy": "#011E41",
				"dash-red": "#ee2435",
				"dash-bg": "#f0f2f5",
				"dash-border": "#e5e7eb",
				"dash-card": "#ffffff",
				/* ── Pillar tokens ── */
				/* Leadership & Governance is purple per the agreed four-pillar colour coding.
				   Keep this in sync with --pillar-leadership in src/index.css. */
				"pillar-leadership": {
					DEFAULT: "oklch(0.45 0.18 300)",
					foreground: "oklch(0.98 0 0)",
				},
				"pillar-branch": {
					DEFAULT: "oklch(0.605 0.232 27)",
					foreground: "oklch(0.98 0 0)",
				},
				"pillar-resource": {
					DEFAULT: "oklch(0.221 0.067 257)",
					foreground: "oklch(0.98 0 0)",
				},
				"pillar-finance": {
					DEFAULT: "oklch(0.5 0.14 155)",
					foreground: "oklch(0.98 0 0)",
				},
			},
			fontFamily: {
				display: ["Google Sans Flex", "system-ui", "sans-serif"],
				sans: ["Google Sans Flex", "system-ui", "sans-serif"],
			},
		},
	},
	plugins: [],
};
