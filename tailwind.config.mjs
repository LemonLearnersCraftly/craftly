// tailwind.config.js
/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}",
    "./app/**/*.{js,jsx,ts,tsx}",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        // Custom craft-themed colors
        craft: {
          100: "#F9F5EB",
          200: "#E4DFD1",
          300: "#DACEB8",
          400: "#C6B99E",
          500: "#B0A385",
          600: "#8D7D63",
          700: "#6A5A44",
          800: "#473D2F",
          900: "#241F18",
        },
        sage: {
          50: "#f6f7f5",
          100: "#e2e7df",
          200: "#c5d0be",
          300: "#a2b293",
          400: "#809b6c",
          500: "#67824f",
          600: "#506439",
          700: "#3f4f2e",
          800: "#2f3a24",
          900: "#212819",
        },
        mint: {
          50: "#f0faf5",
          100: "#d8f3e6",
          200: "#b4e5d0",
          300: "#82cfb2",
          400: "#4fb28e",
          500: "#319873",
          600: "#277a5b",
          700: "#246149",
          800: "#1e4d3c",
          900: "#1a4031",
        },
        yarn: {
          50: "#fdf3f4",
          100: "#fce7ea",
          200: "#f8d3d9",
          300: "#f3afbc",
          400: "#ed859b",
          500: "#e1556d",
          600: "#ce3253",
          700: "#ac2642",
          800: "#92213b",
          900: "#7e2137",
        },
        lavender: {
          50: "#f7f7fe",
          100: "#efeffc",
          200: "#dfdefa",
          300: "#c5c2f5",
          400: "#a59fee",
          500: "#8875e5",
          600: "#7356d8",
          700: "#5e40c0",
          800: "#4c359d",
          900: "#412f7e",
        },
        "custom-mint": "#67c6b3",
        "custom-sage": "#7d9b76",
        "custom-lavender": "#f3f1fc",
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: 0 },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: 0 },
        },
        "shimmer-slide": {
          from: { transform: "translateX(-100%)" },
          to: { transform: "translateX(100%)" },
        },
        "spin-around": {
          from: { transform: "rotate(0deg)" },
          to: { transform: "rotate(360deg)" },
        },
        orbit: {
          "0%": {
            transform: "rotate(0deg) translateX(var(--radius)) rotate(0deg)",
          },
          "100%": {
            transform:
              "rotate(360deg) translateX(var(--radius)) rotate(-360deg)",
          },
        },
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-10px)" },
        },
        "bounce-subtle": {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-5px)" },
        },
        "pulse-gentle": {
          "0%, 100%": { opacity: 1 },
          "50%": { opacity: 0.8 },
        },
        wave: {
          "0%": { transform: "rotate(0deg)" },
          "10%": { transform: "rotate(14deg)" },
          "20%": { transform: "rotate(-8deg)" },
          "30%": { transform: "rotate(14deg)" },
          "40%": { transform: "rotate(-4deg)" },
          "50%": { transform: "rotate(10deg)" },
          "60%": { transform: "rotate(0deg)" },
          "100%": { transform: "rotate(0deg)" },
        },
        stitching: {
          "0%": { backgroundPosition: "0 0" },
          "100%": { backgroundPosition: "15px 15px" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "shimmer-slide": "shimmer-slide 2s infinite",
        "spin-around": "spin-around 8s linear infinite",
        orbit: "orbit var(--duration) linear infinite",
        float: "float 6s ease-in-out infinite",
        "bounce-subtle": "bounce-subtle 3s ease-in-out infinite",
        "pulse-gentle": "pulse-gentle 4s ease-in-out infinite",
        wave: "wave 2.5s ease-in-out infinite",
        stitching: "stitching 10s linear infinite",
      },
      backgroundImage: {
        "stitched-pattern":
          "linear-gradient(135deg, var(--tw-gradient-from) 25%, transparent 25%, transparent 50%, var(--tw-gradient-from) 50%, var(--tw-gradient-from) 75%, transparent 75%, transparent)",
        "craft-texture": "url('/textures/craft-paper.jpg')",
        "fabric-texture": "url('/textures/fabric-texture.jpg')",
        "wool-texture": "url('/textures/wool-texture.jpg')",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};
