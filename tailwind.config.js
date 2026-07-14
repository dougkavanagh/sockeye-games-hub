/** @type {import('tailwindcss').Config} */
export default {
	content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
	theme: {
		extend: {
			colors: {
				depth: {
					950: "#06161c",
					900: "#0a242e",
					800: "#0f3542",
					700: "#154556",
				},
				salmon: {
					400: "#ff8a6b",
					500: "#e85d3a",
					600: "#c94a2c",
				},
				ice: {
					50: "#f2f8f9",
					100: "#dceef1",
					200: "#b8dce3",
				},
			},
			fontFamily: {
				display: ['"Instrument Serif"', "Georgia", "serif"],
				sans: ['"Sora"', "system-ui", "sans-serif"],
			},
		},
	},
	plugins: [],
};
