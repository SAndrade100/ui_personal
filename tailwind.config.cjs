/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx}',
    './src/components/**/*.{js,ts,jsx,tsx}',
    './src/features/**/*.{js,ts,jsx,tsx}'
  ],
  theme: {
    extend: {
      colors: {
        linen: 'var(--color-linen)',
        khaki: 'var(--color-khaki)',
        camel: 'var(--color-camel)',
        cocoa: 'var(--color-cocoa)',
        espresso: 'var(--color-espresso)'
      },
      fontFamily: {
        heading: ['Playfair Display', 'serif'],
        body: ['Inter', 'sans-serif']
      }
    }
  },
  plugins: []
};
