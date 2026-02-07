/** @type {import('tailwindcss').Config} */
module.exports = {
  // NOTE: Update this to include the paths to all files that contain Nativewind classes.
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
  extend: {
    colors: {
      primary: {
        DEFAULT: "#6F4E37", // coffee brown
        light: "#A1866F",   // latte
        dark: "#4B3621",    // dark roast
      },

      background: {
        DEFAULT: "#F7F3EE", // milk / cream background
        light: "#EFE6D8",   // latte foam
        lighter: "#FFFFFF",
      },

      surface: {
        DEFAULT: "#FFFFFF", // card / modal
        light: "#F3ECE3",   // elevated surface
      },

      text: {
        primary: "#3B2F2F",   // dark coffee text
        secondary: "#6F4E37", // coffee brown
        tertiary: "#9C8A7E",  // muted coffee
      },

      accent: {
        DEFAULT: "#C8A165", // caramel
        red: "#C2412D",     // warm red
        yellow: "#E3B261",  // honey
      },
    },
  },
},
  plugins: [],
};