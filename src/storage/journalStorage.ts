import AsyncStorage from '@react-native-async-storage/async-storage';
import { JournalState, LIFE_AREAS, LifeArea, QuarterPlan, MonthPlan, MonthReview, WeekPlan } from '../types/journal';

const STORAGE_KEY = '@ejournal_state_v1';

export const MONTH_NAMES = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

export function createInitialJournalState(year: number = new Date().getFullYear()): JournalState {
  const goals = {} as Record<LifeArea, any>;

  LIFE_AREAS.forEach((item, index) => {
    // Provide gentle sample seeds for top 3 areas to inspire the user immediately
    const isSampleTop = index < 3;
    goals[item.key] = {
      area: item.key,
      text: isSampleTop
        ? index === 0
          ? 'Read 12 transformative books and write monthly summaries'
          : index === 1
          ? 'Establish a daily 30-minute morning workout and drink 2.5L water'
          : 'Dedicate 15 minutes each morning to quiet meditation and prayer'
        : '',
      priority: (isSampleTop ? index + 1 : 1) as 1 | 2 | 3,
      isTopThree: isSampleTop,
      whyItMatters: isSampleTop
        ? index === 0
          ? 'To sharpen my mind, expand my worldview, and cultivate lifelong learning.'
          : index === 1
          ? 'To have sustained energy for family, creative work, and vitality.'
          : 'To maintain inner peace and emotional grounding amidst busy seasons.'
        : '',
      milestones: {
        q1: isSampleTop ? 'Finish first 3 books and build habit' : '',
        q2: isSampleTop ? 'Read books 4-6; do mid-year checkin' : '',
        q3: isSampleTop ? 'Read books 7-9; join local book circle' : '',
        q4: isSampleTop ? 'Read books 10-12; compile top takeaways' : '',
      },
      supportNeeded: isSampleTop ? 'Accountability partner, quiet reading nook at home, library card' : '',
    };
  });

  const quarterPlans: Record<number, QuarterPlan> = {
    1: {
      quarter: 1,
      theme: 'Foundation & Consistency',
      month1: [
        { id: 'q1m1_1', text: 'Set up morning routine & reading schedule', completed: true },
        { id: 'q1m1_2', text: 'Health checkup and baseline workout plan', completed: false },
        { id: 'q1m1_3', text: 'Audit yearly budget and set savings bucket', completed: false },
      ],
      month2: [
        { id: 'q1m2_1', text: 'Consistent 5-day workout rhythm', completed: false },
        { id: 'q1m2_2', text: 'Finish reading Book #2', completed: false },
        { id: 'q1m2_3', text: 'Host intimate dinner with close friends', completed: false },
      ],
      month3: [
        { id: 'q1m3_1', text: 'First quarter review & milestone assessment', completed: false },
        { id: 'q1m3_2', text: 'Plan Q2 trip / family weekend getaway', completed: false },
        { id: 'q1m3_3', text: 'Celebrate small wins and adjust goals', completed: false },
      ],
    },
    2: {
      quarter: 2,
      theme: 'Momentum & Expansion',
      month1: [
        { id: 'q2m1_1', text: 'Kick off Q2 creative project', completed: false },
        { id: 'q2m1_2', text: 'Outdoor hiking weekends', completed: false },
        { id: 'q2m1_3', text: 'Financial checkup & investment review', completed: false },
      ],
      month2: [
        { id: 'q2m2_1', text: 'Community service / volunteering day', completed: false },
        { id: 'q2m2_2', text: 'Mid-quarter skill enhancement course', completed: false },
        { id: 'q2m2_3', text: 'Deep rest weekend unplugged from devices', completed: false },
      ],
      month3: [
        { id: 'q2m3_1', text: 'Mid-year milestone audit', completed: false },
        { id: 'q2m3_2', text: 'Reflect on habits that stick vs need shift', completed: false },
        { id: 'q2m3_3', text: 'Realign priorities for second half of year', completed: false },
      ],
    },
    3: {
      quarter: 3,
      theme: 'Depth & Mastery',
      month1: [
        { id: 'q3m1_1', text: 'Focus on rest, joy and nature immersion', completed: false },
        { id: 'q3m1_2', text: 'Family summer tradition', completed: false },
        { id: 'q3m1_3', text: 'Re-evaluate personal growth goals', completed: false },
      ],
      month2: [
        { id: 'q3m2_1', text: 'Resume intense deep-work blocks', completed: false },
        { id: 'q3m2_2', text: 'Books 7 & 8', completed: false },
        { id: 'q3m2_3', text: 'Strength & endurance milestone', completed: false },
      ],
      month3: [
        { id: 'q3m3_1', text: 'Review Q3 goals and prepare for year-end push', completed: false },
        { id: 'q3m3_2', text: 'Spiritual retreat or reflective weekend', completed: false },
        { id: 'q3m3_3', text: 'Review annual financial trajectory', completed: false },
      ],
    },
    4: {
      quarter: 4,
      theme: 'Harvest & Celebration',
      month1: [
        { id: 'q4m1_1', text: 'Final sprint on career & business targets', completed: false },
        { id: 'q4m1_2', text: 'Books 9 & 10', completed: false },
        { id: 'q4m1_3', text: 'Host gratitude gathering', completed: false },
      ],
      month2: [
        { id: 'q4m2_1', text: 'Reach annual savings and investment target', completed: false },
        { id: 'q4m2_2', text: 'Books 11 & 12', completed: false },
        { id: 'q4m2_3', text: 'Begin drafting reflections for the year', completed: false },
      ],
      month3: [
        { id: 'q4m3_1', text: 'Comprehensive annual review & celebration', completed: false },
        { id: 'q4m3_2', text: 'Family holiday memories & downtime', completed: false },
        { id: 'q4m3_3', text: 'Draft vision board for next year', completed: false },
      ],
    },
  };

  const monthPlans: Record<number, MonthPlan> = {};
  const monthReviews: Record<number, MonthReview> = {};

  for (let m = 1; m <= 12; m++) {
    monthPlans[m] = {
      monthIndex: m,
      monthName: MONTH_NAMES[m - 1],
      keyGoals: [
        { id: `m${m}_g1`, text: m === 1 ? 'Establish consistent 6:30 AM rising time' : '', completed: false },
        { id: `m${m}_g2`, text: m === 1 ? 'Finish Atomic Habits reading & note key actions' : '', completed: false },
        { id: `m${m}_g3`, text: m === 1 ? 'Cook dinner at home 5 nights a week' : '', completed: false },
        { id: `m${m}_g4`, text: '', completed: false },
        { id: `m${m}_g5`, text: '', completed: false },
      ],
      todos: [
        { id: `m${m}_t1`, text: m === 1 ? 'Order new journal and stationery' : '', completed: true },
        { id: `m${m}_t2`, text: m === 1 ? 'Schedule annual dentist and physical appointments' : '', completed: false },
        { id: `m${m}_t3`, text: m === 1 ? 'Organize home workspace desk' : '', completed: false },
        { id: `m${m}_t4`, text: '', completed: false },
        { id: `m${m}_t5`, text: '', completed: false },
        { id: `m${m}_t6`, text: '', completed: false },
      ],
      notes: m === 1 ? 'Remember: Focus on systems and consistency rather than overnight outcomes.' : '',
    };

    monthReviews[m] = {
      monthIndex: m,
      whatIAchieved: m === 1 ? 'Built solid momentum in the first 2 weeks. Read 1 full book.' : '',
      whatWasLeftUndone: '',
      whatGotInTheWay: '',
      carryForwardItems: [
        { id: `m${m}_cf1`, text: 'Carry forward remaining financial audit tasks', completed: false },
      ],
      reflection: {
        oneWin: m === 1 ? 'Waking up consistently refreshed and present' : '',
        oneLesson: m === 1 ? 'Protect morning hours before checking emails' : '',
        gratefulFor: m === 1 ? 'Good health, supportive family, and quiet morning coffee' : '',
      },
    };
  }

  const weekPlans: Record<string, WeekPlan> = {
    current: {
      id: 'current',
      weekOf: 'January 5 - January 11',
      topPriorities: [
        { id: 'w_p1', text: 'Complete Q1 milestone breakdown', completed: true },
        { id: 'w_p2', text: 'Plan meal prep for the week ahead', completed: false },
        { id: 'w_p3', text: 'Dedicate 1 hour to Sunday planning and reflection', completed: false },
      ],
      days: {
        monday: 'Review weekly agenda • 30 min morning workout',
        tuesday: 'Deep work block on project specs • Read 20 pages',
        wednesday: 'Mid-week check-in • Healthy dinner at home',
        thursday: 'Team sync • Evening walk in the fresh air',
        friday: 'Weekly wrap up • Clear inbox to zero',
        saturday: 'Family outing & farmers market',
        sunday: 'Quiet morning • Weekly reflection & meal plan',
      },
      carryForward: 'Call electrician for lighting checkup • Buy birthday gift',
    },
  };

  return {
    year,
    goals,
    quarterPlans,
    monthPlans,
    weekPlans,
    monthReviews,
  };
}

export async function loadJournalState(): Promise<JournalState> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      // Ensure any newly added fields exist
      const initial = createInitialJournalState(parsed.year || new Date().getFullYear());
      return {
        ...initial,
        ...parsed,
        goals: { ...initial.goals, ...parsed.goals },
        quarterPlans: { ...initial.quarterPlans, ...parsed.quarterPlans },
        monthPlans: { ...initial.monthPlans, ...parsed.monthPlans },
        weekPlans: { ...initial.weekPlans, ...parsed.weekPlans },
        monthReviews: { ...initial.monthReviews, ...parsed.monthReviews },
      };
    }
  } catch (err) {
    console.warn('Failed to load journal state from storage:', err);
  }
  const defaultState = createInitialJournalState();
  await saveJournalState(defaultState);
  return defaultState;
}

export async function saveJournalState(state: JournalState): Promise<void> {
  try {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (err) {
    console.error('Failed to save journal state:', err);
  }
}

export async function resetJournalState(): Promise<JournalState> {
  const fresh = createInitialJournalState();
  await saveJournalState(fresh);
  return fresh;
}
