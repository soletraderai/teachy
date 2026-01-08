/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Neobrutalism color palette
        primary: '#FFDE59',      // Electric yellow
        secondary: '#00D4FF',    // Cyan accent
        background: '#FFFEF0',   // Off-white
        surface: '#FFFFFF',      // White cards
        text: '#1A1A1A',         // Near black
        border: '#000000',       // Pure black borders
        success: '#00FF85',      // Bright green
        error: '#FF4444',        // Bright red
      },
      fontFamily: {
        heading: ['Space Grotesk', 'sans-serif'],
        body: ['Inter', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      boxShadow: {
        'brutal': '4px 4px 0 0 #000000',
        'brutal-hover': '6px 6px 0 0 #000000',
        'brutal-sm': '2px 2px 0 0 #000000',
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
    },
  },
  plugins: [],
}
