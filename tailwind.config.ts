// tailwind.config.ts
import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/**/*.{html,js,ts,jsx,tsx}", // 根据你的项目结构调整路径
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          light: '#e7d1c1',
          DEFAULT: '#e7d1c1',
          dark: '#2E1065',
        },
        secondary: {
          light: '#1E40AF', // 蓝色
          DEFAULT: '#1E3A8A',
          dark: '#1E3A8A',
        },
        accent: {
          light: '#10B981', // 绿色
          DEFAULT: '#059669',
          dark: '#047857',
        },
        muted: {
          light: '#9CA3AF', // 灰色
          DEFAULT: '#6B7280',
          dark: '#4B5563',
        },
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        serif: ['Merriweather', 'serif'],
        chinese: ['Noto Serif SC', 'serif'], // 中文字体
      },
      boxShadow: {
        'soft': '0 2px 8px rgba(0, 0, 0, 0.1)',
        'medium': '0 4px 16px rgba(0, 0, 0, 0.1)',
        'hard': '0 8px 24px rgba(0, 0, 0, 0.2)',
      },
      width: {
        '50': '30.5rem', // 200px
      },
      height: {
        '40': '15rem', // 160px
      },
      borderRadius: {
        'none': '0',
        'sm': '0.125rem',
        'md': '0.375rem',
        'lg': '0.5rem',
        'full': '9999px',
      },
      backgroundImage: {
        'custom-pattern': "url(https://raw.githubusercontent.com/jackeygao/chinese-poetry/master/images/ci_rhythmic_topK.png)",
        // 'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        // 'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
      },
      keyframes: {
        wiggle: {
          '0%, 100%': { transform: 'rotate(-3deg)' },
          '50%': { transform: 'rotate(3deg)' },
        },
      },
      rotate: {
        '6': '6deg',
      },
      animation: {
        wiggle: 'wiggle 1s ease-in-out infinite',
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'), // 表单插件
    require('@tailwindcss/typography'), // 排版插件
    require('@tailwindcss/aspect-ratio'), // 宽高比插件
    require('@tailwindcss/line-clamp'), // 文字截断插件
  ],
};

export default config;
