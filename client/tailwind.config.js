/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    darkMode: 'class',
    theme: {
        extend: {
            colors: {
                primary: '#1e90ff', // vibrant blue
                secondary: '#ff6b6b', // soft red
                dark: {
                    bg: '#0a0a0a',
                    surface: '#151515',
                    text: '#e0e0e0',
                    muted: '#777777'
                },
                light: {
                    bg: '#ffffff',
                    surface: '#f3f4f6',
                    text: '#1f2937',
                    muted: '#6b7280'
                }
            },
            fontFamily: {
                sans: ['Inter', 'sans-serif'],
            },
        },
    },
    plugins: [],
}
