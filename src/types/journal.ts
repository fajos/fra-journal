export type PredefinedLifeArea =
  | 'Personal growth'
  | 'Health and wellbeing'
  | 'Spiritual life'
  | 'Career or business'
  | 'Financial'
  | 'Family and relationships'
  | 'Community and impact'
  | 'Rest and joy';

export type LifeArea = PredefinedLifeArea | (string & {});

export const LIFE_AREAS: { key: LifeArea; label: string; icon: string; defaultPlaceholder: string }[] = [
  {
    key: 'Personal growth',
    label: 'Personal growth',
    icon: 'Sparkles',
    defaultPlaceholder: 'e.g. Read 12 books, learn conversational Spanish, practice daily mindfulness',
  },
  {
    key: 'Health and wellbeing',
    label: 'Health and wellbeing',
    icon: 'Heart',
    defaultPlaceholder: 'e.g. Run 3x per week, prioritize 7.5 hours of sleep, cook balanced meals',
  },
  {
    key: 'Spiritual life',
    label: 'Spiritual life',
    icon: 'Sun',
    defaultPlaceholder: 'e.g. Morning prayer or meditation, gratitude journal, weekend retreat',
  },
  {
    key: 'Career or business',
    label: 'Career or business',
    icon: 'Briefcase',
    defaultPlaceholder: 'e.g. Launch new portfolio project, step into leadership, attend 2 conferences',
  },
  {
    key: 'Financial',
    label: 'Financial',
    icon: 'Coins',
    defaultPlaceholder: 'e.g. Build 6-month emergency reserve, invest $500/mo, eliminate credit card balance',
  },
  {
    key: 'Family and relationships',
    label: 'Family and relationships',
    icon: 'Users',
    defaultPlaceholder: 'e.g. Weekly family dinner, quarterly couple getaway, call parents every Sunday',
  },
  {
    key: 'Community and impact',
    label: 'Community and impact',
    icon: 'HandHeart',
    defaultPlaceholder: 'e.g. Mentor a young professional, volunteer monthly at community garden',
  },
  {
    key: 'Rest and joy',
    label: 'Rest and joy',
    icon: 'Palmtree',
    defaultPlaceholder: 'e.g. Unplugged Sundays, annual summer cottage trip, pottery workshop',
  },
];

export interface CheckItem {
  id: string;
  text: string;
  completed: boolean;
}

export type DayKey =
  | 'monday'
  | 'tuesday'
  | 'wednesday'
  | 'thursday'
  | 'friday'
  | 'saturday'
  | 'sunday';

export interface DayDateInfo {
  dayNumber: number;
  monthShort: string;
  formatted: string; // e.g. "Jan 5"
  isCurrentMonth: boolean;
}

export interface MonthWeekInfo {
  weekIndex: number; // 1 to 6
  startDay: number;
  endDay: number;
  label: string;      // e.g. "Week 1 (Jan 1 - Jan 4)"
  shortLabel: string; // e.g. "Jan 1 - 4"
  dateRange: string;  // e.g. "Jan 1 - Jan 4, 2026"
  days: Record<DayKey, DayDateInfo>;
}

export interface WeekPlan {
  weekIndex: number; // 1 to 6 (exact weeks for month)
  weekOf: string;    // editable date label (e.g. "Jan 1 - Jan 4, 2026")
  topPriorities: CheckItem[]; // Top 3 priorities for this week
  days: {
    monday: string;
    tuesday: string;
    wednesday: string;
    thursday: string;
    friday: string;
    saturday: string;
    sunday: string;
  };
  carryForward: string;
}

export interface MonthReview {
  whatIAchieved: string;
  whatWasLeftUndone: string;
  whatGotInTheWay: string;
  carryForwardItems: CheckItem[];
  reflection: {
    oneWin: string;
    oneLesson: string;
    gratefulFor: string;
  };
}

export interface MonthPlan {
  monthIndex: number; // 1 to 12
  monthName: string;
  keyGoals: CheckItem[]; // up to 5
  todos: CheckItem[];    // up to 6
  notes: string;
  review: MonthReview;
  weeks: Record<number, WeekPlan>; // Weeks 1 to 5 for this month
}

export interface QuarterPlan {
  quarter: 1 | 2 | 3 | 4;
  theme: string;
  month1: CheckItem[];
  month2: CheckItem[];
  month3: CheckItem[];
}

export interface GoalEntry {
  area: LifeArea;
  text: string;
  priority: 1 | 2 | 3;
  isTopThree: boolean;
  whyItMatters: string;
  milestones: {
    q1: string;
    q2: string;
    q3: string;
    q4: string;
  };
  supportNeeded: string;
  isCustom?: boolean;
  // Nested goal-specific plans
  quarterPlans: Record<1 | 2 | 3 | 4, QuarterPlan>;
  monthPlans: Record<number, MonthPlan>; // 1 to 12
}

export interface JournalState {
  year: number; // Currently active year
  goals: Record<string, GoalEntry>; // Goals for the active year
  customAreas?: string[]; // Custom areas added by user
  yearsData: Record<number, Record<string, GoalEntry>>; // Multi-year persistent store
}
