export default {
  content: [
    './index.html',
    './src/**/*.{js,jsx}'
  ],
  theme: {
    extend: {
      colors: {
        // Dark glassmorphism palette
        'dark-bg': '#0f172a',
        'glass': 'rgba(255, 255, 255, 0.1)',
        'glass-hover': 'rgba(255, 255, 255, 0.15)',
      },
      backdropBlur: {
        'glass': '12px',
        'glass-lg': '16px'
      },
      backgroundImage: {
        'gradient-dark': 'linear-gradient(135deg, #0f172a 0%, #1e3a5f 50%, #0f172a 100%)',
        'gradient-dark-sky': 'linear-gradient(180deg, #1e3a5f 0%, #0f172a 100%)',
      }
    }
  },
  plugins: []
}
