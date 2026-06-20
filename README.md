# 🎨 FormAI - AI Form Builder

A premium AI-powered form builder SaaS with a dark, modern aesthetic inspired by Raw House Athens.

![FormAI](https://img.shields.io/badge/FormAI-AI%20Form%20Builder-violet?style=for-the-badge)
![Next.js](https://img.shields.io/badge/Next.js-15-black?style=for-the-badge&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)

## ✨ Features

### 🤖 AI Form Generation
- Describe forms in natural language
- AI generates complete form structure
- Powered by Groq API (LLaMA 3.3)

### ✋ Manual Form Builder
- Drag & drop interface
- 25+ field types
- Real-time preview
- Mobile/Tablet/Desktop preview modes

### 📄 PDF Upload
- Extract forms from PDF documents
- AI-powered field detection

### 📊 Analytics Dashboard
- Response tracking
- Form performance metrics
- Visual charts (Line, Bar, Donut)

### 🔐 Authentication
- Email/Password login
- Google OAuth
- Magic Link authentication

### 🎨 Premium Dark UI
- Raw House Athens inspired design
- Glassmorphism effects
- Smooth animations (Framer Motion)
- Fully responsive

## 🚀 Tech Stack

| Category | Technologies |
|----------|-------------|
| Framework | Next.js 15 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS + shadcn/ui |
| Database | Supabase (PostgreSQL) |
| Auth | Supabase Auth |
| AI | Groq API (LLaMA 3.3) |
| Animations | Framer Motion |
| State | Zustand |
| Forms | React Hook Form + Zod |

## 📁 Project Structure

```
src/
├── app/
│   ├── (auth)/
│   │   ├── login/
│   │   ├── signup/
│   │   └── auth/
│   ├── dashboard/
│   │   ├── analytics/
│   │   ├── billing/
│   │   ├── create/
│   │   │   └── edit/
│   │   ├── forms/
│   │   └── settings/
│   ├── api/
│   │   └── forms/
│   ├── forms/
│   │   └── [formId]/
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx
├── components/
│   └── ui/
├── lib/
│   ├── supabase/
│   ├── groq.ts
│   ├── prisma.ts
│   └── utils.ts
├── store/
│   └── form-store.ts
└── types/
    └── form.ts
```

## 🛠️ Installation

1. **Clone the repository**
```bash
git clone https://github.com/YOUR_USERNAME/ai-form-builder.git
cd ai-form-builder
```

2. **Install dependencies**
```bash
npm install
```

3. **Set up environment variables**
```bash
cp .env.example .env.local
```

Fill in your:
- Supabase URL & Keys
- Database URL
- Groq API Key

4. **Set up database**
Run the SQL in `database-setup.sql` in your Supabase SQL Editor.

5. **Run development server**
```bash
npm run dev
```

## 🌐 Deployment

This project is configured for Vercel deployment:

```bash
npx vercel deploy --prod
```

## 📝 Environment Variables

| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anonymous key |
| `DATABASE_URL` | PostgreSQL connection string |
| `DIRECT_URL` | Direct database connection |
| `GROQ_API_KEY` | Groq API key for AI |

## 🎨 Design System

| Element | Style |
|---------|-------|
| Background | `#000000` (Black) |
| Cards | `rgba(255,255,255,0.05)` with backdrop blur |
| Primary | Violet to Fuchsia gradient |
| Text | White / White 60% / White 40% |
| Borders | `rgba(255,255,255,0.1)` |
| Radius | 16-24px (rounded-2xl/3xl) |

## 📄 License

MIT License

## 🙏 Acknowledgments

- Design inspired by [Raw House Athens](https://rawhouseathens.gr)
- UI components from [shadcn/ui](https://ui.shadcn.com)
- Icons from [Lucide](https://lucide.dev)

---

Built with ❤️ using AI
