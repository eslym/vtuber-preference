/** @type {import('tailwindcss').Config} */
module.exports = {
    content: ["./src/**/*.{html,js,svelte,ts}"],
    theme: {
        extend: {
            fontFamily: {
                sans: '"Noto Sans TC", "Noto Sans SC", "Noto Sans JP", sans-serif',
            },
        },
    },
    plugins: [],
};
