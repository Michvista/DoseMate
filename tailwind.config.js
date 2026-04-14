/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./App.{js,jsx,ts,tsx}",
    "./app/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}",
    "./screens/**/*.{js,jsx,ts,tsx}",
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        splashScreen: {
          100: "#957DC2",
          dark: "#121019",
        },
        tabs: {
          100: "#9333EA",
        },
        light1: "#F7F3FD",
        light2: "#fcf5eb",
        dose: {
          taken: "#E9F9F0",
          takenText: "#10B981",
          due: "#FFF2ED",
          dueText: "#F97316",
          upcoming: "#F5F3FF",
          upcomingText: "#8B5CF6",
          idle: "#FFF1F2",
          idleText: "#F43F5E",
        },
        dark: "#111827", // For the "Mark as Taken" button
        stats: "#9333EA",
        add: {
          bg: "#F4F0FA", // soft lavender page background
          accent: "#957DC2", // purple labels + dashed border
          peach: "#FDE8DA", // form factor card background
          "peach-text": "#C4622D", // text on peach card
          schedule: "#EDE9FE", // daily schedule section background
        },
        missed: "#EF4444",
        missedlight: "#EF44441A",
        lighter: "#9333EA1A",
        green: "#22C55E",
        greenLight: "#22C55E1A"
      },
    },
  },
  plugins: [],
};
