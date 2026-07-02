# 🖋️ InkSpace

InkSpace is a premium, full-stack, Substack-style blogging platform designed for creators, writers, and reader communities. It combines rich text publishing, real-time social engagement, bookmarks, an aggregated activity notification feed, and an interactive subscriber/direct chat client with Google Gemini AI-assisted writing tools—all wrapped in a sleek, responsive user interface.

---

## ✨ Key Features

- **✍️ Interactive Rich Text Editor**: Built with TipTap, supporting advanced typography, image embedding, live links, customized placeholder alerts, and inline lowlight code block syntax highlighting.
- **🤖 Gemini AI Integration**: Seamless connection to the Google Gemini API to dynamically generate post outlines, expand drafts, and formulate concise, two-sentence summaries.
- **💬 Real-Time Chats**: Substack-inspired chat module featuring multi-user message threads, real-time status badges, optimistic UI updates, auto-expanding text fields, and integrated automated bot replies to simulate live network interactions.
- **🔐 Global Auth Overlay Modal**: Frictionless user authentication utilizing a central React Context provider (`AuthModalProvider`) that allows instant sign-in/sign-up switching without disruptive page redirection.
- **🔔 Aggregated Activity Feed**: Lightweight notification framework that aggregates likes, follows, and comments dynamically at query time—minimizing database overhead and avoiding schema redundancy.
- **🔖 Bookmarks & Personalization**: Save articles to a personal read-later list with immediate optimistic UI rendering, backed by custom feed filters.

---

## 🛠️ Technology Stack

- **Frontend**: Next.js 16 (App Router), React 19, TailwindCSS v4, PostCSS, Framer Motion, TipTap Editor, Sonner Toast Alerts, Lucide Icons
- **Backend**: Next.js Server Actions & API Route Handlers
- **Database & ORM**: MongoDB Atlas, Prisma ORM
- **Authentication**: NextAuth.js v5 (Beta credentials & Google OAuth)
- **AI Processing**: Google Gemini API (`@google/genai`)

---

## 📁 File Structure

```text
InkSpace/
├── app/                        # Next.js 16 App Router pages and route handlers
│   ├── (auth)/                 # User authentication views
│   │   ├── login/              # Sign In page
│   │   └── register/           # Sign Up page
│   ├── (main)/                 # Main application shell with layouts & sidebar
│   │   ├── activity/           # Notification & activity aggregator
│   │   ├── bookmarks/          # Saved bookmark feed
│   │   ├── chat/               # Direct and group messaging window
│   │   ├── edit/[id]/          # Article editor / draft management
│   │   ├── post/[id]/          # Full post view & comments
│   │   ├── profile/[id]/       # Profile dashboards
│   │   ├── search/             # Discover page with tag filtering
│   │   ├── settings/           # Account information editor
│   │   ├── welcome/            # Onboarding & onboarding interest tags
│   │   ├── write/              # Editor for creating new posts
│   │   └── page.tsx            # Main personalized feed page
│   ├── api/                    # Server-side REST API handlers
│   │   ├── activity/           # social notification engine
│   │   ├── ai/                 # Google Gemini prompt endpoints
│   │   ├── auth/               # NextAuth authentication callbacks
│   │   ├── bookmarks/          # Bookmark controller
│   │   ├── chats/              # Direct message threads and mock seed data
│   │   └── posts/              # Article CRUD & comment routing
│   ├── globals.css             # Main styling system (Tailwind v4 imports & variables)
│   └── layout.tsx              # Root HTML wrapper
├── components/                 # Reusable React components
│   ├── activity/               # Social notification render list items
│   ├── auth/                   # Central Auth Modals
│   ├── feed/                   # Feed lists, tab bars, tags
│   ├── layout/                 # Left Sidebar, Right Sidebar, Navbar layouts
│   ├── post/                   # PostCard components & Bookmark actions
│   ├── providers/              # Global React Contexts (AuthModalProvider, etc.)
│   └── ui/                     # Lightweight layout design atoms
├── lib/                        # Shared configurations & utility functions
│   ├── auth.ts                 # NextAuth v5 token configuration and callbacks
│   ├── constants.ts            # Constants and configurations
│   ├── gemini.ts               # Google Gemini client setup
│   ├── prisma.ts               # Prisma database adapter instance
│   └── validations.ts          # Zod schema validation rules
├── prisma/                     # Database schemas
│   └── schema.prisma           # MongoDB data models
└── public/                     # Static media & assets
```

---

## 🚀 Local Setup & Installation

Follow these steps to run InkSpace on your local development machine:

### 1. Prerequisites
Make sure you have the following installed on your machine:
- **Node.js** (v20+ recommended)
- **MongoDB** (local database or cloud-based MongoDB Atlas connection string)
- **Google Gemini API Key** (obtainable via [Google AI Studio](https://aistudio.google.com/))
- **Google OAuth Credentials** (optional, for configuring Google Sign-in)

### 2. Clone the Repository
```bash
git clone https://github.com/your-username/InkSpace.git
cd InkSpace
```

### 3. Configure Environment Variables
Create a `.env.local` file in the root of the project:
```env
# MongoDB Connection String (Atlas or Local MongoDB instance)
DATABASE_URL="mongodb+srv://<username>:<password>@cluster.mongodb.net/InkSpace"

# NextAuth.js Configuration (Generate secure keys with `openssl rand -base64 32`)
NEXTAUTH_SECRET="your-base64-secret-key"
AUTH_SECRET="your-base64-secret-key"

# Application URL
NEXTAUTH_URL="http://localhost:3000"
AUTH_URL="http://localhost:3000"

# Google OAuth Credentials (for Google Login callback integration)
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"

# Google Gemini API Key
GEMINI_API_KEY="your-gemini-api-key"
```

### 4. Install Project Dependencies
InkSpace uses Node.js version management (`nvm`) and package management via npm:
```bash
# Optional: Load & switch to recommended Node version
nvm use

# Install packages
npm install
```

### 5. Generate and Push Database Schemas
Sync the Prisma models with your MongoDB database collections:
```bash
# Generate the local Prisma Client library
npx prisma generate

# Synchronize the models and collections directly with your MongoDB database
npx prisma db push
```

### 6. Start the Development Server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) inside your browser to start writing, editing, and using InkSpace locally!
