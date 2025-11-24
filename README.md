# JobWise AI

A complete, production-ready SaaS web application that helps users land their dream jobs by automatically generating resumes, cover letters, job-specific application question answers, and managing job applications.

## Features

- ✅ **AI Résumé Builder** - Generate ATS-optimized resumes in multiple styles
- ✅ **Cover Letter Generator** - Personalized cover letters for each job
- ✅ **Job Tracker** - Kanban board to organize applications
- ✅ **Application Answer Generator** - Generate STAR method responses
- ✅ **Auto-Apply Packs** - Generate complete application packages for multiple jobs
- ✅ **Subscription Management** - Stripe integration with monthly/yearly plans
- ✅ **7-Day Free Trial** - Start without a credit card

## Tech Stack

- **Next.js 15** (App Router)
- **TypeScript**
- **TailwindCSS + Shadcn UI**
- **Drizzle ORM** + **Neon Postgres**
- **NextAuth** (Email/Password)
- **OpenAI API** for AI generation
- **Stripe** for billing
- **UploadThing** for file uploads (optional)
- **React Hook Form + Zod**

## Getting Started

### Prerequisites

- Node.js 18+ and pnpm
- Neon Postgres database
- OpenAI API key
- Stripe account (for billing)

### Installation

1. Clone the repository and install dependencies:

```bash
pnpm install
```

2. Set up environment variables:

Copy `.env.example` to `.env` and fill in your values:

```bash
cp .env.example .env
```

Required environment variables:
- `DATABASE_URL` - Your Neon Postgres connection string
- `NEXTAUTH_SECRET` - Generate with `openssl rand -base64 32`
- `NEXTAUTH_URL` - Your app URL (http://localhost:3000 for local)
- `OPENAI_API_KEY` - Your OpenAI API key
- `STRIPE_SECRET_KEY` - Your Stripe secret key
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` - Your Stripe publishable key
- `STRIPE_WEBHOOK_SECRET` - Stripe webhook secret (for production)
- `NEXT_PUBLIC_APP_URL` - Your app URL

3. Set up the database:

```bash
# Generate migrations
pnpm db:generate

# Push schema to database
pnpm db:push
```

4. Run the development server:

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Database Schema

The app uses Drizzle ORM with the following main tables:

- `users` - User accounts and subscription info
- `resumes` - Uploaded and generated resumes
- `cover_letters` - Generated cover letters
- `job_applications` - Tracked job applications
- `application_answers` - Generated application answers
- `auto_apply_packs` - Auto-apply pack outputs

## Deployment

### Deploy to Vercel

1. Push your code to GitHub
2. Import the project in Vercel
3. Add environment variables in Vercel dashboard
4. Set up Stripe webhook endpoint: `/api/stripe/webhook`
5. Deploy!

### Database Setup

1. Create a Neon Postgres database
2. Copy the connection string to `DATABASE_URL`
3. Run migrations: `pnpm db:push`

### Stripe Setup

1. Create products and prices in Stripe Dashboard
2. Add price IDs to environment variables:
   - `STRIPE_MONTHLY_PRICE_ID`
   - `STRIPE_YEARLY_PRICE_ID`
3. Set up webhook endpoint pointing to `/api/stripe/webhook`
4. Select events: `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`

## Project Structure

```
/app
  /api          # API routes
  /auth         # Authentication pages
  /dashboard    # Dashboard pages
  /resume       # Resume builder
  /cover-letter # Cover letter generator
  /jobs         # Job tracker
  /auto-apply   # Auto-apply packs
  /pricing      # Pricing page
  /settings     # Settings page

/components
  /ui           # Shadcn UI components
  /dashboard    # Dashboard components
  /resume       # Resume components
  /cover-letter # Cover letter components
  /jobs         # Job tracker components
  /pricing      # Pricing components

/db
  schema.ts     # Drizzle schema
  index.ts      # Database connection

/lib
  auth.ts       # NextAuth configuration
  openai.ts     # OpenAI integration
  subscription.ts # Subscription helpers
  utils.ts      # Utilities
```

## Features in Detail

### Resume Builder

- Upload PDF, DOCX, or TXT files
- AI-powered text extraction and parsing
- Generate resumes in 5 styles: ATS-optimized, Modern, Traditional, Minimal, Creative
- Edit and save generated resumes
- Export to PDF

### Cover Letter Generator

- Enter job title, company, and description
- Choose tone: Formal, Friendly, Concise, Confident
- Personalized based on your resume
- Edit and copy generated letters

### Job Tracker

- Kanban board with 5 columns: Saved, Applied, Interview, Offer, Rejected
- Drag and drop (UI ready, full drag-and-drop functionality can be added)
- Add jobs with URLs and descriptions
- Track application status

### Auto-Apply Packs

- Paste multiple job URLs
- Automatically extracts job descriptions
- Generates resume, cover letter, and application answers for each job
- Saves all outputs to your account

## Subscription Plans

- **Monthly**: $15/month
- **Yearly**: $79/year (save $101/year)
- **7-Day Free Trial** for all new users

## License

MIT

# JobWise-AI
