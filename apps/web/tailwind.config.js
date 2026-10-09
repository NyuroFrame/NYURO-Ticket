/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
    './contexts/**/*.{js,ts,jsx,tsx}',
    './lib/**/*.{js,ts,jsx,tsx}',
    './features/**/*.{js,ts,jsx,tsx}',
    '../../packages/ui/src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        // Acento único empresarial — azul sobrio tipo Jira/Zendesk
        brand: {
          50: '#eff4fc',
          100: '#dce7f8',
          500: '#1d5bbf',
          600: '#174a9e',
          700: '#143e83',
        },
        primary: '#174a9e',
        danger: '#b42318',
        success: '#067647',
        warning: '#b54708',
        ink: {
          900: '#101828',
          700: '#344054',
          500: '#667085',
          400: '#98a2b3',
        },
        line: '#e4e7ec',
        canvas: '#f6f7f9',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'Segoe UI', 'sans-serif'],
        mono: ['"IBM Plex Mono"', 'ui-monospace', 'monospace'],
      },
      fontSize: {
        // Densidad enterprise: cuerpo 13px en tablas
        table: ['0.8125rem', { lineHeight: '1.25rem' }],
      },
      boxShadow: {
        card: '0 1px 2px rgba(16,24,40,0.06)',
        pop: '0 8px 24px rgba(16,24,40,0.12)',
      },
    },
  },
  plugins: [],
};
