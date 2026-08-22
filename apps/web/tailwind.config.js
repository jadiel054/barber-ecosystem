/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#fbf7ee',
          100: '#f5ebd3',
          500: '#d97706',
          600: '#b45309',
          700: '#92400e',
          900: '#78350f',
        },
      },
    },
  },
  plugins: [],
};
