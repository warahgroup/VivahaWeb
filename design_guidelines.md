# Vivaha Wedding Planning App - Design Guidelines

## Design Approach

**Selected Approach:** Reference-Based with Cultural Context  
**Primary References:** Airbnb (for trust-building and booking flow) + Linear (for clean chat interface) + Indian wedding aesthetics  
**Rationale:** Wedding planning is highly experiential and emotional. Users need visual inspiration combined with efficient task management. The design must balance celebratory aesthetics with productivity.

---

## Core Design Elements

### Typography Hierarchy

**Font Families:**
- **Primary (Headings):** Playfair Display (Google Fonts) - serif, elegant, ceremonial feel
- **Secondary (Body/UI):** Inter (Google Fonts) - clean, highly legible for chat/lists
- **Accent (Cultural elements):** Satisfy or Dancing Script for decorative touches

**Type Scale:**
- Hero Headline: text-5xl md:text-6xl lg:text-7xl, font-bold
- Section Headers: text-3xl md:text-4xl, font-bold  
- Subsections: text-xl md:text-2xl, font-semibold
- Body Text: text-base md:text-lg, font-normal
- Chat Messages: text-sm md:text-base
- UI Labels/Buttons: text-sm, font-medium, uppercase tracking-wide

---

### Layout System

**Spacing Primitives:** Tailwind units of **2, 4, 6, 8, 12, 16, 20, 24**
- Component padding: p-4 to p-8
- Section spacing: py-16 md:py-24 lg:py-32
- Card gaps: gap-6 md:gap-8
- Input/button spacing: px-6 py-3
- Modal padding: p-8 md:p-12

**Grid Structure:**
- Landing sections: max-w-7xl mx-auto px-4
- Chat interface: max-w-6xl mx-auto
- Feature cards: grid-cols-1 md:grid-cols-2 lg:grid-cols-3
- Testimonials: grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6

---

## Component Library

### Landing Page Components

**Header:**
- Sticky navigation with frosted-glass effect (backdrop-blur-md)
- Logo (Vivaha in Playfair Display) on left, "Get Started" button on right
- Transparent initially, solid background on scroll

**Hero Section (80vh):**
- **Large hero image:** Vibrant Indian wedding scene (decorated mandap, marigold garlands, celebrations) - full-width background with overlay
- Centered content with h1 headline + supporting paragraph
- Primary CTA button with blur background (backdrop-blur-lg bg-white/30) + subtle drop shadow
- Floating decorative elements (subtle marigold/paisley SVG patterns) in corners

**About Us Section:**
- Two-column layout (md:grid-cols-2): left column text, right column image of wedding planning team
- Rounded-2xl image with soft shadow

**Services Grid ("What You Can Get"):**
- 3-column card grid (lg:grid-cols-3)
- Each card: icon (Heroicons - SparklesIcon, CalendarIcon, ChatBubbleIcon), title, 2-3 line description
- Cards with subtle border, hover lift effect (hover:shadow-xl hover:-translate-y-1 transition-all)

**Wedding Guide Section:**
- 4-column responsive grid showcasing: Traditions, Timeline, Budget, Vendors
- Each column: large icon, stat/number, brief description
- Background: subtle pattern overlay (Indian motifs at 5% opacity)

**Testimonials:**
- 3-column grid with quote cards
- Each card: 5-star rating (★★★★★), quote text, user name, circular avatar placeholder
- "Book Free Consult" button below grid

**Wedding Style Quiz (Modal):**
- Centered modal (max-w-2xl) with backdrop-blur background
- Question cards with radio buttons styled as large, tapable options
- Visual icons for each option (Traditional: temple icon, Fusion: mix icon, Destination: plane icon)
- Progress indicator (1/3, 2/3, 3/3) at top
- "Submit Quiz" button at bottom

**Footer:**
- Three-column layout: Company info, Quick links, Social media
- Newsletter signup inline form
- Copyright centered at bottom

---

### Chat Interface Components

