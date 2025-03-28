import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
  ],
  prefix: "",
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
          deep: "hsl(var(--primary-deep))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
          amber: "hsl(var(--secondary-amber))",
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
          emerald: "hsl(var(--accent-emerald))",
          gold: "hsl(var(--accent-gold))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        sidebar: {
          DEFAULT: "hsl(var(--sidebar-background))",
          foreground: "hsl(var(--sidebar-foreground))",
          primary: "hsl(var(--sidebar-primary))",
          'primary-foreground': "hsl(var(--sidebar-primary-foreground))",
          accent: "hsl(var(--sidebar-accent))",
          'accent-foreground': "hsl(var(--sidebar-accent-foreground))",
          border: "hsl(var(--sidebar-border))",
          ring: "hsl(var(--sidebar-ring))"
        },
        // Enhanced color palette for RecipeKeeper
        charcoal: "#171717",
        offwhite: "#F2F2F2",
        teal: "#00F5D4",
        deepteal: "#023E4A",
        coral: "#FF6B6B",
        amber: "#FFC75F",
        purple: "#9B5DE5",
        emerald: "#00BD9D",
        gold: "#F2C94C",
        // 10-step grayscale
        gray: {
          100: "#F2F2F2",
          200: "#D9D9D9",
          300: "#BFBFBF",
          400: "#A6A6A6",
          500: "#8C8C8C",
          600: "#737373",
          700: "#595959",
          800: "#404040",
          900: "#262626",
          950: "#171717",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
        xl: "1rem",
        "2xl": "1.5rem",
      },
      fontFamily: {
        clash: ["'Clash Display'", "sans-serif"],
        cabinet: ["'Cabinet Grotesk'", "sans-serif"],
        satoshi: ["'Satoshi'", "sans-serif"],
        mono: ["'JetBrains Mono'", "monospace"],
        playfair: ["'Playfair Display'", "serif"],
      },
      fontSize: {
        // Display text sizes
        "display-sm": ["36px", { lineHeight: "1.1" }],
        "display-md": ["48px", { lineHeight: "1.05" }],
        "display-lg": ["64px", { lineHeight: "1" }],
        // Subheading text sizes
        "heading-sm": ["20px", { lineHeight: "1.3" }],
        "heading-md": ["24px", { lineHeight: "1.25" }],
        // Body text sizes with adjusted line heights
        "body-sm": ["16px", { lineHeight: "1.5" }],
        "body-md": ["18px", { lineHeight: "1.5" }],
        "mono-sm": ["14px", { lineHeight: "1.5" }],
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        "pulse-teal": {
          "0%, 100%": { 
            boxShadow: "0 0 0 0 rgba(0, 245, 212, 0.7)",
            transform: "scale(1)"
          },
          "50%": { 
            boxShadow: "0 0 0 10px rgba(0, 245, 212, 0)",
            transform: "scale(1.05)"
          },
        },
        "float": {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-10px)" },
        },
        "spin-slow": {
          "0%": { transform: "rotate(0deg)" },
          "100%": { transform: "rotate(360deg)" },
        },
        "glitch": {
          "0%, 100%": { transform: "translate(0)" },
          "20%": { transform: "translate(-5px, 5px)" },
          "40%": { transform: "translate(5px, -5px)" },
          "60%": { transform: "translate(-5px, -5px)" },
          "80%": { transform: "translate(5px, 5px)" },
        },
        "diagonal-slide": {
          "0%": { transform: "translateX(-100%) translateY(-100%)" },
          "100%": { transform: "translateX(0) translateY(0)" },
        },
        "tilt-subtle": {
          "0%, 100%": { transform: "rotate(0deg)" },
          "25%": { transform: "rotate(1deg)" },
          "75%": { transform: "rotate(-1deg)" },
        },
        "fade-in-up": {
          "0%": { opacity: "0", transform: "translateY(10px)" },
          "100%": { opacity: "1", transform: "translateY(0)" }
        },
        "card-expand": {
          "0%": { transform: "scale(1)" },
          "100%": { transform: "scale(1.02)" }
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "pulse-teal": "pulse-teal 2s infinite",
        "float": "float 6s ease-in-out infinite",
        "spin-slow": "spin-slow 15s linear infinite",
        "glitch": "glitch 0.5s ease-in-out",
        "diagonal-slide": "diagonal-slide 0.7s ease-out forwards",
        "tilt-subtle": "tilt-subtle 6s ease-in-out infinite",
        "fade-in-up": "fade-in-up 0.5s ease-out forwards",
        "card-expand": "card-expand 0.3s ease-out forwards",
      },
      boxShadow: {
        'card': '0 8px 16px rgba(0, 0, 0, 0.1)',
        'card-hover': '0 12px 24px rgba(0, 0, 0, 0.15)',
        'elevation-1': '0 2px 4px rgba(0, 0, 0, 0.1)',
        'elevation-2': '0 4px 8px rgba(0, 0, 0, 0.12)',
        'elevation-3': '0 8px 16px rgba(0, 0, 0, 0.14)',
        'elevation-4': '0 12px 24px rgba(0, 0, 0, 0.16)',
        'inner-glow': 'inset 0 0 20px rgba(0, 245, 212, 0.1)',
      },
      backgroundImage: {
        'gradient-primary': 'linear-gradient(135deg, #023E4A, #00F5D4)',
        'gradient-sunset': 'linear-gradient(135deg, #FF6B6B, #FFC75F)',
        'gradient-cosmic': 'linear-gradient(135deg, #9B5DE5, #00F5D4)',
      },
      transitionDuration: {
        '400': '400ms',
        '600': '600ms',
        '800': '800ms',
      },
      transitionTimingFunction: {
        'spring': 'cubic-bezier(0.175, 0.885, 0.32, 1.275)',
        'bounce-in': 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;
