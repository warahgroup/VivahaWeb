# Vivaha - Indian Wedding Planning Web App

## Overview
Vivaha is a comprehensive Indian wedding planning platform featuring an AI-powered chatbot, personalized recommendations, task management, and progress tracking. Built with React, TypeScript, and Tailwind CSS following modern full-stack JavaScript patterns.

## Project Status
**Current Phase:** MVP Development - Schema & Frontend Complete
**Last Updated:** Task 1 completed on January 2025

## Recent Changes
- **January 2025:** Completed comprehensive frontend implementation with all MVP features
  - Created data schemas for users, quiz responses, chat messages, and saved items
  - Generated wedding-themed hero images and visual assets
  - Configured design tokens with coral (#ff6b6b) and yellow (#ffeaa7) Indian wedding theme
  - Built complete landing page with hero, about, services, guide, testimonials sections
  - Implemented authentication modal with "Remember Me" functionality
  - Created wedding style quiz with 3-step flow (style, budget, guest count)
  - Developed full chat interface with AI bot, message management, tabs
  - Added progress tracker with readiness score (0-100%)
  - Implemented onboarding tooltip tour for new users
  - Created dark/light mode toggle with theme persistence
  - Built context menu for long-press/right-click message actions
  - Added share functionality for notes/reminders/confirmed items
  - Implemented report paywall with mock Stripe integration
  - Integrated Google Analytics (GA4) for tracking user engagement

## User Preferences
- **Design System:** Indian wedding aesthetic with coral/yellow palette, elegant typography (Playfair Display serif + Inter sans), warm and celebratory feel
- **Architecture:** Client-side localStorage for MVP, all features functional without backend
- **Coding Style:** TypeScript with strict typing, modular React components, Tailwind CSS utility-first styling
- **Testing:** E2e testing with Playwright for user flows and interactions

## Project Architecture

### Data Models (shared/schema.ts)
- **Users:** Email/password authentication with remember me expiry
- **Quiz Responses:** Wedding style, budget range, guest count preferences
- **Chat Messages:** User and bot messages with timestamps
- **Saved Items:** Notes, reminders, confirmed tasks, archived items
- **Progress:** Wedding readiness score based on confirmed tasks

### Frontend Structure
```
client/src/
├── pages/
│   ├── landing.tsx          # Landing page with all sections
│   ├── chat.tsx              # Main chat interface with tabs
│   └── not-found.tsx
├── components/
│   ├── landing-header.tsx    # Sticky header with CTA
│   ├── landing-hero.tsx      # Hero with Indian wedding imagery
│   ├── landing-about.tsx     # About Vivaha section
│   ├── landing-who-we-are.tsx # Team expertise cards
│   ├── landing-services.tsx  # Services grid
│   ├── landing-guide.tsx     # Wedding guide (traditions, timeline, budget)
│   ├── landing-testimonials.tsx # Customer testimonials
│   ├── landing-footer.tsx    # Footer with newsletter
│   ├── auth-modal.tsx        # Login/signup modal
│   ├── quiz-modal.tsx        # 3-step wedding quiz
│   ├── consult-modal.tsx     # Free consultation booking
│   ├── chat-header.tsx       # Chat header with theme toggle
│   ├── chat-tabs.tsx         # Tab navigation (Chat/Notes/Reminders/Confirmed/Report)
│   ├── chat-message.tsx      # Message bubble with long-press detection
│   ├── message-context-menu.tsx # Context menu for message actions
│   ├── saved-item-list.tsx   # List with search/swipe-to-delete
│   ├── progress-tracker.tsx  # Circular progress widget
│   ├── onboarding-tour.tsx   # 3-step tooltip tour
│   └── report-paywall.tsx    # Premium report feature
├── lib/
│   ├── theme-provider.tsx    # Dark/light mode management
│   └── analytics.ts          # Google Analytics integration
└── hooks/
    └── use-analytics.tsx     # Page view tracking
```

### Design Tokens
- **Primary Color:** Coral (#ff6b6b / HSL 6 85% 62%)
- **Accent Color:** Light Yellow (#ffeaa7 / HSL 42 95% 88%)
- **Fonts:** Playfair Display (serif), Inter (sans-serif)
- **Spacing:** 4px base unit, consistent padding throughout
- **Animations:** Smooth transitions, hover elevations, modal fades

### Key Features Implemented
1. **Landing Page**
   - Responsive header with sticky navigation
   - Full-width hero with Indian wedding imagery and dark overlay
   - About Us with team photo
   - Services grid (5 services)
   - Wedding guide with 4 sections (traditions, timeline, budget, venues)
   - Testimonials with star ratings (4 couples)
   - Footer with newsletter signup

2. **Authentication**
   - Email/password login modal
   - "Remember Me" checkbox (7-day localStorage)
   - Auto-login on return visits
   - Logout functionality

3. **Wedding Quiz**
   - 3-step modal flow
   - Style selection (Traditional/Fusion/Destination)
   - Budget range (Under ₹15L / ₹15-25L / Over ₹25L)
   - Guest count (Under 100 / 100-300 / Over 300)
   - Results stored in localStorage for personalization

4. **Chat Interface**
   - AI chatbot with context-aware keyword responses
   - Personalized welcome message based on quiz data
   - Smart responses for budget, venue, vendor, timeline, traditions, decor queries
   - Long-press (mobile) and right-click (desktop) for message actions
   - Real-time message updates

5. **Task Management**
   - Notes, Reminders, Confirmed tabs with saved items
   - Search/filter functionality per tab
   - Swipe-to-delete on mobile
   - Archive functionality
   - Share via Web Share API (WhatsApp/SMS)

6. **Progress Tracking**
   - Circular progress indicator (0-100%)
   - Score increases by 10% per confirmed item
   - Recent confirmations list (max 5 shown)
   - Sticky sidebar on desktop

7. **Premium Features**
   - Report tab with paywall
   - Mock Stripe checkout flow
   - PDF export simulation after "payment"
   - Summary of all notes/reminders/confirmed items

8. **User Experience**
   - Onboarding tour (3 steps) for first-time users
   - Dark/light mode toggle with persistence
   - Mobile-responsive design
   - Touch gestures (long-press, swipe)
   - Smooth animations and transitions

9. **Analytics**
   - Google Analytics (GA4) integration
   - Tracking for login, quiz completion, tab clicks, message sends, share actions

### Data Flow
- All data stored in localStorage for MVP
- User authentication state persists across sessions
- Quiz responses personalize chat bot welcome message and responses
- Chat messages and saved items sync with localStorage
- Progress score calculated from confirmed items count

### Mobile Optimizations
- Touch-friendly tap targets (44x44px minimum)
- Long-press detection (800ms) for context menu
- Swipe-to-delete gestures for list items
- Responsive breakpoints (sm/md/lg)
- Bottom-aligned input for chat on mobile

### Pending Implementation
**Task 2 - Backend:**
- API routes for chat bot responses
- User authentication endpoints
- CRUD operations for saved items
- Progress calculation endpoint
- Analytics event tracking

**Task 3 - Integration & Testing:**
- Connect frontend to backend APIs
- Add error handling and loading states
- Test all user flows end-to-end
- Verify mobile touch interactions
- Validate dark mode across all components
- Get architect review and run e2e tests

## Environment Variables
- `VITE_GA_MEASUREMENT_ID`: Google Analytics 4 measurement ID (configured in Secrets)

## Tech Stack
- **Frontend:** React 18, TypeScript, Tailwind CSS, Shadcn UI
- **Routing:** Wouter
- **State:** React hooks, localStorage
- **Animations:** Framer Motion, CSS transitions
- **Analytics:** Google Analytics 4
- **Icons:** Lucide React
- **Forms:** React Hook Form with Zod validation
- **Build:** Vite

## Development Workflow
- Workflow "Start application" runs `npm run dev` (Express + Vite)
- Auto-restart on file changes
- Frontend served on port 5000
- Hot module replacement enabled

## Testing Strategy
- E2e tests with Playwright for all user flows
- Test coverage: landing page navigation, authentication, quiz completion, chat interactions, task management, share functionality, paywall flow

## Design Philosophy
- **Visual Excellence:** Stunning Indian wedding aesthetic with professional polish
- **Cultural Authenticity:** Respect for traditional ceremonies and modern fusion
- **User-Centric:** Intuitive navigation, helpful guidance, seamless experience
- **Mobile-First:** Touch-optimized for Indian market (60%+ mobile traffic)
- **Engagement:** Gamification (progress score), personalization (quiz), retention (reminders)
