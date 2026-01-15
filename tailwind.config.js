/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Neobrutalism color palette (legacy)
        primary: '#FFDE59',      // Electric yellow
        secondary: '#00D4FF',    // Cyan accent
        background: '#FFFEF0',   // Off-white
        surface: '#FFFFFF',      // White cards
        text: '#1A1A1A',         // Near black
        border: '#000000',       // Pure black borders
        success: '#00FF85',      // Bright green
        error: '#FF4444',        // Bright red

        // Electric Garden palette (Pop-Brutalism)
        'eg-paper': '#FDFBF7',           // Canvas - warm off-white
        'eg-ink': '#111827',             // Structure - borders, text
        'eg-violet': '#8B5CF6',          // Primary - main actions, AI
        'eg-violet-dark': '#6D28D9',     // Primary shadow
        'eg-pink': '#EC4899',            // Secondary - creative, new
        'eg-pink-dark': '#BE185D',       // Secondary shadow
        'eg-lime': '#A3E635',            // Growth - success, progress
        'eg-lime-dark': '#65A30D',       // Growth shadow
        'eg-orange': '#F97316',          // Alert - warnings, urgent
        'eg-orange-dark': '#C2410C',     // Alert shadow
        'eg-cyan': '#06B6D4',            // Info - information, links
        'eg-cyan-dark': '#0E7490',       // Info shadow
        'eg-lemon': '#FCD34D',           // Accent - highlights, avatars
        'eg-lemon-dark': '#D97706',      // Accent shadow
      },
      fontFamily: {
        heading: ['Space Grotesk', 'sans-serif'],
        body: ['Inter', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      boxShadow: {
        // Legacy brutal shadows
        'brutal': '4px 4px 0 0 #000000',
        'brutal-hover': '6px 6px 0 0 #000000',
        'brutal-sm': '2px 2px 0 0 #000000',

        // Pop-Brutalism base shadows (uses CSS variable for color)
        'pop': '4px 4px 0 0 var(--shadow-color, #111827)',
        'pop-hover': '6px 6px 0 0 var(--shadow-color, #111827)',
        'pop-pressed': '1px 1px 0 0 var(--shadow-color, #111827)',
        'pop-sm': '2px 2px 0 0 var(--shadow-color, #111827)',

        // Pop-Brutalism colored shadows (violet/primary)
        'pop-violet': '4px 4px 0 0 #6D28D9',
        'pop-violet-hover': '6px 6px 0 0 #6D28D9',
        'pop-violet-pressed': '1px 1px 0 0 #6D28D9',

        // Pop-Brutalism colored shadows (pink/secondary)
        'pop-pink': '4px 4px 0 0 #BE185D',
        'pop-pink-hover': '6px 6px 0 0 #BE185D',
        'pop-pink-pressed': '1px 1px 0 0 #BE185D',

        // Pop-Brutalism colored shadows (lime/growth)
        'pop-lime': '4px 4px 0 0 #65A30D',
        'pop-lime-hover': '6px 6px 0 0 #65A30D',
        'pop-lime-pressed': '1px 1px 0 0 #65A30D',

        // Pop-Brutalism colored shadows (orange/alert)
        'pop-orange': '4px 4px 0 0 #C2410C',
        'pop-orange-hover': '6px 6px 0 0 #C2410C',
        'pop-orange-pressed': '1px 1px 0 0 #C2410C',

        // Pop-Brutalism colored shadows (cyan/info)
        'pop-cyan': '4px 4px 0 0 #0E7490',
        'pop-cyan-hover': '6px 6px 0 0 #0E7490',
        'pop-cyan-pressed': '1px 1px 0 0 #0E7490',

        // Pop-Brutalism colored shadows (lemon/accent)
        'pop-lemon': '4px 4px 0 0 #D97706',
        'pop-lemon-hover': '6px 6px 0 0 #D97706',
        'pop-lemon-pressed': '1px 1px 0 0 #D97706',

        // Pop-Brutalism ink shadow (default dark)
        'pop-ink': '4px 4px 0 0 #111827',
        'pop-ink-hover': '6px 6px 0 0 #111827',
        'pop-ink-pressed': '1px 1px 0 0 #111827',
      },
      borderWidth: {
        '3': '3px',
      },
      spacing: {
        'xs': '4px',
        'sm': '8px',
        'md': '16px',
        'lg': '24px',
        'xl': '32px',
      },
      keyframes: {
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'scale-in': {
          '0%': { transform: 'scale(0.5)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        'slide-up': {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        'check-draw': {
          '0%': { strokeDasharray: '0 100' },
          '100%': { strokeDasharray: '100 0' },
        },
        'pulse-subtle': {
          '0%, 100%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(1.05)' },
        },
        'ping-slow': {
          '0%': { transform: 'scale(1)', opacity: '0.3' },
          '100%': { transform: 'scale(1.5)', opacity: '0' },
        },
        // Pop-Brutalism animations
        'wiggle': {
          '0%, 100%': { transform: 'rotate(-2deg)' },
          '50%': { transform: 'rotate(2deg)' },
        },
        'scanline': {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(100%)' },
        },
        'press': {
          '0%': { transform: 'translate(0, 0)' },
          '50%': { transform: 'translate(2px, 2px)' },
          '100%': { transform: 'translate(0, 0)' },
        },
        'level-up': {
          '0%': { transform: 'translateY(20px) scale(0.9)', opacity: '0' },
          '50%': { transform: 'translateY(-5px) scale(1.02)', opacity: '1' },
          '100%': { transform: 'translateY(0) scale(1)', opacity: '1' },
        },
        'stagger-in': {
          '0%': { transform: 'translateY(12px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
      animation: {
        'fade-in': 'fade-in 0.3s ease-out',
        'scale-in': 'scale-in 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)',
        'slide-up': 'slide-up 0.4s ease-out forwards',
        'check-draw': 'check-draw 0.5s ease-out 0.2s forwards',
        'pulse-subtle': 'pulse-subtle 2s ease-in-out infinite',
        'ping-slow': 'ping-slow 1.5s ease-out infinite',
        // Pop-Brutalism animations
        'wiggle': 'wiggle 0.3s ease-in-out',
        'wiggle-infinite': 'wiggle 0.5s ease-in-out infinite',
        'scanline': 'scanline 2s linear infinite',
        'press': 'press 0.15s ease-out',
        'level-up': 'level-up 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)',
        'stagger-in': 'stagger-in 0.4s ease-out forwards',
      },
    },
  },
  plugins: [],
}
