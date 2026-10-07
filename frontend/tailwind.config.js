/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    screens: { sm: '375px', md: '768px', lg: '1024px' },
    extend: {
      colors: {
        base: '#F6F8FC',
        panel: '#FFFFFF',
        inset: '#EEF2FA',
        fg: { 1: '#0B1B3B', 2: '#41506E', 3: '#6B7A95', 4: '#9AA6BD' },
        line: { DEFAULT: '#E3E9F4', strong: '#CDD7E8' },
        primary: { DEFAULT: '#2563EB', hover: '#1D4FD0', press: '#1A45B8', tint: '#E8EFFE' },
        success: { DEFAULT: '#0E9E73', tint: '#E1F6EE' },
        warning: { DEFAULT: '#B7791F', tint: '#FBF0D9' },
        danger: { DEFAULT: '#DC4444', tint: '#FBE5E5' },
        visa: '#1A1F71',
        mc: { red: '#EB001B', yellow: '#F79E1B' },
      },
      fontFamily: {
        display: ['Sora', 'system-ui', 'sans-serif'],
        sans: ['"IBM Plex Sans"', 'system-ui', 'sans-serif'],
        mono: ['"IBM Plex Mono"', 'ui-monospace', 'monospace'],
      },
      fontSize: {
        overline: ['12px', { lineHeight: '1', letterSpacing: '0.08em' }],
        caption: ['13px', '1.45'],
        total: ['30px', { lineHeight: '1.1', letterSpacing: '-0.03em' }],
        price: ['36px', { lineHeight: '1.05', letterSpacing: '-0.03em' }],
      },
      borderRadius: { sm: '6px', DEFAULT: '8px', lg: '12px' },
      spacing: { 11: '44px', 12: '48px', 13: '52px', 14: '56px' },
      maxWidth: { sheet: '560px', page: '1080px', result: '480px' },
      boxShadow: {
        1: '0 1px 2px rgba(11,27,59,.06), 0 0 0 1px #E3E9F4',
        3: '0 8px 16px rgba(11,27,59,.06), 0 32px 64px -30px rgba(11,27,59,.34), 0 0 0 1px #CDD7E8',
        'glow-primary': '0 0 0 1px rgba(37,99,235,.4), 0 12px 28px -12px rgba(37,99,235,.4)',
        focus: '0 0 0 3px rgba(37,99,235,.28)',
        'focus-danger': '0 0 0 3px rgba(220,68,68,.28)',
      },
      transitionTimingFunction: { out: 'cubic-bezier(.2,.7,.3,1)' },
      transitionDuration: { fast: '120ms', DEFAULT: '200ms', slow: '360ms' },
      keyframes: {
        slide: {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(250%)' },
        },
      },
      animation: {
        slide: 'slide 1.1s linear infinite',
      },
    },
  },
  plugins: [],
};
