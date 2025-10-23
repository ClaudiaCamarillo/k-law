/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
      },
      screens: {
        'xs': '320px',
        'sm': '640px',
        'md': '768px',
        'lg': '1024px',
        'xl': '1280px',
        '2xl': '1536px',
      },
      spacing: {
        'safe-area-inset-top': 'env(safe-area-inset-top)',
        'safe-area-inset-bottom': 'env(safe-area-inset-bottom)',
        'safe-area-inset-left': 'env(safe-area-inset-left)',
        'safe-area-inset-right': 'env(safe-area-inset-right)',
      }
    },
  },
  plugins: [],
}
