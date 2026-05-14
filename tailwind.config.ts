import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}", // ท่าไม้ตาย สแกนหาคลาสทุกไฟล์ใน src
  ],
  theme: {
    extend: {},
  },
plugins: [
  require('@tailwindcss/typography'),
  // plugin อื่นๆ ของคุณ
],
};
export default config;