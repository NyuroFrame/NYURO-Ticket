/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    '../../apps/web/**/*.{js,ts,jsx,tsx}',
    '../../packages/ui/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: '#2563eb',
        danger: '#dc2626',
        success: '#16a34a',
      },
    },
  },
  plugins: [],
};
