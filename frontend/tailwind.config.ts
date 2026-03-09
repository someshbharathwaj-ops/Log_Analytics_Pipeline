import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./hooks/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: "#090b14",
        panel: "#10182b",
        panelSoft: "#141f36",
        accent: "#29d3ae",
        accent2: "#5ba8ff",
        text: "#f2f5ff",
        muted: "#9ca8c3",
        danger: "#ff6f91",
      },
      boxShadow: {
        glow: "0 20px 45px -20px rgba(41, 211, 174, 0.35)",
      },
      backgroundImage: {
        atmosphere:
          "radial-gradient(circle at 10% 20%, rgba(91,168,255,0.18), transparent 40%), radial-gradient(circle at 90% 0%, rgba(41,211,174,0.15), transparent 35%), linear-gradient(180deg, #090b14 0%, #0b1120 100%)",
      },
    },
  },
  plugins: [],
};

export default config;