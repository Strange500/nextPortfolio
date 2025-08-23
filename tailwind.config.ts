import type { Config } from 'tailwindcss'

export default {
  darkMode: ['class'],
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}'
  ],
  theme: {
    container: {
      center: true,
      padding: {
        DEFAULT: '1rem',
        md: '2rem',
        lg: 'rem'
      }
    },
    extend: {
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)'
      },
      colors: {
        background: 'rgba(var(--background))',
        foreground: 'rgba(var(--foreground))',
        card: {
          DEFAULT: 'rgba(var(--card))',
          foreground: 'rgba(var(--card-foreground))'
        },
        popover: {
          DEFAULT: 'rgba(var(--popover))',
          foreground: 'rgba(var(--popover-foreground))'
        },
        primary: {
          DEFAULT: 'rgba(var(--primary))',
          foreground: 'rgba(var(--primary-foreground))'
        },
        secondary: {
          DEFAULT: 'rgba(var(--secondary))',
          foreground: 'rgba(var(--secondary-foreground))'
        },
        muted: {
          DEFAULT: 'rgba(var(--muted))',
          foreground: 'rgba(var(--muted-foreground))'
        },
        accent: {
          DEFAULT: 'rgba(var(--accent))',
          foreground: 'rgba(var(--accent-foreground))'
        },
        destructive: {
          DEFAULT: 'rgba(var(--destructive))',
          foreground: 'rgba(var(--destructive-foreground))'
        },
        border: 'rgba(var(--border))',
        input: 'rgba(var(--input))',
        ring: 'rgba(var(--ring))',
        chart: {
          '1': 'rgba(var(--chart-1))',
          '2': 'rgba(var(--chart-2))',
          '3': 'rgba(var(--chart-3))',
          '4': 'rgba(var(--chart-4))',
          '5': 'rgba(var(--chart-5))'
        }
      }
    }
  },
  plugins: [require('tailwindcss-animate')]
} satisfies Config
