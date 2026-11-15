# Reflective E-Journal (Mobile & Web)

A mindful, structured digital journal application built with **React Native (Expo)** and **TypeScript**, designed for both **cross-platform mobile (iOS & Android)** and **responsive web**.

Inspired directly by the tactile elegance of physical paper journals, this application translates quarterly planning, habit tracking, and deep self-reflection into a fluid digital experience.

---

## 🌸 Visual Aesthetic & Design Philosophy

- **Paper & Editorial Warmth**: Soft cream linen background (`#FAF7F2`), delicate borders, and notebook-ruled lines.
- **Botanical Accents**: Hand-crafted SVG floral motifs echoing the physical journal's illustrations.
- **Curated Wisdom**: Authentic quotes from Helen Keller, Charles R. Swindoll, African proverbs, Maya Angelou, Nelson Mandela, and Lao Tzu.
- **Offline-First & Private**: Your journal data never leaves your device unless you choose to export it.

---

## 📖 Screen-by-Screen Feature Tour

### 1. 🌟 My Goals for the Year
*(Reference: Photo 1)*
- Covers **8 core life areas**:
  - *Personal growth*
  - *Health and wellbeing*
  - *Spiritual life*
  - *Career or business*
  - *Financial*
  - *Family and relationships*
  - *Community and impact*
  - *Rest and joy*
- **Circle your top three**: Interactive top 3 priority selector with star indicators.
- **Priority selector**: 3-tier priority ranking (`Priority ○ ○ ○`).
- **Direct cascade**: Tap **"Break Down Goal"** on any card to jump immediately into its quarterly breakdown.
- **Quote**: *"Alone we can do so little; together we can do so much." — Helen Keller*

### 2. 🎯 Goal Breakdown
*(Reference: Photo 3)*
- **Area Selector**: Seamlessly toggle between life areas.
- **My goal**: Statement of primary target.
- **Why it matters to me**: Emotional driver and purpose.
- **Milestones**: 4-quarter grid (Quarter 1, Quarter 2, Quarter 3, Quarter 4) with direct **"Plan QX"** links.
- **Support I need**: People, mentors, habits, and resources.
- **Quote**: *"Life is ten percent what happens to me and ninety percent how I react to it." — Charles R. Swindoll*

### 3. 🗓️ Quarter Plan
*(Reference: Photo 4)*
- **Quarter Theme**: Overarching thematic focus (e.g. "Foundation & Consistency").
- **Monthly Checkpoints**:
  - **Month 1**: 3 milestone items with checkboxes.
  - **Month 2**: 3 milestone items with checkboxes.
  - **Month 3**: 3 milestone items with checkboxes.
- **Direct link**: **"View Planner"** button opens the month planner directly.
- **Quote**: *"If you want to go fast, go alone. If you want to go far, go together." — African proverb*

### 4. 📅 Month Planner
*(Reference: Photo 5)*
- **12-Month Selector**: January through December horizontal strip.
- **This month's key goals**: 5 prioritized checklist items.
- **To do**: 6 actionable to-do checklist items.
- **Notes**: Freeform reflection, ideas, and meeting notes.
- **Quick Links**: One-tap buttons to jump to Weekly Planner or Month in Review.
- **Quote**: *"Nothing will work unless you do." — Maya Angelou*

### 5. 📝 Weekly Planner
*(Reference: Photo 6)*
- **Week of**: Customizable week range header (e.g. *Oct 12 - Oct 18*).
- **My top 3 priorities this week**: 3 highlighted checkboxes with lined text.
- **Daily Agenda & Reflections**: Clean rows for Monday, Tuesday, Wednesday, Thursday, Friday, Saturday, and Sunday.
- **Carry forward**: Reflection box for tasks and intentions to carry into next week.
- **Quote**: *"It always seems impossible until it's done." — Nelson Mandela*

### 6. 🪞 Month in Review
*(Reference: Photo 2)*
- **What I achieved**: Celebration of accomplished milestones.
- **What was left undone**: Mindful acknowledgment of uncompleted tasks.
- **What got in the way**: Bottlenecks, distractions, or constraints.
- **What am I carrying forward to next month**: Interactive checklist with an **"Add"** button.
- **Reflection Box**:
  - **One win**: Top proud highlight.
  - **One lesson**: Core lesson learned.
  - **Grateful for**: Gratitude entry.
- **Quote**: *"A journey of a thousand miles begins with a single step." — Lao Tzu*

### 7. ⚙️ Settings, Backup & Print
- **Journal Year**: Switch years (2025, 2026, 2027, 2028...).
- **JSON Backup & Restore**: One-tap export to clipboard or import to restore on any device.
- **Reset to Starter Template**: Refresh the journal with thoughtful starter prompts.
- **Print / PDF Export**: Trigger browser print dialog formatted for clean paper journal sheets.

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+ recommended)
- npm or yarn

### Installation
Dependencies are already installed. If running on a new machine:
```bash
npm install
```

### Running the App

#### 1. In your Web Browser
```bash
npm run web
```
This starts the local Metro dev server and opens the application at `http://localhost:8081`.

#### 2. On Mobile (iOS & Android)
Install the free **Expo Go** app on your phone from the Apple App Store or Google Play Store.

Then run:
```bash
npm start
```
Scan the displayed QR code with your phone camera (iOS) or the Expo Go app (Android). The journal will load natively on your phone!

---

## 📁 Project Architecture

```
e-journal/
├── assets/                  # App icons and favicon
├── src/
│   ├── components/          # Reusable journal UI elements
│   │   ├── CheckboxItem.tsx     # Custom paper checkbox with strike-through
│   │   ├── FloralHeader.tsx     # Botanical header with SVG flowers
│   │   ├── JournalBox.tsx       # Lined/card input container
│   │   ├── PrioritySelector.tsx # 3-circle priority ranker & top 3 badge
│   │   └── QuoteFooter.tsx      # Curated quotes matching physical book
│   ├── constants/
│   │   ├── quotes.ts            # Book quotes and authors
│   │   └── theme.ts             # Warm paper palette, typography & shadows
│   ├── navigation/
│   │   └── JournalNavBar.tsx    # Responsive bottom/desktop tab navigation
│   ├── screens/
│   │   ├── YearGoalsScreen.tsx     # Screen 1 (Photo 1)
│   │   ├── GoalBreakdownScreen.tsx # Screen 2 (Photo 3)
│   │   ├── QuarterPlanScreen.tsx   # Screen 3 (Photo 4)
│   │   ├── MonthPlanScreen.tsx     # Screen 4 (Photo 5)
│   │   ├── WeekPlanScreen.tsx      # Screen 5 (Photo 6)
│   │   ├── MonthReviewScreen.tsx   # Screen 6 (Photo 2)
│   │   └── SettingsScreen.tsx      # Backup, Restore, Year, Print
│   ├── storage/
│   │   └── journalStorage.ts    # AsyncStorage offline persistence & seeds
│   └── types/
│       └── journal.ts           # TypeScript interfaces & life areas
├── App.tsx                  # Root component with state synchronization
├── app.json                 # Expo configuration
├── package.json             # Dependencies & scripts
└── tsconfig.json            # Strict TypeScript configuration
```
