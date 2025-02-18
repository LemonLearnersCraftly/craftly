// tailwind.config.mjs
const brandColors = {
  primary: {
    50: "#faf6f2",
    100: "#f4e9dd",
    200: "#e8d2bb",
    300: "#d2b495",
    400: "#b8916f",
    500: "#9d7051",
  },
  secondary: {
    50: "#f3f5f4",
    100: "#e4e8e6",
    200: "#cad2cf",
    300: "#a5b2ad",
    400: "#768982",
    500: "#4d625b",
  },
  accent: {
    50: "#fff3f3",
    100: "#ffe6e6",
    200: "#ffc7c6",
    300: "#ff9c99",
    400: "#f76f6c",
    500: "#e53d3d",
  },
  surface: {
    50: "#ffffff",
    100: "#f8f8f8",
    200: "#ececec",
    300: "#e0e0e0",
  },
};

export default {
  darkMode: ["class"],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
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
        // Core Shadcn colors
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        // Updated brand colors
        primary: {
          DEFAULT: brandColors.primary[500],
          ...brandColors.primary,
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: brandColors.secondary[500],
          ...brandColors.secondary,
          foreground: "hsl(var(--secondary-foreground))",
        },
        accent: {
          DEFAULT: brandColors.accent[400],
          ...brandColors.accent,
          foreground: "hsl(var(--accent-foreground))",
        },
        surface: {
          DEFAULT: brandColors.surface[50],
          ...brandColors.surface,
        },
        // Maintain essential utilities
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        // Chart colors (updated to match palette)
        chart: {
          1: "hsl(23 37% 85%)", // Primary light
          2: "hsl(158 10% 80%)", // Secondary light
          3: "hsl(3 90% 90%)", // Accent light
          4: "hsl(23 37% 70%)", // Primary medium
          5: "hsl(158 10% 60%)", // Secondary medium
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      animation: {
        orbit: "orbit calc(var(--duration)*1s) linear infinite",
        "shimmer-slide":
          "shimmer-slide var(--speed) ease-in-out infinite alternate",
        "spin-around": "spin-around calc(var(--speed) * 2) infinite linear",
      },
      keyframes: {
        orbit: {
          "0%": {
            transform:
              "rotate(calc(var(--angle) * 1deg)) translateY(calc(var(--radius) * 1px)) rotate(calc(var(--angle) * -1deg))",
          },
          "100%": {
            transform:
              "rotate(calc(var(--angle) * 1deg + 360deg)) translateY(calc(var(--radius) * 1px)) rotate(calc((var(--angle) * -1deg) - 360deg))",
          },
        },
        "shimmer-slide": {
          to: {
            transform: "translate(calc(100cqw - 100%), 0)",
          },
        },
        "spin-around": {
          "0%": {
            transform: "translateZ(0) rotate(0)",
          },
          "15%, 35%": {
            transform: "translateZ(0) rotate(90deg)",
          },
          "65%, 85%": {
            transform: "translateZ(0) rotate(270deg)",
          },
          "100%": {
            transform: "translateZ(0) rotate(360deg)",
          },
        },
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};
