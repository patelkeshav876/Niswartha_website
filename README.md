# Orphanage Connect – Ashram Platform

A modern mobile-first web application connecting donors with orphanages (ashrams) across India. Built with React, TypeScript, and Supabase backend.

## 🌟 Features

### For Donors
- Browse and explore multiple orphanages
- View urgent needs and current campaigns
- Make secure donations (UPI, Cards, Net Banking)
- Track donation history with detailed receipts
- Save favorite ashrams for quick access
- View community impact through social feeds
- Real-time donation tracking and updates

### For Ashram Admins
- Comprehensive admin dashboard
- Manage ashram profile and gallery
- Create and update needs/campaigns
- Schedule and manage events
- Post updates to social feed
- View donations and donor analytics
- Settings and profile management

## 🎨 Design Language

- **Primary Color**: Soft green (#4A7C59)
- **Background**: Warm beige (#FAF7F2)
- **UI Style**: Clean, minimal, emotional
- **Typography**: Serif headings, sans-serif body
- **Components**: Rounded cards with soft shadows
- **Platform**: Android-first (360px width), fully responsive

## 🏗️ Tech Stack

### Frontend
- **React 18.3** - UI framework
- **TypeScript** - Type safety
- **React Router 7** - Navigation
- **Tailwind CSS 4** - Styling
- **Radix UI** - Accessible components
- **Motion (Framer Motion)** - Animations
- **Lucide React** - Icons
- **Sonner** - Toast notifications

### Backend
- **Supabase** - Database and authentication
- **Hono** - Edge Functions server
- **Deno** - Server runtime

## 📁 Project Structure

```
/src/app/
├── components/       # Reusable UI components
│   ├── ui/          # Radix UI components
│   ├── BottomNav.tsx
│   ├── CustomTabs.tsx
│   └── SplashScreen.tsx
├── pages/           # Page components
│   ├── admin/       # Admin dashboard pages
│   ├── Home.tsx
│   ├── Explore.tsx
│   ├── AshramDetail.tsx
│   ├── Donation.tsx
│   ├── Profile.tsx
│   ├── Settings.tsx
│   └── Help.tsx
├── context/         # React Context
│   └── UserContext.tsx
├── lib/            # Utilities
│   ├── api.ts      # Backend API functions
│   ├── supabase.ts # Supabase client
│   └── initData.ts # Data initialization
├── data/           # Mock data
│   └── mock.ts
├── types.ts        # TypeScript types
├── routes.tsx      # Route definitions
└── App.tsx         # Root component

/supabase/functions/server/
├── index.tsx       # Hono server with all endpoints
└── kv_store.tsx    # Key-value database utilities
```

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- pnpm/npm/yarn

### Installation

1. Clone the repository
```bash
git clone <repository-url>
cd orphanage-connect
```

2. Install dependencies
```bash
pnpm install
```

3. Start development server
```bash
pnpm dev
```

The app will be available at `http://localhost:5173`

## ✉️ SMTP Setup (Live Email Delivery)

Visit booking confirmation emails are sent from the API server. If SMTP is not configured, the server falls back to Ethereal test SMTP (preview-only, no real inbox delivery).

Set these variables in your local `.env`:

- `SMTP_HOST`
- `SMTP_PORT` (usually `587`)
- `SMTP_USER`
- `SMTP_PASS` (app password recommended)
- `SMTP_FROM`
- `VISIT_ADMIN_EMAIL` (fallback admin recipient if ashram email is missing)

### Gmail

- `SMTP_HOST=smtp.gmail.com`
- `SMTP_PORT=587`
- `SMTP_USER=yourgmail@gmail.com`
- `SMTP_PASS=<Google App Password>`
- `SMTP_FROM=yourgmail@gmail.com`

You must enable 2-Step Verification and generate an App Password in Google account settings.

### Zoho

- `SMTP_HOST=smtp.zoho.in` (or `smtp.zoho.com` depending on your Zoho data center)
- `SMTP_PORT=587`
- `SMTP_USER=you@yourdomain.com`
- `SMTP_PASS=<Zoho App Password>`
- `SMTP_FROM=you@yourdomain.com`

After updating `.env`, restart the API server.

## 🔑 Key Features Implementation

### Backend Integration
- All data is stored in Supabase KV store
- Real-time synchronization between frontend and backend
- Automatic data initialization on first load
- Fallback to mock data if backend is unavailable

### User Roles
- **Donor Role**: Can browse, donate, favorite ashrams
- **Admin Role**: Can manage their ashram's content

### Profile Management
- Beautiful gradient header design
- Dynamic stats based on real donation data
- Role-specific UI (donor vs admin)
- Quick actions for common tasks

### Donation Flow
- 3-step donation process
- Preset amounts + custom input
- Multiple payment methods UI
- Success animation and confirmation
- Backend persistence with receipt generation

### API Endpoints

#### Users
- `POST /users` - Create user
- `GET /users/:id` - Get user
- `PUT /users/:id` - Update user

#### Ashrams
- `GET /ashrams` - List all ashrams
- `GET /ashrams/:id` - Get ashram details
- `POST /ashrams` - Create ashram
- `PUT /ashrams/:id` - Update ashram

#### Needs
- `GET /needs` - List all needs
- `GET /needs?ashramId=xxx` - Filter by ashram
- `POST /needs` - Create need
- `PUT /needs/:id` - Update need
- `DELETE /needs/:id` - Delete need

#### Events
- `GET /events` - List all events
- `GET /events?ashramId=xxx` - Filter by ashram
- `POST /events` - Create event
- `PUT /events/:id` - Update event
- `DELETE /events/:id` - Delete event

#### Donations
- `GET /donations` - List donations
- `GET /donations?userId=xxx` - User's donations
- `POST /donations` - Create donation

#### Favorites
- `GET /favorites?userId=xxx` - User's favorites
- `POST /favorites` - Add favorite
- `DELETE /favorites` - Remove favorite

## 🎯 Current State

✅ **Complete Features:**
- Full backend integration with Supabase
- Enhanced profile page with real stats
- Donation flow with backend persistence
- Donation history from backend
- Settings and Help pages
- User context with role management
- API utilities and error handling
- Mobile-first responsive design
- Toast notifications
- Loading states and error handling

## 📱 Pages Overview

### Public Pages
- **Home** - Featured ashrams and urgent needs
- **Explore** - Browse all ashrams with filters
- **Ashram Detail** - Full ashram profile with tabs
- **Needs** - All urgent needs across ashrams
- **Events** - Upcoming events calendar
- **Donation** - Multi-step donation flow

### User Pages
- **Profile** - User stats and quick actions
- **Settings** - Account and notification settings
- **Help** - FAQs and support options
- **Donation History** - Complete donation records
- **Favorites** - Saved ashrams

### Admin Pages
- **Dashboard** - Overview and analytics
- **Manage Needs** - CRUD for needs
- **Manage Events** - CRUD for events
- **Feed Management** - Social posts
- **Admin Settings** - Ashram configuration

## 🔐 Security Notes

⚠️ **Important**: This app is designed for prototyping and demonstration purposes. For production use with real user data and payments:
- Implement proper authentication with Supabase Auth
- Add row-level security (RLS) policies
- Integrate real payment gateway (Razorpay, Stripe)
- Add email verification and 2FA
- Implement rate limiting
- Add comprehensive error logging
- Deploy to secure production environment

## 🎨 Design System

### Colors
```css
--primary: #4A7C59 (Soft Green)
--secondary: #FAF7F2 (Warm Beige)
--accent: #E8A87C (Warm Orange)
--muted: #A8A29E (Neutral Gray)
```

### Typography
- Headings: Serif font family
- Body: Sans-serif font family
- Mobile-optimized font sizes

### Components
- Rounded corners (8-16px)
- Soft shadows for depth
- Smooth transitions (200-300ms)
- Hover states on interactive elements
- Loading skeletons for better UX

## 📄 License

This project is built for demonstration purposes.

## 👥 Contributors

Built with ❤️ by the Orphanage Connect team

---

**Note**: Remember to configure your Supabase project credentials and deploy the edge functions before using in production.
