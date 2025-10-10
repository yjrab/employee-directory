/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
      "./index.html",
      "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
      extend: {
        colors: {
          primary: {
            50: "#eef7ff",
            100: "#d9ecff",
            200: "#b9dcff",
            300: "#8ec6ff",
            400: "#5aa7ff",
            500: "#2b84ff",
            600: "#1867e6",
            700: "#144fba",
            800: "#154494",
            900: "#173a78",
          },
          accent: {
            50: "#fff1f2",
            100: "#ffe4e6",
            200: "#fecdd3",
            300: "#fda4af",
            400: "#fb7185",
            500: "#f43f5e",
            600: "#e11d48",
            700: "#be123c",
            800: "#9f1239",
            900: "#881337",
          },
        },
        boxShadow: {
          card: "0 10px 25px -10px rgba(2,6,23,0.2)",
        },
      },
    },
    plugins: [],
  };
  