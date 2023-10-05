import { type Config } from "tailwindcss";

export default {
  content: ["./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        canvas: '#fff',
        canvasInset: '#f6f8fa',

        fgDefault: '#24292F',
        fgMuted: '#57606a',

        borderDefault: 'rgba(27,31,36,.15)',
        primaryPurple: '#8250df',
      },
    },
  },
  plugins: [],
} satisfies Config;
