/** @type {import('tailwindcss').Config} */
export default {
	content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
	theme: {
		extend: {
			colors: {
				depth: {
					950: "#072a32",
					900: "#0a3a44",
					800: "#0f4d59",
					700: "#146474",
				},
				sea: {
					500: "#1f8f9c",
					400: "#2eb8c6",
					300: "#5fd4de",
				},
				kelp: {
					600: "#1f6b4f",
					500: "#2f9a6e",
					400: "#4fc48e",
				},
				salmon: {
					300: "#ff9a78",
					400: "#ff7a52",
					500: "#f15a3a",
					600: "#d94428",
				},
				sun: {
					300: "#ffe08a",
					400: "#ffd27a",
				},
				ice: {
					50: "#f4fffc",
					100: "#dff7f1",
					200: "#b5ebe0",
				},
			},
			fontFamily: {
				display: ['"Fraunces"', "Georgia", "serif"],
				sans: ['"Nunito"', "system-ui", "sans-serif"],
			},
			keyframes: {
				"hero-drift": {
					"0%, 100%": { transform: "scale(1.04) translate(0, 0)" },
					"50%": { transform: "scale(1.07) translate(-1%, 0.8%)" },
				},
				"fog-pulse": {
					"0%, 100%": { opacity: "0.12" },
					"50%": { opacity: "0.2" },
				},
				"cta-glow": {
					"0%, 100%": { boxShadow: "0 8px 24px rgba(241, 90, 58, 0.3)" },
					"50%": { boxShadow: "0 10px 32px rgba(241, 90, 58, 0.5)" },
				},
			},
			animation: {
				"hero-drift": "hero-drift 22s ease-in-out infinite",
				"fog-pulse": "fog-pulse 10s ease-in-out infinite",
				"cta-glow": "cta-glow 3.5s ease-in-out infinite",
			},
		},
	},
	plugins: [],
};
