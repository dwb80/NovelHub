import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
      },
      // 精致文学风圆角系统
      borderRadius: {
        // 基础圆角 (4px) - 图片、微型按钮、输入框
        DEFAULT: '4px',
        // 小圆角 (6px) - 标准按钮
        sm: '6px',
        // 中圆角 (8px) - 小卡片、大按钮
        md: '8px',
        // 大圆角 (12px) - 大卡片、模块容器
        lg: '12px',
        // 超大圆角 (16px) - 弹窗、模态框
        xl: '16px',
        // 完全圆形 - 头像、标签、搜索框
        full: '9999px',
      },
      // 精致文学风阴影系统
      boxShadow: {
        // 悬停阴影
        hover: '0 2px 8px rgba(0, 0, 0, 0.08)',
        // 浮起阴影
        float: '0 4px 16px rgba(0, 0, 0, 0.12)',
        // 弹窗阴影
        modal: '0 8px 32px rgba(0, 0, 0, 0.16)',
      },
      // 精致文学风字体系统
      fontSize: {
        'page-title': ['28px', { lineHeight: '36px', fontWeight: '600' }],
        'section-title': ['22px', { lineHeight: '30px', fontWeight: '600' }],
        'card-title': ['16px', { lineHeight: '24px', fontWeight: '500' }],
        'body': ['15px', { lineHeight: '26px', fontWeight: '400' }],
        '辅助': ['13px', { lineHeight: '20px', fontWeight: '400' }],
        'tiny': ['12px', { lineHeight: '16px', fontWeight: '400' }],
      },
      // 精致文学风间距系统
      spacing: {
        '18': '4.5rem',
        '22': '5.5rem',
      },
    },
  },
  plugins: [],
};

export default config;
