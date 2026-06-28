/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        // PLACEHOLDER — confirm the EXACT Nomba yellow hex from Nomba's own
        // dashboard / dev portal before final theming; do not guess (docs/10).
        'nomba-yellow': '#FFD60A',
        'nomba-black': '#111111',
        ink: '#1a1a1a',
        // Status colours stay semantic, not brand-matched (docs/10):
        // green = paid/active, red = failed/suspended, amber = past_due/grace.
        'status-active': '#16a34a',
        'status-failed': '#dc2626',
        'status-grace': '#f59e0b',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
