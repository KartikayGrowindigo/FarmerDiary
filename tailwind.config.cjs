module.exports = {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        'on-tertiary': '#ffffff',
        'on-primary': '#ffffff',
        'on-primary-fixed-variant': '#00504d',
        primary: '#005652',
        'inverse-on-surface': '#f3f0f0',
        'primary-container': '#1f6f6b',
        background: '#fcf9f8',
        'on-surface': '#1b1c1c',
        'on-surface-variant': '#3f4948',
        'on-secondary-container': '#663500',
        'on-tertiary-fixed-variant': '#474744',
        'on-tertiary-container': '#e3e1dd',
        'on-primary-fixed': '#00201e',
        'on-background': '#1b1c1c',
        'on-tertiary-fixed': '#1b1c1a',
        'surface-container-high': '#eae7e7',
        'surface-container-low': '#f6f3f2',
        'tertiary-fixed-dim': '#c8c6c3',
        'secondary-fixed-dim': '#ffb77d',
        'on-primary-container': '#a5efe9',
        'surface-dim': '#dcd9d9',
        'on-error-container': '#93000a',
        secondary: '#904d00',
        'inverse-primary': '#8ad3ce',
        'secondary-container': '#fe932c',
        'primary-fixed': '#a6f0ea',
        'on-secondary': '#ffffff',
        'primary-fixed-dim': '#8ad3ce',
        tertiary: '#4c4c4a',
        'on-secondary-fixed': '#2f1500',
        outline: '#6f7978',
        'error-container': '#ffdad6',
        'outline-variant': '#bec9c7',
        'secondary-fixed': '#ffdcc3',
        'on-secondary-fixed-variant': '#6e3900',
        'surface-tint': '#166965',
        'surface-container-highest': '#e4e2e1',
        'tertiary-fixed': '#e4e2de',
        'surface-container-lowest': '#ffffff',
        surface: '#fcf9f8',
        'surface-container': '#f0eded',
        'surface-bright': '#fcf9f8',
        'on-error': '#ffffff',
        'tertiary-container': '#646461',
        'inverse-surface': '#303030',
        error: '#ba1a1a',
        'surface-variant': '#e4e2e1',
        'brand-green': '#008A2E',
        'brand-terracotta': '#C34129',
        'brand-amber': '#D97706'
      },
      borderRadius: {
        DEFAULT: '0.25rem',
        lg: '0.5rem',
        xl: '0.75rem',
        '2xl': '16px',
        full: '9999px'
      },
      spacing: {
        'margin-edge': '20px',
        'stack-md': '16px',
        'stack-lg': '24px',
        gutter: '16px',
        'stack-sm': '8px',
        'touch-target-min': '56px'
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'sans-serif'],
        'punjabi-subtext': ['Plus Jakarta Sans'],
        'body-md': ['Plus Jakarta Sans'],
        'headline-lg': ['Plus Jakarta Sans'],
        'label-caps': ['Plus Jakarta Sans'],
        'headline-md': ['Plus Jakarta Sans'],
        'headline-sm': ['Plus Jakarta Sans'],
        'body-lg': ['Plus Jakarta Sans']
      },
      fontSize: {
        'punjabi-subtext': ['14px', { lineHeight: '20px', fontWeight: '400' }],
        'body-md': ['16px', { lineHeight: '24px', fontWeight: '500' }],
        'headline-lg': ['30px', { lineHeight: '38px', letterSpacing: '-0.02em', fontWeight: '700' }],
        'label-caps': ['12px', { lineHeight: '16px', letterSpacing: '0.05em', fontWeight: '700' }],
        'headline-md': ['24px', { lineHeight: '32px', fontWeight: '700' }],
        'headline-sm': ['20px', { lineHeight: '28px', fontWeight: '700' }],
        'body-lg': ['18px', { lineHeight: '26px', fontWeight: '500' }]
      },
      boxShadow: {
        'soft-elevation': '0 4px 12px rgba(0, 0, 0, 0.06)'
      }
    }
  },
  plugins: []
}
