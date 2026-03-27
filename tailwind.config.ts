import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}", // ท่าไม้ตาย สแกนหาคลาสทุกไฟล์ใน src
  ],
  theme: {
    extend: {},
  },
  plugins: [],
};
export default config;