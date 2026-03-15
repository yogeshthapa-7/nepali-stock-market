/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        './pages/**/*.{js,ts,jsx,tsx,mdx}',
        './components/**/*.{js,ts,jsx,tsx,mdx}',
        './app/**/*.{js,ts,jsx,tsx,mdx}',
    ],
    darkMode: 'class',
    theme: {
        extend: {
            colors: {
                // Primary colors
                primary: {
                    50: '#f0f9ff',
                    100: '#e0f2fe',
                    200: '#bae6fd',
                    300: '#7dd3fc',
                    400: '#38bdf8',
                    500: '#0ea5e9',
                    600: '#0284c7',
                    700: '#0369a1',
                    800: '#075985',
                    900: '#0c4a6e',
                },
                // Success/Danger/Warning
                success: {
                    500: '#22c55e',
                    600: '#16a34a',
                },
                danger: {
                    500: '#ef4444',
                    600: '#dc2626',
                },
                warning: {
                    500: '#f59e0b',
                    600: '#d97706',
                },
                // Trading colors
                gain: '#00C48C',
                loss: '#FF4757',
                neutral: '#6B7280',
                // Navy theme (Share Sansaar style)
                navy: {
                    50: '#E8EDF5',
                    100: '#C5D1E5',
                    200: '#9FB2D2',
                    300: '#7993BF',
                    400: '#5374AC',
                    500: '#2D5599',
                    600: '#234376',
                    700: '#1A3253',
                    800: '#0A0F1E',
                    900: '#050814',
                    950: '#020408',
                },
                // Electric accent colors
                electric: {
                    green: '#00C48C',
                    blue: '#3B82F6',
                    purple: '#8B5CF6',
                    pink: '#EC4899',
                },
            },
            fontFamily: {
                sans: ['Inter', 'system-ui', 'sans-serif'],
            },
            animation: {
                'marquee': 'marquee 30s linear infinite',
                'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
                'fade-in': 'fadeIn 0.5s ease-in',
                'slide-up': 'slideUp 0.3s ease-out',
                'slide-down': 'slideDown 0.3s ease-out',
            },
            keyframes: {
                marquee: {
                    '0%': { transform: 'translateX(0)' },
                    '100%': { transform: 'translateX(-100%)' },
                },
                fadeIn: {
                    '0%': { opacity: '0' },
                    '100%': { opacity: '1' },
                },
                slideUp: {
                    '0%': { transform: 'translateY(10px)', opacity: '0' },
                    '100%': { transform: 'translateY(0)', opacity: '1' },
                },
                slideDown: {
                    '0%': { transform: 'translateY(-10px)', opacity: '0' },
                    '100%': { transform: 'translateY(0)', opacity: '1' },
                },
            },
        },
    },
    plugins: [],
};
