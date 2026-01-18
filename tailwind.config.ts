import type {Config} from 'tailwindcss';

const logoSvg = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 375 375">
  <path fill="hsl(var(--foreground))" opacity="0.05" d="M332.33 140.15C316.1 80.38 267 44.7 200.98 44.7H37.5l3.23 7.4c13.85 31.75 45.2 52.28 79.86 52.29h44.51l.37-.01c1.7-.12 7.94-.5 17.32-.5 8.98 0 18.17.35 27.24 1.05l.9.06c34.73 2.74 82.31 11.82 111.72 39.5l.37.36c.16.14.31.28.46.43l14 13.93zM336.8 209.03l-.03.58c-8.84 74.47-61.43 120.73-137.26 120.73H95.23V189.34h5.27c30.54 0 55.38 24.84 55.38 55.37v24.97h46.19c22.75 0 41.9-7.48 55.4-21.61 13.74-14.39 21-35.18 21-50.13v-.86c0-19.32-4.25-35.98-12.63-49.52l-7.82-12.64 14.05 4.88c17.42 6.04 31.55 14.1 41.99 23.94 15.27 14.38 22.92 32.98 22.74 55.29z"/>
</svg>
`;

const encodedLogoSvg = Buffer.from(logoSvg).toString('base64');
const logoDataUri = `url(data:image/svg+xml;base64,${encodedLogoSvg})`;


export default {
  darkMode: ['class'],
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      backgroundImage: {
        'chat-logo-pattern': logoDataUri,
      },
      fontFamily: {
        body: ['Inter', 'sans-serif'],
        headline: ['Inter', 'sans-serif'],
        code: ['monospace'],
      },
      colors: {
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        chart: {
          '1': 'hsl(var(--chart-1))',
          '2': 'hsl(var(--chart-2))',
          '3': 'hsl(var(--chart-3))',
          '4': 'hsl(var(--chart-4))',
          '5': 'hsl(var(--chart-5))',
        },
        sidebar: {
          DEFAULT: 'hsl(var(--sidebar-background))',
          foreground: 'hsl(var(--sidebar-foreground))',
          primary: 'hsl(var(--sidebar-primary))',
          'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
          accent: 'hsl(var(--sidebar-accent))',
          'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
          border: 'hsl(var(--sidebar-border))',
          ring: 'hsl(var(--sidebar-ring))',
        },
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
      keyframes: {
        'accordion-down': {
          from: {
            height: '0',
          },
          to: {
            height: 'var(--radix-accordion-content-height)',
          },
        },
        'accordion-up': {
          from: {
            height: 'var(--radix-accordion-content-height)',
          },
          to: {
            height: '0',
          },
        },
        'slide-in': {
          from: { transform: 'translateX(100%)', opacity: '0' },
          to: { transform: 'translateX(0)', opacity: '1' },
        },
        'slide-out': {
          from: { transform: 'translateX(0)', opacity: '1' },
          to: { transform: 'translateX(-100%)', opacity: '0' },
        },
        'slide-in-reverse': {
            from: { transform: 'translateX(-100%)', opacity: '0' },
            to: { transform: 'translateX(0)', opacity: '1' },
        },
        'slide-out-reverse': {
            from: { transform: 'translateX(0)', opacity: '1' },
            to: { transform: 'translateX(100%)', opacity: '0' },
        },
        'float-icons': {
            '0%, 100%': {
                opacity: '0',
                transform: 'translateY(0px) scale(0.8)',
            },
            '25%': {
                opacity: '1',
                transform: 'translateY(-10px) scale(1)',
            },
            '75%': {
                opacity: '1',
                transform: 'translateY(10px) scale(1)',
            },
        },
        'float-logo': {
          '0%, 100%': {
              transform: 'translateY(0px)',
          },
          '50%': {
              transform: 'translateY(-10px)',
          },
        },
        'pulse-slow': {
          '0%, 100%': {
            transform: 'scale(1)',
            opacity: '1',
          },
          '50%': {
            transform: 'scale(1.05)',
            opacity: '0.9',
          },
        },
         blob: {
            '0%': {
                transform: 'translate(0px, 0px) scale(1)',
            },
            '33%': {
                transform: 'translate(30px, -50px) scale(1.1)',
            },
            '66%': {
                transform: 'translate(-20px, 20px) scale(0.9)',
            },
            '100%': {
                transform: 'translate(0px, 0px) scale(1)',
            },
        },
        shimmer: {
          '100%': {
            transform: 'translateX(100%)',
          },
        },
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
        'slide-in': 'slide-in 0.3s ease-out forwards',
        'slide-out': 'slide-out 0.3s ease-out forwards',
        'slide-in-reverse': 'slide-in-reverse 0.3s ease-out forwards',
        'slide-out-reverse': 'slide-out-reverse 0.3s ease-out forwards',
        'float-icons': 'float-icons 4s ease-in-out infinite',
        'float-logo': 'float-logo 2s ease-in-out infinite',
        'pulse-slow': 'pulse-slow 2.5s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'blob': 'blob 7s infinite',
        'shimmer': 'shimmer 2s infinite',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
} satisfies Config;