**Chat Header:**
- Fixed top bar with app title, dark/light toggle (moon/sun icon), logout button
- Gradient border-b for visual separation

**Tab Navigation:**
- Horizontal tabs (Chat, Notes, Reminders, Confirmed, Report)
- Active tab: border-b-4 with coral accent, font-semibold
- Inactive: subtle hover effect

**Chat Window:**
- Message bubbles:
  - Bot messages: left-aligned, light background, rounded-tr-none
  - User messages: right-aligned, coral accent background, white text, rounded-tl-none
  - Avatar icons (bot: sparkle icon, user: user circle)
- Input area: Fixed bottom with input field + send button (paper plane icon)
- Scrollable area: h-[500px] with custom scrollbar styling

**List Tabs (Notes/Reminders/Confirmed):**
- Search bar at top (sticky): input with search icon, rounded-full
- List items in cards with checkbox, text, timestamp, delete icon
- Swipe indicator (← Swipe to delete) on touch devices
- Empty state: illustration + "No items yet" message

**Progress Tracker Sidebar:**
- Fixed right sidebar (lg:block hidden on mobile)
- Circular progress ring (SVG) showing 0-100% completion
- "Wedding Readiness Score" label
- List of completed tasks below (max 5 recent)

**Context Menu (Long-press popup):**
- White card with shadow-2xl
- 5 buttons stacked vertically: Note, Reminder, Confirmed, Archive, Cancel
- Each with icon + label, hover background change

**Report Tab Paywall:**
- Centered card with "Premium Feature" badge
- Feature list with checkmarks
- Mock Stripe checkout button (large, prominent)
- Post-payment: PDF preview mockup with download button

**Share Sheet:**
- Native-style bottom sheet (mobile) or modal (desktop)
- Share options: WhatsApp icon, SMS icon, Copy link
- List preview of items being shared

---

## Images

**Required Images:**

1. **Hero Background:** Large, vibrant Indian wedding photograph showing decorated mandap with marigold garlands, fairy lights, and celebration atmosphere. Should evoke joy and tradition. Warm color grading. (Full-width, 80vh)

2. **About Us Section:** Professional team photo of wedding planners in semi-formal attire, friendly poses, diverse team. (Right column, rounded corners)

3. **Wedding Guide Illustrations:** Four custom illustrations or photos representing:
   - Traditional ceremonies (Mehndi hands)
   - Wedding timeline (calendar with flowers)
   - Budget planning (elegant savings concept)
   - Vendor coordination (photographer/caterer setup)

4. **Testimonial Avatars:** Circular profile photos of happy couples (3-4 images)

5. **Empty State Illustrations:** Friendly, colorful illustrations for empty Notes/Reminders/Confirmed tabs (checklist/calendar themed)

---

## Interaction Patterns

**Modals:** Fade in with backdrop-blur-sm background, scale animation (scale-95 to scale-100)

**Buttons:** 
- Primary: Solid coral background, white text, hover:brightness-110
- Secondary: Transparent with coral border, hover:bg-coral/10
- Tertiary: Text-only with hover underline

**Hover States:** Subtle lift (hover:-translate-y-0.5) + shadow increase for cards

**Dark Mode Toggle:** Instant theme switch with smooth color transitions (transition-colors duration-200)

**Tooltip Tour:** Yellow highlight pulse animation around target elements, arrow pointing to feature, dismissible with "Got it" or "Next" buttons

---

## Accessibility

- ARIA labels for all interactive elements
- Keyboard navigation for modals, tabs, and chat
- Focus rings (ring-2 ring-coral/50) on all focusable elements
- Color contrast ratio 4.5:1 minimum (WCAG AA)
- Touch targets minimum 44x44px for mobile

---

## Mobile Optimization

- Collapsible header on scroll (smaller logo + compact button)
- Bottom navigation bar for tabs on mobile (fixed bottom)
- Touch-friendly swipe gestures for list deletion
- Long-press detection (800ms) for context menu
- Responsive images with optimized loading